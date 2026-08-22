"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Truck, Lock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { DEFAULT_HERO_SLIDES } from "@/lib/data";
import { HeroSlide } from "@/lib/types";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const { motionSettings, isReducedMotion } = useSmoothScroll();

  // Subtle Apple-inspired scroll-linked hero parallax and scale
  useEffect(() => {
    if (isReducedMotion || motionSettings.enableHeroParallax === false) return;
    const heroEl = heroRef.current;
    const bgEl = heroBgRef.current;
    const contentEl = heroContentRef.current;
    if (!heroEl) return;

    const isMobile = window.innerWidth < 768;
    const maxTranslateY = isMobile ? -15 : -30;

    const ctx = gsap.context(() => {
      if (bgEl) {
        gsap.fromTo(
          bgEl,
          { scale: 1.03 },
          {
            scale: 1.0,
            ease: "none",
            scrollTrigger: {
              trigger: heroEl,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }

      if (contentEl) {
        gsap.to(contentEl, {
          y: maxTranslateY,
          opacity: 0.88,
          ease: "none",
          scrollTrigger: {
            trigger: heroEl,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isReducedMotion, motionSettings.enableHeroParallax]);

  // Real-time Firestore synchronization with fallback
  useEffect(() => {
    try {
      const q = query(collection(db, "hero_slides"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as HeroSlide));
            const activeOnly = fetched.filter((s) => s.active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            if (activeOnly.length > 0) {
              setSlides(activeOnly);
              return;
            }
          }
          setSlides(DEFAULT_HERO_SLIDES);
        },
        (err) => {
          console.warn("Firestore hero_slides listener fallback:", err);
          setSlides(DEFAULT_HERO_SLIDES);
        }
      );
      return () => unsubscribe();
    } catch {
      setSlides(DEFAULT_HERO_SLIDES);
    }
  }, []);

  // Continuous auto-play rotation every 4.5 seconds (pauses on hover)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (slides.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const desktopBg = currentSlide.desktop_image_url || currentSlide.image_url;
  const mobileBg  = currentSlide.mobile_image_url || currentSlide.image_url || desktopBg;

  // Horizontal alignment helper
  const horizAlignClass =
    currentSlide.content_horizontal_position === "center"
      ? "justify-center"
      : currentSlide.content_horizontal_position === "right"
      ? "justify-end"
      : "justify-start";

  // Vertical alignment helper (default vertically centered ~49%)
  const vertAlignClass =
    currentSlide.content_vertical_position === "top"
      ? "items-start pt-16"
      : currentSlide.content_vertical_position === "bottom"
      ? "items-end pb-16"
      : "items-center";

  // Text alignment helper
  const textAlignClass =
    currentSlide.text_align === "center"
      ? "text-center items-center"
      : currentSlide.text_align === "right"
      ? "text-right items-end"
      : "text-left items-start";

  // Container Max Width (720px desktop width default)
  const maxWClass =
    currentSlide.content_max_width === "500px"
      ? "max-w-[500px]"
      : currentSlide.content_max_width === "520px"
      ? "max-w-[520px]"
      : currentSlide.content_max_width === "570px"
      ? "max-w-[570px]"
      : currentSlide.content_max_width === "620px"
      ? "max-w-[620px]"
      : currentSlide.content_max_width === "680px"
      ? "max-w-[680px]"
      : currentSlide.content_max_width === "700px"
      ? "max-w-[700px]"
      : currentSlide.content_max_width === "760px"
      ? "max-w-[760px]"
      : currentSlide.content_max_width === "820px"
      ? "max-w-[820px]"
      : currentSlide.content_max_width === "full"
      ? "max-w-full"
      : "max-w-[720px]";

  // Heading Line 1 & Line 2 Extraction - EXACT ONCE RENDERING (No duplicated fallback)
  const rawLine1 = currentSlide.heading_line_1 !== undefined && currentSlide.heading_line_1 !== ""
    ? currentSlide.heading_line_1
    : (currentSlide.heading && !currentSlide.heading_line_2
        ? (currentSlide.heading.includes(". ") ? currentSlide.heading.split(". ")[0] + "." : currentSlide.heading)
        : "Latest Smartphones.");

  const rawLine2 = currentSlide.heading_line_2 !== undefined && currentSlide.heading_line_2 !== ""
    ? currentSlide.heading_line_2
    : (currentSlide.heading && !currentSlide.heading_line_1 && currentSlide.heading.includes(". ")
        ? currentSlide.heading.split(". ").slice(1).join(". ")
        : "Ultimate Performance.");

  // Text Case formatting helper (Default "as_typed" preserves exact admin casing)
  const formatCasing = (text: string, casing?: "as_typed" | "uppercase" | "title_case") => {
    if (!text) return "";
    if (casing === "uppercase") return text.toUpperCase();
    if (casing === "title_case") {
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    }
    return text; // "as_typed" - exact admin capitalization
  };

  const line1Text = formatCasing(rawLine1, currentSlide.heading_line_1_casing);
  const line2Text = formatCasing(rawLine2, currentSlide.heading_line_2_casing);

  const showLine1 = currentSlide.show_heading_line_1 !== false && Boolean(line1Text);
  const showLine2 = currentSlide.show_heading_line_2 !== false && Boolean(line2Text);

  const line1Color = currentSlide.heading_line_1_color || currentSlide.headingLine1Color || currentSlide.heading_color || "#FFFFFF";
  const line2Color = currentSlide.heading_line_2_color || currentSlide.headingLine2Color || currentSlide.heading_color || "#FFFFFF";

  const isWhatsAppAction = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes("whatsapp") || lower.includes("wa.me") || lower.includes("api.whatsapp");
  };

  return (
    <>
      {/* ── Mobile Hero Banner Card (Exact Reference Matching) ── */}
      <div className="md:hidden w-full bg-white px-4 pt-3 pb-2">
        <div className="relative w-full rounded-2xl bg-gradient-to-r from-[#DCE0E5] via-[#E8EBEF] to-[#F1F3F6] border border-neutral-200/80 p-5 overflow-hidden shadow-2xs min-h-[220px] flex flex-col justify-between">
          {/* Floating Studio Mockup Image */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none flex items-center justify-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800"
              alt="Titanium Flagship"
              className="w-full h-full object-contain object-right scale-110 translate-x-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = mobileBg || desktopBg || "/placeholder-phone.webp";
              }}
            />
          </div>

          {/* Left Text & CTA Content */}
          <div className="relative z-10 max-w-[62%]">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-800 block mb-1">
              FLAGSHIP LAUNCH
            </span>
            <h1 className="text-[22px] sm:text-2xl font-black text-black leading-tight tracking-tight mb-3">
              Titanium power.<br />Built for pros.
            </h1>
            <Link
              href={currentSlide.primary_button_url || "/products"}
              className="inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <span>Shop Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop Hero Section (Full-Width Cinematic Slider) ── */}
      <section
        ref={heroRef}
        className="hidden md:flex group relative w-full w-screen max-w-full bg-black overflow-hidden items-center justify-center text-white rounded-none border-none p-0 m-0 md:h-[calc(100svh-var(--navbar-height)-var(--ticker-height))] md:min-h-[calc(100svh-var(--navbar-height)-var(--ticker-height))] md:max-h-none"
        style={{
          fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      {/* ── Background Carousel Layer (100vw Edge-to-Edge with scroll-linked scale) ── */}
      <div ref={heroBgRef} className="absolute inset-0 z-0 w-full h-full overflow-hidden origin-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Desktop Background Image with subtle cinematic scale */}
            <motion.img
              key={`img-desktop-${currentIndex}`}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={desktopBg}
              alt={currentSlide.alt || line1Text || "Hero Banner"}
              className="hidden lg:block w-full h-full object-cover"
              style={{
                objectPosition: currentSlide.desktop_image_position || "center",
              }}
            />
            {/* Mobile Background Image */}
            <motion.img
              key={`img-mobile-${currentIndex}`}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={mobileBg}
              alt={currentSlide.alt || line1Text || "Hero Banner"}
              className="lg:hidden w-full h-full object-cover"
              style={{
                objectPosition: currentSlide.mobile_image_position || "center",
              }}
            />

            {/* Dynamic Admin Custom Overlay Color & Opacity */}
            <div
              className="absolute inset-0 z-10 transition-all duration-500"
              style={{
                backgroundColor: currentSlide.overlay_color || "#000000",
                opacity: (currentSlide.overlay_opacity ?? 35) / 100,
              }}
            />

            {/* Controlled Cinematic Left-to-Right Gradient (0%: 0.88 -> 42%: 0.55 -> 65%: 0.08 -> 100%: 0) */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.88)_0%,rgba(5,5,5,0.55)_42%,rgba(5,5,5,0.08)_65%,transparent_100%)] z-10 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Aligned Content Container (Matches max 1400px Navbar Logo Line with subtle scroll translation) ── */}
      <div ref={heroContentRef} className={`relative z-20 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full h-full flex ${vertAlignClass} ${horizAlignClass}`}>
        <div className={`${maxWClass} flex flex-col ${textAlignClass} w-full`} style={{ fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif" }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex flex-col ${textAlignClass} w-full`}
              style={{ fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif" }}
            >
              {/* 1. Compact Premium Eyebrow Badge (11px / 700 / 0.12em tracking / 20px bottom margin) */}
              {currentSlide.show_badge !== false && currentSlide.campaign_label && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.0 }}
                  className="inline-flex items-center gap-2 px-[13px] py-[7px] rounded-full text-[11px] font-bold tracking-[0.12em] shadow-md backdrop-blur-md mb-[20px] shrink-0"
                  style={{
                    color: currentSlide.badge_text_color || "#FFFFFF",
                    backgroundColor: currentSlide.badge_bg_color || "rgba(255, 255, 255, 0.12)",
                    fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                  }}
                >
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentSlide.campaign_label}</span>
                </motion.div>
              )}

              {/* 2. Main Dual-Line Heading (Manrope 750/800, 56px / clamp, gap 4px, 24px bottom margin) */}
              <div className="hero-heading flex flex-col gap-[2px] sm:gap-[4px] mb-[14px] sm:mb-[24px] w-full max-w-[720px]">
                {showLine1 && (
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="block leading-[1.04] tracking-[-0.045em] drop-shadow-xl break-normal whitespace-normal xl:whitespace-nowrap hyphens-none font-bold sm:font-extrabold text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] xl:text-[clamp(50px,3.4vw,62px)]"
                    style={{
                      color: line1Color,
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {line1Text}
                  </motion.span>
                )}
                {showLine2 && (
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.16 }}
                    className="block leading-[1.04] tracking-[-0.045em] drop-shadow-xl break-normal whitespace-normal xl:whitespace-nowrap hyphens-none font-bold sm:font-extrabold text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] xl:text-[clamp(50px,3.4vw,62px)]"
                    style={{
                      color: line2Color,
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {line2Text}
                  </motion.span>
                )}
              </div>

              {/* 3. Description (Manrope 500, 17px, line-height 1.6, max width 520px, 30px bottom margin) */}
              {currentSlide.show_description !== false && currentSlide.description && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24 }}
                  className="text-[13px] sm:text-[15px] md:text-[17px] leading-[1.5] font-medium max-w-[520px] line-clamp-2 md:line-clamp-none drop-shadow-md break-normal whitespace-normal hyphens-none mb-[18px] sm:mb-[30px]"
                  style={{
                    color: currentSlide.description_color || "#D1D5DB",
                    fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                  }}
                >
                  {currentSlide.description}
                </motion.p>
              )}

              {/* 4. Compact Premium CTA Buttons (Height 48px on mobile, 52px on desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className={`flex flex-row items-center gap-[10px] sm:gap-[12px] w-full sm:w-auto ${
                  currentSlide.text_align === "center" ? "justify-center" : currentSlide.text_align === "right" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Primary Solid Button */}
                {currentSlide.show_primary_button !== false && currentSlide.primary_button_text && (
                  <Link
                    href={currentSlide.primary_button_url || "/products"}
                    className="group/btn flex-1 sm:flex-initial h-[46px] sm:h-[52px] px-[20px] sm:px-[28px] rounded-[12px] font-bold text-[13px] sm:text-[14px] shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:-translate-y-[2px] active:scale-95 shrink-0"
                    style={{
                      color: currentSlide.button_text_color || "#000000",
                      backgroundColor: currentSlide.button_bg_color || "#FFFFFF",
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    <span>{currentSlide.primary_button_text}</span>
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-1">
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </Link>
                )}

                {/* Secondary Dark-Glass Bordered Button */}
                {currentSlide.show_secondary_button === true && currentSlide.secondary_button_text && (
                  <a
                    href={currentSlide.secondary_button_url || "#"}
                    target={currentSlide.secondary_button_url?.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group/sec flex-1 sm:flex-initial h-[46px] sm:h-[52px] px-[20px] sm:px-[28px] rounded-[12px] font-bold text-[13px] sm:text-[14px] border border-white/25 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer hover:-translate-y-[2px] active:scale-95 shrink-0 backdrop-blur-md"
                    style={{
                      color: currentSlide.secondary_button_text_color || "#FFFFFF",
                      backgroundColor: currentSlide.secondary_button_bg_color || "rgba(255, 255, 255, 0.1)",
                      borderColor: currentSlide.secondary_button_border_color || "rgba(255, 255, 255, 0.25)",
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {isWhatsAppAction(currentSlide.secondary_button_url) ? (
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 transition-transform duration-300 group-hover/sec:scale-110" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 transition-transform duration-300 group-hover/sec:translate-x-1" />
                    )}
                    <span>{currentSlide.secondary_button_text}</span>
                  </a>
                )}
              </motion.div>

              {/* 5. Minimal Trust Strip */}
              {currentSlide.show_trust_strip !== false && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.40 }}
                  className="mt-[16px] sm:mt-[34px] flex items-center gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none text-[11px] sm:text-[12px] font-medium text-white/70 tracking-wide pb-1"
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{currentSlide.trust_item_1 || "Genuine Products"}</span>
                  </div>
                  <span className="text-white/30 text-[10px] shrink-0">•</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{currentSlide.trust_item_2 || "Islandwide Delivery"}</span>
                  </div>
                  <span className="text-white/30 text-[10px] shrink-0">•</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{currentSlide.trust_item_3 || "Secure Payments"}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ── Glass Navigation Control Arrows (42px circle, hover reveal) ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Premium Progress Indicators (30px x 4px Pill for Active, 5px Muted Dot for Inactive) ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-[30px] h-[4px] rounded-full bg-white shadow-lg"
                    : "w-[5px] h-[5px] rounded-full bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      )}
      </section>
    </>
  );
}
