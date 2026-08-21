"use client";

import React from "react";
import Link from "next/link";
import { 
  Smartphone, 
  Tablet, 
  Watch, 
  Headphones, 
  Speaker, 
  Zap, 
  BatteryCharging, 
  Laptop, 
  Shield, 
  Sparkles,
  Flame,
  Tag,
  ShoppingBag,
  ChevronRight
} from "lucide-react";
import { Category } from "@/lib/types";

interface QuickCategoriesMobileProps {
  categories: Category[];
}

// Icon mapping helper for categories
function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("phone") || n.includes("mobile") || n.includes("smartphone")) return <Smartphone className="w-4 h-4" />;
  if (n.includes("tablet") || n.includes("ipad")) return <Tablet className="w-4 h-4" />;
  if (n.includes("watch")) return <Watch className="w-4 h-4" />;
  if (n.includes("earbud") || n.includes("tws") || n.includes("airpod")) return <Headphones className="w-4 h-4" />;
  if (n.includes("headphone") || n.includes("headset")) return <Headphones className="w-4 h-4" />;
  if (n.includes("speaker") || n.includes("soundbar")) return <Speaker className="w-4 h-4" />;
  if (n.includes("charger") || n.includes("adapter") || n.includes("cable")) return <Zap className="w-4 h-4" />;
  if (n.includes("power") || n.includes("battery")) return <BatteryCharging className="w-4 h-4" />;
  if (n.includes("laptop") || n.includes("macbook")) return <Laptop className="w-4 h-4" />;
  if (n.includes("case") || n.includes("cover") || n.includes("protector")) return <Shield className="w-4 h-4" />;
  return <ShoppingBag className="w-4 h-4" />;
}

export default function QuickCategoriesMobile({ categories }: QuickCategoriesMobileProps) {
  // Filter out any empty names and take top categories
  const activeCategories = (categories && categories.length > 0 ? categories : [])
    .filter((c) => c.name && c.name.trim())
    .slice(0, 12);

  return (
    <section className="lg:hidden w-full bg-white border-b border-neutral-100 py-3.5 px-4">
      
      {/* ── 1. Quick Discovery Shortcuts Row ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2.5 mb-2.5 border-b border-neutral-100/80 -mx-4 px-4">
        <Link
          href="/products?new=true"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs active:scale-95 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>New Arrivals</span>
        </Link>

        <Link
          href="/products?featured=true"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 transition-transform"
        >
          <Flame className="w-3.5 h-3.5 text-red-600" />
          <span>Best Sellers</span>
        </Link>

        <Link
          href="/products?sale=true"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 transition-transform"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-600" />
          <span>Latest Offers</span>
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-600" />
          <span>Shop All</span>
        </Link>
      </div>

      {/* ── 2. Header: Shop by Category & View All ── */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
          Shop by Category
        </h2>
        <Link
          href="/categories"
          className="text-xs font-bold text-neutral-600 hover:text-black flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── 3. Horizontally Scrollable Category Chips (44px touch targets) ── */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 py-1">
        {activeCategories.map((cat) => {
          const cleanName = cat.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim();
          const href = `/products?category=${encodeURIComponent(cleanName)}`;

          return (
            <Link
              key={cat.id || cat.slug || cleanName}
              href={href}
              className="flex items-center gap-2 px-3.5 min-h-[44px] rounded-2xl bg-[#F8F8F9] hover:bg-neutral-200/80 border border-neutral-200/60 text-xs font-bold text-neutral-900 whitespace-nowrap shrink-0 active:scale-95 transition-all shadow-2xs"
            >
              <span className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-black border border-neutral-200/80 shrink-0 shadow-2xs">
                {getCategoryIcon(cleanName)}
              </span>
              <span>{cleanName}</span>
            </Link>
          );
        })}
      </div>

    </section>
  );
}
