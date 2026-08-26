"use client";

import React, { useState, useMemo } from "react";
import { Product, ProductVariantCombo } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, writeBatch } from "firebase/firestore";
import {
  X,
  Tag,
  Percent,
  DollarSign,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Calculator,
} from "lucide-react";

interface BulkOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  brands: string[];
  initialCategory?: string;
  initialBrand?: string;
  initialSelectedIds?: string[];
  onSuccess?: () => void;
}

type DiscountType = "percentage" | "fixed_discount" | "fixed_price" | "reset";
type ScopeType = "category_brand" | "category_only" | "brand_only" | "selected" | "all";

export default function BulkOfferModal({
  isOpen,
  onClose,
  products,
  categories,
  brands,
  initialCategory = "",
  initialBrand = "",
  initialSelectedIds = [],
  onSuccess,
}: BulkOfferModalProps) {
  // Targeting Scope
  const [scope, setScope] = useState<ScopeType>(
    initialSelectedIds.length > 0
      ? "selected"
      : initialCategory && initialBrand
      ? "category_brand"
      : initialCategory
      ? "category_only"
      : initialBrand
      ? "brand_only"
      : "category_brand"
  );

  const [targetCategory, setTargetCategory] = useState<string>(initialCategory);
  const [targetBrand, setTargetBrand] = useState<string>(initialBrand);

  // Offer Configuration
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [useCurrentPriceAsOldPrice, setUseCurrentPriceAsOldPrice] = useState<boolean>(true);
  const [updateVariantsProportionally, setUpdateVariantsProportionally] = useState<boolean>(true);

  // Execution State
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync initial props when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setScope("selected");
      } else if (initialCategory && initialBrand) {
        setScope("category_brand");
        setTargetCategory(initialCategory);
        setTargetBrand(initialBrand);
      } else if (initialCategory) {
        setScope("category_only");
        setTargetCategory(initialCategory);
      } else if (initialBrand) {
        setScope("brand_only");
        setTargetBrand(initialBrand);
      }
      setStatusMessage(null);
    }
  }, [isOpen, initialCategory, initialBrand, initialSelectedIds]);

  // Clean classification helpers
  const getProductCategory = (p: Product): string => {
    const rawCat = (p.category_name || p.categoryName || (p as any).category || "").trim();
    return rawCat.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim() || "Smartphones";
  };

  const getProductBrand = (p: Product): string => {
    const rawBrand = (p.brand_name || p.brandName || p.brand || "").trim();
    return rawBrand.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim() || "Other";
  };

  // Filter matched products based on scope
  const targetProducts = useMemo(() => {
    return products.filter((p) => {
      if (scope === "selected") {
        return initialSelectedIds.includes(p.id);
      }
      if (scope === "all") {
        return true;
      }
      const pCat = getProductCategory(p).toLowerCase();
      const pBrand = getProductBrand(p).toLowerCase();

      if (scope === "category_brand") {
        const catMatch = targetCategory ? pCat === targetCategory.toLowerCase() : true;
        const brandMatch = targetBrand ? pBrand === targetBrand.toLowerCase() : true;
        return catMatch && brandMatch;
      }
      if (scope === "category_only") {
        return targetCategory ? pCat === targetCategory.toLowerCase() : true;
      }
      if (scope === "brand_only") {
        return targetBrand ? pBrand === targetBrand.toLowerCase() : true;
      }
      return false;
    });
  }, [products, scope, initialSelectedIds, targetCategory, targetBrand]);

  // Price Calculation Preview Function
  const calculateNewPricing = (product: Product) => {
    const currentPrice = Number(product.price) || 0;
    const existingOldPrice = Number(product.old_price) || currentPrice;

    if (discountType === "reset") {
      // Restore original old_price if exists, or keep current
      const restoredPrice = existingOldPrice > 0 ? existingOldPrice : currentPrice;
      return {
        price: restoredPrice,
        old_price: null,
        discountPercent: 0,
      };
    }

    const basePrice = useCurrentPriceAsOldPrice ? currentPrice : existingOldPrice > 0 ? existingOldPrice : currentPrice;
    let newPrice = basePrice;
    let oldPrice: number | null = basePrice;

    if (discountType === "percentage") {
      const pct = Math.min(99, Math.max(1, Number(discountValue) || 0));
      newPrice = Math.round(basePrice * (1 - pct / 100));
    } else if (discountType === "fixed_discount") {
      const discountAmount = Math.max(0, Number(discountValue) || 0);
      newPrice = Math.max(0, basePrice - discountAmount);
    } else if (discountType === "fixed_price") {
      newPrice = Math.max(0, Number(discountValue) || 0);
    }

    // Ensure valid prices
    if (newPrice >= basePrice) {
      oldPrice = null;
    } else {
      oldPrice = basePrice;
    }

    const discountPercent = oldPrice && oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

    return {
      price: newPrice,
      old_price: oldPrice,
      discountPercent,
    };
  };

  // Execute Batch Firestore Offer Application
  const handleApplyOffer = async () => {
    if (targetProducts.length === 0) {
      alert("No products match the selected targeting criteria.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to apply this offer to ${targetProducts.length} product(s)?\nScope: ${scope.toUpperCase()}`
      )
    ) {
      return;
    }

    try {
      setIsApplying(true);
      setStatusMessage(null);

      // Process in batches of 400 (Firestore max is 500)
      const batchSize = 400;
      let totalUpdated = 0;

      for (let i = 0; i < targetProducts.length; i += batchSize) {
        const batchChunk = targetProducts.slice(i, i + batchSize);
        const batch = writeBatch(db);

        batchChunk.forEach((product) => {
          const { price: newPrice, old_price: newOldPrice } = calculateNewPricing(product);

          const updatePayload: Record<string, any> = {
            price: newPrice,
            old_price: newOldPrice,
            updated_at: new Date().toISOString(),
          };

          // If product has variant combos and proportional update is enabled
          if (updateVariantsProportionally && product.has_variants && product.variant_combos && product.variant_combos.length > 0) {
            const currentBase = Number(product.price) || 1;
            const updatedCombos = product.variant_combos.map((combo: ProductVariantCombo) => {
              const comboCurrentPrice = Number(combo.price) || currentBase;
              const comboOldPrice = Number(combo.old_price) || comboCurrentPrice;

              if (discountType === "reset") {
                return {
                  ...combo,
                  price: comboOldPrice > 0 ? comboOldPrice : comboCurrentPrice,
                  old_price: null,
                };
              }

              let updatedComboPrice = comboCurrentPrice;
              let updatedComboOldPrice: number | null = comboCurrentPrice;

              if (discountType === "percentage") {
                const pct = Math.min(99, Math.max(1, Number(discountValue) || 0));
                updatedComboPrice = Math.round(comboCurrentPrice * (1 - pct / 100));
                updatedComboOldPrice = comboCurrentPrice;
              } else if (discountType === "fixed_discount") {
                const discountAmount = Math.max(0, Number(discountValue) || 0);
                updatedComboPrice = Math.max(0, comboCurrentPrice - discountAmount);
                updatedComboOldPrice = comboCurrentPrice;
              } else if (discountType === "fixed_price") {
                // If variant had price delta, retain proportional ratio
                const ratio = comboCurrentPrice / (currentBase || 1);
                updatedComboPrice = Math.round((Number(discountValue) || 0) * ratio);
                updatedComboOldPrice = comboCurrentPrice;
              }

              return {
                ...combo,
                price: updatedComboPrice,
                old_price: updatedComboPrice < updatedComboOldPrice ? updatedComboOldPrice : null,
              };
            });

            updatePayload.variant_combos = updatedCombos;
          }

          const docRef = doc(db, "products", product.id);
          batch.update(docRef, updatePayload);
          totalUpdated++;
        });

        await batch.commit();
      }

      setStatusMessage({
        type: "success",
        text: `Successfully updated promotional offers for ${totalUpdated} product(s)!`,
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error("Bulk offer application failed:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to apply offer: ${err?.message || "Unknown error"}`,
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-outfit">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8 text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-950/50 via-slate-900 to-amber-950/40 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Tag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Brand &amp; Category Offer Manager
              </h3>
              <p className="text-xs text-white/50">
                Divide products by Brand &amp; Category to apply promotional discounts &amp; sale prices in bulk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ── STEP 1: TARGETING SCOPE ── */}
          <div className="space-y-3 bg-black/30 p-4 rounded-2xl border border-white/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 1. Select Targeting Scope
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "category_brand", label: "Category + Brand" },
                { id: "category_only", label: "Category Only" },
                { id: "brand_only", label: "Brand Only" },
                { id: "selected", label: `Selected (${initialSelectedIds.length})` },
                { id: "all", label: "All Products" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScope(item.id as ScopeType)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    scope === item.id
                      ? "bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-md shadow-red-600/20"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Dynamic Selectors depending on scope */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(scope === "category_brand" || scope === "category_only") && (
                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">
                    Select Target Category
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>📁 {c}</option>
                    ))}
                  </select>
                </div>
              )}

              {(scope === "category_brand" || scope === "brand_only") && (
                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">
                    Select Target Brand
                  </label>
                  <select
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>🏷️ {b}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-white/60 pt-1">
              <span>
                Matching Products: <strong className="text-white">{targetProducts.length} items</strong>
              </span>
              {targetProducts.length === 0 && (
                <span className="text-amber-400 font-bold">No products match current filter.</span>
              )}
            </div>
          </div>

          {/* ── STEP 2: OFFER / DISCOUNT TYPE & VALUE ── */}
          <div className="space-y-4 bg-black/30 p-4 rounded-2xl border border-white/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> 2. Discount / Promotional Pricing Rule
            </h4>

            {/* Discount Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "percentage", label: "Percentage % OFF", icon: Percent },
                { id: "fixed_discount", label: "Fixed LKR OFF", icon: DollarSign },
                { id: "fixed_price", label: "Set Fixed Price", icon: Tag },
                { id: "reset", label: "Reset / Clear Offer", icon: RotateCcw },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDiscountType(item.id as DiscountType)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      discountType === item.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Discount Value Input & Presets */}
            {discountType !== "reset" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[11px] font-bold text-white/70 block mb-1">
                      {discountType === "percentage"
                        ? "Discount Percentage (%):"
                        : discountType === "fixed_discount"
                        ? "Discount Amount (LKR):"
                        : "Promotional Selling Price (LKR):"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={discountType === "percentage" ? 99 : 10000000}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-white/20 rounded-xl text-base font-black text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">
                        {discountType === "percentage" ? "%" : "LKR"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="text-[11px] font-bold text-white/50 block mb-1">Quick Presets</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {discountType === "percentage" &&
                        [5, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setDiscountValue(pct)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/80 hover:text-amber-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
                          >
                            {pct}%
                          </button>
                        ))}

                      {discountType === "fixed_discount" &&
                        [1000, 2500, 5000, 10000, 20000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDiscountValue(amt)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/80 hover:text-amber-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
                          >
                            -LKR {amt.toLocaleString()}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Options */}
                <div className="flex items-center gap-4 flex-wrap pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={useCurrentPriceAsOldPrice}
                      onChange={(e) => setUseCurrentPriceAsOldPrice(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Set Current Selling Price as Old Price (Strikethrough)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={updateVariantsProportionally}
                      onChange={(e) => setUpdateVariantsProportionally(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Also update internal Variant Combo Prices proportionally</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── STEP 3: LIVE PREVIEW OF FIRST 5 PRODUCTS ── */}
          {targetProducts.length > 0 && (
            <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/60 flex items-center justify-between">
                <span>3. Live Price Preview (First {Math.min(5, targetProducts.length)} products)</span>
                <span className="text-amber-400 font-normal">Total targeted: {targetProducts.length} items</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Current Price</th>
                      <th className="py-2 px-3">New Selling Price</th>
                      <th className="py-2 px-3">Calculated Old Price</th>
                      <th className="py-2 px-3">Discount Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {targetProducts.slice(0, 5).map((p) => {
                      const calculated = calculateNewPricing(p);
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-bold text-white max-w-[220px] truncate">
                            {p.name}
                          </td>
                          <td className="py-2 px-3 text-white/60">
                            {formatPrice(p.price)}
                          </td>
                          <td className="py-2 px-3 font-black text-emerald-400">
                            {formatPrice(calculated.price)}
                          </td>
                          <td className="py-2 px-3 text-white/40 line-through">
                            {calculated.old_price ? formatPrice(calculated.old_price) : "None"}
                          </td>
                          <td className="py-2 px-3">
                            {calculated.discountPercent > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 font-black text-[10px]">
                                -{calculated.discountPercent}% OFF
                              </span>
                            ) : (
                              <span className="text-white/30 text-[10px]">Regular</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-white/10">
          <div className="text-xs text-white/50">
            {targetProducts.length > 0 ? (
              <span>
                Ready to update <strong>{targetProducts.length} product(s)</strong>.
              </span>
            ) : (
              <span className="text-amber-400">Select matching category/brand to apply offer.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyOffer}
              disabled={isApplying || targetProducts.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {isApplying ? (
                <>Applying Bulk Campaign...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Offer to {targetProducts.length} Items</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
