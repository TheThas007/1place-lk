"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";
import { DepartmentBrandPageConfig, Brand, Department } from "@/lib/types";

interface DepartmentBrandHeroProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
}

// Curated high-resolution studio multi-device banner assets for light #F5F5F7 background
const BRAND_DEFAULT_STUDIO_BANNERS: Record<string, Record<string, string>> = {
  apple: {
    all: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    phones: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1600&auto=format&fit=crop",
    "laptops-tablets": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1600&auto=format&fit=crop",
  },
  samsung: {
    all: "https://images.unsplash.com/photo-1610945265064-3234eb261763?q=80&w=1600&auto=format&fit=crop",
    phones: "https://images.unsplash.com/photo-1610945265064-3234eb261763?q=80&w=1600&auto=format&fit=crop",
    "laptops-tablets": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1600&auto=format&fit=crop",
  },
  xiaomi: {
    all: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1600&auto=format&fit=crop",
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
  const [logoError, setLogoError] = useState(false);

  const brandSlug = (brand.slug || "").toLowerCase();
  const deptSlug = (department.slug || "").toLowerCase();

  // Resolve Banner URL with fallback priority
  const defaultBrandStudioBanner =
    BRAND_DEFAULT_STUDIO_BANNERS[brandSlug]?.[deptSlug] ||
    BRAND_DEFAULT_STUDIO_BANNERS[brandSlug]?.all ||
    "";

  const resolvedBannerUrl =
    config.desktopBannerUrl && config.desktopBannerUrl.trim()
      ? config.desktopBannerUrl
      : defaultBrandStudioBanner;

  const mobileBannerUrl = config.mobileBannerUrl || resolvedBannerUrl;

  // Resolve Brand Logo with fallback priority
  const resolvedLogoUrl =
    !config.useDefaultLogo && config.logoOverrideUrl && config.logoOverrideUrl.trim()
      ? config.logoOverrideUrl
      : brand.logo_url || (brand as any).logo || `https://cdn.simpleicons.org/${brandSlug}/000000`;

  // Content defaults matching the reference
  const eyebrowText =
    config.eyebrow || `SHOP ${brand.name.toUpperCase()}`;

  const headingText =
    config.heading ||
    (brandSlug === "apple"
      ? "Everything Apple. All in one place."
      : brandSlug === "samsung"
      ? "Galaxy AI. Everything in one place."
      : `Everything ${brand.name}. All in one place.`);

  const descriptionText =
    config.description ||
    (brandSlug === "apple"
      ? "Discover iPhone, Mac, iPad, Watch, AirPods and genuine accessories."
      : brandSlug === "samsung"
      ? "Discover Galaxy S Series, Z Fold, Tab, Galaxy Watch, and authentic accessories."
      : `Explore 100% genuine ${brand.name} devices and authentic accessories with official warranty.`);

  const primaryCtaText =
    config.primaryCtaLabel ||
    (deptSlug === "phones"
      ? `Explore ${brand.name} Phones`
      : deptSlug === "laptops-tablets"
      ? `Explore ${brand.name} Laptops`
      : `Explore ${brand.name}`);

  // Custom colors if explicitly configured in admin
  const headingColor = config.headingColor || "#090909";
  const descColor = config.descriptionColor || "#4B4B4B";
  const eyebrowColor = config.eyebrowColor || "#090909";
  const ctaBg = config.primaryCtaBackground || "#090909";
  const ctaText = config.primaryCtaTextColor || "#FFFFFF";

  // Optional background overlay if configured
  const contentBg =
    config.contentBackgroundColor && config.contentBackgroundColor !== "transparent" && config.contentBackgroundOpacity && config.contentBackgroundOpacity > 0
      ? config.contentBackgroundColor
      : undefined;

  return (
    <div className="relative w-full overflow-hidden bg-[#F5F5F7] rounded-xl sm:rounded-2xl border border-neutral-200/80 mb-8 select-none">
      {/* ── Banner Height Container (400-440px desktop) ── */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] lg:h-[440px] flex items-center">
        
        {/* ── 1. Right-Side Studio Composition Image Layer ── */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex justify-end items-center">
          {!imgError && resolvedBannerUrl ? (
            <picture className="w-full h-full block">
              {mobileBannerUrl && <source media="(max-width: 767px)" srcSet={mobileBannerUrl} />}
              <img
                src={resolvedBannerUrl}
                alt={config.bannerAlt || `${brand.name} ${department.name} Studio Banner`}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover lg:object-contain lg:object-right transition-transform duration-700 ease-out"
                onError={() => setImgError(true)}
              />
            </picture>
          ) : (
            // Apple Studio Default SVG Multi-Device Graphic if image fails
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 opacity-40">
              <span className="text-4xl lg:text-6xl font-black text-neutral-300 tracking-tighter">
                {brand.name.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── 2. Subtle Left-To-Right Readability Blend Gradient ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, #F5F5F7 0%, #F5F5F7 35%, rgba(245,245,247,0.85) 50%, rgba(245,245,247,0.1) 75%, transparent 100%)",
          }}
        />

        {/* Mobile Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] md:hidden"
          style={{
            background:
              "linear-gradient(0deg, rgba(245,245,247,0.96) 0%, rgba(245,245,247,0.8) 50%, rgba(245,245,247,0.2) 100%)",
          }}
        />

        {/* ── 3. Clean Left Editorial Content Overlay (NO nested card) ── */}
        <div className="relative z-10 w-full max-w-xl p-6 sm:p-10 lg:p-12 flex flex-col items-start justify-center text-left">
          <div
            style={{
              backgroundColor: contentBg,
              borderRadius: config.borderRadius ? `${config.borderRadius}px` : undefined,
            }}
            className="w-full"
          >
            {/* Clean Brand Logo */}
            {resolvedLogoUrl && !logoError ? (
              <div className="mb-4 h-9 sm:h-11 w-auto max-w-[160px] flex items-center">
                <img
                  src={resolvedLogoUrl}
                  alt={`${brand.name} logo`}
                  className="max-h-9 sm:max-h-11 w-auto object-contain object-left"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="mb-4 text-xl sm:text-2xl font-black tracking-tight text-neutral-900 font-mono">
                {brand.name}
              </div>
            )}

            {/* Eyebrow */}
            <div className="mb-2 select-none">
              <span
                style={{ color: eyebrowColor }}
                className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase font-mono"
              >
                {eyebrowText}
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{ color: headingColor }}
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.1] mb-3"
            >
              {headingText}
            </h1>

            {/* Description */}
            {descriptionText && (
              <p
                style={{ color: descColor }}
                className="text-xs sm:text-sm lg:text-[15px] font-medium leading-relaxed mb-6 max-w-md"
              >
                {descriptionText}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {config.primaryCtaEnabled !== false && (
                <Link
                  href={config.primaryCtaUrl || "#products"}
                  style={{
                    backgroundColor: ctaBg,
                    color: ctaText,
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-98 shadow-xs cursor-pointer"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {config.secondaryCtaEnabled && config.secondaryCtaLabel && (
                <Link
                  href={config.secondaryCtaUrl || "/contact"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold text-neutral-800 bg-white/80 hover:bg-white border border-neutral-300 transition-all active:scale-98 shadow-2xs cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{config.secondaryCtaLabel}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
