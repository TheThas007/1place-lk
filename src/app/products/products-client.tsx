"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  Package,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { Product, Category, Brand } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import ShopSearchBar from "@/components/products/ShopSearchBar";
import ShopCategoryChips, { QUICK_CATEGORIES } from "@/components/products/ShopCategoryChips";
import ShopResultsToolbar, {
  SortOptionValue,
  ActiveFilterChip,
} from "@/components/products/ShopResultsToolbar";
import ShopFilterSidebar, {
  detectProductBrand,
  detectProductCondition,
  detectProductStorage,
} from "@/components/products/ShopFilterSidebar";

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

/* ─────────────────────────────────────────────────────────────
   EFFECTIVE SELLING PRICE HELPER
───────────────────────────────────────────────────────────── */
function getEffectivePrice(p: Product): number {
  if (p.sale_price && p.sale_price > 0 && p.sale_price < p.price) {
    return p.sale_price;
  }
  return p.price || 0;
}

function fmtLKR(val: number) {
  return "LKR " + val.toLocaleString("en-LK");
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function ProductsClient({
  initialProducts,
  categories,
  brands = [],
}: {
  initialProducts: Product[];
  categories: Category[];
  brands?: Brand[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── 1. Search Query State ── */
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  /* ── 2. Category State ── */
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>(
    () => searchParams.get("cat_chip") || "all"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const p = searchParams.get("category");
    return p ? p.split(",").filter(Boolean) : [];
  });

  /* ── 3. Brand State ── */
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const p = searchParams.get("brand");
    return p ? p.split(",").filter(Boolean) : [];
  });

  /* ── 4. Price State ── */
  const { catalogMin, catalogMax } = useMemo(() => {
    const prices = initialProducts.map((p) => getEffectivePrice(p)).filter(Boolean);
    return {
      catalogMin: prices.length ? Math.min(...prices) : 0,
      catalogMax: prices.length ? Math.max(...prices) : 500000,
    };
  }, [initialProducts]);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [quickPriceMax, setQuickPriceMax] = useState<number | null>(() => {
    const qp = searchParams.get("quickPrice");
    return qp ? parseInt(qp) : null;
  });
  const [pendingMin, setPendingMin] = useState(searchParams.get("minPrice") || "");
  const [pendingMax, setPendingMax] = useState(searchParams.get("maxPrice") || "");
  const [priceError, setPriceError] = useState("");
  const [sliderLow, setSliderLow] = useState(
    () => parseInt(searchParams.get("minPrice") || "0") || catalogMin
  );
  const [sliderHigh, setSliderHigh] = useState(
    () => parseInt(searchParams.get("maxPrice") || "0") || catalogMax
  );

  /* ── 5. Availability State ── */
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("stock") === "in_stock");
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(() => {
    const p = searchParams.get("avail");
    return p ? p.split(",").filter(Boolean) : [];
  });

  /* ── 6. Condition, Storage, Warranty State ── */
  const [selectedConditions, setSelectedConditions] = useState<string[]>(() => {
    const p = searchParams.get("condition");
    return p ? p.split(",").filter(Boolean) : [];
  });
  const [selectedStorage, setSelectedStorage] = useState<string[]>(() => {
    const p = searchParams.get("storage");
    return p ? p.split(",").filter(Boolean) : [];
  });
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>(() => {
    const p = searchParams.get("warranty");
    return p ? p.split(",").filter(Boolean) : [];
  });

  /* ── 7. Quick Deals & Sorting State ── */
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(searchParams.get("new") === "true");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get("sale") === "true");
  const [sortKey, setSortKey] = useState<SortOptionValue>(
    () => (searchParams.get("sort") as SortOptionValue) || "price-desc"
  );

  /* ── 8. Mobile Drawer State ── */
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ─────────────────────────────────────────────────────────────
     URL PARAMS SYNC HELPER
  ───────────────────────────────────────────────────────────── */
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "" || val === undefined) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  /* ── ESC closes mobile drawer ── */
  useEffect(() => {
    if (!showMobileFilters) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMobileFilters(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showMobileFilters]);

  /* ── Synchronize state when browser back/forward is used ── */
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedQuickCategory(searchParams.get("cat_chip") || "all");

    const catParam = searchParams.get("category");
    setSelectedCategories(catParam ? catParam.split(",").filter(Boolean) : []);

    const brandParam = searchParams.get("brand");
    setSelectedBrands(brandParam ? brandParam.split(",").filter(Boolean) : []);

    const pMin = searchParams.get("minPrice") || "";
    const pMax = searchParams.get("maxPrice") || "";
    setMinPrice(pMin);
    setPendingMin(pMin);
    setMaxPrice(pMax);
    setPendingMax(pMax);
    if (pMin) setSliderLow(parseInt(pMin));
    if (pMax) setSliderHigh(parseInt(pMax));

    const qp = searchParams.get("quickPrice");
    setQuickPriceMax(qp ? parseInt(qp) : null);

    setInStockOnly(searchParams.get("stock") === "in_stock");
    const availParam = searchParams.get("avail");
    setSelectedAvailability(availParam ? availParam.split(",").filter(Boolean) : []);

    const condParam = searchParams.get("condition");
    setSelectedConditions(condParam ? condParam.split(",").filter(Boolean) : []);

    const storParam = searchParams.get("storage");
    setSelectedStorage(storParam ? storParam.split(",").filter(Boolean) : []);

    const warrParam = searchParams.get("warranty");
    setSelectedWarranties(warrParam ? warrParam.split(",").filter(Boolean) : []);

    setNewArrivalsOnly(searchParams.get("new") === "true");
    setFeaturedOnly(searchParams.get("featured") === "true");
    setOnSaleOnly(searchParams.get("sale") === "true");
    setSortKey((searchParams.get("sort") as SortOptionValue) || "price-desc");
  }, [searchParams]);

  /* ─────────────────────────────────────────────────────────────
     EVENT HANDLERS
  ───────────────────────────────────────────────────────────── */
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
  };

  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    updateUrlParams({ search: q || null });
  };

  const handleQuickCategorySelect = (chipId: string) => {
    setSelectedQuickCategory(chipId);
    if (chipId === "all") {
      updateUrlParams({ cat_chip: null });
    } else {
      updateUrlParams({ cat_chip: chipId });
    }
  };

  const handleToggleCategory = (catIdOrSlug: string) => {
    const next = selectedCategories.some(
      (c) => c.toLowerCase() === catIdOrSlug.toLowerCase()
    )
      ? selectedCategories.filter((c) => c.toLowerCase() !== catIdOrSlug.toLowerCase())
      : [...selectedCategories, catIdOrSlug];

    setSelectedCategories(next);
    updateUrlParams({ category: next.length ? next.join(",") : null });
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
    updateUrlParams({ category: null });
  };

  const handleToggleBrand = (brandName: string) => {
    const next = selectedBrands.some((b) => b.toLowerCase() === brandName.toLowerCase())
      ? selectedBrands.filter((b) => b.toLowerCase() !== brandName.toLowerCase())
      : [...selectedBrands, brandName];

    setSelectedBrands(next);
    updateUrlParams({ brand: next.length ? next.join(",") : null });
  };

  const handleClearBrands = () => {
    setSelectedBrands([]);
    updateUrlParams({ brand: null });
  };

  const handleSliderChange = (low: number, high: number) => {
    setSliderLow(low);
    setSliderHigh(high);
    setPendingMin(String(low));
    setPendingMax(String(high));
  };

  const handleApplyPrice = () => {
    const mn = pendingMin ? parseInt(pendingMin) : 0;
    const mx = pendingMax ? parseInt(pendingMax) : Infinity;
    if (pendingMin && pendingMax && mn > mx) {
      setPriceError("Min price cannot be greater than max price.");
      return;
    }
    setPriceError("");
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    updateUrlParams({
      minPrice: pendingMin || null,
      maxPrice: pendingMax || null,
    });
  };

  const handleToggleQuickPrice = (val: number | null) => {
    setQuickPriceMax(val);
    updateUrlParams({ quickPrice: val ? String(val) : null });
  };

  const handleToggleAvailability = (val: string) => {
    const next = selectedAvailability.includes(val)
      ? selectedAvailability.filter((x) => x !== val)
      : [...selectedAvailability, val];
    setSelectedAvailability(next);
    updateUrlParams({ avail: next.length ? next.join(",") : null });
  };

  const handleToggleCondition = (val: string) => {
    const next = selectedConditions.some((c) => c.toLowerCase() === val.toLowerCase())
      ? selectedConditions.filter((c) => c.toLowerCase() !== val.toLowerCase())
      : [...selectedConditions, val];
    setSelectedConditions(next);
    updateUrlParams({ condition: next.length ? next.join(",") : null });
  };

  const handleToggleStorage = (val: string) => {
    const next = selectedStorage.some((s) => s.toLowerCase() === val.toLowerCase())
      ? selectedStorage.filter((s) => s.toLowerCase() !== val.toLowerCase())
      : [...selectedStorage, val];
    setSelectedStorage(next);
    updateUrlParams({ storage: next.length ? next.join(",") : null });
  };

  const handleToggleWarranty = (val: string) => {
    const next = selectedWarranties.some((w) => w.toLowerCase() === val.toLowerCase())
      ? selectedWarranties.filter((w) => w.toLowerCase() !== val.toLowerCase())
      : [...selectedWarranties, val];
    setSelectedWarranties(next);
    updateUrlParams({ warranty: next.length ? next.join(",") : null });
  };

  const handleToggleInStock = () => {
    const next = !inStockOnly;
    setInStockOnly(next);
    updateUrlParams({ stock: next ? "in_stock" : null });
  };

  const handleToggleOnSale = () => {
    const next = !onSaleOnly;
    setOnSaleOnly(next);
    updateUrlParams({ sale: next ? "true" : null });
  };

  const handleToggleNewArrivals = () => {
    const next = !newArrivalsOnly;
    setNewArrivalsOnly(next);
    updateUrlParams({ new: next ? "true" : null });
  };

  const handleSortChange = (key: SortOptionValue) => {
    setSortKey(key);
    updateUrlParams({ sort: key !== "featured" ? key : null });
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedQuickCategory("all");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setPendingMin("");
    setPendingMax("");
    setSliderLow(catalogMin);
    setSliderHigh(catalogMax);
    setPriceError("");
    setQuickPriceMax(null);
    setInStockOnly(false);
    setSelectedAvailability([]);
    setSelectedConditions([]);
    setSelectedStorage([]);
    setSelectedWarranties([]);
    setNewArrivalsOnly(false);
    setFeaturedOnly(false);
    setOnSaleOnly(false);
    setSortKey("price-desc");
    router.replace(pathname, { scroll: false });
  };

  /* ─────────────────────────────────────────────────────────────
     PRODUCT FILTERING & SORTING LOGIC
  ───────────────────────────────────────────────────────────── */
  const filteredProducts = useMemo(() => {
    let list = initialProducts.filter((product) => {
      // 1. Search Query (Typo-tolerant multi-token)
      if (searchQuery && searchQuery.trim().length > 0) {
        const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const name = (product.name || "").toLowerCase();
        const brand = detectProductBrand(product).toLowerCase();
        const cat = (product.category_name || product.categoryName || "").toLowerCase();
        const code = (product.code || "").toLowerCase();
        const tags = (product.tags || []).join(" ").toLowerCase();
        const specs = Object.values(product.specifications || {}).join(" ").toLowerCase();
        const desc = (product.description || "").toLowerCase();
        const blob = `${name} ${brand} ${cat} ${code} ${tags} ${specs} ${desc}`;

        const matchesAllTokens = tokens.every((tok) => blob.includes(tok));
        if (!matchesAllTokens) return false;
      }

      // 2. Quick Category Chips
      if (selectedQuickCategory && selectedQuickCategory !== "all") {
        const quickDef = QUICK_CATEGORIES.find((c) => c.id === selectedQuickCategory);
        if (quickDef && quickDef.matchKeys.length > 0) {
          const pCat = (product.category_name || product.categoryName || product.category_slug || "").toLowerCase();
          const pName = (product.name || "").toLowerCase();
          const pTags = (product.tags || []).join(" ").toLowerCase();
          const matchesQuick = quickDef.matchKeys.some(
            (k) => pCat.includes(k) || pName.includes(k) || pTags.includes(k)
          );
          if (!matchesQuick) return false;
        }
      }

      // 3. Sidebar Multi-Categories
      if (selectedCategories.length > 0) {
        const matchesSidebarCat = selectedCategories.some((target) => {
          const t = target.toLowerCase();
          return (
            (product.category_id || "").toLowerCase() === t ||
            (product.category_name || product.categoryName || "").toLowerCase() === t ||
            (product.category_slug || product.categorySlug || "").toLowerCase() === t ||
            (product.category_name || product.categoryName || "").toLowerCase().includes(t)
          );
        });
        if (!matchesSidebarCat) return false;
      }

      // 4. Brands (Multi-select)
      if (selectedBrands.length > 0) {
        const detected = detectProductBrand(product).toLowerCase();
        const rawBrand = (product.brand_name || product.brandName || product.brand || "").toLowerCase();
        const matchesBrand = selectedBrands.some((b) => {
          const bl = b.toLowerCase();
          return detected === bl || rawBrand === bl || (product.name || "").toLowerCase().includes(bl);
        });
        if (!matchesBrand) return false;
      }

      // 5. Price & Quick Price Cap
      const effPrice = getEffectivePrice(product);
      const minP = minPrice ? parseInt(minPrice) : 0;
      let maxP = maxPrice ? parseInt(maxPrice) : Infinity;
      if (quickPriceMax && quickPriceMax < maxP) {
        maxP = quickPriceMax;
      }
      if (effPrice < minP || effPrice > maxP) return false;

      // 6. Availability
      if (inStockOnly && product.stock_status === "out_of_stock") return false;
      if (selectedAvailability.length > 0) {
        const currentStatus = product.stock_status || "in_stock";
        if (!selectedAvailability.includes(currentStatus)) return false;
      }

      // 7. Condition
      if (selectedConditions.length > 0) {
        const cond = detectProductCondition(product).toLowerCase();
        const matchesCond = selectedConditions.some((c) => c.toLowerCase() === cond);
        if (!matchesCond) return false;
      }

      // 8. Storage
      if (selectedStorage.length > 0) {
        const storages = detectProductStorage(product).map((s) => s.toLowerCase());
        const matchesStorage = selectedStorage.some((s) => storages.includes(s.toLowerCase()));
        if (!matchesStorage) return false;
      }

      // 9. Warranty
      if (selectedWarranties.length > 0) {
        const warr = (product.warranty || product.brand_warranty || "").toLowerCase();
        const matchesWarr = selectedWarranties.some((w) => warr.includes(w.toLowerCase()));
        if (!matchesWarr) return false;
      }

      // 10. Deals & Flags
      if (newArrivalsOnly && !product.is_new_arrival) return false;
      if (featuredOnly && !product.featured) return false;
      if (
        onSaleOnly &&
        !(
          (product.old_price && product.old_price > product.price) ||
          (product.sale_price && product.sale_price < product.price)
        )
      ) {
        return false;
      }

      return true;
    });

    // Sort Results
    list = [...list].sort((a, b) => {
      const pa = getEffectivePrice(a);
      const pb = getEffectivePrice(b);

      if (sortKey === "price-asc") {
        return pa - pb;
      }
      if (sortKey === "price-desc") {
        return pb - pa;
      }
      if (sortKey === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0);
      }
      if (sortKey === "biggest-discount") {
        const discA = a.old_price && a.old_price > a.price ? (a.old_price - a.price) / a.old_price : 0;
        const discB = b.old_price && b.old_price > b.price ? (b.old_price - b.price) / b.old_price : 0;
        return discB - discA;
      }
      // Default: Featured
      if (a.featured !== b.featured) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [
    initialProducts,
    searchQuery,
    selectedQuickCategory,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    quickPriceMax,
    inStockOnly,
    selectedAvailability,
    selectedConditions,
    selectedStorage,
    selectedWarranties,
    newArrivalsOnly,
    featuredOnly,
    onSaleOnly,
    sortKey,
  ]);

  /* ─────────────────────────────────────────────────────────────
     ACTIVE FILTER CHIPS LIST (Short, clean customer-facing labels)
  ───────────────────────────────────────────────────────────── */
  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = [];

    // Search Query
    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: `"${searchQuery.trim()}"`,
        onRemove: () => {
          setSearchQuery("");
          updateUrlParams({ search: null });
        },
      });
    }

    // Quick Category
    if (selectedQuickCategory && selectedQuickCategory !== "all") {
      const qDef = QUICK_CATEGORIES.find((c) => c.id === selectedQuickCategory);
      chips.push({
        id: `qcat-${selectedQuickCategory}`,
        label: qDef ? qDef.label : selectedQuickCategory,
        onRemove: () => {
          setSelectedQuickCategory("all");
          updateUrlParams({ cat_chip: null });
        },
      });
    }

    // Sidebar Categories
    selectedCategories.forEach((c) => {
      const catObj = categories.find(
        (cat) => cat.id === c || cat.slug === c || cat.name.toLowerCase() === c.toLowerCase()
      );
      chips.push({
        id: `cat-${c}`,
        label: catObj ? catObj.name : c,
        onRemove: () => handleToggleCategory(c),
      });
    });

    // Brands
    selectedBrands.forEach((b) => {
      chips.push({
        id: `brand-${b}`,
        label: b,
        onRemove: () => handleToggleBrand(b),
      });
    });

    // Price
    if (minPrice || maxPrice) {
      const mn = minPrice ? parseInt(minPrice) : 0;
      const mx = maxPrice ? parseInt(maxPrice) : 0;
      let label = "";
      if (!mn && mx) label = `Under ${fmtLKR(mx)}`;
      else if (mn && !mx) label = `Above ${fmtLKR(mn)}`;
      else if (mn && mx) label = `${fmtLKR(mn)} – ${fmtLKR(mx)}`;
      else label = "Price Filter";

      chips.push({
        id: "price-range",
        label,
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
          setPendingMin("");
          setPendingMax("");
          setSliderLow(catalogMin);
          setSliderHigh(catalogMax);
          updateUrlParams({ minPrice: null, maxPrice: null });
        },
      });
    }

    // Quick Price Cap
    if (quickPriceMax) {
      chips.push({
        id: `quick-price-${quickPriceMax}`,
        label: `Under ${fmtLKR(quickPriceMax)}`,
        onRemove: () => handleToggleQuickPrice(null),
      });
    }

    // Availability
    if (inStockOnly) {
      chips.push({
        id: "in-stock",
        label: "In Stock",
        onRemove: handleToggleInStock,
      });
    }

    selectedAvailability.forEach((a) => {
      const label = a === "in_stock" ? "In Stock" : a === "low_stock" ? "Low Stock" : "Out of Stock";
      chips.push({
        id: `avail-${a}`,
        label,
        onRemove: () => handleToggleAvailability(a),
      });
    });

    // Condition
    selectedConditions.forEach((c) => {
      chips.push({
        id: `cond-${c}`,
        label: c,
        onRemove: () => handleToggleCondition(c),
      });
    });

    // Storage
    selectedStorage.forEach((s) => {
      chips.push({
        id: `storage-${s}`,
        label: s,
        onRemove: () => handleToggleStorage(s),
      });
    });

    // Warranty
    selectedWarranties.forEach((w) => {
      let cleanW = w;
      const lower = w.toLowerCase();
      if (lower.includes("6 month") || lower.includes("six month")) cleanW = "6 Months";
      else if (lower.includes("3 month") || lower.includes("three month")) cleanW = "3 Months";
      else if (lower.includes("1 year apple") || lower.includes("apple care")) cleanW = "1 Yr Apple Care";
      else if (lower.includes("1 year") || lower.includes("one year")) cleanW = "1 Year";
      else if (lower.includes("2 year") || lower.includes("two year")) cleanW = "2 Years";
      else cleanW = w.replace(/warranty|limited/gi, "").trim() || w;

      chips.push({
        id: `warr-${w}`,
        label: `Warranty: ${cleanW}`,
        onRemove: () => handleToggleWarranty(w),
      });
    });

    // Flags
    if (newArrivalsOnly) {
      chips.push({
        id: "flag-new",
        label: "New Arrivals",
        onRemove: handleToggleNewArrivals,
      });
    }
    if (onSaleOnly) {
      chips.push({
        id: "flag-sale",
        label: "Best Deals",
        onRemove: handleToggleOnSale,
      });
    }

    return chips;
  }, [
    searchQuery,
    selectedQuickCategory,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    quickPriceMax,
    inStockOnly,
    selectedAvailability,
    selectedConditions,
    selectedStorage,
    selectedWarranties,
    newArrivalsOnly,
    onSaleOnly,
    categories,
    catalogMin,
    catalogMax,
  ]);

  /* ─────────────────────────────────────────────────────────────
     SIDEBAR PROPS
  ───────────────────────────────────────────────────────────── */
  const sidebarProps = {
    allProducts: initialProducts,
    categories,
    selectedCategories,
    onToggleCategory: handleToggleCategory,
    onClearCategories: handleClearCategories,
    selectedBrands,
    onToggleBrand: handleToggleBrand,
    onClearBrands: handleClearBrands,
    priceMin: catalogMin,
    priceMax: catalogMax,
    sliderLow,
    sliderHigh,
    onSliderChange: handleSliderChange,
    pendingMin,
    pendingMax,
    setPendingMin,
    setPendingMax,
    priceError,
    onApplyPrice: handleApplyPrice,
    selectedAvailability,
    onToggleAvailability: handleToggleAvailability,
    selectedConditions,
    onToggleCondition: handleToggleCondition,
    selectedStorage,
    onToggleStorage: handleToggleStorage,
    selectedWarranties,
    onToggleWarranty: handleToggleWarranty,
    onApplyAll: () => setShowMobileFilters(false),
    onClearAll: handleClearAll,
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-white min-h-screen text-neutral-900 pb-20">

      {/* ── 1. Page Header & Hero Discovery Hub (Compact connected layout) ── */}
      <section className="bg-white border-b border-neutral-100 pt-5 sm:pt-6 pb-4 sm:pb-5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center sm:text-left">
          
          {/* Title & Subtitle */}
          <div className="space-y-0.5 mb-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-400 block">
              STREET MOBILE CATALOG
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
              SHOP ALL
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm font-medium max-w-2xl">
              Explore our full collection of genuine smartphones, high-performance audio gear, authentic accessories, and premium tech.
            </p>
          </div>

          {/* ── Main Search Bar (Desktop width ~880px, centered) ── */}
          <div className="mb-4">
            <ShopSearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              products={initialProducts}
            />
          </div>

          {/* ── Quick Category Chips (Outline Lucide icons, smooth scroll & edge fade) ── */}
          <div>
            <ShopCategoryChips
              selectedCategoryId={selectedQuickCategory}
              onSelectCategory={handleQuickCategorySelect}
            />
          </div>

        </div>
      </section>

      {/* ── 2. Sticky Mobile Control Bar ── */}
      <div className="lg:hidden sticky top-[56px] sm:top-[64px] z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 py-2.5 px-4 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-2xs hover:bg-neutral-800 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterChips.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-black flex items-center justify-center">
              {activeFilterChips.length}
            </span>
          )}
        </button>

        <span className="text-xs font-bold text-neutral-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
        </span>

        {/* Mobile Sort */}
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => handleSortChange(e.target.value as SortOptionValue)}
            className="appearance-none pl-3 pr-7 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Sort: Price: Low to High</option>
            <option value="price-desc">Sort: Price: High to Low</option>
            <option value="biggest-discount">Sort: Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* ── 3. Main Catalog Container (Tightened desktop spacing: max 32px to toolbar) ── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-4 sm:pt-6 pb-12">

        {/* ── Results Toolbar (Desktop & Tablet: single horizontal row) ── */}
        <div className="mb-4">
          <ShopResultsToolbar
            totalCount={filteredProducts.length}
            activeFilters={activeFilterChips}
            onClearAll={handleClearAll}
            sortKey={sortKey}
            onSortChange={handleSortChange}
            onOpenMobileFilters={() => setShowMobileFilters(true)}
          />
        </div>

        {/* ── Two-Column Layout (Sidebar 250-260px, aligned top) ── */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* Desktop Filter Sidebar (Width 255px) */}
          <aside className="hidden lg:block w-[255px] shrink-0">
            <div className="sticky top-[100px] bg-white border border-neutral-200/80 rounded-2xl p-4.5 shadow-2xs">
              <ShopFilterSidebar {...sidebarProps} />
            </div>
          </aside>

          {/* Product Results Grid */}
          <main className="flex-1 min-w-0 w-full">
            {filteredProducts.length === 0 ? (
              /* ── 4. Empty State ── */
              <div className="text-center py-14 sm:py-16 px-4 bg-[#FAFAFB] rounded-3xl border border-neutral-200/80 shadow-2xs max-w-2xl mx-auto my-2">
                <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Package className="w-7 h-7 text-neutral-400" />
                </div>
                
                <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                  No products match your search or selected filters.
                </h3>
                
                <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-md mx-auto font-medium">
                  Try clearing your active filters, expanding your price range, or checking for typo variations in your search term.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                  {activeFilterChips.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Filters</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs font-bold hover:border-black hover:text-black transition-all shadow-2xs"
                  >
                    <span>View All Products</span>
                  </button>

                  <a
                    href="https://wa.me/94774141118?text=Hello%20Street%20Mobile,%20I'm%20looking%20for%20a%20product%20on%20your%20website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-all shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              /* ── 5. Product Grid with Strict Alignment & Larger Images ── */
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={filteredProducts.map((p) => p.id).join("-")}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={cardVariants} className="h-full">
                      <ProductCard product={product} className="h-full" />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </main>

        </div>

      </div>

      {/* ── 6. Mobile Filter Full-Height Bottom Sheet / Drawer ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col z-10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-20">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                  <h3 className="font-black text-sm text-black">
                    Filter Products
                  </h3>
                  {activeFilterChips.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black">
                      {activeFilterChips.length}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Filters Body */}
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                <ShopFilterSidebar
                  {...sidebarProps}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>

              {/* Sticky Mobile Apply Footer */}
              <div className="p-4 bg-white border-t border-neutral-100 flex items-center gap-3 sticky bottom-0 z-20">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="py-3 px-4 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Show {filteredProducts.length} Products</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
