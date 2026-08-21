"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Images } from "lucide-react";
import { GalleryImage, UiSettings } from "@/lib/types";
import ScrollReveal from "@/components/ui/ScrollReveal";

function InstagramIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function validateUrl(url?: string): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url.trim();
    }
  } catch {}
  return null;
}

/* ─── Refined Editorial Gallery Card ─── */
function GalleryCard({
  image,
  index,
}: {
  image: GalleryImage;
  index: number;
}) {
  const validPostUrl = validateUrl(image.post_url);
  const isInstagram =
    image.platform === "instagram" ||
    (validPostUrl && validPostUrl.includes("instagram.com"));
  const titleText = image.caption || image.title || "Life at Street Mobile";

  const CardContent = (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100">
      {/* 1. Edge-to-Edge Image with Smooth Subtle Scale */}
      <img
        src={image.image_url}
        alt={titleText}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.025]"
      />

      {/* 2. Top-Left Category Badge (12px offset, compact 5px radius) */}
      {image.category && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-white/90 backdrop-blur-md border border-neutral-200/60 shadow-2xs z-10 select-none">
          {image.category}
        </div>
      )}

      {/* 3. Top-Right Social Badge (Compact Instagram indicator) */}
      {isInstagram && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-[5px] text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 z-10 select-none">
          <InstagramIcon className="w-3 h-3 text-pink-400" />
          <span>Instagram</span>
        </div>
      )}

      {/* 4. Compact Bottom Gradient Overlay & Typography */}
      <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-3.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end z-10 pointer-events-none">
        <p className="text-white text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow-xs m-0">
          {titleText}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative group aspect-[4/5] rounded-[11px] overflow-hidden border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex-shrink-0 w-[84vw] sm:w-auto"
    >
      {validPostUrl ? (
        <a
          href={validPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View on Social Media: ${titleText}`}
          className="block w-full h-full cursor-pointer focus:outline-none"
        >
          {CardContent}
        </a>
      ) : (
        <Link
          href="/gallery"
          aria-label={`View Gallery: ${titleText}`}
          className="block w-full h-full focus:outline-none"
        >
          {CardContent}
        </Link>
      )}
    </motion.div>
  );
}

/* ─── Header Animation Variants ─── */
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Main Gallery Section (Exact #FAFAFA Background Preserved) ─── */
export default function GallerySection({
  images,
}: {
  images: GalleryImage[];
  uiSettings?: UiSettings;
}) {
  // Filter visible images & show 4 cards on homepage
  const visibleImages = images.filter((img) => img.visible !== false);
  const preview = visibleImages.slice(0, 4);

  if (preview.length === 0) return null;

  return (
    <ScrollReveal
      as="section"
      id="gallery-section"
      stagger={0.06}
      yOffset={20}
      className="relative py-12 sm:py-16 lg:py-[72px] bg-[#FAFAFA] border-y border-neutral-200/80 overflow-hidden font-sans"
    >
      {/* ── Content Container (1320px Max-Width, Width: calc(100% - 48px)) ── */}
      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* ── Header Row (2-Column Alignment with Action Button) ── */}
        <div
          data-reveal-item
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-10"
        >
          <div className="flex flex-col items-start text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white border border-neutral-200/80 text-neutral-800 text-[11px] font-bold uppercase tracking-[0.08em] shadow-2xs mb-2.5">
              <Images className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>STORE HIGHLIGHTS &amp; SOCIAL MEDIA</span>
            </div>

            {/* Main Heading */}
            <h2
              className="text-neutral-900 font-bold tracking-[-0.035em] leading-[1.0] m-0 p-0"
              style={{ fontSize: "clamp(38px, 3vw, 52px)" }}
            >
              Life at Street Mobile
            </h2>

            {/* Supporting Description */}
            <p className="text-[15px] sm:text-[17px] leading-[1.55] text-neutral-600 mt-2 max-w-[560px] font-normal m-0">
              Explore recent moments from our Vavuniya showroom, repair lab, and customer deliveries.
            </p>
          </div>

          {/* Action Button (Desktop: Right aligned with header; Mobile: Placed cleanly) */}
          <Link
            href="/gallery"
            className="group inline-flex items-center justify-center gap-2 h-[46px] sm:h-[48px] px-6 rounded-[8px] bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all shrink-0 self-start md:self-auto shadow-sm active:scale-[0.98]"
          >
            <span>View Complete Gallery</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
          </Link>
        </div>

        {/* ── Gallery Grid (Desktop: 4 equal cols; Tablet: 2 cols; Mobile: Snap Carousel) ── */}
        <div className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-[18px] lg:gap-5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {preview.map((img, idx) => (
            <div key={img.id || idx} data-reveal-item className="h-full">
              <GalleryCard image={img} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
