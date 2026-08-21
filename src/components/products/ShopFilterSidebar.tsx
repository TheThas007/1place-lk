"use client";

import React, { useState, useMemo, useRef } from "react";
import { Search, ChevronDown, ChevronUp, X, Check, SlidersHorizontal } from "lucide-react";
import { Category, Product } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────
   HELPERS & SANITIZATION
───────────────────────────────────────────────────────────── */
const KNOWN_BRANDS = [
  "Apple", "Samsung", "Redmi", "Xiaomi", "Honor",
  "Oppo", "Vivo", "Realme", "Google", "OnePlus",
  "JBL", "LENYES", "UGREEN", "Anker", "Baseus", "Oraimo", "Soundcore",
];

const INVALID_REGEX = /^(abc|eg002|eg001|test|testing|none|null|undefined|sample|\d{1,2})$/i;

function isValidLabel(label: string): boolean {
  if (!label || label.trim().length < 2) return false;
  const clean = label.trim().toLowerCase();
  if (INVALID_REGEX.test(clean)) return false;
  if (/^[a-z]\d{3,}$/i.test(clean)) return false; // e.g. eg002
  return true;
}

export function detectProductBrand(product: Product): string {
  const rawBrand = (product.brand_name || product.brandName || product.brand || "").trim();
  const rawCat = (product.category_name || product.categoryName || "").trim();
  const name = (product.name || "").toLowerCase();

  const REAL = ["apple", "samsung", "redmi", "xiaomi", "honor", "oppo", "vivo", "realme",
    "google", "oneplus", "jbl", "lenyes", "ugreen", "anker", "baseus", "oraimo", "soundcore"];

  if (rawBrand && rawBrand.toLowerCase() !== "standard" && REAL.includes(rawBrand.toLowerCase()))
    return rawBrand;
  if (rawBrand && rawBrand.toLowerCase() !== "standard" && isValidLabel(rawBrand))
    return rawBrand;

  const fromCat = REAL.find((b) => b === rawCat.toLowerCase());
  if (fromCat) return rawCat;

  if (name.includes("apple") || name.includes("iphone") || name.includes("airpods") ||
      name.includes("ipad")  || name.includes("macbook") || name.includes("apple watch"))
    return "Apple";
  if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
  if (name.includes("redmi") || (name.includes("xiaomi") && !name.includes("samsung"))) return "Redmi";
  if (name.includes("honor"))     return "Honor";
  if (name.includes("oppo"))      return "Oppo";
  if (name.includes("vivo"))      return "Vivo";
  if (name.includes("realme"))    return "Realme";
  if (name.includes("jbl"))       return "JBL";
  if (name.includes("lenyes"))    return "LENYES";
  if (name.includes("ugreen"))    return "UGREEN";
  if (name.includes("anker"))     return "Anker";
  if (name.includes("baseus"))    return "Baseus";
  if (name.includes("oraimo"))    return "Oraimo";
  if (name.includes("soundcore")) return "Soundcore";

  return rawBrand && isValidLabel(rawBrand) ? rawBrand : "Other";
}

export function detectProductCondition(product: Product): string {
  const spec = product.specifications || {};
  const cond = (spec["Condition"] || spec["condition"] || "").trim();
  if (cond && isValidLabel(cond)) return cond;

  const tags = (product.tags || []).join(" ").toLowerCase();
  const name = (product.name || "").toLowerCase();

  if (tags.includes("pre-owned") || name.includes("pre-owned") || name.includes("used"))
    return "Pre-Owned";
  if (tags.includes("refurbished") || name.includes("refurbished"))
    return "Refurbished";
  if (tags.includes("sealed") || name.includes("sealed"))
    return "Sealed";

  return "Brand New";
}

export function detectProductStorage(product: Product): string[] {
  const results = new Set<string>();

  if (product.storage_options && Array.isArray(product.storage_options)) {
    product.storage_options.forEach((s) => {
      if (s && isValidLabel(s)) results.add(s.toUpperCase().trim());
    });
  }

  // Also check specifications or product name
  const name = product.name || "";
  const match = name.match(/\b(32GB|64GB|128GB|256GB|512GB|1TB|2TB)\b/i);
  if (match) {
    results.add(match[1].toUpperCase());
  }

  return Array.from(results);
}

function fmtLKR(val: number) {
  return "LKR " + val.toLocaleString("en-LK");
}

/* ─────────────────────────────────────────────────────────────
   DUAL RANGE SLIDER COMPONENT
───────────────────────────────────────────────────────────── */
function DualRangeSlider({
  min, max, low, high, onChange,
}: {
  min: number; max: number; low: number; high: number;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - min) / Math.max(1, max - min)) * 100));

  const drag = (handle: "low" | "high", e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;

    const move = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = Math.round(min + ratio * (max - min));
      if (handle === "low") onChange(Math.min(raw, high - 1000), high);
      if (handle === "high") onChange(low, Math.max(raw, low + 1000));
    };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const x = ev instanceof MouseEvent ? ev.clientX : ev.touches[0].clientX;
      move(x);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
  };

  return (
    <div className="relative h-6 flex items-center select-none" ref={trackRef}>
      <div className="absolute w-full h-1.5 bg-neutral-200 rounded-full" />
      <div
        className="absolute h-1.5 bg-black rounded-full"
        style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
      />
      <div
        className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2"
        style={{ left: `${pct(low)}%` }}
        onMouseDown={(e) => drag("low", e)}
        onTouchStart={(e) => drag("low", e)}
      />
      <div
        className="absolute w-5 h-5 bg-black border-2 border-black rounded-full shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2"
        style={{ left: `${pct(high)}%` }}
        onMouseDown={(e) => drag("high", e)}
        onTouchStart={(e) => drag("high", e)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHOP FILTER SIDEBAR PROPS
───────────────────────────────────────────────────────────── */
export interface ShopFilterSidebarProps {
  allProducts: Product[];
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (catIdOrSlug: string) => void;
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
  onToggleAvailability: (val: string) => void;
  selectedConditions: string[];
  onToggleCondition: (val: string) => void;
  selectedStorage: string[];
  onToggleStorage: (val: string) => void;
  selectedWarranties: string[];
  onToggleWarranty: (val: string) => void;
  onApplyAll?: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export default function ShopFilterSidebar({
  allProducts,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  priceMin,
  priceMax,
  sliderLow,
  sliderHigh,
  onSliderChange,
  pendingMin,
  pendingMax,
  setPendingMin,
  setPendingMax,
  priceError,
  onApplyPrice,
  selectedAvailability,
  onToggleAvailability,
  selectedConditions,
  onToggleCondition,
  selectedStorage,
  onToggleStorage,
  selectedWarranties,
  onToggleWarranty,
  onApplyAll,
  onClearAll,
  onClose,
}: ShopFilterSidebarProps) {
  // Collapsible Accordion States
  const [openCat, setOpenCat] = useState(true);
  const [openBrand, setOpenBrand] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openAvail, setOpenAvail] = useState(true);
  const [openCond, setOpenCond] = useState(true);
  const [openStorage, setOpenStorage] = useState(true);
  const [openWarranty, setOpenWarranty] = useState(true);

  // Show More / Less States (initial: 6 items)
  const [showMoreCat, setShowMoreCat] = useState(false);
  const [showMoreBrand, setShowMoreBrand] = useState(false);
  const [showMoreStorage, setShowMoreStorage] = useState(false);
  const [showMoreWarranty, setShowMoreWarranty] = useState(false);

  // Search input queries inside sections (ONLY shown if options >= 12)
  const [catSearch, setCatSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  /* ───────────────────────────────────────────────────────────
     1. EXTRACT & SANITIZE CATEGORIES
  ─────────────────────────────────────────────────────────── */
  const sanitizedCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; count: number }>();

    // From Firestore categories prop
    categories.forEach((c) => {
      if (c && c.name) {
        const cleanName = c.name.replace(/[\u0080-\uFFFF]/g, "").trim();
        const isBrand = KNOWN_BRANDS.some((b) => b.toLowerCase() === cleanName.toLowerCase());
        if (cleanName && !isBrand && isValidLabel(cleanName)) {
          const key = cleanName.toLowerCase();
          map.set(key, {
            id: c.id || c.slug || cleanName,
            name: cleanName,
            slug: c.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            count: 0,
          });
        }
      }
    });

    // From products catalog
    allProducts.forEach((p) => {
      const rawCat = (p.category_name || p.categoryName || "").trim();
      const cleanCat = rawCat.replace(/[\u0080-\uFFFF]/g, "").trim();
      const isBrand = KNOWN_BRANDS.some((b) => b.toLowerCase() === cleanCat.toLowerCase());

      if (cleanCat && !isBrand && isValidLabel(cleanCat)) {
        const key = cleanCat.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: `cat-${key.replace(/[^a-z0-9]+/g, "-")}`,
            name: cleanCat,
            slug: key.replace(/[^a-z0-9]+/g, "-"),
            count: 0,
          });
        }
        map.get(key)!.count += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [categories, allProducts]);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return sanitizedCategories;
    return sanitizedCategories.filter((c) =>
      c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [sanitizedCategories, catSearch]);

  /* ───────────────────────────────────────────────────────────
     2. EXTRACT & SANITIZE BRANDS
  ─────────────────────────────────────────────────────────── */
  const sanitizedBrands = useMemo(() => {
    const map = new Map<string, number>();

    allProducts.forEach((p) => {
      const b = detectProductBrand(p);
      if (b && b !== "Other" && isValidLabel(b)) {
        map.set(b, (map.get(b) || 0) + 1);
      }
    });

    // Prioritize known brands, then other found brands
    const fromKnown = KNOWN_BRANDS.filter((b) => map.has(b));
    const extra = Array.from(map.keys()).filter((b) => !KNOWN_BRANDS.includes(b));
    const list = [...fromKnown, ...extra];

    return list.map((b) => ({ name: b, count: map.get(b) || 0 }));
  }, [allProducts]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return sanitizedBrands;
    return sanitizedBrands.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [sanitizedBrands, brandSearch]);

  /* ───────────────────────────────────────────────────────────
     3. AVAILABILITY OPTIONS
  ─────────────────────────────────────────────────────────── */
  const availabilityOptions = useMemo(() => {
    const counts = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    allProducts.forEach((p) => {
      if (p.stock_status === "out_of_stock") counts.out_of_stock++;
      else if (p.stock_status === "low_stock") counts.low_stock++;
      else counts.in_stock++;
    });

    return [
      { id: "in_stock", label: "In Stock", count: counts.in_stock },
      { id: "low_stock", label: "Low Stock", count: counts.low_stock },
      { id: "out_of_stock", label: "Out of Stock", count: counts.out_of_stock },
    ];
  }, [allProducts]);

  /* ───────────────────────────────────────────────────────────
     4. CONDITION OPTIONS
  ─────────────────────────────────────────────────────────── */
  const conditionOptions = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      const c = detectProductCondition(p);
      map.set(c, (map.get(c) || 0) + 1);
    });

    const standardOrder = ["Brand New", "Pre-Owned", "Refurbished", "Sealed"];
    const found = standardOrder.filter((c) => map.has(c));
    const other = Array.from(map.keys()).filter((c) => !standardOrder.includes(c));

    return [...found, ...other].map((c) => ({
      name: c,
      count: map.get(c) || 0,
    }));
  }, [allProducts]);

  /* ───────────────────────────────────────────────────────────
     5. STORAGE OPTIONS
  ─────────────────────────────────────────────────────────── */
  const storageOptions = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      const storages = detectProductStorage(p);
      storages.forEach((s) => {
        map.set(s, (map.get(s) || 0) + 1);
      });
    });

    const standardOrder = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
    const found = standardOrder.filter((s) => map.has(s));
    const other = Array.from(map.keys()).filter((s) => !standardOrder.includes(s));

    return [...found, ...other].map((s) => ({
      name: s,
      count: map.get(s) || 0,
    }));
  }, [allProducts]);

  /* ───────────────────────────────────────────────────────────
     6. WARRANTY OPTIONS
  ─────────────────────────────────────────────────────────── */
  const warrantyOptions = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      const w = (p.warranty || p.brand_warranty || "").trim();
      if (w && isValidLabel(w)) {
        map.set(w, (map.get(w) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([w, count]) => ({ name: w, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProducts]);

  return (
    <div className="flex flex-col gap-5 text-neutral-900 text-xs">

      {/* ══════════════════════════════════════════════════════════
         1. CATEGORIES
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenCat(!openCat)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
            Categories
            {selectedCategories.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </span>
          {openCat ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openCat && (
          <div className="mt-3 space-y-2">
            {/* Show search ONLY if options >= 12 */}
            {sanitizedCategories.length >= 12 && (
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>
            )}

            {/* List */}
            <div className="space-y-1.5">
              {(showMoreCat ? filteredCategories : filteredCategories.slice(0, 6)).map((cat) => {
                const isSelected = selectedCategories.some(
                  (c) =>
                    c.toLowerCase() === cat.id.toLowerCase() ||
                    c.toLowerCase() === cat.slug.toLowerCase() ||
                    c.toLowerCase() === cat.name.toLowerCase()
                );
                const disabled = cat.count === 0;

                return (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                      disabled ? "opacity-35 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => onToggleCategory(cat.slug || cat.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span className={`truncate max-w-[140px] ${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({cat.count})</span>
                  </label>
                );
              })}
            </div>

            {/* Show More / Show Less Toggle */}
            {filteredCategories.length > 6 && (
              <button
                type="button"
                onClick={() => setShowMoreCat(!showMoreCat)}
                className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 transition-colors"
              >
                {showMoreCat ? "Show Less" : `+ Show ${filteredCategories.length - 6} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
         2. BRANDS
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenBrand(!openBrand)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
            Brands
            {selectedBrands.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {selectedBrands.length}
              </span>
            )}
          </span>
          {openBrand ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openBrand && (
          <div className="mt-3 space-y-2">
            {/* Show search ONLY if options >= 12 */}
            {sanitizedBrands.length >= 12 && (
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>
            )}

            {/* List */}
            <div className="space-y-1.5">
              {(showMoreBrand ? filteredBrands : filteredBrands.slice(0, 6)).map((brand) => {
                const isSelected = selectedBrands.some((b) => b.toLowerCase() === brand.name.toLowerCase());
                const disabled = brand.count === 0;

                return (
                  <label
                    key={brand.name}
                    className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                      disabled ? "opacity-35 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => onToggleBrand(brand.name)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span className={`truncate max-w-[140px] ${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                        {brand.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({brand.count})</span>
                  </label>
                );
              })}
            </div>

            {/* Show More / Show Less Toggle */}
            {filteredBrands.length > 6 && (
              <button
                type="button"
                onClick={() => setShowMoreBrand(!showMoreBrand)}
                className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 transition-colors"
              >
                {showMoreBrand ? "Show Less" : `+ Show ${filteredBrands.length - 6} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
         3. PRICE RANGE
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenPrice(!openPrice)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900">
            Price Range (LKR)
          </span>
          {openPrice ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openPrice && (
          <div className="mt-4 space-y-3">
            <DualRangeSlider
              min={priceMin}
              max={priceMax}
              low={sliderLow}
              high={sliderHigh}
              onChange={onSliderChange}
            />

            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
              <span>{fmtLKR(sliderLow)}</span>
              <span>{fmtLKR(sliderHigh)}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pendingMin}
                onChange={(e) => setPendingMin(e.target.value)}
                placeholder="Min"
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
              />
              <span className="text-neutral-400 text-xs">-</span>
              <input
                type="number"
                value={pendingMax}
                onChange={(e) => setPendingMax(e.target.value)}
                placeholder="Max"
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            {priceError && <p className="text-[10px] text-red-600 font-bold">{priceError}</p>}

            <button
              type="button"
              onClick={onApplyPrice}
              className="w-full py-2 bg-neutral-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold text-neutral-800 transition-colors shadow-2xs"
            >
              Set Price Range
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
         4. AVAILABILITY
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenAvail(!openAvail)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
            Availability
            {selectedAvailability.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {selectedAvailability.length}
              </span>
            )}
          </span>
          {openAvail ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openAvail && (
          <div className="mt-3 space-y-1.5">
            {availabilityOptions.map((opt) => {
              const isSelected = selectedAvailability.includes(opt.id);
              const disabled = opt.count === 0;

              return (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                    disabled ? "opacity-35 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => onToggleAvailability(opt.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                    />
                    <span className={`${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                      {opt.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">({opt.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
         5. CONDITION
      ══════════════════════════════════════════════════════════ */}
      {conditionOptions.length > 0 && (
        <div className="border-b border-neutral-100 pb-4">
          <button
            type="button"
            onClick={() => setOpenCond(!openCond)}
            className="w-full flex items-center justify-between py-1 text-left group"
          >
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              Condition
              {selectedConditions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                  {selectedConditions.length}
                </span>
              )}
            </span>
            {openCond ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openCond && (
            <div className="mt-3 space-y-1.5">
              {conditionOptions.map((opt) => {
                const isSelected = selectedConditions.some((c) => c.toLowerCase() === opt.name.toLowerCase());
                const disabled = opt.count === 0;

                return (
                  <label
                    key={opt.name}
                    className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                      disabled ? "opacity-35 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => onToggleCondition(opt.name)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span className={`${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                        {opt.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({opt.count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         6. STORAGE
      ══════════════════════════════════════════════════════════ */}
      {storageOptions.length > 0 && (
        <div className="border-b border-neutral-100 pb-4">
          <button
            type="button"
            onClick={() => setOpenStorage(!openStorage)}
            className="w-full flex items-center justify-between py-1 text-left group"
          >
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              Storage
              {selectedStorage.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                  {selectedStorage.length}
                </span>
              )}
            </span>
            {openStorage ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openStorage && (
            <div className="mt-3 space-y-2">
              <div className="space-y-1.5">
                {(showMoreStorage ? storageOptions : storageOptions.slice(0, 6)).map((opt) => {
                  const isSelected = selectedStorage.some((s) => s.toLowerCase() === opt.name.toLowerCase());
                  const disabled = opt.count === 0;

                  return (
                    <label
                      key={opt.name}
                      className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                        disabled ? "opacity-35 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={disabled}
                          onChange={() => onToggleStorage(opt.name)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                        />
                        <span className={`${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">({opt.count})</span>
                    </label>
                  );
                })}
              </div>

              {storageOptions.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowMoreStorage(!showMoreStorage)}
                  className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 transition-colors"
                >
                  {showMoreStorage ? "Show Less" : `+ Show ${storageOptions.length - 6} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         7. WARRANTY
      ══════════════════════════════════════════════════════════ */}
      {warrantyOptions.length > 0 && (
        <div className="pb-2">
          <button
            type="button"
            onClick={() => setOpenWarranty(!openWarranty)}
            className="w-full flex items-center justify-between py-1 text-left group"
          >
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              Warranty
              {selectedWarranties.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                  {selectedWarranties.length}
                </span>
              )}
            </span>
            {openWarranty ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openWarranty && (
            <div className="mt-3 space-y-2">
              <div className="space-y-1.5">
                {(showMoreWarranty ? warrantyOptions : warrantyOptions.slice(0, 6)).map((opt) => {
                  const isSelected = selectedWarranties.some((w) => w.toLowerCase() === opt.name.toLowerCase());
                  const disabled = opt.count === 0;

                  return (
                    <label
                      key={opt.name}
                      className={`flex items-center justify-between py-1 cursor-pointer select-none group ${
                        disabled ? "opacity-35 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={disabled}
                          onChange={() => onToggleWarranty(opt.name)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                        />
                        <span className={`truncate max-w-[140px] ${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">({opt.count})</span>
                    </label>
                  );
                })}
              </div>

              {warrantyOptions.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowMoreWarranty(!showMoreWarranty)}
                  className="text-[11px] font-bold text-neutral-500 hover:text-black pt-1 transition-colors"
                >
                  {showMoreWarranty ? "Show Less" : `+ Show ${warrantyOptions.length - 6} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         BOTTOM ACTIONS (Clear All & Apply)
      ══════════════════════════════════════════════════════════ */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
        {onApplyAll && (
          <button
            type="button"
            onClick={() => {
              onApplyAll();
              onClose?.();
            }}
            className="w-full py-3 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            Apply Filters
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClearAll();
            onClose?.();
          }}
          className="w-full py-1.5 text-xs font-bold text-neutral-400 hover:text-black transition-colors"
        >
          Clear All
        </button>
      </div>

    </div>
  );
}
