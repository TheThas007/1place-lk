"use client";

import React from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

export type SortOptionValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "biggest-discount";

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ShopResultsToolbarProps {
  totalCount: number;
  activeFilters: ActiveFilterChip[];
  onClearAll: () => void;
  sortKey: SortOptionValue;
  onSortChange: (key: SortOptionValue) => void;
  onOpenMobileFilters: () => void;
  className?: string;
}

export const SORT_OPTIONS: { label: string; value: SortOptionValue }[] = [
  { label: "Sort: Featured", value: "featured" },
  { label: "Sort: Newest", value: "newest" },
  { label: "Sort: Price: Low to High", value: "price-asc" },
  { label: "Sort: Price: High to Low", value: "price-desc" },
  { label: "Sort: Biggest Discount", value: "biggest-discount" },
];

export default function ShopResultsToolbar({
  totalCount,
  activeFilters,
  onClearAll,
  sortKey,
  onSortChange,
  onOpenMobileFilters,
  className = "",
}: ShopResultsToolbarProps) {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 ${className}`}>
      
      {/* Left: Result Count + Active Chips + Clear All (All on one unified flex row) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
        
        {/* Count */}
        <span className="text-xs sm:text-sm font-black text-neutral-900 tracking-tight shrink-0 mr-1">
          {totalCount} {totalCount === 1 ? "Product" : "Products"}
        </span>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            {activeFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={f.onRemove}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] sm:text-xs font-semibold hover:bg-neutral-700 transition-colors shadow-2xs group shrink-0 whitespace-nowrap"
              >
                <span>{f.label}</span>
                <X className="w-3 h-3 text-neutral-400 group-hover:text-white transition-colors" />
              </button>
            ))}

            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] sm:text-xs font-bold text-neutral-500 hover:text-black px-1.5 py-0.5 rounded hover:bg-neutral-100 transition-colors shrink-0"
            >
              Clear All
            </button>
          </>
        )}

      </div>

      {/* Right: Mobile Filter Button & Sort Dropdown */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end sm:self-center">
        
        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-2xs hover:bg-neutral-800 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-black flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <label htmlFor="shop-sort-select" className="sr-only">Sort products</label>
          <select
            id="shop-sort-select"
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortOptionValue)}
            className="appearance-none pl-3 pr-8 py-1.5 sm:py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/90 rounded-xl text-xs sm:text-sm font-bold text-neutral-800 outline-none cursor-pointer focus:border-black transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>

      </div>

    </div>
  );
}
