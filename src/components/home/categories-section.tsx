"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/lib/types";

type Tab = "phones" | "accessories";

function BrandCard({ cat, index }: { cat: Category; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/categories/${cat.slug}`}
        className="group flex flex-col items-center justify-center gap-3 p-4 sm:p-5
                   bg-background rounded-2xl border border-border/60
                   hover:border-foreground/25 hover:shadow-xl hover:shadow-foreground/5
                   hover:-translate-y-1 transition-all duration-300"
      >
        {/* Logo circle */}
        <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center
                        group-hover:bg-foreground/5 transition-colors duration-300 overflow-hidden p-2">
          <img
            src={cat.icon}
            alt={`${cat.name} logo`}
            className="w-14 h-14 object-contain opacity-90 group-hover:opacity-100
                       group-hover:scale-110 transition-all duration-300"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
              const span = img.nextElementSibling as HTMLElement | null;
              if (span) span.style.display = "flex";
            }}
          />
          <span
            className="w-9 h-9 rounded-full bg-foreground/10 text-foreground font-bold
                       text-xs items-center justify-center hidden"
            aria-hidden="true"
          >
            {cat.name.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-muted-foreground
                         group-hover:text-foreground transition-colors duration-300
                         text-center leading-tight">
          {cat.name}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  const [tab, setTab] = useState<Tab>("phones");

  const phoneCategories = useMemo(() => categories.filter((c) => c.group === "phones"), [categories]);
  const accessoryCategories = useMemo(() => categories.filter((c) => c.group === "accessories" || c.group === "other"), [categories]);

  const items = tab === "phones" ? phoneCategories : accessoryCategories;

  return (
    <section className="py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Shop by Brand
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base">
            Browse our full lineup of genuine products from top global brands.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-foreground/5 border border-border/60">
            {(["phones", "accessories"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 capitalize
                  ${tab === t
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t === "phones" ? "📱 Smartphones" : "🎧 Accessories"}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`grid gap-3 sm:gap-4
              ${tab === "phones"
                ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
              }`}
          >
            {items.map((cat, i) => (
              <BrandCard key={cat.id} cat={cat} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All */}
        <div className="text-center mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/70
                       text-sm font-semibold text-muted-foreground hover:text-foreground
                       hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300"
          >
            View All Categories →
          </Link>
        </div>

      </div>
    </section>
  );
}
