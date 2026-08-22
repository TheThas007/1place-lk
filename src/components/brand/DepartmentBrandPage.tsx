"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
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
import { formatPrice, announceToScreenReader } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

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
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (typeof product.stock_count === "number" && product.stock_count <= 0);

  const hasDiscount =
    product.old_price &&
    typeof product.old_price === "number" &&
    product.old_price > product.price;

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
  const colorDots =
    product.colors && product.colors.length > 0
      ? product.colors.slice(0, 4)
      : ["#4A4946", "#8F8A81", "#E3E4E5", "#2C2C2E"];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
      color: product.colors?.[0],
      storage: product.storage_options?.[0],
      allow_cod: product.allow_cod !== false,
      allow_card: product.allow_card !== false,
      allow_whatsapp: product.allow_whatsapp !== false,
    });

    setAdded(true);
    announceToScreenReader(`${product.name} added to bag.`);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white border border-neutral-200/90 rounded-xl overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between h-full">
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col focus:outline-none">
        
        {/* ── Top Badges & Image Box ── */}
        <div className="relative aspect-[4/3] sm:aspect-square bg-[#FAFAFA] p-2 sm:p-2.5 flex items-center justify-center overflow-hidden">
          
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
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
              }`}
            />
          </button>

          {/* Centered Product Image (Zoomed to fit frame cleanly) */}
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-[1.14]"
            />
          </div>
        </div>

        {/* ── Details Section ── */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Warranty Subtitle with Shield Icon */}
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>{product.warranty || "1 Year Warranty"}</span>
            </div>

            {/* Product Title */}
            <h3 className="font-bold text-sm sm:text-[15px] text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors mb-0.5">
              {product.name}
            </h3>

            {/* Specs Line (Storage | Color) */}
            <span className="text-xs text-neutral-500 font-normal block mb-2">
              {defaultStorage} | {defaultColorName}
            </span>

            {/* Price Row */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through font-normal">
                  {formatPrice(product.old_price!)}
                </span>
              )}
            </div>

            {/* Color Swatch Dots */}
            <div className="flex items-center gap-1.5 mb-3">
              {colorDots.map((hex, idx) => (
                <span
                  key={idx}
                  style={{ backgroundColor: hex.startsWith("#") ? hex : "#333" }}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                />
              ))}
            </div>
          </div>

          {/* Rating & Live Stock Status */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1 text-neutral-700 font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-red-500 text-red-500" />
              <span>4.9</span>
              <span className="text-neutral-400 font-normal">(128)</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-neutral-700">
                {isOutOfStock ? "Sold Out" : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Solid Black Add to Bag Action ── */}
      <div className="px-4 pb-4 bg-white">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
            isOutOfStock
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

  // Compute all available categories from products
  const availableCategories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    products.forEach((p) => {
      const cSlug = (
        p.category_slug ||
        p.categorySlug ||
        p.category_id ||
        p.category_name ||
        ""
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const cName = p.category_name || p.categoryName || cSlug.replace(/-/g, " ");
      if (cSlug) {
        const existing = map.get(cSlug);
        if (existing) existing.count += 1;
        else map.set(cSlug, { slug: cSlug, name: cName, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Underline category tabs matching reference
  const categoryNavigationTabs = useMemo(() => {
    const deptLabel = department.name || "Products";
    const tabs = [{ slug: "all", label: `All ${deptLabel}`, count: products.length }];

    if (brand.slug.toLowerCase() === "apple" && department.slug === "phones") {
      const applePhoneTabs = [
        { slug: "iphone-16", label: "iPhone 16" },
        { slug: "iphone-15", label: "iPhone 15" },
        { slug: "iphone-14", label: "iPhone 14" },
        { slug: "refurbished", label: "Refurbished" },
        { slug: "accessories", label: "Accessories" },
      ];
      applePhoneTabs.forEach((item) => {
        const cat = availableCategories.find(
          (c) => c.slug.includes(item.slug) || item.slug.includes(c.slug)
        );
        tabs.push({
          slug: item.slug,
          label: item.label,
          count: cat ? cat.count : 0,
        });
      });
      return tabs;
    }

    if (brand.slug.toLowerCase() === "dell") {
      const dellTabs = [
        { slug: "xps", label: "XPS" },
        { slug: "inspiron", label: "Inspiron" },
        { slug: "latitude", label: "Latitude" },
        { slug: "gaming", label: "Gaming" },
        { slug: "accessories", label: "Accessories" },
      ];
      dellTabs.forEach((item) => {
        tabs.push({ slug: item.slug, label: item.label, count: 0 });
      });
      return tabs;
    }

    // Dynamic tabs for any other brand
    availableCategories.forEach((c) => {
      tabs.push({ slug: c.slug, label: c.name, count: c.count });
    });

    return tabs;
  }, [brand.slug, department.slug, department.name, products.length, availableCategories]);

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
    router.push(
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
          const cSlug = (
            p.category_slug ||
            p.categorySlug ||
            p.category_id ||
            p.category_name ||
            ""
          )
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          const pName = (p.name || "").toLowerCase();

          const matchesCategory =
            cSlug.includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(cSlug) ||
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

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === "discount") {
          const discA =
            a.old_price && a.old_price > a.price ? (a.old_price - a.price) / a.old_price : 0;
          const discB =
            b.old_price && b.old_price > b.price ? (b.old_price - b.price) / b.old_price : 0;
          return discB - discA;
        }
        // Popularity / Featured default
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, selectedStorage, inStockOnly, sortBy]);

  // Section Heading & Description from admin config or defaults
  const sectionHeading =
    config.productSectionHeading || `${brand.name} ${department.name}`;

  const sectionDescription =
    config.productSectionDescription ||
    `Explore genuine ${brand.name} ${department.name.toLowerCase()} models available at Street Mobile.`;

  // Related Products Showcase
  const relatedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans pb-24">
      <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto pt-4 sm:pt-6">
        
        {/* ── Breadcrumb Navigation: Home / Shop by Brand / [Department] / [Brand] ── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-6 select-none"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <Link href="/categories" className="hover:text-black transition-colors">
            Shop by Brand
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="hover:text-black transition-colors cursor-pointer">
            {department.name}
          </span>
          <span className="text-neutral-400">/</span>
          <span className="text-black font-bold">{brand.name}</span>
        </nav>

        {/* ── Banner-Only Hero (Single externally designed full-frame artwork) ── */}
        <DepartmentBrandHero config={config} brand={brand} department={department} />

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
                  className={`relative py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
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
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                inStockOnly
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

        {/* ── 4-Column Product Grid ── */}
        <div id="products" className="mb-16">
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

        {/* ── Related Showcase at Bottom ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {brand.name} Accessories
              </h3>
              <Link
                href={`/shop-by-brand/accessories/${brand.slug}`}
                className="text-xs font-extrabold text-[#ED0712] hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <BrandProductCard key={`rel-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
