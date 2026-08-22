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
        seo_title: "",
        seo_description: "",
      };
      setFormData(newBrand);

      // Default configs for new brand
      const dummyBrand: Brand = {
        id: "brand-new",
        name: "New Brand",
        slug: "new-brand",
        assigned_departments: ["phones"],
      };
      const configs: Record<string, DepartmentBrandPageConfig> = {};
      for (const dept of departments) {
        configs[dept.slug] = generateDefaultDepartmentPageConfig(dept.slug, dummyBrand);
      }
      setPageConfigs(configs);
      setActivePageDeptSlug("phones");
    }

    setModalSubTab("general");
    setIsModalOpen(true);
  };

  // Toggle department assignment
  const handleToggleDepartment = (deptSlug: string) => {
    const current = formData.assigned_departments || [];
    const next = current.includes(deptSlug)
      ? current.filter((s) => s !== deptSlug)
      : [...current, deptSlug];

    setFormData((prev) => ({ ...prev, assigned_departments: next }));
  };

  // Update current department page config in state
  const handleUpdateActivePageConfig = (updates: Partial<DepartmentBrandPageConfig>) => {
    setPageConfigs((prev) => {
      const current = prev[activePageDeptSlug] || generateDefaultDepartmentPageConfig(activePageDeptSlug, formData as Brand);
      return {
        ...prev,
        [activePageDeptSlug]: { ...current, ...updates },
      };
    });
  };

  // Copy config from another department
  const handleCopyConfigFromDept = (sourceDeptSlug: string) => {
    const source = pageConfigs[sourceDeptSlug];
    if (!source) return;
    handleUpdateActivePageConfig({
      eyebrow: source.eyebrow,
      heading: source.heading,
      description: source.description,
      desktopBannerUrl: source.desktopBannerUrl,
      tabletBannerUrl: source.tabletBannerUrl,
      mobileBannerUrl: source.mobileBannerUrl,
      headingColor: source.headingColor,
      descriptionColor: source.descriptionColor,
      eyebrowColor: source.eyebrowColor,
      accentColor: source.accentColor,
      primaryCtaBackground: source.primaryCtaBackground,
      primaryCtaTextColor: source.primaryCtaTextColor,
      contentBackgroundColor: source.contentBackgroundColor,
      contentBackgroundOpacity: source.contentBackgroundOpacity,
      imageOverlayOpacity: source.imageOverlayOpacity,
    });
    alert(`Copied configuration from ${sourceDeptSlug}!`);
  };

  // Save Brand and all assigned Department Page Configs
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Brand name is required.");
      return;
    }

    const slug = (formData.slug || formData.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setIsSaving(true);

    try {
      const brandPayload: Brand = {
        id: editingBrand?.id || `brand-${slug}`,
        name: formData.name.trim(),
        slug,
        logo_url: formData.logo_url || "",
        icon_url: formData.icon_url || "",
        description: formData.description || "",
        assigned_departments: formData.assigned_departments || ["phones"],
        status: formData.status || "active",
        enabled: formData.enabled !== false,
        show_on_homepage: formData.show_on_homepage !== false,
        featured: formData.featured || false,
        order: Number(formData.order) || 1,
        seo_title: formData.seo_title || "",
        seo_description: formData.seo_description || "",
      };

      // 1. Save Brand
      await saveBrandToDb(brandPayload);

      // 2. Save all active department page configs
      for (const deptSlug of brandPayload.assigned_departments || []) {
        const config = pageConfigs[deptSlug] || generateDefaultDepartmentPageConfig(deptSlug, brandPayload);
        await saveDepartmentBrandPageConfig({
          ...config,
          brandId: brandPayload.id,
          brandSlug: brandPayload.slug,
          departmentSlug: deptSlug,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsModalOpen(false);
      }, 1000);

      await fetchBrandsAndDepartments();
    } catch (err) {
      console.error("Failed to save brand & department pages:", err);
      alert("Failed to save brand. Please check your internet connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"? This action cannot be undone.`)) {
      try {
        await deleteBrandFromDb(id);
        await fetchBrandsAndDepartments();
      } catch (err) {
        alert("Failed to delete brand.");
      }
    }
  };

  // Duplicate brand detector
  const duplicateWarnings = useMemo(() => {
    const map = new Map<string, Brand[]>();
    brands.forEach((b) => {
      const cleanName = (b.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const arr = map.get(cleanName) || [];
      arr.push(b);
      map.set(cleanName, arr);
    });
    return Array.from(map.values()).filter((arr) => arr.length > 1);
  }, [brands]);

  // Filtered Brands List
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesSearch =
        (b.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.slug || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedDeptFilter !== "all") {
        const assigned = b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group);
        if (!assigned.includes(selectedDeptFilter)) return false;
      }

      return true;
    });
  }, [brands, searchQuery, selectedDeptFilter]);

  const activePageConfig =
    pageConfigs[activePageDeptSlug] ||
    generateDefaultDepartmentPageConfig(activePageDeptSlug, formData as Brand);

  const activeDepartment =
    departments.find((d) => d.slug === activePageDeptSlug) || DEFAULT_DEPARTMENTS[0];

  return (
    <div className="space-y-8 font-sans">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Brand &amp; Multi-Department Management
            </h1>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {brands.length} Brands
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Configure department-specific landing pages, banner overlays, and category navigation for every brand.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Brand
        </button>
      </div>

      {/* ── Duplicate Brand Warnings ── */}
      {duplicateWarnings.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Duplicate Brand Name Detected: </span>
            <span className="text-white/80">
              {duplicateWarnings.map((group) => group.map((b) => b.name).join(" & ")).join(", ")}
            </span>
            <p className="text-white/50 text-[11px] mt-0.5">
              Consider merging or removing obsolete records to ensure optimal customer navigation and SEO.
            </p>
          </div>
        </div>
      )}

      {/* ── Department Filter Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-lg">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedDeptFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedDeptFilter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            All Brands ({brands.length})
          </button>
          {departments.map((dept) => {
            const count = brands.filter((b) =>
              (b.assigned_departments || getDefaultBrandDepartments(b.slug, b.product_group)).includes(dept.slug)
            ).length;

            return (
              <button
                key={dept.slug}
                type="button"
                onClick={() => setSelectedDeptFilter(dept.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedDeptFilter === dept.slug
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white/5 text-white/60 hover:text-white"
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
            placeholder="Search brand name or slug..."
            className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-semibold"
          />
        </div>
      </div>

      {/* ── Brands Table ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/60 border-b border-white/10 uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-5">Brand</th>
                <th className="py-3.5 px-4">Assigned Departments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Homepage</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredBrands.map((brand) => {
                const assigned =
                  brand.assigned_departments || getDefaultBrandDepartments(brand.slug, brand.product_group);

                return (
                  <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Brand & Logo */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center border border-white/10 shrink-0">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="max-h-7 max-w-7 object-contain"
                            />
                          ) : (
                            <Tag className="w-4 h-4 text-black/40" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{brand.name}</div>
                          <span className="text-[11px] font-mono text-white/40">/{brand.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Departments */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((dSlug) => {
                          const dept = departments.find((d) => d.slug === dSlug);
                          return (
                            <Link
                              key={dSlug}
                              href={`/shop-by-brand/${dSlug}/${brand.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold transition-colors"
                            >
                              <span>{dept?.name || dSlug}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          brand.enabled !== false && brand.status !== "inactive"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                        }`}
                      >
                        {brand.enabled !== false && brand.status !== "inactive" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Show on Homepage */}
                    <td className="py-3 px-4">
                      {brand.show_on_homepage !== false ? (
                        <span className="text-emerald-400 font-bold text-[11px]">Visible</span>
                      ) : (
                        <span className="text-white/40 text-[11px]">Hidden</span>
                      )}
                    </td>

                    {/* Actions */}
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
                  Manage brand details, department assignments, and landing page hero configurations.
                </p>
              </div>

              {/* Sub-Tabs Switcher */}
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
                      
                      {/* Logo Presets */}
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

              {/* SUBTAB 3: DEPARTMENT PAGES CONFIGURATION */}
              {modalSubTab === "pages" && (
                <div className="space-y-6">
                  {/* Department Sub-Selector */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white/50">Editing Page for:</span>
                    {(formData.assigned_departments || ["phones"]).map((dSlug) => {
                      const dept = departments.find((d) => d.slug === dSlug);
                      return (
                        <button
                          key={dSlug}
                          type="button"
                          onClick={() => setActivePageDeptSlug(dSlug)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            activePageDeptSlug === dSlug
                              ? "bg-blue-600 text-white shadow"
                              : "bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {dept?.name || dSlug}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleCopyConfigFromDept(formData.assigned_departments?.[0] || "phones")}
                      className="ml-auto text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Duplicate Config from First Dept
                    </button>
                  </div>

                  {/* Banner Image & Guidance */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        Department Banner Image
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Recommended: 1600 × 500px (WebP / JPG)
                      </span>
                    </div>

                    <input
                      type="url"
                      value={activePageConfig.desktopBannerUrl || ""}
                      onChange={(e) => handleUpdateActivePageConfig({ desktopBannerUrl: e.target.value })}
                      placeholder="Desktop Banner URL (https://images.unsplash.com/...)"
                      className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                    />

                    {/* Live Thumbnail */}
                    {activePageConfig.desktopBannerUrl && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={activePageConfig.desktopBannerUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* HTML Overlay Text & CTAs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-white/70 font-bold mb-1">Eyebrow Tagline</label>
                      <input
                        type="text"
                        value={activePageConfig.eyebrow || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ eyebrow: e.target.value })}
                        placeholder="OFFICIAL APPLE STORE"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Main Headline</label>
                      <input
                        type="text"
                        value={activePageConfig.heading || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ heading: e.target.value })}
                        placeholder="iPhone 16 Pro Max"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/70 font-bold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={activePageConfig.description || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ description: e.target.value })}
                        placeholder="Explore the latest flagships with official warranty..."
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Primary CTA Label</label>
                      <input
                        type="text"
                        value={activePageConfig.primaryCtaLabel || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ primaryCtaLabel: e.target.value })}
                        placeholder="Explore All iPhones"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 font-bold mb-1">Primary CTA Destination</label>
                      <input
                        type="text"
                        value={activePageConfig.primaryCtaUrl || ""}
                        onChange={(e) => handleUpdateActivePageConfig({ primaryCtaUrl: e.target.value })}
                        placeholder="#products"
                        className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Colors & Appearance */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Theme &amp; Accent Colors
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-white/60 text-[11px] mb-1">Heading Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activePageConfig.headingColor || "#FFFFFF"}
                            onChange={(e) => handleUpdateActivePageConfig({ headingColor: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                          />
                          <span className="font-mono text-white/70 text-[11px]">{activePageConfig.headingColor || "#FFFFFF"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/60 text-[11px] mb-1">CTA Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activePageConfig.primaryCtaBackground || "#ED0712"}
                            onChange={(e) => handleUpdateActivePageConfig({ primaryCtaBackground: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                          />
                          <span className="font-mono text-white/70 text-[11px]">{activePageConfig.primaryCtaBackground || "#ED0712"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/60 text-[11px] mb-1">Content Box Bg</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activePageConfig.contentBackgroundColor || "#090909"}
                            onChange={(e) => handleUpdateActivePageConfig({ contentBackgroundColor: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                          />
                          <span className="font-mono text-white/70 text-[11px]">{activePageConfig.contentBackgroundColor || "#090909"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/60 text-[11px] mb-1">Eyebrow Accent</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activePageConfig.eyebrowColor || "#ED0712"}
                            onChange={(e) => handleUpdateActivePageConfig({ eyebrowColor: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                          />
                          <span className="font-mono text-white/70 text-[11px]">{activePageConfig.eyebrowColor || "#ED0712"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: LIVE PREVIEW */}
              {modalSubTab === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Live Preview: {formData.name} in {activeDepartment.name}
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

                  <div className="bg-[#020617] border border-white/5 rounded-2xl p-4 flex items-center justify-center overflow-x-auto min-h-[340px]">
                    <div
                      className="transition-all duration-300 w-full"
                      style={{
                        maxWidth: previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%",
                      }}
                    >
                      <DepartmentBrandHero
                        config={activePageConfig}
                        brand={formData as Brand}
                        department={activeDepartment}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Brand & Department Pages"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
