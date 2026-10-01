"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Link as LinkIcon, Eye, Sparkles, Image as ImageIcon, Check, AlertCircle, Copy } from "lucide-react";
import { Category } from "@/lib/types";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { uploadImageWithFallback } from "@/lib/upload-utils";
import {
  normalizeCategoryName,
  generateCategorySlug,
  getCategoryDocId,
  formatCategoryTitle,
  isCategoryDuplicate,
  checkCategoryExistsInDb,
} from "@/lib/category-utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Category | null;
  existingCategories?: Category[];
}

const ICON_PRESETS = [
  { icon: "📱", label: "Smartphones" },
  { icon: "📞", label: "Feature Phones" },
  { icon: "💻", label: "Laptops" },
  { icon: "⌚", label: "Smart Watches" },
  { icon: "🎧", label: "Earbuds & Audio" },
  { icon: "🔋", label: "Power Banks" },
  { icon: "🔌", label: "Chargers & Cables" },
  { icon: "🛡️", label: "Cases & Protection" },
  { icon: "🔧", label: "Repair Services" },
  { icon: "🎮", label: "Gaming Devices" },
  { icon: "📷", label: "Cameras & Memory" },
  { icon: "🔊", label: "Bluetooth Speakers" },
];

function validateImageUrl(url?: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { isValid: true };
  }
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith("https://") && !cleanUrl.startsWith("http://")) {
    return { isValid: false, error: "URL must start with https:// or http://" };
  }
  if (cleanUrl.includes(".html") || cleanUrl.includes("wikipedia.org") || cleanUrl.includes("amazon.com/dp")) {
    return { isValid: false, error: "Please enter a direct image/SVG URL ending in .png, .svg, .webp or .jpg (not an HTML webpage)." };
  }
  try {
    new URL(cleanUrl);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
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
    icon: "📱",
    image_url: "",
    hover_icon_url: "",
    icon_alt_text: "",
    link_destination: "",
    target_category_id: "",
    sort_order: 0,
    group: "product_categories",
    status: "active",
    show_in_selector: true,
    show_on_homepage: true,
    description: "",
  });

  const [iconSourceMode, setIconSourceMode] = useState<"file" | "url">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [urlValidationError, setUrlValidationError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        icon: initialData.icon || "📱",
        hover_icon_url: initialData.hover_icon_url || "",
        icon_alt_text: initialData.icon_alt_text || `${initialData.name} Icon`,
        link_destination: initialData.link_destination || `/categories/${initialData.slug}`,
        target_category_id: initialData.target_category_id || initialData.id || "",
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
        icon: "📱",
        image_url: "",
        hover_icon_url: "",
        icon_alt_text: "",
        link_destination: "",
        target_category_id: "",
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
    setImageError("");
    setUrlValidationError("");
    setFormError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 307200) { // 300 KB limit
        setImageError("File exceeds recommended 300 KB limit. Please compress image.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image_url: "" }));
    }
  };

  const handleUrlInputChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
    if (!imageFile) setImagePreview(url);

    const val = validateImageUrl(url);
    if (!val.isValid) {
      setUrlValidationError(val.error || "Invalid URL");
    } else {
      setUrlValidationError("");
      setImageError("");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const newSlug = generateCategorySlug(rawVal);
    setFormData((prev) => ({
      ...prev,
      name: rawVal,
      slug: prev.slug && prev.slug !== generateCategorySlug(prev.name) ? prev.slug : newSlug,
      icon_alt_text: `${rawVal} Icon`,
      link_destination: `/categories/${newSlug}`,
    }));
    setFormError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (isLoading) return; // Prevent double click

    const rawName = (formData.name || "").trim();
    if (!rawName) {
      setFormError("Category name is required.");
      return;
    }

    if (urlValidationError) {
      setFormError("Please fix the image URL error before saving.");
      return;
    }

    const cleanTitle = formatCategoryTitle(rawName);
    const slugVal = generateCategorySlug(formData.slug || rawName);

    // 1. Client-Side Duplicate Validation
    const localDup = isCategoryDuplicate(
      cleanTitle,
      slugVal,
      existingCategories,
      initialData?.id
    );
    if (localDup.isDuplicate) {
      setFormError(localDup.reason || "Category already exists.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Server/Database-level Duplicate & Race Condition Check
      const dbDup = await checkCategoryExistsInDb(
        db,
        cleanTitle,
        slugVal,
        initialData?.id
      );
      if (dbDup.exists) {
        setFormError(dbDup.reason || "Category already exists in database.");
        setIsLoading(false);
        return;
      }

      let finalImageUrl = formData.image_url || "";

      if (imageFile) {
        finalImageUrl = await uploadImageWithFallback(imageFile, "categories");
      }

      const targetId = initialData?.id || getCategoryDocId(slugVal);

      const categoryData: Omit<Category, "id"> = {
        name: cleanTitle,
        slug: slugVal,
        icon: formData.icon || "📱",
        image_url: finalImageUrl,
        hover_icon_url: formData.hover_icon_url ? formData.hover_icon_url.trim() : "",
        icon_alt_text: formData.icon_alt_text ? formData.icon_alt_text.trim() : `${cleanTitle} Icon`,
        link_destination: formData.link_destination ? formData.link_destination.trim() : `/categories/${slugVal}`,
        target_category_id: formData.target_category_id || "",
        sort_order: Number(formData.sort_order) || 0,
        mobile_sort_order: Number(formData.sort_order) || 0,
        group: (formData.group as any) || "product_categories",
        status: formData.status || "active",
        show_in_selector: formData.show_in_selector !== false,
        show_on_homepage: formData.show_on_homepage !== false,
        description: formData.description ? formData.description.trim() : "",
      };

      await setDoc(doc(db, "categories", targetId), { ...categoryData, id: targetId }, { merge: true });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      setFormError("Failed to save category. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl text-white">
        
        {/* Modal Header (Dark Theme) */}
        <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-extrabold text-[10px] uppercase tracking-wider border border-blue-500/20">
              SHOP BY CATEGORY MANAGER
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {initialData ? `Edit Category: ${initialData.name}` : "Add Homepage Category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {formError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-400 text-xs font-semibold animate-shake shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}
          
          {/* Live Card Preview */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Live Homepage Category Preview
            </p>
            <div className="max-w-[190px] mx-auto p-4 rounded-2xl border border-white/10 bg-white/5 shadow-lg flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-black/40 rounded-2xl p-2 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.icon_alt_text || "Preview"}
                    className="w-full h-full object-contain"
                    onError={() => setImageError("Image failed to load. Check URL or upload a valid file.")}
                  />
                ) : (
                  <span className="text-3xl">{formData.icon || "📱"}</span>
                )}
              </div>
              <div className="text-center w-full">
                <span className="text-xs font-black text-white truncate block">
                  {formData.name || "Category Name"}
                </span>
                <span className="text-[10px] text-white/40 font-mono block truncate">
                  {formData.link_destination || `/categories/${formData.slug || "slug"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Category Display Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Category Display Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Smart Watches"
                value={formData.name || ""}
                onChange={handleNameChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Category Slug *
              </label>
              <input
                required
                type="text"
                placeholder="smart-watches"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Link Destination & Target Product Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Link Destination URL
              </label>
              <input
                type="text"
                placeholder="/categories/smart-watches"
                value={formData.link_destination || ""}
                onChange={(e) => setFormData({ ...formData, link_destination: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Linked Product Category Filter
              </label>
              <select
                value={formData.target_category_id || ""}
                onChange={(e) => setFormData({ ...formData, target_category_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none focus:border-blue-500"
              >
                <option value="" className="bg-[#0F172A] text-white">-- Match Catalog Category --</option>
                {existingCategories.map((c) => (
                  <option key={c.id || c.slug} value={c.id || c.slug} className="bg-[#0F172A] text-white">
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Source Selector: Upload File or Image URL */}
          <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" /> Icon Source Selector
                </h4>
                {(imagePreview || formData.image_url) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                      setFormData({ ...formData, image_url: "" });
                    }}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                  >
                    <X className="w-3.5 h-3.5" /> Remove / Clear Image
                  </button>
                )}
              </div>
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIconSourceMode("file")}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    iconSourceMode === "file" ? "bg-blue-600 text-white shadow-xs" : "text-white/60 hover:text-white"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setIconSourceMode("url")}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    iconSourceMode === "url" ? "bg-blue-600 text-white shadow-xs" : "text-white/60 hover:text-white"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* File Upload Mode */}
            {iconSourceMode === "file" && (
              <div className="space-y-3">
                <input
                  type="file"
                  id="categoryIconUpload"
                  accept="image/svg+xml,image/png,image/webp,image/jpeg"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="categoryIconUpload"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Upload className="w-4 h-4 text-blue-400" /> Upload SVG, PNG, WebP or JPG
                </label>
                <div className="text-[11px] text-white/50 space-y-1">
                  <p>• Recommended Size: <strong>256 × 256 px</strong> (Square 1:1 ratio)</p>
                  <p>• Recommended Format: <strong>SVG or transparent WebP</strong></p>
                  <p>• Maximum File Size: <strong>300 KB</strong></p>
                </div>
              </div>
            )}

            {/* Direct Image URL Mode */}
            {iconSourceMode === "url" && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-white/70">Direct HTTPS Image / SVG URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="url"
                    placeholder="https://example.com/icons/smartwatches.svg"
                    value={formData.image_url || ""}
                    onChange={(e) => handleUrlInputChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
                {urlValidationError && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {urlValidationError}
                  </p>
                )}
              </div>
            )}

            {imageError && (
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {imageError}
              </p>
            )}

            {/* Emoji Presets Quick Apply */}
            <div>
              <p className="text-[11px] font-bold text-white/50 mb-1.5">Emoji Icon Presets:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setFormData({ ...formData, icon: preset.icon });
                    }}
                    className={`rounded-xl border p-2 flex flex-col items-center gap-1 text-center transition-all ${
                      formData.icon === preset.icon && !formData.image_url
                        ? "bg-blue-600/30 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <span className="text-[9px] font-bold truncate w-full">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Hover Icon URL & Alt Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Optional Hover Icon URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/hover-icon.svg"
                value={formData.hover_icon_url || ""}
                onChange={(e) => setFormData({ ...formData, hover_icon_url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Icon Alt Text
              </label>
              <input
                type="text"
                placeholder="e.g. Smart Watches Icon"
                value={formData.icon_alt_text || ""}
                onChange={(e) => setFormData({ ...formData, icon_alt_text: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Desktop Order
              </label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Mobile Order
              </label>
              <input
                type="number"
                value={formData.mobile_sort_order ?? formData.sort_order ?? 0}
                onChange={(e) => setFormData({ ...formData, mobile_sort_order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none"
              >
                <option value="active" className="bg-[#0F172A] text-white">Active</option>
                <option value="inactive" className="bg-[#0F172A] text-white">Inactive</option>
              </select>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div>
                <p className="text-xs font-bold text-white">Show on Homepage Carousel</p>
                <p className="text-[11px] text-white/50">Display in Shop by Category section</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_on_homepage !== false}
                onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div>
                <p className="text-xs font-bold text-white">Show in Circular Filter Bar</p>
                <p className="text-[11px] text-white/50">Display in top filter bar on Shop page</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_in_selector !== false}
                onChange={(e) => setFormData({ ...formData, show_in_selector: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-0 bg-[#0F172A] pt-4 pb-2 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white/60 hover:bg-white/10 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
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
