"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OfferBanner } from "@/lib/types";

// Default fallback offer banners if none are added in admin yet
const DEFAULT_SHOP_BANNERS: OfferBanner[] = [
  {
    id: "default-shop-1",
    internalName: "Mega Sale 2026",
    headline: "PREMIUM SMARTPHONES & ACCESSORIES",
    highlightText: "UP TO 35% OFF",
    description: "Exclusive deals on Apple, Samsung, Xiaomi & Original Accessories in Vavuniya.",
    badgeText: "HOT DEAL",
    primaryCtaText: "Explore Offers",
    primaryCtaUrl: "/products",
    desktopImage: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1600&auto=format&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=800&auto=format&fit=crop",
    placement: "shop_top",
    status: "active",
  },
  {
    id: "default-shop-2",
    internalName: "Express Repair Promo",
    headline: "EXPRESS MOBILE REPAIR SERVICE",
    highlightText: "SAME-DAY REPAIR",
    description: "Screen replacement, battery upgrades & hardware fixes with genuine warranty.",
    badgeText: "QUICK SERVICE",
    primaryCtaText: "Book Repair",
    primaryCtaUrl: "/contact",
    desktopImage: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=1600&auto=format&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=800&auto=format&fit=crop",
    placement: "shop_top",
    status: "active",
  },
];

interface ShopBannerSliderProps {
  banners?: OfferBanner[];
}

export default function ShopBannerSlider({ banners = [] }: ShopBannerSliderProps) {
  const activeBanners = banners.length > 0 ? banners : DEFAULT_SHOP_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide interval
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl mb-8 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || currentIndex}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex items-center"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <picture>
              {current.mobileImage && (
                <source media="(max-width: 640px)" srcSet={current.mobileImage} />
              )}
              <img
                src={current.desktopImage || current.mobileImage || "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1600&auto=format&fit=crop"}
                alt={current.headline || "Offer Banner"}
                className="w-full h-full object-cover object-center"
              />
            </picture>
            {/* Gradient Overlays for readable text */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10"
              style={{ opacity: current.overlayOpacity ?? 0.85 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          </div>

          {/* Content overlay */}
          <div className="relative z-20 max-w-4xl px-6 sm:px-10 py-8 md:py-12">
            {/* Badge */}
            {(current.badgeText || current.promoLabel) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-black text-[11px] font-black uppercase tracking-wider mb-3 shadow-lg"
              >
                <Tag className="w-3 h-3" />
                {current.badgeText || current.promoLabel}
              </motion.div>
            )}

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-2"
            >
              {current.headline}
            </motion.h2>

            {/* Highlight text */}
            {current.highlightText && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl md:text-2xl font-black text-amber-400 mb-2"
              >
                {current.highlightText}
              </motion.div>
            )}

            {/* Description */}
            {current.description && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xs sm:text-sm text-gray-300 max-w-lg mb-6 line-clamp-2"
              >
                {current.description}
              </motion.p>
            )}

            {/* CTA Button */}
            {current.primaryCtaText && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href={current.primaryCtaUrl || "/products"}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-amber-400 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  {current.primaryCtaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls */}
      {activeBanners.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 opacity-80 group-hover:opacity-100 transition-all active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 opacity-80 group-hover:opacity-100 transition-all active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
