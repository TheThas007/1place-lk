"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function BrowseHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // We only record catalog / browse / listing / department / home pages
    // Do NOT record product detail pages (/products/[slug]) as the return destination
    const isProductDetailPage =
      pathname.startsWith("/products/") && pathname !== "/products";

    if (!isProductDetailPage && !pathname.startsWith("/admin") && !pathname.startsWith("/login")) {
      const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      sessionStorage.setItem("last_browse_page", fullUrl);
    }
  }, [pathname, searchParams]);

  return null;
}
