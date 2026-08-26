"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Category } from "@/lib/types";
import { categories as fallbackCategories } from "@/lib/data";

interface ShopByCategoryCarouselProps {
  categories?: Category[];
}

// Built-in crisp vector icons for website categories
function renderCategoryDefaultIcon(name: string, slug: string) {
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (s.includes("adapter") || s.includes("charger") || n.includes("adapter")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (s.includes("battery") || n.includes("battery")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="2" y="7" width="16" height="10" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="22" y1="11" x2="22" y2="13" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="11" x2="6" y2="13" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="11" x2="10" y2="13" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (s.includes("earbud") || s.includes("bud") || n.includes("bud") || s.includes("tws")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    );
  }
  if (s.includes("cable") || n.includes("cable")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 12h8m-8 5h8M4 6h16M4 18h16" />
      </svg>
    );
  }
  if (s.includes("screen") || s.includes("display") || n.includes("display")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (s.includes("headphone") || n.includes("headphone")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm18 0a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z" />
      </svg>
    );
  }
  if (s.includes("keyboard") || n.includes("keyboard") || n.includes("keybord")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    );
  }
  if (s.includes("mouse") || n.includes("mouse")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    );
  }
  if (s.includes("laptop") || n.includes("laptop")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (s.includes("tablet") || s.includes("tab") || n.includes("tab")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (s.includes("power") || n.includes("power")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (s.includes("watch") || n.includes("watch")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (s.includes("phone") || s.includes("smartphones") || n.includes("smartphone")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="5" y="2" width="14" height="20" rx="3" ry="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (s.includes("speaker") || n.includes("speaker")) {
    return (
      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Default fallback smartphone/device SVG
  return (
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="5" y="2" width="14" height="20" rx="3" ry="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ShopByCategoryCarousel({ categories = [] }: ShopByCategoryCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeCategories = useMemo(() => {
    const source = categories && categories.length > 0 ? categories : fallbackCategories;
    const seen = new Set<string>();
    const unique: Category[] = [];

    source.forEach((c) => {
      if (!c || c.show_on_homepage === false || c.status === "inactive") return;
      const key = (c.id || c.slug || c.name || "").toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    });

    return unique.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [categories]);

  const [isMobilePaused, setIsMobilePaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [durationSec, setDurationSec] = useState<number>(45);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const sequence1Ref = useRef<HTMLDivElement>(null);

  // Dynamic duration calculation: 14 pixels per second (Right to Left)
  const updateDuration = useCallback(() => {
    if (sequence1Ref.current) {
      const width = sequence1Ref.current.offsetWidth || sequence1Ref.current.scrollWidth;
      if (width > 0) {
        const calculated = width / 14;
        setDurationSec(Math.round(calculated * 10) / 10);
      }
    }
  }, []);

  useEffect(() => {
    updateDuration();
    const el = sequence1Ref.current;
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateDuration());
      ro.observe(el);
    }

    window.addEventListener("resize", updateDuration);
    window.addEventListener("load", updateDuration);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", updateDuration);
      window.removeEventListener("load", updateDuration);
    };
  }, [updateDuration]);

  useEffect(() => {
    const el = mobileContainerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    const handleVisibility = () => {
      setIsInViewport(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const mobileCategories = useMemo(() => {
    if (activeCategories.length === 0) return [];
    if (activeCategories.length >= 6) return activeCategories;
    const rep: Category[] = [];
    while (rep.length < 6) {
      rep.push(...activeCategories);
    }
    return rep;
  }, [activeCategories]);

  const desktopDisplayList = useMemo(() => {
    if (activeCategories.length === 0) return [];
    if (activeCategories.length < 4) {
      return [...activeCategories, ...activeCategories, ...activeCategories, ...activeCategories];
    }
    return [...activeCategories, ...activeCategories, ...activeCategories];
  }, [activeCategories]);

  // Smooth Infinite Continuous Auto-Scroll Loop (Desktop - Continues playing on hover)
  useEffect(() => {
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        container.scrollLeft += 0.75;

        const totalCopies = desktopDisplayList.length / (activeCategories.length || 1);
        const singleSetWidth = container.scrollWidth / (totalCopies || 3);
        if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth) {
          container.scrollLeft -= singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCategories.length, desktopDisplayList.length]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── Mobile Layout (< 768px): Continuous Linear Horizontal Category Marquee ── */}
      <section
        ref={mobileContainerRef}
        className="md:hidden w-full bg-white px-3 sm:px-4 py-3 select-none overflow-hidden"
        aria-label="Shop by Category"
      >
        {/* Header with upward reveal */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2.5 flex items-center justify-between"
        >
          <h2 className="text-[19px] font-black text-neutral-900 tracking-tight">
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="text-xs font-bold text-neutral-600 hover:text-black"
          >
            All Categories →
          </Link>
        </motion.div>

        {/* Continuous Linear Marquee Track (Autoplay never stops on hover) */}
        <div className="relative w-full overflow-hidden select-none -mx-3 px-3 sm:-mx-4 sm:px-4 touch-pan-y">
          <div
            className="mobile-categories-track flex w-max will-change-transform motion-reduce:animate-none"
            style={{
              ["--mobile-categories-duration" as any]: `${durationSec}s`,
              animationDuration: `${durationSec}s`,
              animationPlayState: !isInViewport ? "paused" : "running",
            }}
          >
            {/* Sequence 1 */}
            <div ref={sequence1Ref} className="flex items-center gap-2.5 pr-2.5 shrink-0 py-2">
              {mobileCategories.map((item, i) => {
                const hasCustomImg = Boolean(item.image_url && item.image_url.trim());
                const targetUrl = item.slug ? `/categories/${item.slug}` : `/products?category=${encodeURIComponent(item.name)}`;

                return (
                  <div key={`mob-cat-a-${item.id || i}`} className="shrink-0">
                    <Link
                      href={targetUrl}
                      className="w-[88px] sm:w-[96px] h-full bg-white border border-[#E8E8E8] rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-black hover:scale-115 hover:shadow-lg active:scale-95 transition-all duration-300 text-center block relative z-10"
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        {hasCustomImg ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            className="max-h-7 max-w-7 object-contain transition-transform duration-300 group-hover:scale-115"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="scale-75 transition-transform duration-300">
                            {renderCategoryDefaultIcon(item.name, item.slug)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-800 tracking-tight truncate max-w-full">
                        {item.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Sequence 2 (Identical Clone for continuous loop) */}
            <div className="flex items-center gap-2.5 pr-2.5 shrink-0 py-2" aria-hidden="true">
              {mobileCategories.map((item, i) => {
                const hasCustomImg = Boolean(item.image_url && item.image_url.trim());
                const targetUrl = item.slug ? `/categories/${item.slug}` : `/products?category=${encodeURIComponent(item.name)}`;

                return (
                  <div key={`mob-cat-b-${item.id || i}`} className="shrink-0">
                    <Link
                      href={targetUrl}
                      tabIndex={-1}
                      className="w-[88px] sm:w-[96px] h-full bg-white border border-[#E8E8E8] rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-black hover:scale-115 hover:shadow-lg active:scale-95 transition-all duration-300 text-center block relative z-10"
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        {hasCustomImg ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            className="max-h-7 max-w-7 object-contain transition-transform duration-300 group-hover:scale-115"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="scale-75 transition-transform duration-300">
                            {renderCategoryDefaultIcon(item.name, item.slug)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-800 tracking-tight truncate max-w-full">
                        {item.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <section className="py-16 bg-white border-b border-neutral-100 relative overflow-hidden font-outfit">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            {/* Title Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
                Shop by Category
              </h2>
              <p className="text-neutral-500 text-sm font-medium mt-1">
                Explore popular device categories and genuine smartphone accessories
              </p>
            </div>

            {/* Carousel Container with Left/Right Chevrons */}
            <div className="relative group">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Scroll left categories"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-40 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2]" />
              </button>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Scroll right categories"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-40 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 stroke-[2]" />
              </button>

              {/* Seamless Infinite Auto-Scrolling Track */}
              <div
                ref={scrollRef}
                className="flex items-center gap-6 sm:gap-10 overflow-x-auto scrollbar-none py-8 px-4 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {desktopDisplayList.map((item, i) => {
                  const hasHoverIcon = Boolean(item.hover_icon_url && item.hover_icon_url.trim());
                  const hasCustomImg = Boolean(item.image_url && item.image_url.trim());
                  const currentImg = hoveredId === item.id && hasHoverIcon ? item.hover_icon_url : item.image_url;

                  return (
                    <Link
                      key={`${item.id || item.slug || i}-${i}`}
                      href={item.link_destination || `/categories/${item.slug}`}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="group shrink-0 flex flex-col items-center justify-center text-center gap-3 w-32 sm:w-36 cursor-pointer transition-all duration-300 hover:scale-120 hover:z-30 relative py-2 select-none"
                    >
                      {/* Icon Container with Smooth Zoom & Elevation on Cursor Hover */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-200/80 group-hover:border-black group-hover:bg-white group-hover:shadow-2xl group-hover:scale-115 group-hover:ring-4 group-hover:ring-black/5 transition-all duration-300 p-2 overflow-visible">
                        {hasCustomImg && currentImg ? (
                          <img
                            src={currentImg}
                            alt={item.icon_alt_text || item.name}
                            className="w-11 h-11 sm:w-14 sm:h-14 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-115"
                            loading="lazy"
                          />
                        ) : (
                          <div className="group-hover:scale-115 transition-transform duration-300">
                            {renderCategoryDefaultIcon(item.name, item.slug)}
                          </div>
                        )}
                      </div>

                      {/* Category Name Label */}
                      <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-black group-hover:scale-105 transition-all duration-300 leading-tight max-w-[130px] truncate">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
