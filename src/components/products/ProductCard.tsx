"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, announceToScreenReader } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock_status === "out_of_stock";
  const isLowStock = product.stock_status === "low_stock";

  // Calculate discount percentage safely
  const hasDiscount =
    product.old_price &&
    typeof product.old_price === "number" &&
    product.old_price > product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder-phone.webp",
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

  const mainImage =
    !imageError && product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder-phone.webp";

  return (
    <div
      className={`group relative bg-white border border-neutral-200/70 rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:border-neutral-400 hover:shadow-sm ${className}`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block flex-1 flex flex-col h-full focus:outline-none rounded-2xl"
      >
        {/* ── 1. Image Container (Pure subtle background #FAFAFA, sharp zoom) ── */}
        <div className="relative aspect-square bg-[#FAFAFA] p-6 flex items-center justify-center overflow-hidden rounded-t-2xl">
          
          {/* Top-Left Sale & Stock Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
            {hasDiscount && (
              <span className="bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                -{discountPercent}% OFF
              </span>
            )}
            {isOutOfStock ? (
              <span className="bg-neutral-800/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Low Stock
              </span>
            ) : null}
          </div>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:scale-110 active:scale-95 transition-all shadow-2xs"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-500 hover:text-neutral-900"
              }`}
            />
          </button>

          {/* Product Image with smooth Apple hover zoom */}
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <ShoppingBag className="w-10 h-10 opacity-30" />
            </div>
          )}
        </div>

        {/* ── 2. Details Section ── */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Category Name */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              {product.category_name || "STREET MOBILE"}
            </span>

            {/* Product Title */}
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-600 transition-colors min-h-[2.5rem] mb-2">
              {product.name}
            </h3>
          </div>

          {/* ── 3. Price & Action Section ── */}
          <div className="pt-3 border-t border-neutral-100 mt-auto">
            
            {/* Pricing Hierarchy */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="font-black text-base sm:text-lg text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through font-medium">
                  {formatPrice(product.old_price!)}
                </span>
              )}
            </div>

            {/* Full-width Black Add to Bag Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs ${
                isOutOfStock
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : added
                  ? "bg-emerald-600 text-white"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
              aria-label={`Add ${product.name} to shopping bag`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
