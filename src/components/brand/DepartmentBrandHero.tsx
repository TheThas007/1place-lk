"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DepartmentBrandPageConfig, Brand, Department } from "@/lib/types";

interface DepartmentBrandHeroProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
}

// Curated high-resolution studio campaign banner artwork (16:5 aspect ratio)
const BRAND_DEFAULT_CAMPAIGN_BANNERS: Record<string, Record<string, string>> = {
  apple: {
    phones: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1600&auto=format&fit=crop",
    "laptops-tablets": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1600&auto=format&fit=crop",
  },
  samsung: {
    phones: "https://images.unsplash.com/photo-1610945265064-3234eb261763?q=80&w=1600&auto=format&fit=crop",
    "laptops-tablets": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1600&auto=format&fit=crop",
  },
  xiaomi: {
    phones: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1600&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1600&auto=format&fit=crop",
  },
  ugreen: {
    accessories: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1600&auto=format&fit=crop",
  },
  anker: {
    accessories: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1600&auto=format&fit=crop",
  },
  jbl: {
    accessories: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1600&auto=format&fit=crop",
  },
};

export default function DepartmentBrandHero({
  config,
  brand,
  department,
}: DepartmentBrandHeroProps) {
  const [imgError, setImgError] = useState(false);

  // If banner is explicitly disabled in admin, hide completely
  if (config.bannerEnabled === false) {
    return null;
  }

  const brandSlug = (brand.slug || "").toLowerCase();
  const deptSlug = (department.slug || "").toLowerCase();

  // Fallback priority:
  // 1. Department-specific banner
  // 2. Default brand banner (if useDefaultBrandBanner enabled)
  // 3. Realistic default campaign banner
  const fallbackCampaignBanner =
    BRAND_DEFAULT_CAMPAIGN_BANNERS[brandSlug]?.[deptSlug] || "";

  const resolvedDesktopBanner =
    config.desktopBannerUrl && config.desktopBannerUrl.trim()
      ? config.desktopBannerUrl
      : fallbackCampaignBanner;

  const resolvedTabletBanner =
    config.tabletBannerUrl && config.tabletBannerUrl.trim()
      ? config.tabletBannerUrl
      : resolvedDesktopBanner;

  const resolvedMobileBanner =
    config.mobileBannerUrl && config.mobileBannerUrl.trim()
      ? config.mobileBannerUrl
      : resolvedTabletBanner;

  // If no banner is available or image failed, hide banner section with 0 empty space
  if (!resolvedDesktopBanner || imgError) {
    return null;
  }

  const altText =
    config.bannerAlt ||
    `${brand.name} ${department.name} Official Promotional Banner`;

  const desktopFocal = config.desktopFocalPosition || "center";
  const tabletFocal = config.tabletFocalPosition || desktopFocal;
  const mobileFocal = config.mobileFocalPosition || "center";

  // Optional Link Destination
  let destinationUrl = "";
  if (config.linkEnabled) {
    if (config.destinationType === "custom" && config.destinationUrl) {
      destinationUrl = config.destinationUrl;
    } else if (config.destinationType === "category" && config.destinationId) {
      destinationUrl = `/shop-by-brand/${department.slug}/${brand.slug}?category=${config.destinationId}`;
    } else if (config.destinationType === "product" && config.destinationId) {
      destinationUrl = `/products/${config.destinationId}`;
    } else if (config.destinationUrl) {
      destinationUrl = config.destinationUrl;
    }
  }

  const isExternalLink =
    destinationUrl.startsWith("http://") || destinationUrl.startsWith("https://");

  const bannerContent = (
    <div className="relative w-full aspect-[16/5] md:aspect-[16/5] max-md:aspect-[16/6] max-sm:aspect-[4/3] overflow-hidden rounded-lg select-none bg-neutral-100">
      <picture className="w-full h-full block">
        {resolvedMobileBanner && (
          <source
            media="(max-width: 767px)"
            srcSet={resolvedMobileBanner}
          />
        )}
        {resolvedTabletBanner && (
          <source
            media="(max-width: 1023px)"
            srcSet={resolvedTabletBanner}
          />
        )}
        <img
          src={resolvedDesktopBanner}
          alt={altText}
          loading="eager"
          decoding="async"
          onError={() => setImgError(true)}
          style={{
            objectPosition: desktopFocal,
          }}
          className="w-full h-full object-cover block transition-transform duration-700 ease-out"
        />
      </picture>
    </div>
  );

  return (
    <section aria-label={`${brand.name} ${department.name} Banner`} className="relative w-full mb-8">
      {destinationUrl ? (
        isExternalLink ? (
          <a
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            rel={config.openInNewTab ? "noopener noreferrer" : undefined}
            className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg overflow-hidden group"
          >
            {bannerContent}
          </a>
        ) : (
          <Link
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg overflow-hidden group"
          >
            {bannerContent}
          </Link>
        )
      ) : (
        bannerContent
      )}
    </section>
  );
}
