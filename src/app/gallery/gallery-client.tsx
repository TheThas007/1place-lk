"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3, LayoutGrid } from "lucide-react";
import { GalleryImage } from "@/lib/types";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "shop", label: "Our Shop" },
  { key: "repairs", label: "Repairs" },
  { key: "customers", label: "Customers" },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function GalleryClient({
  initialImages,
}: {
  initialImages: GalleryImage[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [layout, setLayout] = useState<"masonry" | "grid">("masonry");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? initialImages
      : initialImages.filter((img) => img.category === activeCategory);

  const openLightbox = (globalIndex: number) => setLightboxIndex(globalIndex);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const next = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, prev, next]);

  const categoryColor: Record<string, string> = {
    shop: "from-blue-500 to-indigo-600",
    repairs: "from-amber-500 to-orange-600",
    customers: "from-emerald-500 to-teal-600",
  };

  return (
    <div className="bg-background min-h-screen">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 blur-3xl animate-[pulse-soft_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl animate-[pulse-soft_8s_ease-in-out_infinite_1s]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Street Mobile Gallery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              Behind the{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  Scenes
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-full -z-0" />
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              A visual journey through our store, repair workshop, and happy
              customers.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-6 mt-8"
          >
            {[
              { value: initialImages.length, label: "Photos" },
              { value: CATEGORIES.length - 1, label: "Categories" },
              { value: "HD", label: "Quality" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-2xl font-bold">{s.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Controls Bar ─── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                  activeCategory === cat.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {activeCategory === cat.key && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-foreground/10 border border-border rounded-xl"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
                {activeCategory === cat.key && (
                  <span className="relative z-10 ml-1.5 text-xs text-muted-foreground">
                    {cat.key === "all"
                      ? initialImages.length
                      : initialImages.filter((i) => i.category === cat.key)
                          .length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-foreground/5 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setLayout("masonry")}
              className={`p-2 rounded-lg transition-all ${
                layout === "masonry"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout("grid")}
              className={`p-2 rounded-lg transition-all ${
                layout === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Gallery Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">No images here yet</h3>
            <p className="text-muted-foreground">Check back soon!</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${layout}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={
                layout === "masonry"
                  ? "columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
                  : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
              }
            >
              {filtered.map((img, idx) => (
                <motion.div
                  key={img.id || idx}
                  variants={itemVariants}
                  layout
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                    layout === "masonry" ? "break-inside-avoid" : ""
                  }`}
                  onHoverStart={() => setHoveredId(img.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => openLightbox(idx)}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Image wrapper */}
                  <div
                    className={`relative overflow-hidden ${
                      layout === "grid"
                        ? "aspect-square"
                        : idx % 5 === 0
                        ? "aspect-[4/5]"
                        : idx % 3 === 0
                        ? "aspect-[3/4]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || `Gallery image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                    {/* Zoom icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={
                        hoveredId === img.id
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.6 }
                      }
                      transition={{ duration: 0.25 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </motion.div>

                    {/* Category badge */}
                    {img.category && (
                      <div
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r ${
                          categoryColor[img.category] ||
                          "from-slate-500 to-slate-700"
                        } text-[10px] font-semibold text-white uppercase tracking-wider shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      >
                        {img.category}
                      </div>
                    )}

                    {/* Caption */}
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                        <p className="text-white text-sm font-medium leading-snug drop-shadow-md">
                          {img.caption}
                        </p>
                      </div>
                    )}

                    {/* Shimmer border on hover */}
                    <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-white/20 transition-all duration-400 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ─── Lightbox ─── */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={closeLightbox}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full h-full p-4 md:p-12">
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  {filtered[lightboxIndex].category && (
                    <span
                      className={`px-3 py-1 rounded-full bg-gradient-to-r ${
                        categoryColor[filtered[lightboxIndex].category] ||
                        "from-slate-500 to-slate-700"
                      } text-xs font-semibold text-white uppercase tracking-wider`}
                    >
                      {filtered[lightboxIndex].category}
                    </span>
                  )}
                  <span className="text-white/50 text-sm">
                    {lightboxIndex + 1} / {filtered.length}
                  </span>
                </div>
                <button
                  onClick={closeLightbox}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center w-full mt-16 mb-16 relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lightboxIndex}
                    src={filtered[lightboxIndex].image_url}
                    alt={
                      filtered[lightboxIndex].caption ||
                      `Gallery image ${lightboxIndex + 1}`
                    }
                    initial={{ opacity: 0, scale: 0.92, x: 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.92, x: -40 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl select-none"
                    style={{ maxHeight: "calc(100vh - 160px)" }}
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Nav arrows */}
                <button
                  onClick={prev}
                  className="absolute left-2 md:left-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 md:right-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Caption & thumbnail strip */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 pt-8 pb-4 flex flex-col items-center gap-4">
                {filtered[lightboxIndex].caption && (
                  <p className="text-white/80 text-sm text-center">
                    {filtered[lightboxIndex].caption}
                  </p>
                )}
                {/* Dot indicators */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={`transition-all duration-300 rounded-full ${
                        i === lightboxIndex
                          ? "w-6 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
