import { NextRequest, NextResponse } from "next/server";
import https from "https";
import http from "http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  timestamp: number;
}

const imageCache = new Map<string, CachedImage>();
const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/placeholder-phone.webp", req.url));
  }

  try {
    const cleanUrl = targetUrl.trim();
    const parsed = new URL(cleanUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.redirect(new URL("/placeholder-phone.webp", req.url));
    }

    // Return from in-memory cache if available
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

    const isHttps = parsed.protocol === "https:";
    const client = isHttps ? https : http;

    return await new Promise<Response>((resolve) => {
      const fetchRequest = client.get(
        cleanUrl,
        {
          agent: isHttps ? insecureHttpsAgent : undefined,
          timeout: 12000,
        },
        (res) => {
          // Handle HTTP redirects (301, 302, 307, 308)
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, cleanUrl).toString();
            resolve(
              NextResponse.redirect(
                new URL(`/api/image-proxy?url=${encodeURIComponent(redirectUrl)}`, req.url)
              )
            );
            return;
          }

          if (!res.statusCode || res.statusCode >= 400) {
            resolve(NextResponse.redirect(new URL("/placeholder-phone.webp", req.url)));
            return;
          }

          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const contentType = res.headers["content-type"] || "image/png";

            // Save to LRU cache
            if (imageCache.size >= MAX_CACHE_ENTRIES) {
              const firstKey = imageCache.keys().next().value;
              if (firstKey) imageCache.delete(firstKey);
            }
            imageCache.set(cleanUrl, {
              buffer,
              contentType,
              timestamp: Date.now(),
            });

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

      fetchRequest.on("error", (err) => {
        console.error("image-proxy upstream error:", err.message);
        resolve(NextResponse.redirect(new URL("/placeholder-phone.webp", req.url)));
      });

      fetchRequest.on("timeout", () => {
        fetchRequest.destroy();
        resolve(NextResponse.redirect(new URL("/placeholder-phone.webp", req.url)));
      });
    });
  } catch (err: any) {
    console.error("image-proxy error:", err.message);
    return NextResponse.redirect(new URL("/placeholder-phone.webp", req.url));
  }
}
