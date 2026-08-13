"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Brand } from "@/lib/types";

type Tab = "phones" | "laptops" | "accessories";

interface BrandItem {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  logo: string;
  group: Tab;
}

const BRAND_ITEMS: BrandItem[] = [
  // ── Smartphones Tab ──────────────────────────
  { id: "b-samsung", name: "Samsung", displayName: "SAMSUNG", slug: "samsung", logo: "https://cdn.simpleicons.org/samsung/000000", group: "phones" },
  { id: "b-apple", name: "Apple", displayName: "Apple", slug: "apple", logo: "https://cdn.simpleicons.org/apple/000000", group: "phones" },
  { id: "b-redmi", name: "Redmi", displayName: "Redmi", slug: "redmi", logo: "https://cdn.simpleicons.org/xiaomi/000000", group: "phones" },
  { id: "b-honor", name: "Honor", displayName: "HONOR", slug: "honor", logo: "https://cdn.simpleicons.org/honor/000000", group: "phones" },
  { id: "b-nokia", name: "Nokia", displayName: "NOKIA", slug: "nokia", logo: "https://cdn.simpleicons.org/nokia/000000", group: "phones" },
  { id: "b-oneplus", name: "OnePlus", displayName: "OnePlus", slug: "oneplus", logo: "https://cdn.simpleicons.org/oneplus/000000", group: "phones" },
  { id: "b-google", name: "Google", displayName: "Google", slug: "google", logo: "https://cdn.simpleicons.org/google/000000", group: "phones" },
  { id: "b-hmd", name: "HMD", displayName: "HMD", slug: "hmd", logo: "https://icon.horse/icon/hmd.com", group: "phones" },
  { id: "b-greentel", name: "Greentel", displayName: "Greentel", slug: "greentel", logo: "https://icon.horse/icon/greentel.lk", group: "phones" },

  // ── Laptops Tab ──────────────────────────────
  { id: "b-macbook", name: "Apple MacBook", displayName: "Apple MacBook", slug: "macbook", logo: "https://cdn.simpleicons.org/apple/000000", group: "laptops" },
  { id: "b-asus", name: "Asus ROG", displayName: "Asus ROG", slug: "asus", logo: "https://cdn.simpleicons.org/asus/000000", group: "laptops" },
  { id: "b-msi", name: "MSI Gaming", displayName: "MSI Gaming", slug: "msi", logo: "https://cdn.simpleicons.org/msi/000000", group: "laptops" },
  { id: "b-dell", name: "Dell XPS", displayName: "Dell XPS", slug: "dell", logo: "https://cdn.simpleicons.org/dell/000000", group: "laptops" },
  { id: "b-lenovo", name: "Lenovo ThinkPad", displayName: "Lenovo ThinkPad", slug: "lenovo", logo: "https://cdn.simpleicons.org/lenovo/000000", group: "laptops" },

  // ── Accessories Tab ──────────────────────────
  { id: "b-accessories", name: "Accessories", displayName: "Accessories", slug: "accessories", logo: "https://cdn.simpleicons.org/bluetooth/0082FC", group: "accessories" },
  { id: "b-anker", name: "Anker", displayName: "Anker", slug: "anker", logo: "https://cdn.simpleicons.org/anker/000000", group: "accessories" },
  { id: "b-soundcore", name: "Soundcore", displayName: "Soundcore", slug: "soundcore", logo: "https://icon.horse/icon/soundcore.com", group: "accessories" },
  { id: "b-ugreen", name: "Ugreen", displayName: "Ugreen", slug: "ugreen", logo: "https://icon.horse/icon/ugreen.com", group: "accessories" },
  { id: "b-baseus", name: "Baseus", displayName: "Baseus", slug: "baseus", logo: "https://icon.horse/icon/baseus.com", group: "accessories" },
  { id: "b-dji", name: "DJI", displayName: "DJI", slug: "dji", logo: "https://cdn.simpleicons.org/dji/000000", group: "accessories" },
  { id: "b-wiwu", name: "Wiwu", displayName: "Wiwu", slug: "wiwu", logo: "https://icon.horse/icon/wiwu.com", group: "accessories" },
  { id: "b-lenyes", name: "Lenyes", displayName: "Lenyes", slug: "lenyes", logo: "https://icon.horse/icon/lenyes.com", group: "accessories" },
  { id: "b-jbl", name: "JBL", displayName: "JBL", slug: "jbl", logo: "https://cdn.simpleicons.org/jbl/000000", group: "accessories" },
  { id: "b-oraimo", name: "Oraimo", displayName: "Oraimo", slug: "oraimo", logo: "https://icon.horse/icon/oraimo.com", group: "accessories" },
];

function BrandCard({ item, index }: { item: BrandItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={`/products?search=${encodeURIComponent(item.name)}`}
        className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-neutral-200/80 bg-white hover:border-black hover:shadow-md transition-all duration-300 gap-3 text-center h-36 sm:h-40 w-full"
      >
        {/* Top Logo Section */}
        <div className="h-10 sm:h-12 w-full flex items-center justify-center">
          {!imgError && item.logo ? (
            <img
              src={item.logo}
              alt={`${item.displayName} logo`}
              className="max-h-8 sm:max-h-9 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-black font-mono tracking-tight">
              {item.displayName.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        {/* Bottom Label Section */}
        <span className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-black transition-colors">
          {item.displayName}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({ categories = [], brands = [] }: { categories?: Category[]; brands?: Brand[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("phones");

  const visibleItems = useMemo(() => {
    return BRAND_ITEMS.filter((item) => item.group === activeTab);
  }, [activeTab]);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header Title & Subtitle */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Browse our full lineup of genuine products from top global brands.
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

        {/* Brand Grid - 5 Columns Desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5"
          >
            {visibleItems.map((item, i) => (
              <BrandCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Products Button */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-200/80 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black hover:border-black transition-all duration-300 bg-white"
          >
            <span>View All Products</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
