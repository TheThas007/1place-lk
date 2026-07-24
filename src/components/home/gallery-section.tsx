"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Images, Maximize2 } from "lucide-react";
import { GalleryImage, UiSettings } from "@/lib/types";
import AnimatedRays from "@/components/ui/animated-rays";
import SnowEffect from "@/components/ui/snow-effect";

const CAT_STYLE: Record<string, string> = {
  shop:      "from-gray-700 to-gray-900",
  repairs:   "from-gray-700 to-gray-900",
  customers: "from-gray-700 to-gray-900",
};

/* ─── Clean Bento Image Card ─── */
function GalleryCard({
  image,
  index,
  isFeatured = false,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  isFeatured?: boolean;
  onOpen: (img: GalleryImage) => void;
}) {
  // Clean duplicate text in captions if present
  const formattedCaption = image.caption
    ? image.caption
        .replace(/Happy Customercustomers/gi, "Happy Customer")
        .replace(/Customercustomers/gi, "Customer")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`relative group w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-xl ${
        isFeatured ? "sm:col-span-2 md:row-span-2 aspect-[4/3] sm:aspect-[16/10] md:aspect-auto h-full min-h-[300px]" : "aspect-[4/3] min-h-[190px]"
      }`}
      onClick={() => onOpen(image)}
    >
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={image.image_url}
          alt={formattedCaption || "Gallery"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Category badge */}
        {image.category && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 border border-white/20 backdrop-blur-md shadow-md">
            {image.category}
          </div>
        )}

        {/* Zoom icon */}
        <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-md">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>

        {/* Caption */}
        {formattedCaption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <p className="text-white text-sm font-semibold leading-snug drop-shadow-md line-clamp-2">
              {formattedCaption}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ image, onClose }: { image: GalleryImage; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.img
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        src={image.image_url}
        alt={image.caption || "Gallery"}
        className="relative z-10 max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
      >
        ✕
      </button>
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
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  // Show max 8 images in preview grid
  const preview = images.slice(0, 8);

  if (preview.length === 0) return null;

  return (
    <section className="relative py-24 bg-black border-y border-white/5 overflow-hidden">
      {/* ── Ambient glows ── */}
      <AnimatedRays />
      
      {/* ── Snow Effect Toggle ── */}
      {uiSettings?.snowEffectEnabled && <SnowEffect />}
      
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {/* ── Header ── */}
        <motion.div
          variants={headVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase text-white/70 mb-5">
              <Images className="w-3.5 h-3.5" />
              Our Gallery
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              Inside{" "}
              <span className="text-white">
                Street Mobile
              </span>
            </h2>
            <p className="text-white/60 text-base max-w-md">
              A visual journey through our store, repair workshop, and happy customers.
            </p>
          </div>

          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl
                       bg-white/10 border border-white/20 text-white text-sm font-semibold
                       hover:bg-white hover:text-black hover:border-white
                       transition-all duration-300 shrink-0"
          >
            View All Photos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Stylish Bento Gallery Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 mt-8 mb-4">
          {preview.map((img, index) => (
            <GalleryCard 
              key={img.id || index} 
              image={img} 
              index={index}
              isFeatured={index === 0}
              onOpen={(image) => setLightbox(image)}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/gallery"
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl
                       bg-white
                       text-black font-semibold text-sm shadow-xl shadow-white/10
                       hover:shadow-white/20 hover:scale-[1.03]
                       transition-all duration-300 active:scale-[0.97]"
          >
            <Images className="w-4 h-4" />
            Explore Full Gallery
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
