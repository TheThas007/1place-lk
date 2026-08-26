"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { TodayDealSettings } from "@/lib/types";
import { DEFAULT_TODAY_DEAL_SETTINGS } from "@/lib/data";

interface TodayDealSectionProps {
  settings?: TodayDealSettings | null;
  className?: string;
  isLivePreview?: boolean;
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
  const [now, setNow] = useState<number>(() => Date.now());
  const [imgError, setImgError] = useState(false);

  // Live 1-second interval ticker
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute countdown time and status
  const { isLive, isScheduled, isExpired, days, hours, minutes, seconds } = useMemo(() => {
    let endTime = deal.endsAt ? new Date(deal.endsAt).getTime() : 0;
    const startTime = deal.startsAt ? new Date(deal.startsAt).getTime() : 0;

    let scheduled = false;
    let expired = false;

    if (startTime && now < startTime) {
      scheduled = true;
    } else if (endTime && now >= endTime) {
      if (deal.expiryAction === "deal-ended" || deal.expiryAction === "hide") {
        expired = true;
      }
    }

    // If no future endTime or expired in standard mode, fallback to Midnight tonight (23:59:59) for continuous live ticking
    if (!endTime || (!expired && endTime <= now)) {
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      endTime = midnight.getTime();
    }

    const diff = Math.max(0, endTime - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return {
      isLive: !scheduled && !expired,
      isScheduled: scheduled,
      isExpired: expired,
      days: d,
      hours: deal.showDays ? h : d * 24 + h,
      minutes: m,
      seconds: s,
    };
  }, [deal.startsAt, deal.endsAt, deal.showDays, deal.expiryAction, now]);

  // If explicitly disabled and not in live preview mode, hide
  if (deal.enabled === false && !isLivePreview) {
    return null;
  }

  // Handle expired state
  if (isExpired && !isLivePreview && deal.expiryAction === "hide") {
    return null;
  }

  // Active CTA link and label
  const activeCtaLabel =
    isExpired && deal.expiryAction === "replacement-cta" && deal.replacementCtaLabel
      ? deal.replacementCtaLabel
      : deal.ctaLabel || "SHOP TODAY'S DEALS";

  const activeCtaUrl =
    isExpired && deal.expiryAction === "replacement-cta" && deal.replacementCtaUrl
      ? deal.replacementCtaUrl
      : deal.ctaUrl || "/products";

  const isExternalCta = (activeCtaUrl || "").startsWith("http");

  // Product Image Source (Desktop and Mobile fallback)
  const displayPhoneImg =
    deal.squareImageUrl ||
    deal.desktopImageUrl ||
    "/images/today-deal-phone-card.png";

  // 100% SHARP SQUARE CORNERS (0px radius)
  const frameRadius = deal.frameBorderRadius ?? 0;
  const imgScale = (deal.imageScale ?? 100) / 100;

  // Background Banner Behind Both Cards
  const hasBgBanner = Boolean(deal.backgroundBannerEnabled && deal.backgroundBannerUrl);
  const bgOverlayOpacity = (deal.backgroundBannerOverlayOpacity ?? 30) / 100;
  const bgBannerRadius = deal.backgroundBannerBorderRadius ?? 0;

  // Colors & Typography
  const cardBgColor = deal.boxBackgroundColor || "#FFFFFF";
  const headingTextColor = deal.headingColor || "#000000";
  const descTextColor = deal.descriptionColor || "#525252";
  const eyebrowTagColor = deal.eyebrowColor || "#ED0712";
  const ctaBtnBg = deal.ctaBackgroundColor || "#ED0712";
  const ctaBtnText = deal.ctaTextColor || "#FFFFFF";
  const timerBg = deal.countdownBackgroundColor || "transparent";
  const timerText = deal.countdownTextColor || "#ED0712";

  // Fit and padding resolution
  const cardPaddingClass =
    deal.cardPadding === "compact"
      ? "p-3 sm:p-6"
      : deal.cardPadding === "normal"
      ? "p-5 sm:p-10"
      : deal.cardPadding === "spacious"
      ? "p-6 sm:p-14"
      : "p-0"; // default edge to edge fill

  const imageFitClass =
    deal.imageFit === "contain"
      ? "max-h-full max-w-full object-contain"
      : deal.imageFit === "fill"
      ? "w-full h-full object-fill"
      : "w-full h-full object-cover"; // default cover for 100% full frame fill!

  // Layout & Alignment
  const isBoxOnRight = deal.boxPosition === "right";
  const contentAlignClass =
    deal.contentAlignment === "center"
      ? "text-center items-center"
      : deal.contentAlignment === "right"
      ? "text-right items-end"
      : "text-left items-start";

  return (
    <section
      id="todays-deal-section"
      aria-label="Today's Deal Promotional Showcase"
      className={`w-full py-8 sm:py-14 select-none relative ${className}`}
    >
      {/* ── 100% Sharp Background Banner Behind Both Cards ── */}
      {hasBgBanner && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-none"
          style={{
            borderRadius: `${bgBannerRadius}px`,
          }}
        >
          <img
            src={deal.backgroundBannerUrl}
            alt="Today's Deal Background Banner"
            className="w-full h-full object-cover rounded-none"
          />
          <div
            className="absolute inset-0 w-full h-full rounded-none"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${bgOverlayOpacity})`,
            }}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 lg:gap-8 items-stretch">
          
          {/* ── Left Card: 100% Sharp Square Corners (0px Radius) ── */}
          <div
            style={{
              backgroundColor: cardBgColor,
              borderRadius: `${frameRadius}px`,
            }}
            className={`border border-neutral-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-7 sm:p-10 lg:p-12 flex flex-col justify-between transition-all duration-300 aspect-auto md:aspect-square min-h-[380px] md:min-h-[460px] rounded-none ${
              isBoxOnRight ? "md:order-2" : "md:order-1"
            }`}
          >
            <div className={`flex flex-col ${contentAlignClass}`}>
              {/* 1. Red Dot + TODAY'S DEAL Eyebrow */}
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span
                  style={{ backgroundColor: eyebrowTagColor }}
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                />
                <span
                  style={{ color: eyebrowTagColor }}
                  className="font-black text-xs tracking-[0.14em] uppercase font-mono"
                >
                  {deal.eyebrow || "TODAY'S DEAL"}
                </span>
              </div>

              {/* 2. Headline: Today Only. Better Prices. */}
              <h2
                style={{ color: headingTextColor }}
                className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.08] mb-3"
              >
                {deal.heading ? (
                  deal.heading.includes(".") ? (
                    <>
                      {deal.heading.split(".")[0]}.
                      <br />
                      {deal.heading.split(".").slice(1).join(".").trim()}
                    </>
                  ) : (
                    deal.heading
                  )
                ) : (
                  <>
                    Today Only.
                    <br />
                    Better Prices.
                  </>
                )}
              </h2>

              {/* 3. Subtitle */}
              <p
                style={{ color: descTextColor }}
                className="text-sm sm:text-[15px] font-medium text-neutral-500 leading-relaxed mb-6 sm:mb-8 max-w-sm"
              >
                {deal.description || "Limited-time savings on selected devices & accessories."}
              </p>

              {/* 4. CTA Button (Sharp Square Rectangular) */}
              {deal.ctaEnabled !== false && activeCtaLabel && (
                <div>
                  {isExternalCta ? (
                    <a
                      href={activeCtaUrl}
                      target={deal.openInNewTab ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: ctaBtnBg,
                        color: ctaBtnText,
                      }}
                      className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 rounded-none"
                    >
                      <span>{activeCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      href={activeCtaUrl}
                      target={deal.openInNewTab ? "_blank" : undefined}
                      style={{
                        backgroundColor: ctaBtnBg,
                        color: ctaBtnText,
                      }}
                      className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 rounded-none"
                    >
                      <span>{activeCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 5. Bottom Section: Divider & Offer Status with LIVE TICKING CLOCK */}
            <div className={`pt-6 sm:pt-8 flex flex-col ${contentAlignClass}`}>
              <div className="w-full h-[1px] bg-neutral-100 mb-4 sm:mb-5" />

              <div className={`flex flex-col ${contentAlignClass}`}>
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase font-mono mb-2 block">
                  OFFER STATUS
                </span>

                {isExpired && deal.expiryAction === "deal-ended" ? (
                  <div
                    style={{
                      borderColor: `${eyebrowTagColor}70`,
                      color: eyebrowTagColor,
                      backgroundColor: timerBg,
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none border text-xs font-bold tracking-wider uppercase"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>DEAL ENDED</span>
                  </div>
                ) : (
                  <div
                    suppressHydrationWarning
                    style={{
                      borderColor: `${eyebrowTagColor}70`,
                      color: timerText,
                      backgroundColor: timerBg,
                    }}
                    className="inline-flex items-center justify-between gap-4 px-4 py-2 rounded-none border text-xs font-bold font-mono tracking-wide"
                  >
                    <div className="flex items-center gap-1.5 uppercase font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#ED0712] animate-pulse" />
                      <span>DEAL ENDS IN</span>
                    </div>
                    <span className="font-extrabold text-xs tracking-wider">
                      {mounted
                        ? `${deal.showDays && days > 0 ? `${padZero(days)}d : ` : ""}${padZero(hours)}h : ${padZero(minutes)}m : ${padZero(seconds)}s`
                        : "07h : 45m : 18s"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Card: 100% Sharp Square Poster (0px Radius) ── */}
          <div
            style={{
              backgroundColor: deal.bannerBgColor || cardBgColor,
              borderRadius: `${frameRadius}px`,
            }}
            className={`border border-neutral-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${cardPaddingClass} flex items-center justify-center relative overflow-hidden group transition-all duration-300 aspect-square min-h-[380px] md:min-h-[460px] rounded-none ${
              isBoxOnRight ? "md:order-1" : "md:order-2"
            }`}
          >
            <Link
              href={activeCtaUrl}
              target={deal.openInNewTab ? "_blank" : undefined}
              className="w-full h-full flex items-center justify-center cursor-pointer overflow-hidden relative rounded-none"
              aria-label={deal.heading || "Today's Deal Product"}
            >
              <picture className="w-full h-full flex items-center justify-center rounded-none">
                {deal.mobileImageUrl && (
                  <source
                    media="(max-width: 640px)"
                    srcSet={deal.mobileImageUrl}
                  />
                )}
                <img
                  src={!imgError ? displayPhoneImg : "/images/today-deal-phone-card.png"}
                  alt={deal.imageAlt || deal.heading || "Today's Deal Product Mockup"}
                  style={{
                    transform: imgScale !== 1 ? `scale(${imgScale})` : undefined,
                  }}
                  className={`${imageFitClass} transition-transform duration-500 ease-out group-hover:scale-105 rounded-none`}
                  onError={() => setImgError(true)}
                />
              </picture>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
