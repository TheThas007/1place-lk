import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only run this on the root path "/" due to the config matcher,
  // but this check is a safe safeguard.
  if (pathname !== "/") {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") || "";

  // 1. Exclude search engine bots to preserve SEO
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);
  if (isBot) {
    return NextResponse.next();
  }

  // 2. Check cookie preference (if they manually chose Home)
  const homePref = request.cookies.get("sm_home_pref")?.value;
  if (homePref === "true") {
    return NextResponse.next();
  }

  // 3. Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  if (isMobile) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only target the root path to prevent unnecessary execution on static files, APIs, and product details
    "/",
  ],
};
