"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { TodayDealSettings } from "@/lib/types";
import { DEFAULT_TODAY_DEAL_SETTINGS } from "@/lib/data";

interface TodayDealSectionProps {
  settings?: TodayDealSettings | null;
  className?: string;
  isLivePreview?: boolean;
}

// Convert HEX to RGBA string safely
function hexToRgba(hex: string, opacityPercent: number): string {
  if (!hex) return "rgba(9, 9, 9, 1)";
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

// Format 2-digit number
function padZero(num: number): string {
  return num < 10 ? `0${Math.max(0, num)}` : `${Math.max(0, num)}`;
}

export default function TodayDealSection({
  settings,
  className = "",
  isLivePreview = false,
}: TodayDealSectionProps) {
  const deal = useMemo(() => {
    return { ...DEFAULT_TODAY_DEAL_SETTINGS, ...(settings || {}) };
  }, [settings]);

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute countdown time and status
  const { isLive, isScheduled, isExpired, days, hours, minutes, seconds } = useMemo(() => {
    const startTime = deal.startsAt ? new Date(deal.startsAt).getTime() : 0;
    const endTime = deal.endsAt ? new Date(deal.endsAt).getTime() : 0;

    let scheduled = false;
    let live = true;
    let expired = false;

    if (startTime && now < startTime) {
      scheduled = true;
      live = false;
    } else if (endTime && now >= endTime) {
      expired = true;
      live = false;
    }

    const diff = endTime ? Math.max(0, endTime - now) : 0;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return {
      isLive: live && !scheduled && !expired,
      isScheduled: scheduled,
      isExpired: expired,
      days: d,
      hours: deal.showDays ? h : d * 24 + h,
      minutes: m,
      seconds: s,
    };
  }, [deal.startsAt, deal.endsAt, deal.showDays, now]);

  // Section visibility check
  if (!deal.enabled && !isLivePreview) {
    return null;
  }

  // Handle expired state
  if (isExpired && !isLivePreview) {
    if (deal.expiryAction === "hide") {
      return null;
    }
  }

  // Image source resolution
  const desktopImg = deal.desktopImageUrl || DEFAULT_TODAY_DEAL_SETTINGS.desktopImageUrl;
  const mobileImg = deal.mobileImageUrl || desktopImg;

  if (!desktopImg && !isLivePreview) {
    return null;
  }

  // Focal position mapping
  const getObjectPosition = (focal: "left" | "center" | "right") => {
    switch (focal) {
      case "left":
        return "left center";
      case "right":
        return "right center";
      case "center":
      default:
        return "center center";
    }
  };

  // Content box positioning classes
  const getBoxPositionClasses = () => {
    let justify = "justify-start";
    if (deal.boxPosition === "center") justify = "justify-center";
    if (deal.boxPosition === "right") justify = "justify-end";

    let align = "items-center";
    if (deal.verticalAlignment === "top") align = "items-start";
    if (deal.verticalAlignment === "bottom") align = "items-end";

    return `flex ${justify} ${align}`;
  };

  const getContentAlignClass = () => {
    if (deal.contentAlignment === "center") return "text-center items-center";
    if (deal.contentAlignment === "right") return "text-right items-end";
    return "text-left items-start";
  };

  // CTA link target resolution
  const isExternalCta = (deal.ctaUrl || "").startsWith("http");
  const isExternalBanner = (deal.bannerUrl || "").startsWith("http");
  const activeCtaLabel =
    isExpired && deal.expiryAction === "replacement-cta" && deal.replacementCtaLabel
      ? deal.replacementCtaLabel
      : deal.ctaLabel;
  const activeCtaUrl =
    isExpired && deal.expiryAction === "replacement-cta" && deal.replacementCtaUrl
      ? deal.replacementCtaUrl
      : deal.ctaUrl || "/products";

  const boxBgColor = hexToRgba(deal.boxBackgroundColor || "#090909", deal.boxBackgroundOpacity ?? 100);
  const darkOverlayOpacity = Math.max(0, Math.min(80, deal.imageOverlayOpacity ?? 0)) / 100;

  // Render Inner Content Box
  const renderContentBox = (isMobileStacked = false) => {
    return (
      <div
        style={{
          backgroundColor: boxBgColor,
          borderRadius: `${deal.borderRadius ?? 8}px`,
          padding: isMobileStacked ? "24px 20px" : `${deal.boxPadding ?? 32}px`,
          maxWidth: isMobileStacked ? "100%" : `${Math.max(30, Math.min(65, deal.boxWidth ?? 40))}%`,
        }}
        className={`relative z-20 flex flex-col ${getContentAlignClass()} shadow-2xl backdrop-blur-xs transition-all duration-300 w-full`}
      >
        {/* 1. Live Red Dot + Eyebrow */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 select-none">
          <span className="relative flex h-2.5 w-2.5">
            <span
              style={{ backgroundColor: deal.eyebrowColor || "#ED0712" }}
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            />
            <span
              style={{ backgroundColor: deal.eyebrowColor || "#ED0712" }}
              className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm"
            />
          </span>
          <span
            style={{ color: deal.eyebrowColor || "#ED0712" }}
            className="text-[11px] sm:text-xs font-black tracking-widest uppercase font-mono"
          >
            {deal.eyebrow || "TODAY'S DEAL"}
          </span>
        </div>

        {/* 2. Main Heading */}
        <h2
          style={{ color: deal.headingColor || "#FFFFFF" }}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15] mb-2 sm:mb-3"
        >
          {deal.heading || "Today Only. Better Prices."}
        </h2>

        {/* 3. Description */}
        {deal.description && (
          <p
            style={{ color: deal.descriptionColor || "#E5E5E5" }}
            className="text-xs sm:text-sm font-medium leading-relaxed mb-5 sm:mb-6 max-w-md opacity-90"
          >
            {deal.description}
          </p>
        )}

        {/* 4. CTA Button */}
        {deal.ctaEnabled !== false && activeCtaLabel && (
          <div className="mb-6 sm:mb-7">
            {isExternalCta ? (
              <a
                href={activeCtaUrl}
                target={deal.openInNewTab ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  backgroundColor: deal.ctaBackgroundColor || "#ED0712",
                  color: deal.ctaTextColor || "#FFFFFF",
                  borderRadius: `${Math.min(8, deal.borderRadius ?? 8)}px`,
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 min-h-[44px] text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 hover:brightness-110 active:scale-98 shadow-md hover:shadow-lg"
              >
                <span>{activeCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href={activeCtaUrl}
                target={deal.openInNewTab ? "_blank" : undefined}
                style={{
                  backgroundColor: deal.ctaBackgroundColor || "#ED0712",
                  color: deal.ctaTextColor || "#FFFFFF",
                  borderRadius: `${Math.min(8, deal.borderRadius ?? 8)}px`,
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 min-h-[44px] text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 hover:brightness-110 active:scale-98 shadow-md hover:shadow-lg"
              >
                <span>{activeCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {/* 5. Countdown Timer */}
        {deal.countdownEnabled !== false && (
          <div className="pt-2 border-t border-white/10 w-full">
            <div className={`flex flex-col ${getContentAlignClass()}`}>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-white/50 uppercase font-mono mb-2">
                {isExpired
                  ? deal.expiryAction === "deal-ended"
                    ? "OFFER STATUS"
                    : "ENDS IN"
                  : isScheduled
                  ? "STARTS IN"
                  : "ENDS IN"}
              </span>

              {isExpired && deal.expiryAction === "deal-ended" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs font-black tracking-wider uppercase">
                  <Clock className="w-3.5 h-3.5" /> Deal Ended
                </span>
              ) : (
                <div
                  style={{
                    backgroundColor: deal.countdownBackgroundColor || "#FFFFFF",
                    color: deal.countdownTextColor || "#090909",
                    borderRadius: `${Math.min(6, deal.borderRadius ?? 6)}px`,
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 text-base sm:text-xl font-black font-mono tracking-wider shadow-sm select-none"
                >
                  {deal.showDays && days > 0 && (
                    <>
                      <span>{padZero(days)}d</span>
                      <span className="mx-1.5 opacity-40">:</span>
                    </>
                  )}
                  <span>{padZero(hours)}</span>
                  <span className="mx-1.5 opacity-40 animate-pulse">:</span>
                  <span>{padZero(minutes)}</span>
                  <span className="mx-1.5 opacity-40 animate-pulse">:</span>
                  <span>{padZero(seconds)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isCustomBgMode = deal.bannerMode === "custom_bg_with_square_image";
  const customBgStyle = isCustomBgMode
    ? deal.bannerBgType === "gradient"
      ? {
          background: `linear-gradient(135deg, ${deal.bannerBgGradientFrom || "#0F172A"} 0%, ${
            deal.bannerBgGradientTo || "#020617"
          } 100%)`,
        }
      : { backgroundColor: deal.bannerBgColor || "#090909" }
    : undefined;

  const squareImgUrl = deal.squareImageUrl || desktopImg;
  const squarePosition = deal.squareImagePosition || "right";

  return (
    <section
      id="todays-deal-section"
      aria-label="Today's Deal Promotional Banner"
      style={customBgStyle}
      className={`relative w-full overflow-hidden select-none bg-black rounded-none border-0 shadow-none my-0 py-0 ${
        isLivePreview ? "rounded-2xl border border-white/10" : ""
      } ${className}`}
    >
      {/* ── Outer Height Container matching Offer Banner Screen Fit ── */}
      <div
        className={`relative w-full ${
          isLivePreview
            ? "min-h-[380px] md:min-h-[460px]"
            : "h-[clamp(620px,78vh,680px)] md:h-[clamp(480px,62vh,620px)]"
        } flex items-end md:items-center`}
      >
        {/* ── 1. Background Layer ── */}
        {!isCustomBgMode ? (
          // Mode A: Full-Frame Background Image Layer
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            {!imgError && desktopImg ? (
              <picture className="w-full h-full block">
                {mobileImg && <source media="(max-width: 767px)" srcSet={mobileImg} />}
                <img
                  src={desktopImg}
                  alt={deal.imageAlt || "Today's Deal Promotion"}
                  loading="lazy"
                  decoding="async"
                  style={{
                    objectFit: "cover",
                    objectPosition: getObjectPosition(deal.desktopFocalPosition || "center"),
                  }}
                  className="w-full h-full object-cover max-md:object-[center_top] block transition-transform duration-700 ease-out"
                  onError={() => setImgError(true)}
                />
              </picture>
            ) : (
              <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-white/40 font-mono text-sm">
                <span>[ Today&apos;s Deal Banner Image ]</span>
              </div>
            )}
          </div>
        ) : (
          // Mode B: Custom Solid/Gradient Background with Subtle Ambient Glow
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* ── 2. Floating Square/Product Image Asset (Custom BG Mode) ── */}
        {isCustomBgMode && squareImgUrl && (
          <div
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center pointer-events-none ${
              squarePosition === "left"
                ? "left-[6vw]"
                : squarePosition === "center"
                ? "left-1/2 -translate-x-1/2 opacity-30"
                : "right-[6vw]"
            }`}
            style={{
              width: `${deal.squareImageSize || 42}%`,
              maxWidth: "460px",
            }}
          >
            <div
              style={{
                borderRadius: `${deal.squareImageBorderRadius ?? 16}px`,
              }}
              className={`relative aspect-square w-full overflow-hidden flex items-center justify-center ${
                deal.squareImageShadow !== false
                  ? "shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10"
                  : ""
              }`}
            >
              <img
                src={squareImgUrl}
                alt={deal.squareImageAlt || deal.imageAlt || "Today's Deal Product"}
                className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}

        {/* ── 3. Readability Gradient Overlays (Full Image Mode) ── */}
        {!isCustomBgMode && (
          <>
            {/* Desktop Left-to-Right Subtle Overlay */}
            <div
              className="hidden md:block absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  deal.boxPosition === "right"
                    ? "linear-gradient(270deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.05) 68%, transparent 100%)"
                    : deal.boxPosition === "center"
                    ? "radial-gradient(circle at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)"
                    : "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.05) 68%, transparent 100%)",
              }}
            />

            {/* Mobile Bottom-to-Top Overlay */}
            <div
              className="md:hidden absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* Optional Custom Dark Overlay Opacity */}
        {!isCustomBgMode && darkOverlayOpacity > 0 && (
          <div
            className="absolute inset-0 z-[2] pointer-events-none transition-opacity"
            style={{ backgroundColor: `rgba(0, 0, 0, ${darkOverlayOpacity})` }}
          />
        )}

        {/* ── 4. Content Group (Responsive Left Offset & Padding) ── */}
        <div
          className={`relative z-20 w-full h-full p-6 sm:p-10 lg:pl-[8vw] lg:pr-12 ${getBoxPositionClasses()}`}
        >
          {renderContentBox(false)}
        </div>
      </div>
    </section>
  );
}
