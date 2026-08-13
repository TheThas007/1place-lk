"use client";

import React, { useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Tag,
  FolderTree,
  Award,
  Smartphone,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Layers
} from "lucide-react";

const STANDARD_CATEGORIES = [
  "Smartphones",
  "Feature Phones",
  "Tablets & iPads",
  "Smart Watches",
  "Earbuds & TWS",
  "Headphones",
  "Speakers",
  "Chargers & Adapters",
  "Charging Cables",
  "Power Banks",
  "Phone Cases",
  "Screen Protectors",
  "Laptops & MacBooks",
  "Mobile Accessories",
  "Repair Parts"
];

const STANDARD_BRANDS = [
  "Apple",
  "Samsung",
  "Redmi",
  "Xiaomi",
  "Honor",
  "Oppo",
  "Vivo",
  "Realme",
  "JBL",
  "LENYES",
  "UGREEN",
  "Anker",
  "Baseus",
  "Oraimo",
  "Other"
];

export default function ProductsTab({ 
  products, 
  onDelete, 
  onEdit, 
  onAdd 
}: { 
  products: Product[]; 
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onAdd: (categoryName?: string) => void;
}) {
  // Independent Filter States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [bulkBrand, setBulkBrand] = useState<string>("");
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Accordion Open States (Level 1: Category, Level 2: Brand)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});

  // 1. Standardize / Clean product classification helper
  const getProductCategory = (p: Product): string => {
    const rawCat = (p.category_name || p.categoryName || (p as any).category || "").trim();
    // Strip emojis
    const cleanCat = rawCat.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim();
    const name = p.name.toLowerCase();

    // If cleanCat matches known brand, infer real category from name
    const rawCatLower = cleanCat.toLowerCase();
    const isBrandAsCat = STANDARD_BRANDS.some((b) => b.toLowerCase() === rawCatLower);

    if (isBrandAsCat || !cleanCat || cleanCat === "General") {
      if (name.includes("iphone") || name.includes("galaxy") || name.includes("phone") || name.includes("5g") || name.includes("redmi note")) return "Smartphones";
      if (name.includes("headphone") || name.includes("headset")) return "Headphones";
      if (name.includes("buds") || name.includes("earbuds") || name.includes("tws") || name.includes("airpods")) return "Earbuds & TWS";
      if (name.includes("speaker") || name.includes("soundbar")) return "Speakers";
      if (name.includes("adapter") || name.includes("charger") || name.includes("fast charge")) return "Chargers & Adapters";
      if (name.includes("cable") || name.includes("usb-c") || name.includes("lightning")) return "Charging Cables";
      if (name.includes("power bank") || name.includes("mah")) return "Power Banks";
      if (name.includes("watch")) return "Smart Watches";
      if (name.includes("case") || name.includes("cover")) return "Phone Cases";
      if (name.includes("screen") || name.includes("glass") || name.includes("protector")) return "Screen Protectors";
      if (name.includes("macbook") || name.includes("laptop")) return "Laptops & MacBooks";
    }

    return cleanCat || "Smartphones";
  };

  const getProductBrand = (p: Product): string => {
    const rawBrand = (p.brand_name || p.brandName || p.brand || "").trim();
    if (rawBrand && rawBrand !== "Standard") return rawBrand;

    const rawCat = (p.category_name || p.categoryName || (p as any).category || "").trim();
    const name = p.name.toLowerCase();

    // Check if category field actually held brand
    const matchedBrand = STANDARD_BRANDS.find((b) => b.toLowerCase() === rawCat.toLowerCase());
    if (matchedBrand) return matchedBrand;

    // Check product title for brand
    if (name.includes("apple") || name.includes("iphone") || name.includes("airpods") || name.includes("macbook")) return "Apple";
    if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
    if (name.includes("redmi") || name.includes("xiaomi")) return "Redmi";
    if (name.includes("honor")) return "Honor";
    if (name.includes("jbl")) return "JBL";
    if (name.includes("lenyes")) return "LENYES";
    if (name.includes("ugreen")) return "UGREEN";
    if (name.includes("anker")) return "Anker";
    if (name.includes("baseus")) return "Baseus";
    if (name.includes("oraimo")) return "Oraimo";

    return "Other";
  };

  // Dynamically extract all unique categories across existing products & standard presets
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>(STANDARD_CATEGORIES);
    products.forEach((p) => {
      const cat = getProductCategory(p);
      if (cat && cat.trim()) {
        set.add(cat.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Dynamically extract all unique brands across existing products & standard presets
  const dynamicBrands = useMemo(() => {
    const set = new Set<string>(STANDARD_BRANDS);
    products.forEach((p) => {
      const brand = getProductBrand(p);
      if (brand && brand.trim() && brand !== "Standard") {
        set.add(brand.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // 2. Filter products based on search, separate Category dropdown, and separate Brand dropdown
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = getProductCategory(p);
      const brand = getProductBrand(p);

      const query = searchQuery.toLowerCase().trim();
      const name = p.name.toLowerCase();
      const code = (p.code || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        cat.toLowerCase().includes(query) ||
        brand.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        cat.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const matchesBrand =
        selectedBrandFilter === "all" ||
        brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, selectedCategoryFilter, selectedBrandFilter]);

  // 3. Level 1: Group by Category -> Level 2: Group by Brand
  const nestedHierarchy = useMemo(() => {
    const hierarchy: Record<string, Record<string, Product[]>> = {};

    filteredProducts.forEach((p) => {
      const cat = getProductCategory(p);
      const brand = getProductBrand(p);

      if (!hierarchy[cat]) hierarchy[cat] = {};
      if (!hierarchy[cat][brand]) hierarchy[cat][brand] = [];

      hierarchy[cat][brand].push(p);
    });

    return hierarchy;
  }, [filteredProducts]);

  const categoryKeys = useMemo(() => Object.keys(nestedHierarchy).sort(), [nestedHierarchy]);

  // Multi-select Handlers
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectGroup = (groupProds: Product[]) => {
    const groupIds = groupProds.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const selectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // Bulk Updates to Firestore
  const handleApplyBulkCategory = async () => {
    if (!bulkCategory || selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);

      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          category_name: bulkCategory,
          categoryName: bulkCategory,
          updated_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      alert(`Successfully updated Category to "${bulkCategory}" for ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      setBulkCategory("");
      window.location.reload();
    } catch (e) {
      console.error("Error bulk updating category:", e);
      alert("Failed to update products in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleApplyBulkBrand = async () => {
    if (!bulkBrand || selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);

      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          brand_name: bulkBrand,
          brandName: bulkBrand,
          brand: bulkBrand,
          updated_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      alert(`Successfully updated Brand to "${bulkBrand}" for ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      setBulkBrand("");
      window.location.reload();
    } catch (e) {
      console.error("Error bulk updating brand:", e);
      alert("Failed to update products in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  // 1-Click Catalog Auto-Standardizer across database
  const handleStandardizeCatalogData = async () => {
    if (!confirm("Standardize database? This will assign correct Category (Product Type) & Brand (Manufacturer) to all products.")) return;
    try {
      setIsNormalizing(true);
      const batch = writeBatch(db);
      let count = 0;

      products.forEach((p) => {
        const correctCat = getProductCategory(p);
        const correctBrand = getProductBrand(p);

        const pRef = doc(db, "products", p.id);
        batch.update(pRef, {
          category_name: correctCat,
          categoryName: correctCat,
          brand_name: correctBrand,
          brandName: correctBrand,
          brand: correctBrand,
          updated_at: new Date().toISOString(),
        });
        count++;
      });

      await batch.commit();
      alert(`Successfully standardized ${count} products in Firestore!`);
      window.location.reload();
    } catch (e) {
      console.error("Standardization failed:", e);
      alert("Failed to standardize database.");
    } finally {
      setIsNormalizing(false);
    }
  };

  // Metrics
  const totalCount = filteredProducts.length;
  const inStockCount = filteredProducts.filter((p) => p.stock_status === "in_stock").length;
  const lowStockCount = filteredProducts.filter((p) => p.stock_status === "low_stock").length;
  const outOfStockCount = filteredProducts.filter((p) => p.stock_status === "out_of_stock").length;

  return (
    <div className="space-y-6 relative pb-24">
      
      {/* ════════════════════════════════════════════════════════════════════
         1. UNIVERSAL TOP HEADER & ACTIONS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Product Catalog Architecture
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Level 1: Category &nbsp;→&nbsp; Level 2: Brand &nbsp;→&nbsp; Level 3: Products Data Table
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 1-Click Catalog Data Normalizer */}
          <button
            onClick={handleStandardizeCatalogData}
            disabled={isNormalizing}
            className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Auto-Fix Brand & Category for all products in database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isNormalizing ? "animate-spin" : ""}`} />
            <span>Auto-Fix All Catalog Data</span>
          </button>

          {/* Universal Add Product Button */}
          <button
            onClick={() => onAdd()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Universal Add Product</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         2. METRIC CARDS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-white/40">Total Filtered</p>
            <h4 className="text-xl font-black text-white mt-0.5">{totalCount} Products</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-white/40">In Stock</p>
            <h4 className="text-xl font-black text-emerald-400 mt-0.5">{inStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-white/40">Low Stock Alert</p>
            <h4 className="text-xl font-black text-amber-400 mt-0.5">{lowStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-white/40">Out of Stock</p>
            <h4 className="text-xl font-black text-red-400 mt-0.5">{outOfStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         3. SEPARATE FILTERS BAR (CATEGORY SELECTOR & BRAND SELECTOR)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search product name, code/SKU, category, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Separate Category Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">📁 All Categories ({dynamicCategories.length})</option>
              {dynamicCategories.map((cat) => (
                <option key={cat} value={cat}>📁 {cat}</option>
              ))}
            </select>
          </div>

          {/* Separate Brand Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">🏷️ All Brands ({dynamicBrands.length})</option>
              {dynamicBrands.map((b) => (
                <option key={b} value={b}>🏷️ {b}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Global Multi-Select All Checkbox */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <button
            type="button"
            onClick={selectAllFiltered}
            className="flex items-center gap-2 text-white/70 hover:text-white font-bold transition-colors"
          >
            {selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-white/40" />
            )}
            <span>
              {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0
                ? "Deselect All Products"
                : `Select All Filtered Products (${filteredProducts.length})`}
            </span>
          </button>

          {(selectedCategoryFilter !== "all" || selectedBrandFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryFilter("all");
                setSelectedBrandFilter("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-amber-400 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         4. 3-LEVEL NESTED HIERARCHY
            LEVEL 1: CATEGORY ACCORDION
            LEVEL 2: BRAND ACCORDION
            LEVEL 3: PRODUCTS TABLE (Stock, Price, Status, SKU)
      ════════════════════════════════════════════════════════════════════ */}
      {categoryKeys.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/40 space-y-2">
          <Package className="w-10 h-10 mx-auto text-white/20" />
          <p className="font-bold text-white text-sm">No products found matching filters</p>
          <p className="text-xs">Try selecting a different category or brand.</p>
        </div>
      ) : (
        categoryKeys.map((catKey) => {
          const brandMap = nestedHierarchy[catKey];
          const brandKeys = Object.keys(brandMap).sort();
          const isCategoryOpen = openCategories[catKey] ?? true;
          const totalCategoryProducts = brandKeys.reduce((acc, b) => acc + brandMap[b].length, 0);

          return (
            <div
              key={catKey}
              className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-1"
            >
              {/* LEVEL 1 ACCORDION HEADER: CATEGORY */}
              <div className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 to-slate-900 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenCategories((prev) => ({ ...prev, [catKey]: !(prev[catKey] ?? true) }))}
                  className="flex items-center gap-3 text-left"
                >
                  <span className="text-xs font-black px-3 py-1.5 rounded-xl border bg-blue-500/20 text-blue-400 border-blue-500/30 tracking-wide uppercase">
                    📁 LEVEL 1 CATEGORY: {catKey}
                  </span>
                  <span className="text-xs text-white/50 font-bold">
                    ({totalCategoryProducts} Products)
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                      isCategoryOpen ? "rotate-90 text-white" : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onAdd(catKey)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add to {catKey}
                </button>
              </div>

              {/* LEVEL 2 ACCORDIONS: BRANDS INSIDE THIS CATEGORY */}
              {isCategoryOpen && (
                <div className="p-4 space-y-4 bg-black/20">
                  {brandKeys.map((brandKey) => {
                    const brandProducts = brandMap[brandKey];
                    const brandAccordionId = `${catKey}_${brandKey}`;
                    const isBrandOpen = openBrands[brandAccordionId] ?? true;

                    return (
                      <div
                        key={brandAccordionId}
                        className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 shadow-lg"
                      >
                        {/* LEVEL 2 ACCORDION HEADER: BRAND */}
                        <div className="w-full flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenBrands((prev) => ({ ...prev, [brandAccordionId]: !(prev[brandAccordionId] ?? true) }))
                            }
                            className="flex items-center gap-3 text-left"
                          >
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg border bg-amber-500/15 text-amber-300 border-amber-500/30 uppercase tracking-wide">
                              🏷️ LEVEL 2 BRAND: {brandKey}
                            </span>
                            <span className="text-xs text-white/40 font-medium">
                              ({brandProducts.length} items)
                            </span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${
                                isBrandOpen ? "rotate-90 text-white" : ""
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSelectGroup(brandProducts)}
                            className="text-[11px] font-bold text-blue-400 hover:underline"
                          >
                            {brandProducts.every((p) => selectedProductIds.includes(p.id))
                              ? "Deselect Brand Items"
                              : "Select All in Brand"}
                          </button>
                        </div>

                        {/* LEVEL 3 DATA TABLE: PRODUCTS (Stock, Price, Status, SKU) */}
                        {isBrandOpen && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                  <th className="w-10 px-4 py-3 text-center">
                                    <span className="sr-only">Select</span>
                                  </th>
                                  <th className="px-4 py-3">Product Name & Code (SKU)</th>
                                  <th className="px-4 py-3">Selling & Regular Price</th>
                                  <th className="px-4 py-3">Stock Quantity</th>
                                  <th className="px-4 py-3">Stock Status</th>
                                  <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-xs">
                                {brandProducts.map((product) => {
                                  const isChecked = selectedProductIds.includes(product.id);

                                  return (
                                    <tr
                                      key={product.id}
                                      className={`transition-colors group ${
                                        isChecked ? "bg-blue-600/10" : "hover:bg-white/[0.02]"
                                      }`}
                                    >
                                      {/* Multi-Select Checkbox */}
                                      <td className="px-4 py-3.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => toggleSelectProduct(product.id)}
                                          className="text-white/60 hover:text-white"
                                        >
                                          {isChecked ? (
                                            <CheckSquare className="w-4 h-4 text-blue-400" />
                                          ) : (
                                            <Square className="w-4 h-4 text-white/30" />
                                          )}
                                        </button>
                                      </td>

                                      {/* Product Name & SKU */}
                                      <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0 shadow-sm">
                                            <img
                                              src={product.images[0] || "/placeholder.png"}
                                              alt={product.name}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop";
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                              {product.name}
                                            </span>
                                            {product.code ? (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400/80 mt-0.5">
                                                <Tag className="w-2.5 h-2.5" /> SKU: {product.code}
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-white/30 italic">No SKU assigned</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Price */}
                                      <td className="px-4 py-3.5">
                                        <div className="flex flex-col">
                                          <span className="text-xs font-black text-white">
                                            {formatPrice(product.price)}
                                          </span>
                                          {product.old_price && product.old_price > product.price && (
                                            <span className="text-[10px] text-white/30 line-through font-mono">
                                              {formatPrice(product.old_price)}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Stock Quantity */}
                                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-white/80">
                                        {product.stock_count ?? (product.stock_status === "in_stock" ? 15 : 0)} units
                                      </td>

                                      {/* Stock Status Badge */}
                                      <td className="px-4 py-3.5">
                                        <span
                                          className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                            product.stock_status === "in_stock"
                                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                              : product.stock_status === "low_stock"
                                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                              : "bg-red-500/10 text-red-400 border-red-500/20"
                                          }`}
                                        >
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              product.stock_status === "in_stock"
                                                ? "bg-emerald-400"
                                                : product.stock_status === "low_stock"
                                                ? "bg-amber-400"
                                                : "bg-red-400"
                                            }`}
                                          />
                                          {product.stock_status.replace("_", " ")}
                                        </span>
                                      </td>

                                      {/* Actions */}
                                      <td className="px-4 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => onEdit(product)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all shadow-sm"
                                            title="Edit Product"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => onDelete(product.id)}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all shadow-sm"
                                            title="Delete Product"
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ════════════════════════════════════════════════════════════════════
         5. STICKY BULK ACTIONS TOOLBAR (Appears when 1+ products selected)
      ════════════════════════════════════════════════════════════════════ */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-slate-900/95 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
          
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              {selectedProductIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-white">Products Selected for Bulk Action</p>
              <p className="text-[10px] text-white/50">Change Category or Brand simultaneously across all selected</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Bulk Category Change */}
            <div className="flex items-center gap-1">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none"
              >
                <option value="">-- Change Category --</option>
                {STANDARD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>📁 {c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyBulkCategory}
                disabled={!bulkCategory || isUpdatingBulk}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Apply
              </button>
            </div>

            {/* Bulk Brand Change */}
            <div className="flex items-center gap-1">
              <select
                value={bulkBrand}
                onChange={(e) => setBulkBrand(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-amber-400 focus:outline-none"
              >
                <option value="">-- Change Brand --</option>
                {STANDARD_BRANDS.map((b) => (
                  <option key={b} value={b}>🏷️ {b}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyBulkBrand}
                disabled={!bulkBrand || isUpdatingBulk}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded-xl text-xs font-bold shadow-md"
              >
                Apply
              </button>
            </div>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs font-bold ml-auto"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
