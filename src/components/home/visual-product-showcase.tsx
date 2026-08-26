"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { VisualShowcaseSettings, VisualShowcaseSlide, ShowcasePlacement } from "@/lib/types";
import { DEFAULT_SHOWCASE_SETTINGS } from "@/lib/data";

interface VisualProductShowcaseProps {
  settings?: VisualShowcaseSettings | null;
  placement?: ShowcasePlacement;
}

export default function VisualProductShowcase({ settings, placement }: VisualProductShowcaseProps) {
  const showcase = settings || DEFAULT_SHOWCASE_SETTINGS;
  const prefersReducedMotion = useReducedMotion();

  // Filter only active/enabled slides for THIS placement position
  const activeSlides: VisualShowcaseSlide[] = (
    showcase.slides && showcase.slides.length > 0
      ? showcase.slides.filter((s) => {
          if (s.enabled === false) return false;
          if (placement) {
            const slidePlacement = s.placement || showcase.placement || "below_category";
            return slidePlacement === placement;
          }
          return true;
        })
      : (DEFAULT_SHOWCASE_SETTINGS.slides || []).filter((s) => {
          if (s.enabled === false) return false;
          if (placement) {
            const slidePlacement = s.placement || DEFAULT_SHOWCASE_SETTINGS.placement || "below_category";
            return slidePlacement === placement;
          }
          return true;
        })
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalSlides = activeSlides.length;
  const autoSlide = showcase.auto_slide ?? true;
  const slideInterval = showcase.slide_interval ?? 6000;

  // Next / Prev Handlers
  const handleNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-slide timer with pause on hover
  useEffect(() => {
    if (!autoSlide || totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, slideInterval);

    return () => clearInterval(timer);
  }, [autoSlide, totalSlides, isPaused, slideInterval, handleNext]);

  // Touch Swipe Handlers for Mobile
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Keyboard arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  if (showcase.enabled === false || totalSlides === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const targetProductUrl = currentSlide.primary_cta_url || "/products";

  // Background styling computation
  const backgroundStyle =
    currentSlide.bg_type === "color" && currentSlide.bg_color
      ? { backgroundColor: currentSlide.bg_color }
      : {
          background: `linear-gradient(180deg, ${
            currentSlide.bg_gradient_from || "#F2F6FA"
          } 0%, ${currentSlide.bg_gradient_to || "#FFFFFF"} 100%)`,
        };

  // Check which text elements are present
  const hasTitle = Boolean(currentSlide.title && currentSlide.title.trim().length > 0);
  const hasSubtitle = Boolean(currentSlide.subtitle && currentSlide.subtitle.trim().length > 0);
  const hasPrimaryCta = Boolean(currentSlide.primary_cta_text && currentSlide.primary_cta_text.trim().length > 0);
  const hasSecondaryCta = Boolean(
    currentSlide.show_secondary_cta !== false &&
    currentSlide.secondary_cta_text &&
    currentSlide.secondary_cta_text.trim().length > 0
  );
  const hasButtons = hasPrimaryCta || hasSecondaryCta;
  const hasHeaderContent = hasTitle || hasSubtitle || hasButtons;

  const isFloatingAnimationEnabled =
    !prefersReducedMotion &&
    currentSlide.enable_animation !== false &&
    showcase.enable_animation !== false;

  return (
    <>
      {/* ── Mobile Layout (< 768px): Full-Width Edge-to-Edge Product Showcase with Uncropped Images ── */}
      <section
        className="md:hidden w-full w-screen max-w-full overflow-hidden select-none border-0 m-0 p-0 rounded-none shadow-none"
        style={backgroundStyle}
        aria-label={showcase.section_title || "Featured Visual Showcase"}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative w-full min-h-[500px] sm:min-h-[540px] border-0 rounded-none shadow-none flex flex-col justify-between items-center text-center pt-8 sm:pt-10 px-4 pb-4"
        >
          {/* Top Content Block: Badge -> Heading -> Subtitle -> Action CTAs */}
          <div className="relative z-10 w-full flex flex-col items-center max-w-md mx-auto space-y-2">
            {/* 1. Eyebrow / Campaign Badge */}
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-neutral-900 text-white shadow-2xs">
                New
              </span>
            </div>

            {/* 2. Main Heading (Centered, desktop heading color) */}
            {hasTitle && (
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight leading-tight transition-colors"
                style={{ color: currentSlide.heading_color || "#1D1D1F" }}
              >
                {currentSlide.title}
              </h2>
            )}

            {/* 3. Subtitle (Centered, desktop subtitle color) */}
            {hasSubtitle && (
              <p
                className="text-xs sm:text-sm font-normal max-w-xs leading-relaxed"
                style={{ color: currentSlide.subtitle_color || "#6E6E73" }}
              >
                {currentSlide.subtitle}
              </p>
            )}

            {/* 4. Action CTA Buttons (Centered Row, min 44px touch height, desktop colors) */}
            {hasButtons && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 z-20">
                {hasPrimaryCta && (
                  <Link
                    href={currentSlide.primary_cta_url || "/products"}
                    className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-black text-white transition-all active:scale-95 shadow-sm"
                  >
                    {currentSlide.primary_cta_text}
                  </Link>
                )}

                {hasSecondaryCta && (
                  <Link
                    href={currentSlide.secondary_cta_url || "/products"}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium border border-neutral-900/30 hover:border-neutral-900 text-neutral-900 hover:bg-neutral-900/5 transition-all active:scale-95"
                    style={{
                      color: currentSlide.heading_color || "#1D1D1F",
                    }}
                  >
                    {currentSlide.secondary_cta_text}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Lower Product Visual: Full phone height completely uncropped with safe margin */}
          <div className="relative w-full flex-1 flex items-end justify-center overflow-visible min-h-[260px] sm:min-h-[300px] pt-4 pb-2 mt-auto">
            <Link
              href={targetProductUrl}
              aria-label={`View ${currentSlide.title || "featured product"}`}
              className="w-full flex items-end justify-center"
            >
              <img
                src={currentSlide.mobile_image || currentSlide.desktop_image || "/placeholder-phone.webp"}
                alt={currentSlide.title || "Featured Visual"}
                loading="lazy"
                className="max-h-[290px] sm:max-h-[340px] w-auto max-w-[96%] object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.09)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-phone.webp";
                }}
              />
            </Link>
          </div>

          {/* Mobile Pagination Indicator Dots (if > 1 slide) */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2 pb-1 z-20">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all rounded-full ${
                    idx === currentIndex
                      ? "w-4 h-1.5 bg-neutral-900"
                      : "w-1.5 h-1.5 bg-neutral-400/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Desktop Layout ── */}
      <section
        aria-label={showcase.section_title || "Featured Visual Showcase"}
        className="hidden md:block relative w-full overflow-hidden select-none transition-colors duration-500"
        style={backgroundStyle}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between items-center min-h-[480px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[680px] xl:min-h-[720px] pt-6 sm:pt-8 md:pt-10 pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || `showcase-slide-${currentIndex}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1 flex flex-col justify-between items-center"
          >
            {/* ── Top Typography & Call-To-Action Block ── */}
            {hasHeaderContent && (
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto z-10 space-y-2 sm:space-y-3 mb-1 sm:mb-2">
                {/* Product Heading (Clickable to Product) */}
                {hasTitle && (
                  <Link href={targetProductUrl} className="group/title focus:outline-none">
                    <h2
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight transition-colors duration-300 group-hover/title:opacity-90 cursor-pointer"
                      style={{ color: currentSlide.heading_color || "#1D1D1F" }}
                    >
                      {currentSlide.title}
                    </h2>
                  </Link>
                )}

                {/* Subtitle / Tagline */}
                {hasSubtitle && (
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl font-normal max-w-lg leading-relaxed transition-colors duration-300"
                    style={{ color: currentSlide.subtitle_color || "#6E6E73" }}
                  >
                    {currentSlide.subtitle}
                  </p>
                )}

                {/* Action Buttons (Immediately above product image) */}
                {hasButtons && (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1 z-20">
                    {/* Primary CTA (Solid Black) */}
                    {hasPrimaryCta && (
                      <Link
                        href={currentSlide.primary_cta_url || "/products"}
                        className="inline-flex items-center justify-center min-h-[38px] sm:min-h-[42px] px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {currentSlide.primary_cta_text}
                      </Link>
                    )}

                    {/* Secondary CTA (Outlined) */}
                    {hasSecondaryCta && (
                      <Link
                        href={currentSlide.secondary_cta_url || "/products"}
                        className="inline-flex items-center justify-center min-h-[38px] sm:min-h-[42px] px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium border border-neutral-900/30 hover:border-neutral-900 text-neutral-900 hover:bg-neutral-900/5 transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        {currentSlide.secondary_cta_text}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Large Centered Product Image (Rests flush on bottom banner edge & right under buttons) ── */}
            <div
              className="relative w-full flex-1 flex items-end justify-center mt-1 sm:mt-2 pb-0 overflow-visible"
            >
              <Link
                href={targetProductUrl}
                aria-label={`View ${currentSlide.title || "featured product"}`}
                className="relative flex items-end justify-center w-full cursor-pointer focus:outline-none"
              >
                <motion.div
                  animate={isFloatingAnimationEnabled ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={
                    isFloatingAnimationEnabled
                      ? {
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : { duration: 0 }
                  }
                  className="relative flex items-end justify-center w-full max-w-5xl"
                >
                  <picture className="w-full h-full flex items-end justify-center">
                    {currentSlide.mobile_image && (
                      <source media="(max-width: 640px)" srcSet={currentSlide.mobile_image} />
                    )}
                    <img
                      src={currentSlide.desktop_image}
                      alt={currentSlide.image_alt || currentSlide.title || "Featured Product Showcase"}
                      loading="lazy"
                      decoding="async"
                      className={`w-auto h-auto max-w-[98%] sm:max-w-[96%] md:max-w-[94%] ${
                        hasHeaderContent
                          ? "max-h-[360px] sm:max-h-[440px] md:max-h-[520px] lg:max-h-[580px] xl:max-h-[620px]"
                          : "max-h-[420px] sm:max-h-[500px] md:max-h-[580px] lg:max-h-[640px] xl:max-h-[680px]"
                      } object-contain object-bottom block drop-shadow-[0_20px_35px_rgba(0,0,0,0.09)] transition-transform duration-500 ease-out hover:scale-[1.01]`}
                    />
                  </picture>

                  {/* Ultra-soft ambient floor reflection / shadow */}
                  <div
                    className="absolute -bottom-1 w-4/5 max-w-2xl h-5 bg-neutral-900/5 rounded-full blur-lg pointer-events-none -z-10"
                    aria-hidden="true"
                  />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation Controls & Pagination Dots (if > 1 slide in this section) ── */}
        {totalSlides > 1 && (
          <div className="w-full flex items-center justify-between z-20 py-3 pointer-events-auto">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous showcase slide"
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-neutral-700 hover:text-neutral-900 backdrop-blur-xs transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {activeSlides.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title || "Showcase"}`}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? "w-7 h-2 bg-neutral-900"
                        : "w-2 h-2 bg-neutral-400/50 hover:bg-neutral-600"
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next showcase slide"
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-neutral-700 hover:text-neutral-900 backdrop-blur-xs transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  </>
  );
}
