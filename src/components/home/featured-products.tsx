"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products as fallbackProducts } from "@/lib/data";
import ProductCard from "@/components/products/ProductCard";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Product } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FeaturedProducts({
  initialProducts,
  initialVisible = true,
}: {
  initialProducts?: Product[];
  initialVisible?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [allProducts] = useState<Product[]>(initialProducts || []);

  // Real-time Firestore sync on settings/ui
  useEffect(() => {
    try {
      const docRef = doc(db, "settings", "ui");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.showFeaturedProducts !== undefined) {
              setIsVisible(data.showFeaturedProducts !== false);
            }
          }
        },
        () => {
          setIsVisible(true);
        }
      );
      return () => unsubscribe();
    } catch {
      setIsVisible(true);
    }
  }, []);

  // When disabled or empty, completely remove from the DOM with zero empty space or margin
  if (!isVisible || !allProducts || allProducts.length === 0) {
    return null;
  }

  let featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
  if (featuredProducts.length === 0) {
    featuredProducts = allProducts.slice(0, 4);
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <>
      {/* ── Mobile Layout (< 768px): Strict 2-Column Product Grid ── */}
      <div className="md:hidden w-full bg-white px-3 sm:px-4 py-3 select-none">
        {/* Mobile Header: Title & View All */}
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[19px] font-black text-neutral-900 tracking-tight">
            Featured Products
          </h2>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-neutral-900 hover:underline"
          >
            View all
          </Link>
        </div>

        {/* 2-Column Product Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {featuredProducts.map((product) => (
            <div key={`mob-fp-${product.id}`} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="featured-products"
          stagger={0.06}
          yOffset={20}
          className="pt-16 pb-6 sm:pt-20 sm:pb-8 lg:pt-24 lg:pb-10 bg-background relative overflow-hidden font-sans"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
            <div data-reveal-item className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-foreground">
                  Featured Products
                </h2>
                <p className="text-muted-foreground">Our handpicked premium selection.</p>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-emerald-400 transition-all duration-300 group"
              >
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} data-reveal-item className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
