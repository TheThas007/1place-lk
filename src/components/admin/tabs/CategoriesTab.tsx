"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Category, Product, MegaMenuSettings, MegaMenuExploreLink, Subcategory } from "@/lib/types";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  ArrowUp,
  ArrowDown,
  FolderTree,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Save,
  Check,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { DEFAULT_MEGA_MENU_SETTINGS } from "@/lib/data";
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
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "megamenu">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "menu">("all");
  const [deleteWarningCategory, setDeleteWarningCategory] = useState<{ cat: Category; linkedCount: number } | null>(null);

  // Mega Menu Settings State
  const [menuSettings, setMenuSettings] = useState<MegaMenuSettings>(DEFAULT_MEGA_MENU_SETTINGS);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Link in More to Explore builder
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkHighlight, setNewLinkHighlight] = useState(false);

  // Fetch Mega Menu Settings from Firestore
  useEffect(() => {
    async function loadMenuSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "mega_menu"));
        if (snap.exists()) {
          const data = snap.data() as MegaMenuSettings;
          setMenuSettings({
            ...DEFAULT_MEGA_MENU_SETTINGS,
            ...data,
            explore_links: data.explore_links || DEFAULT_MEGA_MENU_SETTINGS.explore_links,
          });
        }
      } catch (e) {
        console.warn("Could not load mega menu settings:", e);
      }
    }
    loadMenuSettings();
  }, []);

  // Filter clean categories (exclude brand-names)
  const cleanCategories = useMemo(() => {
    return categories.filter((c) => {
      const cName = (c.name || "").toLowerCase();
      const cSlug = (c.slug || "").toLowerCase();
      return !KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
    });
  }, [categories]);

  // Displayed Categories for Directory
  const displayedCategories = useMemo(() => {
    return cleanCategories
      .filter((c) => {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q));
        if (!matches) return false;

        if (statusFilter === "active") return c.status !== "inactive";
        if (statusFilter === "inactive") return c.status === "inactive";
        if (statusFilter === "menu") return c.show_in_menu !== false;
        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [cleanCategories, searchQuery, statusFilter]);

  // Count products for category
  const getProductCount = (cat: Category) => {
    return products.filter(
      (p) =>
        p.category_id === cat.id ||
        p.category_id === cat.slug ||
        p.categoryId === cat.id ||
        p.category_name?.toLowerCase() === cat.name?.toLowerCase()
    ).length;
  };

  // Toggle Category Menu Status
  const handleToggleMenu = async (cat: Category) => {
    const updatedStatus = cat.show_in_menu !== false ? false : true;
    try {
      await setDoc(doc(db, "categories", cat.id), { show_in_menu: updatedStatus }, { merge: true });
      cat.show_in_menu = updatedStatus;
      window.location.reload();
    } catch (e) {
      console.error("Failed to toggle menu status:", e);
    }
  };

  // Reorder Up / Down
  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= displayedCategories.length) return;

    const currentCat = displayedCategories[index];
    const targetCat = displayedCategories[targetIndex];

    const currentOrder = currentCat.sort_order || index + 1;
    const targetOrder = targetCat.sort_order || targetIndex + 1;

    try {
      await setDoc(doc(db, "categories", currentCat.id), { sort_order: targetOrder }, { merge: true });
      await setDoc(doc(db, "categories", targetCat.id), { sort_order: currentOrder }, { merge: true });
      window.location.reload();
    } catch (e) {
      console.error("Reorder error:", e);
    }
  };

  // Trigger Safe Delete
  const triggerDeleteCheck = (cat: Category) => {
    const linkedCount = getProductCount(cat);
    if (linkedCount > 0) {
      setDeleteWarningCategory({ cat, linkedCount });
    } else {
      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        onDelete(cat.id);
      }
    }
  };

  // Save Mega Menu Settings to Firestore
  const handleSaveMegaMenuSettings = async () => {
    setIsSavingMenu(true);
    setSaveSuccess(false);
    try {
      const payload: MegaMenuSettings = {
        ...menuSettings,
        last_updated: new Date().toISOString(),
        status: "published",
      };
      await setDoc(doc(db, "settings", "mega_menu"), payload, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save mega menu settings:", e);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSavingMenu(false);
    }
  };

  // Restore Default Mega Menu Layout
  const handleRestoreDefaultMenu = () => {
    if (confirm("Restore default Apple-style mega menu configuration?")) {
      setMenuSettings(DEFAULT_MEGA_MENU_SETTINGS);
    }
  };

  // Add Link to More to Explore
  const handleAddExploreLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const newLink: MegaMenuExploreLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
      is_highlighted: newLinkHighlight,
      sort_order: menuSettings.explore_links.length + 1,
      status: "active",
    };
    setMenuSettings((prev) => ({
      ...prev,
      explore_links: [...prev.explore_links, newLink],
    }));
    setNewLinkLabel("");
    setNewLinkUrl("");
    setNewLinkHighlight(false);
  };

  // Remove Explore Link
  const handleRemoveExploreLink = (id: string) => {
    setMenuSettings((prev) => ({
      ...prev,
      explore_links: prev.explore_links.filter((l) => l.id !== id),
    }));
  };

  // Reorder Explore Links
  const handleMoveExploreLink = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= menuSettings.explore_links.length) return;
    const links = [...menuSettings.explore_links];
    const temp = links[index];
    links[index] = links[target];
    links[target] = temp;
    setMenuSettings((prev) => ({ ...prev, explore_links: links }));
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">

      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-500/20">
            <FolderTree className="w-3.5 h-3.5" />
            <span>NAVIGATION ARCHITECTURE</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Categories & Mega Menu Manager
          </h3>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Manage text-based categories, subcategory hierarchies, and configure the Apple-inspired 3-column mega menu.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveSubTab("directory")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "directory"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-white/60 hover:text-white"
                }`}
            >
              <FolderTree className="w-4 h-4" />
              Category Directory ({cleanCategories.length})
            </button>
            <button
              onClick={() => setActiveSubTab("megamenu")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "megamenu"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-white/60 hover:text-white"
                }`}
            >
              <Layers className="w-4 h-4" />
              Mega Menu Settings
            </button>
          </div>

          {activeSubTab === "directory" && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: CATEGORY DIRECTORY & HIERARCHY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "directory" && (
        <div className="space-y-4">

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] border border-white/10 rounded-2xl p-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search categories or slugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-white/40 font-bold hidden sm:inline">Status:</span>
              {(["all", "active", "inactive", "menu"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === st
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {st === "menu" ? "Mega Menu Only" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Table / List */}
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-white/10 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-white/40">
              <div className="col-span-1">Order</div>
              <div className="col-span-4">Category & Subcategories</div>
              <div className="col-span-3">Destination / Slug</div>
              <div className="col-span-1 text-center">Products</div>
              <div className="col-span-1 text-center">Mega Menu</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/5">
              {displayedCategories.length === 0 ? (
                <div className="py-16 text-center text-white/40">
                  <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No categories found</p>
                </div>
              ) : (
                displayedCategories.map((cat, idx) => {
                  const productCount = getProductCount(cat);
                  const subCount = cat.subcategories?.length || 0;

                  return (
                    <div
                      key={cat.id || idx}
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Order Controls */}
                      <div className="col-span-1 flex items-center gap-1">
                        <span className="text-xs font-mono font-bold text-white/50 w-5">
                          {cat.sort_order || idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleReorder(idx, "up")}
                            disabled={idx === 0}
                            className="p-0.5 text-white/30 hover:text-white disabled:opacity-20 transition-all"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(idx, "down")}
                            disabled={idx === displayedCategories.length - 1}
                            className="p-0.5 text-white/30 hover:text-white disabled:opacity-20 transition-all"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Name & Subcategories */}
                      <div className="col-span-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white truncate">
                            {cat.name}
                          </span>
                          {cat.status === "inactive" && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                              Inactive
                            </span>
                          )}
                          {cat.is_featured_in_menu && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                              Featured
                            </span>
                          )}
                        </div>
                        {subCount > 0 ? (
                          <p className="text-[11px] text-blue-400 font-semibold mt-0.5 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {subCount} Subcategories:{" "}
                            <span className="text-white/50 font-normal truncate">
                              {cat.subcategories?.map((s) => s.name).join(", ")}
                            </span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-white/30 truncate mt-0.5">
                            {cat.description || "No description"}
                          </p>
                        )}
                      </div>

                      {/* Destination / Slug */}
                      <div className="col-span-3 min-w-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-mono text-white/70 border border-white/10 truncate max-w-full">
                          {cat.destination_url || `/products?category=${cat.slug}`}
                        </span>
                      </div>

                      {/* Product Count */}
                      <div className="col-span-1 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                          {productCount}
                        </span>
                      </div>

                      {/* Mega Menu Toggle */}
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleMenu(cat)}
                          className={`p-1.5 rounded-xl transition-all ${cat.show_in_menu !== false
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/30 hover:text-white"
                            }`}
                          title="Toggle in Shop by Category Mega Menu"
                        >
                          {cat.show_in_menu !== false ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all border border-white/10"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-400" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDeleteCheck(cat)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: APPLE-INSPIRED MEGA MENU SETTINGS & LIVE PREVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "megamenu" && (
        <div className="space-y-6">

          {/* Controls & Save Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div>
              <h4 className="text-lg font-black text-white">Apple-Style Mega Menu Configuration</h4>
              <p className="text-xs text-white/50">
                Customize column headings, category allocations, and explore links. All updates reflect in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDefaultMenu}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-xs font-bold transition-all border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                Restore Defaults
              </button>

              <button
                type="button"
                onClick={handleSaveMegaMenuSettings}
                disabled={isSavingMenu}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                {saveSuccess ? "Published!" : isSavingMenu ? "Saving..." : "Save & Publish Menu"}
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1 Settings */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Column 1 — Main Categories
                </span>
                <span className="text-[10px] font-bold text-white/40">Typography 24px</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Column Heading</label>
                <input
                  type="text"
                  value={menuSettings.column1_heading}
                  onChange={(e) => setMenuSettings((prev) => ({ ...prev, column1_heading: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70">Select Displayed Categories</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {cleanCategories.map((cat) => {
                    const isSelected =
                      !menuSettings.selected_category_ids?.length ||
                      menuSettings.selected_category_ids.includes(cat.id);

                    return (
                      <label
                        key={`col1-select-${cat.id}`}
                        className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] p-2.5 rounded-xl text-xs cursor-pointer border border-white/5"
                      >
                        <span className="font-bold text-white truncate">{cat.name}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const cur = menuSettings.selected_category_ids || cleanCategories.map((c) => c.id);
                            const updated = e.target.checked
                              ? [...cur, cat.id]
                              : cur.filter((id) => id !== cat.id);
                            setMenuSettings((prev) => ({ ...prev, selected_category_ids: updated }));
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white/10 border-white/20"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2 Settings */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Column 2 — Subcategories
                </span>
                <span className="text-[10px] font-bold text-white/40">Typography 15px</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Column Heading</label>
                <input
                  type="text"
                  value={menuSettings.column2_heading}
                  onChange={(e) => setMenuSettings((prev) => ({ ...prev, column2_heading: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 text-[11px] text-white/60 leading-relaxed">
                Subcategories are automatically organized from your category database. You can manage individual subcategories in the <strong>Category Directory</strong> tab.
              </div>
            </div>

            {/* Column 3 Settings: More to Explore Builder */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Column 3 — More to Explore
                </span>
                <span className="text-[10px] font-bold text-white/40">Direct Links</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Column Heading</label>
                <input
                  type="text"
                  value={menuSettings.column3_heading}
                  onChange={(e) => setMenuSettings((prev) => ({ ...prev, column3_heading: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* Existing Explore Links */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {menuSettings.explore_links.map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl text-xs border border-white/5"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{link.label}</p>
                      <p className="text-[10px] font-mono text-white/40 truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveExploreLink(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveExploreLink(idx, "down")}
                        disabled={idx === menuSettings.explore_links.length - 1}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExploreLink(link.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Explore Link */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="Link label (e.g. Latest Offers)"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30"
                />
                <input
                  type="text"
                  placeholder="Destination URL (e.g. /products?discount=true)"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddExploreLink}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/30"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Link
                </button>
              </div>

            </div>
          </div>

          {/* ── Interactive Live Preview ── */}
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-black text-white">Live Interactive Mega Menu Preview</h4>
              </div>

              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewDevice === "desktop" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                    }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop View
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewDevice === "mobile" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                    }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile View
                </button>
              </div>
            </div>

            {/* Desktop Preview Frame */}
            {previewDevice === "desktop" ? (
              <div className="bg-[#FFFFFF] border border-[#E5E5E7] rounded-2xl p-8 lg:p-10 shadow-lg text-black">
                <div className="grid grid-cols-12 gap-8 items-start">

                  {/* Col 1 */}
                  <div className="col-span-5 flex flex-col space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block">
                      {menuSettings.column1_heading || "Shop by Category"}
                    </span>
                    <span className="text-[24px] font-bold text-[#090909] hover:text-[#6E6E73] transition-colors leading-tight cursor-pointer">
                      Shop All Products
                    </span>
                    {cleanCategories.slice(0, 8).map((cat) => (
                      <span
                        key={`prev-col1-${cat.id}`}
                        className="text-[22px] font-bold text-[#090909] hover:text-[#6E6E73] transition-colors leading-tight cursor-pointer"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>

                  {/* Col 2 */}
                  <div className="col-span-4 flex flex-col space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block">
                      {menuSettings.column2_heading || "Popular Subcategories"}
                    </span>
                    {["iPhones & Apple Care", "Samsung Galaxy Flagships", "20W & 35W Fast Adapters", "AirPods & Wireless Earbuds", "Apple Watch & Galaxy Watch", "Braided Fast Charging Cables"].map((sub, i) => (
                      <span
                        key={i}
                        className="text-[15px] font-medium text-[#090909] hover:text-[#6E6E73] transition-colors py-1 cursor-pointer"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Col 3 */}
                  <div className="col-span-3 flex flex-col space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block">
                      {menuSettings.column3_heading || "More to Explore"}
                    </span>
                    {menuSettings.explore_links.map((link, i) => (
                      <span
                        key={i}
                        className="text-[15px] font-medium text-[#090909] hover:text-[#6E6E73] transition-colors py-1 cursor-pointer"
                      >
                        {link.label}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ) : (
              /* Mobile Preview Frame */
              <div className="max-w-[320px] mx-auto bg-black border border-white/10 rounded-2xl p-4 text-white space-y-2">
                <div className="p-3 bg-white/[0.06] rounded-xl text-xs font-bold flex items-center justify-between">
                  <span>Shop All Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 pl-2">
                  {cleanCategories.slice(0, 6).map((cat) => (
                    <div
                      key={`prev-mob-${cat.id}`}
                      className="flex items-center justify-between py-2 text-xs text-white/80 border-b border-white/5"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── Safe Deletion Warning Modal ── */}
      {deleteWarningCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Assigned Products Detected</h4>
                <p className="text-xs text-white/50">Cannot immediately delete category</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200 leading-relaxed">
              Category <strong>"{deleteWarningCategory.cat.name}"</strong> is currently assigned to{" "}
              <strong>{deleteWarningCategory.linkedCount} products</strong>. Deleting this category will leave those products uncategorized.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteWarningCategory(null)}
                className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const catId = deleteWarningCategory.cat.id;
                  setDeleteWarningCategory(null);
                  onDelete(catId);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
