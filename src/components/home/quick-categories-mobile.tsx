"use client";

import React from "react";
import Link from "next/link";
import { Search, Sparkles, Flame, Tag, LayoutGrid } from "lucide-react";
import { Category } from "@/lib/types";

interface QuickCategoriesMobileProps {
  categories?: Category[];
}

export default function QuickCategoriesMobile({ categories = [] }: QuickCategoriesMobileProps) {
  return (
    <div className="lg:hidden w-full bg-white border-b border-neutral-100/90 select-none">
      {/* ── 1. Search Bar ── */}
      <div className="px-4 pt-3 pb-2.5">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
          className="w-full h-11 px-3.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-2.5 text-left text-neutral-400 shadow-2xs hover:border-neutral-300 active:scale-[0.99] transition-all cursor-pointer"
          aria-label="Search phones, brands and accessories"
        >
          <Search className="w-4 h-4 text-neutral-400 shrink-0" strokeWidth={2} />
          <span className="text-xs text-neutral-400 font-normal">
            Search phones, brands &amp; accessories
          </span>
        </button>
      </div>

      {/* ── 2. Quick Navigation Badges (Inline with Dividers) ── */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-neutral-800 font-semibold overflow-x-auto scrollbar-none">
        {/* 1. New Arrivals */}
        <Link
          href="/products?new=true"
          className="flex items-center gap-1.5 hover:text-[#ED0712] transition-colors shrink-0 py-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-[11px] sm:text-xs">New Arrivals</span>
        </Link>

        <span className="text-neutral-300 font-light mx-1 select-none">|</span>

        {/* 2. Best Sellers */}
        <Link
          href="/products?featured=true"
          className="flex items-center gap-1.5 hover:text-[#ED0712] transition-colors shrink-0 py-1"
        >
          <Flame className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-[11px] sm:text-xs">Best Sellers</span>
        </Link>

        <span className="text-neutral-300 font-light mx-1 select-none">|</span>

        {/* 3. Offers */}
        <Link
          href="/products?sale=true"
          className="flex items-center gap-1.5 hover:text-[#ED0712] transition-colors shrink-0 py-1"
        >
          <Tag className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-[11px] sm:text-xs">Offers</span>
        </Link>

        <span className="text-neutral-300 font-light mx-1 select-none">|</span>

        {/* 4. Shop All */}
        <Link
          href="/products"
          className="flex items-center gap-1.5 hover:text-[#ED0712] transition-colors shrink-0 py-1"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-[11px] sm:text-xs">Shop All</span>
        </Link>
      </div>
    </div>
  );
}
