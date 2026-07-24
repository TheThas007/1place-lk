"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Gallery Tab ─── */
function GalleryTab({ 
  images, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  images: GalleryImage[]; 
  onAdd: () => void; 
  onEdit: (image: GalleryImage) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Gallery Images</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {images.length} images
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5"
          >
            <img
              src={img.image_url}
              alt={img.caption || `Gallery image`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(img)}
                  className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(img.id)}
                  className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {img.category && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-medium text-white/90 uppercase tracking-wider">
                {img.category}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroTab({
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

