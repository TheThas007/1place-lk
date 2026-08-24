"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Package,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Search,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Product, Category, Brand } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import ShopFilterSidebar, { detectProductBrand } from "@/components/products/ShopFilterSidebar";

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  brands?: Brand[];
}

const PRIMARY_CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "phones", label: "Phones", filterKeywords: ["phone", "smartphone", "iphone", "galaxy", "redmi", "pixel"] },
  { id: "laptops-tablets", label: "Laptop & Tab", filterKeywords: ["laptop", "macbook", "tablet", "tab", "ipad"] },
  { id: "audio", label: "Audio", filterKeywords: ["audio", "headphone", "earphone", "speaker", "airpod", "buds"] },
  { id: "wearables", label: "Wearables", filterKeywords: ["watch", "band", "wearable"] },
  { id: "power", label: "Power", filterKeywords: ["power", "battery", "charger", "cable", "adapter"] },
  { id: "accessories", label: "Accessories", filterKeywords: ["accessory", "case", "cover", "tempered", "gimbal"] },
];

const ITEMS_PER_PAGE = 16;

function getEffectivePrice(p: Product): number {
  if (p.sale_price && p.sale_price > 0 && p.sale_price < p.price) {
    return p.sale_price;
  }
  return p.price || 0;
}

export default function ProductsClient({
  initialProducts = [],
  categories = [],
  brands = [],
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── 1. Category Tab State ── */
  const [activePrimaryTab, setActivePrimaryTab] = useState<string>(
    () => searchParams.get("tab") || "all"
  );

  /* ── 2. Filters State ── */
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const p = searchParams.get("category");
    return p ? p.split(",").filter(Boolean) : [];
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const p = searchParams.get("brand");
    return p ? p.split(",").filter(Boolean) : [];
  });

  const [inStockOnly, setInStockOnly] = useState(searchParams.get("stock") === "in_stock");
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(() => {
    const p = searchParams.get("avail");
    return p ? p.split(",").filter(Boolean) : [];
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortKey, setSortKey] = useState<string>(searchParams.get("sort") || "featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* ── 3. Price State ── */
  const [pendingMin, setPendingMin] = useState(searchParams.get("minPrice") || "");
  const [pendingMax, setPendingMax] = useState(searchParams.get("maxPrice") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [priceError, setPriceError] = useState("");
  const [sliderLow, setSliderLow] = useState(0);
  const [sliderHigh, setSliderHigh] = useState(1000000);

  /* ── 4. Pagination State ── */
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = searchParams.get("page");
    return p ? Math.max(1, parseInt(p)) : 1;
  });
  const [mobileVisibleCount, setMobileVisibleCount] = useState(ITEMS_PER_PAGE);

  /* ── 5. Mobile Filter Drawer ── */
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ── URL Parameter Synchronization ── */
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === "" || val === undefined) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handlePrimaryTabChange = (tabId: string) => {
    setActivePrimaryTab(tabId);
    setCurrentPage(1);
    updateUrlParams({ tab: tabId === "all" ? null : tabId, page: null });
  };

  const handleToggleCategory = (catId: string) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter((c) => c !== catId)
      : [...selectedCategories, catId];
    setSelectedCategories(updated);
    setCurrentPage(1);
    updateUrlParams({ category: updated.length ? updated.join(",") : null, page: null });
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
    updateUrlParams({ category: null, page: null });
  };

  const handleToggleBrand = (brandName: string) => {
    const updated = selectedBrands.includes(brandName)
      ? selectedBrands.filter((b) => b !== brandName)
      : [...selectedBrands, brandName];
    setSelectedBrands(updated);
    setCurrentPage(1);
    updateUrlParams({ brand: updated.length ? updated.join(",") : null, page: null });
  };

  const handleClearBrands = () => {
    setSelectedBrands([]);
    setCurrentPage(1);
    updateUrlParams({ brand: null, page: null });
  };

  const handleToggleInStock = () => {
    const next = !inStockOnly;
    setInStockOnly(next);
    setCurrentPage(1);
    updateUrlParams({ stock: next ? "in_stock" : null, page: null });
  };

  const handleToggleAvailability = (avail: string) => {
    const updated = selectedAvailability.includes(avail)
      ? selectedAvailability.filter((a) => a !== avail)
      : [...selectedAvailability, avail];
    setSelectedAvailability(updated);
    setCurrentPage(1);
    updateUrlParams({ avail: updated.length ? updated.join(",") : null, page: null });
  };

  const handleApplyPrice = () => {
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    setCurrentPage(1);
    updateUrlParams({
      minPrice: pendingMin || null,
      maxPrice: pendingMax || null,
      page: null,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortKey(newSort);
    updateUrlParams({ sort: newSort === "featured" ? null : newSort });
  };

  const handleClearAll = () => {
    setActivePrimaryTab("all");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSelectedAvailability([]);
    setPendingMin("");
    setPendingMax("");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortKey("featured");
    setCurrentPage(1);
    router.push(pathname, { scroll: false });
  };

  /* ── Filtered and Sorted Products ── */
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // 1. Primary Tab Filter
        if (activePrimaryTab && activePrimaryTab !== "all") {
          const tabObj = PRIMARY_CATEGORY_TABS.find((t) => t.id === activePrimaryTab);
          if (tabObj && tabObj.filterKeywords) {
            const pName = (p.name || "").toLowerCase();
            const pCat = (p.category_name || p.categoryName || "").toLowerCase();
            const pGroup = (p.productType || "").toLowerCase();

            const matchesTab = tabObj.filterKeywords.some(
              (kw) => pName.includes(kw) || pCat.includes(kw) || pGroup.includes(kw)
            );
            if (!matchesTab) return false;
          }
        }

        // 2. Sidebar Categories
        if (selectedCategories.length > 0) {
          const cName = (p.category_name || p.categoryName || "").toLowerCase();
          const cId = (p.category_id || p.category_slug || "").toLowerCase();

          const matchesCategory = selectedCategories.some((sel) => {
            const s = sel.toLowerCase();
            return cName.includes(s) || cId.includes(s) || s.includes(cName);
          });
          if (!matchesCategory) return false;
        }

        // 3. Brand
        if (selectedBrands.length > 0) {
          const brand = detectProductBrand(p);
          if (!selectedBrands.includes(brand)) return false;
        }

        // 4. In Stock Only
        if (inStockOnly || selectedAvailability.includes("in_stock")) {
          if (p.stock_status === "out_of_stock" || (typeof p.stock_count === "number" && p.stock_count <= 0)) {
            return false;
          }
        }

        // 5. Price Filter
        const effPrice = getEffectivePrice(p);
        if (minPrice && effPrice < Number(minPrice)) return false;
        if (maxPrice && effPrice > Number(maxPrice)) return false;

        // 6. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const pName = (p.name || "").toLowerCase();
          const pBrand = (p.brand_name || p.brand || "").toLowerCase();
          const pCat = (p.category_name || "").toLowerCase();
          const pDesc = (p.description || "").toLowerCase();

          const matchesSearch =
            pName.includes(q) || pBrand.includes(q) || pCat.includes(q) || pDesc.includes(q);
          if (!matchesSearch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pa = getEffectivePrice(a);
        const pb = getEffectivePrice(b);

        if (sortKey === "price_asc" || sortKey === "price-asc") return pa - pb;
        if (sortKey === "price_desc" || sortKey === "price-desc") return pb - pa;
        if (sortKey === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortKey === "discount" || sortKey === "biggest-discount") {
          const discA = a.old_price && a.old_price > a.price ? (a.old_price - a.price) / a.old_price : 0;
          const discB = b.old_price && b.old_price > b.price ? (b.old_price - b.price) / b.old_price : 0;
          return discB - discA;
        }
        // Default: Featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    initialProducts,
    activePrimaryTab,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    selectedAvailability,
    minPrice,
    maxPrice,
    searchQuery,
    sortKey,
  ]);

  /* ── Active Filter Chips ── */
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (activePrimaryTab !== "all") {
      const t = PRIMARY_CATEGORY_TABS.find((tab) => tab.id === activePrimaryTab);
      chips.push({
        id: "tab",
        label: t?.label || activePrimaryTab,
        onRemove: () => handlePrimaryTabChange("all"),
      });
    }

    selectedCategories.forEach((c) => {
      chips.push({
        id: `cat-${c}`,
        label: c,
        onRemove: () => handleToggleCategory(c),
      });
    });

    selectedBrands.forEach((b) => {
      chips.push({
        id: `brand-${b}`,
        label: b,
        onRemove: () => handleToggleBrand(b),
      });
    });

    if (inStockOnly) {
      chips.push({
        id: "instock",
        label: "In Stock",
        onRemove: handleToggleInStock,
      });
    }

    if (minPrice || maxPrice) {
      const mn = minPrice ? `From LKR ${Number(minPrice).toLocaleString()}` : "";
      const mx = maxPrice ? `Up to LKR ${Number(maxPrice).toLocaleString()}` : "";
      chips.push({
        id: "price",
        label: [mn, mx].filter(Boolean).join(" - "),
        onRemove: () => {
          setPendingMin("");
          setPendingMax("");
          setMinPrice("");
          setMaxPrice("");
          updateUrlParams({ minPrice: null, maxPrice: null, page: null });
        },
      });
    }

    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: `"${searchQuery.trim()}"`,
        onRemove: () => {
          setSearchQuery("");
          updateUrlParams({ search: null, page: null });
        },
      });
    }

    return chips;
  }, [
    activePrimaryTab,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    minPrice,
    maxPrice,
    searchQuery,
    updateUrlParams,
  ]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page: page === 1 ? null : page.toString() });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const sidebarProps = {
    allProducts: initialProducts,
    categories,
    selectedCategories,
    onToggleCategory: handleToggleCategory,
    onClearCategories: handleClearCategories,
    selectedBrands,
    onToggleBrand: handleToggleBrand,
    onClearBrands: handleClearBrands,
    priceMin: 0,
    priceMax: 1000000,
    sliderLow,
    sliderHigh,
    onSliderChange: (low: number, high: number) => {
      setSliderLow(low);
      setSliderHigh(high);
    },
    pendingMin,
    pendingMax,
    setPendingMin,
    setPendingMax,
    priceError,
    onApplyPrice: handleApplyPrice,
    selectedAvailability,
    onToggleAvailability: handleToggleAvailability,
    onClearAll: handleClearAll,
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans pb-24">
      <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto pt-4 sm:pt-6">
        
        {/* ── 1. Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-4 select-none"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-black font-bold">Shop All</span>
        </nav>

        {/* ── 2. Page Header & Mobile Search Bar (Top Search on Mobile) ── */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Shop All Products
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Discover genuine smartphones, laptops and official accessories.
            </p>
          </div>

          {/* ── Mobile Top Search Bar (Dedicated Mobile Search UI) ── */}
          <div className="mt-2 mb-3.5 block">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                  updateUrlParams({ search: e.target.value.trim() || null, page: null });
                }}
                placeholder="Search phones, laptops, audio, accessories..."
                className="w-full h-11 sm:h-12 pl-10 pr-10 text-xs sm:text-sm font-medium bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200/80 focus:border-black rounded-2xl outline-none transition-all shadow-2xs focus:ring-2 focus:ring-black/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                    updateUrlParams({ search: null, page: null });
                  }}
                  className="absolute right-3 p-1 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5 px-1 font-medium">
                <span>
                  Showing results for <strong className="text-neutral-900">"{searchQuery.trim()}"</strong>
                </span>
                <span>{filteredProducts.length} items found</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Primary Category Tabs (Sleek Horizontal Scroll on Mobile & Desktop) ── */}
        <div className="flex items-center justify-start border-b border-neutral-200 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 sm:gap-4 pb-2 sm:pb-0">
            {PRIMARY_CATEGORY_TABS.map((tab) => {
              const isActive = activePrimaryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePrimaryTabChange(tab.id)}
                  className={`relative py-2 sm:py-3.5 px-3.5 sm:px-4 rounded-full sm:rounded-none text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shrink-0 ${
                    isActive
                      ? "bg-black text-white sm:bg-transparent sm:text-black sm:font-extrabold sm:border-b-2 sm:border-black sm:-mb-[1px] shadow-xs sm:shadow-none"
                      : "bg-[#F5F5F7] text-neutral-600 hover:text-black hover:bg-neutral-200/80 sm:bg-transparent sm:border-b-2 sm:border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. Compact Toolbar Row ── */}
        <div className="flex items-center justify-between gap-2.5 mb-4 sm:mb-6 flex-wrap">
          {/* Left: Filtered Count */}
          <div className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5">
            <span>{filteredProducts.length}</span>
            <span className="text-neutral-500 font-normal">
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          </div>

          {/* Right: Filters Button, In Stock, Sort, View Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Filters Button (Mobile & Desktop Toggle) */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                activeChips.length > 0
                  ? "bg-black text-white border border-black"
                  : "bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-black flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* In Stock Toggle */}
            <button
              type="button"
              onClick={handleToggleInStock}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                inStockOnly
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-200/90 hover:bg-neutral-50"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${inStockOnly ? "bg-white border-white text-black" : "border-neutral-400"}`}>
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span className="hidden sm:inline">In Stock</span>
              <span className="sm:hidden">Stock</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <select
                value={sortKey}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-neutral-200/90 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-800 outline-none cursor-pointer shadow-2xs hover:bg-neutral-50"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-neutral-100 text-black font-bold" : "text-neutral-400 hover:text-black"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-neutral-100 text-black font-bold" : "text-neutral-400 hover:text-black"
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. Active Filter Chips Row ── */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6 pb-2">
            <span className="text-xs font-bold text-neutral-500">Active Filters:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200/80 rounded-full text-xs font-semibold text-neutral-800"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="p-0.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-[#ED0712] hover:text-red-700 ml-2 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── 6. Two-Column Layout (Sidebar + Product Grid) ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Filter Sidebar (240px wide, sticky below navbar) */}
          <aside className="hidden lg:block w-[240px] shrink-0 sticky top-28 self-start bg-white">
            <ShopFilterSidebar {...sidebarProps} />
          </aside>

          {/* Main Product Grid Area */}
          <main className="flex-1 min-w-0 w-full">
            {filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-[#FAFAFB] border border-neutral-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xs my-8">
                <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-neutral-400 shadow-2xs">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 tracking-tight mb-1">
                  No products match your filters.
                </h3>
                <p className="text-xs text-neutral-500 mb-5">
                  Try clearing your selected filters or searching for another term.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Product Grid (4 Columns Desktop) */
              <div>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
                      : "grid grid-cols-1 gap-3 sm:gap-4"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ── 7. Desktop Pagination Controls ── */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-black text-white shadow-xs"
                              : "text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* ── 8. Mobile Filter Full-Height Bottom Sheet / Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col z-10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-black" />
                <h3 className="font-extrabold text-sm text-black">Filter Products</h3>
                {activeChips.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black">
                    {activeChips.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
              <ShopFilterSidebar {...sidebarProps} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-neutral-100 flex items-center gap-3 sticky bottom-0 z-20">
              <button
                type="button"
                onClick={handleClearAll}
                className="py-3 px-4 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Show {filteredProducts.length} Products</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
