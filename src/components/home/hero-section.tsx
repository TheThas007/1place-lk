"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getHeroSlides } from "@/lib/firestore-client";
import { HeroSlide } from "@/lib/types";

export default function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
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
        console.warn("Failed to load hero slides from Firestore:", err);
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

  if (slides.length === 0) {
    return null; // Silent clean render when no active slides in DB
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

  // Vertical alignment helper (default vertically centered)
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

  // Container Max Width (760px desktop width default)
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
      : currentSlide.content_max_width === "720px"
      ? "max-w-[720px]"
      : currentSlide.content_max_width === "820px"
      ? "max-w-[820px]"
      : currentSlide.content_max_width === "full"
      ? "max-w-full"
      : "max-w-[760px]";

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
    <section
      className="relative w-full w-screen max-w-full h-[520px] sm:h-[600px] md:h-[650px] lg:h-[calc(100vh-80px)] min-h-[500px] max-h-[850px] bg-black overflow-hidden flex items-center justify-center text-white rounded-none border-none p-0 m-0"
      style={{ fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Carousel Layer (100vw Edge-to-Edge) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 z-0 w-full h-full"
        >
          {/* Desktop Background Image */}
          <img
            src={desktopBg}
            alt={currentSlide.alt || line1Text || "Hero Banner"}
            className="hidden lg:block w-full h-full object-cover"
            style={{
              objectPosition: currentSlide.desktop_image_position || "center",
            }}
          />
          {/* Mobile Background Image */}
          <img
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

          {/* Smooth Left-to-Right Dark Gradient (Strongest behind text, transparent toward phone) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Aligned Content Container (Matches max 1400px Navbar Logo Line) ── */}
      <div className={`relative z-20 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full h-full flex ${vertAlignClass} ${horizAlignClass}`}>
        <div className={`${maxWClass} flex flex-col ${textAlignClass} w-full`} style={{ fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif" }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`flex flex-col ${textAlignClass} w-full`}
              style={{ fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif" }}
            >
              {/* 1. Subtle Premium Eyebrow Badge (11px Manrope 700, 0.12em tracking, compact 8px x 13px, 18px bottom margin) */}
              {currentSlide.show_badge !== false && currentSlide.campaign_label && (
                <div
                  className="inline-flex items-center gap-2 px-[13px] py-[8px] rounded-full text-[11px] font-bold tracking-[0.12em] shadow-md backdrop-blur-md mb-[18px] shrink-0"
                  style={{
                    color: currentSlide.badge_text_color || "#FFFFFF",
                    backgroundColor: currentSlide.badge_bg_color || "rgba(255, 255, 255, 0.12)",
                    fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                  }}
                >
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentSlide.campaign_label}</span>
                </div>
              )}

              {/* 2. Main Dual-Line Heading (Exact Single Render, Manrope 800, clamp(48px, 3.25vw, 62px), xl:whitespace-nowrap, gap 3px) */}
              <div className="hero-heading flex flex-col gap-[3px] mb-[22px] w-full max-w-[760px]">
                {showLine1 && (
                  <span
                    className="block leading-[1.04] tracking-[-0.045em] drop-shadow-xl break-normal whitespace-normal xl:whitespace-nowrap hyphens-none font-extrabold text-[34px] sm:text-[42px] md:text-[50px] lg:text-[clamp(48px,3.25vw,62px)]"
                    style={{
                      color: line1Color,
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {line1Text}
                  </span>
                )}
                {showLine2 && (
                  <span
                    className="block leading-[1.04] tracking-[-0.045em] drop-shadow-xl break-normal whitespace-normal xl:whitespace-nowrap hyphens-none font-extrabold text-[34px] sm:text-[42px] md:text-[50px] lg:text-[clamp(48px,3.25vw,62px)]"
                    style={{
                      color: line2Color,
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {line2Text}
                  </span>
                )}
              </div>

              {/* 3. Description (Manrope 500, 17px, line-height 1.6, max width 520px, 30px bottom margin) */}
              {currentSlide.show_description !== false && currentSlide.description && (
                <p
                  className="text-[17px] leading-[1.6] font-medium max-w-[520px] lg:line-clamp-2 drop-shadow-md break-normal whitespace-normal hyphens-none mb-[30px]"
                  style={{
                    color: currentSlide.description_color || "#D1D5DB",
                    fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                  }}
                >
                  {currentSlide.description}
                </p>
              )}

              {/* 4. Compact Premium CTA Buttons (Height 52px, Padding 26px, Radius 10px, 14px 700 weight, 12px gap) */}
              <div className={`flex flex-col sm:flex-row items-center gap-[12px] w-full sm:w-auto ${
                currentSlide.text_align === "center" ? "justify-center" : currentSlide.text_align === "right" ? "justify-end" : "justify-start"
              }`}>
                {/* Primary Solid Button */}
                {currentSlide.show_primary_button !== false && currentSlide.primary_button_text && (
                  <Link
                    href={currentSlide.primary_button_url || "/products"}
                    className="group w-full sm:w-auto h-[52px] px-[26px] rounded-[10px] font-bold text-[14px] shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
                    style={{
                      color: currentSlide.button_text_color || "#000000",
                      backgroundColor: currentSlide.button_bg_color || "#FFFFFF",
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    <span>{currentSlide.primary_button_text}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}

                {/* Secondary Transparent Bordered Button */}
                {currentSlide.show_secondary_button === true && currentSlide.secondary_button_text && (
                  <a
                    href={currentSlide.secondary_button_url || "#"}
                    target={currentSlide.secondary_button_url?.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group w-full sm:w-auto h-[52px] px-[26px] rounded-[10px] font-bold text-[14px] border border-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0 backdrop-blur-md"
                    style={{
                      color: currentSlide.secondary_button_text_color || "#FFFFFF",
                      backgroundColor: currentSlide.secondary_button_bg_color || "rgba(255, 255, 255, 0.1)",
                      borderColor: currentSlide.secondary_button_border_color || "rgba(255, 255, 255, 0.2)",
                      fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
                    }}
                  >
                    {isWhatsAppAction(currentSlide.secondary_button_url) ? (
                      <MessageCircle className="w-4 h-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <ArrowRight className="w-4 h-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                    <span>{currentSlide.secondary_button_text}</span>
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
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* ── Pagination Dots ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
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
