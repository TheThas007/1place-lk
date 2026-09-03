"use client";

import { useState, useEffect } from "react";
import { getOfferBanners } from "@/lib/firestore-client";
import { OfferBanner } from "@/lib/types";
import ShopBannerSlider from "@/components/products/ShopBannerSlider";

export default function ShopBannerLive() {
  const [banners, setBanners] = useState<OfferBanner[] | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    getOfferBanners("shop_top")
      .then((active) => {
        if (!isSubscribed) return;
        setBanners(active || []);
      })
      .catch((err) => {
        console.warn("ShopBannerLive: Error loading banners, using slider defaults", err);
        if (isSubscribed) setBanners([]);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // While loading, show nothing (avoids flash of default → real banner)
  if (banners === null) return null;

  return <ShopBannerSlider banners={banners} />;
}
