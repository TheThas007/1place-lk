"use client";

import React from "react";
import { HeroSlide } from "@/lib/types";
import { Plus, Edit, Trash2, Sparkles, CheckCircle2, XCircle, Image as ImageIcon, Copy, ArrowUp, ArrowDown } from "lucide-react";

interface HeroTabProps {
  slides: HeroSlide[];
  onAdd: () => void;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (slide: HeroSlide) => void;
  onToggleStatus?: (id: string, active: boolean) => void;
  onReorder?: (id: string, direction: "up" | "down") => void;
}

export default function HeroTab({ slides, onAdd, onEdit, onDelete, onDuplicate, onToggleStatus, onReorder }: HeroTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Homepage Hero Slider Manager
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Add, edit, reorder, duplicate and manage full-width Apple-style hero banner slides
          </p>
        </div>

        <button
          onClick={onAdd}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide Banner
        </button>
      </div>

      {/* Grid of Slides */}
      {slides.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-white/5">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white/60">No custom hero slides added yet.</p>
          <p className="text-xs text-white/40 mt-1">Default storefront wallpapers are currently active on the homepage.</p>
          <button
            onClick={onAdd}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Upload First Hero Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl"
            >
              {/* Media Preview Box */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.alt || "Hero slide preview"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: slide.desktop_image_position || "center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Active Toggle Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleStatus?.(slide.id, slide.active === false)}
                    className="cursor-pointer transition-transform active:scale-95"
                  >
                    {slide.active !== false ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1 shadow-md hover:bg-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-700 text-white/70 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 hover:bg-zinc-600">
                        <XCircle className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </button>
                </div>

                {/* Reorder & Sorting Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-white/80 font-mono font-bold px-1">#{slide.sort_order ?? idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onReorder?.(slide.id, "up")}
                    disabled={idx === 0}
                    className="p-1 text-white/60 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorder?.(slide.id, "down")}
                    disabled={idx === slides.length - 1}
                    className="p-1 text-white/60 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white truncate">{slide.heading || slide.alt || "Hero Banner Slide"}</h4>
                  <p className="text-xs text-white/40 mt-1 truncate">{slide.description || slide.image_url}</p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(slide)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDuplicate?.(slide)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 text-xs font-semibold transition-all cursor-pointer"
                      title="Duplicate Slide"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" /> Copy
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(slide.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
