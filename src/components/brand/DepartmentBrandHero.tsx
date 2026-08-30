"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DepartmentBrandPageConfig, Brand, Department } from "@/lib/types";

interface DepartmentBrandHeroProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(196, 226, 245, ${alpha})`;
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }
  if (c.length !== 6) return `rgba(196, 226, 245, ${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const isBlurEnabled = config.bannerBlurEnabled !== false;
  const isGlowEnabled = config.bannerGlowEnabled !== false;
  const glowColor = config.bannerGlowColor || "#C4E2F5";
  const blurStrength =
    config.bannerBlurStrength === "ultra"
      ? "70px"
      : config.bannerBlurStrength === "high"
      ? "45px"
      : config.bannerBlurStrength === "low"
      ? "16px"
      : config.bannerBlurStrength === "none"
      ? "0px"
      : "30px";

  const blendMode =
    config.bannerBlendMode ||
    (frameBg.toLowerCase() === "#ffffff" || frameBg.toLowerCase() === "#fff"
      ? "normal"
      : "multiply");

  const bannerContent = (
    <div
      className="relative w-full overflow-hidden select-none rounded-none flex items-center justify-center p-0 m-0 transition-all"
      style={{
        backgroundColor: frameBg,
        borderRadius: 0,
        borderColor: hexToRgba(glowColor, 0.65),
        borderWidth: "1.5px",
        borderStyle: "solid",
        boxShadow: `0 0 25px ${hexToRgba(glowColor, 0.45)}, 0 0 60px ${hexToRgba(glowColor, 0.25)}, inset 0 0 30px ${hexToRgba(glowColor, 0.2)}`,
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
        maxHeight:
          ratio === "1080x1080"
            ? "320px"
            : ratio === "1080x1440"
            ? "360px"
            : ratio === "1920x850"
            ? "320px"
            : ratio === "default"
            ? "300px"
            : "270px",
      }}
    >
      {/* ── FULL PERIMETER EDGE GLOW BEAMS (All 4 Edges Glowing) ── */}
      {isGlowEnabled && (
        <>
          {/* Top Edge Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-[2.5px] z-20 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(glowColor, 0.4)} 15%, ${hexToRgba(glowColor, 0.95)} 50%, ${hexToRgba(glowColor, 0.4)} 85%, transparent 100%)`,
              boxShadow: `0 0 16px 2px ${hexToRgba(glowColor, 0.9)}`,
            }}
          />
          {/* Bottom Edge Glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2.5px] z-20 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(glowColor, 0.4)} 15%, ${hexToRgba(glowColor, 0.95)} 50%, ${hexToRgba(glowColor, 0.4)} 85%, transparent 100%)`,
              boxShadow: `0 0 16px 2px ${hexToRgba(glowColor, 0.9)}`,
            }}
          />
          {/* Left Edge Glow */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[2.5px] z-20 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(glowColor, 0.4)} 15%, ${hexToRgba(glowColor, 0.95)} 50%, ${hexToRgba(glowColor, 0.4)} 85%, transparent 100%)`,
              boxShadow: `0 0 16px 2px ${hexToRgba(glowColor, 0.9)}`,
            }}
          />
          {/* Right Edge Glow */}
          <div
            className="absolute top-0 bottom-0 right-0 w-[2.5px] z-20 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(glowColor, 0.4)} 15%, ${hexToRgba(glowColor, 0.95)} 50%, ${hexToRgba(glowColor, 0.4)} 85%, transparent 100%)`,
              boxShadow: `0 0 16px 2px ${hexToRgba(glowColor, 0.9)}`,
            }}
          />
        </>
      )}

      {/* ── 1. Ambient Blurred Backdrop Image (Fills Side Whitespace Dynamically) ── */}
      {isBlurEnabled && resolvedDesktopBanner && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-0">
          <img
            src={resolvedDesktopBanner}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-135 opacity-40 transform-gpu"
            style={{
              filter: `blur(${blurStrength}) saturate(1.4)`,
              borderRadius: 0,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: frameBg,
              opacity: 0.65,
              borderRadius: 0,
            }}
          />
        </div>
      )}

      {/* Subtle ambient backdrop mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 -z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 85%)`,
          borderRadius: 0,
        }}
      />

      {/* ── 2. Overlay Image Background Radiant Glow Effect ── */}
      {isGlowEnabled && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0 overflow-hidden">
          {/* Outer expansive luminous pulse aura */}
          <div
            className="w-full h-full rounded-none blur-3xl opacity-75 transform-gpu animate-pulse"
            style={{
              background: `radial-gradient(ellipse at center, ${hexToRgba(glowColor, 0.7)} 0%, ${hexToRgba(glowColor, 0.35)} 45%, ${hexToRgba(glowColor, 0.1)} 70%, transparent 85%)`,
              animationDuration: "3.5s",
            }}
          />
          {/* Core bright intense glow halo */}
          <div
            className="w-[90%] h-[90%] rounded-none blur-2xl opacity-90 transform-gpu"
            style={{
              background: `radial-gradient(ellipse at center, rgba(255,255,255,0.98) 0%, ${hexToRgba(glowColor, 0.85)} 35%, ${hexToRgba(glowColor, 0.3)} 60%, transparent 75%)`,
            }}
          />
        </div>
      )}

      {/* ── 3. Overlay Banner Artwork (Matches Full Background Banner Frame Width) ── */}
      <div
        className="relative w-full h-full max-w-full z-10 overflow-hidden rounded-none flex items-center justify-center mx-auto"
        style={{
          borderRadius: 0,
        }}
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
              mixBlendMode: blendMode as any,
              borderRadius: 0,
            }}
            className="w-full h-full object-contain sm:object-cover block transition-transform duration-700 ease-out rounded-none"
          />
        </picture>
      </div>
    </div>
  );

  return (
    <section aria-label={`${brand.name} ${department.name} Banner`} className="relative w-full overflow-hidden p-0 m-0 border-none rounded-none mb-4 sm:mb-6">
      {destinationUrl ? (
        isExternalLink ? (
          <a
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            rel={config.openInNewTab ? "noopener noreferrer" : undefined}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-none overflow-hidden group w-full"
          >
            {bannerContent}
          </a>
        ) : (
          <Link
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-none overflow-hidden group w-full"
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
