"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Zap, ChevronRight, Percent } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface MobileFlashSaleProps {
  products: Product[];
}

function calculateDiscountPercent(price: number | null | undefined, oldPrice: number | null | undefined): number {
  const p = Number(price);
  const op = Number(oldPrice);
  if (!p || !op || isNaN(p) || isNaN(op) || p <= 0 || op <= 0 || op <= p) {
    return 0;
  }
  return Math.round(((op - p) / op) * 100);
}

export default function MobileFlashSale({ products = [] }: MobileFlashSaleProps) {
  // Filter products with real discounts
  const discountedProducts = useMemo(() => {
    return (products || [])
      .filter((p) => {
        if (!p || !p.price) return false;
        const discount = calculateDiscountPercent(p.price, p.old_price);
        return discount > 0;
      })
      .slice(0, 10);
  }, [products]);

  // Auto-hide when no discounted products exist
  if (discountedProducts.length === 0) {
    return null;
  }

  // Check if any product has explicit flash sale tags
  const hasExplicitFlashSale = discountedProducts.some((p) => {
    const tags = p.tags || [];
    return (
      tags.some((t) => typeof t === "string" && t.toLowerCase().includes("flash")) ||
      (p as any).is_flash_sale === true ||
      (p as any).flash_deal === true
    );
  });

  const sectionTitle = hasExplicitFlashSale ? "Flash Deals" : "Today's Deals";
  const SectionIcon = hasExplicitFlashSale ? Zap : Percent;

  return (
    <section className="md:hidden w-full bg-white border-b border-neutral-100 py-3.5 px-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <SectionIcon className="w-4 h-4 text-black" />
          <h2 className="text-xs font-black uppercase tracking-tight text-neutral-900">
            {sectionTitle}
          </h2>
        </div>
        <Link
          href="/products?discount=true"
          className="text-[11px] font-bold text-neutral-600 hover:text-black flex items-center gap-0.5"
        >
          <span>Shop More</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal 2.3-Card Rail with Snap Scrolling (basis-[43vw] / w-[43vw]) */}
      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1 -mx-3 px-3">
        {discountedProducts.map((p) => {
          const discount = calculateDiscountPercent(p.price, p.old_price);
          const image = p.images?.[0] || "/placeholder.png";

          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="snap-start w-[42vw] min-w-[145px] max-w-[170px] bg-[#F8F9FA] rounded-2xl p-2 border border-neutral-200/80 flex flex-col justify-between shrink-0 active:scale-98 transition-transform shadow-2xs"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full rounded-xl bg-white p-2 mb-2 flex items-center justify-center overflow-hidden border border-neutral-100">
                <img
                  src={image}
                  alt={p.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                {discount > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-black leading-tight tracking-tight">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-neutral-900 line-clamp-1 leading-tight">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-black">
                    {formatPrice(p.price)}
                  </span>
                  {p.old_price && p.old_price > p.price && (
                    <span className="text-[10px] text-neutral-400 line-through">
                      {formatPrice(p.old_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
