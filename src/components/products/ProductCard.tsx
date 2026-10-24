"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, announceToScreenReader, getProductSlug, normalizeImageUrl } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-context";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({ product, className = "", priority = false }: ProductCardProps) {
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
        announceToScreenReader(`${product.name} added to cart.`);
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

  const rawImage =
    (product.images && product.images.length > 0 && product.images[0]) ||
    product.image ||
    product.image_url ||
    product.cover_image ||
    "";
  const mainImage = imageError || !rawImage ? "/placeholder-phone.webp" : normalizeImageUrl(rawImage);

  return (
    <div
      className={`group relative bg-white border border-[#E5E5E5] rounded-[12px] overflow-hidden flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md w-full min-w-0 max-w-full ${className}`}
    >
      {/* ── Clickable Link Body ── */}
      <Link
        href={`/products/${getProductSlug(product)}`}
        className="block flex-1 flex flex-col focus:outline-none cursor-pointer"
      >
        {/* ── 1. Image Container (Square, white background) ── */}
        <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
          {/* Top-Left Badge: Discount or New */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            {hasDiscount ? (
              <span className="bg-[#E11D48] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs inline-block">
                -{discountPercent}%
              </span>
            ) : isPreOrder ? (
              <span className="bg-neutral-800 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs inline-block">
                Pre-Order
              </span>
            ) : isNew ? (
              <span className="bg-[#64152F] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs inline-block">
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
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-neutral-200/90 flex items-center justify-center text-neutral-400 hover:text-[#64152F] hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? "fill-[#64152F] text-[#64152F]" : "text-neutral-500"
              }`}
            />
          </button>

          {/* Product Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              unoptimized
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              onError={() => setImageError(true)}
              className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105 p-3 sm:p-4"
            />
          </div>
        </div>

        {/* ── 2. Details Section (Product Name, Price, Stock Status) ── */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
          <div>
            {/* Product Name (Max 2 lines) */}
            <h3 className="font-semibold text-xs sm:text-[13px] text-[#111111] line-clamp-2 leading-snug group-hover:text-[#64152F] transition-colors min-h-[32px] sm:min-h-[36px] mb-1.5">
              {product.name}
            </h3>

            {/* Price Row: Bold Burgundy Selling Price + Optional Strikethrough Original Price */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mb-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-[#64152F] leading-tight">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-[11.5px] text-neutral-400 line-through font-normal leading-tight">
                  {formatPrice(product.old_price!)}
                </span>
              )}
            </div>

            {/* Stock Status: Dot + "In Stock" / "Out of Stock" */}
            <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs font-medium text-neutral-600">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isOutOfStock
                    ? "bg-red-500"
                    : isLowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span>
                {isOutOfStock
                  ? "Out of Stock"
                  : isLowStock
                  ? "In Stock"
                  : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── 3. Bottom Full-Width Add to Cart Button ── */}
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        {isOutOfStock && !isPreOrder ? (
          <button
            type="button"
            disabled
            className="w-full h-9 sm:h-10 rounded-[8px] sm:rounded-[10px] font-bold text-xs bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>Out of Stock</span>
          </button>
        ) : isPreOrder ? (
          <Link
            href={`/products/${getProductSlug(product)}?book=true`}
            className="w-full h-9 sm:h-10 rounded-[8px] sm:rounded-[10px] font-bold text-xs flex items-center justify-center gap-1.5 bg-[#111111] hover:bg-[#64152F] text-white transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Pre-Order</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full h-9 sm:h-10 rounded-[8px] sm:rounded-[10px] font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-[0.98] cursor-pointer ${
              added
                ? "bg-emerald-700 text-white"
                : "bg-[#64152F] text-white hover:bg-[#501025]"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
