"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Images, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryImage, UiSettings } from "@/lib/types";
import AnimatedRays from "@/components/ui/animated-rays";
import SnowEffect from "@/components/ui/snow-effect";

const CAT_STYLE: Record<string, string> = {
  shop:      "from-gray-700 to-gray-900",
  repairs:   "from-gray-700 to-gray-900",
  customers: "from-gray-700 to-gray-900",
};

/* ─── Compact Bento Layout Spans ─── */
function getCardLayoutClass(index: number): string {
  switch (index) {
    case 0:
      return "sm:col-span-2 md:col-span-2 lg:col-span-2 md:row-span-2 aspect-[4/3] sm:aspect-auto min-h-[250px] sm:min-h-[340px]";
    case 3:
      return "sm:col-span-2 md:col-span-2 lg:col-span-2 aspect-[16/9] sm:aspect-auto min-h-[150px] sm:min-h-[165px]";
    case 6:
      return "sm:col-span-2 md:col-span-2 lg:col-span-2 aspect-[16/9] sm:aspect-auto min-h-[150px] sm:min-h-[165px]";
    default:
      return "col-span-1 aspect-[4/3] sm:aspect-auto min-h-[150px] sm:min-h-[165px]";
  }
}

/* ─── Clean Bento Image Card ─── */
function GalleryCard({
  image,
  index,
  cardClass = "",
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  cardClass?: string;
  onOpen: () => void;
}) {
  // Clean duplicate text in captions if present
  const formattedCaption = image.caption
    ? image.caption
        .replace(/Happy Customercustomers/gi, "Happy Customer")
        .replace(/Customercustomers/gi, "Customer")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] as const }}
      className={`relative group w-full h-full rounded-[22px] overflow-hidden cursor-pointer bg-slate-950 border border-white/10 hover:border-white/40 transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.12)] hover:-translate-y-1 ${cardClass}`}
      onClick={onOpen}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Main image with smooth luxury zoom */}
        <img
          src={image.image_url}
          alt={formattedCaption || "Gallery"}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Category badge */}
        {image.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white bg-black/60 border border-white/20 backdrop-blur-md shadow-md z-10">
            {image.category}
          </div>
        )}

        {/* Floating Zoom icon with blur */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg z-10">
          <Maximize2 className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Glassmorphic Caption Banner */}
        {formattedCaption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
            <div className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-xl">
              <p className="text-white text-xs font-medium leading-snug drop-shadow line-clamp-1">
                {formattedCaption}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Ultra-Premium Interactive Lightbox ─── */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onSelect,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onSelect((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onSelect((currentIndex + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onSelect]);

  if (!currentImage) return null;

  const formattedCaption = currentImage.caption
    ? currentImage.caption
        .replace(/Happy Customercustomers/gi, "Happy Customer")
        .replace(/Customercustomers/gi, "Customer")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-2xl select-none"
    >
      {/* Background click to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider text-white backdrop-blur-md">
            {currentImage.category ? currentImage.category.toUpperCase() : "GALLERY"}
          </div>
          <span className="text-xs text-white/60 font-mono">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image View with Nav Arrows */}
      <div className="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center my-3 overflow-hidden">
        {/* Prev Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Animated Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage.id || currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            src={currentImage.image_url}
            alt={formattedCaption || "Street Mobile Gallery"}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
          />
        </AnimatePresence>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect((currentIndex + 1) % images.length);
            }}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption Bar */}
      {formattedCaption && (
        <div className="relative z-10 w-full max-w-2xl px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl text-center shadow-2xl">
          <p className="text-white text-xs sm:text-sm font-medium tracking-wide">
            {formattedCaption}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Heading variants ─── */
const headVar: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ─── Main Section ─── */
export default function GallerySection({ images, uiSettings }: { images: GalleryImage[], uiSettings?: UiSettings }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Show max 8 images in preview grid
  const preview = images.slice(0, 8);

  if (preview.length === 0) return null;

  return (
    <section className="relative py-14 bg-black border-y border-white/5 overflow-hidden">
      {/* ── Ambient glows ── */}
      <AnimatedRays />
      
      {/* ── Snow Effect Toggle ── */}
      {uiSettings?.snowEffectEnabled && <SnowEffect />}
      
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        {/* ── Header ── */}
        <motion.div
          variants={headVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase text-white/70 mb-3">
              <Images className="w-3 h-3" />
              Our Gallery
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
              Inside{" "}
              <span className="text-white">
                Street Mobile
              </span>
            </h2>
            <p className="text-white/60 text-sm max-w-md">
              A visual journey through our store, repair workshop, and happy customers.
            </p>
          </div>

          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-white/10 border border-white/20 text-white text-xs font-semibold
                       hover:bg-white hover:text-black hover:border-white
                       transition-all duration-300 shrink-0"
          >
            View All Photos
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Stylish Bento Gallery Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-4 mt-6 mb-2">
          {preview.map((img, index) => (
            <GalleryCard 
              key={img.id || index} 
              image={img} 
              index={index}
              cardClass={getCardLayoutClass(index)}
              onOpen={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/gallery"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-xl
                       bg-white
                       text-black font-semibold text-xs shadow-lg shadow-white/10
                       hover:shadow-white/20 hover:scale-[1.02]
                       transition-all duration-300 active:scale-[0.98]"
          >
            <Images className="w-3.5 h-3.5" />
            Explore Full Gallery
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox 
            images={preview} 
            currentIndex={selectedIndex} 
            onClose={() => setSelectedIndex(null)}
            onSelect={(newIdx) => setSelectedIndex(newIdx)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
