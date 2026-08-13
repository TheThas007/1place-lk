"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Eye, Heart, Check, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/firestore-client";
import { formatPrice, announceToScreenReader } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import QuickViewModal from "@/components/ui/QuickViewModal";
import NewArrivalsGridBanner from "./NewArrivalsGridBanner";

export default function NewArrivalsSection({ initialProducts }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Load products if initialProducts not supplied
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      getProducts().then((res) => {
        if (res && res.length > 0) setProducts(res);
      });
    }
  }, [initialProducts]);

  // Compute New Arrivals list:
  // Priority 1: Marked as is_new_arrival === true
  // Priority 2: Fallback to products ordered by created_at descending
  const newArrivalProducts = useMemo(() => {
    const activeProducts = products.filter((p) => p.status !== "draft" && p.status !== "inactive");

    const markedNew = activeProducts.filter((p) => p.is_new_arrival === true);

    if (markedNew.length >= 4) {
      return markedNew;
    }

    // Sort by created_at descending if not enough manually marked products
    const sortedLatest = [...activeProducts].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Merge markedNew and latest products ensuring uniqueness
    const merged = Array.from(new Set([...markedNew, ...sortedLatest]));
    return merged.slice(0, 10);
  }, [products]);

  // Dynamic Category Tabs generated from available new arrival products
  const categoryTabs = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    newArrivalProducts.forEach((p) => {
      if (p.category_name) set.add(p.category_name);
    });
    return Array.from(set);
  }, [newArrivalProducts]);

  // Filtered Products for selected Category Tab
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return newArrivalProducts;
    return newArrivalProducts.filter(
      (p) => p.category_name?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [newArrivalProducts, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_status === "out_of_stock") return;

    // If product has color/storage variants, open Quick View modal first
    if ((product.colors && product.colors.length > 0) || (product.storage_options && product.storage_options.length > 0)) {
      setQuickViewProduct(product);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder-phone.webp",
      quantity: 1,
    });

    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    announceToScreenReader(`${product.name} added to bag.`);

    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAFAFA] border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>JUST LANDED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#090909] tracking-tight">
              New Arrivals
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base mt-1 font-medium">
              Explore the latest devices and accessories at Street Mobile.
            </p>
          </div>

          <Link
            href="/products?new=true"
            className="group inline-flex items-center gap-2 text-sm font-bold text-black hover:text-neutral-600 transition-colors"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Category Filter Tabs */}
        {categoryTabs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product, idx) => {
            const isWishlisted = isInWishlist(product.id);
            const isOutOfStock = product.stock_status === "out_of_stock";
            const isLowStock = product.stock_status === "low_stock";

            const hasDiscount =
              product.old_price &&
              typeof product.old_price === "number" &&
              product.old_price > product.price;

            const discountPercent = hasDiscount
              ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
              : 0;

            const mainImage = product.images?.[0] || "/placeholder-phone.webp";

            return (
              <React.Fragment key={product.id}>
                {idx === 2 && <NewArrivalsGridBanner />}
                <div
                  className="group relative bg-white border border-neutral-200/90 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-black hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  {/* Image Section */}
                  <div className="relative aspect-square bg-[#F7F7F8] p-5 flex items-center justify-center overflow-hidden rounded-t-2xl">
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                      <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                        NEW
                      </span>
                      {hasDiscount && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          -{discountPercent}%
                        </span>
                      )}
                      {isOutOfStock ? (
                        <span className="bg-neutral-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Low Stock
                        </span>
                      ) : null}
                    </div>

                    {/* Top-Right Buttons (Wishlist & Quick View) */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Wishlist"
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all shadow-xs"
                      >
                        <Heart
                          className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-600"}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        aria-label="Quick View"
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all shadow-xs"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4 text-neutral-600" />
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
    </section>
  );
}
