"use client";

import React from "react";
import { Category } from "@/lib/types";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";

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
  const [isFixing, setIsFixing] = React.useState(false);
  const [fixMessage, setFixMessage] = React.useState<string | null>(null);

  const cleanCategories = React.useMemo(() => {
    return categories.filter((c) => {
      const cName = (c.name || "").toLowerCase();
      const cSlug = (c.slug || "").toLowerCase();
      return !KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
    });
  }, [categories]);

  const handleFixClassification = async () => {
    if (!confirm("This will safely check all products in database and separate mixed Category (Smartphones, Watches, Laptops) & Brand (Apple, Samsung, Honor) fields. Proceed?")) return;
    setIsFixing(true);
    setFixMessage("Fixing product category & brand fields...");
    try {
      const res = await fetch("/api/admin/migrate-categories", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setFixMessage(`✅ Success! Updated ${data.updatedCount || 0} products cleanly.`);
        setTimeout(() => {
          setFixMessage(null);
          window.location.reload();
        }, 3000);
      } else {
        alert("Failed to fix products: " + data.error);
        setFixMessage(null);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
      setFixMessage(null);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Product Categories Management</h3>
          <p className="text-xs text-white/50 mt-0.5">
            {cleanCategories.length} categories · Categories classify product types (Smartphones, Smart Watches, Laptops, Earbuds, Chargers, etc.). Genuine manufacturers (Apple, Samsung, Honor, etc.) are in the Brands tab.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFixClassification}
            disabled={isFixing}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Auto-separate mixed Category & Brand names on existing products"
          >
            {isFixing ? "Fixing..." : "⚡ Auto-Fix Mixed Category & Brands"}
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {fixMessage && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold animate-in fade-in">
          {fixMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cleanCategories.map((cat) => (
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

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {cat.show_on_homepage !== false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Homepage
                    </span>
                  ) : null}
                  {cat.show_in_selector !== false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Selector
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-90 hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(cat)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all shadow-xs"
                  aria-label="Edit category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(cat.id!)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all shadow-xs"
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
