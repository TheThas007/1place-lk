"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BrowseHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // We only record catalog / browse / listing / department / home pages
    // Do NOT record product detail pages (/products/[slug]) as the return destination
    const isProductDetailPage =
      pathname.startsWith("/products/") && pathname !== "/products";

    if (!isProductDetailPage && !pathname.startsWith("/admin") && !pathname.startsWith("/login")) {
      const fullUrl = pathname + (window.location.search || "");
      sessionStorage.setItem("last_browse_page", fullUrl);
    }
  }, [pathname]);

  return null;
}
