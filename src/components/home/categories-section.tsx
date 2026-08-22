"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Brand } from "@/lib/types";
import { DEFAULT_BRANDS } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import ScrollReveal from "@/components/ui/ScrollReveal";

type Tab = "phones" | "laptops" | "accessories";

interface CategoriesSectionProps {
  categories?: Category[];
  brands?: Brand[];
}

function BrandCard({ brand, index, activeTab }: { brand: Brand; index: number; activeTab: Tab }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = brand.logo_url || (brand as any).logo || (brand as any).image_url;

  // Compute contextual link based on currently active tab and brand
  const brandName = brand.slug || brand.name;
  let targetLink = brand.link_destination || "";

  if (!targetLink || targetLink === `/products?brand=${brandName}` || !targetLink.includes("?")) {
    if (activeTab === "phones") {
      targetLink = `/products?brand=${encodeURIComponent(brandName)}&cat_chip=smartphones`;
    } else if (activeTab === "laptops") {
      targetLink = `/products?brand=${encodeURIComponent(brandName)}&cat_chip=laptops-tablets`;
    } else if (activeTab === "accessories") {
      targetLink = `/products?brand=${encodeURIComponent(brandName)}&category=accessories`;
    } else {
      targetLink = `/products?brand=${encodeURIComponent(brandName)}`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25), ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={targetLink}
        title={brand.name}
        className="group relative flex items-center justify-center p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white border border-neutral-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:border-neutral-300 hover:-translate-y-1.5 transition-all duration-300 w-full aspect-[4/3] min-h-[110px] sm:min-h-[140px] md:min-h-[155px]"
      >
        {/* Centered Large Genuine Brand Logo */}
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          {!imgError && logoUrl ? (
            <img
              src={logoUrl}
              alt={brand.logo_alt_text || `${brand.name} logo`}
              loading="lazy"
              className="max-h-14 sm:max-h-18 md:max-h-20 max-w-[86%] sm:max-w-[85%] w-auto h-auto object-contain transition-transform duration-300 ease-out group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-lg sm:text-2xl font-black text-black font-mono tracking-tight select-none">
              {brand.name}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({ categories = [], brands = [] }: CategoriesSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("phones");
  const [liveBrands, setLiveBrands] = useState<Brand[]>(brands && brands.length > 0 ? brands : DEFAULT_BRANDS);

  // Real-time Firestore sync: Any brand uploaded in admin reflects on homepage immediately
  useEffect(() => {
    try {
      const q = query(collection(db, "brands"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const brandMap = new Map<string, Brand>();
            DEFAULT_BRANDS.forEach((b) => brandMap.set(b.id, b));
            snapshot.docs.forEach((d) => {
              const data = d.data() as Brand;
              const id = d.id || data.id;
              const existing = brandMap.get(id) || brandMap.get(data.id);
              brandMap.set(id, { ...existing, ...data, id });
            });
            setLiveBrands(Array.from(brandMap.values()));
          }
        },
        (err) => {
          console.warn("Firestore brands onSnapshot warning:", err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Failed to subscribe to brands collection:", e);
    }
  }, []);

  const visibleBrands = useMemo(() => {
    return liveBrands
      .filter((b) => b.show_on_homepage !== false && b.status !== "inactive")
      .filter((b) => {
        const group = (b.product_group || "smartphones").toLowerCase();
        if (activeTab === "phones") return group === "smartphones" || group === "phones";
        if (activeTab === "laptops") return group === "laptops";
        if (activeTab === "accessories") return group === "accessories" || group === "audio" || group === "other";
        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [liveBrands, activeTab]);

  return (
    <ScrollReveal
      as="section"
      id="categories-section"
      stagger={0.05}
      yOffset={20}
      className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-neutral-200/60 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header Title & Subtitle */}
        <div data-reveal-item className="text-center mb-8 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Browse our full lineup of genuine products from top global manufacturers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div data-reveal-item className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/90 border border-neutral-200/80 shadow-xs relative">
            {(["phones", "laptops", "accessories"] as Tab[]).map((t) => {
              const isActive = activeTab === t;
              const label = t === "phones" ? "📱 Smartphones" : t === "laptops" ? "💻 Laptops" : "🎧 Accessories";
              
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 capitalize z-10 cursor-pointer ${
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

        {/* Brand Grid - 6 columns matching Apple-style squircle badges */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6"
          >
            {visibleBrands.map((brand, i) => (
              <BrandCard key={brand.id || i} brand={brand} index={i} activeTab={activeTab} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Products Button */}
        <div data-reveal-item className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-200/90 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black hover:border-black transition-all duration-300 bg-white shadow-xs"
          >
            <span>View All Brands &amp; Products</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </ScrollReveal>
  );
}
