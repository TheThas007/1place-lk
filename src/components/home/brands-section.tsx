"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

/* ─── Brand Data ─── */
const phoneBrands = [
  { name: "Google",  logo: "https://cdn.simpleicons.org/google/EA4335",      slug: "google"  },
  { name: "Honor",   logo: "https://www.honor.com/content/dam/honor/cn/logo/honor-logo.png", fallback: "https://img.logo.dev/honor.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png", slug: "honor" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/F5010C",     slug: "oneplus" },
];

const accessoryBrands = [
  { name: "Anker",      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Anker_logo.svg/320px-Anker_logo.svg.png", slug: "anker"      },
  { name: "Soundcore",  logo: "https://img.logo.dev/soundcore.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",           slug: "soundcore"  },
  { name: "Ugreen",     logo: "https://img.logo.dev/ugreen.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",              slug: "ugreen"     },
  { name: "Baseus",     logo: "https://img.logo.dev/baseus.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",              slug: "baseus"     },
  { name: "DJI",        logo: "https://cdn.simpleicons.org/dji/000000",                                                            slug: "dji"        },
  { name: "CMF",        logo: "https://img.logo.dev/cmf.tech?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",                slug: "cmf"        },
  { name: "Wiwu",       logo: "https://img.logo.dev/wiwu.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",                slug: "wiwu"       },
  { name: "JBL",        logo: "https://cdn.simpleicons.org/jbl/000000",                                                            slug: "jbl"        },
  { name: "Green Lion", logo: "https://img.logo.dev/greenlion.net?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",           slug: "green-lion" },
  { name: "Hollyland",  logo: "https://img.logo.dev/hollyland-tech.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",      slug: "hollyland"  },
  { name: "Lenyes",     logo: "https://img.logo.dev/lenyes.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",              slug: "lenyes"     },
  { name: "Brodu",      logo: "https://img.logo.dev/brodu.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",               slug: "brodu"      },
];

type Brand = { name: string; logo: string; fallback?: string; slug: string };

/* ─── Circular Brand Item ─── */
function CircularBrand({ brand, index = 0, size = "large" }: { brand: Brand; index?: number, size?: "large" | "small" }) {
  const isLarge = size === "large";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 group cursor-pointer select-none shrink-0"
    >
      <div 
        className={`rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-gray-300 ${isLarge ? 'w-24 h-24' : 'w-20 h-20'}`}
      >
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className={`object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 filter group-hover:drop-shadow-sm ${isLarge ? 'w-12 h-12' : 'w-10 h-10'}`}
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (brand.fallback && t.src !== brand.fallback) {
              t.src = brand.fallback;
            } else {
              t.style.display = "none";
            }
          }}
        />
      </div>
      <span className={`${isLarge ? 'text-sm' : 'text-xs'} font-medium text-gray-600 group-hover:text-black transition-colors text-center w-full`}>
        {brand.name}
      </span>
    </motion.div>
  );
}

/* ─── Infinite Marquee Row ─── */
function MarqueeRow({ brands, reverse = false }: { brands: Brand[]; reverse?: boolean }) {
  const doubled = [...brands, ...brands, ...brands];
  return (
    <div className="relative overflow-hidden py-4">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: reverse ? ["0%", "33.33%"] : ["0%", "-33.33%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        className="flex gap-8 w-max"
      >
        {doubled.map((brand, i) => (
          <div key={`${brand.slug}-${i}`} className="w-[100px] flex justify-center">
            <CircularBrand brand={brand} size="small" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Section Header variants ─── */
const headVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Main Export ─── */
export default function BrandsSection() {
  return (
    <section className="relative py-24 bg-white border-y border-black/5 overflow-hidden">
      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-black/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-black/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-black/2 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {/* ── Section Header ── */}
        <motion.div
          variants={headVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 text-xs font-bold tracking-widest uppercase text-black/50 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Brands We Carry
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight mb-4 leading-tight">
            Shop by{" "}
            <span className="relative">
              <span className="text-black">
                Brand
              </span>
            </span>
          </h2>
          <p className="text-black/50 max-w-lg mx-auto text-base">
            Browse our full lineup of genuine products from top global brands.
          </p>
        </motion.div>

        {/* ── Phone Brands ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <span className="text-[11px] font-black tracking-widest uppercase text-black/40 px-3 flex items-center gap-2">
              <span className="text-base">📱</span> Smartphones
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {phoneBrands.map((brand, i) => (
              <CircularBrand key={brand.slug} brand={brand} index={i} size="large" />
            ))}
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div className="my-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          <span className="text-[11px] font-black tracking-widest uppercase text-black/40 px-3 flex items-center gap-2">
            <span className="text-base">🎧</span> Accessories
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        {/* ── Accessory Brands — Infinite Marquee ── */}
        <div className="space-y-6">
          <MarqueeRow brands={accessoryBrands} />
          <MarqueeRow brands={[...accessoryBrands].reverse()} reverse />
        </div>

        {/* ── Bottom badge ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs text-black/40 font-medium tracking-wider">
            <span className="w-4 h-px bg-black/15" />
            100% Genuine · Warranty Included · Official Distributor
            <span className="w-4 h-px bg-black/15" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
