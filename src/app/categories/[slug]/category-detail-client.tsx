"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Package, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Product, Category } from "@/lib/types";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function CategoryDetailClient({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/8 to-violet-400/8 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-400/6 to-teal-400/6 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-12 md:py-20">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Categories
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-border flex items-center justify-center shadow-xl shadow-black/5 shrink-0"
            >
              {category.icon.startsWith("http") ? (
                <img src={category.icon} alt={category.name} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-5xl">{category.icon}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-widest">
                <ShoppingBag className="w-3 h-3" />
                {products.length} products
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">{category.name}</h1>
              <p className="text-muted-foreground text-base max-w-xl">
                Explore our authentic {category.name} collection — from the latest releases to
                essential everyday accessories.
              </p>
            </motion.div>
          </div>

          {/* Animated divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left"
          />
        </div>
      </div>

      {/* ═══ PRODUCTS ═══ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-bold"
          >
            Products{" "}
            <span className="text-muted-foreground font-normal text-base">
              ({products.length})
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-border/50 text-center"
          >
            <Package className="w-12 h-12 text-border mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              We're updating our {category.name} inventory. Check back soon!
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-foreground text-background rounded-xl font-medium text-sm"
            >
              Browse all products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-2xl hover:shadow-black/5 transition-all duration-400 flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-foreground/3 to-foreground/6 p-4 flex items-center justify-center overflow-hidden">
                    {product.old_price && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                        Sale
                      </div>
                    )}
                    {product.stock_status === "out_of_stock" && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                        Sold Out
                      </div>
                    )}
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                        {product.category_name}
                      </div>
                      <h3 className="font-semibold text-sm lg:text-base line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors duration-200">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-2 mt-auto pt-2 border-t border-border/40">
                      <span className="font-bold text-sm lg:text-base">
                        {formatPrice(product.price)}
                      </span>
                      {product.old_price && (
                        <>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.old_price)}
                          </span>
                          <span className="ml-auto text-[10px] font-bold text-red-500">
                            {Math.round(
                              ((product.old_price - product.price) / product.old_price) * 100
                            )}
                            % OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
