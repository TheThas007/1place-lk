"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Check,
  X,
  ChevronDown,
  Package,
  ArrowUpDown,
  Tag,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Volume2,
  Zap,
  BatteryCharging,
  Cable,
  ShieldCheck,
  Grid,
} from "lucide-react";
import { Product, Category, OfferBanner } from "@/lib/types";
import ShopBannerSlider from "@/components/products/ShopBannerSlider";
import ProductCard from "@/components/products/ProductCard";

/* ─── Custom TWS Earbuds Icon ─── */
function EarbudsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="7.5" cy="7.5" r="3" fill="currentColor" />
      <path d="M7.5 10.5v6.5a1.5 1.5 0 0 0 3 0v-3.5" />
      <circle cx="16.5" cy="7.5" r="3" fill="currentColor" />
      <path d="M16.5 10.5v6.5a1.5 1.5 0 0 1-3 0v-3.5" />
    </svg>
  );
}

/* ─── Product Category Selectors (No Brand Names/Logos) ─── */
const PRODUCT_CATEGORIES = [
  { id: "all",          name: "All Products",   slug: "",             icon: Package },
  { id: "phones",       name: "Phones",         slug: "iphone",       icon: Smartphone },
  { id: "laptops",      name: "Laptops",        slug: "laptops",      icon: Laptop },
  { id: "watches",      name: "Smart Watches",  slug: "smart-watches",icon: Watch },
  { id: "earbuds",      name: "Earbuds",        slug: "earbuds",      icon: EarbudsIcon },
  { id: "headphones",   name: "Headphones",     slug: "headphones",   icon: Headphones },
  { id: "speakers",     name: "Speakers",       slug: "speakers",     icon: Volume2 },
  { id: "chargers",     name: "Chargers",       slug: "chargers",     icon: Zap },
  { id: "powerbanks",   name: "Power Banks",    slug: "power-banks",  icon: BatteryCharging },
  { id: "cables",       name: "Cables",         slug: "cables",       icon: Cable },
  { id: "cases",        name: "Cases & Covers", slug: "cases",        icon: ShieldCheck },
  { id: "accessories",  name: "Accessories",    slug: "accessories",  icon: Grid },
];

/* ─── animation variants ─── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2 },
  },
};

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
];

type SortKey = "default" | "price_asc" | "price_desc" | "name_asc";

const BRAND_FILTERS = [
  "All", "Apple", "Samsung", "Google", "OnePlus", "Xiaomi",
  "Oppo", "Vivo", "Realme", "Anker", "Baseus", "Ugreen",
];

export default function ProductsClient({
  initialProducts,
  categories,
  offerBanners = [],
}: {
  initialProducts: Product[];
  categories: Category[];
  offerBanners?: OfferBanner[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("All");

  const sortMenuRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const urlCategoryParam = searchParams ? searchParams.get("category") : null;

  useEffect(() => {
    if (urlCategoryParam && categories && categories.length > 0) {
      const matchedCategory = categories.find(
        (c) =>
          c.id.toLowerCase() === urlCategoryParam.toLowerCase() ||
          c.slug.toLowerCase() === urlCategoryParam.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategories([matchedCategory.id]);
      }
    }
  }, [urlCategoryParam, categories]);

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSortKey("default");
    setSelectedBrand("All");
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || minPrice || maxPrice || selectedBrand !== "All";

  // Deduplicate categories safely
  const uniqueCategories = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      if (cat && cat.id && !map.has(cat.id)) {
        map.set(cat.id, cat);
      }
    });
    return Array.from(map.values());
  }, [categories]);

  // Compute category product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = initialProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category_id);
      const matchesBrand =
        selectedBrand === "All" ||
        product.name.toLowerCase().includes(selectedBrand.toLowerCase()) ||
        (product.category_name ? product.category_name.toLowerCase().includes(selectedBrand.toLowerCase()) : false);
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      const matchesPrice = product.price >= min && product.price <= max;
      return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
    });

    if (sortKey === "price_asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortKey === "price_desc" || sortKey === "default") {
      // Universal brand model hierarchy sorting (e.g. S25 Ultra -> S24 Ultra -> S24 -> iPhone 17 Pro Max -> 17 Pro -> 16 Pro Max -> 16 -> Xiaomi 15 Ultra -> Redmi Note 14 Pro)
      const getModelRank = (n: string) => {
        const lower = n.toLowerCase();
        let score = 0;

        const numbers = lower.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          const gen = Math.max(...numbers.map((num) => parseInt(num)));
          if (gen < 2000) {
            score += gen * 1000;
          }
        }

        if (lower.includes("ultra")) score += 400;
        else if (lower.includes("pro max")) score += 350;
        else if (lower.includes("pro+")) score += 320;
        else if (lower.includes("fold")) score += 380;
        else if (lower.includes("pro")) score += 200;
        else if (lower.includes("plus")) score += 150;
        else if (lower.includes("flip")) score += 250;
        else if (lower.includes("fe")) score += 100;
        else if (lower.includes("mini")) score += 50;

        return score;
      };

      list = [...list].sort((a, b) => {
        const rankDiff = getModelRank(b.name) - getModelRank(a.name);
        if (rankDiff !== 0) return rankDiff;
        return b.price - a.price;
      });
    } else if (sortKey === "name_asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [searchQuery, selectedCategories, minPrice, maxPrice, sortKey, selectedBrand, initialProducts]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3.5 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-black" /> Shop by Brand
        </h3>
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {uniqueCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  isSelected
                    ? "bg-black text-white"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                      isSelected ? "border-white bg-white text-black" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className={`text-[11px] font-normal shrink-0 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Option directly inside Shop by Brand sidebar */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-black" /> Price Sort Order
        </h3>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setSortKey("price_desc")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
              sortKey === "price_desc" || sortKey === "default"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <span>Price: High → Low</span>
            {(sortKey === "price_desc" || sortKey === "default") && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          <button
            type="button"
            onClick={() => setSortKey("price_asc")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
              sortKey === "price_asc"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <span>Price: Low → High</span>
            {sortKey === "price_asc" && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">
          Price Range (Rs.)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-300"
          />
          <span className="text-gray-300 text-xs">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-300"
          />
        </div>
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={clearFilters}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:text-black hover:border-black transition-all"
          >
            Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* ═══════════════════════════════════════════
          COLLECTION HEADER (Clearance for Navbar)
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white pt-[76px] sm:pt-[84px] lg:pt-[92px] pb-4">
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6">

          {/* ── Search Bar ── */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm hover:border-gray-300"
              />
              <AnimatePresence>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Visual Product Category Selectors (No Brand Logos/Names) ── */}
          <div className="mb-8 overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar py-2 px-1 text-black">
              {PRODUCT_CATEGORIES.map((item) => {
                const IconComponent = item.icon;
                const isSelected =
                  item.id === "all"
                    ? selectedCategories.length === 0 && !searchQuery
                    : categories.some(
                        (c) =>
                          selectedCategories.includes(c.id) &&
                          (c.slug.toLowerCase().includes(item.slug.toLowerCase()) ||
                            c.name.toLowerCase().includes(item.name.toLowerCase()) ||
                            item.name.toLowerCase().includes(c.name.toLowerCase()))
                      );

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "all" || !item.slug) {
                        setSelectedCategories([]);
                        setSearchQuery("");
                        window.history.pushState(null, "", "/products");
                      } else {
                        const matched = categories.filter(
                          (c) =>
                            c.slug.toLowerCase().includes(item.slug.toLowerCase()) ||
                            c.name.toLowerCase().includes(item.name.toLowerCase()) ||
                            item.name.toLowerCase().includes(c.name.toLowerCase())
                        );
                        if (matched.length > 0) {
                          setSelectedCategories(matched.map((m) => m.id));
                        } else {
                          setSelectedCategories([]);
                          setSearchQuery(item.name);
                        }
                        window.history.pushState(null, "", `/products?category=${item.slug}`);
                      }
                    }}
                    className="group flex flex-col items-center shrink-0 snap-start focus:outline-none"
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-2 border-black bg-[#F5F5F7] shadow-sm"
                          : "border border-[#EAEAEA] hover:border-black bg-white shadow-xs"
                      }`}
                    >
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-black transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <span
                      className={`text-xs mt-2.5 text-center max-w-[96px] truncate transition-colors ${
                        isSelected
                          ? "font-bold text-black"
                          : "font-medium text-gray-600 group-hover:text-black"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTS CONTENT
      ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
        {/* Offer Banner Slider */}
        <ShopBannerSlider banners={offerBanners} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-[120px] bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* ── Mobile Filters Toggle ── */}
          <div className="lg:hidden mb-2 flex items-center justify-between">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                showMobileFilters || hasActiveFilters
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-200 text-gray-700 hover:border-black"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                </span>
              )}
            </button>

            <span className="text-xs text-gray-500 font-medium">
              <strong className="text-black">{filteredProducts.length}</strong> items
            </span>
          </div>

          {/* ── Mobile Filters Slide-Up Bottom Sheet ── */}
          <AnimatePresence>
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative bg-white rounded-t-3xl border-t border-gray-100 max-h-[85vh] flex flex-col z-10 shadow-2xl overflow-hidden"
                >
                  <div className="pt-4 pb-4 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-black" />
                      <h3 className="font-bold text-sm text-black">Filter Products</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <FilterSidebar />
                  </div>

                  <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-20">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-900 transition-all shadow-md"
                    >
                      Apply Filters ({filteredProducts.length} Results)
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ── Products Area ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                <strong className="text-black font-bold">{filteredProducts.length}</strong> products found
              </p>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-black hover:text-black bg-white transition-all shadow-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <span>{SORT_OPTIONS.find((s) => s.value === sortKey)?.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      showSortMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-30"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortKey(opt.value as SortKey);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors ${
                            sortKey === opt.value
                              ? "text-black font-bold bg-gray-50"
                              : "text-gray-600 hover:text-black hover:bg-gray-50"
                          }`}
                        >
                          {sortKey === opt.value ? (
                            <Check className="w-3.5 h-3.5 text-black shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Filter Chips */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 mb-5 overflow-hidden"
                >
                  {selectedCategories.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    return cat ? (
                      <button
                        key={id}
                        onClick={() => toggleCategory(id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium"
                      >
                        <span>{cat.name}</span>
                        <X className="w-3 h-3 text-white/70 hover:text-white" />
                      </button>
                    ) : null;
                  })}
                  {selectedBrand !== "All" && (
                    <button
                      onClick={() => setSelectedBrand("All")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium"
                    >
                      <span>{selectedBrand}</span>
                      <X className="w-3 h-3 text-white/70 hover:text-white" />
                    </button>
                  )}
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-medium"
                    >
                      <span>
                        Rs.{minPrice || "0"} – Rs.{maxPrice || "∞"}
                      </span>
                      <X className="w-3 h-3 text-gray-500 hover:text-black" />
                    </button>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-black underline underline-offset-2 transition-colors ml-1 font-medium"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                <Package className="w-10 h-10 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-gray-500 text-xs mb-5 text-center max-w-xs">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold text-xs hover:bg-gray-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
