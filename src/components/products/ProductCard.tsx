"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Check, MessageCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, generateWhatsAppUrl, announceToScreenReader } from "@/lib/utils";
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
      className={`group relative bg-white border border-gray-100 rounded-[22px] overflow-hidden flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-[22px]">
        
        {/* ── 1. Image Section (Light neutral-grey background #F7F7F7) ── */}
        <div className="relative aspect-square bg-[#F7F7F7] p-5 flex items-center justify-center overflow-hidden rounded-t-[22px]">
          
          {/* Top-Left Sale & Stock Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
            {hasDiscount && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                SALE
              </span>
            )}
            {isOutOfStock ? (
              <span className="bg-black/70 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                Low Stock
              </span>
            ) : null}
          </div>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 flex items-center justify-center text-gray-700 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500 border-none" : "text-gray-500 hover:text-gray-900"
              }`}
            />
          </button>

          {/* Centred Product Image */}
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag className="w-10 h-10 opacity-30" />
            </div>
          )}
        </div>

        {/* ── 2. Product Details Section (Pure-white background #FFFFFF) ── */}
        <div className="bg-white p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand / Category Name */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
              {product.category_name || "SMARTPHONES"}
            </span>

            {/* Product Title (Strict 2 lines height) */}
            <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-600 transition-colors min-h-[2.5rem] mb-2">
              {product.name}
            </h3>
          </div>

          {/* ── 3. Price & Action Section ── */}
          <div className="pt-3 border-t border-gray-100 mt-auto">
            
            {/* Price Container */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="font-black text-base sm:text-lg text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {formatPrice(product.old_price!)}
                </span>
              )}
              {hasDiscount && (
                <span className="ml-auto text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md animate-pulse">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* ── 4. Add to Bag Pill Button ── */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : added
                  ? "bg-emerald-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              aria-label={`Add ${product.name} to shopping bag`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-white" />
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
