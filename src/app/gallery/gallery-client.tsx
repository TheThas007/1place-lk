"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { X, ZoomIn, Camera, Wrench, Users, LayoutGrid, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { GalleryImage } from "@/lib/types";

/* ─── Animation variants ─── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  },
};

/* ─── Filter tabs ─── */
const FILTERS: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: "All",       value: "all",       icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { label: "Shop",      value: "shop",      icon: <Camera className="w-3.5 h-3.5" /> },
  { label: "Repairs",   value: "repairs",   icon: <Wrench className="w-3.5 h-3.5" /> },
  { label: "Customers", value: "customers", icon: <Users className="w-3.5 h-3.5" /> },
];

const RATIOS = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[16/9]", "aspect-[3/4]", "aspect-[4/3]"];

const CATEGORY_COLORS: Record<string, string> = {
  shop:      "from-blue-500 to-indigo-600",
  repairs:   "from-orange-500 to-amber-500",
  customers: "from-emerald-500 to-teal-600",
};

export default function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeFilter === "all"
    ? images
    : images.filter((img) => img.category === activeFilter);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    document.documentElement.classList.add("lightbox-open");
  };
  const closeLightbox = useCallback(() => {
    setLightboxIdx(null);
    document.documentElement.classList.remove("lightbox-open");
  }, []);
  const prevImg = useCallback(() => setLightboxIdx((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : 0)), [filtered.length]);
  const nextImg = useCallback(() => setLightboxIdx((i) => (i !== null ? (i + 1) % filtered.length : 0)), [filtered.length]);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-violet-400/8 to-fuchsia-400/8 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -28, 0], y: [0, 32, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/7 to-cyan-400/7 blur-3xl"
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-20 pb-14 md:pt-28 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/70 text-violet-700 text-xs font-bold uppercase tracking-widest mb-7 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              Our Gallery
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-5">
              Inside{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
                  Street Mobile
                </span>
                <motion.span
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-violet-200 to-pink-200 rounded-full origin-left -z-0 blur-[2px]"
                />
                <motion.span
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full origin-left z-10"
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-gray-500 text-lg leading-relaxed max-w-md"
            >
              Take a look inside our store, repair center, and the happy customers we serve every day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              {[
                { label: `${images.length} Photos`,  color: "bg-violet-50 text-violet-700 border-violet-200/70" },
                { label: "Shop Tour",                 color: "bg-blue-50 text-blue-700 border-blue-200/70" },
                { label: "Repair Lab",                color: "bg-orange-50 text-orange-700 border-orange-200/70" },
                { label: "Our Customers",             color: "bg-emerald-50 text-emerald-700 border-emerald-200/70" },
              ].map((chip) => (
                <span key={chip.label} className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${chip.color} shadow-sm`}>
                  {chip.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY FILTER BAR
      ══════════════════════════════════════════ */}
      <section className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <motion.button
              key={f.value}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveFilter(f.value)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.value
                  ? "text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {activeFilter === f.value && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-xl bg-gray-950 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {f.icon}
              {f.label}
            </motion.button>
          ))}
          <span className="ml-auto text-xs text-gray-300 font-medium whitespace-nowrap pl-4">
            {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MASONRY GRID
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
              <ImageIcon className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              {activeFilter === "all"
                ? "We're updating our gallery. Check back soon!"
                : `No "${activeFilter}" images yet.`}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-6 px-6 py-2.5 bg-gray-950 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                View All Photos
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
            >
              {filtered.map((img, idx) => {
                const gradClass = CATEGORY_COLORS[img.category] || "from-gray-500 to-gray-600";
                const ratio = RATIOS[idx % RATIOS.length];
                return (
                  <motion.div key={img.id || idx} variants={cardVariants} className="break-inside-avoid">
                    <div
                      onClick={() => openLightbox(idx)}
                      className="group relative overflow-hidden rounded-2xl cursor-zoom-in shadow-sm hover:shadow-2xl hover:shadow-gray-300/60 transition-all duration-500"
                    >
                      <div className={`relative ${ratio} overflow-hidden bg-gray-100`}>
                        <img
                          src={img.image_url}
                          alt={img.caption || `Gallery image ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                        />
                        {/* Dark scrim */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/28 transition-colors duration-400" />
                        {/* Top accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradClass} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`} />
                        {/* Category badge */}
                        {img.category && (
                          <div className="absolute top-3.5 left-3.5">
                            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradClass} text-white text-[10px] font-bold uppercase tracking-widest shadow-lg`}>
                              {img.category}
                            </span>
                          </div>
                        )}
                        {/* Zoom icon */}
                        <div className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                          <ZoomIn className="w-[18px] h-[18px] text-white" />
                        </div>
                        {/* Caption */}
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/75 via-black/20 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                            <p className="text-white text-sm font-semibold leading-tight">{img.caption}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* ══════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxIdx !== null && filtered[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/96 backdrop-blur-xl p-4"
            onClick={closeLightbox}
          >
            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest z-20">
              {lightboxIdx + 1} / {filtered.length}
            </div>
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImg(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImg(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIdx}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-5xl max-h-[88vh] w-full flex flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filtered[lightboxIdx].image_url}
                  alt={filtered[lightboxIdx].caption || "Gallery image"}
                  className="max-h-[80vh] max-w-full w-auto h-auto rounded-2xl object-contain shadow-2xl"
                />
                {filtered[lightboxIdx].caption && (
                  <div className="flex items-center gap-3">
                    {filtered[lightboxIdx].category && (
                      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[filtered[lightboxIdx].category] || "from-gray-500 to-gray-600"} text-white text-[10px] font-bold uppercase tracking-widest`}>
                        {filtered[lightboxIdx].category}
                      </span>
                    )}
                    <p className="text-white/70 text-sm font-medium">{filtered[lightboxIdx].caption}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Filmstrip dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === lightboxIdx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
