"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Truck,
  ChevronRight,
  ChevronDown,
  Check,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  ArrowRight,
  Banknote,
  CreditCard,
} from "lucide-react";
import { formatPrice, isPhoneProduct } from "@/lib/utils";
import ProductGallery from "./product-gallery";
import CompleteYourSetup from "@/components/products/CompleteYourSetup";
import SameBrandProducts from "@/components/products/SameBrandProducts";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getColorCSS, isLightColor } from "@/lib/color-utils";
import { Product, ProductColor, ProductVariantCombo, WarrantyOption } from "@/lib/types";

interface NormalizedVariant {
  id: string;
  color: string;
  colorObj: ProductColor;
  storage: string;
  ram?: string;
  sim_type?: string;
  price: number;
  old_price?: number | null;
  stock: number;
  sku: string;
  image?: string;
  gallery: string[];
  warranty?: string;
  status: "active" | "inactive";
}

export default function ProductDetailClient({
  product,
  allProducts = [],
}: {
  product: Product;
  allProducts?: Product[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // 1. Color Variants
  const colorVariants: ProductColor[] = useMemo(() => {
    if (product.color_variants && product.color_variants.length > 0) {
      return product.color_variants;
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c, i) => ({
        id: `c-${i}`,
        name: c,
        hex: getColorCSS(c),
        images: product.images || [],
      }));
    }
    return [
      {
        id: "c-default",
        name: "Standard",
        hex: "#000000",
        images: product.images || [],
      },
    ];
  }, [product]);

  // 2. Normalized Product Variants (Single Source of Truth)
  const normalizedVariants: NormalizedVariant[] = useMemo(() => {
    const list: NormalizedVariant[] = [];

    if (product.variant_combos && product.variant_combos.length > 0) {
      product.variant_combos.forEach((combo, idx) => {
        const matchedColor = colorVariants.find(
          (c) => c.name === combo.color_name || c.id === combo.color_id
        );

        const validPrice = (combo.price && Number(combo.price) > 0) ? Number(combo.price) : (product.price || 0);
        const validOldPrice = (combo.old_price && Number(combo.old_price) > 0) ? Number(combo.old_price) : (product.old_price || null);

        if (matchedColor) {
          list.push({
            id: combo.id || `v-${idx}`,
            color: matchedColor.name,
            colorObj: matchedColor,
            storage: combo.storage || combo.ram || "Standard",
            ram: combo.ram,
            sim_type: combo.sim_type,
            price: validPrice,
            old_price: validOldPrice,
            stock: combo.stock_quantity ?? (product.stock_status === "out_of_stock" ? 0 : 10),
            sku: combo.sku || product.code || product.slug,
            image: combo.image_ref || matchedColor.cover_image || matchedColor.images?.[0] || product.images?.[0],
            gallery: matchedColor.images?.length > 0 ? matchedColor.images : (product.images || []),
            warranty: combo.warranty,
            status: combo.status || "active",
          });
        } else {
          // If combo does not specify color, map to all colors
          colorVariants.forEach((c) => {
            list.push({
              id: `${combo.id || idx}-${c.name}`.toLowerCase(),
              color: c.name,
              colorObj: c,
              storage: combo.storage || combo.ram || "Standard",
              ram: combo.ram,
              sim_type: combo.sim_type,
              price: validPrice,
              old_price: validOldPrice,
              stock: combo.stock_quantity ?? (product.stock_status === "out_of_stock" ? 0 : 10),
              sku: combo.sku || product.code || product.slug,
              image: combo.image_ref || c.cover_image || c.images?.[0] || product.images?.[0],
              gallery: c.images?.length > 0 ? c.images : (product.images || []),
              warranty: combo.warranty,
              status: combo.status || "active",
            });
          });
        }
      });
    } else if (product.storage_options && product.storage_options.length > 0) {
      colorVariants.forEach((c) => {
        product.storage_options.forEach((st) => {
          list.push({
            id: `v-${c.name}-${st}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            color: c.name,
            colorObj: c,
            storage: st,
            price: (product.storage_prices && product.storage_prices[st]) || product.price,
            old_price: product.old_price,
            stock: product.stock_status === "out_of_stock" ? 0 : 10,
            sku: product.code ? `${product.code}-${st}` : `${product.slug}-${c.name.toLowerCase()}-${st.toLowerCase()}`,
            image: c.cover_image || c.images?.[0] || product.images?.[0],
            gallery: c.images?.length > 0 ? c.images : (product.images || []),
            status: "active",
          });
        });
      });
    } else {
      colorVariants.forEach((c) => {
        list.push({
          id: `v-${c.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          color: c.name,
          colorObj: c,
          storage: "Standard",
          price: product.price,
          old_price: product.old_price,
          stock: product.stock_status === "out_of_stock" ? 0 : 10,
          sku: product.code || product.slug,
          image: c.cover_image || c.images?.[0] || product.images?.[0],
          gallery: c.images?.length > 0 ? c.images : (product.images || []),
          status: "active",
        });
      });
    }

    return list;
  }, [product, colorVariants]);

  // Selected Color Name
  const [selectedColor, setSelectedColor] = useState<string>(
    colorVariants[0]?.name || "Standard"
  );

  // Sync selectedColor if colorVariants list changes
  useEffect(() => {
    if (colorVariants.length > 0 && !colorVariants.some((c) => c.name === selectedColor)) {
      setSelectedColor(colorVariants[0].name);
    }
  }, [colorVariants, selectedColor]);

  // Active Color Object
  const selectedColorObj = useMemo(() => {
    return (
      colorVariants.find((c) => c.name === selectedColor) ||
      colorVariants[0] ||
      { id: "c-0", name: "Standard", hex: "#000000", images: product.images || [] }
    );
  }, [colorVariants, selectedColor, product.images]);

  // Available variants for current selected color ONLY
  const availableVariantsForColor = useMemo(() => {
    return normalizedVariants.filter(
      (v) => v.color === selectedColor && v.status !== "inactive"
    );
  }, [normalizedVariants, selectedColor]);

  // Selected Storage Option
  const [selectedStorage, setSelectedStorage] = useState<string | null>(() => {
    const firstInStock = availableVariantsForColor.find((v) => v.stock > 0);
    return firstInStock?.storage || availableVariantsForColor[0]?.storage || null;
  });

  // Dropdown Open State & Focus Management
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // 3. RESET INVALID STORAGE WHEN COLOR CHANGES
  useEffect(() => {
    if (!selectedColor || availableVariantsForColor.length === 0) return;

    const storageStillValid = availableVariantsForColor.some(
      (v) => v.storage === selectedStorage
    );

    if (!storageStillValid) {
      const firstInStock = availableVariantsForColor.find((v) => v.stock > 0);
      const targetStorage = firstInStock?.storage || availableVariantsForColor[0]?.storage || null;
      setSelectedStorage(targetStorage);
    }

    // Always close storage dropdown when changing color
    setIsStorageOpen(false);
    setFocusedIndex(-1);
  }, [selectedColor, availableVariantsForColor]);

  // RESET DROPDOWN STATE ON ROUTE/PRODUCT CHANGE
  useEffect(() => {
    setIsStorageOpen(false);
    setFocusedIndex(-1);
  }, [product.id, product.slug]);

  // OUTSIDE CLICK & ESCAPE KEY DISMISSAL
  useEffect(() => {
    if (!isStorageOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setIsStorageOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStorageOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStorageOpen]);

  // DERIVE SELECTED VARIANT (Single Source of Truth)
  const selectedVariant = useMemo(() => {
    if (availableVariantsForColor.length === 0) return null;
    const exactMatch = availableVariantsForColor.find(
      (v) => v.storage === selectedStorage
    );
    if (exactMatch) return exactMatch;
    return availableVariantsForColor.find((v) => v.stock > 0) || availableVariantsForColor[0] || null;
  }, [availableVariantsForColor, selectedStorage]);

  // Dynamic Image Gallery per selectedVariant & color
  const activeImages = useMemo(() => {
    const list: string[] = [];
    if (selectedVariant?.image) {
      list.push(selectedVariant.image);
    }
    if (selectedVariant?.gallery && selectedVariant.gallery.length > 0) {
      selectedVariant.gallery.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (selectedColorObj.images && selectedColorObj.images.length > 0) {
      selectedColorObj.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0
      ? list
      : product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"];
  }, [selectedVariant, selectedColorObj, product.images]);

  // Quantity & Tab States
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "warranty">("description");
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Warranty Options
  const availableWarranties = useMemo(() => {
    if (product.warranty_options && product.warranty_options.length > 0) {
      return product.warranty_options.filter((w) => w.status !== "inactive");
    }
    return [];
  }, [product]);

  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption | null>(
    availableWarranties.find((w) => w.is_default) || availableWarranties[0] || null
  );

  // Dynamic Pricing, Stock, SKU & Out-of-Stock Computation
  const warrantyPrice = selectedWarranty ? selectedWarranty.additional_price : 0;
  const currentVariantPrice = (selectedVariant ? selectedVariant.price : product.price) + warrantyPrice;
  const currentVariantOldPrice = selectedVariant?.old_price ?? product.old_price;

  const currentSku = selectedVariant?.sku || product.code || product.slug;
  const currentStock = selectedVariant ? selectedVariant.stock : (product.stock_status === "out_of_stock" ? 0 : 10);
  const isVariantOutOfStock = currentStock <= 0 || product.stock_status === "out_of_stock";

  const discountPercent = currentVariantOldPrice && currentVariantOldPrice > currentVariantPrice
    ? Math.round(((currentVariantOldPrice - currentVariantPrice) / currentVariantOldPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (isVariantOutOfStock || !selectedVariant) return;

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: currentVariantPrice,
      image: activeImages[0] || product.images?.[0] || "",
      quantity: quantity,
      color: selectedVariant.color,
      ram: selectedVariant.ram,
      storage: selectedVariant.storage,
      sku: currentSku,
      warrantyTitle: selectedWarranty?.title || product.warranty,
      warrantyPrice: selectedWarranty?.additional_price || 0,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isVariantOutOfStock || !selectedVariant) return;
    setBuyingNow(true);

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: currentVariantPrice,
      image: activeImages[0] || product.images?.[0] || "",
      quantity: quantity,
      color: selectedVariant.color,
      ram: selectedVariant.ram,
      storage: selectedVariant.storage,
      sku: currentSku,
      warrantyTitle: selectedWarranty?.title || product.warranty,
      warrantyPrice: selectedWarranty?.additional_price || 0,
    });

    router.push("/checkout");
  };

  // Keyboard navigation inside storage dropdown options
  const handleOptionKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    storage: string,
    isDisabled: boolean
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % availableVariantsForColor.length;
      setFocusedIndex(nextIdx);
      optionsRef.current[nextIdx]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + availableVariantsForColor.length) % availableVariantsForColor.length;
      setFocusedIndex(prevIdx);
      optionsRef.current[prevIdx]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isDisabled) {
        setSelectedStorage(storage);
        setIsStorageOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setIsStorageOpen(false);
      setFocusedIndex(-1);
    }
  };

  const selectedStorageVariant = availableVariantsForColor.find((v) => v.storage === selectedStorage) || availableVariantsForColor[0];

  return (
    <div className="bg-white min-h-screen text-black pb-24">
      {/* ── 1. Top Breadcrumbs ── */}
      <div className="border-b border-[#EAEAEA] bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-black transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              href={`/category/${product.category_slug || product.categorySlug || product.category_id || "smartphones"}`}
              className="hover:text-black transition-colors shrink-0"
            >
              {product.category_name || product.categoryName || "Category"}
            </Link>
            {(product.brand_name || product.brandName || product.brand) && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <Link
                  href={`/brand/${product.brand_slug || product.brandSlug || (product.brand_name || product.brand || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="hover:text-black transition-colors shrink-0 font-semibold"
                >
                  {product.brand_name || product.brandName || product.brand}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-semibold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Product Section ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery (Updates dynamically per color & variant) */}
          <div className="lg:col-span-6">
            <ProductGallery
              key={selectedVariant?.id || selectedColorObj.id}
              images={activeImages}
              name={product.name}
              discount={discountPercent}
              video_url={product.video_url}
            />
          </div>

          {/* Right Column: Information & Linked Variant Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-[11px] font-bold text-gray-700 uppercase tracking-widest">
                  {product.category_name || "Smartphones"}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  SKU: {currentSku}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center flex-wrap gap-4 mb-5 pb-5 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-bold">4.9</span>
                  <span className="text-gray-400 font-normal">(24 verified reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isVariantOutOfStock
                        ? "bg-red-500"
                        : currentStock <= 5
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span>
                    {isVariantOutOfStock
                      ? "Out of Stock"
                      : currentStock <= 5
                      ? `Low Stock — Only ${currentStock} Left`
                      : "In Stock & Ready to Ship"}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline flex-wrap gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                  {formatPrice(currentVariantPrice)}
                </span>
                {currentVariantOldPrice && currentVariantOldPrice > currentVariantPrice && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {formatPrice(currentVariantOldPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md animate-pulse">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* ── Warranty Badges ── */}
              {(availableWarranties.length > 0 || product.warranty || product.brand_warranty) && (
                <div className="space-y-2 mb-6">
                  {availableWarranties.length > 0 ? (
                    availableWarranties.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-3 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl"
                      >
                        <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                        <div>
                          <span>Warranty: <strong className="font-extrabold text-black">{w.title}</strong></span>
                          {w.coverage_details && (
                            <span className="block text-[11px] text-gray-500 font-normal mt-0.5">{w.coverage_details}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {product.warranty && (
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl">
                          <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                          <span>Warranty: <strong className="font-extrabold text-black">{product.warranty}</strong></span>
                        </div>
                      )}

                      {product.brand_warranty && (
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl">
                          <Award className="w-5 h-5 text-black shrink-0" />
                          <span>Brand Warranty: <strong className="font-extrabold text-black">{product.brand_warranty}</strong></span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── 1. COLOUR SELECTOR ── */}
              {colorVariants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Colour: <span className="font-medium text-gray-600">{selectedColor}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map((c) => {
                      const isSelected = selectedColor === c.name;
                      const hexColor = c.hex || getColorCSS(c.name);
                      const light = isLightColor(hexColor);
                      return (
                        <button
                          key={c.id || c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          title={c.name}
                          className={`w-8 h-8 rounded-full relative flex items-center justify-center transition-all ${
                            isSelected
                              ? "ring-2 ring-black ring-offset-2 scale-110 shadow-sm"
                              : "border border-gray-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: hexColor }}
                        >
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 ${light ? "text-black" : "text-white"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 2. DYNAMIC STORAGE DROPDOWN (FILTERED BY SELECTED COLOR) ── */}
              {availableVariantsForColor.length > 0 &&
                (availableVariantsForColor.length > 1 ||
                  availableVariantsForColor[0]?.storage !== "Standard" ||
                  (product.storage_options && product.storage_options.length > 0) ||
                  (product.variant_combos && product.variant_combos.length > 0)) && (
                  <div className="mb-6 relative" ref={dropdownContainerRef}>
                    <label
                      id="storage-label"
                      className="block text-xs font-bold text-black uppercase tracking-wider mb-2.5"
                    >
                      Select Memory / Storage Variant:
                    </label>
                    <div className="relative">
                      <button
                        ref={triggerRef}
                        type="button"
                        id="storage-dropdown-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={isStorageOpen}
                        aria-labelledby="storage-label storage-dropdown-trigger"
                        aria-controls="storage-listbox"
                        onClick={() => setIsStorageOpen((prev) => !prev)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsStorageOpen(true);
                            const idx = availableVariantsForColor.findIndex((v) => v.storage === selectedStorage);
                            const initialIdx = idx >= 0 ? idx : 0;
                            setFocusedIndex(initialIdx);
                            setTimeout(() => optionsRef.current[initialIdx]?.focus(), 50);
                          }
                        }}
                        className="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl text-xs sm:text-sm font-bold text-black flex items-center justify-between outline-none focus:border-black transition-all cursor-pointer shadow-xs"
                      >
                        <span className="truncate">
                          {selectedStorageVariant
                            ? `${selectedStorageVariant.ram ? `${selectedStorageVariant.ram} + ` : ""}${selectedStorageVariant.storage}${selectedStorageVariant.sim_type ? ` • ${selectedStorageVariant.sim_type}` : ""} — ${formatPrice(selectedStorageVariant.price + warrantyPrice)}`
                            : selectedStorage || "Select Option"}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-black shrink-0 transition-transform duration-200 ${
                            isStorageOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Popover */}
                      {isStorageOpen && (
                        <ul
                          id="storage-listbox"
                          role="listbox"
                          aria-labelledby="storage-label"
                          tabIndex={-1}
                          className="absolute z-30 left-0 right-0 mt-2 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150"
                        >
                          {availableVariantsForColor.map((variant, index) => {
                            const isSelected = variant.storage === selectedStorage;
                            const isComboOutOfStock = variant.stock <= 0 || variant.status === "inactive";
                            const simLabel = variant.sim_type ? ` • ${variant.sim_type}` : "";
                            const label = variant.ram
                              ? `${variant.ram} + ${variant.storage}${simLabel}`
                              : `${variant.storage}${simLabel}`;

                            return (
                              <li key={variant.id || index} role="presentation">
                                <button
                                  ref={(el) => {
                                    optionsRef.current[index] = el;
                                  }}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  aria-disabled={isComboOutOfStock}
                                  tabIndex={focusedIndex === index ? 0 : -1}
                                  disabled={isComboOutOfStock}
                                  onClick={() => {
                                    if (isComboOutOfStock) return;
                                    setSelectedStorage(variant.storage);
                                    setIsStorageOpen(false);
                                    setFocusedIndex(-1);
                                    triggerRef.current?.focus();
                                  }}
                                  onKeyDown={(e) =>
                                    handleOptionKeyDown(e, index, variant.storage, isComboOutOfStock)
                                  }
                                  className={`w-full px-4 py-3 text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${
                                    isSelected
                                      ? "bg-black text-white"
                                      : isComboOutOfStock
                                      ? "text-gray-300 bg-gray-50/50 cursor-not-allowed"
                                      : "text-black hover:bg-gray-100"
                                  }`}
                                >
                                  <span>
                                    {label} — {formatPrice(variant.price + warrantyPrice)}
                                  </span>
                                  {isComboOutOfStock ? (
                                    <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                      Out of stock
                                    </span>
                                  ) : isSelected ? (
                                    <Check className="w-4 h-4 text-white shrink-0" />
                                  ) : null}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2.5">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-[#EAEAEA] rounded-full p-1 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isVariantOutOfStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isVariantOutOfStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Primary Action Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                {/* 1. Add to Bag */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-xs sm:text-sm border-2 border-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVariantOutOfStock
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : added
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                {/* 2. Buy Now */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock || buyingNow}
                  onClick={handleBuyNow}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVariantOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800 shadow-md"
                  }`}
                >
                  {buyingNow ? (
                    <span>Proceeding...</span>
                  ) : (
                    <>
                      <span>Buy Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* ── Trust Badges ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span className="font-bold">{product.warranty || "Genuine Warranty"}</span>
                </div>
                {product.allow_cod !== false ? (
                  <div className="flex items-center gap-2.5">
                    <Banknote className="w-4 h-4 text-black shrink-0" />
                    <span>Cash on Delivery</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold">Card / Online Payment</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-black shrink-0" />
                  <span>{product.delivery_info || "Express Delivery Sri Lanka"}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 3. Content Tabs Below ── */}
        <div className="mt-16 sm:mt-20 border-t border-[#EAEAEA] pt-10">
          <div className="flex items-center gap-6 border-b border-[#EAEAEA] overflow-x-auto no-scrollbar mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "description" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Description
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "specifications" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Specifications
              {activeTab === "specifications" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("warranty")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "warranty" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Warranty & Delivery
              {activeTab === "warranty" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>

          <div className="max-w-4xl">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"}
                        >
                          <td className="px-5 py-3.5 font-bold text-black border-r border-[#EAEAEA] w-1/3">
                            {key}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">{val}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-4 text-gray-400">
                          General product specifications included with manufacturer packaging.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-black mb-1">Warranty Details</h4>
                    <p>{product.warranty || "1 Year Company Warranty against manufacturer defects."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-[#EAEAEA]">
                  <Truck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-black mb-1">Delivery Information</h4>
                    <p>{product.delivery_info || "Express island-wide delivery in Sri Lanka within 1-3 business days. Cash on delivery available."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Same Brand Recommendations ("More from Brand") ── */}
        <SameBrandProducts currentProduct={product} allProducts={allProducts} />

        {/* ── 5. Intelligent Recommendations ("Complete Your Setup") ── */}
        <CompleteYourSetup currentProduct={product} allProducts={allProducts} />
      </div>
    </div>
  );
}
