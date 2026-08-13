"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Tag, ShoppingBag } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";

export interface FeaturedGridBannerData {
  enabled: boolean;
  productId?: string;
  title?: string;
  tagline?: string;
  badgeText?: string;
  customImage?: string;
  customPrice?: number;
  customOldPrice?: number;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: "luxury_black" | "deep_gradient" | "gold_accent" | "clean_white";
}

const DEFAULT_BANNER: FeaturedGridBannerData = {
  enabled: true,
  title: "iPhone 16 Pro Max",
  tagline: "Titanium design. A18 Pro chip. Unmatched camera capabilities.",
  badgeText: "HOT DEAL",
  customImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
  customPrice: 389000,
  customOldPrice: 425000,
  buttonText: "Shop Offer Now",
  buttonUrl: "/products",
  backgroundColor: "luxury_black",
};

export default function NewArrivalsGridBanner() {
  const [banner, setBanner] = useState<FeaturedGridBannerData | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      const bannerRef = doc(db, "settings", "featured_grid_banner");
      unsubscribe = onSnapshot(
        bannerRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as FeaturedGridBannerData;
            setBanner(data);
          } else {
            setBanner(DEFAULT_BANNER);
          }
        },
        (err) => {
          console.warn("FeaturedGridBanner Firestore read error:", err);
          setBanner(DEFAULT_BANNER);
        }
      );
    } catch (e) {
      console.warn("FeaturedGridBanner setup error:", e);
      setBanner(DEFAULT_BANNER);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!banner || banner.enabled === false) {
    return null;
  }

  const hasDiscount =
    banner.customOldPrice &&
    banner.customPrice &&
    banner.customOldPrice > banner.customPrice;

  const discountPercent = hasDiscount
    ? Math.round(((banner.customOldPrice! - banner.customPrice!) / banner.customOldPrice!) * 100)
    : 0;

  const bgStyles = {
    luxury_black: "bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-white/15 text-white",
    deep_gradient: "bg-gradient-to-br from-neutral-900 via-slate-900 to-black border border-white/15 text-white",
    gold_accent: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/60 border border-amber-500/30 text-white",
    clean_white: "bg-white border border-neutral-200 text-black shadow-md",
  };

  const isLight = banner.backgroundColor === "clean_white";

  return (
    <div
      className={`col-span-1 md:col-span-2 rounded-2xl overflow-hidden relative p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-2xl transition-all duration-500 ${
        bgStyles[banner.backgroundColor || "luxury_black"]
      }`}
    >
      {/* Background Ambient Glow */}
      {!isLight && (
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
      )}

      {/* Left Column: Content */}
      <div className="flex-1 min-w-0 z-10 flex flex-col justify-between h-full">
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse ${
                isLight
                  ? "bg-black text-white"
                  : "bg-amber-400 text-black"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {banner.badgeText || "FEATURED OFFER"}
            </span>

            {hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug line-clamp-2 mb-1.5 ${isLight ? "text-black" : "text-white"}`}>
            {banner.title || "Featured Product"}
          </h3>

          {/* Tagline */}
          {banner.tagline && (
            <p className={`text-xs sm:text-sm line-clamp-2 mb-4 ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
              {banner.tagline}
            </p>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2">
          {banner.customPrice ? (
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-lg sm:text-xl font-black ${isLight ? "text-black" : "text-amber-400"}`}>
                {formatPrice(banner.customPrice)}
              </span>
              {banner.customOldPrice && banner.customOldPrice > banner.customPrice && (
                <span className={`text-xs line-through ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
                  {formatPrice(banner.customOldPrice)}
                </span>
              )}
            </div>
          ) : null}

          <Link
            href={banner.buttonUrl || "/products"}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md group-hover:scale-105 active:scale-95 ${
              isLight
                ? "bg-black text-white hover:bg-neutral-800"
                : "bg-white text-black hover:bg-amber-400 hover:text-black"
            }`}
          >
            <span>{banner.buttonText || "Shop Now"}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Right Column: Product Image */}
      <div className="w-full sm:w-48 md:w-56 aspect-square shrink-0 z-10 flex items-center justify-center relative p-2">
        {banner.customImage ? (
          <img
            src={banner.customImage}
            alt={banner.title || "Featured Offer"}
            className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-phone.webp";
            }}
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-white/10 flex items-center justify-center text-white/30">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
      </div>
    </div>
  );
}
