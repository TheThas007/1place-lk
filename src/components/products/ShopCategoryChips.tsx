"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Speaker,
  Zap,
  BatteryCharging,
  Shield,
} from "lucide-react";

export interface QuickCategoryDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchKeys: string[];
}

export const QUICK_CATEGORIES: QuickCategoryDef[] = [
  { id: "all", label: "All", icon: Grid3X3, matchKeys: [] },
  { id: "smartphones", label: "Smartphones", icon: Smartphone, matchKeys: ["phone", "smartphone", "iphone", "smartphones", "mobiles"] },
  { id: "laptops-tablets", label: "Laptops & Tablets", icon: Laptop, matchKeys: ["laptop", "tablet", "ipad", "macbook", "tab", "laptops", "tablets"] },
  { id: "smart-watches", label: "Smart Watches", icon: Watch, matchKeys: ["watch", "smartwatch", "smart-watch", "smart-watches", "watches", "band", "apple-watch"] },
  { id: "earbuds", label: "Earbuds", icon: Headphones, matchKeys: ["earbud", "earbuds", "tws", "airpod", "airpods", "buds", "earphone", "earphones"] },
  { id: "headphones", label: "Headphones", icon: Headphones, matchKeys: ["headphone", "headphones", "headset", "headsets", "over-ear"] },
  { id: "speakers", label: "Speakers", icon: Speaker, matchKeys: ["speaker", "speakers", "soundbar", "soundcore", "bluetooth-speaker"] },
  { id: "chargers", label: "Chargers", icon: Zap, matchKeys: ["charger", "chargers", "adapter", "adapters", "cable", "cables", "magsafe", "charging"] },
  { id: "power-banks", label: "Power Banks", icon: BatteryCharging, matchKeys: ["power bank", "powerbank", "power-bank", "powerbanks", "power-banks", "battery"] },
  { id: "phone-cases", label: "Phone Cases", icon: Shield, matchKeys: ["case", "cases", "cover", "covers", "phone-case", "phone-cases", "protector", "tempered"] },
];

interface ShopCategoryChipsProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export default function ShopCategoryChips({
  selectedCategoryId,
  onSelectCategory,
  className = "",
}: ShopCategoryChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollability, { passive: true });
      window.addEventListener("resize", checkScrollability);
      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [checkScrollability]);

  // Support mouse wheel horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && Math.abs(e.deltaY) > 0 && e.deltaX === 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className={`relative w-full max-w-full group ${className}`}>
      
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll categories left"
          className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Left Edge Fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      )}

      {/* Horizontally Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-1 sm:px-2 pr-12 sm:pr-16 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {QUICK_CATEGORIES.map((cat) => {
          const isAll = cat.id === "all";
          const isSelected = isAll
            ? !selectedCategoryId || selectedCategoryId === "all"
            : selectedCategoryId.toLowerCase() === cat.id.toLowerCase();
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none outline-none whitespace-nowrap ${
                isSelected
                  ? "bg-black text-white shadow-sm ring-2 ring-black ring-offset-1"
                  : "bg-white text-neutral-700 hover:text-black border border-neutral-200/90 hover:border-neutral-400 hover:bg-neutral-50 shadow-2xs"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? "text-white" : "text-neutral-600"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Edge Fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-10" />
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll categories right"
          className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

    </div>
  );
}
