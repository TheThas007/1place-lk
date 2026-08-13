"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Link as LinkIcon, Eye } from "lucide-react";
import { Category } from "@/lib/types";
import { db } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, initialData }: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    icon: "",
    image_url: "",
    sort_order: 0,
    group: "product_categories",
    status: "active",
    show_in_selector: true,
    show_on_homepage: true,
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        status: initialData.status ?? "active",
        show_in_selector: initialData.show_in_selector ?? true,
        show_on_homepage: initialData.show_on_homepage ?? true,
        description: initialData.description || "",
      });
      setImagePreview(initialData.image_url || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        icon: "",
        image_url: "",
        sort_order: 0,
        group: "product_categories",
        status: "active",
        show_in_selector: true,
        show_on_homepage: true,
        description: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: "" });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, name, slug: formData.slug || slug });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image_url || "";

      if (imageFile) {
        finalImageUrl = await uploadImageWithFallback(imageFile, "categories");
      }

      if (!finalImageUrl) {
        finalImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop";
      }

      const categoryData = {
        ...formData,
        image_url: finalImageUrl,
        status: formData.status || "active",
        show_in_selector: formData.show_in_selector !== false,
        show_on_homepage: formData.show_on_homepage !== false,
        description: formData.description || "",
      };

      if (initialData && initialData.id) {
        await updateDoc(doc(db, "categories", initialData.id), categoryData);
      } else {
        await addDoc(collection(db, "categories"), categoryData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-white/10 p-5 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {initialData ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Live Homepage Category Card Preview */}
          <div className="text-center pb-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Homepage Card Preview
            </p>
            <div className="max-w-[180px] mx-auto p-4 rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-neutral-50 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="text-2xl">{formData.icon || "📱"}</span>
                )}
              </div>
              <span className="text-xs font-bold text-neutral-900 truncate w-full text-center">
                {formData.name || "Category Name"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Category Name *</label>
              <input
                required
                type="text"
                value={formData.name || ""}
                onChange={handleNameChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Slug *</label>
              <input
                required
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
            <input
              type="text"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Find the best mobile phones and accessories."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Status</label>
              <select
                value={formData.status || "active"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Group</label>
              <select
                value={formData.group || "product_categories"}
                onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-[11px] outline-none"
              >
                <option value="product_categories">Product Categories</option>
                <option value="phones">Smartphones & Devices</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div>
                <p className="text-xs font-bold text-white">Show on Homepage</p>
                <p className="text-[11px] text-white/40">Display in Shop by Category homepage section</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_on_homepage !== false}
                onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div>
                <p className="text-xs font-bold text-white">Show in Category Selector Bar</p>
                <p className="text-[11px] text-white/40">Display in circular category filter bar on Shop page</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_in_selector !== false}
                onChange={(e) => setFormData({ ...formData, show_in_selector: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Image / Icon */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white/70">Category Image (PNG / WebP / SVG)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="categoryImgUpload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="categoryImgUpload"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload Image
              </label>
              <input
                type="url"
                placeholder="Or image URL (https://...)"
                value={formData.image_url || ""}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-900 pt-3 pb-1 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
