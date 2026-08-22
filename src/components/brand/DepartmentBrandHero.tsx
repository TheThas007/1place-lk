"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, PhoneCall } from "lucide-react";
import { DepartmentBrandPageConfig, Brand, Department } from "@/lib/types";

interface DepartmentBrandHeroProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
}

// Convert HEX to RGBA string safely
function hexToRgba(hex: string, opacityPercent: number): string {
  if (!hex) return "rgba(9, 9, 9, 0.85)";
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((ch) => ch + ch).join("");
  }
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const a = Math.max(0, Math.min(100, opacityPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function DepartmentBrandHero({
  config,
  brand,
  department,
}: DepartmentBrandHeroProps) {
  const [imgError, setImgError] = useState(false);

  const desktopImg = config.desktopBannerUrl || "";
  const mobileImg = config.mobileBannerUrl || desktopImg;
  const logoUrl =
    !config.useDefaultLogo && config.logoOverrideUrl
      ? config.logoOverrideUrl
      : brand.logo_url || (brand as any).logo || "";

  const boxBg = hexToRgba(
    config.contentBackgroundColor || "#090909",
    config.contentBackgroundOpacity ?? 85
  );
  const overlayOpacity = Math.max(0, Math.min(80, config.imageOverlayOpacity ?? 35)) / 100;

  // Alignment classes
  const getPositionClasses = () => {
    let justify = "justify-start";
    if (config.horizontalPosition === "center") justify = "justify-center";
    if (config.horizontalPosition === "right") justify = "justify-end";

    let align = "items-center";
    if (config.verticalPosition === "top") align = "items-start";
    if (config.verticalPosition === "bottom") align = "items-end";

    return `flex ${justify} ${align}`;
  };

  const getTextAlignClasses = () => {
    if (config.textAlignment === "center") return "text-center items-center";
    if (config.textAlignment === "right") return "text-right items-end";
    return "text-left items-start";
  };

  return (
    <div className="relative w-full overflow-hidden select-none bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-800 shadow-2xl mb-8">
      {/* ── Banner Height Container ── */}
      <div
        className="relative w-full flex items-end md:items-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]"
        style={{
          borderRadius: `${config.borderRadius ?? 16}px`,
        }}
      >
        {/* ── 1. Background Image Layer ── */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          {!imgError && desktopImg ? (
            <picture className="w-full h-full block">
              {mobileImg && <source media="(max-width: 767px)" srcSet={mobileImg} />}
              <img
                src={desktopImg}
                alt={config.bannerAlt || `${brand.name} ${department.name}`}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover max-md:object-[center_top] block transition-transform duration-700 ease-out"
                onError={() => setImgError(true)}
              />
            </picture>
          ) : (
            // Neutral Luxury Fallback
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
        </div>

        {/* ── 2. Color / Gradient Overlays ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundColor:
              overlayOpacity > 0
                ? hexToRgba(config.imageOverlayColor || "#000000", overlayOpacity * 100)
                : "transparent",
            background:
              desktopImg
                ? "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 80%, transparent 100%)"
                : undefined,
          }}
        />

        {/* ── 3. Real HTML Overlay Content Box ── */}
        <div className={`relative z-10 w-full h-full p-6 sm:p-10 lg:p-12 ${getPositionClasses()}`}>
          <div
            style={{
              backgroundColor: boxBg,
              borderRadius: `${config.borderRadius ?? 16}px`,
            }}
            className={`relative max-w-xl w-full p-6 sm:p-8 flex flex-col ${getTextAlignClasses()} backdrop-blur-md shadow-2xl border border-white/10`}
          >
            {/* Brand Logo Display */}
            {logoUrl && (
              <div className="mb-4 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 inline-flex items-center justify-center max-w-[140px] max-h-[44px]">
                <img
                  src={logoUrl}
                  alt={config.logoAlt || `${brand.name} Logo`}
                  className="max-h-8 max-w-[120px] w-auto h-auto object-contain brightness-0 invert"
                />
              </div>
            )}

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2 select-none">
              <span
                style={{ color: config.eyebrowColor || "#ED0712" }}
                className="text-[10px] sm:text-xs font-black tracking-widest uppercase font-mono flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {config.eyebrow || `OFFICIAL ${brand.name.toUpperCase()} ${department.name.toUpperCase()}`}
              </span>
            </div>

            {/* Main Heading */}
            <h1
              style={{ color: config.headingColor || "#FFFFFF" }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15] mb-2 sm:mb-3"
            >
              {config.heading || `Explore ${brand.name} in ${department.name}`}
            </h1>

            {/* Description */}
            {config.description && (
              <p
                style={{ color: config.descriptionColor || "#E5E5E5" }}
                className="text-xs sm:text-sm font-medium leading-relaxed mb-6 opacity-90"
              >
                {config.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {config.primaryCtaEnabled !== false && config.primaryCtaLabel && (
                <Link
                  href={config.primaryCtaUrl || `#products`}
                  style={{
                    backgroundColor: config.primaryCtaBackground || "#ED0712",
                    color: config.primaryCtaTextColor || "#FFFFFF",
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 hover:brightness-110 active:scale-98 shadow-md"
                >
                  <span>{config.primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {config.secondaryCtaEnabled && config.secondaryCtaLabel && (
                <Link
                  href={config.secondaryCtaUrl || "/contact"}
                  style={{
                    backgroundColor: config.secondaryCtaBackground || "rgba(255,255,255,0.12)",
                    color: config.secondaryCtaTextColor || "#FFFFFF",
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 hover:bg-white/20 active:scale-98 border border-white/10"
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
