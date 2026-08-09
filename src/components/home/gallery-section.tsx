"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Images } from "lucide-react";
import { GalleryImage, UiSettings } from "@/lib/types";
import AnimatedRays from "@/components/ui/animated-rays";
import SnowEffect from "@/components/ui/snow-effect";

/* ─── Clean Image Card ─── */
function GalleryCard({
  image,
  index,
}: {
  image: GalleryImage;
  index: number;
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
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
      className="relative group w-full h-[240px] sm:h-[280px] rounded-[22px] overflow-hidden bg-slate-950 border border-white/10 hover:border-white/40 transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.12)] hover:-translate-y-1"
    >
      <Link href="/gallery" className="block relative w-full h-full overflow-hidden">
        {/* Main image with smooth zoom */}
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

        {/* Floating Arrow icon with blur on hover */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg z-10">
          <ArrowRight className="w-3.5 h-3.5 text-white" />
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
      </Link>
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
  // Show exactly max 4 images in homepage preview grid
  const preview = images.slice(0, 4);

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

        {/* ── 4 Image Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4 mt-6 mb-2">
          {preview.map((img, index) => (
            <GalleryCard 
              key={img.id || index} 
              image={img} 
              index={index}
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
    </section>
  );
}
