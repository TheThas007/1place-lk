"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, AlertCircle, FolderTree, Plus, Trash2, Tag } from "lucide-react";
import { Category, Subcategory } from "@/lib/types";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Category | null;
  existingCategories?: Category[];
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories = [],
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    destination_url: "",
    sort_order: 0,
    status: "active",
    show_in_menu: true,
    is_featured_in_menu: false,
    show_on_homepage: true,
    description: "",
    parent_id: "",
    subcategories: [],
  });

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [newSubUrl, setNewSubUrl] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        name: initialData.name || "",
        slug: initialData.slug || "",
        destination_url: initialData.destination_url || `/products?category=${initialData.slug}`,
        status: initialData.status ?? "active",
        show_in_menu: initialData.show_in_menu ?? true,
        is_featured_in_menu: initialData.is_featured_in_menu ?? false,
        show_on_homepage: initialData.show_on_homepage ?? true,
        description: initialData.description || "",
        parent_id: initialData.parent_id || "",
        sort_order: initialData.sort_order || 0,
      });
      setSubcategories(initialData.subcategories || []);
    } else {
      setFormData({
        name: "",
        slug: "",
        destination_url: "",
        sort_order: (existingCategories?.length || 0) + 1,
        status: "active",
        show_in_menu: true,
        is_featured_in_menu: false,
        show_on_homepage: true,
        description: "",
        parent_id: "",
        subcategories: [],
      });
      setSubcategories([]);
    }
    setNewSubName("");
    setNewSubUrl("");
    setSlugError("");
  }, [initialData, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : autoSlug,
      destination_url: prev.destination_url || `/products?category=${autoSlug}`,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({
      ...prev,
      slug,
      destination_url: `/products?category=${slug}`,
    }));

    // Check duplicate slug
    const duplicate = existingCategories.find(
      (c) => c.slug?.toLowerCase() === slug && c.id !== initialData?.id
    );
    if (duplicate) {
      setSlugError(`Slug "${slug}" is already used by "${duplicate.name}"`);
    } else {
      setSlugError("");
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return;
    const subSlug = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newSub: Subcategory = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newSubName.trim(),
      slug: subSlug,
      parent_category_id: initialData?.id || formData.slug || "temp",
      parent_category_slug: formData.slug || "",
      destination_url: newSubUrl.trim() || `/products?category=${formData.slug}&subcategory=${subSlug}`,
      sort_order: subcategories.length + 1,
      status: "active",
    };
    setSubcategories((prev) => [...prev, newSub]);
    setNewSubName("");
    setNewSubUrl("");
  };

  const handleRemoveSubcategory = (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      alert("Please fill in Category Name and Slug.");
      return;
    }

    if (slugError) {
      alert("Please fix the duplicate slug error.");
      return;
    }

    setIsLoading(true);
    try {
      const categoryId = initialData?.id || `cat-${formData.slug}-${Date.now().toString().slice(-4)}`;
      
      const payload: Category = {
        id: categoryId,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        destination_url: formData.destination_url?.trim() || `/products?category=${formData.slug.trim()}`,
        description: formData.description?.trim() || "",
        sort_order: Number(formData.sort_order) || 0,
        status: formData.status || "active",
        show_in_menu: formData.show_in_menu ?? true,
        is_featured_in_menu: formData.is_featured_in_menu ?? false,
        show_on_homepage: formData.show_on_homepage ?? true,
        parent_id: formData.parent_id || "",
        subcategories: subcategories.map((s, idx) => ({
          ...s,
          parent_category_id: categoryId,
          parent_category_slug: formData.slug,
          sort_order: idx + 1,
        })),
        // Legacy fallback properties to preserve compatibility
        icon: initialData?.icon || "",
        image_url: initialData?.image_url || "",
      };

      await setDoc(doc(db, "categories", categoryId), payload, { merge: true });
      onSave();
      onClose();
    } catch (err) {
      console.error("Save Category Error:", err);
      alert("Failed to save category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-1 border border-blue-500/20">
              <FolderTree className="w-3.5 h-3.5" />
              <span>TEXT-ONLY CATEGORY ARCHITECTURE</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {initialData ? "Edit Category" : "Add New Category"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Smartphones"
                value={formData.name || ""}
                onChange={handleNameChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="e.g. smartphones"
                value={formData.slug || ""}
                onChange={handleSlugChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
              {slugError && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {slugError}
                </p>
              )}
            </div>
          </div>

          {/* Destination URL & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-white/80">Destination URL</label>
              <input
                type="text"
                placeholder="/products?category=smartphones"
                value={formData.destination_url || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, destination_url: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">Display Order</label>
              <input
                type="number"
                value={formData.sort_order ?? 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Short Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description for SEO and catalog filters..."
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Visibility & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.status === "active"}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked ? "active" : "inactive" }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white/10 border-white/20"
              />
              <span className="text-xs font-bold text-white">Active Status</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.show_in_menu !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, show_in_menu: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white/10 border-white/20"
              />
              <span className="text-xs font-bold text-white">Mega Menu (Col 1)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_featured_in_menu === true}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_featured_in_menu: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white/10 border-white/20"
              />
              <span className="text-xs font-bold text-white">Featured Badge</span>
            </label>
          </div>

          {/* Subcategories Management */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Nested Subcategories ({subcategories.length})</span>
              </label>
              <span className="text-[11px] text-white/40">Appears in Mega Menu Column 2</span>
            </div>

            {/* Existing Subcategories List */}
            {subcategories.length > 0 && (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {subcategories.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="flex items-center justify-between bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white truncate">{sub.name}</span>
                      <span className="text-white/40 font-mono text-[10px] truncate max-w-[180px]">
                        {sub.destination_url}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove subcategory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Subcategory Input */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
              <input
                type="text"
                placeholder="Subcategory name (e.g. iPhones)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Custom URL (optional)"
                value={newSubUrl}
                onChange={(e) => setNewSubUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sub
              </button>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Save Category
          </button>
        </div>

      </div>
    </div>
  );
}
