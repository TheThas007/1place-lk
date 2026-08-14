"use client";

import React, { useState, useMemo } from "react";
import { Category, Product } from "@/lib/types";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Eye, ArrowUp, ArrowDown, Copy, EyeOff, FolderOpen, AlertTriangle, ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";

interface CategoriesTabProps {
  categories: Category[];
  products?: Product[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoriesTab({
  categories,
  products = [],
  onAdd,
  onEdit,
  onDelete,
}: CategoriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "homepage">("all");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deleteWarningCategory, setDeleteWarningCategory] = useState<{ cat: Category; linkedCount: number } | null>(null);

  // Clean Categories filter
  const cleanCategories = useMemo(() => {
    const filtered = categories.filter((c) => {
      const cName = (c.name || "").toLowerCase();
      const cSlug = (c.slug || "").toLowerCase();
      return !KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
    });
    return filtered.length > 0 ? filtered : categories;
  }, [categories]);

  // Filtered & Sorted Categories List
  const displayedCategories = useMemo(() => {
    return cleanCategories
      .filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q));

        if (!matchesSearch) return false;

        if (statusFilter === "active") return c.status !== "inactive";
        if (statusFilter === "inactive") return c.status === "inactive";
        if (statusFilter === "homepage") return c.show_on_homepage !== false;

        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [cleanCategories, searchQuery, statusFilter]);

  // Toggle Visibility Status directly on card
  const handleToggleVisibility = async (cat: Category) => {
    const updatedStatus = cat.show_on_homepage !== false ? false : true;
    try {
      await setDoc(doc(db, "categories", cat.id), { show_on_homepage: updatedStatus }, { merge: true });
      cat.show_on_homepage = updatedStatus;
      window.location.reload();
    } catch (e) {
      console.error("Error toggling category visibility:", e);
      alert("Failed to update visibility.");
    }
  };

  // Reordering Up / Down
  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= displayedCategories.length) return;

    const currentCat = displayedCategories[index];
    const targetCat = displayedCategories[targetIndex];

    const currentOrder = currentCat.sort_order || index;
    const targetOrder = targetCat.sort_order || targetIndex;

    try {
      await setDoc(doc(db, "categories", currentCat.id), { sort_order: targetOrder }, { merge: true });
      await setDoc(doc(db, "categories", targetCat.id), { sort_order: currentOrder }, { merge: true });
      window.location.reload();
    } catch (e) {
      console.error("Reorder error:", e);
    }
  };

  // Duplicate Category
  const handleDuplicate = async (cat: Category) => {
    const dupName = `${cat.name} (Copy)`;
    const dupSlug = `${cat.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newCatData = {
      ...cat,
      name: dupName,
      slug: dupSlug,
      sort_order: (cat.sort_order || 0) + 1,
    };
    delete (newCatData as any).id;

    try {
      await addDoc(collection(db, "categories"), newCatData);
      window.location.reload();
    } catch (e) {
      console.error("Duplicate error:", e);
      alert("Failed to duplicate category.");
    }
  };

  // Safe Delete Trigger with Linked Product Check
  const triggerDeleteCheck = (cat: Category) => {
    const categoryName = cat.name || "";
    const categorySlug = cat.slug || "";
    const linkedProducts = products.filter(
      (p) =>
        p.category_id === cat.id ||
        p.category_id === categorySlug ||
        p.category_name?.toLowerCase() === categoryName.toLowerCase()
    );

    if (linkedProducts.length > 0) {
      setDeleteWarningCategory({ cat, linkedCount: linkedProducts.length });
    } else {
      if (confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
        onDelete(cat.id);
      }
    }
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Top Header (Dark Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-500/20">
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>HOMEPAGE NAVIGATION</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Shop by Category Manager</h3>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Manage, reorder, and customize the category carousel sections on your homepage ({cleanCategories.length} categories).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/10 shadow-xs"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            Live Section Preview
          </button>
          
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search category by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Categories" },
            { id: "homepage", label: "Shown on Homepage" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Admin Category Cards Grid (Dark Theme) */}
      {displayedCategories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0F172A] border border-white/10 space-y-3">
          <p className="text-white/50 text-sm font-semibold">No matching categories found.</p>
          <button
            onClick={onAdd}
            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all"
          >
            + Create New Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedCategories.map((cat, idx) => {
            const linkedProductsCount = products.filter(
              (p) =>
                p.category_id === cat.id ||
                p.category_id === cat.slug ||
                p.category_name?.toLowerCase() === cat.name.toLowerCase()
            ).length;

            return (
              <div
                key={cat.id || idx}
                className={`bg-[#0F172A] border rounded-2xl p-5 transition-all shadow-md hover:border-white/20 relative flex flex-col justify-between ${
                  cat.show_on_homepage !== false ? "border-white/10" : "border-white/5 bg-[#0F172A]/50 opacity-60"
                }`}
              >
                {/* Top Section */}
                <div className="flex items-start gap-4">
                  
                  {/* Category Icon Container */}
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.icon_alt_text || cat.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{cat.icon || "📱"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-extrabold text-white truncate">{cat.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                        Order #{cat.sort_order ?? idx}
                      </span>
                    </div>

                    <p className="text-xs text-white/40 font-mono truncate">
                      /{cat.slug}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                        {linkedProductsCount} Products
                      </span>

                      {cat.show_on_homepage !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Homepage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-white/40 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                          <EyeOff className="w-3 h-3 text-white/40" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, "down")}
                      disabled={idx === displayedCategories.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(cat)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        cat.show_on_homepage !== false
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10 text-white"
                      }`}
                      title={cat.show_on_homepage !== false ? "Hide from Homepage" : "Show on Homepage"}
                    >
                      {cat.show_on_homepage !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(cat)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                      title="Duplicate Category"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold transition-colors flex items-center gap-1 border border-blue-500/30"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerDeleteCheck(cat)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Deletion Warning Modal (Dark Theme) */}
      {deleteWarningCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-3 text-red-400 border-b border-white/10 pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-lg text-white">Deletion Blocked</h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Cannot delete category <strong>&quot;{deleteWarningCategory.cat.name}&quot;</strong> because{" "}
              <span className="font-extrabold text-white">{deleteWarningCategory.linkedCount} product(s)</span> are currently assigned to it.
            </p>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Recommended Safer Alternative:
              </p>
              <p className="text-[11px] text-amber-300/80">
                Hide this category from the homepage instead of deleting to keep product listings safe.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteWarningCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:bg-white/10 text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleToggleVisibility(deleteWarningCategory.cat);
                  setDeleteWarningCategory(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
              >
                Hide From Homepage Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Homepage Category Carousel Section Preview Modal (Dark Theme) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" /> Live Homepage Category Carousel Preview
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 text-white/40 hover:text-white rounded-xl">
                ✕
              </button>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
                HOMEPAGE LIVE CAROUSEL PREVIEW
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedCategories.filter(c => c.show_on_homepage !== false).map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-white/5 p-2 flex items-center justify-center overflow-hidden">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{cat.icon || "📱"}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
