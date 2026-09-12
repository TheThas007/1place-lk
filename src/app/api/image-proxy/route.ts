import { NextRequest } from "next/server";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import dns from "dns";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  timestamp: number;
}

const imageCache = new Map<string, CachedImage>();
const notFoundCache = new Map<string, number>();
const inFlightRequests = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();

const MAX_CACHE_ENTRIES = 1200;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const NOT_FOUND_TTL_MS = 15 * 1000; // 15 seconds temporary cache for 404s
const UPSTREAM_TIMEOUT_MS = 12000; // 12 seconds timeout

// Pre-load clean neutral device placeholder image into memory
let placeholderBuffer: Buffer;
try {
  const pPath = path.join(process.cwd(), "public", "placeholder-phone.webp");
  placeholderBuffer = fs.readFileSync(pPath);
} catch {
  // 1x1 transparent WebP fallback if file read fails
  placeholderBuffer = Buffer.from(
    "UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAA/v39/f39/f39/f39/f39/f39/f39/f39/f39/f4A",
    "base64"
  );
}

function servePlaceholder(): Response {
  return new Response(new Uint8Array(placeholderBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      // Never store fallback aggressively in browser so legitimate images can recover
      "Cache-Control": "public, max-age=5, stale-while-revalidate=10",
      "Access-Control-Allow-Origin": "*",
      "X-Proxy-Status": "FALLBACK",
    },
  });
}

// Known working IPs for postimg CDN to bypass local ISP DNS blocks & connection throttling
const POSTIMG_IPS = ["195.154.239.27", "195.154.239.26", "195.154.239.25"];
let ipIndex = 0;

// High-capacity HTTPS agent with round-robin IP pooling
const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 64,
  maxFreeSockets: 16,
  timeout: UPSTREAM_TIMEOUT_MS,
  lookup: (hostname, options, callback) => {
    let cb = callback;
    let opt = options;
    if (typeof options === "function") {
      cb = options;
      opt = {};
    }
    if (hostname === "i.postimg.cc" || hostname === "postimg.cc" || hostname === "postimages.org") {
      const selectedIp = POSTIMG_IPS[(ipIndex++) % POSTIMG_IPS.length];
      if (opt && opt.all) {
        return cb(null, [{ address: selectedIp, family: 4 }]);
      }
      return cb(null, selectedIp, 4);
    }
    return dns.lookup(hostname, opt, cb);
  },
});

async function fetchFromUpstream(targetUrl: string, hop = 0): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (hop > 2) return null;

  const parsed = new URL(targetUrl);
  const isHttps = parsed.protocol === "https:";
  const client = isHttps ? https : http;

  return new Promise<{ buffer: Buffer; contentType: string } | null>((resolve) => {
    let settled = false;

    const req = client.get(
      targetUrl,
      {
        agent: isHttps ? insecureHttpsAgent : undefined,
        timeout: UPSTREAM_TIMEOUT_MS,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          Referer: `${parsed.protocol}//${parsed.hostname}/`,
        },
      },
      (res) => {
        // Follow 301, 302, 307, 308 redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, targetUrl).toString();
          fetchFromUpstream(redirectUrl, hop + 1).then(resolve);
          return;
        }

        if (!res.statusCode || res.statusCode >= 400) {
          if (res.statusCode === 404) {
            notFoundCache.set(targetUrl, Date.now());
          }
          resolve(null);
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          if (settled) return;
          settled = true;
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers["content-type"] || "image/png";
          resolve({ buffer, contentType });
        });
      }
    );

    req.on("error", () => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    });

    req.on("timeout", () => {
      if (!settled) {
        settled = true;
        try {
          req.destroy();
        } catch {
          // ignore
        }
        resolve(null);
      }
    });
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return servePlaceholder();
  }

  try {
    const cleanUrl = targetUrl.trim();
    const parsed = new URL(cleanUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return servePlaceholder();
    }

    // 1. Check positive in-memory cache
    const cached = imageCache.get(cleanUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
          "X-Proxy-Cache": "HIT",
        },
      });
    }

    // 2. Check temporary negative cache for known 404s
    const notFoundAt = notFoundCache.get(cleanUrl);
    if (notFoundAt && Date.now() - notFoundAt < NOT_FOUND_TTL_MS) {
      return servePlaceholder();
    }

    // 3. In-flight request deduplication to prevent slamming upstream with identical concurrent requests
    let pending = inFlightRequests.get(cleanUrl);
    if (!pending) {
      pending = fetchFromUpstream(cleanUrl).finally(() => {
        inFlightRequests.delete(cleanUrl);
      });
      inFlightRequests.set(cleanUrl, pending);
    }

    const result = await pending;

    if (!result || !result.buffer || result.buffer.length === 0) {
      return servePlaceholder();
    }

    // Save to LRU positive cache
    if (imageCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) imageCache.delete(firstKey);
    }
    imageCache.set(cleanUrl, {
      buffer: result.buffer,
      contentType: result.contentType,
      timestamp: Date.now(),
    });

    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Proxy-Cache": "MISS",
      },
    });
  } catch {
    return servePlaceholder();
  }
}
