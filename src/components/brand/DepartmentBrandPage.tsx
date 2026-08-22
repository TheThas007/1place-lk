"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Check, X, Search } from "lucide-react";
import { DepartmentBrandPageConfig, Brand, Department, Product, Category } from "@/lib/types";
import DepartmentBrandHero from "./DepartmentBrandHero";
import ProductCard from "@/components/products/ProductCard";

interface DepartmentBrandPageProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
  products: Product[];
  categories: Category[];
  allBrands: Brand[];
}

export default function DepartmentBrandPage({
  config,
  brand,
  department,
  products = [],
  categories = [],
  allBrands = [],
}: DepartmentBrandPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryParam = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryParam);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(selectedCategoryParam);
  }, [selectedCategoryParam]);

  // Compute all categories present among these department-brand products
  const availableCategories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    products.forEach((p) => {
      const cSlug = (p.category_slug || p.categorySlug || p.category_id || p.category_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const cName = p.category_name || p.categoryName || cSlug.replace(/-/g, " ");
      if (cSlug) {
        const existing = map.get(cSlug);
        if (existing) existing.count += 1;
        else map.set(cSlug, { slug: cSlug, name: cName, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Handle Tab Selection with URL sync
  const handleTabChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug === "all") {
      params.delete("category");
    } else {
      params.set("category", catSlug);
    }
    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && selectedCategory !== "all") {
          const cSlug = (p.category_slug || p.categorySlug || p.category_id || p.category_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
          if (cSlug !== selectedCategory.toLowerCase()) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (p.name || "").toLowerCase().includes(q);
          const matchesDesc = (p.description || "").toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        // In-stock only filter
        if (inStockOnly && p.stock_status === "out_of_stock") {
          return false;
        }

        // Price Filter
        if (priceRange > 0 && p.price > priceRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === "discount") {
          const discA = a.old_price && a.old_price > a.price ? (a.old_price - a.price) / a.old_price : 0;
          const discB = b.old_price && b.old_price > b.price ? (b.old_price - b.price) / b.old_price : 0;
          return discB - discA;
        }
        // Default: featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, priceRange, sortBy]);

  // Related Cross-Sell Products (Products from other brands in the same department)
  const relatedProducts = useMemo(() => {
    if (!config.relatedSectionEnabled) return [];
    return products.filter((p) => p.featured).slice(0, 8);
  }, [config.relatedSectionEnabled, products]);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 500000;
    return Math.max(...products.map((p) => p.price || 0), 100000);
  }, [products]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070707] text-neutral-900 dark:text-white pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Breadcrumb Navigation ── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-6 overflow-x-auto whitespace-nowrap py-1 select-none"
        >
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">
            Shop by Brand
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-500 font-medium">{department.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-black dark:text-white font-extrabold">{brand.name}</span>
        </nav>

        {/* ── Hero Banner ── */}
        <DepartmentBrandHero config={config} brand={brand} department={department} />

        {/* ── Category / Subcategory Navigation Filter Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-8 select-none">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-xs ${
              selectedCategory === "all"
                ? "bg-black dark:bg-white text-white dark:text-black shadow-md scale-[1.02]"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-800"
            }`}
          >
            All {brand.name} ({products.length})
          </button>

          {availableCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleTabChange(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-xs ${
                selectedCategory === cat.slug
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md scale-[1.02]"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* ── Filter Bar & Sorter Controls ── */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Search input inside brand */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${brand.name}...`}
              className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 pl-9 pr-4 py-2 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick toggles & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In stock toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none bg-neutral-50 dark:bg-neutral-800/80 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 px-3.5 py-1.5 rounded-xl text-xs font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer font-bold"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>

            {/* Product Count Pill */}
            <span className="text-xs font-bold text-neutral-500 font-mono pl-1">
              Showing {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div id="products">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                No matching products found
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                Try resetting your filters or selecting a different category tab above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setInStockOnly(false);
                }}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-md hover:opacity-90 active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Related / Compatible Showcase Rail ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-red-600 font-mono">
                  COMPATIBLE &amp; FEATURED
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {config.relatedSectionHeading || `Popular ${brand.name} Products`}
                </h2>
              </div>
              <Link
                href={`/products?brand=${brand.slug}`}
                className="text-xs font-extrabold text-red-600 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <span>View All {brand.name}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={`rel-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
