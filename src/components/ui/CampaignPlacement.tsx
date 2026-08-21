"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
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
  const { showToast } = useToast();

  useEffect(() => {
    let isSubscribed = true;

    try {
      const q = query(collection(db, "offer_banners"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isSubscribed) return;

          // Derive active banner from Firestore
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

          if (activeDocs.length > 0) {
            setBanner(activeDocs[0]);
          } else {
            const fallback = fallbackOfferBanners.find(
              (f) => f.placement === placement && f.status === "active"
            );
            setBanner(fallback || null);
          }
        },
        (err) => {
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

  const handleCopyCoupon = (code: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!banner || banner.status === "paused" || banner.status === "archived") return null;

  const destinationUrl = banner.primaryCtaUrl || "/products?category=audio";
  const desktopImg = banner.desktopImage || "/images/campaign-headphone-desktop.jpg";
  const mobileImg = banner.mobileImage || "/images/campaign-headphone-mobile.jpg";

  return (
    <section
      className={`relative w-full overflow-hidden select-none bg-black rounded-none border-0 shadow-none my-0 py-0 ${
        className || ""
      }`}
      style={{ borderRadius: 0 }}
    >
      {/* ── Outer Height Container ── */}
      <div className="relative w-full h-[clamp(620px,78vh,680px)] md:h-[clamp(480px,62vh,620px)] flex items-end md:items-center">
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
              "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)",
          }}
        />

        {/* ── 3. Content Group (Responsive Left Offset & Consistent 18-24px Spacing) ── */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end md:justify-center px-6 sm:px-10 lg:pl-[8vw] lg:pr-12 pb-10 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[480px] w-full flex flex-col items-start gap-5 sm:gap-6 text-left"
          >
            {/* Eyebrow */}
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-white/80 uppercase">
              {banner.badgeText || banner.promoLabel || "LIMITED-TIME OFFER"}
            </span>

            {/* Main Heading */}
            <h2
              className="text-white font-bold tracking-[-0.04em] leading-[0.98] m-0 p-0"
              style={{ fontSize: "clamp(38px, 4.5vw, 76px)" }}
            >
              {banner.headline || "Sound On. World Off."}
            </h2>

            {/* Supporting Text */}
            <p
              className="text-[17px] sm:text-[19px] leading-[1.55] m-0 font-normal"
              style={{ color: "rgba(255, 255, 255, 0.76)" }}
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
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[8px] border border-white/22 bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-white outline-none active:scale-[0.98]"
                  aria-label={`Copy coupon code ${banner.couponCode}`}
                >
                  <span className="text-xs sm:text-sm text-white/70 font-normal">Use code</span>
                  <span className="text-sm sm:text-base font-bold font-mono tracking-wider text-white">
                    {banner.couponCode}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/80 border-l border-white/20 pl-3">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* CTA Actions */}
            <div className="flex items-center flex-wrap gap-5 pt-1">
              <Link
                href={destinationUrl}
                className="group inline-flex items-center justify-center gap-2 h-[50px] px-7 rounded-[8px] bg-white text-black font-bold text-sm hover:bg-[#F1F1F1] transition-all shadow-md active:scale-[0.98]"
              >
                <span>{banner.primaryCtaText || "Shop Headphones"}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
              </Link>

              {(banner.secondaryCtaText || "Explore Audio") && (
                <Link
                  href={banner.secondaryCtaUrl || destinationUrl}
                  className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                >
                  {banner.secondaryCtaText || "Explore Audio"}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
