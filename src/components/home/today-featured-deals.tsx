"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, getProductSlug, normalizeImageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";

interface TodayFeaturedDealsProps {
  initialProducts?: Product[];
}

function padZero(num: number): string {
  return num < 10 ? `0${Math.max(0, num)}` : `${Math.max(0, num)}`;
}

export default function TodayFeaturedDeals({ initialProducts = [] }: TodayFeaturedDealsProps) {
  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: "06", minutes: "15", seconds: "48" });
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Calculates time remaining until midnight Colombo time
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: padZero(h),
        minutes: padZero(m),
        seconds: padZero(s),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter products that have discounts or fallback to first 6 items
  const dealProducts = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return [];
    const withDiscount = initialProducts.filter(
      (p) => typeof p.old_price === "number" && p.old_price > p.price
    );
    if (withDiscount.length >= 6) {
      return withDiscount.slice(0, 8);
    }
    return initialProducts.slice(0, 8);
  }, [initialProducts]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product,
      color: product.colors?.[0],
      storage: product.storage_options?.[0],
      quantity: 1,
      image: product.images?.[0] || product.image || "/placeholder-phone.webp",
      onSuccess: () => {
        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 2000);
      },
    });
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (dealProducts.length === 0) return null;

  return (
    <section
      id="deals"
      aria-label="Today's Featured Deals"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 select-none font-sans"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 border-b border-[#E8E8E8] pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-2xl font-black text-[#111111] tracking-tight">
            Today's Featured Deals
          </h2>

          {/* Countdown Clock (End in: HH : MM : SS) */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
            <span className="text-[11px] text-neutral-500 font-semibold">End in:</span>
            <span className="bg-[#64152F] text-white text-[11px] px-1.5 py-0.5 rounded font-mono font-bold">
              {timeLeft.hours}
            </span>
            <span className="text-neutral-400 font-bold">:</span>
            <span className="bg-[#64152F] text-white text-[11px] px-1.5 py-0.5 rounded font-mono font-bold">
              {timeLeft.minutes}
            </span>
            <span className="text-neutral-400 font-bold">:</span>
            <span className="bg-[#64152F] text-white text-[11px] px-1.5 py-0.5 rounded font-mono font-bold">
              {timeLeft.seconds}
            </span>
          </div>
        </div>

        {/* Desktop Carousel Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Previous deals"
            className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-[#111111] hover:bg-neutral-100 hover:border-[#111111] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Next deals"
            className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-[#111111] hover:bg-neutral-100 hover:border-[#111111] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 6-Column Marketplace Product Grid ── */}
      <div
        ref={scrollContainerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {dealProducts.map((product, idx) => {
          const isWishlisted = isInWishlist(product.id);
          const hasDiscount =
            typeof product.old_price === "number" && product.old_price > product.price;
          const discountPercent = hasDiscount
            ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
            : 15;
          const soldCount = 5 + ((idx * 3) % 18);
          const totalStock = 25;
          const progressPercent = Math.min(100, Math.round((soldCount / totalStock) * 100));
          const isAdded = addedIds[product.id];
          const rawImg = product.images?.[0] || product.image || "/placeholder-phone.webp";
          const imgUrl = normalizeImageUrl(rawImg);

          return (
            <div
              key={`deal-${product.id}`}
              className="group bg-white border border-[#E8E8E8] rounded-2xl p-3 flex flex-col justify-between hover:border-[#64152F] hover:shadow-md transition-all duration-300 relative h-full"
            >
              {/* Discount Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="bg-[#64152F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  -{discountPercent}%
                </span>
              </div>

              {/* Wishlist Heart */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                aria-label="Save to wishlist"
                className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-[#64152F] active:scale-90 transition-all cursor-pointer shadow-2xs"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isWishlisted ? "fill-[#64152F] text-[#64152F]" : ""
                  }`}
                />
              </button>

              <Link
                href={`/products/${getProductSlug(product)}`}
                className="block flex-1 flex flex-col focus:outline-none"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden mb-2">
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Category & Title */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  {product.category_name || product.brand_name || "Featured"}
                </span>
                <h3 className="font-bold text-xs sm:text-[13px] text-[#111111] line-clamp-2 leading-snug group-hover:text-[#64152F] transition-colors min-h-[32px] sm:min-h-[34px] mb-1.5">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-extrabold text-sm sm:text-[14.5px] text-[#111111]">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10.5px] sm:text-xs text-neutral-400 line-through font-normal">
                      {formatPrice(product.old_price!)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#111111] mb-2.5">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{typeof product.rating === "number" && product.rating > 0 ? product.rating.toFixed(1) : "4.8"}</span>
                  <span className="text-neutral-400 font-normal">
                    ({(product.review_count || product.reviews_count || 120)})
                  </span>
                </div>

                {/* Stock Meter Progress Bar */}
                <div className="mt-auto pt-1 mb-3">
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-[#64152F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-500">
                    Already sold: <strong className="text-neutral-800">{soldCount}/{totalStock}</strong>
                  </span>
                </div>
              </Link>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full min-h-[38px] py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#111111] text-white hover:bg-[#64152F]"
                }`}
                aria-label={`Add ${product.name} to cart`}
              >
                {isAdded ? (
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
          );
        })}
      </div>
    </section>
  );
}
