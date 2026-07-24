"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Categories Tab ─── */
function CategoriesTab({ 
  categories,
  onAdd,
  onEdit,
  onDelete
}: { 
  categories: Category[],
  onAdd: () => void,
  onEdit: (category: Category) => void,
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All Categories</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden shrink-0">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{cat.icon}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("data:")) ? (
                    <img src={cat.icon} className="w-5 h-5 object-contain rounded bg-white p-0.5" />
                  ) : (
                    <span>{cat.icon || "📱"}</span>
                  )}
                  {cat.name}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  /{cat.slug} · Order: {cat.sort_order}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(cat)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(cat.id!)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

