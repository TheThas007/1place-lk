"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category, Brand, Department } from "@/lib/types";
import { DEFAULT_BRANDS } from "@/lib/data";
import { DEFAULT_DEPARTMENTS, getDefaultBrandDepartments, getBrandsFromDb, getDepartmentsFromDb } from "@/lib/firestore-brands";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { uniqueById } from "@/lib/utils";

interface CategoriesSectionProps {
  categories?: Category[];
  brands?: Brand[];
  departments?: Department[];
}

function UnifiedBrandCard({
  brand,
  index,
  activeDepartmentSlug,
}: {
  brand: Brand;
  index: number;
  activeDepartmentSlug: string;
}) {
  const [imgError, setImgError] = useState(false);
  const logoUrl =
    brand.logo_url ||
    (brand as any).logo ||
    (brand as any).image_url ||
    (brand as any).imageUrl ||
    (brand as any).icon_url ||
    (brand as any).iconUrl ||
    (brand as any).image ||
    "";

  useEffect(() => {
    setImgError(false);
  }, [logoUrl, brand.id, brand.slug]);

  const targetLink = `/shop-by-brand/${activeDepartmentSlug}/${brand.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.2), ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={targetLink}
        title={brand.name}
        className="group relative flex items-center justify-center p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl bg-white border border-[#E8E8E8] md:border-neutral-100/90 shadow-2xs md:shadow-[0_3px_14px_rgba(0,0,0,0.04)] hover:shadow-md md:hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:border-neutral-400 md:hover:border-neutral-300 active:scale-95 md:hover:-translate-y-1.5 transition-all duration-300 w-full aspect-square sm:aspect-[4/3] min-h-[50px] sm:min-h-[110px]"
      >
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          {!imgError && logoUrl ? (
            <div className="relative w-[82%] sm:w-[85%] h-9 sm:h-14 md:h-16 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt={brand.logo_alt_text || `${brand.name} logo`}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                className="object-contain transition-transform duration-300 ease-out group-hover:scale-105 sm:group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <span className="text-[11px] sm:text-base md:text-lg font-black text-neutral-900 font-sans tracking-tight select-none uppercase text-center px-1 truncate">
              {brand.name}
            </span>
          )}
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

  // Sync with props or fetch cached
  useEffect(() => {
    if (brands && brands.length > 0) {
      setLiveBrands(
        brands.map((b) => ({
          ...b,
          assigned_departments:
            b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group),
        }))
      );
    } else {
      getBrandsFromDb().then((bList) => {
        if (bList && bList.length > 0) {
          setLiveBrands(bList);
        }
      }).catch(() => {});
    }
  }, [brands]);

  useEffect(() => {
    if (departments && departments.length > 0) {
      setLiveDepts(departments);
    } else {
      getDepartmentsFromDb().then((dList) => {
        if (dList && dList.length > 0) {
          setLiveDepts(dList);
        }
      }).catch(() => {});
    }
  }, [departments]);

  const visibleBrands = useMemo(() => {
    const deduped = uniqueById(liveBrands);
    return deduped
      .filter((b) => b.show_on_homepage !== false && b.status !== "inactive" && b.enabled !== false && (b as any).isDeleted !== true)
      .filter((b) => {
        const assigned =
          b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
        return assigned.includes(activeDeptSlug);
      })
      .sort((a, b) => {
        const orderA =
          a.department_order?.[activeDeptSlug] ??
          (a as any).department_orders?.[activeDeptSlug] ??
          Number(a.sort_order ?? a.order ?? 999);
        const orderB =
          b.department_order?.[activeDeptSlug] ??
          (b as any).department_orders?.[activeDeptSlug] ??
          Number(b.sort_order ?? b.order ?? 999);
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [liveBrands, activeDeptSlug]);

  const displayedBrands = isExpanded ? visibleBrands : visibleBrands.slice(0, 12);

  return (
    <ScrollReveal
      as="section"
      id="shop-by-brand"
      aria-label="Shop by Brand"
      stagger={0.05}
      yOffset={18}
      className="py-6 sm:py-12 md:py-16 bg-[#F8FAFC] border-b border-neutral-200/60 font-sans select-none scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Single Canonical Header across all screen sizes */}
        <div data-reveal-item className="text-left sm:text-center mb-4 sm:mb-8 space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-xs sm:text-base font-medium max-w-xl sm:mx-auto">
            Browse our full lineup of genuine products from top global manufacturers.
          </p>
        </div>

        {/* Department Switcher Tabs: Scrollable on mobile, Centered pill on desktop */}
        <div data-reveal-item className="flex items-center overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:justify-center mb-4 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          <div className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-white/90 border border-neutral-200/80 shadow-xs relative shrink-0">
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
                    className={`relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 z-10 cursor-pointer snap-start shrink-0 ${
                      isActive ? "text-white" : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="brand-dept-tab-active-pill"
                        className="absolute inset-0 bg-black rounded-full shadow-xs -z-10"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{dept.name}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Brand Grid: 3-column mobile, 4-column tablet, 6-column desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeDeptSlug}-${isExpanded ? "expanded" : "collapsed"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-6"
          >
            {displayedBrands.length > 0 ? (
              displayedBrands.map((brand, idx) => (
                <UnifiedBrandCard
                  key={`${activeDeptSlug}-${brand.id || brand.slug}`}
                  brand={brand}
                  index={idx}
                  activeDepartmentSlug={activeDeptSlug}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-neutral-400 text-xs font-semibold">
                No active brands configured for this department.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Single Show More / Show Less Button if > 12 brands */}
        {visibleBrands.length > 12 && (
          <div className="mt-6 sm:mt-10 flex justify-center">
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
              className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-white hover:bg-black text-neutral-900 hover:text-white border border-neutral-300 hover:border-black font-bold text-xs sm:text-sm shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span>
                {isExpanded
                  ? "Show Less Brands"
                  : `Show More Brands (+${visibleBrands.length - 12})`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
