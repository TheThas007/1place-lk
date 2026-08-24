"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NewArrivalsPromotionalBannerData {
  enabled: boolean;
  title?: string;
  desktop_banner_url?: string;
  mobile_banner_url?: string;
  destination_type?: "product" | "category" | "external" | "none";
  destination_id?: string;
  destination_url?: string;
  start_date?: string;
  expiry_date?: string;

  // Legacy fields fallback
  customImage?: string;
  buttonUrl?: string;
}

function validateUrl(url?: string): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url.trim();
    }
  } catch {}
  return null;
}

export default function NewArrivalsGridBanner() {
  const [banner, setBanner] = useState<NewArrivalsPromotionalBannerData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      const bannerRef = doc(db, "settings", "featured_grid_banner");
      unsubscribe = onSnapshot(
        bannerRef,
        (snap) => {
          setLoaded(true);
          if (snap.exists()) {
            const data = snap.data() as NewArrivalsPromotionalBannerData;
            setBanner(data);
          } else {
            setBanner({ enabled: false });
          }
        },
        (err) => {
          console.warn("NewArrivalsGridBanner Firestore read error:", err);
          setLoaded(true);
          setBanner({ enabled: false });
        }
      );
    } catch (e) {
      console.warn("NewArrivalsGridBanner setup error:", e);
      setLoaded(true);
      setBanner({ enabled: false });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!loaded) {
    // Skeleton state to prevent cumulative layout shift (CLS)
    return (
      <div className="col-span-1 md:col-span-2 rounded-2xl bg-neutral-200 animate-pulse aspect-[16/9] md:aspect-auto h-full min-h-[190px] md:min-h-[220px]" />
    );
  }

  if (!banner || banner.enabled === false) {
    return null;
  }

  // Date schedule checking
  const todayStr = new Date().toISOString().slice(0, 10);
  if (banner.start_date && todayStr < banner.start_date) {
    return null;
  }
  if (banner.expiry_date && todayStr > banner.expiry_date) {
    return null;
  }

  const desktopImage = banner.desktop_banner_url || banner.customImage || "";
  const mobileImage = banner.mobile_banner_url || desktopImage;

  if (!desktopImage && !mobileImage) {
    return null;
  }

  const titleText = banner.title || "New Arrivals Special Offer Banner";
  const rawDestUrl = banner.destination_url || banner.buttonUrl || "";
  const isExternal = banner.destination_type === "external" || (rawDestUrl.startsWith("http://") || rawDestUrl.startsWith("https://"));

  const validExternalUrl = isExternal ? validateUrl(rawDestUrl) : null;

  const BannerContent = () => (
    <div className="relative w-full aspect-[16/9] md:aspect-auto h-full min-h-[190px] md:min-h-full rounded-2xl overflow-hidden bg-neutral-900 group shadow-xs hover:shadow-xl transition-all duration-500">
      <picture className="w-full h-full block">
        {/* Mobile Banner Image for screens under md (768px) */}
        {mobileImage && (
          <source media="(max-width: 767px)" srcSet={mobileImage} />
        )}
        {/* Desktop Banner Image */}
        <img
          src={desktopImage || mobileImage}
          alt={titleText}
          loading="lazy"
          className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </picture>
    </div>
  );

  // Render clickable wrapper based on destination_type
  if (banner.destination_type === "none" || (!rawDestUrl && !validExternalUrl)) {
    return (
      <div className="col-span-1 md:col-span-2 h-full">
        <BannerContent />
      </div>
    );
  }

  if (isExternal && validExternalUrl) {
    return (
      <a
        href={validExternalUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={titleText}
        className="col-span-1 md:col-span-2 h-full block cursor-pointer"
      >
        <BannerContent />
      </a>
    );
  }

  // Internal route (Product or Category page)
  return (
    <Link
      href={rawDestUrl || "/products"}
      aria-label={titleText}
      className="col-span-1 md:col-span-2 h-full block cursor-pointer"
    >
      <BannerContent />
    </Link>
  );
}
