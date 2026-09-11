"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Heart, Check, Star } from "lucide-react";
import { Product, NewArrivalsSettings } from "@/lib/types";
import { getProducts, getNewArrivalsSettings } from "@/lib/firestore-client";
import { DEFAULT_NEW_ARRIVALS_SETTINGS } from "@/lib/data";
import { formatPrice, announceToScreenReader, normalizeImageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";
import QuickViewModal from "@/components/ui/QuickViewModal";
import ScrollReveal from "@/components/ui/ScrollReveal";
import NewArrivalsGridBanner from "./NewArrivalsGridBanner";

export default function NewArrivalsSection({
  initialProducts,
  initialSettings,
}: {
  initialProducts?: Product[];
  initialSettings?: NewArrivalsSettings | null;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [settings, setSettings] = useState<NewArrivalsSettings>(
    initialSettings || DEFAULT_NEW_ARRIVALS_SETTINGS
  );
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Load products if initialProducts not supplied
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      getProducts().then((res) => {
        if (res && res.length > 0) setProducts(res);
      });
    }
  }, [initialProducts]);

  // Load settings if initialSettings not supplied
  useEffect(() => {
    if (!initialSettings) {
      getNewArrivalsSettings().then((data) => {
        if (data) {
          setSettings({
            ...DEFAULT_NEW_ARRIVALS_SETTINGS,
            ...data,
            custom_product_ids: Array.isArray(data.custom_product_ids)
              ? data.custom_product_ids
              : [],
          });
        }
      }).catch(() => {});
    }
  }, [initialSettings]);

  // Compute New Arrivals list:
  // Mode 1: Custom curated list in exact admin specified order
  // Mode 2: Automatic (Priority: is_new_arrival === true, Fallback: created_at desc)
  const newArrivalProducts = useMemo(() => {
    const activeProducts = products.filter((p) => p.status !== "draft" && p.status !== "inactive");
    const limitCount = settings.display_count && settings.display_count > 0 ? settings.display_count : 8;

    if (settings.mode === "custom" && settings.custom_product_ids && settings.custom_product_ids.length > 0) {
      const map = new Map(activeProducts.map((p) => [p.id, p]));
      const curated = settings.custom_product_ids
        .map((id) => map.get(id))
        .filter((p): p is Product => Boolean(p));

      if (curated.length > 0) {
        return curated.slice(0, limitCount);
      }
    }

    // Automatic Mode Fallback
    const markedNew = activeProducts.filter((p) => p.is_new_arrival === true);

    if (markedNew.length >= limitCount) {
      return markedNew.slice(0, limitCount);
    }

    // Sort by created_at descending if not enough manually marked products
    const sortedLatest = [...activeProducts].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Merge markedNew and latest products ensuring uniqueness
    const merged = Array.from(new Set([...markedNew, ...sortedLatest]));
    return merged.slice(0, limitCount);
  }, [products, settings]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_status === "out_of_stock") return;

    // If product has color/storage variants, open Quick View modal first
    if ((product.colors && product.colors.length > 0) || (product.storage_options && product.storage_options.length > 0)) {
      setQuickViewProduct(product);
      return;
    }

    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product,
      image: product.images?.[0] || "/placeholder-phone.webp",
      quantity: 1,
      onSuccess: () => {
        setAddedMap((prev) => ({ ...prev, [product.id]: true }));
        announceToScreenReader(`${product.name} added to bag.`);
        setTimeout(() => {
          setAddedMap((prev) => ({ ...prev, [product.id]: false }));
        }, 1800);
      },
    });
  };

  if (settings.enabled === false) {
    return null;
  }

  return (
    <>
      {/* ── Mobile Layout (< 768px): Premium Product-Focused Horizontal Swipe Rail ── */}
      <section
        className="md:hidden w-full bg-white pt-5 sm:pt-6 pb-4 select-none overflow-hidden"
        aria-label="New Arrivals"
      >
        {/* 1. Section Header */}
        <div className="flex items-center justify-between px-4 mb-3.5 sm:mb-4">
          <h2 className="text-[22px] sm:text-2xl font-black text-neutral-900 tracking-tight leading-none">
            {settings.section_title || "New Arrivals"}
          </h2>
        </div>

        {/* 2. Mobile Product Rail: 2.15 cards peek (45vw, min 150px, max 190px), snap-x */}
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 pb-1">
          {newArrivalProducts.length > 0
            ? newArrivalProducts.map((product) => {
                const hasDiscount =
                  Boolean(product.old_price) &&
                  typeof product.old_price === "number" &&
                  typeof product.price === "number" &&
                  product.old_price > product.price &&
                  Math.round(((product.old_price - product.price) / product.old_price) * 100) > 0;

                const discountPercent = hasDiscount
                  ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
                  : 0;

                const mainImage = normalizeImageUrl(
                  product.images?.[0] || product.image || product.image_url || "/placeholder-phone.webp"
                );
                const brandName = product.brand_name || product.brand || "";

                return (
                  <Link
                    key={`mob-na-${product.id}`}
                    href={`/products/${product.slug}`}
                    className="w-[45vw] min-w-[150px] max-w-[190px] shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs snap-start hover:border-neutral-400 active:scale-[0.98] transition-all group"
                  >
                    {/* Top: Brand & Image Container */}
                    <div>
                      {/* Brand Label */}
                      {brandName && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 truncate block mb-1">
                          {brandName}
                        </span>
                      )}

                      {/* 1:1 Square Image Container with Discount Badge in current image position */}
                      <div className="relative aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden mb-1.5 p-1 sm:p-2 border border-neutral-100/80">
                        <img
                          src={mainImage}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-phone.webp";
                          }}
                        />

                        {/* Discount Badge in current image position (Bottom-Left) */}
                        {hasDiscount && (
                          <span className="product-offer-badge absolute left-1.5 bottom-1.5 z-10 bg-[#ED0712] text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none shadow-xs">
                            -{discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Product Info Hierarchy */}
                    <div className="flex flex-col justify-between flex-1">
                      {/* Product Title (Max 2 lines, clean compact height) */}
                      <h3 className="font-bold text-xs sm:text-[13px] text-neutral-900 line-clamp-2 leading-snug mb-1 min-h-[2rem]">
                        {product.name}
                      </h3>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-1.5 flex-wrap pt-0">
                        <span className="font-black text-sm sm:text-[15px] text-[#ED0712]">
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-neutral-400 line-through font-medium">
                            {formatPrice(product.old_price!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            : Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`mob-na-skel-${idx}`}
                  className="w-[45vw] min-w-[150px] max-w-[190px] shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-2xs snap-start animate-pulse"
                >
                  <div className="w-12 h-3 bg-neutral-200 rounded mb-1.5" />
                  <div className="aspect-square bg-neutral-100 rounded-xl mb-2" />
                  <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
                  <div className="w-2/3 h-4 bg-neutral-200 rounded mb-2" />
                  <div className="w-16 h-4 bg-neutral-300 rounded" />
                </div>
              ))}
        </div>
      </section>

      {/* ── Desktop Layout (Full 4-Column Grid) ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="new-arrivals"
          stagger={0.06}
          yOffset={20}
          className="py-12 sm:py-16 bg-[#FAFAFA] border-b border-neutral-100 font-sans"
        >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div data-reveal-item className="mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#090909] tracking-tight">
            {settings.section_title || "New Arrivals"}
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-1 font-medium">
            {settings.section_subtitle || "Explore the latest devices and accessories at Street Mobile."}
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {newArrivalProducts.map((product, idx) => {
            const isWishlisted = isInWishlist(product.id);
            const isOutOfStock = product.stock_status === "out_of_stock";
            const isLowStock = product.stock_status === "low_stock";

            const hasDiscount =
              Boolean(product.old_price) &&
              typeof product.old_price === "number" &&
              typeof product.price === "number" &&
              product.old_price > product.price &&
              Math.round(((product.old_price - product.price) / product.old_price) * 100) > 0;

            const discountPercent = hasDiscount
              ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
              : 0;

            const mainImage = normalizeImageUrl(
              product.images?.[0] || product.image || product.image_url || "/placeholder-phone.webp"
            );

            return (
              <React.Fragment key={product.id}>
                {idx === 2 && <NewArrivalsGridBanner />}
                <div
                  data-reveal-item
                  className="group relative bg-white border border-neutral-200/90 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-black hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  {/* Image Section */}
                  <div className="product-image-container relative aspect-square bg-white p-2.5 sm:p-3 flex items-center justify-center overflow-hidden rounded-t-2xl border-b border-neutral-100/80">
                    
                    {/* Top-Left Out-of-Stock Badge */}
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-neutral-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Bottom-Left Discount Badge (Anchored on Image Bottom Edge) */}
                    {hasDiscount && (
                      <div className="product-offer-badge absolute bottom-0 left-0 z-10">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-tr-lg uppercase tracking-wider shadow-2xs inline-block">
                          -{discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    {/* Bottom-Right Action Buttons (Wishlist & Quick View) */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        aria-label="Quick View"
                        className="w-8 h-8 rounded-full bg-white/95 backdrop-blur border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all shadow-xs"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4 text-neutral-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Wishlist"
                        className="w-8 h-8 rounded-full bg-white/95 backdrop-blur border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all shadow-xs"
                      >
                        <Heart
                          className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-600"}`}
                        />
                      </button>
                    </div>

                    {/* Centered Image */}
                    <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={mainImage}
                        alt={product.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-phone.webp";
                        }}
                      />
                    </Link>
                  </div>

                  {/* Details Section */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                        {product.category_name || "STREET MOBILE"}
                      </span>

                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-bold text-sm sm:text-base text-[#090909] line-clamp-2 leading-snug group-hover:text-neutral-600 transition-colors min-h-[2.5rem] mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      {product.warranty && (
                        <span className="text-[11px] text-neutral-500 font-medium block mb-2">
                          🛡️ {product.warranty}
                        </span>
                      )}
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-3 border-t border-neutral-100 mt-auto">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className="font-black text-base sm:text-lg text-[#090909]">
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-neutral-400 line-through font-medium">
                            {formatPrice(product.old_price!)}
                          </span>
                        )}
                      </div>

                      {/* Add to Bag Button */}
                      {isOutOfStock && (
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
                        Boolean(product.hasStorageVariants)
                      ) ? (
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
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`w-full py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs ${
                            isOutOfStock
                              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                              : addedMap[product.id]
                              ? "bg-emerald-600 text-white"
                              : "bg-black text-white hover:bg-neutral-800"
                          }`}
                        >
                          {addedMap[product.id] ? (
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
                </div>
              </React.Fragment>
            );
          })}
        </div>

      </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </ScrollReveal>
    </div>
  </>
  );
}
