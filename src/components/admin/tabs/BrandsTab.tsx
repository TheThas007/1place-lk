"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Brand, Product } from "@/lib/types";
import { getBrandsFromDb, saveBrandToDb, deleteBrandFromDb } from "@/lib/firestore-brands";
import { Plus, Edit, Trash2, Tag, Search, Eye, ArrowUp, ArrowDown, Copy, EyeOff, Upload, Link as LinkIcon, Sparkles, Image as ImageIcon, AlertCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { uploadImageWithFallback } from "@/lib/upload-utils";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

const BRAND_LOGO_PRESETS = [
  { name: "Apple", logo: "https://cdn.simpleicons.org/apple/000000" },
  { name: "Samsung", logo: "https://cdn.simpleicons.org/samsung/000000" },
  { name: "Xiaomi / Redmi", logo: "https://cdn.simpleicons.org/xiaomi/000000" },
  { name: "Vivo", logo: "https://cdn.simpleicons.org/vivo/000000" },
  { name: "Oppo", logo: "https://cdn.simpleicons.org/oppo/000000" },
  { name: "Realme", logo: "https://cdn.simpleicons.org/realme/000000" },
  { name: "Honor", logo: "https://cdn.simpleicons.org/honor/000000" },
  { name: "Google Pixel", logo: "https://cdn.simpleicons.org/google/000000" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/000000" },
  { name: "JBL", logo: "https://cdn.simpleicons.org/jbl/000000" },
  { name: "Anker", logo: "https://cdn.simpleicons.org/anker/000000" },
  { name: "Baseus", logo: "https://cdn.simpleicons.org/baseus/000000" },
  { name: "UGREEN", logo: "https://cdn.simpleicons.org/ugreen/000000" },
  { name: "Hoco", logo: "https://icon.horse/icon/hocotech.com" },
  { name: "Joyroom", logo: "https://icon.horse/icon/joyroom.com" },
  { name: "Oraimo", logo: "https://icon.horse/icon/oraimo.com" },
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
    return { isValid: false, error: "Please enter a direct logo/SVG URL ending in .png, .svg, .webp or .jpg (not an HTML webpage)." };
  }
  try {
    new URL(cleanUrl);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
}

export default function BrandsTab({ products = [] }: { products?: Product[] }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deleteWarningBrand, setDeleteWarningBrand] = useState<{ brand: Brand; linkedCount: number } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    slug: "",
    logo_url: "",
    logo_alt_text: "",
    description: "",
    product_group: "smartphones",
    link_destination: "",
    monochrome: false,
    sort_order: 1,
    status: "active",
    show_on_homepage: true,
  });

  const [logoSourceMode, setLogoSourceMode] = useState<"file" | "url">("url");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");
  const [urlValidationError, setUrlValidationError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrandsFromDb();
      setBrands(data);
    } catch (e) {
      console.error("Failed to fetch brands:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        ...brand,
        logo_alt_text: brand.logo_alt_text || `${brand.name} Logo`,
        product_group: brand.product_group || "smartphones",
        link_destination: brand.link_destination || `/products?brand=${brand.slug}`,
      });
      setLogoPreview(brand.logo_url || "");
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        slug: "",
        logo_url: "",
        logo_alt_text: "",
        description: "",
        product_group: "smartphones",
        link_destination: "",
        monochrome: false,
        sort_order: brands.length + 1,
        status: "active",
        show_on_homepage: true,
      });
      setLogoPreview("");
    }
    setLogoFile(null);
    setLogoError("");
    setUrlValidationError("");
    setIsModalOpen(true);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 307200) { // 300 KB limit
        setLogoError("Logo file exceeds recommended 300 KB limit. Please compress logo.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, logo_url: "" }));
    }
  };

  const handleUrlInputChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logo_url: url }));
    if (!logoFile) setLogoPreview(url);

    const val = validateImageUrl(url);
    if (!val.isValid) {
      setUrlValidationError(val.error || "Invalid URL");
    } else {
      setUrlValidationError("");
      setLogoError("");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const group = formData.product_group || "smartphones";
    let defaultLink = `/products?brand=${slug}&cat_chip=smartphones`;
    if (group === "laptops") defaultLink = `/products?brand=${slug}&cat_chip=laptops-tablets`;
    else if (group === "accessories" || group === "audio") defaultLink = `/products?brand=${slug}&category=accessories`;

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slug,
      logo_alt_text: prev.logo_alt_text || `${name} Logo`,
      link_destination: (!prev.link_destination || prev.link_destination.startsWith("/products?brand=")) ? defaultLink : prev.link_destination,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      alert("Please provide a brand name");
      return;
    }
    if (urlValidationError) {
      alert("Please fix the logo URL error before saving.");
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoUrl = formData.logo_url || "";

      if (logoFile) {
        finalLogoUrl = await uploadImageWithFallback(logoFile, "brands");
      }

      const slugVal = formData.slug ? formData.slug.trim() : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      await saveBrandToDb({
        ...formData,
        slug: slugVal,
        logo_url: finalLogoUrl,
        logo_alt_text: formData.logo_alt_text ? formData.logo_alt_text.trim() : `${formData.name} Logo`,
        link_destination: formData.link_destination ? formData.link_destination.trim() : `/products?brand=${slugVal}`,
        product_group: formData.product_group || "smartphones",
      });

      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      console.error("Failed to save brand:", err);
      alert("Error saving brand");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (b: Brand) => {
    const nextState = b.show_on_homepage !== false ? false : true;
    try {
      await saveBrandToDb({ ...b, show_on_homepage: nextState });
      fetchBrands();
    } catch (e) {
      console.error("Error toggling brand visibility:", e);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredBrands.length) return;

    const currentBrand = filteredBrands[index];
    const targetBrand = filteredBrands[targetIndex];

    const currentOrder = currentBrand.sort_order || index;
    const targetOrder = targetBrand.sort_order || targetIndex;

    try {
      await saveBrandToDb({ ...currentBrand, sort_order: targetOrder });
      await saveBrandToDb({ ...targetBrand, sort_order: currentOrder });
      fetchBrands();
    } catch (e) {
      console.error("Reorder error:", e);
    }
  };

  const handleDuplicate = async (b: Brand) => {
    const dupName = `${b.name} (Copy)`;
    const dupSlug = `${b.slug}-copy-${Date.now().toString().slice(-4)}`;
    try {
      await saveBrandToDb({
        ...b,
        id: "",
        name: dupName,
        slug: dupSlug,
        sort_order: (b.sort_order || 0) + 1,
      });
      fetchBrands();
    } catch (e) {
      console.error("Duplicate error:", e);
    }
  };

  const triggerDeleteCheck = (b: Brand) => {
    const assignedCount = products.filter(
      p => (p.brand_id === b.id || p.brandId === b.id || p.brand?.toLowerCase() === b.name.toLowerCase())
    ).length;

    if (assignedCount > 0) {
      setDeleteWarningBrand({ brand: b, linkedCount: assignedCount });
    } else {
      if (confirm(`Are you sure you want to delete brand '${b.name}'?`)) {
        deleteBrandFromDb(b.id).then(() => fetchBrands());
      }
    }
  };

  const filteredBrands = useMemo(() => {
    return brands
      .filter((b) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q);

        if (!matchesSearch) return false;
        if (groupFilter !== "all" && (b.product_group || "smartphones") !== groupFilter) return false;

        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [brands, searchQuery, groupFilter]);

  return (
    <div className="space-y-6 text-white">
      
      {/* Top Header (Dark Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-500/20">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>HOMEPAGE NAVIGATION</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Shop by Brand Manager</h3>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Manage, reorder, and group genuine brand logos (Apple, Samsung, Xiaomi, Vivo, Oppo, JBL, Anker, Baseus, etc.) displayed across your store.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/10 shadow-xs"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            Live Brand Strip Preview
          </button>
          
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Brand Logo
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search brand by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Groups" },
            { id: "smartphones", label: "Smartphones" },
            { id: "laptops", label: "Laptops" },
            { id: "accessories", label: "Accessories" },
            { id: "audio", label: "Audio" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setGroupFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                groupFilter === f.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Admin Brand Logo Cards Grid (Dark Theme) */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-white/40">Loading brands catalog...</div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0F172A] border border-white/10 space-y-3">
          <p className="text-white/50 text-sm font-semibold">No matching brands found.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all"
          >
            + Create New Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBrands.map((b, idx) => {
            const assignedCount = products.filter(
              p => (p.brand_id === b.id || p.brandId === b.id || p.brand?.toLowerCase() === b.name.toLowerCase())
            ).length;

            return (
              <div
                key={b.id || idx}
                className={`bg-[#0F172A] border rounded-2xl p-5 transition-all shadow-md hover:border-white/20 relative flex flex-col justify-between ${
                  b.show_on_homepage !== false ? "border-white/10" : "border-white/5 bg-[#0F172A]/50 opacity-60"
                }`}
              >
                {/* Top Section */}
                <div className="flex items-start gap-4">
                  
                  {/* Brand Logo Container */}
                  <div className={`w-24 h-12 rounded-xl border border-white/10 bg-white/5 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group ${
                    b.monochrome ? "grayscale" : ""
                  }`}>
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.logo_alt_text || b.name}
                        className="w-full h-full object-contain filter invert brightness-200"
                      />
                    ) : (
                      <span className="font-black text-sm text-blue-400">{b.name.slice(0, 3).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-extrabold text-white truncate">{b.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                        Order #{b.sort_order ?? idx}
                      </span>
                    </div>

                    <p className="text-xs text-white/40 font-mono truncate">
                      /{b.slug}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                        {assignedCount} Products
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 text-[10px] font-bold capitalize">
                        {b.product_group || "smartphones"}
                      </span>

                      {b.show_on_homepage !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Homepage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-white/40 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                          Hidden
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
                      disabled={idx === filteredBrands.length - 1}
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
                      onClick={() => handleToggleVisibility(b)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        b.show_on_homepage !== false
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10 text-white"
                      }`}
                      title={b.show_on_homepage !== false ? "Hide from Homepage" : "Show on Homepage"}
                    >
                      {b.show_on_homepage !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(b)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                      title="Duplicate Brand"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(b)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold transition-colors flex items-center gap-1 border border-blue-500/30"
                      title="Edit Brand"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerDeleteCheck(b)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Delete Brand"
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
      {deleteWarningBrand && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-3 text-red-400 border-b border-white/10 pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-lg text-white">Deletion Blocked</h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Cannot delete brand <strong>&quot;{deleteWarningBrand.brand.name}&quot;</strong> because{" "}
              <span className="font-extrabold text-white">{deleteWarningBrand.linkedCount} product(s)</span> are currently assigned to it.
            </p>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Recommended Safer Alternative:
              </p>
              <p className="text-[11px] text-amber-300/80">
                Hide this brand from the homepage brand strip instead of deleting to keep product listings safe.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteWarningBrand(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:bg-white/10 text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleToggleVisibility(deleteWarningBrand.brand);
                  setDeleteWarningBrand(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
              >
                Hide From Homepage Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Brand Modal (Dark Theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-extrabold text-[10px] uppercase tracking-wider border border-blue-500/20">
                  SHOP BY BRAND MANAGER
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add Brand Logo"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Live Preview Card */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Live Brand Strip Preview
                </p>
                <div className="max-w-[200px] mx-auto p-4 rounded-2xl border border-white/10 bg-white/5 shadow-lg flex flex-col items-center gap-3">
                  <div className={`w-28 h-14 bg-black/40 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner ${
                    formData.monochrome ? "grayscale" : ""
                  }`}>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={formData.logo_alt_text || "Preview"}
                        className="w-full h-full object-contain filter invert brightness-200"
                      />
                    ) : (
                      <span className="text-base font-black text-blue-400">
                        {formData.name ? formData.name.slice(0, 3).toUpperCase() : "LOGO"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-white truncate block w-full text-center">
                    {formData.name || "Brand Name"}
                  </span>
                </div>
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Samsung"
                    value={formData.name || ""}
                    onChange={handleNameChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Brand Slug *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="samsung"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Product Group & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Product Group Grouping
                  </label>
                  <select
                    value={formData.product_group || "smartphones"}
                    onChange={(e) => {
                      const group = e.target.value as any;
                      const slug = formData.slug || (formData.name || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      let defaultLink = `/products?brand=${slug}&cat_chip=smartphones`;
                      if (group === "laptops") defaultLink = `/products?brand=${slug}&cat_chip=laptops-tablets`;
                      else if (group === "accessories" || group === "audio") defaultLink = `/products?brand=${slug}&category=accessories`;

                      setFormData((prev) => ({
                        ...prev,
                        product_group: group,
                        link_destination: (!prev.link_destination || prev.link_destination.startsWith("/products?brand=")) ? defaultLink : prev.link_destination,
                      }));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="smartphones" className="bg-[#0F172A] text-white">📱 Smartphones &amp; Mobiles</option>
                    <option value="laptops" className="bg-[#0F172A] text-white">💻 Laptops &amp; Computers</option>
                    <option value="accessories" className="bg-[#0F172A] text-white">🎧 Accessories &amp; Power</option>
                    <option value="audio" className="bg-[#0F172A] text-white">🔊 Audio &amp; Speakers</option>
                    <option value="other" className="bg-[#0F172A] text-white">📦 Other Products</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Link Destination URL
                  </label>
                  <input
                    type="text"
                    placeholder="/products?brand=apple&cat_chip=smartphones"
                    value={formData.link_destination || ""}
                    onChange={(e) => setFormData({ ...formData, link_destination: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:border-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-white/40 mt-1">
                    Auto-configured to open the exact brand + category filter on the Store.
                  </p>
                </div>
              </div>

              {/* Logo Source Selector: Upload File or Image URL */}
              <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" /> Logo Source Selector
                  </h4>
                  
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLogoSourceMode("file")}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                        logoSourceMode === "file" ? "bg-blue-600 text-white shadow-xs" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoSourceMode("url")}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                        logoSourceMode === "url" ? "bg-blue-600 text-white shadow-xs" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {logoSourceMode === "file" && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="brandLogoUpload"
                      accept="image/svg+xml,image/png,image/webp,image/jpeg"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="brandLogoUpload"
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-blue-400" /> Upload SVG, PNG, WebP or JPG Logo
                    </label>
                    <div className="text-[11px] text-white/50 space-y-1">
                      <p>• Recommended Size: <strong>400 × 200 px</strong> (2:1 ratio)</p>
                      <p>• Recommended Format: <strong>SVG or transparent WebP</strong></p>
                      <p>• Maximum File Size: <strong>300 KB</strong></p>
                    </div>
                  </div>
                )}

                {logoSourceMode === "url" && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-white/70">Direct HTTPS Logo / SVG URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="url"
                        placeholder="https://cdn.simpleicons.org/samsung/000000"
                        value={formData.logo_url || ""}
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

                {logoError && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {logoError}
                  </p>
                )}

                {/* Brand Logo Presets */}
                <div>
                  <p className="text-[11px] font-bold text-white/50 mb-1.5">Preset Brand Logos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BRAND_LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(preset.logo);
                          setFormData({ ...formData, logo_url: preset.logo });
                        }}
                        className={`rounded-xl border p-2 flex items-center gap-2 text-left transition-all ${
                          formData.logo_url === preset.logo
                            ? "bg-blue-600/30 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <img src={preset.logo} alt={preset.name} className="w-5 h-5 rounded object-contain bg-white p-0.5" />
                        <span className="text-[10px] font-bold truncate leading-tight">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Alt Text & Monochrome option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Logo Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Brand Logo"
                    value={formData.logo_alt_text || ""}
                    onChange={(e) => setFormData({ ...formData, logo_alt_text: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                  <div>
                    <p className="text-xs font-bold text-white">Monochrome Mode</p>
                    <p className="text-[10px] text-white/50">Grayscale logo styling</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.monochrome === true}
                    onChange={(e) => setFormData({ ...formData, monochrome: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-1.5">
                    Desktop Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order || 1}
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
                    value={formData.mobile_sort_order ?? formData.sort_order ?? 1}
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

              {/* Homepage Strip Toggle */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div>
                  <p className="text-xs font-bold text-white">Show on Homepage Brand Strip</p>
                  <p className="text-[11px] text-white/50">Display logo in homepage manufacturers grid</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.show_on_homepage !== false}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Action Footer */}
              <div className="sticky bottom-0 bg-[#0F172A] pt-4 pb-2 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white/60 hover:bg-white/10 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSaving ? "Saving Brand..." : editingBrand ? "Update Brand" : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Homepage Brand Strip Preview Modal (Dark Theme) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" /> Live Homepage Brand Strip Preview
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 text-white/40 hover:text-white rounded-xl">
                ✕
              </button>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
                HOMEPAGE BRAND MANUFACTURERS STRIP
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredBrands.filter(b => b.show_on_homepage !== false).map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <div className={`w-full h-10 rounded-xl bg-white/5 p-1 flex items-center justify-center overflow-hidden ${
                      b.monochrome ? "grayscale" : ""
                    }`}>
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-full h-full object-contain filter invert brightness-200" />
                      ) : (
                        <span className="text-xs font-black text-white">{b.name}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white/70 block truncate">{b.name}</span>
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
