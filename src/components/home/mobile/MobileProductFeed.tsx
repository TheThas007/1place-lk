"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc } from "firebase/firestore";
import { Loader2, ArrowDown } from "lucide-react";

interface MobileProductFeedProps {
  initialProducts: Product[];
}

function calculateDiscountPercent(price: number | null | undefined, oldPrice: number | null | undefined): number {
  const p = Number(price);
  const op = Number(oldPrice);
  if (!p || !op || isNaN(p) || isNaN(op) || p <= 0 || op <= 0 || op <= p) {
    return 0;
  }
  return Math.round(((op - p) / op) * 100);
}

export default function MobileProductFeed({ initialProducts = [] }: MobileProductFeedProps) {
  // Use initial 10 products
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(() => {
    return (initialProducts || []).slice(0, 10);
  });
  const [lastIndex, setLastIndex] = useState<number>(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => (initialProducts || []).length > 10);

  // Paginated cursor batch loading with duplicate prevention
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      // 1. If remaining products exist in initial cache, slice next 10
      if (initialProducts.length > lastIndex) {
        const nextBatch = initialProducts.slice(lastIndex, lastIndex + 10);
        
        setDisplayedProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filteredNext = nextBatch.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filteredNext];
        });

        const newIndex = lastIndex + 10;
        setLastIndex(newIndex);
        setHasMore(initialProducts.length > newIndex);
        setLoadingMore(false);
        return;
      }

      // 2. Otherwise query Firestore cursor with limit(10)
      const lastProduct = displayedProducts[displayedProducts.length - 1];
      if (lastProduct && lastProduct.id) {
        try {
          const lastDocSnap = await getDoc(doc(db, "products", lastProduct.id));
          if (lastDocSnap.exists()) {
            const q = query(
              collection(db, "products"),
              orderBy("created_at", "desc"),
              startAfter(lastDocSnap),
              limit(10)
            );
            const snapshot = await getDocs(q);
            const newDocs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Product));

            if (newDocs.length > 0) {
              setDisplayedProducts((prev) => {
                const existingIds = new Set(prev.map((p) => p.id));
                const filteredNew = newDocs.filter((p) => !existingIds.has(p.id));
                return [...prev, ...filteredNew];
              });
              setHasMore(newDocs.length === 10);
            } else {
              setHasMore(false);
            }
          } else {
            setHasMore(false);
          }
        } catch {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.warn("Error loading more products:", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!displayedProducts || displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className="md:hidden w-full bg-neutral-50/70 border-b border-neutral-200/80 py-4 px-3">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xs font-black uppercase tracking-tight text-neutral-900">
          Explore All Products
        </h2>
        <span className="text-[10px] font-bold text-neutral-500">
          Showing {displayedProducts.length} items
        </span>
      </div>

      {/* Strict 2-Column Responsive Product Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {displayedProducts.map((product) => {
          const discount = calculateDiscountPercent(product.price, product.old_price);
          const image = product.images?.[0] || "/placeholder.png";
          const isOutOfStock = product.stock_status === "out_of_stock";

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="bg-white rounded-2xl p-2.5 border border-neutral-200/80 flex flex-col justify-between active:scale-98 transition-transform shadow-2xs group"
            >
              {/* Product Thumbnail Container */}
              <div className="product-image-container relative aspect-square w-full rounded-xl bg-white p-1 mb-2 flex items-center justify-center overflow-hidden border border-neutral-100">
                <img
                  src={image}
                  alt={product.name}
                  className={`w-full h-full object-contain object-center ${isOutOfStock ? "grayscale opacity-50" : ""}`}
                  loading="lazy"
                />
                
                {/* Discount Badge */}
                {discount > 0 && !isOutOfStock && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-black leading-tight tracking-tight">
                    -{discount}%
                  </span>
                )}

                {/* Stock Status Badge */}
                {isOutOfStock && (
                  <span className="absolute inset-x-2 bottom-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[9px] font-black text-center">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Meta */}
              <div className="space-y-1">
                {product.category_name && (
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight line-clamp-1">
                    {product.category_name}
                  </span>
                )}
                <h3 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-tight min-h-[28px]">
                  {product.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                  <span className="text-xs font-black text-black">
                    {formatPrice(product.price)}
                  </span>
                  {product.old_price && product.old_price > product.price && (
                    <span className="text-[10px] text-neutral-400 line-through">
                      {formatPrice(product.old_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Paginated Load More Control */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300/90 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Load More Products</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
