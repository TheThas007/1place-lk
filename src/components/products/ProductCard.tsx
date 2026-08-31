"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Check, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, announceToScreenReader } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { resolveProductSwatches } from "@/lib/color-utils";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (typeof product.stock_count === "number" && product.stock_count <= 0);
  const isLowStock =
    !isOutOfStock &&
    (product.stock_status === "low_stock" ||
      (typeof product.stock_count === "number" && product.stock_count <= 2));

  // Calculate discount percentage safely
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
    product.is_new_arrival ||
    (product.created_at &&
      Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000);

  const isPreOrder =
    product.stock_status === "pre_order" ||
    (isOutOfStock &&
      (product.productType === "phone" ||
        (product.category_name || "").toLowerCase().includes("laptop") ||
        (product.name || "").toLowerCase().includes("macbook")));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock && !isPreOrder) return;

    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product,
      color: product.colors?.[0],
      storage: product.storage_options?.[0],
      quantity: 1,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/placeholder-phone.webp",
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

  const mainImage =
    !imageError && product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder-phone.webp";

  // Per-product image fitting & alignment settings
  const imgSettings = product.imageSettings || product.productImageSettings;
  const isCover = imgSettings?.fit === "cover";
  const userScale = typeof imgSettings?.scale === "number" ? imgSettings.scale / 100 : 1.0;
  const posX = typeof imgSettings?.positionX === "number" ? imgSettings.positionX : 0;
  const posY = typeof imgSettings?.positionY === "number" ? imgSettings.positionY : 0;

  // Color Swatches (resolved dynamically from product colors / variants)
  const productSwatches = resolveProductSwatches(product);

  const hasRealRating = typeof product.rating === "number" && product.rating > 0;
  const hasReviewCount = typeof (product.review_count || product.reviews_count) === "number" && ((product.review_count || product.reviews_count) as number) > 0;
  const showRating = hasRealRating || hasReviewCount;
  const displayRating = hasRealRating ? product.rating!.toFixed(1) : "5.0";

  return (
    <div
      className={`group relative bg-white border border-neutral-200/80 rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md w-full min-w-0 max-w-full ${className}`}
    >
      {/* ── Clickable Link Body ── */}
      <Link
        href={`/products/${product.slug}`}
        className="block flex-1 flex flex-col h-full focus:outline-none cursor-pointer"
      >
        {/* ── 1. Image Container (Equal responsive height, pure white background, seamless blend) ── */}
        <div className="product-image-container relative w-full h-[180px] sm:h-[220px] md:h-[240px] aspect-square bg-white flex items-center justify-center overflow-hidden rounded-t-2xl border-b border-neutral-100/80">
          
          {/* ── Approved Offer Badge Position: Bottom-Left Corner ── */}
          <div className="product-offer-badge absolute bottom-0 left-0 z-10 flex flex-col items-start pointer-events-none">
            {hasDiscount ? (
              <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                -{discountPercent}% OFF
              </span>
            ) : isPreOrder ? (
              <span className="bg-neutral-800 md:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                Pre-Order Available
              </span>
            ) : isNew ? (
              <span className="bg-neutral-900 text-white text-[10px] font-black px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                New
              </span>
            ) : null}
          </div>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/80 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
              }`}
            />
          </button>

          {/* Product Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden p-1.5 sm:p-2.5">
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full max-w-full max-h-full object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* ── 2. Details Section ── */}
        <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between bg-white min-h-[130px] sm:min-h-[140px]">
          <div>
            {/* Category / Brand Label (Only if genuinely available) */}
            {(product.category_name || product.brand_name) && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 block mb-1 truncate">
                {product.brand_name || product.category_name}
              </span>
            )}

            {/* Product Title */}
            <h3 className="font-bold text-xs sm:text-[15px] text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-600 transition-colors mb-1">
              {product.name}
            </h3>

            {/* Warranty Subtitle (Only when genuinely available) */}
            {product.warranty && product.warranty.trim() !== "" && (
              <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block mb-2 truncate">
                {product.warranty}
              </span>
            )}

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

            {/* Color Swatch Dots (Only if product has genuine colors) */}
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

          {/* Rating & Stock Status Row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 mt-auto gap-2">
            {showRating ? (
              <div className="flex items-center gap-1 text-neutral-700 font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-neutral-800 text-neutral-800 md:fill-amber-400 md:text-amber-400" />
                <span>{displayRating}</span>
              </div>
            ) : <div />}

            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOutOfStock
                    ? "bg-neutral-400"
                    : isLowStock
                    ? "bg-neutral-600 md:bg-amber-500"
                    : "bg-neutral-900 md:bg-emerald-500"
                }`}
              />
              <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-700">
                {isOutOfStock
                  ? "Out of Stock"
                  : isLowStock
                  ? "Low Stock"
                  : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── 3. Bottom Full-Width Action (Minimum 44px Touch Height) ── */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 bg-white">
        {isOutOfStock && !isPreOrder ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[44px] py-2.5 rounded-xl font-bold text-xs bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Sold Out</span>
          </button>
        ) : isPreOrder ? (
          <Link
            href={`/products/${product.slug}?book=true`}
            className="w-full min-h-[44px] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#090909] hover:bg-neutral-800 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pre-Order / Book</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full min-h-[44px] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
              added
                ? "bg-neutral-900 md:bg-emerald-600 text-white"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
            aria-label={`Add ${product.name} to shopping bag`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
