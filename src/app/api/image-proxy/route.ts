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
const failedUrls = new Map<string, number>();

const MAX_CACHE_ENTRIES = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FAILED_CACHE_TTL_MS = 90 * 1000; // 90 seconds negative cache
const UPSTREAM_TIMEOUT_MS = 4500; // 4.5 seconds timeout

// Pre-load default placeholder image once into memory
let placeholderBuffer: Buffer;
try {
  const pPath = path.join(process.cwd(), "public", "placeholder-phone.webp");
  placeholderBuffer = fs.readFileSync(pPath);
} catch {
  // 1x1 transparent WebP fallback
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
      "Cache-Control": "public, max-age=180, stale-while-revalidate=360",
      "Access-Control-Allow-Origin": "*",
      "X-Proxy-Status": "FALLBACK",
    },
  });
}

// HTTPS agent that ignores expired certs and pins i.postimg.cc to the working IP 195.154.239.27
const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  lookup: (hostname, options, callback) => {
    let cb = callback;
    let opt = options;
    if (typeof options === "function") {
      cb = options;
      opt = {};
    }
    if (hostname === "i.postimg.cc") {
      if (opt && opt.all) {
        return cb(null, [{ address: "195.154.239.27", family: 4 }]);
      }
      return cb(null, "195.154.239.27", 4);
    }
    return dns.lookup(hostname, opt, cb);
  },
});

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

    // 2. Check negative cache for recently failed URLs (prevents socket hangs)
    const failedAt = failedUrls.get(cleanUrl);
    if (failedAt && Date.now() - failedAt < FAILED_CACHE_TTL_MS) {
      return servePlaceholder();
    }

    const isHttps = parsed.protocol === "https:";
    const client = isHttps ? https : http;

    return await new Promise<Response>((resolve) => {
      let resolved = false;

      const finishWithFallback = () => {
        if (resolved) return;
        resolved = true;
        failedUrls.set(cleanUrl, Date.now());
        resolve(servePlaceholder());
      };

      const fetchRequest = client.get(
        cleanUrl,
        {
          agent: isHttps ? insecureHttpsAgent : undefined,
          timeout: UPSTREAM_TIMEOUT_MS,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        },
        (res) => {
          // Follow 301/302/307 redirects internally up to 1 hop
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, cleanUrl).toString();
            const redirClient = redirectUrl.startsWith("https:") ? https : http;
            redirClient
              .get(
                redirectUrl,
                {
                  agent: redirectUrl.startsWith("https:") ? insecureHttpsAgent : undefined,
                  timeout: UPSTREAM_TIMEOUT_MS,
                },
                (r2) => {
                  if (!r2.statusCode || r2.statusCode >= 400) {
                    return finishWithFallback();
                  }
                  const chunks2: Buffer[] = [];
                  r2.on("data", (c: Buffer) => chunks2.push(c));
                  r2.on("end", () => {
                    if (resolved) return;
                    resolved = true;
                    const buffer = Buffer.concat(chunks2);
                    const contentType = r2.headers["content-type"] || "image/png";

                    if (imageCache.size >= MAX_CACHE_ENTRIES) {
                      const firstKey = imageCache.keys().next().value;
                      if (firstKey) imageCache.delete(firstKey);
                    }
                    imageCache.set(cleanUrl, { buffer, contentType, timestamp: Date.now() });

                    resolve(
                      new Response(new Uint8Array(buffer), {
                        status: 200,
                        headers: {
                          "Content-Type": contentType,
                          "Cache-Control": "public, max-age=31536000, immutable",
                          "Access-Control-Allow-Origin": "*",
                          "X-Proxy-Cache": "MISS",
                        },
                      })
                    );
                  });
                }
              )
              .on("error", finishWithFallback)
              .on("timeout", () => finishWithFallback());
            return;
          }

          if (!res.statusCode || res.statusCode >= 400) {
            return finishWithFallback();
          }

          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            if (resolved) return;
            resolved = true;
            const buffer = Buffer.concat(chunks);
            const contentType = res.headers["content-type"] || "image/png";

            if (imageCache.size >= MAX_CACHE_ENTRIES) {
              const firstKey = imageCache.keys().next().value;
              if (firstKey) imageCache.delete(firstKey);
            }
            imageCache.set(cleanUrl, { buffer, contentType, timestamp: Date.now() });

            resolve(
              new Response(new Uint8Array(buffer), {
                status: 200,
                headers: {
                  "Content-Type": contentType,
                  "Cache-Control": "public, max-age=31536000, immutable",
                  "Access-Control-Allow-Origin": "*",
                  "X-Proxy-Cache": "MISS",
                },
              })
            );
          });
        }
      );

      fetchRequest.on("error", () => {
        finishWithFallback();
      });

      fetchRequest.on("timeout", () => {
        try {
          fetchRequest.destroy();
        } catch {
          // ignore
        }
        finishWithFallback();
      });
    });
  } catch {
    return servePlaceholder();
  }
}
