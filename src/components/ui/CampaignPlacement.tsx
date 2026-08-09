"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Tag, Check, Clock } from "lucide-react";
import { OfferBanner, BannerPlacement } from "@/lib/types";
import { getOfferBanners } from "@/lib/firestore-client";
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
    async function loadBanner() {
      try {
        const banners = await getOfferBanners(placement);
        if (banners.length > 0) {
          setBanner(banners[0]);
        }
      } catch (err) {
        console.error("Failed to load banner for placement:", placement, err);
      }
    }
    loadBanner();
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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!banner) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 my-8 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] flex items-center shadow-2xl ${className}`}>
      {/* Background Video or Image / Overlay */}
      {banner.videoUrl ? (
        <video
          src={banner.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : banner.desktopImage ? (
        <picture>
          {banner.mobileImage && <source media="(max-width: 768px)" srcSet={banner.mobileImage} />}
          <img
            src={banner.desktopImage}
            alt={banner.altText || banner.headline}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </picture>
      ) : null}

      <div
        className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0"
        style={{ opacity: (banner.overlayOpacity ?? 50) / 100 }}
      />

      {/* Banner Content */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl flex flex-col justify-center text-white">
        {banner.badgeText && (
          <span className="self-start px-3.5 py-1 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-wider mb-4 shadow-md">
            {banner.badgeText}
          </span>
        )}

        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          {banner.headline}{" "}
          {banner.highlightText && (
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {banner.highlightText}
            </span>
          )}
        </h3>

        {banner.description && (
          <p className="text-sm sm:text-base text-zinc-300 mt-3 max-w-xl leading-relaxed">
            {banner.description}
          </p>
        )}

        {/* Countdown Timer */}
        {timeLeft && (
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {banner.countdownLabel || "Ends in:"}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <span className="px-2 py-1 bg-white/10 rounded-lg border border-white/15">{timeLeft.days}d</span>
              <span>:</span>
              <span className="px-2 py-1 bg-white/10 rounded-lg border border-white/15">{timeLeft.hours}h</span>
              <span>:</span>
              <span className="px-2 py-1 bg-white/10 rounded-lg border border-white/15">{timeLeft.minutes}m</span>
              <span>:</span>
              <span className="px-2 py-1 bg-white/10 rounded-lg border border-white/15">{timeLeft.seconds}s</span>
            </div>
          </div>
        )}

        {/* Coupon Code Action */}
        {banner.couponCode && (
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => handleCopyCoupon(banner.couponCode!)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-colors group"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Code: <strong>{banner.couponCode}</strong></span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] text-white/50 group-hover:text-white">(Copy)</span>}
            </button>
          </div>
        )}

        {/* Primary CTA */}
        {banner.primaryCtaText && (
          <div className="mt-6">
            <Link
              href={banner.primaryCtaUrl || "/products"}
              target={banner.openInNewTab ? "_blank" : "_self"}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all hover:scale-105 shadow-xl group"
            >
              {banner.primaryCtaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
