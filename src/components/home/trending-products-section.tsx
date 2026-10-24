"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShoppingBag, Check } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/lib/types";
import { uniqueById, formatPrice, getProductSlug, normalizeImageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";

interface TrendingProductsSectionProps {
  initialProducts?: Product[];
}

const TABS = [
  { id: "best-sellers", label: "Best Sellers" },
  { id: "sales", label: "Sales" },
  { id: "featured", label: "Featured" },
  { id: "new", label: "New Products" },
];

export default function TrendingProductsSection({
  initialProducts = [],
}: TrendingProductsSectionProps) {
  const [activeTab, setActiveTab] = useState("best-sellers");
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const [centerAdded, setCenterAdded] = useState(false);

  const allUniqueProducts = useMemo(() => {
    return uniqueById(initialProducts);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    if (allUniqueProducts.length === 0) return [];

    let list = [...allUniqueProducts];

    if (activeTab === "sales") {
      const sales = list.filter((p) => typeof p.old_price === "number" && p.old_price > p.price);
      if (sales.length >= 4) list = sales;
    } else if (activeTab === "featured") {
      const feat = list.filter((p) => p.featured);
      if (feat.length >= 4) list = feat;
    } else if (activeTab === "new") {
      const newItems = list.filter((p) => p.is_new_arrival);
      if (newItems.length >= 4) list = newItems;
    }

    return list;
  }, [allUniqueProducts, activeTab]);

  // Center featured spotlight item
  const centerItem = filteredProducts[0] || allUniqueProducts[0];
  // Left 4 items (2 rows x 2 cols)
  const leftItems = filteredProducts.slice(1, 5);
  // Right 4 items (2 rows x 2 cols)
  const rightItems = filteredProducts.slice(5, 9).length >= 4
    ? filteredProducts.slice(5, 9)
    : filteredProducts.slice(1, 5);

  const handleCenterAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!centerItem) return;

    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product: centerItem,
      color: centerItem.colors?.[0],
      storage: centerItem.storage_options?.[0],
      quantity: 1,
      image: centerItem.images?.[0] || centerItem.image || "/placeholder-phone.webp",
      onSuccess: () => {
        setCenterAdded(true);
        setTimeout(() => setCenterAdded(false), 2000);
      },
    });
  };

  if (allUniqueProducts.length === 0) return null;

  return (
    <section
      aria-label="Trending Products This Week"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 select-none font-sans"
    >
      {/* ── Section Header & Functional Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#E8E8E8] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111111] tracking-tight">
            Trending This Week
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] hidden sm:block">
            Curated top performers, customer favourites and fresh releases
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#64152F] text-white shadow-xs"
                    : "bg-white text-[#666666] hover:text-[#111111] hover:bg-neutral-100 border border-[#E8E8E8]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <Link
            href="/products"
            className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold text-[#64152F] hover:text-[#350713] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Desktop Layout: 2 Cols Left | Center Featured Spotlight | 2 Cols Right (Reference 2) ── */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 items-stretch">
        {/* Left Column: 2x2 Products */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3.5">
          {leftItems.map((prod) => (
            <div key={`left-${prod.id}`} className="h-full">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>

        {/* Center Column: Large Spotlight Feature Card */}
        {centerItem && (
          <div className="lg:col-span-1 bg-white border border-[#E8E8E8] rounded-3xl p-5 flex flex-col justify-between hover:border-[#64152F] hover:shadow-xl transition-all duration-300 relative group">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="bg-[#64152F] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                HOT PICK
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(centerItem.id)}
                className="w-8 h-8 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center text-neutral-400 hover:text-[#64152F] transition-colors shadow-2xs"
                aria-label="Save to wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(centerItem.id) ? "fill-[#64152F] text-[#64152F]" : ""
                  }`}
                />
              </button>
            </div>

            <Link
              href={`/products/${getProductSlug(centerItem)}`}
              className="block flex-1 flex flex-col justify-center text-center my-auto focus:outline-none"
            >
              <div className="relative w-full aspect-square my-2 flex items-center justify-center overflow-hidden">
                <Image
                  src={normalizeImageUrl(centerItem.images?.[0] || centerItem.image || "/placeholder-phone.webp")}
                  alt={centerItem.name}
                  fill
                  sizes="300px"
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block truncate">
                {centerItem.brand_name || centerItem.category_name}
              </span>
              <h3 className="font-extrabold text-sm text-[#111111] line-clamp-2 leading-snug group-hover:text-[#64152F] transition-colors mb-1.5 px-2">
                {centerItem.name}
              </h3>

              <div className="flex items-baseline justify-center gap-1.5 mb-2">
                <span className="font-black text-base text-[#111111]">
                  {formatPrice(centerItem.price)}
                </span>
                {centerItem.old_price && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(centerItem.old_price)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1 text-xs text-[#111111] font-semibold mb-2">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{typeof centerItem.rating === "number" && centerItem.rating > 0 ? centerItem.rating.toFixed(1) : "4.9"}</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleCenterAddToCart}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                centerAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-[#111111] text-white hover:bg-[#64152F]"
              }`}
            >
              {centerAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Right Column: 2x2 Products */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3.5">
          {rightItems.map((prod) => (
            <div key={`right-${prod.id}`} className="h-full">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Layout (< 1024px): Clean 2-Column Responsive Grid ── */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredProducts.slice(0, 8).map((prod) => (
          <div key={`mob-trend-${prod.id}`} className="h-full">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </section>
  );
}
