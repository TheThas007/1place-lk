"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Images, ExternalLink } from "lucide-react";
import { GalleryImage, UiSettings } from "@/lib/types";
import AnimatedRays from "@/components/ui/animated-rays";
import SnowEffect from "@/components/ui/snow-effect";
import { getPlatformMeta } from "@/components/admin/tabs/GalleryTab";

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

/* ─── Clean Image Card with Social Link Support ─── */
function GalleryCard({
  image,
  index,
}: {
  image: GalleryImage;
  index: number;
}) {
  const formattedCaption = image.caption
    ? image.caption
        .replace(/Happy Customercustomers/gi, "Happy Customer")
        .replace(/Customercustomers/gi, "Customer")
    : null;

  const validPostUrl = validateUrl(image.post_url);
  const platformMeta = getPlatformMeta(image.platform, image.post_url);
  const titleText = image.title || formattedCaption || "Gallery Image";

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (validPostUrl) {
      return (
        <a
          href={validPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${platformMeta?.label || "View Post"}: ${titleText}`}
          className="block relative w-full h-full overflow-hidden cursor-pointer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href="/gallery" className="block relative w-full h-full overflow-hidden">
        {children}
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
      className={`relative group w-full h-[240px] sm:h-[280px] rounded-[22px] overflow-hidden bg-slate-950 border border-white/10 ${
        platformMeta ? platformMeta.glow : "hover:border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
      } transition-all duration-500 hover:-translate-y-1`}
    >
      <CardWrapper>
        {/* Main image with smooth zoom */}
        <img
          src={image.image_url}
          alt={titleText}
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

        {/* Social Media Platform Premium Badge */}
        {platformMeta && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1 z-10 ${platformMeta.badgeBg}`}>
            <span>{platformMeta.icon}</span>
            <span>{platformMeta.name}</span>
          </div>
        )}

        {/* Hover Overlay with Platform CTA Text */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 text-center z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-2 shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
            {validPostUrl ? (
              <ExternalLink className="w-5 h-5 text-white" />
            ) : (
              <ArrowRight className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="text-white text-xs font-black uppercase tracking-wider">
            {validPostUrl ? (platformMeta?.label || "View Post") : "View Gallery"}
          </span>
          {image.title && (
            <p className="text-white/80 text-xs font-semibold mt-1 line-clamp-1 max-w-[90%]">
              {image.title}
            </p>
          )}
        </div>

        {/* Glassmorphic Caption Banner */}
        {formattedCaption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 pointer-events-none">
            <div className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-xl">
              <p className="text-white text-xs font-medium leading-snug drop-shadow line-clamp-1">
                {formattedCaption}
              </p>
            </div>
          </div>
        )}
      </CardWrapper>
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
  // Filter visible images & show max 4 preview cards on homepage
  const visibleImages = images.filter((img) => img.visible !== false);
  const preview = visibleImages.slice(0, 4);

  if (preview.length === 0) return null;

  return (
    <section className="relative py-14 bg-black border-y border-white/5 overflow-hidden">
      {/* ── Ambient glows ── */}
      <AnimatedRays />
      
      {/* ── Snow Effect Toggle ── */}
      {uiSettings?.snowEffectEnabled && <SnowEffect />}
      
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-radial-vignette" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={headVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md">
              <Images className="w-3.5 h-3.5 text-blue-400" />
              Store Highlights & Social Media
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Life at Street Mobile
            </h2>
            <p className="text-sm text-white/50 mt-1 max-w-md">
              Explore recent moments from our Vavuniya showroom, repair lab, and customer deliveries.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-extrabold transition-all duration-300 border border-white/20 shrink-0 self-start sm:self-auto group shadow-lg"
          >
            <span>View Complete Gallery</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Gallery Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {preview.map((img, idx) => (
            <GalleryCard key={img.id || idx} image={img} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
