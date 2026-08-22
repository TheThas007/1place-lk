"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
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
  allProducts: Product[];
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (catId: string) => void;
  onClearCategories: () => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  onClearBrands: () => void;
  priceMin: number;
  priceMax: number;
  sliderLow: number;
  sliderHigh: number;
  onSliderChange: (low: number, high: number) => void;
  pendingMin: string;
  pendingMax: string;
  setPendingMin: (val: string) => void;
  setPendingMax: (val: string) => void;
  priceError: string;
  onApplyPrice: () => void;
  selectedAvailability: string[];
  onToggleAvailability: (avail: string) => void;
  onApplyAll?: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export default function ShopFilterSidebar({
  allProducts = [],
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  selectedBrands = [],
  onToggleBrand,
  sliderLow,
  sliderHigh,
  onSliderChange,
  pendingMin,
  pendingMax,
  setPendingMin,
  setPendingMax,
  priceError,
  onApplyPrice,
  selectedAvailability = [],
  onToggleAvailability,
  onClearAll,
}: ShopFilterSidebarProps) {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    availability: true,
  });

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Deduplicated Categories with counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    // Normalization mapping for case/synonym duplicates
    const normalize = (name: string) => {
      const lower = name.toLowerCase().trim();
      if (lower.includes("smart phone") || lower.includes("smartphone") || lower.includes("phone")) return "Smartphones";
      if (lower.includes("laptop") || lower.includes("macbook") || lower.includes("tablet") || lower.includes("tab") || lower.includes("ipad")) return "Laptops & Tablets";
      if (lower.includes("audio") || lower.includes("headphone") || lower.includes("earphone") || lower.includes("speaker") || lower.includes("airpod")) return "Audio";
      if (lower.includes("wearable") || lower.includes("watch") || lower.includes("band")) return "Wearables";
      if (lower.includes("power") || lower.includes("battery") || lower.includes("charger") || lower.includes("cable") || lower.includes("adapter")) return "Power Banks & Cables";
      if (lower.includes("case") || lower.includes("cover") || lower.includes("tempered") || lower.includes("gimbal") || lower.includes("selfie")) return "Accessories";
      return name.trim();
    };

    allProducts.forEach((p) => {
      const rawName = p.category_name || p.categoryName || "Accessories";
      const normalizedName = normalize(rawName);
      const rawId = p.category_id || p.category_slug || normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const existing = map.get(normalizedName);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(normalizedName, { id: rawId, name: normalizedName, count: 1 });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  // Deduplicated Brands with counts
  const brandCounts = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();

    allProducts.forEach((p) => {
      const brand = detectProductBrand(p);
      if (brand && brand !== "Other") {
        const existing = map.get(brand);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(brand, { name: brand, count: 1 });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  // Total In-stock count
  const inStockCount = useMemo(() => {
    return allProducts.filter(
      (p) => p.stock_status !== "out_of_stock" && (typeof p.stock_count !== "number" || p.stock_count > 0)
    ).length;
  }, [allProducts]);

  const visibleCategories = showAllCategories ? categoryCounts : categoryCounts.slice(0, 5);
  const visibleBrands = showAllBrands ? brandCounts : brandCounts.slice(0, 5);

  const hasAnyFilter =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedAvailability.length > 0 ||
    pendingMin ||
    pendingMax;

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

      {/* ── 1. Category Section ── */}
      <div className="py-3 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between font-bold text-xs text-neutral-900 py-1 cursor-pointer"
        >
          <span>Category</span>
          {openSections.category ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {openSections.category && (
          <div className="mt-2.5 space-y-2">
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id) || selectedCategories.includes(cat.name);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between cursor-pointer group py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCategory(cat.id)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 accent-black cursor-pointer"
                    />
                    <span className={`text-xs ${isSelected ? "font-bold text-black" : "text-neutral-700 group-hover:text-black"}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium font-mono">
                    ({cat.count})
                  </span>
                </label>
              );
            })}

            {categoryCounts.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 block cursor-pointer"
              >
                {showAllCategories ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Brand Section ── */}
      <div className="py-3 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => toggleSection("brand")}
          className="w-full flex items-center justify-between font-bold text-xs text-neutral-900 py-1 cursor-pointer"
        >
          <span>Brand</span>
          {openSections.brand ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {openSections.brand && (
          <div className="mt-2.5 space-y-2">
            {visibleBrands.map((b) => {
              const isSelected = selectedBrands.includes(b.name);
              return (
                <label
                  key={b.name}
                  className="flex items-center justify-between cursor-pointer group py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleBrand(b.name)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 accent-black cursor-pointer"
                    />
                    <span className={`text-xs ${isSelected ? "font-bold text-black" : "text-neutral-700 group-hover:text-black"}`}>
                      {b.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium font-mono">
                    ({b.count})
                  </span>
                </label>
              );
            })}

            {brandCounts.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 block cursor-pointer"
              >
                {showAllBrands ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Price Range Section ── */}
      <div className="py-3 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-bold text-xs text-neutral-900 py-1 cursor-pointer"
        >
          <span>Price</span>
          {openSections.price ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {openSections.price && (
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

      {/* ── 4. Availability Section ── */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between font-bold text-xs text-neutral-900 py-1 cursor-pointer"
        >
          <span>Availability</span>
          {openSections.availability ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {openSections.availability && (
          <div className="mt-2.5 space-y-2">
            <label className="flex items-center justify-between cursor-pointer group py-0.5">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedAvailability.includes("in_stock")}
                  onChange={() => onToggleAvailability("in_stock")}
                  className="w-3.5 h-3.5 rounded border-neutral-300 accent-black cursor-pointer"
                />
                <span className={`text-xs ${selectedAvailability.includes("in_stock") ? "font-bold text-black" : "text-neutral-700 group-hover:text-black"}`}>
                  In Stock
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium font-mono">
                ({inStockCount})
              </span>
            </label>
          </div>
        )}
      </div>

    </div>
  );
}
