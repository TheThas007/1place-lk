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
  const isOutOfStock = product.stock_status === "out_of_stock" || (typeof product.stock_count === "number" && product.stock_count <= 0);
  const isLowStock = !isOutOfStock && (product.stock_status === "low_stock" || (typeof product.stock_count === "number" && product.stock_count <= 2));

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

  const isMobileOrLaptop =
    product.productType === "phone" ||
    (product.category_name || "").toLowerCase().includes("phone") ||
    (product.category_name || "").toLowerCase().includes("mobile") ||
    (product.category_name || "").toLowerCase().includes("smartphone") ||
    (product.category_name || "").toLowerCase().includes("laptop") ||
    (product.category_name || "").toLowerCase().includes("macbook") ||
    (product.category_name || "").toLowerCase().includes("ipad") ||
    (product.category_name || "").toLowerCase().includes("tablet") ||
    (product.name || "").toLowerCase().includes("iphone") ||
    (product.name || "").toLowerCase().includes("galaxy") ||
    (product.name || "").toLowerCase().includes("macbook") ||
    Boolean(product.hasStorageVariants);

  return (
    <div
      className={`group relative bg-white border border-neutral-200/70 rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-[2px] hover:border-neutral-400 hover:shadow-sm motion-reduce:hover:transform-none ${className}`}
    >
      {/* ── Clickable Link Body ── */}
      <Link
        href={`/products/${product.slug}`}
        className="block flex-1 flex flex-col h-full focus:outline-none rounded-2xl cursor-pointer"
      >
        {/* ── 1. Image Container ── */}
        <div className="relative aspect-square bg-[#FAFAFA] p-3 sm:p-3.5 flex items-center justify-center overflow-hidden rounded-t-2xl">
          
          {/* Top-Left Out-of-Stock Status Badge */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
              <span className={`${isMobileOrLaptop ? "bg-amber-600 text-white" : "bg-neutral-800/90 text-white"} text-[10px] font-semibold px-2 py-0.5 rounded-md`}>
                {isMobileOrLaptop ? "Pre-Order Available" : "Sold Out"}
              </span>
            </div>
          )}

          {/* Bottom-Left Offer/Discount Badge (Anchored on Image Bottom Edge) */}
          {hasDiscount && (
            <div className="absolute bottom-0 left-0 z-10">
              <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                -{discountPercent}% OFF
              </span>
            </div>
          )}

          {/* Bottom-Right Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-500 hover:text-neutral-900"
              }`}
            />
          </button>

          {/* Product Image with smooth Apple hover zoom */}
          {mainImage && !imageError ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transform-none"
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

          {/* Pricing */}
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
        </div>
      </Link>

      {/* ── 3. Bottom Add to Bag Action (Independent from Link) ── */}
      <div className="px-4 pb-4 bg-white border-t border-neutral-100 pt-2.5">
        {isOutOfStock && isMobileOrLaptop ? (
          <Link
            href={`/products/${product.slug}?book=true`}
            className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Pre-Order / Book</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs cursor-pointer ${
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
        )}
      </div>
    </div>
  );
}
