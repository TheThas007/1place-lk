"use client";

import React, { useState, useMemo } from "react";
import { Category, Product } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  FolderOpen,
  AlertTriangle,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";
import { useAdminTheme } from "@/app/admin/dashboard/layout";

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
  const { isLight } = useAdminTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "homepage">("all");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deleteWarningCategory, setDeleteWarningCategory] = useState<{ cat: Category; linkedCount: number } | null>(null);

  // Clean Categories filter (excluding migration audit known brand names and deduplicating logical categories)
  const cleanCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: Category[] = [];
    (categories || []).forEach((c) => {
      const cName = (c.name || "").trim().toLowerCase();
      const cSlug = (c.slug || "").trim().toLowerCase();
      if (!cName) return;
      if (KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug)) {
        return;
      }
      if (!seen.has(cName)) {
        seen.add(cName);
        result.push(c);
      }
    });
    return result.length > 0 ? result : categories;
  }, [categories]);

  // Filtered & Sorted Categories List
  const displayedCategories = useMemo(() => {
    return cleanCategories
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
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
    <div
      className={`space-y-5 animate-fadeIn ${
        isLight ? "text-slate-900" : "text-[#F8FAFC]"
      }`}
    >
      {/* ──────────────────────────────────────────────────────────
          1. PAGE HEADER
          ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isLight
                ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                : "bg-blue-600/10 text-blue-500 border border-blue-500/20"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1
              className={`text-2xl font-bold tracking-tight ${
                isLight ? "text-slate-900" : "text-[#F8FAFC]"
              }`}
            >
              Shop by Category
            </h1>
            <p
              className={`text-[13px] font-normal mt-0.5 ${
                isLight ? "text-slate-500" : "text-[#94A3B8]"
              }`}
            >
              Manage, reorder, and customize the category sections on your homepage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              isLight
                ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                : "bg-[#121A25] hover:bg-[#1A2535] text-[#F8FAFC] border-white/[0.08]"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Section Preview</span>
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. SEARCH + FILTER TOOLBAR
          ────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-2.5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isLight
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-[#0E141D] border-white/[0.08]"
        }`}
      >
        {/* Left: Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isLight ? "text-slate-400" : "text-[#94A3B8]"
            }`}
          />
          <input
            type="text"
            placeholder="Search category by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none transition-colors ${
              isLight
                ? "text-slate-900 placeholder-slate-400 focus:bg-slate-50"
                : "text-[#F8FAFC] placeholder-slate-500 focus:bg-white/[0.03]"
            }`}
          />
        </div>

        {/* Right: Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Categories" },
            { id: "homepage", label: "Shown on Homepage" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((f) => {
            const isActive = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                    : isLight
                    ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-[#121A25] hover:bg-[#1A2535] text-[#94A3B8] hover:text-[#F8FAFC] border-white/[0.08]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. CATEGORY COUNT
          ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs px-1">
        <span
          className={`font-medium ${
            isLight ? "text-slate-500" : "text-[#94A3B8]"
          }`}
        >
          {cleanCategories.length} Categories
          {displayedCategories.length !== cleanCategories.length &&
            ` (${displayedCategories.length} matching filter)`}
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. CATEGORY GRID (3 columns desktop, 2 tablet, 1 mobile)
          ────────────────────────────────────────────────────────── */}
      {displayedCategories.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border ${
            isLight
              ? "bg-white border-slate-200 text-slate-500"
              : "bg-[#0E141D] border-white/[0.08] text-slate-400"
          }`}
        >
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-semibold">No matching categories found</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto opacity-70">
            No categories match your search or filter. Try clearing the search query or adding a new category.
          </p>
          <button
            onClick={onAdd}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            + Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCategories.map((cat, idx) => {
            const linkedProductsCount = products.filter(
              (p) =>
                p.category_id === cat.id ||
                p.category_id === cat.slug ||
                p.category_name?.toLowerCase() === cat.name.toLowerCase()
            ).length;

            const isShownOnHomepage = cat.show_on_homepage !== false;

            return (
              <div
                key={cat.id || idx}
                className={`group rounded-2xl p-4.5 border flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm"
                    : "bg-[#0E141D] border-white/[0.08] hover:bg-[#121A25] hover:border-white/[0.16]"
                } ${!isShownOnHomepage ? "opacity-75" : ""}`}
              >
                <div>
                  {/* Top Bar: Order badge + Homepage status tag (TEXT ONLY, NO ICONS/IMAGES) */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider ${
                        isLight
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-white/5 text-[#94A3B8] border border-white/[0.08]"
                      }`}
                    >
                      Order #{cat.sort_order ?? idx}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        isShownOnHomepage
                          ? isLight
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : isLight
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : "bg-white/5 text-slate-500 border-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isShownOnHomepage ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{isShownOnHomepage ? "Homepage" : "Hidden"}</span>
                    </span>
                  </div>

                  {/* Category Name: 15-16px semibold */}
                  <h3
                    className={`text-[15px] font-semibold tracking-tight mt-3 leading-snug truncate uppercase ${
                      isLight ? "text-slate-900" : "text-[#F8FAFC]"
                    }`}
                    title={cat.name}
                  >
                    {cat.name}
                  </h3>

                  {/* Slug: muted 11-12px text */}
                  <p
                    className={`text-xs font-mono truncate mt-0.5 ${
                      isLight ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    /{cat.slug}
                  </p>

                  {/* Metadata: Product count & Homepage status */}
                  <div className="flex items-center gap-3.5 mt-3 text-xs">
                    {/* Products count badge */}
                    <span
                      className={`font-medium ${
                        isLight ? "text-slate-600" : "text-[#94A3B8]"
                      }`}
                    >
                      {linkedProductsCount} Products
                    </span>

                    {/* Homepage status indicator */}
                    <span
                      className={`inline-flex items-center gap-1.5 font-medium ${
                        isShownOnHomepage
                          ? isLight
                            ? "text-emerald-600"
                            : "text-[#10B981]"
                          : isLight
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isShownOnHomepage
                            ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                            : "bg-slate-500"
                        }`}
                      />
                      <span>
                        {isShownOnHomepage ? "Homepage" : "Hidden"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Reorder (Left) & Actions (Right) */}
                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                    isLight ? "border-slate-100" : "border-white/[0.08]"
                  }`}
                >
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, "up")}
                      disabled={idx === 0}
                      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300"
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, "down")}
                      disabled={idx === displayedCategories.length - 1}
                      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300"
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(cat)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isShownOnHomepage
                          ? isLight
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : isLight
                          ? "bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600"
                          : "bg-white/[0.04] text-slate-500 border-white/[0.08] hover:text-slate-300"
                      }`}
                      title={
                        isShownOnHomepage
                          ? "Hide from Homepage"
                          : "Show on Homepage"
                      }
                    >
                      {isShownOnHomepage ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(cat)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300"
                      }`}
                      title="Duplicate Category"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-[#141E2B] hover:bg-[#1C2A3C] text-slate-300 hover:text-white border-white/[0.08]"
                      }`}
                      title="Edit Category"
                    >
                      <Edit2 className="w-3 h-3 text-blue-400" />
                      <span>Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => triggerDeleteCheck(cat)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
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

      {/* ──────────────────────────────────────────────────────────
          SAFETY DELETION WARNING MODAL
          ────────────────────────────────────────────────────────── */}
      {deleteWarningCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl p-6 space-y-4 border shadow-2xl transition-all ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0E141D] border-white/[0.12] text-[#F8FAFC]"
            }`}
          >
            <div
              className={`flex items-center gap-3 pb-3 border-b ${
                isLight ? "border-slate-100" : "border-white/[0.08]"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Category Deletion Warning</h3>
            </div>

            <p
              className={`text-xs leading-relaxed ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              Category <strong>&quot;{deleteWarningCategory.cat.name}&quot;</strong> has{" "}
              <span className="font-bold text-blue-400">
                {deleteWarningCategory.linkedCount} product(s)
              </span>{" "}
              assigned to it.
            </p>

            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isLight
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-300"
              }`}
            >
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Note</span>
              </p>
              <p className="text-[11px] opacity-80">
                You can hide this category from the homepage or permanently delete it. Linked products will remain safe in inventory.
              </p>
            </div>

            <div
              className={`flex flex-wrap items-center justify-end gap-2 pt-3 border-t ${
                isLight ? "border-slate-100" : "border-white/[0.08]"
              }`}
            >
              <button
                type="button"
                onClick={() => setDeleteWarningCategory(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleToggleVisibility(deleteWarningCategory.cat);
                  setDeleteWarningCategory(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-[#141E2B] hover:bg-[#1C2A3C] text-slate-200 border-white/10"
                }`}
              >
                Hide From Homepage
              </button>
              <button
                type="button"
                onClick={() => {
                  const catId = deleteWarningCategory.cat.id;
                  setDeleteWarningCategory(null);
                  onDelete(catId);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          LIVE HOMEPAGE CATEGORY CAROUSEL PREVIEW MODAL
          ────────────────────────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-4 border shadow-2xl ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0E141D] border-white/[0.12] text-[#F8FAFC]"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-100" : "border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isLight
                      ? "bg-blue-50 text-blue-600"
                      : "bg-blue-600/10 text-blue-500"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">
                  Live Homepage Category Carousel Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isLight
                  ? "bg-slate-50 border-slate-200"
                  : "bg-[#080C12] border-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Homepage Carousel Preview
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {
                    displayedCategories.filter((c) => c.show_on_homepage !== false)
                      .length
                  }{" "}
                  categories active on homepage
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {displayedCategories
                  .filter((c) => c.show_on_homepage !== false)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-xl border text-center space-y-2 transition-all ${
                        isLight
                          ? "bg-white border-slate-200 shadow-sm"
                          : "bg-[#0E141D] border-white/[0.08]"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 mx-auto rounded-xl border p-2 flex items-center justify-center overflow-hidden ${
                          isLight
                            ? "bg-slate-50 border-slate-200 text-slate-700"
                            : "bg-[#121A25] border-white/[0.08] text-slate-300"
                        }`}
                      >
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{cat.icon || "📱"}</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold block truncate">
                        {cat.name}
                      </span>
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
