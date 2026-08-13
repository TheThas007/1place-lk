"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const KNOWN_BRANDS = [
  "Apple", "Samsung", "Redmi", "Xiaomi", "Honor",
  "Oppo", "Vivo", "Realme", "Google", "OnePlus",
  "JBL", "LENYES", "UGREEN", "Anker", "Baseus", "Oraimo", "Soundcore",
];

const SORT_OPTIONS = [
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Price: Low to High", value: "price-asc"  },
];

type SortKey = "price-desc" | "price-asc";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

/* ─────────────────────────────────────────────────────────────
   SMART BRAND DETECTION
   Works even when brands were stored incorrectly as categories
───────────────────────────────────────────────────────────── */
function detectProductBrand(product: Product): string {
  const rawBrand = (product.brand_name || product.brandName || product.brand || "").trim();
  const rawCat   = (product.category_name || product.categoryName || "").trim();
  const name     = product.name.toLowerCase();

  const REAL = ["apple","samsung","redmi","xiaomi","honor","oppo","vivo","realme",
                 "google","oneplus","jbl","lenyes","ugreen","anker","baseus","oraimo","soundcore"];

  if (rawBrand && rawBrand.toLowerCase() !== "standard" && REAL.includes(rawBrand.toLowerCase()))
    return rawBrand;
  if (rawBrand && rawBrand.toLowerCase() !== "standard" && rawBrand.length > 0)
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

  return rawBrand || "Other";
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function fmtLKR(val: number) {
  return "LKR " + val.toLocaleString("en-LK");
}

/* ─────────────────────────────────────────────────────────────
   DUAL RANGE SLIDER
───────────────────────────────────────────────────────────── */
function DualRangeSlider({
  min, max, low, high, onChange,
}: {
  min: number; max: number; low: number; high: number;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const drag = (handle: "low" | "high", e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;

    const move = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = Math.round(min + ratio * (max - min));
      if (handle === "low")  onChange(Math.min(raw, high - 1000), high);
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
    <div className="relative h-5 flex items-center" ref={trackRef}>
      {/* Track */}
      <div className="absolute w-full h-1 bg-neutral-200 rounded-full" />
      {/* Fill */}
      <div
        className="absolute h-1 bg-black rounded-full"
        style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
      />
      {/* Low handle */}
      <div
        className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow cursor-grab active:cursor-grabbing z-10"
        style={{ left: `calc(${pct(low)}% - 10px)` }}
        onMouseDown={(e) => drag("low", e)}
        onTouchStart={(e) => drag("low", e)}
      />
      {/* High handle */}
      <div
        className="absolute w-5 h-5 bg-black border-2 border-black rounded-full shadow cursor-grab active:cursor-grabbing z-10"
        style={{ left: `calc(${pct(high)}% - 10px)` }}
        onMouseDown={(e) => drag("high", e)}
        onTouchStart={(e) => drag("high", e)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FILTER SIDEBAR COMPONENT (shared between desktop & mobile)
───────────────────────────────────────────────────────────── */
interface FilterSidebarProps {
  allProducts: Product[];
  categoryProducts: Product[];
  allCategoriesList: Category[];
  categoryCounts: Map<string, number>;
  selectedCategories: string[];
  onCategorySelect: (catSlugOrId: string) => void;
  onClearCategories: () => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  onClearBrands: () => void;
  pendingMin: string;
  pendingMax: string;
  setPendingMin: (v: string) => void;
  setPendingMax: (v: string) => void;
  priceError: string;
  onApplyPrice: () => void;
  sliderLow: number;
  sliderHigh: number;
  onSliderChange: (low: number, high: number) => void;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  newArrivalsOnly: boolean;
  setNewArrivalsOnly: (v: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  onSaleOnly: boolean;
  setOnSaleOnly: (v: boolean) => void;
  onApply: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}

function FilterSidebarContent({
  allProducts,
  categoryProducts,
  allCategoriesList,
  categoryCounts,
  selectedCategories,
  onCategorySelect,
  onClearCategories,
  sortKey,
  onSortChange,
  selectedBrands,
  onBrandToggle,
  onClearBrands,
  pendingMin,
  pendingMax,
  setPendingMin,
  setPendingMax,
  priceError,
  onApplyPrice,
  sliderLow,
  sliderHigh,
  onSliderChange,
  priceMin,
  priceMax,
  inStockOnly,
  setInStockOnly,
  newArrivalsOnly,
  setNewArrivalsOnly,
  featuredOnly,
  setFeaturedOnly,
  onSaleOnly,
  setOnSaleOnly,
  onApply,
  onClearAll,
  onClose,
}: FilterSidebarProps) {
  // Collapsible Accordion Sections
  const [openCat, setOpenCat] = useState(true);
  const [openBrand, setOpenBrand] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openStatus, setOpenStatus] = useState(true);

  // Search queries inside Category and Brand sections
  const [catSearch, setCatSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Build brand list from products in current category scope
  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();
    categoryProducts.forEach((p) => {
      const b = detectProductBrand(p);
      if (b && b !== "Other") map.set(b, (map.get(b) || 0) + 1);
    });
    return map;
  }, [categoryProducts]);

  const orderedBrands = useMemo(() => {
    const fromKnown = KNOWN_BRANDS.filter((b) => brandCounts.has(b));
    const extra     = Array.from(brandCounts.keys()).filter((b) => !KNOWN_BRANDS.includes(b));
    return [...fromKnown, ...extra];
  }, [brandCounts]);

  // Filtered categories & brands based on user search
  const filteredCategoriesList = useMemo(() => {
    if (!catSearch.trim()) return allCategoriesList;
    return allCategoriesList.filter((cat) =>
      cat.name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [allCategoriesList, catSearch]);

  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return orderedBrands;
    return orderedBrands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [orderedBrands, brandSearch]);

  return (
    <div className="flex flex-col gap-5 text-neutral-900">

      {/* ── 0. SORT BY ── */}
      <div className="pb-4 border-b border-neutral-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Sort By</p>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 outline-none cursor-pointer hover:border-black focus:border-black transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* ── 1. CATEGORIES (Searchable Accordion with Checkboxes) ── */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenCat(!openCat)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
            Categories
            {selectedCategories.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </span>
          {openCat ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openCat && (
          <div className="mt-3 space-y-2">
            {/* Category Search Input */}
            {allCategoriesList.length > 5 && (
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 outline-none focus:border-black"
                />
              </div>
            )}

            {/* Checkbox List */}
            <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              <label className="flex items-center justify-between text-xs cursor-pointer group py-1">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === 0}
                    onChange={onClearCategories}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className={`text-xs ${selectedCategories.length === 0 ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                    All Categories
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">({allProducts.length})</span>
              </label>

              {filteredCategoriesList.map((cat) => {
                const isSelected = selectedCategories.some(
                  (c) =>
                    c.toLowerCase() === cat.id.toLowerCase() ||
                    c.toLowerCase() === cat.slug.toLowerCase() ||
                    c.toLowerCase() === cat.name.toLowerCase()
                );
                const count = categoryCounts.get(cat.name.toLowerCase()) || 0;

                return (
                  <label key={cat.id} className="flex items-center justify-between text-xs cursor-pointer group py-1">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onCategorySelect(cat.slug || cat.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span className={`text-xs ${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. BRANDS (Searchable Accordion with Checkboxes) ── */}
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenBrand(!openBrand)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
            Brands
            {selectedBrands.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                {selectedBrands.length}
              </span>
            )}
          </span>
          {openBrand ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openBrand && (
          <div className="mt-3 space-y-2">
            {/* Brand Search Input */}
            {orderedBrands.length > 5 && (
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 outline-none focus:border-black"
                />
              </div>
            )}

            {/* Checkbox List */}
            <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              <label className="flex items-center justify-between text-xs cursor-pointer group py-1">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedBrands.length === 0}
                    onChange={onClearBrands}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className={`text-xs ${selectedBrands.length === 0 ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                    All Brands
                  </span>
                </div>
              </label>

              {filteredBrandsList.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                const count = brandCounts.get(brand) || 0;

                return (
                  <label key={brand} className="flex items-center justify-between text-xs cursor-pointer group py-1">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onBrandToggle(brand)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span className={`text-xs ${isSelected ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                        {brand}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="border-b border-neutral-100 pb-4">
        <button
          type="button"
          onClick={() => setOpenPrice(!openPrice)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Price Range (LKR)</span>
          {openPrice ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openPrice && (
          <div className="mt-4 space-y-3">
            {/* Slider */}
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

            {/* Price Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pendingMin}
                onChange={(e) => setPendingMin(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
              />
              <span className="text-neutral-400 text-xs">-</span>
              <input
                type="number"
                value={pendingMax}
                onChange={(e) => setPendingMax(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>
            {priceError && <p className="text-[10px] text-red-600 font-bold">{priceError}</p>}
            <button
              type="button"
              onClick={onApplyPrice}
              className="w-full py-2 bg-neutral-100 hover:bg-black hover:text-white rounded-lg text-xs font-bold text-neutral-800 transition-colors"
            >
              Set Price Range
            </button>
          </div>
        )}
      </div>

      {/* ── 4. PRODUCT STATUS & QUICK FILTERS ── */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => setOpenStatus(!openStatus)}
          className="w-full flex items-center justify-between py-1 text-left group mb-3"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Availability & Deals</span>
          {openStatus ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {openStatus && (
          <div className="space-y-2">
            {[
              { label: "In Stock Only", checked: inStockOnly, setter: setInStockOnly },
              { label: "New Arrivals", checked: newArrivalsOnly, setter: setNewArrivalsOnly },
              { label: "Featured Only", checked: featuredOnly, setter: setFeaturedOnly },
              { label: "On Sale", checked: onSaleOnly, setter: setOnSaleOnly },
            ].map(({ label, checked, setter }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer py-1 group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setter(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                />
                <span className={`text-xs ${checked ? "font-bold text-black" : "text-neutral-600 group-hover:text-black"}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. ACTIONS ── */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => { onApply(); onClose?.(); }}
          className="w-full py-3 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={() => { onClearAll(); onClose?.(); }}
          className="w-full py-1.5 text-xs font-bold text-neutral-400 hover:text-black transition-colors"
        >
          Clear All
        </button>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CLIENT COMPONENT
───────────────────────────────────────────────────────────── */
export default function ProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  /* ── URL‑synced state ── */
  const [searchQuery,    setSearchQuery]    = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    () => searchParams.get("brand") ? searchParams.get("brand")!.split(",").filter(Boolean) : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStockOnly,     setInStockOnly]     = useState(searchParams.get("stock") === "in_stock");
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(searchParams.get("new") === "true");
  const [featuredOnly,    setFeaturedOnly]    = useState(searchParams.get("featured") === "true");
  const [onSaleOnly,      setOnSaleOnly]      = useState(searchParams.get("sale") === "true");
  const [sortKey, setSortKey] = useState<SortKey>(
    () => (searchParams.get("sort") as SortKey) || "price-desc"
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ── Pending price state (committed only on "Apply Price") ── */
  const [pendingMin,  setPendingMin]  = useState(searchParams.get("minPrice") || "");
  const [pendingMax,  setPendingMax]  = useState(searchParams.get("maxPrice") || "");
  const [priceError,  setPriceError]  = useState("");

  /* ── Compute price bounds from catalog ── */
  const { catalogMin, catalogMax } = useMemo(() => {
    const prices = initialProducts.map((p) => p.price).filter(Boolean);
    return {
      catalogMin: prices.length ? Math.min(...prices) : 0,
      catalogMax: prices.length ? Math.max(...prices) : 500000,
    };
  }, [initialProducts]);

  /* ── Slider state mirrors committed price ── */
  const [sliderLow,  setSliderLow]  = useState(() => parseInt(searchParams.get("minPrice") || "0") || catalogMin);
  const [sliderHigh, setSliderHigh] = useState(() => parseInt(searchParams.get("maxPrice") || "0") || catalogMax);

  /* keep slider in sync when catalog loads */
  useEffect(() => {
    if (!searchParams.get("minPrice")) setSliderLow(catalogMin);
    if (!searchParams.get("maxPrice")) setSliderHigh(catalogMax);
  }, [catalogMin, catalogMax, searchParams]);

  /* ── ESC closes mobile drawer ── */
  useEffect(() => {
    if (!showMobileFilters) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowMobileFilters(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showMobileFilters]);

  /* ── Sync state from URL on navigation ── */
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      const matched = categories.find(
        (c) => c.slug.toLowerCase() === catParam.toLowerCase() || c.id.toLowerCase() === catParam.toLowerCase()
      );
      setSelectedCategories(matched ? [matched.id] : [catParam]);
    } else {
      setSelectedCategories([]);
    }

    const brandParam = searchParams.get("brand");
    setSelectedBrands(brandParam ? brandParam.split(",").filter(Boolean) : []);
    const pMin = searchParams.get("minPrice") || "";
    const pMax = searchParams.get("maxPrice") || "";
    setMinPrice(pMin); setPendingMin(pMin);
    setMaxPrice(pMax); setPendingMax(pMax);
    if (pMin) setSliderLow(parseInt(pMin));
    if (pMax) setSliderHigh(parseInt(pMax));
    setInStockOnly(searchParams.get("stock") === "in_stock");
    setNewArrivalsOnly(searchParams.get("new") === "true");
    setFeaturedOnly(searchParams.get("featured") === "true");
    setOnSaleOnly(searchParams.get("sale") === "true");
    setSortKey((searchParams.get("sort") as SortKey) || "price-desc");
    if (searchParams.get("search")) setSearchQuery(searchParams.get("search") || "");
  }, [searchParams, categories]);

  /* ── URL updater ── */
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "" || v === "false" || v === "all") params.delete(k);
        else params.set(k, v);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  /* ── Handlers ── */
  const handleCategorySelect = (slugOrId: string) => {
    if (!slugOrId) {
      setSelectedCategories([]);
      updateUrlParams({ category: null });
      return;
    }
    const matched = categories.find(
      (c) => c.slug.toLowerCase() === slugOrId.toLowerCase() || c.id.toLowerCase() === slugOrId.toLowerCase()
    );
    if (matched) {
      setSelectedCategories([matched.id]);
      updateUrlParams({ category: matched.slug });
    } else {
      setSelectedCategories([slugOrId]);
      updateUrlParams({ category: slugOrId });
    }
  };

  const handleBrandToggle = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
  };

  const handleClearBrands = () => setSelectedBrands([]);

  const handleSliderChange = (low: number, high: number) => {
    setSliderLow(low);
    setSliderHigh(high);
    setPendingMin(String(low));
    setPendingMax(String(high));
  };

  const handleApplyPrice = () => {
    const mn = pendingMin ? parseInt(pendingMin) : 0;
    const mx = pendingMax ? parseInt(pendingMax) : Infinity;
    if (pendingMin && pendingMax && mn > mx) {
      setPriceError("Min price cannot be greater than max price.");
      return;
    }
    setPriceError("");
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    if (pendingMin) setSliderLow(mn);
    if (pendingMax) setSliderHigh(mx === Infinity ? catalogMax : mx);
  };

  /* Apply all pending filters → push to URL */
  const handleApplyFilters = () => {
    handleApplyPrice();
    updateUrlParams({
      brand:    selectedBrands.length ? selectedBrands.join(",") : null,
      minPrice: pendingMin || null,
      maxPrice: pendingMax || null,
      stock:    inStockOnly ? "in_stock" : null,
      new:      newArrivalsOnly ? "true" : null,
      featured: featuredOnly    ? "true" : null,
      sale:     onSaleOnly      ? "true" : null,
      sort:     sortKey !== "price-desc" ? sortKey : null,
    });
  };

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    updateUrlParams({ sort: key !== "price-desc" ? key : null });
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice(""); setPendingMin(""); setMaxPrice(""); setPendingMax("");
    setSliderLow(catalogMin); setSliderHigh(catalogMax);
    setPriceError("");
    setInStockOnly(false); setNewArrivalsOnly(false);
    setFeaturedOnly(false); setOnSaleOnly(false);
    setSortKey("price-desc");
    router.replace(pathname, { scroll: false });
  };

  /* ── Category scope for brand counting ── */
  const categoryProducts = useMemo(() => {
    if (selectedCategories.length === 0) return initialProducts;
    return initialProducts.filter((p) =>
      selectedCategories.some((target) => {
        const t = target.toLowerCase();
        return (
          (p.category_id || "").toLowerCase() === t ||
          (p.category_name || p.categoryName || "").toLowerCase() === t ||
          (p.category_slug || p.categorySlug || "").toLowerCase() === t ||
          (p.category_name || p.categoryName || "").toLowerCase().includes(t)
        );
      })
    );
  }, [initialProducts, selectedCategories]);

  /* ── Filtered products — sort by effective selling price ── */
  const filteredProducts = useMemo(() => {
    // Helper: effective price = sale_price when valid, else price
    const effectivePrice = (p: Product): number => {
      if (p.sale_price && p.sale_price > 0 && p.sale_price < p.price) return p.sale_price;
      return p.price || 0;
    };

    let list = initialProducts.filter((product) => {
      // 1. Search
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((target) => {
          const t = target.toLowerCase();
          return (
            (product.category_id || "").toLowerCase() === t ||
            (product.category_name || product.categoryName || "").toLowerCase() === t ||
            (product.category_slug || product.categorySlug || "").toLowerCase() === t ||
            (product.category_name || product.categoryName || "").toLowerCase().includes(t)
          );
        });

      // 3. Brand (multi-select)
      const detectedBrand = detectProductBrand(product).toLowerCase();
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some((b) => {
          const bl = b.toLowerCase();
          return (
            detectedBrand === bl ||
            (product.brandName || "").toLowerCase() === bl ||
            (product.brand_name || "").toLowerCase() === bl ||
            (product.brand || "").toLowerCase() === bl ||
            product.name.toLowerCase().includes(bl)
          );
        });

      // 4. Price
      const mn = minPrice ? parseInt(minPrice) : 0;
      const mx = maxPrice ? parseInt(maxPrice) : Infinity;
      const matchesPrice = effectivePrice(product) >= mn && effectivePrice(product) <= mx;

      // 5. Quick filters
      const matchesStock    = !inStockOnly     || product.stock_status !== "out_of_stock";
      const matchesNew      = !newArrivalsOnly  || product.is_new_arrival === true;
      const matchesFeatured = !featuredOnly     || product.featured === true;
      const matchesSale     = !onSaleOnly       || !!(product.sale_price && product.sale_price < product.price);

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice &&
             matchesStock && matchesNew && matchesFeatured && matchesSale;
    });

    // Sort by effective selling price — products without price go last
    if (sortKey === "price-asc") {
      list = [...list].sort((a, b) => {
        const ea = effectivePrice(a), eb = effectivePrice(b);
        if (!ea && !eb) return 0;
        if (!ea) return 1;
        if (!eb) return -1;
        return ea - eb;
      });
    } else {
      // Default: price-desc (High to Low)
      list = [...list].sort((a, b) => {
        const ea = effectivePrice(a), eb = effectivePrice(b);
        if (!ea && !eb) return 0;
        if (!ea) return 1;
        if (!eb) return -1;
        return eb - ea;
      });
    }

    return list;
  }, [
    initialProducts, searchQuery, selectedCategories, selectedBrands,
    minPrice, maxPrice, inStockOnly, newArrivalsOnly, featuredOnly, onSaleOnly, sortKey,
  ]);

  // 1. Dynamic extraction of all Categories across Firestore categories prop AND actual products
  const allCategoriesList = useMemo(() => {
    const map = new Map<string, Category>();

    // Add categories prop from Firestore
    categories.forEach((c) => {
      if (c && c.name) {
        const cleanName = c.name.replace(/[\u0080-\uFFFF]/g, "").trim();
        const isBrand = KNOWN_BRANDS.some((b) => b.toLowerCase() === cleanName.toLowerCase());
        if (cleanName && !isBrand) {
          map.set(cleanName.toLowerCase(), { ...c, name: cleanName });
        }
      }
    });

    // Add any custom categories present on actual products
    initialProducts.forEach((p) => {
      const rawCat = (p.category_name || p.categoryName || "").trim();
      const cleanCat = rawCat.replace(/[\u0080-\uFFFF]/g, "").trim();
      const isBrand = KNOWN_BRANDS.some((b) => b.toLowerCase() === cleanCat.toLowerCase());

      if (cleanCat && !isBrand && !map.has(cleanCat.toLowerCase())) {
        const slug = p.category_slug || p.categorySlug || cleanCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        map.set(cleanCat.toLowerCase(), {
          id: `cat-${slug}`,
          name: cleanCat,
          slug: slug,
          icon: "📱",
          image_url: "",
          sort_order: 99,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, initialProducts]);

  // Count products for each category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    initialProducts.forEach((p) => {
      const rawCat = (p.category_name || p.categoryName || "").trim();
      const cleanCat = rawCat.replace(/[\u0080-\uFFFF]/g, "").trim().toLowerCase();
      if (cleanCat) {
        map.set(cleanCat, (map.get(cleanCat) || 0) + 1);
      }
    });
    return map;
  }, [initialProducts]);

  const handleClearCategories = () => {
    setSelectedCategories([]);
    updateUrlParams({ category: null });
  };

  /* ── Active filter chips ── */
  const activeFilters: { label: string; onRemove: () => void }[] = [
    ...selectedCategories.map((cId) => {
      const catObj = allCategoriesList.find((c) => c.id === cId || c.slug === cId || c.name.toLowerCase() === cId.toLowerCase());
      const label = catObj ? catObj.name : cId;
      return {
        label: `Category: ${label}`,
        onRemove: () => handleCategorySelect(cId),
      };
    }),
    ...selectedBrands.map((b) => ({
      label: `Brand: ${b}`,
      onRemove: () => {
        const next = selectedBrands.filter((x) => x !== b);
        setSelectedBrands(next);
        updateUrlParams({ brand: next.length ? next.join(",") : null });
      },
    })),
    ...(minPrice || maxPrice ? [{
      label: `${minPrice ? fmtLKR(parseInt(minPrice)) : "Any"} – ${maxPrice ? fmtLKR(parseInt(maxPrice)) : "Any"}`,
      onRemove: () => {
        setMinPrice(""); setPendingMin(""); setMaxPrice(""); setPendingMax("");
        setSliderLow(catalogMin); setSliderHigh(catalogMax);
        updateUrlParams({ minPrice: null, maxPrice: null });
      },
    }] : []),
    ...(inStockOnly ? [{ label: "In Stock Only", onRemove: () => { setInStockOnly(false); updateUrlParams({ stock: null }); } }] : []),
    ...(newArrivalsOnly ? [{ label: "New Arrivals", onRemove: () => { setNewArrivalsOnly(false); updateUrlParams({ new: null }); } }] : []),
    ...(featuredOnly ? [{ label: "Featured Only", onRemove: () => { setFeaturedOnly(false); updateUrlParams({ featured: null }); } }] : []),
    ...(onSaleOnly ? [{ label: "On Sale", onRemove: () => { setOnSaleOnly(false); updateUrlParams({ sale: null }); } }] : []),
  ];

  const hasActiveFilters = activeFilters.length > 0 || searchQuery;

  /* ── Shared sidebar props ── */
  const sidebarProps: FilterSidebarProps = {
    allProducts: initialProducts,
    categoryProducts,
    allCategoriesList,
    categoryCounts,
    selectedCategories,
    onCategorySelect: handleCategorySelect,
    onClearCategories: handleClearCategories,
    sortKey,
    onSortChange: handleSortChange,
    selectedBrands,
    onBrandToggle: handleBrandToggle,
    onClearBrands: handleClearBrands,
    pendingMin,
    pendingMax,
    setPendingMin,
    setPendingMax,
    priceError,
    onApplyPrice: handleApplyPrice,
    sliderLow,
    sliderHigh,
    onSliderChange: handleSliderChange,
    priceMin: catalogMin,
    priceMax: catalogMax,
    inStockOnly,
    setInStockOnly,
    newArrivalsOnly,
    setNewArrivalsOnly,
    featuredOnly,
    setFeaturedOnly,
    onSaleOnly,
    setOnSaleOnly,
    onApply: handleApplyFilters,
    onClearAll: handleClearAll,
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-white min-h-screen">

      {/* ── Slim Apple-Style Page Header ── */}
      <section className="bg-white border-b border-neutral-100 pt-6 pb-6">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                STREET MOBILE CATALOG
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                SHOP ALL
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1 max-w-xl font-medium">
                Explore our full collection of genuine smartphones, high-performance audio gear, and authentic accessories.
              </p>
            </div>

            {/* Quick Search & Mobile Filters Trigger */}
            <div className="flex items-center gap-3">
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateUrlParams({ search: e.target.value || null });
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); updateUrlParams({ search: null }); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilters.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-black flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Container (Wider max-w-[1440px]) ── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 sm:py-8 pb-20">

        {/* Count Bar */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-6">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Showing <strong className="text-neutral-900 font-extrabold">{filteredProducts.length}</strong> Products
          </span>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.onRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
              >
                {f.label}
                <X className="w-3 h-3 opacity-70" />
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); updateUrlParams({ search: null }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
              >
                &ldquo;{searchQuery}&rdquo;
                <X className="w-3 h-3 opacity-70" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-500 hover:border-black hover:text-black transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-[110px] bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
              <FilterSidebarContent {...sidebarProps} />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#F8F8F9] rounded-2xl border border-neutral-200">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No products found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Try clearing some filters or adjusting your search.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-4 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={filteredProducts.map((p) => p.id).join("-")}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={cardVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </main>

        </div>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col z-10 shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-20 rounded-t-3xl">
                <h3 className="font-black text-sm text-black flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filter Products
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto flex-1">
                <FilterSidebarContent
                  {...sidebarProps}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
