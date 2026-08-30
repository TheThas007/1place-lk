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
} from "lucide-react";
import { Review, PreLaunchExperienceSettings } from "@/lib/types";
import { reviews as defaultReviews, siteSettings } from "@/lib/data";

interface RotatingContentShowcaseProps {
  settings?: PreLaunchExperienceSettings;
  reviews?: Review[];
  galleryImages?: any[];
  freeze?: boolean;
}

// Fallback high quality showcase cards for Street Mobile store & customer moments
const FALLBACK_STORE_MOMENTS = [
  {
    id: "gm-1",
    title: "Flagship Smartphone Showcase",
    subtitle: "Apple, Samsung, Xiaomi 100% Genuine Devices with Official Warranty",
    imageUrl: "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
    tag: "STORE COLLECTION",
  },
  {
    id: "gm-2",
    title: "Premium Accessories & Gear",
    subtitle: "Anker, JBL, Sharge, Fitbit original audio & fast charging solutions",
    imageUrl: "/images/campaign-headphone-desktop.jpg",
    tag: "AUDIO & ACCESSORIES",
  },
  {
    id: "gm-3",
    title: "Today's Exclusive Deals",
    subtitle: "Special islandwide delivery & in-store celebratory bundles",
    imageUrl: "/images/today-deal-showcase.png",
    tag: "SPECIAL LAUNCH",
  },
];

export function RotatingContentShowcase({
  settings,
  reviews = defaultReviews,
  galleryImages,
  freeze = false,
}: RotatingContentShowcaseProps) {
  // ── Determine Active Enabled Screens ──
  const activeScreens = useMemo(() => {
    const screens = [
      { id: "thank_you", title: "Thank You", enabled: settings?.thankYouEnabled ?? true },
      { id: "location", title: "We Are Near You", enabled: settings?.locationEnabled ?? true },
      { id: "reviews", title: "Customer Reviews", enabled: settings?.reviewsEnabled ?? true },
      { id: "gallery", title: "Shop Visit Gallery", enabled: settings?.galleryEnabled ?? true },
      { id: "moments", title: "Customer Moments", enabled: settings?.momentsEnabled ?? true },
    ];

    const enabled = screens.filter((s) => s.enabled);
    return enabled.length > 0 ? enabled : [{ id: "thank_you", title: "Thank You", enabled: true }];
  }, [settings]);

  // Main 5-Minute Screen Index
  const [currentScreenIdx, setCurrentScreenIdx] = useState(0);

  // Internal Timers State
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);

  const rotationInterval = (settings?.rotationIntervalSeconds || 300) * 1000;
  const isAutoplay = settings?.autoplay ?? true;
  const isSwipeEnabled = settings?.swipeEnabled ?? true;

  // ── 1. MAIN SCREEN ROTATION TIMER (e.g. 5 Minutes) ──
  useEffect(() => {
    if (freeze || !isAutoplay || activeScreens.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentScreenIdx((prev) => (prev + 1) % activeScreens.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [freeze, isAutoplay, activeScreens.length, rotationInterval]);

  // ── 2. INTERNAL REVIEW CAROUSEL TIMER (4 Seconds) ──
  const safeReviews = reviews && reviews.length > 0 ? reviews : defaultReviews;
  useEffect(() => {
    if (freeze || !isAutoplay || activeScreens[currentScreenIdx]?.id !== "reviews") return;

    const reviewTimer = setInterval(() => {
      setCurrentReviewIdx((prev) => (prev + 1) % safeReviews.length);
    }, 4500);

    return () => clearInterval(reviewTimer);
  }, [freeze, isAutoplay, currentScreenIdx, activeScreens, safeReviews.length]);

  // ── 3. INTERNAL GALLERY CAROUSEL TIMER (4.5 Seconds) ──
  const storeMomentsList = useMemo(() => {
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages.map((img, idx) => ({
        id: img.id || `gallery-${idx}`,
        title: img.title || "Street Mobile Showcase",
        subtitle: img.caption || "Genuine mobile devices & expert customer support in Vavuniya",
        imageUrl: img.image_url || img.imageUrl || "/Street Mobile (980 x 360 px) (1240 x 472 px).png",
        tag: img.category || "VISIT MOMENT",
      }));
    }
    return FALLBACK_STORE_MOMENTS;
  }, [galleryImages]);

  useEffect(() => {
    if (freeze || !isAutoplay || (activeScreens[currentScreenIdx]?.id !== "gallery" && activeScreens[currentScreenIdx]?.id !== "moments")) return;

    const galleryTimer = setInterval(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % storeMomentsList.length);
    }, 4500);

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

  return (
    <div className="w-full max-w-4xl flex flex-col items-center justify-center relative select-none font-outfit mt-4 sm:mt-6 px-3">
      {/* ── Main Rotating Content Stage ── */}
      <div className="w-full min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 1: THANK YOU
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "thank_you" && (
            <motion.div
              key="screen-thank-you"
              initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#ED0712] fill-[#ED0712]" />
                <span>CUSTOMER APPRECIATION</span>
              </div>

              <h2
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-3"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
              >
                THANK YOU
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#52525B] max-w-lg leading-relaxed font-medium">
                To everyone who visited Street Mobile today.
                <br className="hidden sm:inline" />
                <span className="text-[#09090B] font-semibold"> Your support means everything to us.</span>
              </p>

              <div className="w-16 h-[1px] bg-[#E4E4E7] my-4 sm:my-5" />

              <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#71717A] uppercase">
                <span>We are near you.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED0712]" />
                <span>We are here for you.</span>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SCREEN 2: WE ARE NEAR YOU (LOCATION & CONTACT)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "location" && (
            <motion.div
              key="screen-location"
              initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#ED0712]" />
                <span>STORE LOCATION • VAVUNIYA</span>
              </div>

              <h2
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-2"
                style={{ fontSize: "clamp(1.4rem, 3.8vw, 2.5rem)" }}
              >
                WE ARE NEAR YOU
              </h2>

              <p className="text-xs sm:text-sm text-[#52525B] max-w-md font-medium mb-4">
                Your trusted mobile store, right around the corner.
              </p>

              {/* Verified Address & Contact Card */}
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
              SCREEN 3: CUSTOMER REVIEWS (REAL REVIEWS AUTO-SLIDER)
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "reviews" && (
            <motion.div
              key="screen-reviews"
              initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>WHAT OUR CUSTOMERS SAY</span>
              </div>

              {/* Active Review Card */}
              <div className="relative w-full overflow-hidden min-h-[140px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`review-${currentReviewIdx}`}
                    initial={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center text-center px-2 sm:px-6"
                  >
                    {/* 5-Star Rating */}
                    <div className="flex items-center gap-1 mb-2 text-amber-500">
                      {[...Array(safeReviews[currentReviewIdx]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-sm md:text-base text-[#18181B] font-medium italic leading-relaxed max-w-lg mb-3">
                      “{safeReviews[currentReviewIdx]?.text}”
                    </p>

                    {/* Review Author & Verification */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-[#09090B] tracking-wide">
                        {safeReviews[currentReviewIdx]?.author_name}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Customer
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Review Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
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
              SCREEN 4: SHOP VISIT GALLERY
          ═════════════════════════════════════════════════════════════════ */}
          {activeScreen.id === "gallery" && (
            <motion.div
              key="screen-gallery"
              initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#09090B]" />
                <span>A GLIMPSE FROM STREET MOBILE</span>
              </div>

              {/* Active Image Showcase Card */}
              <div className="relative w-full max-w-lg aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-[#F4F4F5] border border-[#E4E4E7] shadow-md flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`gallery-img-${currentGalleryIdx}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={storeMomentsList[currentGalleryIdx]?.imageUrl}
                      alt={storeMomentsList[currentGalleryIdx]?.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-left text-white">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#ED0712] bg-white/90 px-2 py-0.5 rounded w-fit mb-1">
                        {storeMomentsList[currentGalleryIdx]?.tag}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight">
                        {storeMomentsList[currentGalleryIdx]?.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-white/80 line-clamp-1 mt-0.5">
                        {storeMomentsList[currentGalleryIdx]?.subtitle}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Gallery Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
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
              initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center flex flex-col items-center justify-center px-4 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#ED0712] fill-[#ED0712]" />
                <span>THANK YOU FOR VISITING</span>
              </div>

              <h3
                className="font-black tracking-[0.14em] sm:tracking-[0.18em] text-[#09090B] uppercase leading-tight mb-4"
                style={{ fontSize: "clamp(1.3rem, 3.5vw, 2.2rem)" }}
              >
                Every Visit. Every Conversation. Every Customer.
              </h3>

              <p className="text-xs sm:text-sm text-[#52525B] font-medium max-w-md mb-2">
                We appreciate you choosing Street Mobile for your technology and device needs.
              </p>

              <div className="w-12 h-[1px] bg-[#E4E4E7] my-3" />

              <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-[#71717A] uppercase">
                COMMITTED TO EXCELLENCE IN VAVUNIYA
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Slide Navigation Dots & Screen Selector ── */}
      {activeScreens.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 z-10">
          <button
            type="button"
            onClick={handlePrevScreen}
            className="p-1 text-[#A1A1AA] hover:text-[#09090B] transition-colors rounded-full hover:bg-[#F4F4F5]"
            title="Previous Screen"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2">
            {activeScreens.map((screen, idx) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => setCurrentScreenIdx(idx)}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentScreenIdx
                    ? "w-7 h-2 bg-[#09090B]"
                    : "w-2 h-2 bg-[#E4E4E7] hover:bg-[#A1A1AA]"
                }`}
                title={screen.title}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextScreen}
            className="p-1 text-[#A1A1AA] hover:text-[#09090B] transition-colors rounded-full hover:bg-[#F4F4F5]"
            title="Next Screen"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default RotatingContentShowcase;
