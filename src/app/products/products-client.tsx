"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Package,
  ArrowUpDown,
  Tag,
  ChevronLeft,
  ChevronRight,
  Truck,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Product, Category } from "@/lib/types";
import AddToBagButton from "@/components/cart/AddToBagButton";

/* ─── animation variants ─── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25 },
  },
};

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
];

type SortKey = "default" | "price_asc" | "price_desc" | "name_asc";

/* ─── Brand Filters ─── */
const BRAND_FILTERS = [
  "All", "Apple", "Samsung", "Google", "OnePlus", "Xiaomi",
  "Asus", "MSI", "Dell", "HP", "Lenovo",
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function ProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("All");

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

    if (sortKey === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortKey === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortKey === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [searchQuery, selectedCategories, minPrice, maxPrice, sortKey, selectedBrand, initialProducts]);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Categories
        </h3>
        <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? "bg-black border-black" : "border-gray-200"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="flex-1 truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-4">
          Price Range (Rs.)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all placeholder-gray-300"
          />
          <span className="text-gray-300 text-sm">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all placeholder-gray-300"
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
            className="w-full py-2.5 rounded-xl border border-gray-100 text-sm text-gray-400 hover:text-gray-700 hover:border-gray-200 transition-all"
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
          COLLECTION HEADER
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Soft background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-50 to-violet-50 blur-3xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-50 to-cyan-50 blur-3xl opacity-60" />
          {/* Noise texture via SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-20 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-xs font-semibold tracking-widest uppercase mb-6">
              <Sparkles className="w-3 h-3" />
              All Products
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-gray-900 mb-4">
              Explore Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                Collection
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Discover premium electronics, accessories, and gadgets from the world&apos;s leading brands.
            </p>
          </motion.div>

          {/* ── Large Search Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gray-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="w-full pl-14 pr-14 py-5 bg-white border border-gray-100 rounded-[22px] text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-200 focus:ring-4 focus:ring-blue-50 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.09)]"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Brand Filter Chips ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-2 mb-16"
          >
            {BRAND_FILTERS.map((brand) => {
              const isActive = selectedBrand === brand;
              return (
                <motion.button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
                      : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {brand}
                </motion.button>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTS CONTENT
      ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Desktop Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block w-64 shrink-0"
          >
            <div className="sticky top-20 bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <FilterSidebar />
            </div>
          </motion.aside>

          {/* ── Mobile Filters Toggle ── */}
          <div className="lg:hidden mb-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                showMobileFilters || hasActiveFilters
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* ── Mobile Filters Panel ── */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden overflow-hidden"
              >
                <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                  <FilterSidebar />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Products Area ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400"
              >
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span>{" "}
                products found
              </motion.p>

              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold text-gray-600 hover:border-gray-200 hover:text-gray-900 bg-white transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
                  {SORT_OPTIONS.find((s) => s.value === sortKey)?.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-300 transition-transform ${
                      showSortMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 py-2 z-20"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortKey(opt.value as SortKey);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            sortKey === opt.value
                              ? "text-gray-900 font-semibold bg-gray-50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {sortKey === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span className={sortKey === opt.value ? "" : "ml-5"}>{opt.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active filter chips */}
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
                      <motion.button
                        key={id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        onClick={() => toggleCategory(id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold"
                      >
                        {cat.name}
                        <X className="w-3 h-3" />
                      </motion.button>
                    ) : null;
                  })}
                  {selectedBrand !== "All" && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={() => setSelectedBrand("All")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold"
                    >
                      {selectedBrand}
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                  {(minPrice || maxPrice) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold"
                    >
                      Rs.{minPrice || "0"} – Rs.{maxPrice || "∞"}
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors ml-1"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-28 bg-gray-50 rounded-[28px] border border-gray-100"
              >
                <Package className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${searchQuery}-${selectedCategories.join()}-${minPrice}-${maxPrice}-${sortKey}-${selectedBrand}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={cardVariants} layout>
                      <Link
                        href={`/products/${product.slug}`}
                        className="group block bg-white rounded-[22px] overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] transition-all duration-400 flex flex-col h-full"
                        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                      >
                        {/* Image area */}
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 flex items-center justify-center overflow-hidden">
                          {product.old_price && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                              Sale
                            </div>
                          )}
                          {product.stock_status === "out_of_stock" && (
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                              Sold Out
                            </div>
                          )}
                          {product.stock_status === "low_stock" && (
                            <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                              Low Stock
                            </div>
                          )}
                          <div className="relative w-full h-full overflow-hidden rounded-xl">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                            />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-1">
                              {product.category_name}
                            </div>
                            <h3 className="font-semibold text-sm lg:text-base line-clamp-2 leading-snug text-gray-800 group-hover:text-gray-600 transition-colors duration-200">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-baseline gap-2 mt-auto pt-3 border-t border-gray-50">
                            <span className="font-black text-sm lg:text-base text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.old_price && (
                              <span className="text-xs text-gray-300 line-through">
                                {formatPrice(product.old_price)}
                              </span>
                            )}
                            {product.old_price && (
                              <span className="ml-auto text-[10px] font-black text-red-500">
                                {Math.round(
                                  ((product.old_price - product.price) / product.old_price) * 100
                                )}% OFF
                              </span>
                            )}
                          </div>
                          {product.stock_status !== "out_of_stock" && (
                            <AddToBagButton product={product} size="sm" className="w-full mt-1" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
