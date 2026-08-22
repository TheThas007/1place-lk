"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const logoUrl = brand.logo_url || (brand as any).logo || (brand as any).image_url;

  // Department-specific SEO-friendly brand route
  const targetLink = `/shop-by-brand/${activeDepartmentSlug}/${brand.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25), ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={targetLink}
        title={`${brand.name}`}
        className="group relative flex items-center justify-center p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white border border-neutral-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:border-neutral-300 hover:-translate-y-1.5 transition-all duration-300 w-full aspect-[4/3] min-h-[110px] sm:min-h-[140px] md:min-h-[155px]"
      >
        {/* Centered Genuine Brand Logo */}
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          {!imgError && logoUrl ? (
            <img
              src={logoUrl}
              alt={brand.logo_alt_text || `${brand.name} logo`}
              loading="lazy"
              className="max-h-14 sm:max-h-18 md:max-h-20 max-w-[86%] sm:max-w-[85%] w-auto h-auto object-contain transition-transform duration-300 ease-out group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-lg sm:text-2xl font-black text-black font-mono tracking-tight select-none">
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
              const id = d.id || data.id;
              const slug = data.slug || (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
              const assigned_departments =
                data.assigned_departments && data.assigned_departments.length > 0
                  ? data.assigned_departments
                  : getDefaultBrandDepartments(slug, data.product_group);

              const existing = brandMap.get(id) || brandMap.get(data.id);
              brandMap.set(id, { ...existing, ...data, id, slug, assigned_departments });
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
      .filter((b) => b.show_on_homepage !== false && b.status !== "inactive" && b.enabled !== false)
      .filter((b) => {
        const assigned =
          b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
        return assigned.includes(activeDeptSlug);
      })
      .sort((a, b) => (a.sort_order || a.order || 0) - (b.sort_order || b.order || 0));
  }, [liveBrands, activeDeptSlug]);

  return (
    <>
      {/* ── Mobile Layout (< 768px): Exact Reference Matching ── */}
      <div className="md:hidden w-full bg-white px-4 py-4 border-b border-neutral-100/90 select-none">
        {/* Mobile Header: Title & View All */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Shop by Brand
          </h2>
          <Link
            href="/products"
            className="text-xs font-bold text-[#ED0712] hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Mobile Horizontal Brand Cards Rail */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
          {liveBrands
            .filter((b) => b.show_on_homepage !== false && b.status !== "inactive" && b.enabled !== false)
            .map((brand) => {
              const targetLink = `/shop-by-brand/${activeDeptSlug}/${brand.slug}`;
              const logoUrl = brand.logo_url || (brand as any).logo || (brand as any).image_url;

              return (
                <Link
                  key={`mob-brand-${brand.id || brand.slug}`}
                  href={targetLink}
                  className="min-w-[125px] shrink-0 bg-white border border-neutral-200/90 rounded-xl px-3.5 py-2.5 h-12 flex items-center justify-center gap-2 shadow-2xs hover:border-black active:scale-95 transition-all"
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-7 max-w-[85px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs font-black text-black tracking-tight">
                      {brand.name}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="categories-section"
          stagger={0.05}
          yOffset={20}
          className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-neutral-200/60 font-sans"
        >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header Title & Subtitle */}
        <div data-reveal-item className="text-center mb-8 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Browse our full lineup of genuine products from top global manufacturers.
          </p>
        </div>

        {/* Department Switcher Tabs */}
        <div data-reveal-item className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/90 border border-neutral-200/80 shadow-xs relative">
            {liveDepts
              .filter((d) => d.enabled !== false)
              .map((dept) => {
                const isActive = activeDeptSlug === dept.slug;
                const icon =
                  dept.slug === "phones"
                    ? "📱"
                    : dept.slug === "laptops-tablets"
                    ? "💻"
                    : "🎧";

                return (
                  <button
                    key={dept.slug}
                    type="button"
                    onClick={() => setActiveDeptSlug(dept.slug)}
                    className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 z-10 cursor-pointer ${
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
                    <span className="relative z-10 flex items-center gap-2">
                      <span>{icon}</span>
                      <span>{dept.name}</span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Brand Grid - 6 columns matching Apple-style badges */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDeptSlug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6"
          >
            {visibleBrands.length > 0 ? (
              visibleBrands.map((brand, idx) => (
                <BrandCard
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
      </div>
    </ScrollReveal>
    </div>
  </>
  );
}
