"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Check, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { fallbackOfferBanners } from "@/lib/data";
import { OfferBanner, BannerPlacement } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";

interface CampaignPlacementProps {
  placement: BannerPlacement;
  className?: string;
}

export default function CampaignPlacement({ placement, className }: CampaignPlacementProps) {
  const [banner, setBanner] = useState<OfferBanner | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let isSubscribed = true;

    try {
      const q = query(collection(db, "offer_banners"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isSubscribed) return;

          // Always derive banner from Firestore — never use hardcoded fallback on success
          const activeDocs = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                status: data.status || "active",
                placement: data.placement || "homepage_after_categories",
              } as OfferBanner;
            })
            .filter(
              (b) =>
                (b.status === "active" || !b.status) &&
                b.placement === placement
            )
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

          // If Firestore has no active banner for this placement → show nothing
          setBanner(activeDocs.length > 0 ? activeDocs[0] : null);
        },
        (err) => {
          // Only on actual Firestore error — use hardcoded fallback
          console.warn("Firestore banner snapshot error:", err);
          if (!isSubscribed) return;
          const fallback = fallbackOfferBanners.find(
            (f) => f.placement === placement && f.status === "active"
          );
          setBanner(fallback || null);
        }
      );

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (err) {
      console.warn("Failed to subscribe to banner snapshot:", err);
      const fallback = fallbackOfferBanners.find(
        (f) => f.placement === placement && f.status === "active"
      );
      setBanner(fallback || null);
    }
  }, [placement]);

  useEffect(() => {
    if (!banner?.countdownEnabled || !banner?.countdownEndAt) return;

    const interval = setInterval(() => {
      const diff = new Date(banner.countdownEndAt!).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [banner]);

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!banner || banner.status === "paused" || banner.status === "archived") return null;

  // Determine Content Mode (defaulting to "image_only" for clean uploaded promotional banners)
  const isImageOnly = banner.contentMode === "image_only" || (!banner.contentMode && !banner.headline);
  const isSplitMode = banner.contentMode === "split";

  const destinationUrl = banner.primaryCtaUrl || "";
  const objectFitClass = banner.imageFit === "contain" ? "object-contain" : "object-cover";
  
  const objectPositionMap: Record<string, string> = {
    center: "object-center",
    top: "object-top",
    bottom: "object-bottom",
    left: "object-left",
    right: "object-right",
  };
  const objectPosClass = objectPositionMap[banner.imagePosition || "center"] || "object-center";

  // Desktop Height computation
  const customHeightStyle = banner.bannerHeightDesktop
    ? { height: `${banner.bannerHeightDesktop}px` }
    : undefined;

  /* ════════════════════════════════════════════════════════════════════
     MODE 1: IMAGE ONLY (Default mode — 100% aligned with navbar & grids)
  ════════════════════════════════════════════════════════════════════ */
  if (isImageOnly) {
    const ImageContent = (
      <div className="relative w-full h-auto lg:h-[clamp(360px,27vw,480px)] overflow-hidden bg-neutral-100 group" style={customHeightStyle}>
        <picture className="w-full h-full block">
          {banner.mobileImage && (
            <source media="(max-width: 767px)" srcSet={banner.mobileImage} />
          )}
          <img
            src={banner.desktopImage || banner.mobileImage || "/hero-slide-1.png"}
            alt={banner.altText || banner.internalName || "Promotional Banner"}
            loading="lazy"
            className={`w-full h-full ${objectFitClass} ${objectPosClass} block group-hover:scale-[1.01] transition-transform duration-500`}
          />
        </picture>
      </div>
    );

    return (
      <section className={`w-full my-10 md:my-16 ${className || ""}`}>
        {destinationUrl ? (
          <Link href={destinationUrl} className="block w-full">
            {ImageContent}
          </Link>
        ) : (
          ImageContent
        )}
      </section>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     MODE 2: SPLIT CONTENT AND IMAGE
  ════════════════════════════════════════════════════════════════════ */
  if (isSplitMode) {
    return (
      <section className={`w-full my-10 md:my-16 ${className || ""}`}>
        <div className="relative w-full rounded-xl sm:rounded-2xl lg:rounded-[20px] border border-neutral-200/80 bg-[#F8F8F9] p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          <div className="lg:col-span-7 flex flex-col justify-center text-[#090909]">
            {banner.badgeText && (
              <span className="self-start px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider mb-4">
                {banner.badgeText}
              </span>
            )}

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {banner.headline}{" "}
              {banner.highlightText && (
                <span className="text-neutral-500">{banner.highlightText}</span>
              )}
            </h3>

            {banner.description && (
              <p className="text-sm sm:text-base text-neutral-600 mt-3 leading-relaxed max-w-xl">
                {banner.description}
              </p>
            )}

            {banner.primaryCtaText && (
              <div className="mt-6">
                <Link
                  href={destinationUrl || "/products"}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <span>{banner.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <picture className="w-full">
              {banner.mobileImage && <source media="(max-width: 767px)" srcSet={banner.mobileImage} />}
              <img
                src={banner.desktopImage || banner.mobileImage || "/hero-slide-1.png"}
                alt={banner.altText || "Promotional product"}
                className={`max-h-[360px] w-full ${objectFitClass} ${objectPosClass} mix-blend-multiply`}
              />
            </picture>
          </div>
        </div>
      </section>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     MODE 3: OVERLAY CONTENT MODE
  ════════════════════════════════════════════════════════════════════ */
  return (
    <section className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 my-10 md:my-16 ${className || ""}`}>
      <div
        className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[20px] border border-neutral-200/80 bg-neutral-900 min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center shadow-xs"
        style={customHeightStyle}
      >
        {/* Background Image */}
        {banner.desktopImage && (
          <picture className="absolute inset-0 w-full h-full">
            {banner.mobileImage && <source media="(max-width: 767px)" srcSet={banner.mobileImage} />}
            <img
              src={banner.desktopImage}
              alt={banner.altText || banner.headline}
              className={`w-full h-full ${objectFitClass} ${objectPosClass}`}
            />
          </picture>
        )}

        {/* Dark Overlay for Text Readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-0"
          style={{ opacity: (banner.overlayOpacity ?? 50) / 100 }}
        />

        {/* Overlay Text Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl flex flex-col justify-center text-white">
          {banner.badgeText && (
            <span className="self-start px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-wider mb-4 shadow-2xs">
              {banner.badgeText}
            </span>
          )}

          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {banner.headline}{" "}
            {banner.highlightText && (
              <span className="text-neutral-300">{banner.highlightText}</span>
            )}
          </h3>

          {banner.description && (
            <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
              {banner.description}
            </p>
          )}

          {/* Countdown Timer */}
          {timeLeft && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {banner.countdownLabel || "Ends in:"}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <span className="px-2 py-1 bg-white/10 rounded-lg">{timeLeft.days}d</span>
                <span>:</span>
                <span className="px-2 py-1 bg-white/10 rounded-lg">{timeLeft.hours}h</span>
                <span>:</span>
                <span className="px-2 py-1 bg-white/10 rounded-lg">{timeLeft.minutes}m</span>
              </div>
            </div>
          )}

          {/* Coupon Code */}
          {banner.couponCode && (
            <div className="mt-4">
              <button
                type="button"
                onClick={(e) => handleCopyCoupon(banner.couponCode!, e)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span>Use Code: <strong>{banner.couponCode}</strong></span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] text-white/50">(Copy)</span>}
              </button>
            </div>
          )}

          {/* Primary CTA */}
          {banner.primaryCtaText && (
            <div className="mt-6">
              <Link
                href={destinationUrl || "/products"}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all shadow-md"
              >
                <span>{banner.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
