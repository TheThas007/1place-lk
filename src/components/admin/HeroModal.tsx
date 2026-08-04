"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check, Upload, Sparkles, Sliders, Layers } from "lucide-react";
import { HeroSlide } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Partial<HeroSlide>) => Promise<void>;
  slide: HeroSlide | null;
}

const presets = [
  { url: "/hero-slide-1.png", label: "Flagship Showcase (4K Ultra)" },
  { url: "/hero-slide-2.png", label: "Luxury Showroom Interior" },
  { url: "/hero-slide-3.png", label: "Titanium Camera Lens Detail" },
  { url: "/hero-slide-4.png", label: "Minimalist Tech Ecosystem" },
];

export default function HeroModal({ isOpen, onClose, onSave, slide }: HeroModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slide) {
      setImageUrl(slide.image_url || "");
      setImagePreview(slide.image_url || "");
      setAlt(slide.alt || "");
      setSortOrder(slide.sort_order ?? 1);
      setActive(slide.active ?? true);
    } else {
      setImageUrl("");
      setImagePreview("");
      setAlt("");
      setSortOrder(1);
      setActive(true);
    }
    setImageFile(null);
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = imageUrl.trim();

    if (imageFile) {
      setSaving(true);
      try {
        finalUrl = await uploadImageWithFallback(imageFile, "hero_slides");
      } catch (err) {
        console.error("Hero image upload error:", err);
      }
    }

    if (!finalUrl && !imagePreview) {
      alert("Please upload an image, select a preset, or paste an image URL.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        image_url: finalUrl || imagePreview,
        alt: alt.trim() || "Street Mobile Hero Banner",
        sort_order: Number(sortOrder) || 1,
        active,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save hero slide: ${err?.message || "Please check connection"}`);
    } finally {
      setSaving(false);
    }
  };

  const currentPreviewSrc = imageFile ? imagePreview : (imageUrl || imagePreview);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {slide ? "Edit Hero Slide" : "Add New Hero Wallpaper"}
              </h3>
              <p className="text-xs text-white/40">Customize homepage hero slideshow banner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Quick 4K Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Presets Wallpapers
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = !imageFile && imageUrl === p.url;
                return (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrl(p.url);
                      setImagePreview(p.url);
                      if (!alt) setAlt(p.label);
                    }}
                    className={`flex items-center gap-2.5 text-xs text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                    <span className="truncate">{p.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload or Custom URL */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
              Upload Image File or Paste URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="file"
                id="heroFileUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="heroFileUpload"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload File from PC
              </label>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageFile(null);
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Or paste image URL (https://...)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Live Wallpaper Card Preview */}
          {currentPreviewSrc && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                Live Banner Preview
              </label>
              <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl group">
                <img
                  src={currentPreviewSrc}
                  alt="Slide preview"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-slide-1.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-white text-xs font-semibold tracking-wide">
                      {alt || "Street Mobile Hero Wallpaper"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/80 text-white text-[10px] font-bold uppercase rounded-md backdrop-blur-md">
                    Order #{sortOrder}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Title & Alt Text */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Slide Title / Description Text *
            </label>
            <input
              type="text"
              required
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Flagship Smartphones & Accessories Collection"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Sort Order & Active Switcher */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Display Order Number
              </label>
              <div className="relative">
                <Sliders className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-xs font-semibold text-white/90">Active on Homepage</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/10 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              {saving ? "Saving..." : slide ? "Update Slide" : "Add Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
