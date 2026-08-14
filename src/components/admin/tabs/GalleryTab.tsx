"use client";

import React, { useState } from "react";
import { GalleryImage, HeroSlide } from "@/lib/types";
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, Sparkles, Sliders } from "lucide-react";

export function getPlatformMeta(platform?: string, post_url?: string) {
  let p = (platform || "").toLowerCase();
  
  if ((!p || p === "none") && post_url) {
    if (post_url.includes("instagram.com")) p = "instagram";
    else if (post_url.includes("tiktok.com")) p = "tiktok";
    else if (post_url.includes("facebook.com") || post_url.includes("fb.watch")) p = "facebook";
    else if (post_url.includes("youtube.com") || post_url.includes("youtu.be")) p = "youtube";
    else if (post_url.startsWith("http")) p = "other";
  }

  switch (p) {
    case "instagram":
      return {
        name: "Instagram",
        label: "View on Instagram",
        badgeBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white",
        icon: "📸",
        glow: "hover:border-pink-500/50 hover:shadow-[0_15px_35px_rgba(236,72,153,0.3)]",
      };
    case "tiktok":
      return {
        name: "TikTok",
        label: "Watch on TikTok",
        badgeBg: "bg-black text-white border border-cyan-400/40",
        icon: "🎵",
        glow: "hover:border-cyan-400/50 hover:shadow-[0_15px_35px_rgba(34,211,238,0.3)]",
      };
    case "facebook":
      return {
        name: "Facebook",
        label: "View on Facebook",
        badgeBg: "bg-blue-600 text-white",
        icon: "📘",
        glow: "hover:border-blue-500/50 hover:shadow-[0_15px_35px_rgba(59,130,246,0.3)]",
      };
    case "youtube":
      return {
        name: "YouTube",
        label: "Watch on YouTube",
        badgeBg: "bg-red-600 text-white",
        icon: "▶️",
        glow: "hover:border-red-500/50 hover:shadow-[0_15px_35px_rgba(239,68,68,0.3)]",
      };
    case "other":
      return {
        name: "Social Post",
        label: "View Post",
        badgeBg: "bg-slate-800 text-white border border-white/20",
        icon: "🔗",
        glow: "hover:border-blue-400/50 hover:shadow-[0_15px_35px_rgba(96,165,250,0.3)]",
      };
    default:
      return null;
  }
}

export default function GalleryTab({
  images,
  onAdd,
  onEdit,
  onDelete,
}: {
  images: GalleryImage[];
  onAdd: () => void;
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}) {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredImages = images.filter((img) => {
    if (filterCategory === "all") return true;
    return img.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white">Store Gallery Items ({images.length})</h3>
          <p className="text-xs text-white/50 mt-1">
            Manage gallery photos & link each item to its original Instagram, TikTok, Facebook, or YouTube post.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload / Add Gallery Item
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {(["all", "shop", "repairs", "customers"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filterCategory === cat
                ? "bg-white text-slate-900 shadow"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat} ({cat === "all" ? images.length : images.filter((i) => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-white/60 text-sm">No gallery items found in this category.</p>
          <button
            onClick={onAdd}
            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all"
          >
            + Add Gallery Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((img) => {
            const platformMeta = getPlatformMeta(img.platform, img.post_url);

            return (
              <div
                key={img.id}
                className={`group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border transition-all ${
                  img.visible !== false ? "border-white/10 hover:border-white/30" : "border-red-500/30 opacity-60"
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.caption || `Gallery image`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center p-3">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(img)}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(img.id)}
                      className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {img.post_url && (
                      <a
                        href={img.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-blue-500/30 backdrop-blur-sm text-blue-300 hover:bg-blue-500/50 transition-all"
                        title="View Social Post"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                  {/* Category */}
                  {img.category && (
                    <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[9px] font-bold text-white/90 uppercase tracking-wider">
                      {img.category}
                    </span>
                  )}

                  {/* Social Platform Badge */}
                  {platformMeta && (
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ${platformMeta.badgeBg}`}>
                      <span>{platformMeta.icon}</span>
                      <span>{platformMeta.name}</span>
                    </span>
                  )}
                </div>

                {/* Bottom Title / Caption */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-white text-xs font-semibold truncate leading-tight">{img.title || img.caption}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HeroTab({
  slides,
  onAdd,
  onEdit,
  onDelete,
  onInitDefaults,
}: {
  slides: HeroSlide[];
  onAdd: () => void;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
  onInitDefaults: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Homepage Hero Slideshow</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Manage, reorder, or update your hero section background wallpapers ({slides.length} slides in database)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {slides.length === 0 && (
            <button
              onClick={onInitDefaults}
              className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-semibold hover:bg-emerald-500/30 transition-all active:scale-[0.98]"
            >
              + Load 4 Default Wallpapers to DB
            </button>
          )}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Hero Slide
          </button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-white/60 text-sm">
            No custom hero slides currently stored in database. The homepage is displaying the 4 default 4K wallpapers.
          </p>
          <button
            onClick={onInitDefaults}
            className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all"
          >
            Click here to import default wallpapers into Database to start editing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${
                slide.active !== false
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-white/5 border-red-500/30 opacity-60"
              }`}
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={slide.image_url}
                  alt={slide.alt || "Hero slide"}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-slide-1.png";
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white">
                    Order #{slide.sort_order}
                  </span>
                  <span
                    className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-xs font-semibold ${
                      slide.active !== false
                        ? "bg-emerald-500/80 text-white"
                        : "bg-red-500/80 text-white"
                    }`}
                  >
                    {slide.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(slide)}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                      title="Edit Slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(slide.id)}
                      className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate pr-2">
                  {slide.alt || "Street Mobile Hero Banner"}
                </p>
                <span className="text-xs text-white/40 flex-shrink-0">ID: {slide.id.slice(0, 6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
