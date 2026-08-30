"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Category, Brand, Department } from "@/lib/types";
import { DEFAULT_BRANDS } from "@/lib/data";
import { DEFAULT_DEPARTMENTS, getDefaultBrandDepartments } from "@/lib/firestore-brands";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface CategoriesSectionProps {
  categories?: Category[];
  brands?: Brand[];
  departments?: Department[];
}

// Crisp official vector logos for top electronics brands when custom URL is unavailable
const BRAND_VECTOR_LOGOS: Record<string, string> = {
  apple: "https://cdn.simpleicons.org/apple/000000",
  samsung: "https://cdn.simpleicons.org/samsung/000000",
  xiaomi: "https://cdn.simpleicons.org/xiaomi/FF6900",
  redmi: "https://cdn.simpleicons.org/xiaomi/FF6900",
  jbl: "https://cdn.simpleicons.org/jbl/FF3300",
  anker: "https://cdn.simpleicons.org/anker/000000",
  sony: "https://cdn.simpleicons.org/sony/000000",
  marshall: "https://cdn.simpleicons.org/marshall/000000",
  bose: "https://cdn.simpleicons.org/bose/000000",
  google: "https://cdn.simpleicons.org/google",
  "google-pixel": "https://cdn.simpleicons.org/google",
  dji: "https://cdn.simpleicons.org/dji/000000",
  oneplus: "https://cdn.simpleicons.org/oneplus/F5010C",
  asus: "https://cdn.simpleicons.org/asus/000000",
  dell: "https://cdn.simpleicons.org/dell/000000",
  lenovo: "https://cdn.simpleicons.org/lenovo/000000",
  msi: "https://cdn.simpleicons.org/msi/000000",
  fitbit: "https://cdn.simpleicons.org/fitbit/00B0B9",
  oppo: "https://cdn.simpleicons.org/oppo/000000",
  vivo: "https://cdn.simpleicons.org/vivo/000000",
  realme: "https://cdn.simpleicons.org/realme/000000",
  nokia: "https://cdn.simpleicons.org/nokia/000000",
  honor: "https://cdn.simpleicons.org/honor/000000",
  wiwu: "https://icon.horse/icon/wiwu.com",
  ugreen: "https://icon.horse/icon/ugreen.com",
  baseus: "https://icon.horse/icon/baseus.com",
  oraimo: "https://icon.horse/icon/oraimo.com",
  hoco: "https://icon.horse/icon/hocotech.com",
  joyroom: "https://icon.horse/icon/joyroom.com",
  sharge: "https://icon.horse/icon/sharge.com",
  soundcore: "https://icon.horse/icon/soundcore.com",
  lenyes: "https://icon.horse/icon/lenyes.com",
  haylou: "https://icon.horse/icon/haylou.com",
};

function getBrandSubtitle(brand: Brand, deptSlug: string): string {
  if (deptSlug === "phones") return "Smartphones & More";
  if (deptSlug === "laptops-tablets") return "Laptops & Tablets";
  if (deptSlug === "accessories") return "Official Accessories";
  return "Official Store";
}

function BrandCard({
  brand,
  index,
  activeDepartmentSlug,
}: {
  brand: Brand;
  index: number;
  activeDepartmentSlug: string;
}) {
  const [imgError, setImgError] = useState(false);
  const slugKey = (brand.slug || brand.name || "").toLowerCase().trim();
  const rawLogo =
    brand.logo_url ||
    (brand as any).logo ||
    (brand as any).image_url ||
    (brand as any).imageUrl ||
    (brand as any).icon_url ||
    (brand as any).iconUrl ||
    (brand as any).image ||
    BRAND_VECTOR_LOGOS[slugKey] ||
    "";

  useEffect(() => {
    setImgError(false);
  }, [rawLogo, brand.id, brand.slug]);

  // Department-specific SEO-friendly brand route
  const targetLink = `/shop-by-brand/${activeDepartmentSlug}/${brand.slug}`;
  const subtitle = getBrandSubtitle(brand, activeDepartmentSlug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.02, 0.2),
        ease: "easeOut",
      }}
      className="h-full"
    >
      <Link
        href={targetLink}
        title={`Explore ${brand.name}`}
        className="group relative flex flex-col items-center justify-between p-5 sm:p-6 lg:p-7 rounded-[20px] bg-white border border-[#EAEAEA] hover:border-[#C4C4C4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 ease-out w-full h-full min-h-[160px] sm:min-h-[185px] lg:min-h-[200px] select-none cursor-pointer"
      >
        {/* Top Centered Brand Logo */}
        <div className="w-full flex-1 flex items-center justify-center p-2 min-h-[60px] sm:min-h-[70px] lg:min-h-[80px] overflow-hidden">
          {!imgError && rawLogo ? (
            <img
              src={rawLogo}
              alt={brand.logo_alt_text || `${brand.name} logo`}
              loading="lazy"
              decoding="async"
              className="max-h-10 sm:max-h-12 lg:max-h-14 max-w-[82%] sm:max-w-[80%] w-auto h-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-base sm:text-lg lg:text-xl font-bold text-[#111111] tracking-tight">
              {brand.name}
            </span>
          )}
        </div>

        {/* Bottom Details (Brand Name + Tagline + Explore Indicator) */}
        <div className="w-full flex flex-col items-center text-center pt-2 sm:pt-3 border-t border-neutral-100/80">
          <span className="text-[14px] sm:text-[15px] font-semibold text-[#111111] tracking-tight truncate max-w-full group-hover:text-black transition-colors">
            {brand.name}
          </span>
          <span className="text-[11px] sm:text-[12px] text-[#6B6B6B] font-normal truncate max-w-full mt-0.5">
            {subtitle}
          </span>

          {/* Minimal Hover "Explore →" Indicator */}
          <div className="h-4 sm:h-5 mt-1 flex items-center justify-center overflow-hidden">
            <span className="text-[11px] font-semibold text-[#111111] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out">
              <span>Explore</span>
              <ArrowRight className="w-2.5 h-2.5 text-[#111111]" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({
  categories = [],
  brands = [],
  departments = DEFAULT_DEPARTMENTS,
}: CategoriesSectionProps) {
  const [activeDeptSlug, setActiveDeptSlug] = useState<string>("phones");
  const [isExpanded, setIsExpanded] = useState(false);
  const [liveBrands, setLiveBrands] = useState<Brand[]>(() => {
    return (brands && brands.length > 0 ? brands : DEFAULT_BRANDS).map((b) => ({
      ...b,
      assigned_departments:
        b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group),
    }));
  });
  const [liveDepts, setLiveDepts] = useState<Department[]>(
    departments && departments.length > 0 ? departments : DEFAULT_DEPARTMENTS
  );

  // Real-time Firestore sync for Brands and Departments
  useEffect(() => {
    try {
      const qBrands = query(collection(db, "brands"));
      const unsubBrands = onSnapshot(
        qBrands,
        (snapshot) => {
          if (!snapshot.empty) {
            const brandMap = new Map<string, Brand>();
            DEFAULT_BRANDS.forEach((b) => {
              brandMap.set(b.id, {
                ...b,
                assigned_departments: getDefaultBrandDepartments(b.slug, b.product_group),
              });
            });
            snapshot.docs.forEach((d) => {
              const data = d.data() as Brand;
              const id = d.id || data.id || `brand-${(data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              const slug = data.slug || (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
              const nameLower = (data.name || "").toLowerCase().trim();

              // Match by id, data.id, slug, or matching name
              let existingKey = id;
              for (const [k, b] of brandMap.entries()) {
                if (
                  k === id ||
                  b.id === id ||
                  b.id === data.id ||
                  (b.slug && b.slug.toLowerCase() === slug.toLowerCase()) ||
                  (b.name && b.name.toLowerCase().trim() === nameLower)
                ) {
                  existingKey = k;
                  break;
                }
              }

              const existing = brandMap.get(existingKey);
              if (existingKey !== id) {
                brandMap.delete(existingKey);
              }

              const assigned_departments =
                data.assigned_departments && data.assigned_departments.length > 0
                  ? data.assigned_departments
                  : existing?.assigned_departments || getDefaultBrandDepartments(slug, data.product_group);

              const logo_url =
                data.logo_url ||
                (data as any).logo ||
                (data as any).image_url ||
                (data as any).imageUrl ||
                (data as any).icon_url ||
                (data as any).iconUrl ||
                (data as any).image ||
                existing?.logo_url ||
                BRAND_VECTOR_LOGOS[slug] ||
                "";

              const orderNum = Number(data.sort_order ?? data.order ?? existing?.sort_order ?? existing?.order ?? 999);

              brandMap.set(id, {
                ...existing,
                ...data,
                id,
                slug,
                logo_url,
                order: orderNum,
                sort_order: orderNum,
                assigned_departments,
                enabled: data.enabled !== false && data.status !== "inactive",
                show_on_homepage: data.show_on_homepage !== false,
              });
            });
            setLiveBrands(Array.from(brandMap.values()));
          }
        },
        (err) => console.warn("Firestore brands snapshot warning:", err)
      );

      const qDepts = query(collection(db, "departments"));
      const unsubDepts = onSnapshot(
        qDepts,
        (snapshot) => {
          if (!snapshot.empty) {
            const deptMap = new Map<string, Department>();
            DEFAULT_DEPARTMENTS.forEach((d) => deptMap.set(d.slug, d));
            snapshot.docs.forEach((d) => {
              const data = d.data() as Department;
              const slug = data.slug || d.id;
              deptMap.set(slug, { ...data, id: d.id, slug });
            });
            setLiveDepts(
              Array.from(deptMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
            );
          }
        },
        (err) => console.warn("Firestore departments snapshot warning:", err)
      );

      return () => {
        unsubBrands();
        unsubDepts();
      };
    } catch (e) {
      console.warn("Failed to subscribe to brands/departments:", e);
    }
  }, []);

  const visibleBrands = useMemo(() => {
    return liveBrands
      .filter(
        (b) =>
          b.show_on_homepage !== false &&
          b.status !== "inactive" &&
          b.enabled !== false &&
          (b as any).isDeleted !== true
      )
      .filter((b) => {
        const assigned =
          b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
        return assigned.includes(activeDeptSlug);
      })
      .sort((a, b) => Number(a.sort_order ?? a.order ?? 999) - Number(b.sort_order ?? b.order ?? 999));
  }, [liveBrands, activeDeptSlug]);

  const displayBrands = isExpanded ? visibleBrands : visibleBrands.slice(0, 12);

  return (
    <ScrollReveal
      as="section"
      id="shop-by-brand"
      stagger={0.04}
      yOffset={16}
      className="py-12 sm:py-16 lg:py-20 bg-[#FFFFFF] border-b border-[#E8E8E8] select-none font-sans"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── 1. Top Section Header ── */}
        <div data-reveal-item className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.16em] text-[#6B6B6B] uppercase block">
              EXPLORE BRANDS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#111111] tracking-tight leading-tight">
              Shop by Brand
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#6B6B6B] font-normal leading-relaxed max-w-xl">
              Discover products from trusted technology brands.
            </p>
          </div>

          {/* Minimal "View All Brands" Link */}
          <div className="flex items-center gap-4 self-start sm:self-end">
            <Link
              href="/products"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#111111] hover:text-[#ED0712] transition-colors py-1 cursor-pointer"
            >
              <span>View All Brands</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── 2. Department Category Navigation (Minimal Soft Pill Selector) ── */}
        <div data-reveal-item className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {liveDepts
            .filter((d) => d.enabled !== false)
            .map((dept) => {
              const isActive = activeDeptSlug === dept.slug;

              return (
                <button
                  key={dept.slug}
                  type="button"
                  onClick={() => {
                    setActiveDeptSlug(dept.slug);
                    setIsExpanded(false);
                  }}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 shrink-0 cursor-pointer border ${
                    isActive
                      ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                      : "bg-[#F8F8F8] text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-100/80 border-[#E8E8E8]"
                  }`}
                >
                  <span>{dept.name}</span>
                </button>
              );
            })}
        </div>

        {/* ── 3. Brand Cards Responsive Showcase Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeDeptSlug}-${isExpanded ? "expanded" : "collapsed"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5"
          >
            {displayBrands.length > 0 ? (
              displayBrands.map((brand, idx) => (
                <BrandCard
                  key={`${activeDeptSlug}-${brand.id || brand.slug}`}
                  brand={brand}
                  index={idx}
                  activeDepartmentSlug={activeDeptSlug}
                />
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 text-center text-[#6B6B6B] text-xs sm:text-sm font-medium bg-[#F8F8F8] rounded-[20px] border border-[#E8E8E8]">
                No brands currently available in this department.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── 4. Show More / Show Less Button (When > 12 brands exist) ── */}
        {visibleBrands.length > 12 && (
          <div data-reveal-item className="mt-8 sm:mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (isExpanded) {
                  setIsExpanded(false);
                  const el = document.getElementById("shop-by-brand");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                } else {
                  setIsExpanded(true);
                }
              }}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#E8E8E8] hover:border-[#111111] font-semibold text-xs sm:text-[13px] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>
                {isExpanded
                  ? "Show Less"
                  : `Show All ${visibleBrands.length} Brands`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
