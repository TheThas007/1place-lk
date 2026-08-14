"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Brand } from "@/lib/types";
import { DEFAULT_BRANDS } from "@/lib/data";

type Tab = "phones" | "laptops" | "accessories";

interface CategoriesSectionProps {
  categories?: Category[];
  brands?: Brand[];
}

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const [imgError, setImgError] = useState(false);
  const targetLink = brand.link_destination || `/products?brand=${encodeURIComponent(brand.slug || brand.name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={targetLink}
        className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-neutral-200/80 bg-white hover:border-black hover:shadow-md transition-all duration-300 gap-3 text-center h-36 sm:h-40 w-full"
      >
        {/* Top Logo Section (400x200 2:1 container, object-fit contain, never cropped) */}
        <div className="h-10 sm:h-12 w-full flex items-center justify-center">
          {!imgError && brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.logo_alt_text || `${brand.name} logo`}
              className={`max-h-8 sm:max-h-9 max-w-[80%] object-contain transition-all duration-300 ${
                brand.monochrome ? "grayscale" : "filter grayscale group-hover:grayscale-0 group-hover:scale-105"
              }`}
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-black font-mono tracking-tight">
              {brand.name.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        {/* Bottom Label Section */}
        <span className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-black transition-colors">
          {brand.name}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({ categories = [], brands = [] }: CategoriesSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("phones");

  const sourceBrands = useMemo(() => {
    return brands && brands.length > 0 ? brands : DEFAULT_BRANDS;
  }, [brands]);

  const visibleBrands = useMemo(() => {
    return sourceBrands
      .filter((b) => b.show_on_homepage !== false && b.status !== "inactive")
      .filter((b) => {
        const group = (b.product_group || "smartphones") as string;
        if (activeTab === "phones") return group === "smartphones" || group === "phones";
        if (activeTab === "laptops") return group === "laptops";
        if (activeTab === "accessories") return group === "accessories" || group === "audio" || group === "other";
        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [sourceBrands, activeTab]);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header Title & Subtitle */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Browse our full lineup of genuine products from top global manufacturers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1.5 rounded-full bg-neutral-100/80 border border-neutral-200/80 relative">
            {(["phones", "laptops", "accessories"] as Tab[]).map((t) => {
              const isActive = activeTab === t;
              const label = t === "phones" ? "📱 Smartphones" : t === "laptops" ? "💻 Laptops" : "🎧 Accessories";
              
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 capitalize z-10 ${
                    isActive ? "text-white" : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="brand-tab-active-pill"
                      className="absolute inset-0 bg-black rounded-full shadow-xs -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5"
          >
            {visibleBrands.map((brand, i) => (
              <BrandCard key={brand.id || i} brand={brand} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Products Button */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-200/80 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black hover:border-black transition-all duration-300 bg-white"
          >
            <span>View All Brands &amp; Products</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
