"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  // Smooth Slow Auto-Scroll Loop
  useEffect(() => {
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollRef.current && !isHovered) {
        const container = scrollRef.current;
        container.scrollLeft += 0.8;

        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

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
    <section className="py-16 bg-white border-b border-neutral-100 relative overflow-hidden">
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
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left categories"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right categories"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-6 sm:gap-10 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeCategories.map((item, i) => {
              const hasHoverIcon = Boolean(item.hover_icon_url && item.hover_icon_url.trim());
              const hasCustomImg = Boolean(item.image_url && item.image_url.trim());
              const currentImg = hoveredId === item.id && hasHoverIcon ? item.hover_icon_url : item.image_url;

              return (
                <Link
                  key={item.id || i}
                  href={item.link_destination || `/categories/${item.slug}`}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group shrink-0 flex flex-col items-center justify-center text-center gap-3 w-32 sm:w-40 cursor-pointer transition-transform hover:-translate-y-1 duration-300"
                >
                  {/* Icon Container with SVG & Image Support */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-100 group-hover:border-black group-hover:bg-white group-hover:shadow-md transition-all duration-300 p-2 overflow-hidden">
                    {hasCustomImg && currentImg ? (
                      <img
                        src={currentImg}
                        alt={item.icon_alt_text || item.name}
                        className="w-11 h-11 sm:w-14 sm:h-14 object-contain mix-blend-multiply transition-all duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {renderCategoryDefaultIcon(item.name, item.slug)}
                      </div>
                    )}
                  </div>

                  {/* Category Name Label */}
                  <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-black transition-colors leading-tight max-w-[130px] truncate">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
