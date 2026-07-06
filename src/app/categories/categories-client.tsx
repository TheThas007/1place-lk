"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { Category } from "@/lib/types";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* gradient pool for accent lines */
const GRADIENTS = [
  "from-blue-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
];

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-background min-h-screen">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-violet-400/8 to-fuchsia-400/8 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/6 to-blue-400/6 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-xs font-semibold text-muted-foreground mb-5 uppercase tracking-widest">
              <Layers className="w-3 h-3" />
              All Categories
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Shop by{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  Category
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-full origin-left -z-0"
                />
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Browse our{" "}
              <span className="font-semibold text-foreground">{categories.length}</span>{" "}
              categories — from the latest smartphones to must-have accessories.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══ CATEGORY GRID ═══ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {categories.map((category, idx) => (
            <motion.div key={category.id} variants={cardVariants}>
              <Link
                href={`/categories/${category.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 hover:border-border bg-card hover:shadow-2xl hover:shadow-black/5 transition-all duration-400 h-full"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-108 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Top accent gradient bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                      GRADIENTS[idx % GRADIENTS.length]
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
                  />

                  {/* Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10">
                      {category.icon.startsWith("http") ? (
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-5 h-5 filter invert"
                        />
                      ) : (
                        <span className="text-lg leading-none">{category.icon}</span>
                      )}
                    </div>
                  </div>

                  {/* Name on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-base lg:text-lg leading-snug">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between px-4 py-3 bg-card">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Explore
                  </span>
                  <motion.div
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-all duration-300"
                    whileHover={{ x: 2 }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 group-hover:text-background transition-colors" />
                  </motion.div>
                </div>

                {/* Gradient accent line bottom on hover */}
                <div
                  className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r ${
                    GRADIENTS[idx % GRADIENTS.length]
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-full`}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ Browse All CTA ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 flex flex-col items-center text-center gap-5 py-16 rounded-3xl bg-gradient-to-br from-foreground/3 to-foreground/6 border border-border/50"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Can't find what you need?
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Browse All Products</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Use our full product catalog with search and filters to find exactly what you're looking for.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-2xl font-semibold text-sm shadow-lg shadow-foreground/10 hover:shadow-foreground/20 hover:bg-foreground/90 transition-all active:scale-95"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
