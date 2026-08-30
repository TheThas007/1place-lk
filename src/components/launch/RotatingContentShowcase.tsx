"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Images,
  MapPin,
  Phone,
  Clock,
  Store,
} from "lucide-react";
import { Review, PreLaunchExperienceSettings } from "@/lib/types";
import { reviews as defaultReviews, siteSettings } from "@/lib/data";

interface RotatingContentShowcaseProps {
  settings?: PreLaunchExperienceSettings;
  reviews?: Review[];
  galleryImages?: any[];
  freeze?: boolean;
}

// Fallback high quality showcase images from Street Mobile
const FALLBACK_STORE_MOMENTS = [
  {
    id: "gm-1",
    title: "Flagship Smartphones & Devices",
    subtitle: "Apple, Samsung, Xiaomi 100% Genuine Devices with Official Warranty",
    imageUrl: "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
    tag: "STORE COLLECTION",
  },
  {
    id: "gm-2",
    title: "Premium Accessories & Audio Gear",
    subtitle: "Anker, JBL, Sharge, Fitbit original fast chargers & earbuds",
    imageUrl: "/images/campaign-headphone-desktop.jpg",
    tag: "AUDIO & ACCESSORIES",
  },
  {
    id: "gm-3",
    title: "Special Celebratory Launch Bundles",
    subtitle: "Exclusive islandwide delivery & in-store opening promotions",
    imageUrl: "/images/today-deal-showcase.png",
    tag: "SPECIAL LAUNCH",
  },
  {
    id: "gm-4",
    title: "Certified Repair & Service Center",
    subtitle: "Precision screen replacement and expert technical diagnostics",
    imageUrl: "/images/today-deal-phone-card.png",
    tag: "REPAIR SERVICES",
  },
];

export function RotatingContentShowcase({
  settings,
  reviews = defaultReviews,
  galleryImages,
  freeze = false,
}: RotatingContentShowcaseProps) {
  // Enabled flags from Admin Settings
  const isGalleryEnabled = settings?.galleryEnabled ?? true;
  const isReviewsEnabled = settings?.reviewsEnabled ?? true;
  const isLocationEnabled = settings?.locationEnabled ?? true;
  const isAutoplay = settings?.autoplay ?? true;

  const hasAnyShowcase = isGalleryEnabled || isReviewsEnabled;

  // Determine starting view
  const defaultView = hasAnyShowcase ? "showcase" : isLocationEnabled ? "near_you" : "none";
  const [currentView, setCurrentView] = useState<"showcase" | "near_you" | "none">(defaultView);

  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync current view if toggles change in admin preview
  useEffect(() => {
    if (!hasAnyShowcase && isLocationEnabled) {
      setCurrentView("near_you");
    } else if (hasAnyShowcase && !isLocationEnabled) {
      setCurrentView("showcase");
    } else if (!hasAnyShowcase && !isLocationEnabled) {
      setCurrentView("none");
    }
  }, [hasAnyShowcase, isLocationEnabled]);

  // ── 1. PREPARE REVIEWS LIST ──
  const safeReviews = useMemo(() => {
    if (reviews && reviews.length > 0) {
      const active = reviews.filter((r) => r.visible !== false);
      if (active.length > 0) return active;
    }
    return defaultReviews;
  }, [reviews]);

  // ── 2. PREPARE GALLERY LIST ──
  const storeMomentsList = useMemo(() => {
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages.map((img, idx) => ({
        id: img.id || `gallery-${idx}`,
        title: img.title || img.caption || "Happy Customer",
        subtitle: img.caption || img.title || "Street Mobile Customer Experience",
        imageUrl: img.image_url || img.imageUrl || "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
        tag: img.category || "CUSTOMERS",
      }));
    }
    return FALLBACK_STORE_MOMENTS;
  }, [galleryImages]);

  // ── 3. INTERNAL GOOGLE REVIEWS AUTOPLAY (4 Seconds) ──
  useEffect(() => {
    if (freeze || !isAutoplay || isPaused || currentView !== "showcase" || !isReviewsEnabled || safeReviews.length <= 1)
      return;

    const reviewTimer = setInterval(() => {
      setCurrentReviewIdx((prev) => (prev + 1) % safeReviews.length);
    }, 4000);

    return () => clearInterval(reviewTimer);
  }, [freeze, isAutoplay, isPaused, currentView, isReviewsEnabled, safeReviews.length]);

  // ── 4. INTERNAL STORE GALLERY AUTOPLAY (4 Seconds) ──
  useEffect(() => {
    if (freeze || !isAutoplay || isPaused || currentView !== "showcase" || !isGalleryEnabled || storeMomentsList.length <= 1)
      return;

    const galleryTimer = setInterval(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % storeMomentsList.length);
    }, 4000);

    return () => clearInterval(galleryTimer);
  }, [freeze, isAutoplay, isPaused, currentView, isGalleryEnabled, storeMomentsList.length]);

  // ── 5. FULL ROTATION: SHOWCASE (24s) -> WE ARE NEAR YOU (12s) -> REPEAT ──
  useEffect(() => {
    if (freeze || !isAutoplay || isPaused) return;
    if (!hasAnyShowcase || !isLocationEnabled) return; // Don't rotate if only one mode is active

    const intervalTime = currentView === "showcase" ? 24000 : 12000;

    const switchTimer = setTimeout(() => {
      setCurrentView((prev) => (prev === "showcase" ? "near_you" : "showcase"));
    }, intervalTime);

    return () => clearTimeout(switchTimer);
  }, [freeze, isAutoplay, isPaused, currentView, hasAnyShowcase, isLocationEnabled]);

  // Manual review controls
  const handlePrevReview = () => {
    setCurrentReviewIdx((prev) => (prev === 0 ? safeReviews.length - 1 : prev - 1));
  };
  const handleNextReview = () => {
    setCurrentReviewIdx((prev) => (prev + 1) % safeReviews.length);
  };

  // Manual gallery controls
  const handlePrevGallery = () => {
    setCurrentGalleryIdx((prev) => (prev === 0 ? storeMomentsList.length - 1 : prev - 1));
  };
  const handleNextGallery = () => {
    setCurrentGalleryIdx((prev) => (prev + 1) % storeMomentsList.length);
  };

  if (!hasAnyShowcase && !isLocationEnabled) {
    return null; // All sections disabled by admin
  }

  // Grid layout class based on which cards are enabled
  const gridClasses =
    isGalleryEnabled && isReviewsEnabled
      ? "grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 lg:gap-8"
      : "max-w-2xl mx-auto";

  return (
    <div
      className="w-full max-w-[1400px] mx-auto select-none font-outfit"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════════
            VIEW 1: STORE GALLERY & GOOGLE REVIEWS SHOWCASE
        ═══════════════════════════════════════════════════════════════════ */}
        {currentView === "showcase" && hasAnyShowcase && (
          <motion.div
            key="view-showcase"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full text-left items-stretch ${gridClasses}`}
          >
            {/* ── CARD 1: STORE GALLERY (ONLY IF ENABLED) ── */}
            {isGalleryEnabled && (
              <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all h-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-4 sm:mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                      <Images className="w-4 h-4 text-[#ED0712]" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#090909] uppercase tracking-[0.15em]">
                        STORE GALLERY
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#6B7280] font-medium">
                        Vavuniya Store Experience
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-xs font-mono font-bold text-[#6B7280] bg-[#F4F4F5] px-2.5 py-1 rounded-full">
                    {currentGalleryIdx + 1} / {storeMomentsList.length}
                  </span>
                </div>

                {/* Large Uncropped Image Showcase Area */}
                <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden bg-[#18181B] border border-[#E8E8E8] shadow-sm flex items-center justify-center group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`gallery-${currentGalleryIdx}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
                    >
                      {/* Ambient Blurred Background */}
                      <img
                        src={storeMomentsList[currentGalleryIdx]?.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                      />

                      {/* Main Crystal-Clear Uncropped Foreground Photo */}
                      <img
                        src={storeMomentsList[currentGalleryIdx]?.imageUrl}
                        alt={storeMomentsList[currentGalleryIdx]?.title}
                        className="relative z-[1] w-full h-full object-contain"
                        loading="lazy"
                      />

                      {/* Bottom Caption Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5 text-white z-[2]">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#ED0712] bg-white px-2 py-0.5 rounded shadow-sm w-fit mb-1 block">
                          {storeMomentsList[currentGalleryIdx]?.tag}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold leading-tight text-white line-clamp-1">
                          {storeMomentsList[currentGalleryIdx]?.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 mt-0.5 font-medium">
                          {storeMomentsList[currentGalleryIdx]?.subtitle}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <button
                    type="button"
                    onClick={handlePrevGallery}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#090909] shadow-md flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextGallery}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#090909] shadow-md flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {storeMomentsList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentGalleryIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentGalleryIdx ? "w-6 bg-[#090909]" : "w-1.5 bg-[#E5E7EB] hover:bg-[#9CA3AF]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 2: GOOGLE REVIEWS (ONLY IF ENABLED) ── */}
            {isReviewsEnabled && (
              <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all h-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-4 sm:mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Star className="w-4 h-4 text-[#ED0712] fill-[#ED0712]" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#090909] uppercase tracking-[0.15em]">
                        GOOGLE REVIEWS
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#6B7280] font-medium">
                        Verified Customer Feedback
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black">
                    <span>5.0</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </div>
                </div>

                {/* Large Review Showcase Area */}
                <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-2xl bg-[#F9FAFB] border border-[#E8E8E8] p-6 sm:p-8 flex flex-col justify-between shadow-sm overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`review-${currentReviewIdx}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="flex flex-col justify-between h-full w-full"
                    >
                      {/* 5-Star Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(safeReviews[currentReviewIdx]?.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-500" />
                          ))}
                        </div>

                        <span className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Customer
                        </span>
                      </div>

                      {/* Review Text */}
                      <div className="my-auto py-3">
                        <p className="text-base sm:text-lg md:text-xl text-[#18181B] font-medium italic leading-relaxed line-clamp-5">
                          “{safeReviews[currentReviewIdx]?.text}”
                        </p>
                      </div>

                      {/* Reviewer Details */}
                      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <h5 className="text-sm sm:text-base font-extrabold text-[#090909]">
                            {safeReviews[currentReviewIdx]?.author_name}
                          </h5>
                          <span className="text-[11px] text-[#6B7280]">
                            {safeReviews[currentReviewIdx]?.review_date || "Google Review"}
                          </span>
                        </div>

                        <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] tracking-wider uppercase">
                          Google Verified
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Left & Right Review Arrows */}
                  <button
                    type="button"
                    onClick={handlePrevReview}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#090909] shadow-sm flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100"
                    title="Previous Review"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextReview}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#090909] shadow-sm flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100"
                    title="Next Review"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {safeReviews.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentReviewIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentReviewIdx ? "w-6 bg-[#090909]" : "w-1.5 bg-[#E5E7EB] hover:bg-[#9CA3AF]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            VIEW 2: BIG BOLD "WE ARE NEAR YOU" (ONLY IF ENABLED)
        ═══════════════════════════════════════════════════════════════════ */}
        {currentView === "near_you" && isLocationEnabled && (
          <motion.div
            key="view-near-you"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4 py-4 sm:py-6"
          >
            {/* Top Micro-badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E8E8E8] text-[#6B7280] text-[11px] sm:text-xs font-extrabold tracking-[0.25em] uppercase mb-4 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#ED0712]" />
              <span>VAVUNIYA STORE LOCATION</span>
            </div>

            {/* Big Bold Headline */}
            <h2
              className="font-black tracking-[0.12em] sm:tracking-[0.16em] text-[#090909] uppercase leading-tight mb-3"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.75rem)" }}
            >
              WE ARE NEAR YOU
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#4B5563] max-w-xl font-medium leading-relaxed mb-6">
              Your premier destination for 100% genuine Apple, Samsung, and Xiaomi flagship devices with islandwide warranty.
            </p>

            {/* Apple-Style Information Card */}
            <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5 text-[#ED0712]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Store Address</h4>
                  <p className="text-sm sm:text-base font-extrabold text-[#090909] leading-snug">
                    {siteSettings.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F0F0F0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#090909]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase block">Phone Contact</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#090909]">{siteSettings.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#090909]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase block">Business Hours</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#090909]">
                      {siteSettings.business_hours.weekdays}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Subtle Trust Note */}
            <div className="flex items-center gap-3 mt-6 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#6B7280] uppercase">
              <span>Always Genuine.</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED0712]" />
              <span>Always Near You.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Switcher Pill (Only if both modes are active) ── */}
      {hasAnyShowcase && isLocationEnabled && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            type="button"
            onClick={() => setCurrentView("showcase")}
            className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase transition-all duration-300 ${
              currentView === "showcase"
                ? "bg-[#090909] text-white shadow-sm"
                : "bg-[#F4F4F5] text-[#6B7280] hover:text-[#090909]"
            }`}
          >
            Gallery & Reviews
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("near_you")}
            className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase transition-all duration-300 ${
              currentView === "near_you"
                ? "bg-[#090909] text-white shadow-sm"
                : "bg-[#F4F4F5] text-[#6B7280] hover:text-[#090909]"
            }`}
          >
            We Are Near You
          </button>
        </div>
      )}
    </div>
  );
}

export default RotatingContentShowcase;
