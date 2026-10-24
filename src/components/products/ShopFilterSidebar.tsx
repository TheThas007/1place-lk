"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category, Product } from "@/lib/types";

export function detectProductBrand(product: Product): string {
  const rawBrand = (product.brand_name || product.brandName || product.brand || "").trim();
  const name = (product.name || "").toLowerCase();

  const REAL = [
    "Apple", "Samsung", "Google", "Xiaomi", "Redmi", "Honor", "OnePlus",
    "Oppo", "Vivo", "Realme", "JBL", "UGREEN", "Anker", "Baseus", "Oraimo", "Sony", "Bose"
  ];

  if (rawBrand) {
    const match = REAL.find((b) => b.toLowerCase() === rawBrand.toLowerCase());
    if (match) return match;
    return rawBrand;
  }

  for (const b of REAL) {
    if (name.includes(b.toLowerCase())) return b;
  }

  return "Other";
}

function fmtLKR(val: number) {
  return "LKR " + val.toLocaleString("en-LK");
}

export interface ShopFilterSidebarProps {
  allProducts?: Product[];
  categories?: Category[];
  selectedCategories?: string[];
  onToggleCategory?: (catId: string) => void;
  onClearCategories?: () => void;
  selectedBrands?: string[];
  onToggleBrand?: (brand: string) => void;
  onClearBrands?: () => void;
  priceMin?: number;
  priceMax?: number;
  sliderLow: number;
  sliderHigh: number;
  onSliderChange: (low: number, high: number) => void;
  pendingMin: string;
  pendingMax: string;
  setPendingMin: (val: string) => void;
  setPendingMax: (val: string) => void;
  priceError: string;
  onApplyPrice: () => void;
  selectedAvailability?: string[];
  onToggleAvailability?: (avail: string) => void;
  onApplyAll?: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export default function ShopFilterSidebar({
  sliderLow,
  sliderHigh,
  onSliderChange,
  pendingMin,
  pendingMax,
  setPendingMin,
  setPendingMax,
  priceError,
  onApplyPrice,
  onClearAll,
}: ShopFilterSidebarProps) {
  const [openPrice, setOpenPrice] = useState(true);

  const hasAnyFilter = Boolean(
    pendingMin || pendingMax || sliderLow > 0 || sliderHigh < 1000000
  );

  return (
    <div className="w-full text-neutral-900 select-none text-xs">
      
      {/* ── Top Header: Filters & Clear All ── */}
      <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-neutral-200">
        <span className="font-extrabold text-sm text-neutral-900 tracking-tight">
          Filters
        </span>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Price Range Section ── */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => setOpenPrice((prev) => !prev)}
          className="w-full flex items-center justify-between font-bold text-xs text-neutral-900 py-1 cursor-pointer"
        >
          <span>Price</span>
          {openPrice ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {openPrice && (
          <div className="mt-2.5 space-y-2">
            {[
              { label: "Under LKR 50,000", min: 0, max: 50000 },
              { label: "LKR 50,000 – LKR 100,000", min: 50000, max: 100000 },
              { label: "LKR 100,000 – LKR 200,000", min: 100000, max: 200000 },
              { label: "Over LKR 200,000", min: 200000, max: 0 },
            ].map((tier, idx) => {
              const isSelected =
                (tier.max === 0 && Number(pendingMin) >= 200000 && !pendingMax) ||
                (Number(pendingMin) === tier.min && Number(pendingMax) === tier.max);

              return (
                <label
                  key={idx}
                  onClick={() => {
                    if (isSelected) {
                      setPendingMin("");
                      setPendingMax("");
                      onSliderChange(0, 1000000);
                    } else {
                      setPendingMin(tier.min ? tier.min.toString() : "");
                      setPendingMax(tier.max ? tier.max.toString() : "");
                      onSliderChange(tier.min, tier.max || 1000000);
                    }
                    setTimeout(onApplyPrice, 10);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 rounded border-neutral-300 accent-black cursor-pointer"
                  />
                  <span className={`text-xs ${isSelected ? "font-bold text-black" : "text-neutral-700 group-hover:text-black"}`}>
                    {tier.label}
                  </span>
                </label>
              );
            })}

            {/* Custom Min / Max Inputs */}
            <div className="pt-2 flex items-center gap-1.5">
              <input
                type="number"
                value={pendingMin}
                onChange={(e) => setPendingMin(e.target.value)}
                placeholder="Min LKR"
                className="w-1/2 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black font-mono"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="number"
                value={pendingMax}
                onChange={(e) => setPendingMax(e.target.value)}
                placeholder="Max LKR"
                className="w-1/2 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black font-mono"
              />
              <button
                type="button"
                onClick={onApplyPrice}
                className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Go
              </button>
            </div>
            {priceError && <p className="text-[10px] text-red-500">{priceError}</p>}
          </div>
        )}
      </div>

    </div>
  );
}
