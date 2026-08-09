"use client";

import React from "react";
import { Category } from "@/lib/types";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

interface CategoriesTabProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoriesTab({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Categories Management</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {categories.length} total categories
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
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] transition-all group relative flex flex-col justify-between"
          >
            <div className="flex items-center gap-4">
              {/* Circular selector preview container */}
              <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-[#F5F5F7] p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-lg">{cat.icon || "📱"}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                  {cat.status === "inactive" ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold border border-red-500/30">
                      Inactive
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/40 mt-1 truncate">
                  /{cat.slug} · Order: {cat.sort_order ?? 0}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {cat.show_in_selector !== false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Selector Bar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/40 font-medium bg-white/5 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3 h-3" /> Selector Hidden
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(cat)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  aria-label="Edit category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(cat.id!)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all"
                  aria-label="Delete category"
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
