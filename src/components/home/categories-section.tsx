"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
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

function MobileBrandCard({
  brand,
  activeDepartmentSlug,
}: {
  brand: Brand;
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
    <Link
      href={targetLink}
      title={brand.name}
      className="group relative flex items-center justify-center p-2 sm:p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs hover:border-neutral-400 active:scale-95 transition-all w-full aspect-square min-h-[44px]"
    >
      <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
        {!imgError && logoUrl ? (
          <img
            src={logoUrl}
            alt={brand.logo_alt_text || `${brand.name} logo`}
            loading="lazy"
            className="max-h-[60%] max-w-[78%] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[11px] sm:text-xs font-black text-black tracking-tight text-center truncate px-1 select-none">
            {brand.name}
          </span>
        )}
      </div>
    </Link>
  );
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
        {/* Centered Genuine Brand Logo or High-Contrast Brand Name */}
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
            <span className="text-base sm:text-xl font-black text-neutral-900 font-sans tracking-tight select-none uppercase text-center px-1">
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
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
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
            const brandsList: Brand[] = [];
            snapshot.docs.forEach((d) => {
              const data = d.data() as Brand;
              if (data.isDeleted === true || (data as any).status === "deleted") {
                return;
              }
              const id = d.id || data.id || `brand-${(data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              const slug = data.slug || (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
              
              // Find matching default brand to get preset logo if current logo is empty
              const defaultBrand = DEFAULT_BRANDS.find(
                (b) => b.id === id || b.slug.toLowerCase() === slug.toLowerCase() || b.name.toLowerCase().trim() === (data.name || "").toLowerCase().trim()
              );

              const assigned_departments =
                data.assigned_departments && data.assigned_departments.length > 0
                  ? data.assigned_departments
                  : getDefaultBrandDepartments(slug, data.product_group);

              const rawLogo =
                data.logo_url ||
                (data as any).logo ||
                (data as any).image_url ||
                (data as any).imageUrl ||
                (data as any).icon_url ||
                (data as any).iconUrl ||
                (data as any).image ||
                defaultBrand?.logo_url ||
                "";

              const orderNum = Number(data.sort_order ?? data.order ?? defaultBrand?.sort_order ?? 999);

              brandsList.push({
                ...defaultBrand,
                ...data,
                id,
                slug,
                logo_url: rawLogo,
                order: orderNum,
                sort_order: orderNum,
                assigned_departments,
                enabled: data.enabled !== false && data.status !== "inactive",
                show_on_homepage: data.show_on_homepage !== false,
              });
            });
            setLiveBrands(brandsList);
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
        return orderA - orderB;
      });
  }, [liveBrands, activeDeptSlug]);

  const mobileVisibleBrands = isMobileExpanded ? visibleBrands : visibleBrands.slice(0, 6);
  const desktopVisibleBrands = isDesktopExpanded ? visibleBrands : visibleBrands.slice(0, 12);

  return (
    <>
      {/* ── Mobile Layout (< 768px): Approved 3-Column Grid with Category Selector & Show More ── */}
      <div id="mobile-shop-by-brand" className="md:hidden w-full bg-white px-4 py-4 select-none">
        {/* 1. Mobile Header: Left-Aligned Title & Subtitle */}
        <div className="mb-3">
          <h2 className="text-[20px] font-black text-neutral-900 tracking-tight leading-tight">
            Shop by Brand
          </h2>
          <p className="text-neutral-500 text-xs mt-0.5 font-medium leading-relaxed">
            Browse our full lineup of genuine products from top global manufacturers.
          </p>
        </div>

        {/* 2. Category Selector: Horizontally Scrollable Pills */}
        <div
          role="tablist"
          aria-label="Brand categories"
          className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 mb-3.5 -mx-4 px-4 whitespace-nowrap snap-x"
        >
          {liveDepts
            .filter((d) => d.enabled !== false)
            .map((dept) => {
              const isActive = activeDeptSlug === dept.slug;

              return (
                <button
                  key={`mob-tab-${dept.slug}`}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setActiveDeptSlug(dept.slug);
                    setIsMobileExpanded(false);
                    setIsDesktopExpanded(false);
                  }}
                  className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer snap-start ${
                    isActive
                      ? "bg-black text-white shadow-xs"
                      : "bg-[#F1F3F5] text-neutral-700 hover:text-black border border-neutral-200/60"
                  }`}
                >
                  <span>{dept.name}</span>
                </button>
              );
            })}
        </div>

        {/* 3. Mobile Brand Grid (3 Columns, Equal Squares, 6 Logos by Default) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {visibleBrands.length > 0 ? (
            mobileVisibleBrands.map((brand) => (
              <MobileBrandCard
                key={`mob-brand-${activeDeptSlug}-${brand.id || brand.slug}`}
                brand={brand}
                activeDepartmentSlug={activeDeptSlug}
              />
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-neutral-400 text-xs font-medium bg-[#FAFAFA] rounded-xl border border-neutral-100">
              No brands available in this category.
            </div>
          )}
        </div>

        {/* 4. Show More / Show Less Button (If more than 6 active brands exist) */}
        {visibleBrands.length > 6 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                if (isMobileExpanded) {
                  setIsMobileExpanded(false);
                  const el = document.getElementById("mobile-shop-by-brand");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                } else {
                  setIsMobileExpanded(true);
                }
              }}
              className="w-full h-[40px] rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] border border-neutral-200/80 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
            >
              <span>
                {isMobileExpanded
                  ? "Show Less"
                  : `Show More Brands (+${visibleBrands.length - 6})`}
              </span>
              {isMobileExpanded ? (
                <ChevronUp className="w-4 h-4 text-neutral-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          </div>
        )}
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

                return (
                  <button
                    key={dept.slug}
                    type="button"
                    onClick={() => {
                      setActiveDeptSlug(dept.slug);
                      setIsDesktopExpanded(false);
                      setIsMobileExpanded(false);
                    }}
                    className={`relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 z-10 cursor-pointer ${
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
                    <span className="relative z-10">
                      {dept.name}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Brand Grid - 6 columns matching Apple-style badges (Shows 12 brands initially) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeDeptSlug}-${isDesktopExpanded ? "expanded" : "collapsed"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6"
          >
            {desktopVisibleBrands.length > 0 ? (
              desktopVisibleBrands.map((brand, idx) => (
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

        {/* Desktop Show More / Show Less Button (If more than 12 active brands exist) */}
        {visibleBrands.length > 12 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (isDesktopExpanded) {
                  setIsDesktopExpanded(false);
                  const el = document.getElementById("categories-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                } else {
                  setIsDesktopExpanded(true);
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-black text-neutral-900 hover:text-white border border-neutral-300 hover:border-black font-bold text-xs sm:text-sm shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span>
                {isDesktopExpanded
                  ? "Show Less Brands"
                  : `Show More Brands (+${visibleBrands.length - 12})`}
              </span>
              {isDesktopExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </ScrollReveal>
    </div>
  </>
  );
}
