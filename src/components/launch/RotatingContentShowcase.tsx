"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Store,
  Images,
  Quote,
  Flame,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Review, PreLaunchExperienceSettings } from "@/lib/types";
import { reviews as defaultReviews, siteSettings } from "@/lib/data";

interface RotatingContentShowcaseProps {
  settings?: PreLaunchExperienceSettings;
  reviews?: Review[];
  galleryImages?: any[];
  freeze?: boolean;
}

// Curated high quality showcase fallback images from Street Mobile
const FALLBACK_STORE_MOMENTS = [
  {
    id: "gm-1",
    title: "Flagship Smartphones & Unboxings",
    subtitle: "Apple, Samsung, Xiaomi 100% Genuine Devices with Official Warranty",
    imageUrl: "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
    tag: "STORE GALLERY",
  },
  {
    id: "gm-2",
    title: "Premium Accessories & Audio Gear",
    subtitle: "Anker, JBL, Sharge, Fitbit original fast charging & wireless sound",
    imageUrl: "/images/campaign-headphone-desktop.jpg",
    tag: "STORE COLLECTION",
  },
  {
    id: "gm-3",
    title: "Celebratory Launch Offers",
    subtitle: "Exclusive bundle discounts and fast islandwide delivery across Sri Lanka",
    imageUrl: "/images/today-deal-showcase.png",
    tag: "SPECIAL LAUNCH",
  },
  {
    id: "gm-4",
    title: "Expert Repair & Service Lab",
    subtitle: "Certified technician repairs, OEM parts & precision screen fitting",
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
  // Mode: "dual_stream" (Side-by-side animated scroll) or "focus_slide" (5-minute rotating screens)
  const [viewMode, setViewMode] = useState<"dual_stream" | "focus_slide">("dual_stream");

  // ── Determine Active Enabled Screens ──
  const activeScreens = useMemo(() => {
    const screens = [
      { id: "stream", title: "Live Feed", enabled: true },
      { id: "thank_you", title: "Thank You", enabled: settings?.thankYouEnabled ?? true },
      { id: "location", title: "Near You", enabled: settings?.locationEnabled ?? true },
      { id: "reviews", title: "Reviews", enabled: settings?.reviewsEnabled ?? true },
      { id: "gallery", title: "Gallery", enabled: settings?.galleryEnabled ?? true },
      { id: "moments", title: "Moments", enabled: settings?.momentsEnabled ?? true },
    ];

    const enabled = screens.filter((s) => s.enabled);
    return enabled.length > 0 ? enabled : [{ id: "stream", title: "Live Feed", enabled: true }];
  }, [settings]);

  // Main 5-Minute Screen Index
  const [currentScreenIdx, setCurrentScreenIdx] = useState(0);

  // Internal Carousel Timers State
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const rotationInterval = (settings?.rotationIntervalSeconds || 300) * 1000;
  const isAutoplay = settings?.autoplay ?? true;

  // ── 1. MAIN SCREEN ROTATION TIMER (e.g. 5 Minutes) ──
  useEffect(() => {
    if (freeze || !isAutoplay || isPaused || activeScreens.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentScreenIdx((prev) => (prev + 1) % activeScreens.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [freeze, isAutoplay, isPaused, activeScreens.length, rotationInterval]);

  // ── 2. PREPARE REVIEWS LIST ──
  const safeReviews = useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews.filter((r) => r.visible !== false);
    }
    return defaultReviews;
  }, [reviews]);

  // ── 3. PREPARE GALLERY LIST ──
  const storeMomentsList = useMemo(() => {
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages.map((img, idx) => ({
        id: img.id || `gallery-${idx}`,
        title: img.title || img.caption || "Street Mobile Store Showcase",
        subtitle: img.caption || img.title || "Genuine mobile devices & expert customer support in Vavuniya",
        imageUrl: img.image_url || img.imageUrl || "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
        tag: img.category || "STORE GALLERY",
      }));
    }
    return FALLBACK_STORE_MOMENTS;
  }, [galleryImages]);

  // Internal review timer
  useEffect(() => {
    if (freeze || !isAutoplay || activeScreens[currentScreenIdx]?.id !== "reviews" || safeReviews.length <= 1) return;

    const reviewTimer = setInterval(() => {
      setCurrentReviewIdx((prev) => (prev + 1) % safeReviews.length);
    }, 4000);

    return () => clearInterval(reviewTimer);
  }, [freeze, isAutoplay, currentScreenIdx, activeScreens, safeReviews.length]);

  // Internal gallery timer
  useEffect(() => {
    if (
      freeze ||
      !isAutoplay ||
      (activeScreens[currentScreenIdx]?.id !== "gallery" && activeScreens[currentScreenIdx]?.id !== "moments") ||
      storeMomentsList.length <= 1
    ) {
      return;
    }

    const galleryTimer = setInterval(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % storeMomentsList.length);
    }, 4000);

    return () => clearInterval(galleryTimer);
  }, [freeze, isAutoplay, currentScreenIdx, activeScreens, storeMomentsList.length]);

  // Manual navigation handlers
  const handlePrevScreen = () => {
    setCurrentScreenIdx((prev) => (prev === 0 ? activeScreens.length - 1 : prev - 1));
  };
  const handleNextScreen = () => {
    setCurrentScreenIdx((prev) => (prev + 1) % activeScreens.length);
  };

  const activeScreen = activeScreens[currentScreenIdx] || activeScreens[0];

  // Quad-duplicated lists for smooth continuous vertical scrolling loops
  const streamReviews = useMemo(() => [...safeReviews, ...safeReviews, ...safeReviews, ...safeReviews], [safeReviews]);
  const streamGallery = useMemo(() => [...storeMomentsList, ...storeMomentsList, ...storeMomentsList, ...storeMomentsList], [storeMomentsList]);

  return (
    <div
      className="w-full max-w-5xl flex flex-col items-center justify-center relative select-none font-outfit mt-2 sm:mt-4 px-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── View Selector Pill ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] mb-3 sm:mb-4 shadow-sm z-20">
        {activeScreens.map((screen, idx) => (
          <button
            key={screen.id}
            type="button"
            onClick={() => setCurrentScreenIdx(idx)}
            className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase transition-all duration-300 ${
              idx === currentScreenIdx
                ? "bg-[#09090B] text-white shadow-sm"
                : "text-[#71717A] hover:text-[#09090B] hover:bg-white/60"
            }`}
          >
            {screen.title}
          </button>
        ))}
      </div>

      {/* ── Main Content Stage ── */}
      <div className="w-full min-h-[290px] sm:min-h-[330px] flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {/* ═════════════════════════════════════════════════════════════════
              SCREEN: DUAL STREAM (GALLERY TOP-TO-BOTTOM + REVIEWS BOTTOM-TO-TOP)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "stream" && (
            <motion.div
              key="screen-dual-stream"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 relative"
            >
              {/* ── LEFT COLUMN: STORE GALLERY (SCROLLING TOP TO BOTTOM) ── */}
              <div className="flex flex-col h-[270px] sm:h-[310px] bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl sm:rounded-3xl p-3 sm:p-4 overflow-hidden relative shadow-sm">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] z-10 bg-[#FAFAFA]/95 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-[#09090B] tracking-wider uppercase">
                    <Images className="w-3.5 h-3.5 text-[#ED0712]" />
                    <span>Store Gallery</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#71717A] flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E4E4E7]">
                    <ArrowDown className="w-3 h-3 text-[#ED0712] animate-bounce" /> Top to Bottom
                  </span>
                </div>

                {/* Top/Bottom Fade Gradients */}
                <div className="absolute top-10 left-0 right-0 h-6 bg-gradient-to-b from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

                {/* Animated Vertical Stream (Top to Bottom) */}
                <div className="relative flex-1 overflow-hidden pt-2">
                  <motion.div
                    animate={freeze ? {} : { y: ["-50%", "0%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: isPaused ? 80 : 30,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-3"
                  >
                    {streamGallery.map((item, idx) => (
                      <div
                        key={`gallery-stream-${idx}`}
                        className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-sm flex items-center gap-3 p-2 group hover:border-[#09090B] transition-all"
                      >
                        <div className="w-16 sm:w-20 aspect-video rounded-lg overflow-hidden shrink-0 bg-[#F4F4F5]">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-[8px] font-extrabold text-[#ED0712] uppercase tracking-wider block">
                            {item.tag}
                          </span>
                          <h5 className="text-[11px] sm:text-xs font-bold text-[#09090B] truncate leading-snug">
                            {item.title}
                          </h5>
                          <p className="text-[9px] sm:text-[10px] text-[#71717A] truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: GOOGLE REVIEWS (SCROLLING BOTTOM TO TOP) ── */}
              <div className="flex flex-col h-[270px] sm:h-[310px] bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl sm:rounded-3xl p-3 sm:p-4 overflow-hidden relative shadow-sm">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] z-10 bg-[#FAFAFA]/95 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-[#09090B] tracking-wider uppercase">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Google Reviews</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#71717A] flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E4E4E7]">
                    <ArrowUp className="w-3 h-3 text-amber-500 animate-bounce" /> Bottom to Top
                  </span>
                </div>

                {/* Top/Bottom Fade Gradients */}
                <div className="absolute top-10 left-0 right-0 h-6 bg-gradient-to-b from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

                {/* Animated Vertical Stream (Bottom to Top) */}
                <div className="relative flex-1 overflow-hidden pt-2">
                  <motion.div
                    animate={freeze ? {} : { y: ["0%", "-50%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: isPaused ? 80 : 32,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-3"
                  >
                    {streamReviews.map((item, idx) => (
                      <div
                        key={`review-stream-${idx}`}
                        className="bg-white border border-[#E4E4E7] rounded-xl p-2.5 sm:p-3 shadow-sm text-left group hover:border-[#09090B] transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(item.rating || 5)].map((_, s) => (
                              <Star key={s} className="w-3 h-3 fill-amber-500" />
                            ))}
                          </div>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-[#18181B] font-medium italic line-clamp-2 leading-relaxed">
                          “{item.text}”
                        </p>
                        <div className="mt-1 pt-1 border-t border-[#F4F4F5] flex items-center justify-between text-[9px] text-[#71717A]">
                          <span className="font-bold text-[#09090B]">{item.author_name}</span>
                          <span>Google Review</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 1: THANK YOU
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "thank_you" && (
            <motion.div
              key="screen-thank-you"
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 py-2"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#ED0712] fill-[#ED0712]" />
                <span>CUSTOMER APPRECIATION</span>
              </div>

              <h2
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-2.5"
                style={{ fontSize: "clamp(1.4rem, 3.8vw, 2.5rem)" }}
              >
                THANK YOU
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#52525B] max-w-lg leading-relaxed font-medium">
                To everyone who visited Street Mobile today.
                <br className="hidden sm:inline" />
                <span className="text-[#09090B] font-semibold"> Your support means everything to us.</span>
              </p>

              <div className="w-16 h-[1px] bg-[#E4E4E7] my-3.5 sm:my-4" />

              <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#71717A] uppercase">
                <span>We are near you.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED0712]" />
                <span>We are here for you.</span>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 2: WE ARE NEAR YOU (STORE LOCATION & CONTACT)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "location" && (
            <motion.div
              key="screen-location"
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 py-2"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#ED0712]" />
                <span>STORE LOCATION • VAVUNIYA</span>
              </div>

              <h2
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-2"
                style={{ fontSize: "clamp(1.35rem, 3.5vw, 2.35rem)" }}
              >
                WE ARE NEAR YOU
              </h2>

              <p className="text-xs sm:text-sm text-[#52525B] max-w-md font-medium mb-3.5">
                Your trusted mobile store, right around the corner.
              </p>

              {/* Verified Address Card */}
              <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-4 sm:p-5 max-w-xl w-full text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-[#09090B] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-[#09090B] leading-snug">
                      {siteSettings.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#71717A]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-[#ED0712]" />
                        {siteSettings.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                        {siteSettings.business_hours.weekdays}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 3: GOOGLE REVIEWS (AUTOPLAY BOTTOM-TO-TOP REVEAL)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "reviews" && (
            <motion.div
              key="screen-reviews"
              initial={{ opacity: 0, y: 25, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -25, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-2 sm:px-4 max-w-2xl"
            >
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2.5 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>GOOGLE REVIEWS • 5.0 RATING</span>
              </div>

              {/* Active Review Card with Navigation Arrows */}
              <div className="relative w-full flex items-center justify-between gap-1 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentReviewIdx((prev) => (prev === 0 ? safeReviews.length - 1 : prev - 1))}
                  className="p-1.5 sm:p-2 text-[#A1A1AA] hover:text-[#09090B] hover:bg-[#F4F4F5] rounded-full transition-all shrink-0"
                  title="Previous Review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative flex-1 overflow-hidden min-h-[145px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`review-${currentReviewIdx}`}
                      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="flex flex-col items-center text-center px-1 sm:px-4 w-full"
                    >
                      {/* 5-Star Rating */}
                      <div className="flex items-center gap-1 mb-2 text-amber-500">
                        {[...Array(safeReviews[currentReviewIdx]?.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>

                      {/* Review Quote */}
                      <p className="text-xs sm:text-sm md:text-base text-[#18181B] font-medium italic leading-relaxed max-w-lg mb-3 line-clamp-3">
                        “{safeReviews[currentReviewIdx]?.text}”
                      </p>

                      {/* Review Author & Verification */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-[#09090B] tracking-wide">
                          {safeReviews[currentReviewIdx]?.author_name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Review
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentReviewIdx((prev) => (prev + 1) % safeReviews.length)}
                  className="p-1.5 sm:p-2 text-[#A1A1AA] hover:text-[#09090B] hover:bg-[#F4F4F5] rounded-full transition-all shrink-0"
                  title="Next Review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Review Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                {safeReviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentReviewIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentReviewIdx ? "w-6 bg-[#09090B]" : "w-1.5 bg-[#D4D4D8] hover:bg-[#A1A1AA]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 4: STORE GALLERY (TOP-TO-BOTTOM VISUAL REVEAL)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "gallery" && (
            <motion.div
              key="screen-gallery"
              initial={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-2 sm:px-4 max-w-2xl"
            >
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2.5 shadow-sm">
                <Images className="w-3.5 h-3.5 text-[#09090B]" />
                <span>STORE GALLERY • VAVUNIYA</span>
              </div>

              {/* Large Image Showcase Card */}
              <div className="relative w-full max-w-md sm:max-w-lg aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-[#F4F4F5] border border-[#E4E4E7] shadow-md flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`gallery-img-${currentGalleryIdx}`}
                    initial={{ opacity: 0, y: -12, scale: 1.04 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={storeMomentsList[currentGalleryIdx]?.imageUrl}
                      alt={storeMomentsList[currentGalleryIdx]?.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5 sm:p-4 text-left text-white">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#ED0712] bg-white/95 px-2 py-0.5 rounded shadow-sm">
                          {storeMomentsList[currentGalleryIdx]?.tag}
                        </span>
                        <span className="text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {currentGalleryIdx + 1} / {storeMomentsList.length}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                        {storeMomentsList[currentGalleryIdx]?.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-white/80 line-clamp-1 mt-0.5">
                        {storeMomentsList[currentGalleryIdx]?.subtitle}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Arrows on Card */}
                <button
                  type="button"
                  onClick={() => setCurrentGalleryIdx((prev) => (prev === 0 ? storeMomentsList.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all z-10"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentGalleryIdx((prev) => (prev + 1) % storeMomentsList.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all z-10"
                  title="Next Photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Gallery Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                {storeMomentsList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentGalleryIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentGalleryIdx ? "w-6 bg-[#09090B]" : "w-1.5 bg-[#D4D4D8] hover:bg-[#A1A1AA]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 5: CUSTOMER MOMENTS
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "moments" && (
            <motion.div
              key="screen-moments"
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#ED0712] fill-[#ED0712]" />
                <span>THANK YOU FOR VISITING</span>
              </div>

              <h3
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-3"
                style={{ fontSize: "clamp(1.25rem, 3.2vw, 2.1rem)" }}
              >
                Every Visit. Every Conversation. Every Customer.
              </h3>

              <p className="text-xs sm:text-sm text-[#52525B] font-medium max-w-md mb-2">
                We appreciate you choosing Street Mobile for your technology and device needs.
              </p>

              <div className="w-12 h-[1px] bg-[#E4E4E7] my-2.5" />

              <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-[#71717A] uppercase">
                COMMITTED TO EXCELLENCE IN VAVUNIYA
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RotatingContentShowcase;
