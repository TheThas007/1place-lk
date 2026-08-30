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

  // 1. Resolve Desktop Banner
  const rawDesktop = config.desktop?.imageUrl || config.desktopBannerUrl || "";
  const resolvedDesktopBanner = rawDesktop.trim() ? rawDesktop.trim() : fallbackCampaignBanner;

  // 2. Resolve Tablet Banner (Check toggle useDesktopForTablet)
  const rawTablet = config.tablet?.imageUrl || config.tabletBannerUrl || "";
  const resolvedTabletBanner =
    config.useDesktopForTablet !== false && !rawTablet.trim()
      ? resolvedDesktopBanner
      : rawTablet.trim() || resolvedDesktopBanner;

  // 3. Resolve Mobile Banner (Check toggles useDesktopForMobile / useTabletForMobile)
  const rawMobile = config.mobile?.imageUrl || config.mobileBannerUrl || "";
  let resolvedMobileBanner = rawMobile.trim();
  if (!resolvedMobileBanner) {
    if (config.useTabletForMobile && resolvedTabletBanner) {
      resolvedMobileBanner = resolvedTabletBanner;
    } else {
      resolvedMobileBanner = resolvedDesktopBanner;
    }
  }

  // If no banner is available or image failed, hide banner section with 0 empty space
  if (!resolvedDesktopBanner || imgError) {
    return null;
  }

  const isDecorative = Boolean(config.decorative);
  const altText = isDecorative
    ? ""
    : config.bannerAlt ||
    `${brand.name} ${department.name} Official Promotional Banner`;

  const desktopFocal = config.desktop?.focalPosition || config.desktopFocalPosition || "center";
  const tabletFocal = config.tablet?.focalPosition || config.tabletFocalPosition || desktopFocal;
  const mobileFocal = config.mobile?.focalPosition || config.mobileFocalPosition || "center";

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

  const ariaLabel =
    config.linkAriaLabel ||
    `Shop ${brand.name} ${department.name} collection`;

  const ratio = config.bannerSizeRatio || (config as any).banner_size_ratio || "860x270";
  const frameBg = config.bannerBackgroundColor || "#F4F5F7";

  const bannerContent = (
    <div
      className="relative w-full overflow-hidden select-none rounded-2xl sm:rounded-3xl border border-neutral-200/70 shadow-2xs flex items-center justify-center p-3 sm:p-5 md:p-6 transition-all"
      style={{
        backgroundColor: frameBg,
      }}
    >
      {/* Subtle ambient backdrop mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 80%)`,
        }}
      />

      {/* ── Overlay Centered Banner Artwork (860×270 Standard Crisp Size) ── */}
      <div
        style={{
          aspectRatio:
            ratio === "1080x1080"
              ? "1 / 1"
              : ratio === "1920x850"
              ? "1920 / 850"
              : ratio === "1080x1440"
              ? "1080 / 1440"
              : ratio === "default"
              ? "1920 / 600"
              : "860 / 270",
        }}
        className={`relative w-full z-10 overflow-hidden rounded-xl sm:rounded-2xl transition-all ${
          ratio === "1080x1080"
            ? "max-w-[320px] aspect-square mx-auto"
            : ratio === "1920x850"
            ? "max-w-[1100px] aspect-[1920/850] max-h-[320px] mx-auto"
            : ratio === "1080x1440"
            ? "max-w-[360px] aspect-[1080/1440] mx-auto"
            : ratio === "default"
            ? "max-w-[1200px] aspect-[1920/600] max-h-[300px] mx-auto"
            : "max-w-[860px] aspect-[860/270] max-h-[270px] mx-auto shadow-2xs"
        }`}
      >
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
            aria-hidden={isDecorative ? "true" : undefined}
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
            style={{
              objectPosition: desktopFocal,
            }}
            className="w-full h-full object-contain sm:object-cover block transition-transform duration-700 ease-out"
          />
        </picture>
      </div>
    </div>
  );

  return (
    <section aria-label={`${brand.name} ${department.name} Banner`} className="relative w-full overflow-hidden p-0 m-0 border-none rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
      {destinationUrl ? (
        isExternalLink ? (
          <a
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            rel={config.openInNewTab ? "noopener noreferrer" : undefined}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-2xl sm:rounded-3xl overflow-hidden group w-full"
          >
            {bannerContent}
          </a>
        ) : (
          <Link
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-2xl sm:rounded-3xl overflow-hidden group w-full"
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
