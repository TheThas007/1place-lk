"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Check, Star } from "lucide-react";
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
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (typeof product.stock_count === "number" && product.stock_count <= 0);
  const isLowStock =
    !isOutOfStock &&
    (product.stock_status === "low_stock" ||
      (typeof product.stock_count === "number" && product.stock_count <= 2));

  // Calculate discount percentage safely
  const hasDiscount =
    product.old_price &&
    typeof product.old_price === "number" &&
    product.old_price > product.price;

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

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/placeholder-phone.webp",
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

  // Per-product image fitting & alignment settings
  const imgSettings = product.imageSettings || product.productImageSettings;
  const isCover = imgSettings?.fit === "cover";
  const userScale = typeof imgSettings?.scale === "number" ? imgSettings.scale / 100 : 1.0;
  const posX = typeof imgSettings?.positionX === "number" ? imgSettings.positionX : 0;
  const posY = typeof imgSettings?.positionY === "number" ? imgSettings.positionY : 0;

  // Color Swatches
  const colorDots =
    product.colors && product.colors.length > 0
      ? product.colors.slice(0, 4)
      : ["#2C2C2E", "#E3E4E5", "#D4AF37", "#4A4946"];

  return (
    <div
      className={`group relative bg-white border border-neutral-200/80 rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md ${className}`}
    >
      {/* ── Clickable Link Body ── */}
      <Link
        href={`/products/${product.slug}`}
        className="block flex-1 flex flex-col h-full focus:outline-none cursor-pointer"
      >
        {/* ── 1. Image Container (1:1 square, #F7F7F7 background, overflow hidden) ── */}
        <div className="product-image-container relative aspect-square bg-[#F7F7F7] flex items-center justify-center overflow-hidden rounded-t-2xl">
          
          {/* ── Approved Offer Badge Position: Bottom-Left Corner (Anchored to Image Container) ── */}
          <div className="product-offer-badge absolute bottom-0 left-0 z-10 flex flex-col items-start pointer-events-none">
            {hasDiscount ? (
              <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                -{discountPercent}% OFF
              </span>
            ) : isPreOrder ? (
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
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

          {/* Product Image (Centered, Transform Origin Center, Precise Scale & Position) */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              style={{
                objectPosition: `${50 + posX}% ${50 + posY}%`,
                transform: `scale(${userScale})`,
                transformOrigin: "center center",
              }}
              className={`w-full h-full ${
                isCover ? "object-cover" : "object-contain"
              } transition-transform duration-500 ease-out group-hover:scale-[${(userScale * 1.05).toFixed(2)}]`}
            />
          </div>
        </div>

        {/* ── 2. Details Section ── */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Category Label */}
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 block mb-1">
              {product.category_name || "SMARTPHONES"}
            </span>

            {/* Product Title */}
            <h3 className="font-bold text-sm sm:text-[15px] text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors mb-0.5">
              {product.name}
            </h3>

            {/* Warranty Subtitle */}
            <span className="text-xs text-neutral-400 font-medium block mb-2.5">
              {product.warranty || "1 Year Official Warranty"}
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
                  style={{ backgroundColor: hex.startsWith("#") ? hex : "#444" }}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                />
              ))}
            </div>
          </div>

          {/* Rating & Stock Status Row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1 text-neutral-700 font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.8</span>
              <span className="text-neutral-400 font-normal">(125)</span>
            </div>

            <div className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOutOfStock
                    ? "bg-neutral-400"
                    : isLowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span className="text-[11px] font-semibold text-neutral-700">
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

      {/* ── 3. Bottom Full-Width Black Add to Bag Action ── */}
      <div className="px-4 pb-4 bg-white">
        {isOutOfStock && !isPreOrder ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Sold Out</span>
          </button>
        ) : isPreOrder ? (
          <Link
            href={`/products/${product.slug}?book=true`}
            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#090909] hover:bg-neutral-800 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pre-Order / Book</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
              added
                ? "bg-emerald-600 text-white"
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
