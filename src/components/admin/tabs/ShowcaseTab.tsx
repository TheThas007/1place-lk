"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  Check,
  Smartphone,
  Monitor,
  Upload,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category, VisualShowcaseSettings, VisualShowcaseSlide, ShowcasePlacement } from "@/lib/types";
import { DEFAULT_SHOWCASE_SETTINGS } from "@/lib/data";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface ShowcaseTabProps {
  products: Product[];
  categories: Category[];
  initialSettings?: VisualShowcaseSettings | null;
  onRefresh?: () => void;
}

const PLACEMENT_OPTIONS: { value: ShowcasePlacement; label: string; icon: string }[] = [
  { value: "below_category", label: 'Below "Shop by Category"', icon: "📱" },
  { value: "above_brand", label: 'Above "Shop by Brand"', icon: "🏷️" },
  { value: "below_brand", label: 'Below "Shop by Brand"', icon: "🏷️" },
  { value: "below_gallery", label: 'Below "Life at Street Mobile" (Gallery)', icon: "📸" },
  { value: "below_reviews", label: 'Below "Reviews from Google"', icon: "⭐" },
  { value: "above_why_choose", label: 'Above "Why Choose Street Mobile"', icon: "🛡️" },
  { value: "below_why_choose", label: 'Below "Why Choose Street Mobile"', icon: "🛡️" },
  { value: "below_hero", label: "Below Hero Banner Slider", icon: "🌟" },
  { value: "below_new_arrivals", label: 'Below "New Arrivals"', icon: "🚀" },
  { value: "below_featured_phones", label: 'Below "Featured Mobile Phones"', icon: "📱" },
  { value: "below_featured_accessories", label: 'Below "Featured Accessories"', icon: "🎧" },
  { value: "above_location", label: "Above Store Location & Footer", icon: "📍" },
];

function getPlacementDisplay(placement?: ShowcasePlacement) {
  const opt = PLACEMENT_OPTIONS.find((p) => p.value === (placement || "below_category"));
  return opt ? `${opt.icon} ${opt.label}` : '📱 Below "Shop by Category"';
}

export default function ShowcaseTab({
  products = [],
  categories = [],
  initialSettings,
  onRefresh,
}: ShowcaseTabProps) {
  const [settings, setSettings] = useState<VisualShowcaseSettings>(() => {
    if (initialSettings && initialSettings.slides && initialSettings.slides.length > 0) {
      return initialSettings;
    }
    return DEFAULT_SHOWCASE_SETTINGS;
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);

  // Sync settings when initialSettings changes
  useEffect(() => {
    if (initialSettings && initialSettings.slides && initialSettings.slides.length > 0) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  // Load from Firestore on mount if not provided
  useEffect(() => {
    async function fetchShowcaseSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "visual_product_showcase"));
        if (snap.exists()) {
          const data = snap.data() as VisualShowcaseSettings;
          if (data && data.slides && data.slides.length > 0) {
            setSettings(data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch showcase settings:", err);
      }
    }
    if (!initialSettings) {
      fetchShowcaseSettings();
    }
  }, [initialSettings]);

  const slides = settings.slides || DEFAULT_SHOWCASE_SETTINGS.slides || [];

  // Save Settings to Firestore
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: VisualShowcaseSettings = {
        ...settings,
        slides: slides.map((s, idx) => ({
          ...s,
          placement: s.placement || settings.placement || "below_category",
          order: idx + 1,
        })),
        updated_at: new Date().toISOString(),
      };
      await setDoc(doc(db, "settings", "visual_product_showcase"), payload, { merge: true });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to save showcase settings:", err);
      alert("Failed to save showcase settings. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to Factory Default Settings
  const handleResetDefaults = () => {
    if (confirm("Reset all showcase slides to the original factory default showcase?")) {
      setSettings(DEFAULT_SHOWCASE_SETTINGS);
      setActiveSlideIndex(0);
    }
  };

  // Add New Slide
  const handleAddSlide = () => {
    const newSlide: VisualShowcaseSlide = {
      id: `slide-${Date.now()}`,
      enabled: true,
      title: "",
      subtitle: "",
      desktop_image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop",
      image_alt: "Featured Product",
      bg_type: "gradient",
      bg_gradient_from: "#F2F6FA",
      bg_gradient_to: "#FFFFFF",
      heading_color: "#1D1D1F",
      subtitle_color: "#6E6E73",
      primary_cta_text: "Explore",
      primary_cta_url: "/products",
      secondary_cta_text: "Buy Now",
      secondary_cta_url: "/products",
      show_secondary_cta: true,
      placement: "below_category",
      order: slides.length + 1,
    };

    setSettings((prev) => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide],
    }));
    setActiveSlideIndex(slides.length);
  };

  // Delete Slide
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("You must keep at least 1 showcase slide.");
      return;
    }
    if (confirm(`Delete slide #${index + 1} (${slides[index]?.title || "Slide"})?`)) {
      setSettings((prev) => {
        const nextSlides = (prev.slides || []).filter((_, i) => i !== index);
        return { ...prev, slides: nextSlides };
      });
      setActiveSlideIndex(Math.max(0, index - 1));
    }
  };

  // Update a specific slide field
  const updateSlide = (index: number, updates: Partial<VisualShowcaseSlide>) => {
    setSettings((prev) => {
      const nextSlides = [...(prev.slides || [])];
      nextSlides[index] = { ...nextSlides[index], ...updates };
      return { ...prev, slides: nextSlides };
    });
  };

  // Reorder Slides
  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    setSettings((prev) => {
      const nextSlides = [...(prev.slides || [])];
      const temp = nextSlides[index];
      nextSlides[index] = nextSlides[targetIdx];
      nextSlides[targetIdx] = temp;
      return { ...prev, slides: nextSlides };
    });
    setActiveSlideIndex(targetIdx);
  };

  // Image Upload Handler
  const handleImageUpload = async (index: number, file: File, type: "desktop" | "mobile") => {
    const key = `${index}-${type}`;
    try {
      setUploadingImageKey(key);
      const uploadedUrl = await uploadImageWithFallback(file, "showcase");
      if (uploadedUrl) {
        if (type === "desktop") {
          updateSlide(index, { desktop_image: uploadedUrl });
        } else {
          updateSlide(index, { mobile_image: uploadedUrl });
        }
      }
    } catch (err) {
      console.error("Error uploading showcase image:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImageKey(null);
    }
  };

  // Autofill from Product Selector
  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId || p.slug === productId);
    if (!prod) return;

    updateSlide(index, {
      title: prod.name,
      subtitle: prod.description ? prod.description.slice(0, 60) + "..." : "Authentic quality with official warranty.",
      desktop_image: prod.images?.[0] || "",
      primary_cta_url: `/products/${prod.slug}`,
      secondary_cta_url: `/products/${prod.slug}`,
      product_id: prod.id,
    });
  };

  // Autofill from Category Selector
  const handleSelectCategory = (index: number, categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (!cat) return;

    updateSlide(index, {
      title: cat.name,
      subtitle: cat.description || `Browse original ${cat.name} with official warranty.`,
      desktop_image: cat.image_url || "",
      primary_cta_url: `/products?category=${cat.slug || cat.id}`,
      secondary_cta_url: `/products?category=${cat.slug || cat.id}`,
      category_id: cat.id,
    });
  };

  const previewSlide = slides[activeSlideIndex] || slides[0];

  // Preview header contents check
  const prevHasTitle = Boolean(previewSlide?.title && previewSlide.title.trim().length > 0);
  const prevHasSubtitle = Boolean(previewSlide?.subtitle && previewSlide.subtitle.trim().length > 0);
  const prevHasPrimaryCta = Boolean(previewSlide?.primary_cta_text && previewSlide.primary_cta_text.trim().length > 0);
  const prevHasSecondaryCta = Boolean(
    previewSlide?.show_secondary_cta !== false &&
    previewSlide?.secondary_cta_text &&
    previewSlide.secondary_cta_text.trim().length > 0
  );
  const prevHasButtons = prevHasPrimaryCta || prevHasSecondaryCta;
  const prevHasHeader = prevHasTitle || prevHasSubtitle || prevHasButtons;

  return (
    <div className="space-y-8">
      {/* ── Top Header & Global Toggle Bar ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Featured Visual Showcase
              </h1>
              <p className="text-xs sm:text-sm text-white/50 font-medium">
                Create and position full-width cinematic showcase banners across different sections of your homepage.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Section Visibility Switch */}
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
              settings.enabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.enabled ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {settings.enabled ? "Showcase: ACTIVE" : "Showcase: HIDDEN"}
          </button>

          {/* Auto-Slide Toggle */}
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, auto_slide: !prev.auto_slide }))}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              settings.auto_slide !== false
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {settings.auto_slide !== false ? "Auto-Rotate: 6s" : "Auto-Rotate: OFF"}
          </button>

          {/* Floating Animation Global Toggle */}
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enable_animation: prev.enable_animation === false }))}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              settings.enable_animation !== false
                ? "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            }`}
          >
            {settings.enable_animation !== false ? "✨ Animation: ON" : "✨ Animation: OFF"}
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Reset to default showcase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Changes Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Showcase
              </>
            )}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Featured Visual Showcase saved successfully and live on the homepage!</span>
        </div>
      )}

      {/* ── Main Layout: Slide Editor on Left (7 cols) + Live Preview on Right (5 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Slides Manager (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Add Slide Button & Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Showcase Banners ({slides.length})
            </h2>
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Plus className="w-4 h-4" /> Add Banner
            </button>
          </div>

          {slides.map((slide, idx) => {
            const isExpanded = activeSlideIndex === idx;
            const slidePlacement = slide.placement || "below_category";

            return (
              <div
                key={slide.id || `editor-slide-${idx}`}
                className={`bg-[#0F172A] border rounded-3xl transition-all shadow-lg overflow-hidden ${
                  isExpanded
                    ? "border-blue-500/40 ring-1 ring-blue-500/20"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Slide Header Summary */}
                <div
                  onClick={() => setActiveSlideIndex(idx)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none bg-white/[0.02] hover:bg-white/[0.04] transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white/10 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="truncate space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white truncate">
                          {slide.title || `Banner #${idx + 1} (Image Only)`}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            slide.enabled !== false
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {slide.enabled !== false ? "Active" : "Disabled"}
                        </span>
                        {/* Placement Tag Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[200px]">
                          {getPlacementDisplay(slidePlacement)}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 truncate">
                        {slide.primary_cta_url ? `Links to: ${slide.primary_cta_url}` : "Links to: /products"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(idx, "down");
                      }}
                      disabled={idx === slides.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-white/40 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Slide Form */}
                {isExpanded && (
                  <div className="p-6 pt-2 border-t border-white/10 space-y-5 text-xs">
                    {/* ── 1. Individual Banner Homepage Placement ── */}
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-transparent border border-amber-500/20 rounded-2xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="block font-extrabold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <LayoutTemplate className="w-4 h-4 text-amber-400" />
                          Banner #{idx + 1} Placement Position
                        </label>
                        <span className="text-[10px] text-white/50">
                          Select where this banner appears on homepage
                        </span>
                      </div>

                      <select
                        value={slidePlacement}
                        onChange={(e) =>
                          updateSlide(idx, { placement: e.target.value as ShowcasePlacement })
                        }
                        className="w-full bg-[#1E293B] border border-white/20 hover:border-amber-400 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all cursor-pointer shadow-md"
                      >
                        {PLACEMENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Enable Toggle & Autofill */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white/80">Banner:</span>
                          <button
                            type="button"
                            onClick={() => updateSlide(idx, { enabled: slide.enabled === false })}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                              slide.enabled !== false
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {slide.enabled !== false ? "ENABLED" : "DISABLED"}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white/80">Animation:</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateSlide(idx, { enable_animation: slide.enable_animation === false })
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                              slide.enable_animation !== false
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-white/10 text-white/40 border border-white/10"
                            }`}
                          >
                            {slide.enable_animation !== false ? "ANIMATION ON" : "ANIMATION OFF"}
                          </button>
                        </div>
                      </div>

                      {/* Quick Store Autofill */}
                      <div className="flex items-center gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleSelectProduct(idx, e.target.value);
                          }}
                          defaultValue=""
                          className="bg-[#1E293B] border border-white/10 px-2.5 py-1.5 rounded-xl text-white outline-none text-[11px]"
                        >
                          <option value="" disabled>
                            Autofill Product...
                          </option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>

                        <select
                          onChange={(e) => {
                            if (e.target.value) handleSelectCategory(idx, e.target.value);
                          }}
                          defaultValue=""
                          className="bg-[#1E293B] border border-white/10 px-2.5 py-1.5 rounded-xl text-white outline-none text-[11px]"
                        >
                          <option value="" disabled>
                            Autofill Category...
                          </option>
                          {categories.map((c) => (
                            <option key={c.id || c.slug} value={c.id || c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Titles (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-white/70 uppercase tracking-wider mb-1">
                          Product Heading <span className="text-white/40 font-normal normal-case">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) => updateSlide(idx, { title: e.target.value })}
                          placeholder="Leave blank for clean image-only banner"
                          className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white font-bold outline-none focus:border-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-white/70 uppercase tracking-wider mb-1">
                          Subtitle / Tagline <span className="text-white/40 font-normal normal-case">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={slide.subtitle || ""}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          placeholder="Leave blank if not needed"
                          className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Colors & Gradient Settings */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white/80 uppercase tracking-wider">
                          Background Styling
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSlide(idx, { bg_type: "gradient" })}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              slide.bg_type !== "color"
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Subtle Gradient
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSlide(idx, { bg_type: "color" })}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              slide.bg_type === "color"
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Solid Color
                          </button>
                        </div>
                      </div>

                      {slide.bg_type === "color" ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={slide.bg_color || "#FFFFFF"}
                            onChange={(e) => updateSlide(idx, { bg_color: e.target.value })}
                            className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/20 shrink-0"
                          />
                          <input
                            type="text"
                            value={slide.bg_color || "#FFFFFF"}
                            onChange={(e) => updateSlide(idx, { bg_color: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-mono font-bold uppercase outline-none focus:border-blue-500"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-white/50 font-bold mb-1">
                              Gradient Top Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={slide.bg_gradient_from || "#F2F6FA"}
                                onChange={(e) => updateSlide(idx, { bg_gradient_from: e.target.value })}
                                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 shrink-0"
                              />
                              <input
                                type="text"
                                value={slide.bg_gradient_from || "#F2F6FA"}
                                onChange={(e) => updateSlide(idx, { bg_gradient_from: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white font-mono text-[11px] outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-white/50 font-bold mb-1">
                              Gradient Bottom Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={slide.bg_gradient_to || "#FFFFFF"}
                                onChange={(e) => updateSlide(idx, { bg_gradient_to: e.target.value })}
                                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 shrink-0"
                              />
                              <input
                                type="text"
                                value={slide.bg_gradient_to || "#FFFFFF"}
                                onChange={(e) => updateSlide(idx, { bg_gradient_to: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white font-mono text-[11px] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Color Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-white/40 mr-1">Presets:</span>
                        {[
                          { name: "Ice Blue", from: "#F2F6FA", to: "#FFFFFF" },
                          { name: "Titanium Warm", from: "#FAF6F2", to: "#FFFFFF" },
                          { name: "Sky Blue", from: "#EBF3F9", to: "#FFFFFF" },
                          { name: "Soft Grey", from: "#F5F5F7", to: "#FFFFFF" },
                          { name: "Pure White", from: "#FFFFFF", to: "#FFFFFF" },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              updateSlide(idx, {
                                bg_type: "gradient",
                                bg_gradient_from: preset.from,
                                bg_gradient_to: preset.to,
                              })
                            }
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-white/70 font-semibold transition-colors"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Images (Desktop & Mobile) */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <label className="block font-bold text-white/70 uppercase tracking-wider">
                        Product Images (Transparent PNG or WebP Recommended)
                      </label>

                      {/* Desktop Image */}
                      <div className="flex items-start gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                          {slide.desktop_image ? (
                            <img
                              src={slide.desktop_image}
                              alt="Desktop"
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-white/20" />
                          )}
                          {uploadingImageKey === `${idx}-desktop` && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <span className="text-[11px] font-bold text-white/80">Desktop Image (Primary)</span>
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5 shrink-0">
                              <Upload className="w-3.5 h-3.5" /> Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(idx, e.target.files[0], "desktop");
                                  }
                                }}
                              />
                            </label>
                            <input
                              type="text"
                              value={slide.desktop_image}
                              onChange={(e) => updateSlide(idx, { desktop_image: e.target.value })}
                              placeholder="https://..."
                              className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white outline-none font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Image (Optional) */}
                      <div className="flex items-start gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                          {slide.mobile_image ? (
                            <img
                              src={slide.mobile_image}
                              alt="Mobile"
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Smartphone className="w-6 h-6 text-white/20" />
                          )}
                          {uploadingImageKey === `${idx}-mobile` && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <span className="text-[11px] font-bold text-white/80">
                            Mobile Image (Optional — falls back to desktop)
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                              <Upload className="w-3.5 h-3.5" /> Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(idx, e.target.files[0], "mobile");
                                  }
                                }}
                              />
                            </label>
                            <input
                              type="text"
                              value={slide.mobile_image || ""}
                              onChange={(e) => updateSlide(idx, { mobile_image: e.target.value })}
                              placeholder="Leave blank to use desktop image"
                              className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white outline-none font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── 3. Destination URL & Action Buttons Configuration ── */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <label className="block font-bold text-white/70 uppercase tracking-wider">
                        Destination Link &amp; CTA Buttons
                      </label>

                      {/* Primary CTA (Target Product URL) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                          <label className="block text-[10px] text-white/70 font-bold mb-1 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                            Banner Click Destination URL
                          </label>
                          <input
                            type="text"
                            value={slide.primary_cta_url || ""}
                            onChange={(e) => updateSlide(idx, { primary_cta_url: e.target.value })}
                            placeholder="/products/iphone-16-pro-max or /products"
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-mono outline-none focus:border-blue-500 text-[11px]"
                          />
                          <p className="text-[10px] text-white/40 mt-1">
                            Clicking anywhere on the banner image navigates to this URL.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 font-bold mb-1">
                            Primary CTA Button Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={slide.primary_cta_text || ""}
                            onChange={(e) => updateSlide(idx, { primary_cta_text: e.target.value })}
                            placeholder="e.g. Explore (or leave blank)"
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Secondary CTA (Outlined Button) */}
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white/80">Secondary CTA (Outlined Button)</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateSlide(idx, { show_secondary_cta: slide.show_secondary_cta === false })
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                              slide.show_secondary_cta !== false
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {slide.show_secondary_cta !== false ? "ENABLED" : "DISABLED"}
                          </button>
                        </div>

                        {slide.show_secondary_cta !== false && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-white/50 font-bold mb-1">
                                Secondary CTA Label
                              </label>
                              <input
                                type="text"
                                value={slide.secondary_cta_text || ""}
                                onChange={(e) => updateSlide(idx, { secondary_cta_text: e.target.value })}
                                placeholder="Buy Now"
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-white/50 font-bold mb-1">
                                Secondary CTA URL
                              </label>
                              <input
                                type="text"
                                value={slide.secondary_cta_url || ""}
                                onChange={(e) => updateSlide(idx, { secondary_cta_url: e.target.value })}
                                placeholder="/products/..."
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-mono outline-none focus:border-blue-500 text-[11px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Real-Time Interactive Live Preview (Col 5) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">Live Showcase Preview</h3>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewDevice === "desktop" ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewDevice === "mobile" ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Position and Animation indicator badges in preview */}
            {previewSlide && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-white/50 text-[11px]">Position:</span>
                  <span className="font-bold text-amber-300 text-[11px] truncate">
                    {getPlacementDisplay(previewSlide.placement)}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                    previewSlide.enable_animation !== false && settings.enable_animation !== false
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {previewSlide.enable_animation !== false && settings.enable_animation !== false
                    ? "✨ ANIMATION ON"
                    : "ANIMATION OFF"}
                </span>
              </div>
            )}

            {/* Preview Frame with Taller Height */}
            <div
              className={`rounded-2xl overflow-hidden border border-white/10 mx-auto transition-all shadow-inner ${
                previewDevice === "desktop" ? "w-full" : "max-w-xs"
              }`}
            >
              {previewSlide ? (
                <div
                  style={
                    previewSlide.bg_type === "color" && previewSlide.bg_color
                      ? { backgroundColor: previewSlide.bg_color }
                      : {
                          background: `linear-gradient(180deg, ${
                            previewSlide.bg_gradient_from || "#F2F6FA"
                          } 0%, ${previewSlide.bg_gradient_to || "#FFFFFF"} 100%)`,
                        }
                  }
                  className={`p-4 sm:p-5 pb-0 flex flex-col ${
                    prevHasHeader ? "justify-between" : "justify-center"
                  } items-center text-center select-none min-h-[450px] sm:min-h-[480px]`}
                >
                  {/* Top Text (Rendered ONLY if title, subtitle, or button exists) */}
                  {prevHasHeader && (
                    <div className="space-y-1.5 z-10 mb-1">
                      {prevHasTitle && (
                        <h4
                          className="font-bold text-xl sm:text-2xl tracking-tight"
                          style={{ color: previewSlide.heading_color || "#1D1D1F" }}
                        >
                          {previewSlide.title}
                        </h4>
                      )}
                      {prevHasSubtitle && (
                        <p
                          className="text-xs sm:text-sm font-normal max-w-xs mx-auto"
                          style={{ color: previewSlide.subtitle_color || "#6E6E73" }}
                        >
                          {previewSlide.subtitle}
                        </p>
                      )}

                      {/* Buttons */}
                      {prevHasButtons && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {prevHasPrimaryCta && (
                            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-neutral-900 text-white">
                              {previewSlide.primary_cta_text}
                            </span>
                          )}
                          {prevHasSecondaryCta && (
                            <span className="px-4 py-1.5 rounded-full text-xs font-medium border border-neutral-900/30 text-neutral-900 bg-white/60">
                              {previewSlide.secondary_cta_text}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Image (Rests flush on bottom rim & right under buttons) */}
                  <div
                    className="relative w-full flex-1 flex items-end justify-center mt-1 pb-0 overflow-visible"
                  >
                    {previewSlide.desktop_image ? (
                      <img
                        src={
                          previewDevice === "mobile" && previewSlide.mobile_image
                            ? previewSlide.mobile_image
                            : previewSlide.desktop_image
                        }
                        alt="preview"
                        className={`w-auto h-auto max-w-[98%] ${
                          prevHasHeader ? "max-h-[300px] sm:max-h-[340px]" : "max-h-[340px] sm:max-h-[380px]"
                        } object-contain object-bottom block drop-shadow-[0_15px_25px_rgba(0,0,0,0.1)]`}
                      />
                    ) : (
                      <span className="text-xs text-neutral-400 pb-8">No Image Uploaded</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-neutral-400 text-xs">No active slide to preview</div>
              )}
            </div>

            {/* Slide Switcher Indicator in Preview */}
            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlideIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlideIndex === i ? "w-6 bg-blue-500" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            <p className="text-[11px] text-white/40 text-center font-medium">
              Live representation of Banner #{activeSlideIndex + 1} ({getPlacementDisplay(previewSlide?.placement)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
