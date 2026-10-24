"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Search,
  X,
  Heart,
  ShoppingBag,
  Check,
  Star,
  ShieldCheck,
} from "lucide-react";
import { DepartmentBrandPageConfig, Brand, Department, Product, Category } from "@/lib/types";
import DepartmentBrandHero from "./DepartmentBrandHero";
import { formatPrice, announceToScreenReader, getProductSlug } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { resolveProductSwatches } from "@/lib/color-utils";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";
import { getProductCategory } from "@/lib/catalog-utils";

interface DepartmentBrandPageProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
  products: Product[];
  categories: Category[];
  allBrands: Brand[];
}

// ── Reusable 4-Column Product Card Matching the Reference Image ──
function BrandProductCard({ product }: { product: Product }) {
  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (typeof product.stock_count === "number" && product.stock_count <= 0);

  const hasDiscount =
    Boolean(product.old_price) &&
    typeof product.old_price === "number" &&
    typeof product.price === "number" &&
    product.old_price > product.price &&
    Math.round(((product.old_price - product.price) / product.old_price) * 100) > 0;

  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : 0;

  const isNew =
    product.featured ||
    (product.created_at &&
      Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000);

  const mainImage =
    !imgError && product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder-phone.webp";

  // Variant Specs summary (e.g. "256GB | Natural Titanium")
  const defaultStorage =
    product.storage_options && product.storage_options.length > 0
      ? product.storage_options[0]
      : "128GB";

  const defaultColorName =
    product.colors && product.colors.length > 0 && typeof product.colors[0] === "string"
      ? product.colors[0]
      : "Standard";

  // Color Swatches
  const productSwatches = resolveProductSwatches(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product,
      color: product.colors?.[0],
      storage: product.storage_options?.[0],
      quantity: 1,
      image: mainImage,
      onSuccess: () => {
        setAdded(true);
        announceToScreenReader(`${product.name} added to bag.`);
        setTimeout(() => {
          setAdded(false);
        }, 2000);
      },
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const imgSettings = product.imageSettings || product.productImageSettings;
  const isCover = imgSettings?.fit === "cover";
  const userScale = typeof imgSettings?.scale === "number" ? imgSettings.scale / 100 : 1.0;
  const posX = typeof imgSettings?.positionX === "number" ? imgSettings.positionX : 0;
  const posY = typeof imgSettings?.positionY === "number" ? imgSettings.positionY : 0;

  return (
    <div className="group relative bg-white border border-neutral-200/90 rounded-xl overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between h-full">
      <Link href={`/products/${getProductSlug(product)}`} className="block flex-1 flex flex-col focus:outline-none">

        {/* ── Top Badges & Image Box (Equal responsive height, pure white background, seamless blend) ── */}
        <div className="product-image-container relative w-full h-[180px] sm:h-[220px] md:h-[240px] aspect-square bg-white flex items-center justify-center overflow-hidden border-b border-neutral-100/80">

          {/* ── Approved Offer Badge Position: Bottom-Left Corner (Anchored to Image Container) ── */}
          <div className="product-offer-badge absolute bottom-0 left-0 z-10 flex flex-col items-start pointer-events-none">
            {hasDiscount ? (
              <span className="bg-[#ED0712] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-tr-lg shadow-2xs inline-block">
                -{discountPercent}% OFF
              </span>
            ) : isNew ? (
              <span className="bg-[#090909] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-tr-lg shadow-2xs inline-block">
                NEW
              </span>
            ) : null}
          </div>

          {/* Top-Right Wishlist Heart Icon */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? `Remove from wishlist` : `Add to wishlist`}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/60 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
                }`}
            />
          </button>

          {/* Centered Product Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden p-1.5 sm:p-2.5">
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full max-w-full max-h-full object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* ── Details Section ── */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Warranty Subtitle (Only when genuinely available) */}
            {product.warranty && product.warranty.trim() !== "" && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mb-1 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{product.warranty}</span>
              </div>
            )}

            {/* Product Title */}
            <h3 className="font-bold text-xs sm:text-[15px] text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-600 transition-colors mb-1">
              {product.name}
            </h3>

            {/* Price Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
                  {formatPrice(product.old_price!)}
                </span>
              )}
            </div>

            {/* Color Swatch Dots (Only if genuine swatches exist) */}
            {productSwatches.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2.5" aria-label="Available Colors">
                {productSwatches.slice(0, 5).map((swatch, idx) => (
                  <span
                    key={idx}
                    title={swatch.name}
                    aria-label={swatch.name}
                    style={{ backgroundColor: swatch.hex }}
                    className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-2xs inline-block shrink-0"
                  />
                ))}
                {productSwatches.length > 5 && (
                  <span className="text-[9px] font-bold text-neutral-400">
                    +{productSwatches.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rating & Live Stock Status */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 mt-auto gap-2">
            {product.rating && product.rating > 0 ? (
              <div className="flex items-center gap-1 text-neutral-700 font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            ) : <div />}

            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOutOfStock
                    ? "bg-neutral-400"
                    : "bg-emerald-500"
                  }`}
              />
              <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-700">
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Solid Black Add to Bag Action (Minimum 44px Touch Height) ── */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 bg-white">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`w-full min-h-[44px] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${isOutOfStock
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : added
                ? "bg-emerald-600 text-white"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          aria-label={`Add ${product.name} to bag`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Bag</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
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
  const [selectedStorage, setSelectedStorage] = useState<string>("all");
  const [selectedColour, setSelectedColour] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    setSelectedCategory(selectedCategoryParam);
  }, [selectedCategoryParam]);

  // Compute all available categories from products in this department
  const availableCategories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    products.forEach((p) => {
      const cName = getProductCategory(p);
      const cSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (cSlug) {
        const existing = map.get(cSlug);
        if (existing) existing.count += 1;
        else map.set(cSlug, { slug: cSlug, name: cName, count: 1 });
      }
    });
    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [products]);

  // Underline category tabs matching department products
  const categoryNavigationTabs = useMemo(() => {
    const deptLabel = department.name || "Products";
    const tabs: { slug: string; label: string; count: number }[] = [
      { slug: "all", label: `All ${brand.name} ${deptLabel}`, count: products.length },
    ];

    availableCategories.forEach((c) => {
      tabs.push({ slug: c.slug, label: c.name, count: c.count });
    });

    return tabs;
  }, [brand.name, department.name, products.length, availableCategories]);

  // Handle Tab Change with URL sync
  const handleTabChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug === "all") {
      params.delete("category");
    } else {
      params.set("category", catSlug);
    }
    const query = params.toString();
    router.replace(
      query
        ? `/shop-by-brand/${department.slug}/${brand.slug}?${query}`
        : `/shop-by-brand/${department.slug}/${brand.slug}`,
      { scroll: false }
    );
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && selectedCategory !== "all") {
          const pCat = getProductCategory(p).toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const targetCat = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const pName = (p.name || "").toLowerCase();

          const matchesCategory =
            pCat === targetCat ||
            pCat.includes(targetCat) ||
            targetCat.includes(pCat) ||
            pName.includes(selectedCategory.toLowerCase().replace(/-/g, " "));

          if (!matchesCategory) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (p.name || "").toLowerCase().includes(q);
          const matchesDesc = (p.description || "").toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        // Storage filter
        if (selectedStorage !== "all") {
          const pName = (p.name || "").toLowerCase();
          const hasStorage =
            p.storage_options?.includes(selectedStorage) ||
            pName.includes(selectedStorage.toLowerCase());
          if (!hasStorage) return false;
        }

        // In-stock only filter
        if (inStockOnly && p.stock_status === "out_of_stock") {
          return false;
        }

        // Colour filter
        if (selectedColour !== "all") {
          const pName = (p.name || "").toLowerCase();
          const hasColour =
            p.colors?.some((c) => c.toLowerCase() === selectedColour.toLowerCase()) ||
            pName.includes(selectedColour.toLowerCase());
          if (!hasColour) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_low") return a.price - b.price;
        if (sortBy === "price_high") return b.price - a.price;
        if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
        if (sortBy === "newest") {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tB - tA;
        }
        // Popularity: featured first, then stock count
        const fA = a.featured ? 1 : 0;
        const fB = b.featured ? 1 : 0;
        if (fA !== fB) return fB - fA;
        return (b.stock_count ?? 0) - (a.stock_count ?? 0);
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedStorage,
    inStockOnly,
    selectedColour,
    sortBy,
  ]);

  // Section Heading & Description from admin config or defaults
  const sectionHeading =
    config.productSectionHeading || `${brand.name} ${department.name}`;

  const sectionDescription =
    config.productSectionDescription ||
    `Explore genuine ${brand.name} ${department.name.toLowerCase()} models available at 1PLACE.LK.`;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans pb-24">
      {/* ── Top Breadcrumbs & Back Navigation ── */}
      <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto pt-3 sm:pt-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 font-medium pb-2 border-b border-neutral-100">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
                router.back();
              } else {
                router.push("/#shop-by-brand");
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all shrink-0 cursor-pointer mr-1 active:scale-95 shadow-2xs"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <Link href="/" className="hover:text-black transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link href="/products" className="hover:text-black transition-colors shrink-0">
            {department.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-black font-bold">{brand.name}</span>
        </div>
      </div>

      {/* ── Top Framed Banner Hero (Full Screen Edge-to-Edge on Mobile) ── */}
      <div className="w-full max-w-[1440px] px-0 sm:px-6 lg:px-8 mx-auto pt-0 sm:pt-3">
        <DepartmentBrandHero config={config} brand={brand} department={department} />
      </div>

      {/* ── Page Main Content Container ── */}
      <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* ── Desktop Category Navigation Tabs, Heading & Filter Toolbar (Hidden on Mobile) ── */}
        <div className="hidden md:block">
          {/* ── Horizontal Underline Category Navigation Tabs ── */}
          <div className="flex items-center justify-start sm:justify-start border-b border-neutral-200 mb-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
            <div className="flex items-center gap-2 sm:gap-6 px-1">
              {categoryNavigationTabs.map((tab) => {
                const isActive = selectedCategory === tab.slug;
                return (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => handleTabChange(tab.slug)}
                    className={`relative py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                        ? "text-black font-extrabold border-b-2 border-[#ED0712] -mb-[1px]"
                        : "text-neutral-600 hover:text-black border-b-2 border-transparent"
                      }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Department-Brand Heading + Search & Filter Toolbar ── */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {sectionHeading}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              {sectionDescription}
            </p>
          </div>

          {/* ── Clean Filter/Sort Toolbar Row ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-8">

            {/* Left: Search + Storage + Colours + In Stock */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${brand.name} ${department.name.toLowerCase()}...`}
                  className="w-full bg-white border border-neutral-200 pl-8 pr-7 py-2 rounded-lg text-xs font-semibold text-neutral-800 outline-none focus:border-black shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Storage Filter */}
              <div className="relative">
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className="bg-white border border-neutral-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-800 outline-none cursor-pointer shadow-2xs hover:bg-neutral-50"
                >
                  <option value="all">All Storage</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              {/* Colours Filter */}
              <div className="relative">
                <select
                  value={selectedColour}
                  onChange={(e) => setSelectedColour(e.target.value)}
                  className="bg-white border border-neutral-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-800 outline-none cursor-pointer shadow-2xs hover:bg-neutral-50"
                >
                  <option value="all">All Colours</option>
                  <option value="titanium">Natural Titanium</option>
                  <option value="black">Black Titanium</option>
                  <option value="white">White Titanium</option>
                  <option value="desert">Desert Titanium</option>
                  <option value="blue">Blue</option>
                  <option value="pink">Pink</option>
                </select>
              </div>

              {/* In-Stock Only Checkbox Button */}
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${inStockOnly
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${inStockOnly ? "bg-white border-white text-black" : "border-neutral-400"}`}>
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span>In Stock Only</span>
              </button>
            </div>

            {/* Right: Sort By + Filters Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-neutral-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-800 outline-none cursor-pointer shadow-2xs hover:bg-neutral-50"
                >
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="newest">Sort by: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>

              {/* Filters Button */}
              <button
                type="button"
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Filters</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 4-Column Product Grid ── */}
        <div id="products" className="pt-3 md:pt-0 mb-16">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <BrandProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-[#F8F8FA] border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-2xs my-12">
              <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-neutral-400 shadow-2xs">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                No products found
              </h3>
              <p className="text-xs text-neutral-500 mb-5">
                Try selecting a different category tab or resetting your search filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStorage("all");
                  setSelectedColour("all");
                  setSearchQuery("");
                  setInStockOnly(false);
                }}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
