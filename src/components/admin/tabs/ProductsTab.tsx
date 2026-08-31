"use client";

import React, { useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Brand } from "@/lib/types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch, setDoc } from "firebase/firestore";
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
  Layers,
  Star,
  Rocket,
  Flame,
  Zap,
  X,
  RotateCcw,
} from "lucide-react";
import BulkOfferModal from "@/components/admin/BulkOfferModal";
import {
  getProductCategory,
  getProductBrand,
  sanitizeCategoriesList,
  sanitizeBrandsList,
  STANDARD_CATEGORIES,
  STANDARD_BRANDS,
} from "@/lib/catalog-utils";

export default function ProductsTab({ 
  products, 
  onDelete, 
  onEdit, 
  onAdd,
  categories = [],
  brands = []
}: { 
  products: Product[]; 
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onAdd: (categoryName?: string) => void;
  categories?: Category[];
  brands?: Brand[];
}) {
  // Independent Filter States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [selectedShowcaseFilter, setSelectedShowcaseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [isCustomBulkCategory, setIsCustomBulkCategory] = useState(false);
  const [customBulkCategoryText, setCustomBulkCategoryText] = useState("");

  const [bulkBrand, setBulkBrand] = useState<string>("");
  const [isCustomBulkBrand, setIsCustomBulkBrand] = useState(false);
  const [customBulkBrandText, setCustomBulkBrandText] = useState("");

  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Bulk Offer Campaign Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerModalCategory, setOfferModalCategory] = useState<string>("");
  const [offerModalBrand, setOfferModalBrand] = useState<string>("");
  const [offerModalSelectedIds, setOfferModalSelectedIds] = useState<string[]>([]);

  const handleOpenOfferModal = (category?: string, brand?: string, selectedIds?: string[]) => {
    setOfferModalCategory(category || "");
    setOfferModalBrand(brand || "");
    setOfferModalSelectedIds(selectedIds || []);
    setIsOfferModalOpen(true);
  };

  // Quick Stock Edit State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [isSavingStock, setIsSavingStock] = useState<boolean>(false);

  // Accordion Open States (Level 1: Category, Level 2: Brand)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});

  // Dynamic Categories list from presets + live Firestore categories prop + products (Strictly sanitized, 0% brands)
  const dynamicCategories = useMemo(() => {
    const fromProducts = products.map((p) => getProductCategory(p));
    const fromFirestore = categories.map((c) => c?.name || "");
    return sanitizeCategoriesList([...fromFirestore, ...fromProducts]);
  }, [categories, products]);

  // Dynamic Brands list from presets + live Firestore brands prop + products (Strictly sanitized, 0% categories)
  const dynamicBrands = useMemo(() => {
    const fromProducts = products.map((p) => getProductBrand(p));
    const fromFirestore = brands.map((b) => b?.name || "");
    return sanitizeBrandsList([...fromFirestore, ...fromProducts]);
  }, [brands, products]);

  // 2. Filter Products based on Independent Filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = getProductCategory(p);
      const brand = getProductBrand(p);

      const matchesCat =
        selectedCategoryFilter === "all" ||
        cat.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const matchesBrand =
        selectedBrandFilter === "all" ||
        brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      let matchesShowcase = true;
      if (selectedShowcaseFilter === "featured") {
        matchesShowcase = Boolean(p.featured);
      } else if (selectedShowcaseFilter === "new_arrival") {
        matchesShowcase = Boolean(p.is_new_arrival);
      } else if (selectedShowcaseFilter === "discounted") {
        matchesShowcase = Boolean(p.old_price && p.old_price > p.price);
      } else if (selectedShowcaseFilter === "low_stock") {
        const qty = p.variant_combos && p.variant_combos.length > 0
          ? p.variant_combos.reduce((s, v) => s + (Number(v.stock_quantity) || 0), 0)
          : Number(p.stock_quantity ?? p.stock_count ?? (p as any).stock ?? 0);
        matchesShowcase = p.stock_status === "low_stock" || (qty > 0 && qty <= 5);
      } else if (selectedShowcaseFilter === "out_of_stock") {
        const qty = p.variant_combos && p.variant_combos.length > 0
          ? p.variant_combos.reduce((s, v) => s + (Number(v.stock_quantity) || 0), 0)
          : Number(p.stock_quantity ?? p.stock_count ?? (p as any).stock ?? 0);
        matchesShowcase = p.stock_status === "out_of_stock" || qty === 0;
      }

      // Robust Multi-Keyword Search across all product attributes
      const queryWords = searchQuery
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (queryWords.length === 0) {
        return matchesCat && matchesBrand && matchesShowcase;
      }

      const productSearchText = [
        p.name || "",
        p.code || "",
        p.slug || "",
        (p as any).sku || "",
        brand,
        cat,
        p.category_name || "",
        p.category_id || "",
        p.brand_name || "",
        p.brand || "",
        p.description || "",
        p.delivery_info || "",
        ...(p.colors || []),
        ...(p.storage_options || []),
        ...(p.variant_combos?.map((v) => `${v.sku || ""} ${v.color_name || ""} ${v.storage || ""}`) || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = queryWords.every((word) => productSearchText.includes(word));

      return matchesCat && matchesBrand && matchesShowcase && matchesSearch;
    });
  }, [products, selectedCategoryFilter, selectedBrandFilter, selectedShowcaseFilter, searchQuery]);

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

  // 1-Click Fast Toggle Featured State
  const handleToggleFeatured = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const newFeatured = !product.featured;
      product.featured = newFeatured; // optimistic
      await updateDoc(doc(db, "products", product.id), {
        featured: newFeatured,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
      alert("Failed to update Featured status.");
    }
  };

  // 1-Click Fast Toggle New Arrival State
  const handleToggleNewArrival = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const newArrival = !product.is_new_arrival;
      product.is_new_arrival = newArrival; // optimistic
      await updateDoc(doc(db, "products", product.id), {
        is_new_arrival: newArrival,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to toggle new arrival:", err);
      alert("Failed to update New Arrival status.");
    }
  };

  // Bulk Set Featured State
  const handleBulkSetFeatured = async (featuredState: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);
      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          featured: featuredState,
          updated_at: new Date().toISOString(),
        });
      });
      await batch.commit();
      alert(`Successfully ${featuredState ? "marked as Featured" : "unfeatured"} ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      window.location.reload();
    } catch (err) {
      console.error("Bulk featured update failed:", err);
      alert("Failed to update featured status in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  // Bulk Set New Arrival State
  const handleBulkSetNewArrival = async (newArrivalState: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);
      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          is_new_arrival: newArrivalState,
          updated_at: new Date().toISOString(),
        });
      });
      await batch.commit();
      alert(`Successfully ${newArrivalState ? "marked as New Arrival" : "removed from New Arrivals"} for ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      window.location.reload();
    } catch (err) {
      console.error("Bulk new arrival update failed:", err);
      alert("Failed to update new arrival status in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  // Quick Inline Stock Editor Save Handler
  const handleQuickStockSave = async (product: Product) => {
    try {
      setIsSavingStock(true);
      const newQty = Math.max(0, Number(tempStockValue) || 0);
      const newStatus = newQty === 0 ? "out_of_stock" : newQty <= 5 ? "low_stock" : "in_stock";

      let updatedVariants = product.variant_combos;
      if (Array.isArray(updatedVariants) && updatedVariants.length > 0) {
        updatedVariants = updatedVariants.map((v) => ({
          ...v,
          stock_quantity: newQty,
          available_stock: newQty,
        }));
      }

      const updateData: Record<string, any> = {
        stock_quantity: newQty,
        stock_count: newQty,
        stock_status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (updatedVariants) updateData.variant_combos = updatedVariants;

      await setDoc(doc(db, "products", product.id), updateData, { merge: true });

      product.stock_quantity = newQty;
      product.stock_count = newQty;
      product.stock_status = newStatus;
      if (updatedVariants) product.variant_combos = updatedVariants;
      setEditingStockId(null);
    } catch (e) {
      console.error("Failed to update stock:", e);
      alert("Failed to update stock quantity.");
    } finally {
      setIsSavingStock(false);
    }
  };

  // Bulk Updates to Firestore
  const handleApplyBulkCategory = async () => {
    const finalCategory = isCustomBulkCategory ? customBulkCategoryText.trim() : bulkCategory.trim();
    if (!finalCategory || selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);

      const targetSlug = finalCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          category_name: finalCategory,
          categoryName: finalCategory,
          category_slug: targetSlug,
          categorySlug: targetSlug,
          categoryId: targetSlug,
          category_id: targetSlug,
          category: finalCategory,
          updated_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      alert(`Successfully updated Category to "${finalCategory}" for ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      setBulkCategory("");
      setCustomBulkCategoryText("");
      setIsCustomBulkCategory(false);
      window.location.reload();
    } catch (e) {
      console.error("Error bulk updating category:", e);
      alert("Failed to update products in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleApplyBulkBrand = async () => {
    const finalBrand = isCustomBulkBrand ? customBulkBrandText.trim() : bulkBrand.trim();
    if (!finalBrand || selectedProductIds.length === 0) return;
    try {
      setIsUpdatingBulk(true);
      const batch = writeBatch(db);

      selectedProductIds.forEach((id) => {
        const pRef = doc(db, "products", id);
        batch.update(pRef, {
          brand_name: finalBrand,
          brandName: finalBrand,
          brand: finalBrand,
          updated_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      alert(`Successfully updated Brand to "${finalBrand}" for ${selectedProductIds.length} products!`);
      setSelectedProductIds([]);
      setBulkBrand("");
      setCustomBulkBrandText("");
      setIsCustomBulkBrand(false);
      window.location.reload();
    } catch (e) {
      console.error("Error bulk updating brand:", e);
      alert("Failed to update products in bulk.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  // Single Product Quick Reassign State (Level 1 Category & Level 2 Brand)
  const [reassignProduct, setReassignProduct] = useState<Product | null>(null);
  const [targetNewCategory, setTargetNewCategory] = useState<string>("");
  const [isCustomReassignCategory, setIsCustomReassignCategory] = useState<boolean>(false);
  const [customReassignCategoryText, setCustomReassignCategoryText] = useState<string>("");
  const [targetNewBrand, setTargetNewBrand] = useState<string>("");
  const [isCustomReassignBrand, setIsCustomReassignBrand] = useState<boolean>(false);
  const [customReassignBrandText, setCustomReassignBrandText] = useState<string>("");
  const [isReassigning, setIsReassigning] = useState<boolean>(false);

  const handleOpenReassign = (product: Product) => {
    setReassignProduct(product);
    const curCat = getProductCategory(product);
    const curBrand = getProductBrand(product);
    setTargetNewCategory(curCat);
    setIsCustomReassignCategory(false);
    setCustomReassignCategoryText("");
    setTargetNewBrand(curBrand);
    setIsCustomReassignBrand(false);
    setCustomReassignBrandText("");
  };

  const handleSaveReassign = async () => {
    if (!reassignProduct) return;
    const finalCat = isCustomReassignCategory ? customReassignCategoryText.trim() : targetNewCategory.trim();
    const finalBrand = isCustomReassignBrand ? customReassignBrandText.trim() : targetNewBrand.trim();

    if (!finalCat) {
      alert("Please select or enter a Category.");
      return;
    }
    if (!finalBrand) {
      alert("Please select or enter a Brand.");
      return;
    }

    try {
      setIsReassigning(true);
      const catSlug = finalCat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const brandSlug = finalBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const updatePayload: Record<string, any> = {
        category_name: finalCat,
        categoryName: finalCat,
        category: finalCat,
        category_slug: catSlug,
        categorySlug: catSlug,
        categoryId: `cat-${catSlug}`,
        category_id: `cat-${catSlug}`,
        brand: finalBrand,
        brand_name: finalBrand,
        brandName: finalBrand,
        brand_id: `brand-${brandSlug}`,
        brand_slug: brandSlug,
        brandId: `brand-${brandSlug}`,
        brandSlug: brandSlug,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "products", reassignProduct.id), updatePayload);

      // Optimistic update on current product object
      Object.assign(reassignProduct, updatePayload);

      // Auto expand the new target accordion
      setOpenCategories((prev) => ({ ...prev, [finalCat]: true }));
      setOpenBrands((prev) => ({ ...prev, [`${finalCat}__${finalBrand}`]: true }));

      alert(`Successfully moved "${reassignProduct.name}" to Level 1: [${finalCat}] → Level 2: [${finalBrand}]!`);
      setReassignProduct(null);
    } catch (err) {
      console.error("Failed to reassign category and brand:", err);
      alert("Failed to move product. Please try again.");
    } finally {
      setIsReassigning(false);
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
  const totalFeaturedCount = products.filter((p) => p.featured).length;
  const totalNewArrivalsCount = products.filter((p) => p.is_new_arrival).length;
  const inStockCount = filteredProducts.filter((p) => p.stock_status === "in_stock").length;
  const lowStockCount = filteredProducts.filter((p) => p.stock_status === "low_stock").length;
  const outOfStockCount = filteredProducts.filter((p) => p.stock_status === "out_of_stock").length;

  return (
    <div className="space-y-6 relative pb-24 font-outfit">
      
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
            Level 1: Category &nbsp;→&nbsp; Level 2: Brand &nbsp;→&nbsp; Level 3: Products Data Table (Featured ⭐, New Arrivals 🚀, Stock &amp; Offers)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand & Category Offer Manager Button */}
          <button
            onClick={() => handleOpenOfferModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            title="Apply Category / Brand / Catalog Promotional Offers & Discounts"
          >
            <Tag className="w-4 h-4 stroke-[2.5]" />
            <span>Bulk Offer Manager</span>
          </button>

          {/* 1-Click Catalog Data Normalizer */}
          <button
            onClick={handleStandardizeCatalogData}
            disabled={isNormalizing}
            className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Auto-Fix Brand & Category for all products in database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isNormalizing ? "animate-spin" : ""}`} />
            <span>Auto-Fix All Catalog Data</span>
          </button>

          {/* Universal Add Product Button */}
          <button
            onClick={() => onAdd()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         2. METRIC CARDS (Includes Featured & New Arrivals Counters)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-medium text-white/40">Total Filtered</p>
            <h4 className="text-lg font-black text-white mt-0.5">{totalCount}</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-4 h-4" />
          </div>
        </div>

        {/* Featured Products Counter */}
        <button
          type="button"
          onClick={() => setSelectedShowcaseFilter(selectedShowcaseFilter === "featured" ? "all" : "featured")}
          className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-md text-left transition-all cursor-pointer ${
            selectedShowcaseFilter === "featured"
              ? "bg-amber-500/20 border-amber-500/60 ring-2 ring-amber-500/30"
              : "bg-slate-900/60 border-white/10 hover:border-amber-500/30"
          }`}
        >
          <div>
            <p className="text-[11px] font-medium text-amber-300">Featured</p>
            <h4 className="text-lg font-black text-amber-400 mt-0.5">{totalFeaturedCount} ⭐</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-4 h-4 fill-current" />
          </div>
        </button>

        {/* New Arrivals Counter */}
        <button
          type="button"
          onClick={() => setSelectedShowcaseFilter(selectedShowcaseFilter === "new_arrival" ? "all" : "new_arrival")}
          className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-md text-left transition-all cursor-pointer ${
            selectedShowcaseFilter === "new_arrival"
              ? "bg-blue-500/20 border-blue-500/60 ring-2 ring-blue-500/30"
              : "bg-slate-900/60 border-white/10 hover:border-blue-500/30"
          }`}
        >
          <div>
            <p className="text-[11px] font-medium text-blue-300">New Arrivals</p>
            <h4 className="text-lg font-black text-blue-400 mt-0.5">{totalNewArrivalsCount} 🚀</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Rocket className="w-4 h-4" />
          </div>
        </button>

        <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-medium text-white/40">In Stock</p>
            <h4 className="text-lg font-black text-emerald-400 mt-0.5">{inStockCount}</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-medium text-white/40">Low Stock</p>
            <h4 className="text-lg font-black text-amber-400 mt-0.5">{lowStockCount}</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-medium text-white/40">Out of Stock</p>
            <h4 className="text-lg font-black text-red-400 mt-0.5">{outOfStockCount}</h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         3. SEPARATE FILTERS BAR (CATEGORY, BRAND & SHOWCASE / SPECIAL FILTER)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search product name, code (e.g. SM-101), brand, category, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Separate Category Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">📁 All Categories ({dynamicCategories.length})</option>
              {dynamicCategories.map((cat) => (
                <option key={cat} value={cat}>📁 {cat}</option>
              ))}
            </select>
          </div>

          {/* Separate Brand Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">🏷️ All Brands ({dynamicBrands.length})</option>
              {dynamicBrands.map((b) => (
                <option key={b} value={b}>🏷️ {b}</option>
              ))}
            </select>
          </div>

          {/* Showcase / Special Tag Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedShowcaseFilter}
              onChange={(e) => setSelectedShowcaseFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-amber-500/40 rounded-xl text-xs font-black text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">✨ All Showcases &amp; Badges</option>
              <option value="featured">⭐ Featured Products Only ({totalFeaturedCount})</option>
              <option value="new_arrival">🚀 New Arrivals Only ({totalNewArrivalsCount})</option>
              <option value="discounted">🏷️ On Sale / Discounted Products</option>
              <option value="low_stock">⚠️ Low Stock Alerts</option>
              <option value="out_of_stock">❌ Out of Stock</option>
            </select>
          </div>

        </div>

        {/* Active Search Results Feedback Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Showing results for <strong>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <strong>{filteredProducts.length} product(s)</strong> found
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] text-blue-400 hover:text-blue-200 underline font-bold cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Global Multi-Select All Checkbox */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllFiltered}
            className="flex items-center gap-2 text-white/70 hover:text-white font-bold transition-colors cursor-pointer"
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

          {(selectedCategoryFilter !== "all" || selectedBrandFilter !== "all" || selectedShowcaseFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryFilter("all");
                setSelectedBrandFilter("all");
                setSelectedShowcaseFilter("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         4. 3-LEVEL NESTED HIERARCHY
            LEVEL 1: CATEGORY ACCORDION
            LEVEL 2: BRAND ACCORDION
            LEVEL 3: PRODUCTS TABLE (Featured ⭐, New Arrival 🚀, Stock, Price, SKU)
      ════════════════════════════════════════════════════════════════════ */}
      {categoryKeys.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/40 space-y-3">
          <Package className="w-12 h-12 mx-auto text-white/20" />
          <div>
            <p className="font-bold text-white text-sm">
              {searchQuery ? `No products found matching "${searchQuery}"` : "No products found matching filters"}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {searchQuery
                ? "Check spelling, try partial name, product code (e.g. SM-101), or clear filters."
                : "Try resetting or changing your category, brand, or showcase filter."}
            </p>
          </div>
          {(searchQuery || selectedCategoryFilter !== "all" || selectedBrandFilter !== "all" || selectedShowcaseFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("all");
                setSelectedBrandFilter("all");
                setSelectedShowcaseFilter("all");
              }}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search &amp; Filters</span>
            </button>
          )}
        </div>
      ) : (
        categoryKeys.map((catKey) => {
          const brandMap = nestedHierarchy[catKey];
          const brandKeys = Object.keys(brandMap).sort();
          // Auto-expand all matching categories if search is active
          const isCategoryOpen = searchQuery.trim().length > 0 ? true : (openCategories[catKey] ?? true);
          const totalCategoryProducts = brandKeys.reduce((acc, b) => acc + brandMap[b].length, 0);

          return (
            <div
              key={catKey}
              className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-1"
            >
              {/* LEVEL 1 ACCORDION HEADER: CATEGORY */}
              <div className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 to-slate-900 border-b border-white/10 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOpenCategories((prev) => ({ ...prev, [catKey]: !(prev[catKey] ?? true) }))}
                  className="flex items-center gap-3 text-left cursor-pointer"
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

                <div className="flex items-center gap-2">
                  {/* Category Offer Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenOfferModal(catKey);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    title={`Apply Offer to all ${catKey} products`}
                  >
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>Offer for {catKey}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAdd(catKey)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add to {catKey}
                  </button>
                </div>
              </div>

              {/* LEVEL 2 ACCORDIONS: BRANDS INSIDE THIS CATEGORY */}
              {isCategoryOpen && (
                <div className="p-4 space-y-4 bg-black/20">
                  {brandKeys.map((brandKey) => {
                    const brandProducts = brandMap[brandKey];
                    const brandAccordionId = `${catKey}_${brandKey}`;
                    // Auto-expand all matching brands if search is active
                    const isBrandOpen = searchQuery.trim().length > 0 ? true : (openBrands[brandAccordionId] ?? true);

                    return (
                      <div
                        key={brandAccordionId}
                        className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 shadow-lg"
                      >
                        {/* LEVEL 2 ACCORDION HEADER: BRAND */}
                        <div className="w-full flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenBrands((prev) => ({ ...prev, [brandAccordionId]: !(prev[brandAccordionId] ?? true) }))
                            }
                            className="flex items-center gap-3 text-left cursor-pointer"
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

                          <div className="flex items-center gap-3">
                            {/* Brand Offer Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenOfferModal(catKey, brandKey);
                              }}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              title={`Apply Offer to ${brandKey} in ${catKey}`}
                            >
                              <Tag className="w-2.5 h-2.5 text-amber-400" />
                              <span>Offer for {brandKey}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleSelectGroup(brandProducts)}
                              className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer"
                            >
                              {brandProducts.every((p) => selectedProductIds.includes(p.id))
                                ? "Deselect Brand Items"
                                : "Select All in Brand"}
                            </button>
                          </div>
                        </div>

                        {/* LEVEL 3 DATA TABLE: PRODUCTS */}
                        {isBrandOpen && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-white/5 bg-black/40 text-white/40 font-semibold tracking-wider uppercase text-[10px]">
                                  <th className="py-3 px-4 w-10 text-center">
                                    <input
                                      type="checkbox"
                                      aria-label={`Select all ${brandKey} products`}
                                      checked={brandProducts.every((p) => selectedProductIds.includes(p.id))}
                                      onChange={() => toggleSelectGroup(brandProducts)}
                                      className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                                    />
                                  </th>
                                  <th className="py-3 px-4">Product Name &amp; SKU</th>
                                  <th className="py-3 px-4">Featured &amp; New Arrival</th>
                                  <th className="py-3 px-4">Price / Old Price</th>
                                  <th className="py-3 px-4">Stock Quantity</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-white/80">
                                {brandProducts.map((product) => {
                                  const isSelected = selectedProductIds.includes(product.id);
                                  const hasVariants = Boolean(product.has_variants && product.variant_combos?.length);
                                  const stockQty = product.variant_combos && product.variant_combos.length > 0
                                    ? product.variant_combos.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
                                    : Number(product.stock_quantity ?? product.stock_count ?? (product as any).stock ?? 0);
                                  const isEditingStock = editingStockId === product.id;
                                  const isFeatured = Boolean(product.featured);
                                  const isNew = Boolean(product.is_new_arrival);

                                  return (
                                    <tr
                                      key={product.id}
                                      className={`hover:bg-white/[0.02] transition-colors ${
                                        isSelected ? "bg-blue-600/10" : ""
                                      }`}
                                    >
                                      {/* Checkbox */}
                                      <td className="py-3 px-4 text-center">
                                        <input
                                          type="checkbox"
                                          aria-label={`Select product ${product.name}`}
                                          checked={isSelected}
                                          onChange={() => toggleSelectProduct(product.id)}
                                          className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                                        />
                                      </td>

                                      {/* Name & SKU */}
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          {product.images && product.images[0] ? (
                                            <img
                                              src={product.images[0]}
                                              alt={product.name}
                                              className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1 border border-white/10 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white/30 shrink-0">
                                              <Smartphone className="w-5 h-5" />
                                            </div>
                                          )}
                                          <div className="space-y-0.5">
                                            <p className="font-bold text-white leading-tight">
                                              {product.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-white/40 flex-wrap">
                                              <span>SKU: {product.sku || product.code || "N/A"}</span>
                                              {hasVariants && (
                                                <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-semibold">
                                                  {product.variant_combos?.length} Variants
                                                </span>
                                              )}
                                            </div>
                                            {/* 🔄 Fast Change Category & Brand Button */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenReassign(product)}
                                              className="inline-flex items-center gap-1 text-[10px] text-purple-300 hover:text-purple-100 bg-purple-500/15 hover:bg-purple-500/30 px-2 py-0.5 rounded-md border border-purple-500/30 transition-colors cursor-pointer font-bold mt-1"
                                              title="Click to manually change Level 1 Category or Level 2 Brand"
                                            >
                                              <FolderTree className="w-3 h-3 text-purple-400" />
                                              <span>📁 {getProductCategory(product)} &rarr; 🏷️ {getProductBrand(product)}</span>
                                            </button>
                                          </div>
                                        </div>
                                      </td>

                                      {/* 1-CLICK FEATURED & NEW ARRIVAL SHOWCASE TOGGLES */}
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {/* ⭐ Featured Toggle Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => handleToggleFeatured(product, e)}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                                              isFeatured
                                                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm hover:bg-amber-500/30"
                                                : "bg-white/5 text-white/40 border-white/10 hover:text-amber-300 hover:border-amber-500/30"
                                            }`}
                                            title={isFeatured ? "Click to remove from Featured" : "Click to mark as Featured product"}
                                          >
                                            <Star className={`w-3 h-3 ${isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                                            <span>{isFeatured ? "Featured" : "Feature"}</span>
                                          </button>

                                          {/* 🚀 New Arrival Toggle Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => handleToggleNewArrival(product, e)}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                                              isNew
                                                ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm hover:bg-blue-500/30"
                                                : "bg-white/5 text-white/40 border-white/10 hover:text-blue-300 hover:border-blue-500/30"
                                            }`}
                                            title={isNew ? "Click to remove from New Arrivals" : "Click to mark as New Arrival"}
                                          >
                                            <Rocket className={`w-3 h-3 ${isNew ? "text-blue-400" : ""}`} />
                                            <span>{isNew ? "New Arrival" : "Mark New"}</span>
                                          </button>
                                        </div>
                                      </td>

                                      {/* Price */}
                                      <td className="py-3 px-4">
                                        <p className="font-black text-white text-sm">
                                          {formatPrice(product.price)}
                                        </p>
                                        {product.old_price && product.old_price > product.price && (
                                          <p className="text-[10px] text-white/40 line-through">
                                            {formatPrice(product.old_price)}
                                          </p>
                                        )}
                                      </td>

                                      {/* Stock Quantity with Inline Quick Editor */}
                                      <td className="py-3 px-4">
                                        {isEditingStock ? (
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="number"
                                              min="0"
                                              value={tempStockValue}
                                              onChange={(e) => setTempStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                                              className="w-16 px-2 py-1 bg-black border border-blue-500 rounded-lg text-xs font-bold text-white focus:outline-none"
                                              autoFocus
                                            />
                                            <button
                                              onClick={() => handleQuickStockSave(product)}
                                              disabled={isSavingStock}
                                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            >
                                              {isSavingStock ? "..." : "✓"}
                                            </button>
                                            <button
                                              onClick={() => setEditingStockId(null)}
                                              className="px-1.5 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 group/stock">
                                            <span className={`font-bold ${stockQty === 0 ? "text-red-400" : stockQty <= 5 ? "text-amber-400" : "text-emerald-400"}`}>
                                              {stockQty} Units
                                            </span>
                                            <button
                                              onClick={() => {
                                                setEditingStockId(product.id);
                                                setTempStockValue(stockQty);
                                              }}
                                              className="opacity-0 group-hover/stock:opacity-100 text-[10px] text-blue-400 hover:underline cursor-pointer transition-opacity"
                                              title="Quick edit stock"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        )}
                                      </td>

                                      {/* Status */}
                                      <td className="py-3 px-4">
                                        {product.stock_status === "in_stock" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <CheckCircle2 className="w-3 h-3" /> In Stock
                                          </span>
                                        )}
                                        {product.stock_status === "low_stock" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            <AlertTriangle className="w-3 h-3" /> Low Stock
                                          </span>
                                        )}
                                        {product.stock_status === "out_of_stock" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                            <XCircle className="w-3 h-3" /> Out of Stock
                                          </span>
                                        )}
                                      </td>

                                      {/* Actions */}
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => handleOpenReassign(product)}
                                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors cursor-pointer"
                                            title="Change Category & Brand (Move Product)"
                                          >
                                            <FolderTree className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => onEdit(product)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                                            title="Edit Product"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => onDelete(product.id)}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl bg-slate-900/95 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
          
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              {selectedProductIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-white">Products Selected for Bulk Action</p>
              <p className="text-[10px] text-white/50">Manage Featured ⭐, New Arrivals 🚀, Offers, Category or Brand</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Bulk Featured Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(true)}
                disabled={isUpdatingBulk}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                title="Mark all selected products as Featured"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>⭐ Feature ({selectedProductIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(false)}
                disabled={isUpdatingBulk}
                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
                title="Unmark from Featured"
              >
                Unfeature
              </button>
            </div>

            {/* Bulk New Arrival Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleBulkSetNewArrival(true)}
                disabled={isUpdatingBulk}
                className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                title="Mark all selected products as New Arrival"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>🚀 Mark New</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetNewArrival(false)}
                disabled={isUpdatingBulk}
                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
                title="Remove from New Arrivals"
              >
                Remove New
              </button>
            </div>

            {/* Bulk Offer / Discount Button */}
            <button
              type="button"
              onClick={() => handleOpenOfferModal(undefined, undefined, selectedProductIds)}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Apply discount or promotional price to selected products"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Apply Offer</span>
            </button>

            {/* Bulk Category Change (Level 1) */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-white/50">📁 Cat:</span>
              {isCustomBulkCategory ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={customBulkCategoryText}
                    onChange={(e) => setCustomBulkCategoryText(e.target.value)}
                    className="px-2.5 py-1.5 bg-zinc-950 border border-blue-500/60 rounded-xl text-xs font-bold text-blue-400 focus:outline-none w-28"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomBulkCategory(false)}
                    className="px-1.5 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px]"
                  >
                    List
                  </button>
                </div>
              ) : (
                <select
                  value={bulkCategory}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomBulkCategory(true);
                      setBulkCategory("");
                    } else {
                      setBulkCategory(e.target.value);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none max-w-[130px]"
                >
                  <option value="">Select Category</option>
                  {dynamicCategories.map((c) => (
                    <option key={c} value={c}>📁 {c}</option>
                  ))}
                  <option value="__custom__" className="text-blue-400 font-black">+ Custom...</option>
                </select>
              )}
              <button
                type="button"
                onClick={handleApplyBulkCategory}
                disabled={(!bulkCategory && !customBulkCategoryText.trim()) || isUpdatingBulk}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
                title="Change Level 1 Category for selected products"
              >
                Set
              </button>
            </div>

            {/* Bulk Brand Change (Level 2) */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-white/50">🏷️ Brand:</span>
              {isCustomBulkBrand ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="New brand..."
                    value={customBulkBrandText}
                    onChange={(e) => setCustomBulkBrandText(e.target.value)}
                    className="px-2.5 py-1.5 bg-zinc-950 border border-amber-500/60 rounded-xl text-xs font-bold text-amber-300 focus:outline-none w-28"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomBulkBrand(false)}
                    className="px-1.5 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px]"
                  >
                    List
                  </button>
                </div>
              ) : (
                <select
                  value={bulkBrand}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomBulkBrand(true);
                      setBulkBrand("");
                    } else {
                      setBulkBrand(e.target.value);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-white/20 rounded-xl text-xs font-bold text-amber-300 focus:outline-none max-w-[130px]"
                >
                  <option value="">Select Brand</option>
                  {dynamicBrands.map((b) => (
                    <option key={b} value={b}>🏷️ {b}</option>
                  ))}
                  <option value="__custom__" className="text-amber-400 font-black">+ Custom...</option>
                </select>
              )}
              <button
                type="button"
                onClick={handleApplyBulkBrand}
                disabled={(!bulkBrand && !customBulkBrandText.trim()) || isUpdatingBulk}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
                title="Change Level 2 Brand for selected products"
              >
                Set
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedProductIds([]);
                setIsCustomBulkCategory(false);
                setIsCustomBulkBrand(false);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs font-bold ml-auto cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
         6. BRAND & CATEGORY BULK OFFER MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <BulkOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        products={products}
        categories={dynamicCategories}
        brands={dynamicBrands}
        initialCategory={offerModalCategory}
        initialBrand={offerModalBrand}
        initialSelectedIds={offerModalSelectedIds}
      />

      {/* ════════════════════════════════════════════════════════════════════
         7. QUICK REASSIGN CATEGORY (LEVEL 1) & BRAND (LEVEL 2) MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {reassignProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Change Category &amp; Brand</h3>
                  <p className="text-xs text-white/50">Move product across Level 1 Category &amp; Level 2 Brand</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReassignProduct(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              {reassignProduct.images && reassignProduct.images[0] ? (
                <img
                  src={reassignProduct.images[0]}
                  alt=""
                  className="w-12 h-12 object-contain rounded-xl bg-black/40 p-1 border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white/40 shrink-0">
                  <Package className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">{reassignProduct.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50 flex-wrap">
                  <span>Current: <strong>📁 {getProductCategory(reassignProduct)}</strong></span>
                  <span>&rarr;</span>
                  <span><strong>🏷️ {getProductBrand(reassignProduct)}</strong></span>
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4 text-xs">
              {/* 1. Level 1: Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-white/80">1. Level 1 Category (Product Type)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomReassignCategory(!isCustomReassignCategory);
                      if (!isCustomReassignCategory) setCustomReassignCategoryText("");
                    }}
                    className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    {isCustomReassignCategory ? "Select from List" : "+ New Custom Category"}
                  </button>
                </div>

                {isCustomReassignCategory ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type custom category name (e.g. Smart Projector)"
                    value={customReassignCategoryText}
                    onChange={(e) => setCustomReassignCategoryText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-blue-500/50 rounded-xl text-white font-semibold outline-none focus:border-blue-400"
                  />
                ) : (
                  <select
                    value={targetNewCategory}
                    onChange={(e) => setTargetNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white font-bold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {dynamicCategories.map((c) => (
                      <option key={c} value={c}>📁 {c}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Level 2: Brand */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-white/80">2. Level 2 Brand (Manufacturer)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomReassignBrand(!isCustomReassignBrand);
                      if (!isCustomReassignBrand) setCustomReassignBrandText("");
                    }}
                    className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    {isCustomReassignBrand ? "Select from List" : "+ New Custom Brand"}
                  </button>
                </div>

                {isCustomReassignBrand ? (
                  <input
                    type="text"
                    placeholder="Type custom brand name (e.g. Bose, Sony, Marshall)"
                    value={customReassignBrandText}
                    onChange={(e) => setCustomReassignBrandText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-amber-500/50 rounded-xl text-white font-semibold outline-none focus:border-amber-400"
                  />
                ) : (
                  <select
                    value={targetNewBrand}
                    onChange={(e) => setTargetNewBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-amber-300 font-bold outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {dynamicBrands.map((b) => (
                      <option key={b} value={b}>🏷️ {b}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReassignProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReassign}
                disabled={isReassigning || (!targetNewCategory && !customReassignCategoryText.trim()) || (!targetNewBrand && !customReassignBrandText.trim())}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isReassigning ? "Moving..." : "Save & Move Product"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
