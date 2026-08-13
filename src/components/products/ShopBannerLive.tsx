"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { OfferBanner } from "@/lib/types";
import ShopBannerSlider from "@/components/products/ShopBannerSlider";

/**
 * ShopBannerLive
 * Replaces the static prop-based ShopBannerSlider for the /products page.
 * Uses a real-time Firestore onSnapshot listener so that changes made in
 * the admin panel (add / edit / delete) are immediately reflected on the
 * shop page without requiring a page reload or server revalidation.
 *
 * Fallback: if Firestore is unreachable, the ShopBannerSlider falls back
 * to its own built-in DEFAULT_SHOP_BANNERS — no extra fallback needed here.
 */
export default function ShopBannerLive() {
  const [banners, setBanners] = useState<OfferBanner[] | null>(null); // null = loading

  useEffect(() => {
    let isSubscribed = true;

    const q = query(collection(db, "offer_banners"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isSubscribed) return;

        const active = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              status: data.status ?? "active",
              placement: data.placement ?? "shop_top",
            } as OfferBanner;
          })
          .filter(
            (b) =>
              b.placement === "shop_top" &&
              (b.status === "active" || !b.status)
          )
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        // If Firestore responds with 0 active shop banners → empty array,
        // ShopBannerSlider will show its built-in defaults.
        setBanners(active);
      },
      (err) => {
        console.warn("ShopBannerLive: Firestore error, using slider defaults", err);
        // Set empty array so ShopBannerSlider shows DEFAULT_SHOP_BANNERS
        if (isSubscribed) setBanners([]);
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // While loading, show nothing (avoids flash of default → real banner)
  if (banners === null) return null;

  return <ShopBannerSlider banners={banners} />;
}
