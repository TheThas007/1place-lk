"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Brand, Department, DepartmentBrandPageConfig, DepartmentBrandCategoryTab, Product } from "@/lib/types";
import {
  getBrandsFromDb,
  saveBrandToDb,
  deleteBrandFromDb,
  getDepartmentsFromDb,
  getDepartmentBrandPageConfig,
  saveDepartmentBrandPageConfig,
  generateDefaultDepartmentPageConfig,
  DEFAULT_DEPARTMENTS,
  getDefaultBrandDepartments,
} from "@/lib/firestore-brands";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Search,
  Eye,
  Copy,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Save,
  Check,
} from "lucide-react";
import { uploadImageWithFallback } from "@/lib/upload-utils";
import DepartmentBrandHero from "@/components/brand/DepartmentBrandHero";

const BRAND_LOGO_PRESETS = [
  { name: "Apple", logo: "https://cdn.simpleicons.org/apple/000000" },
  { name: "Samsung", logo: "https://cdn.simpleicons.org/samsung/000000" },
  { name: "Xiaomi", logo: "https://cdn.simpleicons.org/xiaomi/FF6900" },
  { name: "Google Pixel", logo: "https://cdn.simpleicons.org/google/000000" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/F5010C" },
  { name: "Honor", logo: "https://cdn.simpleicons.org/honor/000000" },
  { name: "Vivo", logo: "https://cdn.simpleicons.org/vivo/000000" },
  { name: "Oppo", logo: "https://cdn.simpleicons.org/oppo/000000" },
  { name: "Realme", logo: "https://cdn.simpleicons.org/realme/000000" },
  { name: "JBL", logo: "https://cdn.simpleicons.org/jbl/FF3300" },
  { name: "Anker", logo: "https://cdn.simpleicons.org/anker/000000" },
  { name: "Baseus", logo: "https://cdn.simpleicons.org/baseus/000000" },
  { name: "UGREEN", logo: "https://cdn.simpleicons.org/ugreen/000000" },
  { name: "Hoco", logo: "https://icon.horse/icon/hocotech.com" },
  { name: "Joyroom", logo: "https://icon.horse/icon/joyroom.com" },
  { name: "Oraimo", logo: "https://icon.horse/icon/oraimo.com" },
];

export default function BrandsTab({ products = [] }: { products?: Product[] }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [departments, setDepartments] = useState<Department[]>(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [modalSubTab, setModalSubTab] = useState<"general" | "departments" | "pages" | "preview">("general");

  // Form State for Brand
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    slug: "",
    logo_url: "",
    icon_url: "",
    description: "",
    assigned_departments: ["phones"],
    status: "active",
    enabled: true,
    show_on_homepage: true,
    featured: false,
    order: 1,
    seo_title: "",
    seo_description: "",
  });

  // Department Pages Form State (Keyed by department slug)
  const [activePageDeptSlug, setActivePageDeptSlug] = useState<string>("phones");
  const [pageConfigs, setPageConfigs] = useState<Record<string, DepartmentBrandPageConfig>>({});
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState<string | null>(null);

  const fetchBrandsAndDepartments = async () => {
    setLoading(true);
    try {
      const [brandData, deptData] = await Promise.all([
        getBrandsFromDb(),
        getDepartmentsFromDb(),
      ]);
      setBrands(brandData);
      setDepartments(deptData);
    } catch (e) {
      console.error("Failed to fetch brands/departments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandsAndDepartments();
  }, []);

  // Open Modal for Create or Edit
  const handleOpenModal = async (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      const assigned =
        brand.assigned_departments && brand.assigned_departments.length > 0
          ? brand.assigned_departments
          : getDefaultBrandDepartments(brand.slug, brand.product_group);

      setFormData({
        ...brand,
        assigned_departments: assigned,
        enabled: brand.enabled !== false && brand.status !== "inactive",
      });

      // Load all department page configs for this brand
      const configs: Record<string, DepartmentBrandPageConfig> = {};
      for (const deptSlug of departments.map((d) => d.slug)) {
        const config = await getDepartmentBrandPageConfig(deptSlug, brand.slug);
        if (config) {
          configs[deptSlug] = config;
        } else {
          configs[deptSlug] = generateDefaultDepartmentPageConfig(deptSlug, brand);
        }
      }
      setPageConfigs(configs);
      setActivePageDeptSlug(assigned[0] || "phones");
    } else {
      setEditingBrand(null);
      const newBrand: Partial<Brand> = {
        name: "",
        slug: "",
        logo_url: "",
        icon_url: "",
        description: "",
        assigned_departments: ["phones"],
        status: "active",
        enabled: true,
        show_on_homepage: true,
        featured: false,
        order: brands.length + 1,
      };
      setFormData(newBrand);

      // Automated Draft Configs for newly added brand
      const configs: Record<string, DepartmentBrandPageConfig> = {};
      for (const dept of departments) {
        configs[dept.slug] = generateDefaultDepartmentPageConfig(dept.slug, {
          id: `brand-temp`,
          name: "New Brand",
          slug: "new-brand",
          status: "active",
          enabled: true,
        });
      }
      setPageConfigs(configs);
      setActivePageDeptSlug("phones");
    }
    setModalSubTab("general");
    setIsModalOpen(true);
    setSaveSuccess(false);
  };

  const handleToggleDepartment = (deptSlug: string) => {
    const current = formData.assigned_departments || [];
    let updated: string[];
    if (current.includes(deptSlug)) {
      if (current.length === 1) {
        alert("A brand must be assigned to at least one department.");
        return;
      }
      updated = current.filter((s) => s !== deptSlug);
    } else {
      updated = [...current, deptSlug];
    }
    setFormData({ ...formData, assigned_departments: updated });
    if (!updated.includes(activePageDeptSlug)) {
      setActivePageDeptSlug(updated[0] || "phones");
    }
  };

  const handleUpdateActivePageConfig = (updates: Partial<DepartmentBrandPageConfig>) => {
    setPageConfigs((prev) => {
      const current = prev[activePageDeptSlug] || generateDefaultDepartmentPageConfig(
        activePageDeptSlug,
        (editingBrand || { id: "temp", name: formData.name || "", slug: formData.slug || "" }) as Brand
      );
      return {
        ...prev,
        [activePageDeptSlug]: {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleBannerUpload = async (file: File, type: "desktop" | "tablet" | "mobile") => {
    setUploadingBanner(type);
    try {
      const url = await uploadImageWithFallback(file, "brand-banners");
      if (url) {
        if (type === "desktop") {
          handleUpdateActivePageConfig({ desktopBannerUrl: url });
        } else if (type === "tablet") {
          handleUpdateActivePageConfig({ tabletBannerUrl: url });
        } else {
          handleUpdateActivePageConfig({ mobileBannerUrl: url });
        }
      }
    } catch (err) {
      console.error("Banner upload failed:", err);
      alert("Failed to upload banner image. Please try entering a URL instead.");
    } finally {
      setUploadingBanner(null);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Brand name is required.");
      return;
    }

    const slug =
      formData.slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setIsSaving(true);
    try {
      const brandToSave: Brand = {
        id: editingBrand?.id || `brand-${slug}`,
        name: formData.name.trim(),
        slug,
        logo_url: formData.logo_url?.trim() || "",
        icon_url: formData.icon_url?.trim() || "",
        description: formData.description || "",
        assigned_departments: formData.assigned_departments || ["phones"],
        status: formData.enabled !== false ? "active" : "inactive",
        enabled: formData.enabled !== false,
        show_on_homepage: formData.show_on_homepage !== false,
        featured: Boolean(formData.featured),
        order: Number(formData.order) || 1,
        seo_title: formData.seo_title || `${formData.name} Products | Street Mobile`,
        seo_description: formData.seo_description || "",
        updatedAt: new Date().toISOString(),
      };

      await saveBrandToDb(brandToSave);

      // Save each department page configuration
      for (const deptSlug of brandToSave.assigned_departments || ["phones"]) {
        const config = pageConfigs[deptSlug];
        if (config) {
          const configToSave: DepartmentBrandPageConfig = {
            ...config,
            id: `${deptSlug}_${slug}`,
            brandId: brandToSave.id,
            brandSlug: slug,
            departmentSlug: deptSlug,
            enabled: true,
            status: "published",
            updatedAt: new Date().toISOString(),
          };
          await saveDepartmentBrandPageConfig(configToSave);
        }
      }

      setSaveSuccess(true);
      await fetchBrandsAndDepartments();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to save brand:", err);
      alert("Failed to save brand details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete brand "${brandName}"? This will also remove all its department page configurations.`)) {
      return;
    }
    try {
      await deleteBrandFromDb(brandId);
      await fetchBrandsAndDepartments();
    } catch (e) {
      console.error("Failed to delete brand:", e);
      alert("Failed to delete brand.");
    }
  };

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (selectedDeptFilter !== "all") {
        const depts = b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
        if (!depts.includes(selectedDeptFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchSlug = b.slug.toLowerCase().includes(q);
        return matchName || matchSlug;
      }
      return true;
    });
  }, [brands, selectedDeptFilter, searchQuery]);

  const activeDepartment =
    departments.find((d) => d.slug === activePageDeptSlug) || departments[0] || {
      id: "dept-phones",
      name: "Phones",
      slug: "phones",
    };

  const activePageConfig =
    pageConfigs[activePageDeptSlug] ||
    generateDefaultDepartmentPageConfig(
      activePageDeptSlug,
      (editingBrand || { id: "temp", name: formData.name || "Brand", slug: formData.slug || "brand" }) as Brand
    );

  return (
    <div className="space-y-6">
      {/* ── TOP ACTION BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-500" />
            Brands &amp; Shop by Brand Catalog
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Manage brands, assign them to departments, and configure full-frame banner artwork.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedDeptFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedDeptFilter === "all"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            All Departments ({brands.length})
          </button>
          {departments.map((dept) => {
            const count = brands.filter((b) => {
              const depts = b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
              return depts.includes(dept.slug);
            }).length;
            return (
              <button
                key={dept.slug}
                type="button"
                onClick={() => setSelectedDeptFilter(dept.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDeptFilter === dept.slug
                    ? "bg-red-600 text-white shadow"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                {dept.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name or slug..."
            className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-white/40 outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* ── BRANDS TABLE ── */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-black/40 text-white/40 uppercase tracking-widest text-[10px] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-5">Brand</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Assigned Departments</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Homepage</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBrands.map((brand) => {
                const depts = brand.assigned_departments || getDefaultBrandDepartments(brand.slug, brand.product_group);
                return (
                  <tr key={brand.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/10">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-full h-full object-contain filter brightness-0 invert"
                            />
                          ) : (
                            <span className="font-extrabold text-xs text-white/60">
                              {brand.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-white block">{brand.name}</span>
                          <span className="text-[10px] text-white/40">{brand.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/60 text-[11px]">{brand.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {depts.map((dSlug) => {
                          const dept = departments.find((d) => d.slug === dSlug);
                          return (
                            <Link
                              key={dSlug}
                              href={`/shop-by-brand/${dSlug}/${brand.slug}`}
                              target="_blank"
                              className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/20 transition-colors flex items-center gap-1"
                              title={`View ${brand.name} in ${dept?.name || dSlug}`}
                            >
                              <span>{dept?.name || dSlug}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        brand.enabled !== false && brand.status !== "inactive"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {brand.enabled !== false && brand.status !== "inactive" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {brand.show_on_homepage !== false ? (
                        <span className="text-emerald-400 font-bold text-[11px]">Visible</span>
                      ) : (
                        <span className="text-white/40 text-[11px]">Hidden</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(brand)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                          title="Edit Brand & Department Pages"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(brand.id, brand.name)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Delete Brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT / CREATE BRAND MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand"}
                </h2>
                <p className="text-xs text-white/50">
                  Configure brand details, assigned departments, and full-frame banner artwork.
                </p>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setModalSubTab("general")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalSubTab === "general" ? "bg-red-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setModalSubTab("departments")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalSubTab === "departments" ? "bg-red-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  Departments
                </button>
                <button
                  type="button"
                  onClick={() => setModalSubTab("pages")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalSubTab === "pages" ? "bg-red-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  Department Pages
                </button>
                <button
                  type="button"
                  onClick={() => setModalSubTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    modalSubTab === "preview" ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Live Preview
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBrand} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SUBTAB 1: GENERAL BRAND SETTINGS */}
              {modalSubTab === "general" && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 font-bold mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Apple"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Brand Slug</label>
                      <input
                        type="text"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. apple"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/70 font-bold mb-1">Logo URL (Transparent PNG or SVG)</label>
                      <input
                        type="url"
                        value={formData.logo_url || ""}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://cdn.simpleicons.org/apple/000000"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 font-mono text-[11px]"
                      />
                      
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[10px] text-white/40">Presets:</span>
                        {BRAND_LOGO_PRESETS.slice(0, 8).map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, logo_url: preset.logo })}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-bold transition-colors"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/70 font-bold mb-1">Brand Description</label>
                      <textarea
                        rows={2}
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Genuine devices and original accessories..."
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                        <input
                          type="checkbox"
                          checked={formData.show_on_homepage !== false}
                          onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                          className="accent-red-600 rounded"
                        />
                        Show in Homepage &quot;Shop by Brand&quot;
                      </label>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                        <input
                          type="checkbox"
                          checked={formData.enabled !== false}
                          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                          className="accent-red-600 rounded"
                        />
                        Brand Enabled
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: DEPARTMENT ASSIGNMENT */}
              {modalSubTab === "departments" && (
                <div className="space-y-4">
                  <p className="text-xs text-white/60">
                    Select which store departments this brand belongs to. The brand will appear in the Shop by Brand section under every selected department.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {departments.map((dept) => {
                      const isAssigned = (formData.assigned_departments || []).includes(dept.slug);
                      return (
                        <div
                          key={dept.slug}
                          onClick={() => handleToggleDepartment(dept.slug)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                            isAssigned
                              ? "bg-blue-600/10 border-blue-500/40 text-white shadow-lg"
                              : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {}}
                            className="accent-blue-600 mt-1 rounded cursor-pointer"
                          />
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{dept.name}</h4>
                            <p className="text-[11px] text-white/50 mt-1">{dept.description}</p>
                            <span className="inline-block text-[10px] font-mono text-blue-400 mt-2">
                              /shop-by-brand/{dept.slug}/{formData.slug || "brand"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: DEPARTMENT PAGES (BANNER ARTWORK & PAGE HEADINGS) */}
              {modalSubTab === "pages" && (
                <div className="space-y-6">
                  {/* Department Sub-Selector */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
                    <span className="text-xs font-bold text-white/50 whitespace-nowrap">Department Page:</span>
                    {(formData.assigned_departments || ["phones"]).map((dSlug) => {
                      const dept = departments.find((d) => d.slug === dSlug);
                      return (
                        <button
                          key={dSlug}
                          type="button"
                          onClick={() => setActivePageDeptSlug(dSlug)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            activePageDeptSlug === dSlug
                              ? "bg-blue-600 text-white shadow"
                              : "bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {dept?.name || dSlug}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── BANNER ARTWORK SECTION ── */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        Full-Frame Promotional Banner Artwork
                      </span>
                      <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activePageConfig.bannerEnabled !== false}
                          onChange={(e) => handleUpdateActivePageConfig({ bannerEnabled: e.target.checked })}
                          className="accent-blue-600 rounded"
                        />
                        Banner Enabled
                      </label>
                    </div>

                    {/* Image Size Guidance */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-blue-400 block">Desktop (≥ 1024px)</span>
                        <span className="text-white/60">Recommended: 1600 × 500px</span>
                        <span className="text-white/40 block">Ratio: 16:5 · Max 1.5MB</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-400 block">Tablet (768–1023px)</span>
                        <span className="text-white/60">Recommended: 1200 × 600px</span>
                        <span className="text-white/40 block">Ratio: 2:1 · Max 1.2MB</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-400 block">Mobile (&lt; 768px)</span>
                        <span className="text-white/60">Recommended: 900 × 1100px</span>
                        <span className="text-white/40 block">Ratio: ~4:5 · Max 1MB</span>
                      </div>
                    </div>

                    {/* Desktop Banner Input */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white/80">Desktop Banner Image URL (16:5)</label>
                        <label className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingBanner === "desktop" ? "Uploading..." : "Upload File"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBannerUpload(file, "desktop");
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={activePageConfig.desktopBannerUrl || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ desktopBannerUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/... (1600 × 500px)"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>

                    {/* Tablet Banner Input */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white/80">Tablet Banner Image URL (2:1 Optional)</label>
                        <label className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingBanner === "tablet" ? "Uploading..." : "Upload File"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBannerUpload(file, "tablet");
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={activePageConfig.tabletBannerUrl || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ tabletBannerUrl: e.target.value })}
                        placeholder="Optional tablet banner (1200 × 600px)"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>

                    {/* Mobile Banner Input */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white/80">Mobile Banner Image URL (4:5 Optional)</label>
                        <label className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingBanner === "mobile" ? "Uploading..." : "Upload File"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBannerUpload(file, "mobile");
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={activePageConfig.mobileBannerUrl || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ mobileBannerUrl: e.target.value })}
                        placeholder="Optional mobile banner (900 × 1100px)"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>

                    {/* Banner Live Thumbnail Preview */}
                    {activePageConfig.desktopBannerUrl && (
                      <div className="relative w-full aspect-[16/5] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                        <img
                          src={activePageConfig.desktopBannerUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Banner Link Destination Settings */}
                    <div className="pt-2 border-t border-white/10 space-y-3 text-xs">
                      <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(activePageConfig.linkEnabled)}
                          onChange={(e) => handleUpdateActivePageConfig({ linkEnabled: e.target.checked })}
                          className="accent-blue-600 rounded"
                        />
                        Make Complete Banner Clickable
                      </label>

                      {activePageConfig.linkEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                          <div>
                            <label className="block text-white/60 mb-1">Destination URL</label>
                            <input
                              type="text"
                              value={activePageConfig.destinationUrl || ""}
                              onChange={(e) => handleUpdateActivePageConfig({ destinationUrl: e.target.value })}
                              placeholder="/products/iphone-16-pro or https://..."
                              className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                            />
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(activePageConfig.openInNewTab)}
                                onChange={(e) => handleUpdateActivePageConfig({ openInNewTab: e.target.checked })}
                                className="accent-blue-600 rounded"
                              />
                              Open Link in New Tab
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── PAGE CONTENT HEADINGS (BELOW BANNER & TABS) ── */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 text-xs">
                    <span className="font-bold text-white block">Product Section Heading &amp; Subtitle</span>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Section Heading</label>
                      <input
                        type="text"
                        value={activePageConfig.productSectionHeading || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ productSectionHeading: e.target.value })}
                        placeholder={`e.g. ${formData.name} ${activeDepartment.name}`}
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Section Description</label>
                      <textarea
                        rows={2}
                        value={activePageConfig.productSectionDescription || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ productSectionDescription: e.target.value })}
                        placeholder={`Explore genuine ${formData.name} ${activeDepartment.name.toLowerCase()} available at Street Mobile.`}
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: LIVE PREVIEW */}
              {modalSubTab === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Previewing: {formData.name} in {activeDepartment.name}
                    </span>

                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          previewDevice === "desktop" ? "bg-blue-600 text-white" : "text-white/60"
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("tablet")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          previewDevice === "tablet" ? "bg-blue-600 text-white" : "text-white/60"
                        }`}
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          previewDevice === "mobile" ? "bg-blue-600 text-white" : "text-white/60"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Render Live Hero */}
                  <div className={`mx-auto bg-white rounded-2xl p-6 border border-white/20 transition-all ${
                    previewDevice === "mobile" ? "max-w-xs" : previewDevice === "tablet" ? "max-w-2xl" : "w-full"
                  }`}>
                    {/* Breadcrumbs Preview */}
                    <div className="text-[10px] text-neutral-500 font-medium mb-3 select-none">
                      Home / Shop by Brand / {activeDepartment.name} / <span className="text-black font-bold">{formData.name}</span>
                    </div>

                    <DepartmentBrandHero
                      config={activePageConfig}
                      brand={{
                        id: editingBrand?.id || "temp",
                        name: formData.name || "Brand Name",
                        slug: formData.slug || "brand",
                        logo_url: formData.logo_url || "",
                        status: "active",
                      }}
                      department={activeDepartment}
                    />

                    {/* Underline Category Tabs Preview */}
                    <div className="flex items-center gap-4 border-b border-neutral-200 mb-4 pb-2 text-xs font-semibold text-neutral-600">
                      <span className="text-black font-extrabold border-b-2 border-red-600 pb-2 -mb-2.5">
                        All {activeDepartment.name}
                      </span>
                      <span>Featured Lineup</span>
                      <span>Accessories</span>
                    </div>

                    {/* Section Headings Preview */}
                    <div className="mt-4">
                      <h3 className="text-base font-extrabold text-neutral-900">
                        {activePageConfig.productSectionHeading || `${formData.name} ${activeDepartment.name}`}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {activePageConfig.productSectionDescription || `Explore genuine ${formData.name} ${activeDepartment.name.toLowerCase()} available at Street Mobile.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully!
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Brand & Pages"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
