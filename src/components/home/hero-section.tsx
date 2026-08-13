"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";
import { getHeroSlides } from "@/lib/firestore-client";
import { HeroSlide } from "@/lib/types";

/* ─── Default Fallback Hero Slides ─── */
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "default-1",
    image_url: "/hero-slide-1.png",
    desktop_image_url: "/hero-slide-1.png",
    mobile_image_url: "/hero-slide-1.png",
    alt: "Premium Mobile Experience",
    campaign_label: "YOUR TRUSTED STORE IN VAVUNIYA",
    heading: "Premium Mobile Experience.",
    description: "Latest Smartphones. Best Prices. Professional Service. Everything you need for your digital life.",
    primary_button_text: "Shop Now",
    primary_button_url: "/products",
    show_secondary_button: true,
    secondary_button_text: "Contact Us",
    secondary_button_url: generateWhatsAppUrl(),
    sort_order: 1,
    active: true,
  },
  {
    id: "default-2",
    image_url: "/hero-slide-2.png",
    desktop_image_url: "/hero-slide-2.png",
    mobile_image_url: "/hero-slide-2.png",
    alt: "Latest Smartphones Collection",
    campaign_label: "FLAGSHIP SMARTPHONES",
    heading: "Genuine & Sealed Phones.",
    description: "Official Sri Lankan Warranty on Apple, Samsung, Xiaomi & Vivo devices.",
    primary_button_text: "Explore Phones",
    primary_button_url: "/products?category=smartphones",
    show_secondary_button: false,
    sort_order: 2,
    active: true,
  },
  {
    id: "default-3",
    image_url: "/hero-slide-3.png",
    desktop_image_url: "/hero-slide-3.png",
    mobile_image_url: "/hero-slide-3.png",
    alt: "Mobile Accessories Display",
    campaign_label: "AUTHENTIC ACCESSORIES",
    heading: "High Performance Audio & Accessories.",
    description: "Earbuds, fast chargers, power banks and protective cases at unbeatable prices.",
    primary_button_text: "View Accessories",
    primary_button_url: "/products?category=accessories",
    show_secondary_button: false,
    sort_order: 3,
    active: true,
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function loadSlides() {
      try {
        const fetched = await getHeroSlides();
        const activeOnly = fetched.filter((s) => s.active !== false);
        if (activeOnly.length > 0) {
          setSlides(activeOnly);
        }
      } catch (err) {
        console.warn("Failed to load hero slides from DB:", err);
      }
    }
    loadSlides();
  }, []);

  // Auto-play interval (5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0] || defaultHeroSlides[0];

  const desktopBg = currentSlide.desktop_image_url || currentSlide.image_url || "/hero-slide-1.png";
  const mobileBg  = currentSlide.mobile_image_url || currentSlide.image_url || desktopBg;

  return (
    <section
      className="relative w-full min-h-[620px] lg:min-h-[720px] xl:min-h-[780px] bg-black overflow-hidden flex items-center justify-center text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Carousel Layer ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Desktop Background Image (Full Visibility & High Clarity) */}
          <img
            src={desktopBg}
            alt={currentSlide.alt || currentSlide.heading || "Hero Slide"}
            className="hidden lg:block w-full h-full object-cover object-center opacity-100"
          />
          {/* Mobile Background Image */}
          <img
            src={mobileBg}
            alt={currentSlide.alt || currentSlide.heading || "Hero Slide"}
            className="lg:hidden w-full h-full object-cover object-center opacity-100"
          />

          {/* Gentle Gradient Overlay for Readability while keeping image bright */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Ambient Backlight Glow ── */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none z-10" />

      {/* ── Content Container ── */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-4 lg:px-8 w-full pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-2xl text-left">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Campaign Label Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentSlide.campaign_label || "YOUR TRUSTED STORE IN VAVUNIYA"}</span>
              </div>

              {/* Slide Heading */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-md">
                {currentSlide.heading || "Premium Mobile Experience."}
              </h1>

              {/* Promo Price Highlight */}
              {currentSlide.promo_text && (
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-md shadow-lg">
                  {currentSlide.promo_text}
                </div>
              )}

              {/* Description */}
              <p className="text-neutral-300 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                {currentSlide.description || "Latest Smartphones. Best Prices. Professional Service. Everything you need for your digital life."}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={currentSlide.primary_button_url || "/products"}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-7 py-3.5 sm:py-4 rounded-xl font-bold text-base hover:bg-neutral-100 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  <span>{currentSlide.primary_button_text || "Shop Now"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {currentSlide.show_secondary_button && currentSlide.secondary_button_url && (
                  <a
                    href={currentSlide.secondary_button_url}
                    target={currentSlide.secondary_button_url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 py-3.5 sm:py-4 rounded-xl font-bold text-base hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span>{currentSlide.secondary_button_text || "Contact Us"}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ── Navigation Arrows (Visible on desktop hover) ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* ── Pagination Dots ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
