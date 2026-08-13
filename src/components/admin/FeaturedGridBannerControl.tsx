"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Save, Check, Image as ImageIcon, Eye, RefreshCw, Smartphone } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { FeaturedGridBannerData } from "@/components/home/NewArrivalsGridBanner";
import { formatPrice } from "@/lib/utils";

interface FeaturedGridBannerControlProps {
  products: Product[];
}

export default function FeaturedGridBannerControl({ products }: FeaturedGridBannerControlProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [bannerData, setBannerData] = useState<FeaturedGridBannerData>({
    enabled: true,
    productId: "",
    title: "iPhone 16 Pro Max",
    tagline: "Titanium design. A18 Pro chip. Unmatched camera capabilities.",
    badgeText: "HOT DEAL",
    customImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
    customPrice: 389000,
    customOldPrice: 425000,
    buttonText: "Shop Offer Now",
    buttonUrl: "/products",
    backgroundColor: "luxury_black",
  });

  // Load existing Firestore settings
  useEffect(() => {
    async function loadBannerSettings() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "settings", "featured_grid_banner"));
        if (snap.exists()) {
          setBannerData({ ...bannerData, ...snap.data() });
        }
      } catch (err) {
        console.error("Error loading featured grid banner settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBannerSettings();
  }, []);

  // When admin selects a product from inventory dropdown -> Auto populate fields!
  const handleSelectProduct = (productId: string) => {
    if (!productId) return;
    const selectedProd = products.find((p) => p.id === productId);
    if (!selectedProd) return;

    setBannerData((prev) => ({
      ...prev,
      productId: selectedProd.id,
      title: selectedProd.name,
      tagline: selectedProd.description || `Special deal on ${selectedProd.name}`,
      customImage: selectedProd.images?.[0] || prev.customImage,
      customPrice: selectedProd.price,
      customOldPrice: selectedProd.old_price || undefined,
      buttonUrl: `/products/${selectedProd.slug || selectedProd.id}`,
      badgeText: selectedProd.is_new_arrival ? "NEW ARRIVAL" : "FEATURED OFFER",
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "featured_grid_banner"), bannerData, { merge: true });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save featured grid banner settings");
    } finally {
      setSaving(false);
    }
  };

  const isLight = bannerData.backgroundColor === "clean_white";

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>GRID GAP FILLER BANNER</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            New Arrivals Grid Featured Offer Banner
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Display a luxury 2-column offer card in the New Arrivals product grid to fill empty space!
          </p>
        </div>

        {/* Enable / Disable Switch */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shrink-0">
          <span className="text-xs font-bold text-white/80 pl-2">
            {bannerData.enabled ? "⚡ Banner Active" : "Banner Off"}
          </span>
          <button
            type="button"
            onClick={() => setBannerData({ ...bannerData, enabled: !bannerData.enabled })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              bannerData.enabled ? "bg-amber-400" : "bg-white/20"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                bannerData.enabled ? "translate-x-6 bg-black" : "translate-x-0 bg-white"
              }`}
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-white/50">Loading banner configuration...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Inventory Auto-Select Dropdown */}
            <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" /> Auto-Fill from Inventory Product
              </label>
              <select
                value={bannerData.productId || ""}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-amber-400/40 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="">-- Choose a Product from Catalog --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatPrice(p.price)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-200/70">
                Selecting a product automatically loads its Title, Price, Image, and Product Page Link!
              </p>
            </div>

            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Banner Title / Product Name</label>
                <input
                  type="text"
                  value={bannerData.title || ""}
                  onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                  placeholder="e.g. iPhone 16 Pro Max"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Offer Badge Text</label>
                <input
                  type="text"
                  value={bannerData.badgeText || ""}
                  onChange={(e) => setBannerData({ ...bannerData, badgeText: e.target.value.toUpperCase() })}
                  placeholder="e.g. HOT DEAL, NEW ARRIVAL"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50 uppercase font-mono"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Short Tagline / Teaser</label>
              <input
                type="text"
                value={bannerData.tagline || ""}
                onChange={(e) => setBannerData({ ...bannerData, tagline: e.target.value })}
                placeholder="e.g. Titanium design with A18 Pro chip..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Product Banner Image URL</label>
              <input
                type="text"
                value={bannerData.customImage || ""}
                onChange={(e) => setBannerData({ ...bannerData, customImage: e.target.value })}
                placeholder="https://... direct image URL"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Offer Price (LKR)</label>
                <input
                  type="number"
                  value={bannerData.customPrice || ""}
                  onChange={(e) => setBannerData({ ...bannerData, customPrice: Number(e.target.value) })}
                  placeholder="389000"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Original Price (Strikethrough LKR)</label>
                <input
                  type="number"
                  value={bannerData.customOldPrice || ""}
                  onChange={(e) => setBannerData({ ...bannerData, customOldPrice: Number(e.target.value) })}
                  placeholder="425000"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* CTA Button & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Button Text</label>
                <input
                  type="text"
                  value={bannerData.buttonText || ""}
                  onChange={(e) => setBannerData({ ...bannerData, buttonText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Button Link</label>
                <input
                  type="text"
                  value={bannerData.buttonUrl || ""}
                  onChange={(e) => setBannerData({ ...bannerData, buttonUrl: e.target.value })}
                  placeholder="/products/iphone-16"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Theme Style</label>
                <select
                  value={bannerData.backgroundColor || "luxury_black"}
                  onChange={(e) => setBannerData({ ...bannerData, backgroundColor: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                >
                  <option value="luxury_black">👑 Luxury Black</option>
                  <option value="deep_gradient">🌌 Deep Slate</option>
                  <option value="gold_accent">✨ Gold Glow Accent</option>
                  <option value="clean_white">⚪ Clean White</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Saved Live to Storefront!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save Featured Banner Settings"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" /> Live Grid Card Preview
            </h4>

            <div className="p-4 bg-zinc-950 border border-white/10 rounded-3xl">
              <div
                className={`rounded-2xl overflow-hidden p-5 flex flex-col items-start justify-between gap-4 transition-all duration-300 ${
                  bannerData.backgroundColor === "clean_white"
                    ? "bg-white text-black border border-neutral-200"
                    : bannerData.backgroundColor === "gold_accent"
                    ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/60 border border-amber-500/30 text-white"
                    : bannerData.backgroundColor === "deep_gradient"
                    ? "bg-gradient-to-br from-neutral-900 via-slate-900 to-black border border-white/15 text-white"
                    : "bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-white/15 text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${isLight ? "bg-black text-white" : "bg-amber-400 text-black"}`}>
                    {bannerData.badgeText || "FEATURED OFFER"}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg line-clamp-1">{bannerData.title || "Product Title"}</h4>
                  <p className="text-xs opacity-75 line-clamp-2 mt-1">{bannerData.tagline || "Tagline preview..."}</p>
                </div>

                <div className="w-full flex items-center justify-between pt-2">
                  <div>
                    <span className="text-sm font-black block">{bannerData.customPrice ? formatPrice(bannerData.customPrice) : "Rs. 0"}</span>
                    {bannerData.customOldPrice && (
                      <span className="text-[10px] line-through opacity-50 block">{formatPrice(bannerData.customOldPrice)}</span>
                    )}
                  </div>

                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLight ? "bg-black text-white" : "bg-white text-black"}`}>
                    {bannerData.buttonText || "Shop Now"} →
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
