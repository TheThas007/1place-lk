"use client";

import { useState, useMemo } from "react";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || minPrice || maxPrice;

  const filteredProducts = useMemo(() => {
    let list = initialProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category_id);
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      const matchesPrice = product.price >= min && product.price <= max;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortKey === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortKey === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortKey === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [searchQuery, selectedCategories, minPrice, maxPrice, sortKey, initialProducts]);

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Categories
        </h3>
        <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? "bg-background border-background" : "border-border"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-foreground" />}
                </div>
                <span className="flex-1 truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Price Range (Rs.)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
          />
        </div>
      </div>

      {/* Clear */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={clearFilters}
            className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/8 to-violet-400/8 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-400/6 to-cyan-400/6 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              All Products
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
              Shop Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                Collection
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              {initialProducts.length} products across {categories.length} categories. Find your
              perfect device.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-2xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all shadow-sm"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/5"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
                showMobileFilters || hasActiveFilters
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border hover:bg-foreground/5"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center">
                  {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Desktop Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block w-64 shrink-0"
          >
            <div className="sticky top-20 bg-card border border-border rounded-3xl p-6">
              <FilterSidebar />
            </div>
          </motion.aside>

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
                <div className="bg-card border border-border rounded-3xl p-6 mb-4">
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
                className="text-sm text-muted-foreground"
              >
                <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
                products found
              </motion.p>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-foreground/5 transition-all"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  {SORT_OPTIONS.find((s) => s.value === sortKey)?.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
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
                      className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl shadow-black/5 py-2 z-20"
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
                              ? "text-foreground font-semibold bg-foreground/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium"
                      >
                        {cat.name}
                        <X className="w-3 h-3" />
                      </motion.button>
                    ) : null;
                  })}
                  {(minPrice || maxPrice) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-foreground text-xs font-medium"
                    >
                      Rs.{minPrice || "0"} – Rs.{maxPrice || "∞"}
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-border/50"
              >
                <Package className="w-12 h-12 text-border mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6 text-center max-w-xs">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-foreground text-background rounded-xl font-medium text-sm"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${searchQuery}-${selectedCategories.join()}-${minPrice}-${maxPrice}-${sortKey}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={cardVariants} layout>
                      <Link
                        href={`/products/${product.slug}`}
                        className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-2xl hover:shadow-black/5 transition-all duration-400 flex flex-col h-full"
                      >
                        {/* Image area */}
                        <div className="relative aspect-square bg-gradient-to-br from-foreground/3 to-foreground/6 p-4 flex items-center justify-center overflow-hidden">
                          {product.old_price && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                              Sale
                            </div>
                          )}
                          {product.stock_status === "out_of_stock" && (
                            <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                              Sold Out
                            </div>
                          )}
                          <div className="relative w-full h-full overflow-hidden rounded-xl">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                          </div>
                          {/* Shimmer overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/3 transition-all duration-400 rounded-2xl" />
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                              {product.category_name}
                            </div>
                            <h3 className="font-semibold text-sm lg:text-base line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors duration-200">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-baseline gap-2 mt-auto pt-2 border-t border-border/40">
                            <span className="font-bold text-sm lg:text-base">
                              {formatPrice(product.price)}
                            </span>
                            {product.old_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.old_price)}
                              </span>
                            )}
                            {product.old_price && (
                              <span className="ml-auto text-[10px] font-bold text-red-500">
                                {Math.round(
                                  ((product.old_price - product.price) / product.old_price) * 100
                                )}
                                % OFF
                              </span>
                            )}
                          </div>
                          {product.stock_status !== "out_of_stock" && (
                            <AddToBagButton product={product} size="sm" className="w-full mt-2" />
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
