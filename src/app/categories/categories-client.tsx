"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Layers, Sparkles, Grid3x3, ChevronRight } from "lucide-react";
import { Category } from "@/lib/types";
import { useRef } from "react";

/* ─── Animation variants ─── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  },
};

const floatVariants: Variants = {
  idle: { y: 0 },
  float: {
    y: [-8, 8, -8],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ─── Color palettes per category slot ─── */
const PALETTES = [
  { from: "from-blue-500",    to: "to-violet-600",   glow: "rgba(139,92,246,0.35)",  light: "from-blue-50 to-violet-50"   },
  { from: "from-emerald-500", to: "to-teal-600",     glow: "rgba(20,184,166,0.35)",  light: "from-emerald-50 to-teal-50"  },
  { from: "from-orange-500",  to: "to-amber-500",    glow: "rgba(245,158,11,0.35)",  light: "from-orange-50 to-amber-50"  },
  { from: "from-pink-500",    to: "to-rose-600",     glow: "rgba(244,63,94,0.35)",   light: "from-pink-50 to-rose-50"     },
  { from: "from-cyan-500",    to: "to-blue-600",     glow: "rgba(6,182,212,0.35)",   light: "from-cyan-50 to-blue-50"     },
  { from: "from-fuchsia-500", to: "to-purple-600",   glow: "rgba(192,38,211,0.35)",  light: "from-fuchsia-50 to-purple-50"},
  { from: "from-lime-500",    to: "to-green-600",    glow: "rgba(101,163,13,0.35)",  light: "from-lime-50 to-green-50"    },
  { from: "from-rose-500",    to: "to-pink-600",     glow: "rgba(244,63,94,0.35)",   light: "from-rose-50 to-pink-50"     },
  { from: "from-indigo-500",  to: "to-blue-700",     glow: "rgba(99,102,241,0.35)",  light: "from-indigo-50 to-blue-50"   },
];

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* ══════════════════════════════════════
          PREMIUM HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-white">

        {/* Parallax background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          {/* Orbs */}
          <motion.div
            variants={floatVariants} initial="idle" animate="float"
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 blur-3xl"
          />
          <motion.div
            variants={floatVariants} initial="idle"
            animate={{ y: [8, -8, 8], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/8 to-blue-400/8 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-300/6 to-pink-300/6 blur-3xl"
          />
        </motion.div>

        {/* Fine dot grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-20 pb-16 md:pt-28 md:pb-20 text-center"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/60 text-violet-700 text-xs font-bold uppercase tracking-widest mb-7 shadow-sm"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            {categories.length} Categories
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-6"
          >
            Shop by{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
                Category
              </span>
              {/* Animated underline */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 rounded-full origin-left -z-0 blur-[2px]"
              />
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full origin-left z-10"
              />
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-500 text-lg md:text-xl max-w-lg mx-auto leading-relaxed"
          >
            From the latest smartphones to must-have accessories — discover
            your perfect pick.
          </motion.p>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-10 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5 text-gray-300"
            >
              <div className="w-5 h-8 rounded-full border-2 border-gray-200 flex items-start justify-center pt-1">
                <motion.div
                  animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORY GRID
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {categories.map((category, idx) => {
            const palette = PALETTES[idx % PALETTES.length];
            return (
              <motion.div key={category.id} variants={cardVariants}>
                <Link href={`/categories/${category.slug}`} className="group block h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 rounded-3xl">
                  <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/80 transition-all duration-500 h-full flex flex-col">

                    {/* ── Image zone ── */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={category.image_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";
                        }}
                      />

                      {/* Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Gradient top accent bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${palette.from} ${palette.to} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                      />

                      {/* Icon badge */}
                      <div className="absolute top-4 left-4">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${palette.from} ${palette.to} flex items-center justify-center shadow-lg shadow-black/20 border border-white/20`}
                        >
                          {category.icon?.startsWith("http") ? (
                            <img src={category.icon} alt={category.name} className="w-5 h-5 filter invert" />
                          ) : (
                            <span className="text-xl leading-none">{category.icon}</span>
                          )}
                        </motion.div>
                      </div>

                      {/* Product count badge */}
                      <div className="absolute top-4 right-4">
                        <div className="px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white/80 text-xs font-semibold">
                          Explore
                        </div>
                      </div>

                      {/* Category name on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <motion.h3
                          className="text-white font-black text-xl leading-tight tracking-tight group-hover:translate-x-1 transition-transform duration-300"
                        >
                          {category.name}
                        </motion.h3>
                        {category.description && (
                          <p className="text-white/60 text-xs mt-1 line-clamp-1">{category.description}</p>
                        )}
                      </div>
                    </div>

                    {/* ── Bottom action row ── */}
                    <div className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r ${palette.light} transition-all duration-300`}>
                      <span className={`text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${palette.from} ${palette.to}`}>
                        Shop Now
                      </span>
                      <motion.div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${palette.from} ${palette.to} flex items-center justify-center shadow-md`}
                        whileHover={{ x: 3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>

                    {/* Hover glow effect */}
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 0 1.5px ${palette.glow}` }}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ══════════════════════════════════════
            BOTTOM CTA BANNER
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-12 md:p-16 text-center"
        >
          {/* BG orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl"
            />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Can't find what you need?
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Browse{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                All Products
              </span>
            </h2>

            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              Use our full catalog with advanced search and filters to find exactly what you're looking for.
            </p>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-sm shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all"
              >
                View All Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
