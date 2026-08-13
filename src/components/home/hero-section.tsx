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
      className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] lg:h-[650px] xl:h-[700px] bg-black overflow-hidden flex items-center justify-center text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Carousel Layer ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Desktop Background Image */}
          <img
            src={desktopBg}
            alt={currentSlide.alt || currentSlide.heading || "Hero Slide"}
            className="hidden lg:block w-full h-full object-cover object-center"
          />
          {/* Mobile Background Image */}
          <img
            src={mobileBg}
            alt={currentSlide.alt || currentSlide.heading || "Hero Slide"}
            className="lg:hidden w-full h-full object-cover object-center"
          />

          {/* Dynamic Admin Custom Overlay Color & Opacity */}
          <div
            className="absolute inset-0 z-10 transition-all duration-500"
            style={{
              backgroundColor: currentSlide.overlay_color || "#000000",
              opacity: (currentSlide.overlay_opacity ?? 35) / 100,
            }}
          />

          {/* Soft Left Side Shadow Gradient for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Ambient Backlight Glow ── */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none z-10" />

      {/* ── Content Container ── */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl text-left">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-3.5"
            >
              {/* Campaign Label Badge */}
              {currentSlide.campaign_label && (
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md"
                  style={{
                    color: currentSlide.badge_text_color || "#FFFFFF",
                    backgroundColor: currentSlide.badge_bg_color || "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentSlide.campaign_label}</span>
                </div>
              )}

              {/* Slide Heading */}
              {currentSlide.heading && (
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight drop-shadow-lg"
                  style={{ color: currentSlide.heading_color || "#FFFFFF" }}
                >
                  {currentSlide.heading}
                </h1>
              )}

              {/* Promo Price Highlight */}
              {currentSlide.promo_text && (
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-md shadow-lg">
                  {currentSlide.promo_text}
                </div>
              )}

              {/* Description */}
              {currentSlide.description && (
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-medium drop-shadow-sm"
                  style={{ color: currentSlide.description_color || "#D1D5DB" }}
                >
                  {currentSlide.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {currentSlide.primary_button_text && (
                  <Link
                    href={currentSlide.primary_button_url || "/products"}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    style={{
                      color: currentSlide.button_text_color || "#000000",
                      backgroundColor: currentSlide.button_bg_color || "#FFFFFF",
                    }}
                  >
                    <span>{currentSlide.primary_button_text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {currentSlide.show_secondary_button && currentSlide.secondary_button_url && (
                  <a
                    href={currentSlide.secondary_button_url}
                    target={currentSlide.secondary_button_url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{currentSlide.secondary_button_text || "Contact Us"}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ── Navigation Arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* ── Pagination Dots ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
