"use client";

import { motion } from "framer-motion";

// ── Phone Brands ──────────────────────────────────────────────
const phoneBrands = [
  {
    name: "Google",
    logo: "https://cdn.simpleicons.org/google/EA4335",
    slug: "google",
  },
  {
    name: "Honor",
    logo: "https://www.honor.com/content/dam/honor/cn/logo/honor-logo.png",
    fallback: "https://img.logo.dev/honor.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "honor",
  },
  {
    name: "OnePlus",
    logo: "https://cdn.simpleicons.org/oneplus/F5010C",
    slug: "oneplus",
  },
];

// ── Accessory Brands ──────────────────────────────────────────
const accessoryBrands = [
  {
    name: "Anker",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Anker_logo.svg/320px-Anker_logo.svg.png",
    slug: "anker",
  },
  {
    name: "Soundcore",
    logo: "https://img.logo.dev/soundcore.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "soundcore",
  },
  {
    name: "Ugreen",
    logo: "https://img.logo.dev/ugreen.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "ugreen",
  },
  {
    name: "Baseus",
    logo: "https://img.logo.dev/baseus.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "baseus",
  },
  {
    name: "DJI",
    logo: "https://cdn.simpleicons.org/dji/000000",
    slug: "dji",
  },
  {
    name: "CMF",
    logo: "https://img.logo.dev/cmf.tech?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "cmf",
  },
  {
    name: "Wiwu",
    logo: "https://img.logo.dev/wiwu.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "wiwu",
  },
  {
    name: "Lenyes",
    logo: "https://img.logo.dev/lenyes.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "lenyes",
  },
  {
    name: "Hollyland",
    logo: "https://img.logo.dev/hollyland-tech.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "hollyland",
  },
  {
    name: "Green Lion",
    logo: "https://img.logo.dev/greenlion.net?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "green-lion",
  },
  {
    name: "Brodu",
    logo: "https://img.logo.dev/brodu.com?token=pk_TCk4UPiYQFWiTd9aV9TNHA&size=128&format=png",
    slug: "brodu",
  },
  {
    name: "JBL",
    logo: "https://cdn.simpleicons.org/jbl/000000",
    slug: "jbl",
  },
];

type Brand = {
  name: string;
  logo: string;
  fallback?: string;
  slug: string;
};

// ── Reusable Brand Logo Card ──────────────────────────────────
function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.05 }}
      className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl
                 bg-background border border-border/60
                 hover:border-foreground/25 hover:shadow-xl hover:shadow-foreground/5
                 transition-all duration-300 cursor-pointer select-none"
    >
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (brand.fallback && target.src !== brand.fallback) {
              target.src = brand.fallback;
            } else {
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }
          }}
        />
        <span
          className="w-10 h-10 rounded-full bg-foreground/10 text-foreground font-bold text-sm items-center justify-center hidden z-10 relative"
          aria-hidden="true"
        >
          {brand.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300 tracking-wide text-center leading-tight">
        {brand.name}
      </span>
    </motion.div>
  );
}

// ── Main Section ──────────────────────────────────────────────
export default function BrandsSection() {
  return (
    <section className="py-20 bg-card/30 border-y border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
            Brands We Carry
          </span>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm lg:text-base">
            We stock 100% genuine products from globally trusted brands — from flagship phones to premium accessories.
          </p>
        </motion.div>

        {/* ── Phone Brands ── */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground whitespace-nowrap px-3">
              📱 Smartphones
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {phoneBrands.map((brand, i) => (
              <BrandCard key={brand.slug} brand={brand} index={i} />
            ))}
          </div>
        </div>

        {/* ── Accessory Brands ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground whitespace-nowrap px-3">
              🎧 Accessories
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </motion.div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {accessoryBrands.map((brand, i) => (
              <BrandCard key={brand.slug} brand={brand} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
