"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { getOfferBanners } from "@/lib/firestore-client";
import { fallbackOfferBanners } from "@/lib/data";
import { OfferBanner, BannerPlacement } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import { normalizeImageUrl } from "@/lib/utils";

interface CampaignPlacementProps {
  placement: BannerPlacement;
  className?: string;
}

export default function CampaignPlacement({ placement, className }: CampaignPlacementProps) {
  const [banner, setBanner] = useState<OfferBanner | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let isSubscribed = true;

    getOfferBanners(placement)
      .then((activeBanners) => {
        if (!isSubscribed) return;
        if (activeBanners && activeBanners.length > 0) {
          setBanner(activeBanners[0]);
        } else {
          const fallback = fallbackOfferBanners.find(
            (f) => f.placement === placement && f.status === "active"
          );
          setBanner(fallback || null);
        }
      })
      .catch((err) => {
        console.warn("Error loading campaign banner:", err);
        if (!isSubscribed) return;
        const fallback = fallbackOfferBanners.find(
          (f) => f.placement === placement && f.status === "active"
        );
        setBanner(fallback || null);
      });

    return () => {
      isSubscribed = false;
    };
  }, [placement]);

  const handleCopyCoupon = (code: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!banner || banner.status === "paused" || banner.status === "archived") return null;

  // Real-time automatic expiration check
  const now = Date.now();
  if (banner.startAt && new Date(banner.startAt).getTime() > now) return null;
  if (!banner.noExpiry && banner.endAt && new Date(banner.endAt).getTime() <= now) return null;
  if (banner.countdownEnabled && banner.countdownEndAt && new Date(banner.countdownEndAt).getTime() <= now) return null;

  const destinationUrl = banner.primaryCtaUrl || "/products?category=audio";
  const desktopImg = normalizeImageUrl(banner.desktopImage || "/images/campaign-headphone-desktop.jpg");
  const mobileImg = normalizeImageUrl(banner.mobileImage || "/images/campaign-headphone-mobile.jpg");

  return (
    <section
      className={`relative w-full overflow-hidden select-none bg-black rounded-none border-0 shadow-none my-0 py-0 ${
        className || ""
      }`}
      style={{ borderRadius: 0 }}
    >
      {/* ── Outer Height / Aspect Ratio Container (Desktop & Mobile Independent) ── */}
      {(() => {
        const desktopRatio = banner.bannerSizeRatio || banner.banner_size_ratio || "default";
        const mobileRatio = banner.bannerSizeRatioMobile || banner.banner_size_ratio_mobile || desktopRatio;

        const getMobileClass = () => {
          switch (mobileRatio) {
            case "1080x1080":
              return "max-md:aspect-square max-md:min-h-[360px]";
            case "860x270":
              return "max-md:aspect-[860/270] max-md:min-h-[160px]";
            case "1920x850":
              return "max-md:aspect-[1920/850] max-md:min-h-[200px]";
            case "1080x1440":
              return "max-md:aspect-[1080/1440] max-md:min-h-[440px]";
            default:
              return "max-md:h-[360px]";
          }
        };

        const getDesktopClass = () => {
          switch (desktopRatio) {
            case "1080x1080":
              return "md:aspect-square md:min-h-[500px]";
            case "860x270":
              return "md:aspect-[860/270] md:min-h-[260px]";
            case "1920x850":
              return "md:aspect-[1920/850] md:min-h-[420px]";
            case "1080x1440":
              return "md:aspect-[1080/1440] md:min-h-[600px]";
            default:
              return "md:h-[clamp(480px,60vh,580px)]";
          }
        };

        return (
          <div
            className={`relative w-full flex items-end md:items-center ${getMobileClass()} ${getDesktopClass()}`}
          >
        {/* ── 1. Full-Frame Background Image with Subtle Entrance Scaling ── */}
        <motion.div
          initial={{ scale: 1.02 }}
          whileInView={{ scale: 1.0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
          style={{ borderRadius: 0 }}
        >
          <picture className="w-full h-full block">
            {mobileImg && <source media="(max-width: 767px)" srcSet={mobileImg} />}
            <img
              src={desktopImg}
              alt={banner.altText || banner.headline || "Promotional Audio Campaign"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-[70%_center] max-md:object-[center_top] block"
              style={{ borderRadius: 0 }}
            />
          </picture>
        </motion.div>

        {/* ── 2. Readability Gradient Overlays (Subtle, keeping model clearly visible) ── */}
        {/* Desktop Left-to-Right Subtle Overlay */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.05) 68%, transparent 100%)",
          }}
        />

        {/* Mobile Bottom-to-Top Overlay */}
        <div
          className="md:hidden absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)",
          }}
        />

        {/* ── 3. Content Group ── */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end md:justify-center px-4 sm:px-8 lg:pl-[8vw] lg:pr-12 pb-6 md:pb-0 font-outfit">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[480px] w-full flex flex-col items-start gap-2.5 sm:gap-4 md:gap-5 text-left"
          >
            {/* Eyebrow */}
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/80 uppercase">
              {banner.badgeText || banner.promoLabel || "LIMITED-TIME OFFER"}
            </span>

            {/* Main Heading */}
            <h2
              className="text-white font-black tracking-tight leading-[1.05] m-0 p-0 text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {banner.headline || "Sound On. World Off."}
            </h2>

            {/* Supporting Text */}
            <p
              className="text-xs sm:text-sm md:text-base leading-relaxed m-0 font-normal line-clamp-2 sm:line-clamp-none text-white/80"
            >
              {banner.description ||
                "Premium headphones designed for deeper sound, clearer calls and all-day comfort."}
            </p>

            {/* Inline Coupon Component */}
            {banner.couponCode && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={(e) => handleCopyCoupon(banner.couponCode!, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCopyCoupon(banner.couponCode!, e);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-white/20 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-white outline-none active:scale-[0.98]"
                  aria-label={`Copy coupon code ${banner.couponCode}`}
                >
                  <span className="text-[11px] sm:text-xs text-white/70 font-normal">Use code</span>
                  <span className="text-xs sm:text-sm font-bold font-mono tracking-wider text-amber-300">
                    {banner.couponCode}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] sm:text-xs text-white/80 border-l border-white/20 pl-2">
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* CTA Actions */}
            <div className="flex items-center flex-wrap gap-3 pt-1">
              <Link
                href={destinationUrl}
                className="group inline-flex items-center justify-center gap-1.5 h-10 sm:h-12 px-5 sm:px-6 rounded-lg bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md active:scale-[0.98]"
              >
                <span>{banner.primaryCtaText || "Shop Headphones"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-[3px]" />
              </Link>

              {(banner.secondaryCtaText || "Explore Audio") && (
                <Link
                  href={banner.secondaryCtaUrl || destinationUrl}
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                >
                  {banner.secondaryCtaText || "Explore Audio"}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  })()}
</section>
);
}
