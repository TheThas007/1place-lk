"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Package, RefreshCw, ArrowRight, Check } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import TodayDealSection from "@/components/home/today-deal-section";
import { Product, Category, TodayDealSettings } from "@/lib/types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeProduct, deduplicateProductsBySlug } from "@/lib/firestore-client";

interface ShopAllProductsSectionProps {
  initialProducts?: Product[];
  categories?: Category[];
  todayDealSettings?: TodayDealSettings | null;
}

const ITEMS_PER_BATCH = 18; // 3 full rows of 6 cards on desktop

export default function ShopAllProductsSection({
  initialProducts = [],
  todayDealSettings,
}: ShopAllProductsSectionProps) {
  const [productsList, setProductsList] = useState<Product[]>(() =>
    deduplicateProductsBySlug(initialProducts)
  );
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [splitIndex, setSplitIndex] = useState<number>(8); // Default 8 items = 4 rows on mobile (2 cols)
  const sectionRef = useRef<HTMLElement>(null);

  // Responsive calculation for exactly 4 rows before Today's Deal banner
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setSplitIndex(12); // Clean 3 rows of 4 cols, or 2 rows of 6 on desktop
      } else if (w >= 640) {
        setSplitIndex(12); // 4 rows of 3 cols = 12 items on tablet
      } else {
        setSplitIndex(8); // Exactly 4 rows of 2 cols = 8 items on mobile
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── 1. Real-Time Firebase Firestore Integration ──
  useEffect(() => {
    try {
      const q = query(collection(db, "products"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveDocs = snapshot.docs.map((d) =>
              normalizeProduct({ ...d.data(), id: d.id } as Product)
            );
            if (liveDocs.length > 0) {
              setProductsList(deduplicateProductsBySlug(liveDocs));
            }
          }
        },
        (err) => {
          console.warn("Firestore onSnapshot error in ShopAllProductsSection:", err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Real-time listener setup failed, using server products:", e);
    }
  }, []);

  // Update if server revalidation provides newer products
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProductsList((prev) => (prev.length === 0 ? deduplicateProductsBySlug(initialProducts) : prev));
    }
  }, [initialProducts]);

  // ── 2. Filter for Valid Published Products (Exclude draft, inactive, archived, deleted) ──
  const publishedProducts = useMemo(() => {
    return productsList.filter((p) => {
      const status = (p.status || "").toLowerCase().trim();
      if (status === "draft" || status === "inactive" || status === "archived" || status === "deleted") {
        return false;
      }
      if ((p as any).is_deleted === true || (p as any).deleted === true) {
        return false;
      }
      return true;
    });
  }, [productsList]);

  // Currently visible products slice (Pagination)
  const displayedProducts = useMemo(() => {
    return publishedProducts.slice(0, visibleCount);
  }, [publishedProducts, visibleCount]);

  // First 4 rows of products (8 items on mobile, 12 on desktop/tablet)
  const firstBatch = useMemo(() => {
    return displayedProducts.slice(0, splitIndex);
  }, [displayedProducts, splitIndex]);

  // Remaining products after Today's Deal banner
  const secondBatch = useMemo(() => {
    return displayedProducts.slice(splitIndex);
  }, [displayedProducts, splitIndex]);

  const hasMore = visibleCount < publishedProducts.length;
  const remainingCount = Math.max(0, publishedProducts.length - visibleCount);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_BATCH);
      setIsLoadingMore(false);
    }, 250);
  };

  if (publishedProducts.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="shop-all-products"
      aria-label="Shop All Products"
      className="w-full py-6 sm:py-8 font-sans"
    >
      {/* ── Product Grid - Part 1 (First 4 Rows) ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {firstBatch.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
            {firstBatch.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-white border border-[#E8E8E8] rounded-2xl p-8 max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#111111] mb-1">No products found</h3>
            <p className="text-xs text-neutral-500 mb-4">
              No products are currently available in the catalogue.
            </p>
          </div>
        )}
      </div>

      {/* ── Today's Deal Promotional Banner (Rendered directly after 4 rows of products, Full Screen Width) ── */}
      {todayDealSettings && (
        <div className="w-full my-8 sm:my-14">
          <TodayDealSection settings={todayDealSettings} />
        </div>
      )}

      {/* ── Product Grid - Part 2 (Remaining Products) ── */}
      {secondBatch.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 mt-8 sm:mt-12">
            {secondBatch.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress Bar & Load More Products Section ── */}
      {publishedProducts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 sm:mt-16 flex flex-col items-center justify-center max-w-sm sm:max-w-md mx-auto text-center font-sans px-4">
            {/* Progress Header: Showing X of Y products & Percentage */}
            <div className="w-full flex items-center justify-between text-xs sm:text-[13px] font-medium text-neutral-600 mb-2">
              <span>
                Showing <span className="font-bold text-neutral-900">{Math.min(displayedProducts.length, publishedProducts.length)}</span> of <span className="font-bold text-neutral-900">{publishedProducts.length}</span> products
              </span>
              <span className="font-bold text-neutral-900">
                {publishedProducts.length > 0
                  ? Math.min(100, Math.round((Math.min(displayedProducts.length, publishedProducts.length) / publishedProducts.length) * 100))
                  : 100}%
              </span>
            </div>

            {/* Thin Progress Bar with Burgundy Fill */}
            <div className="w-full h-1.5 sm:h-2 bg-neutral-200/90 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#64152F] rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    publishedProducts.length > 0
                      ? Math.min(100, Math.round((Math.min(displayedProducts.length, publishedProducts.length) / publishedProducts.length) * 100))
                      : 100
                  }%`,
                }}
                role="progressbar"
                aria-valuenow={
                  publishedProducts.length > 0
                    ? Math.min(100, Math.round((Math.min(displayedProducts.length, publishedProducts.length) / publishedProducts.length) * 100))
                    : 100
                }
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Load More Button */}
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 sm:px-10 py-3 sm:py-3.5 bg-[#64152F] hover:bg-[#4E0F23] text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 group disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={`Load ${remainingCount} more products`}
              >
                <RefreshCw className={`w-4 h-4 text-white shrink-0 ${isLoadingMore ? "animate-spin" : "opacity-90"}`} />
                <span>Load More Products</span>
                {remainingCount > 0 && (
                  <span className="text-white/80 font-normal text-xs">
                    ({remainingCount} remaining)
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1 shrink-0" />
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-100 border border-neutral-200/70 text-neutral-600 text-xs font-semibold">
                <Check className="w-4 h-4 text-[#64152F]" />
                <span>All {publishedProducts.length} products loaded</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
