"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check } from "lucide-react";
import { HeroSlide } from "@/lib/types";

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Partial<HeroSlide>) => Promise<void>;
  slide: HeroSlide | null;
}

const presets = [
  { url: "/hero-slide-1.png", label: "Flagship Phones Showcase" },
  { url: "/hero-slide-2.png", label: "Luxury Showroom Interior" },
  { url: "/hero-slide-3.png", label: "Titanium Camera Lens Detail" },
  { url: "/hero-slide-4.png", label: "Minimalist Tech Ecosystem" },
];

export default function HeroModal({ isOpen, onClose, onSave, slide }: HeroModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slide) {
      setImageUrl(slide.image_url || "");
      setAlt(slide.alt || "");
      setSortOrder(slide.sort_order ?? 1);
      setActive(slide.active ?? true);
    } else {
      setImageUrl("");
      setAlt("");
      setSortOrder(1);
      setActive(true);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return alert("Please enter an image URL or select a preset");

    setSaving(true);
    try {
      await onSave({
        image_url: imageUrl.trim(),
        alt: alt.trim() || "Street Mobile Hero Banner",
        sort_order: Number(sortOrder) || 1,
        active,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save hero slide.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#88E788]" />
            {slide ? "Edit Hero Slide" : "Add New Hero Slide"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Select Preset Wallpaper or Paste Custom URL below
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presets.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => {
                    setImageUrl(p.url);
                    if (!alt) setAlt(p.label);
                  }}
                  className={`flex items-center gap-2 text-xs text-left p-2 rounded-xl border transition-all ${
                    imageUrl === p.url
                      ? "border-black bg-black text-white font-semibold shadow-sm"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#88E788] flex-shrink-0" />
                  <span className="truncate">{p.label}</span>
                  {imageUrl === p.url && <Check className="w-3.5 h-3.5 ml-auto text-[#88E788]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. /hero-slide-1.png or https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative h-36 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-inner flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero-slide-1.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <span className="text-white text-xs font-medium">Live Preview</span>
              </div>
            </div>
          )}

          {/* Alt / Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slide Title / Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Premium Mobile Store Interior"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          {/* Sort Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order (1, 2, 3...)
              </label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-black rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-800">Active Slide</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 text-sm transition-colors flex items-center gap-2 shadow-md shadow-black/10"
            >
              {saving ? "Saving..." : slide ? "Update Slide" : "Add Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
