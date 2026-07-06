"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

/* ─── 3D Tilt Card ─── */
function BrandCard3D({ brand, index }: { brand: Brand; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0); y.set(0); setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl cursor-pointer select-none"
      >
        {/* Glass card base */}
        <div className="absolute inset-0 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-white/25 transition-colors duration-300" />

        {/* Dynamic glow on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glowX.get()} ${glowY.get()}, rgba(255,255,255,0.15), transparent 70%)`,
            }}
          />
        )}

        {/* Shimmer top edge */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Logo */}
        <div
          className="relative w-14 h-14 flex items-center justify-center rounded-xl"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="absolute inset-0 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors duration-300" />
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="w-9 h-9 object-contain relative z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (brand.fallback && t.src !== brand.fallback) {
                t.src = brand.fallback;
              } else {
                t.style.display = "none";
                const fb = t.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }
            }}
          />
          <span className="hidden w-9 h-9 rounded-full bg-white/10 text-white font-bold text-xs items-center justify-center">
            {brand.name.slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Name */}
        <span
          className="text-[11px] font-semibold text-white/40 group-hover:text-white/90 transition-colors duration-300 tracking-wide text-center relative z-10"
          style={{ transform: "translateZ(10px)" }}
        >
          {brand.name}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ─── Infinite Marquee Row ─── */
function MarqueeRow({ brands, reverse = false }: { brands: Brand[]; reverse?: boolean }) {
  const doubled = [...brands, ...brands, ...brands];
  return (
    <div className="relative overflow-hidden">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: reverse ? ["0%", "33.33%"] : ["0%", "-33.33%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        className="flex gap-4 w-max"
      >
        {doubled.map((brand, i) => (
          <div
            key={`${brand.slug}-${i}`}
            className="group flex flex-col items-center justify-center gap-2.5 w-[100px] h-[90px] rounded-2xl
                       bg-white/[0.03] border border-white/8 hover:bg-white/[0.07] hover:border-white/20
                       cursor-pointer transition-all duration-300 shrink-0"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-8 h-8 object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 filter group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                if (brand.fallback && t.src !== brand.fallback) t.src = brand.fallback;
                else { t.style.display = "none"; }
              }}
            />
            <span className="text-[10px] font-semibold text-white/35 group-hover:text-white/80 transition-colors duration-300 tracking-wider">
              {brand.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Section Header variants ─── */
const headVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};

/* ─── Main Export ─── */
export default function BrandsSection() {
  return (
    <section className="relative py-24 bg-[#050505] border-y border-white/6 overflow-hidden">
      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white/2 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-white/50 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Brands We Carry
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Shop by{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400">
                Brand
              </span>
            </span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-base">
            Browse our full lineup of genuine products from top global brands.
          </p>
        </motion.div>

        {/* ── Phone Brands — 3D Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[11px] font-black tracking-widest uppercase text-white/30 px-3 flex items-center gap-2">
              <span className="text-base">📱</span> Smartphones
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {phoneBrands.map((brand, i) => (
              <BrandCard3D key={brand.slug} brand={brand} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[11px] font-black tracking-widest uppercase text-white/25 px-3 flex items-center gap-2">
            <span className="text-base">🎧</span> Accessories
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* ── Accessory Brands — Infinite Marquee ── */}
        <div className="space-y-3">
          <MarqueeRow brands={accessoryBrands} />
          <MarqueeRow brands={[...accessoryBrands].reverse()} reverse />
        </div>

        {/* ── Bottom badge ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs text-white/25 font-medium tracking-wider">
            <span className="w-4 h-px bg-white/15" />
            100% Genuine · Warranty Included · Official Distributor
            <span className="w-4 h-px bg-white/15" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
