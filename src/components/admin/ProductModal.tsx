"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Loader2,
  Plus,
  Trash2,
  Tag,
  HardDrive,
  Palette,
  ShieldCheck,
  Cpu,
  Save,
  Eye,
  Check,
  Sparkles,
  Search,
  Layers,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  Globe,
  Truck,
  CreditCard,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Product, Category, ProductColor, ProductVariantCombo, WarrantyOption, InventoryLog } from "@/lib/types";
import { db } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { PRESET_COLORS, getColorCSS, normalizeColor } from "@/lib/color-utils";
import { formatLKR } from "@/lib/order-utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categories: Category[];
  initialData?: Product | null;
}

const DEFAULT_BRANDS = ["Apple", "Samsung", "Xiaomi", "Redmi", "Google", "Oppo", "Vivo", "Realme", "OnePlus", "Honor", "Anker", "Soundcore", "Ugreen", "Baseus", "DJI", "CMF", "Wiwu", "Lenyes", "Hollyland"];
const DEFAULT_SPEC_KEYS = ["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "OS", "Network", "Sensors", "Weight"];
const PRESET_RAM = ["4GB", "6GB", "8GB", "12GB", "16GB"];
const PRESET_STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB"];

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}: ProductModalProps) {
  // Active Tab Index (1: Basic, 2: Media & Colours, 3: Variants & Stock, 4: Specifications, 5: Warranty, 6: Payments, 7: SEO)
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("Samsung");
  const [categoryId, setCategoryId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"active" | "draft">("active");

  // Pricing & Legacy Stock
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseOldPrice, setBaseOldPrice] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Payment Options
  const [allowCod, setAllowCod] = useState(true);
  const [allowCard, setAllowCard] = useState(true);
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState("1-3 Business Days Islandwide Courier Delivery");

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Specifications Key-Value Pairs
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>([]);

  // Colours List
  const [colorVariants, setColorVariants] = useState<ProductColor[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  // Variant Combinations
  const [variantCombos, setVariantCombos] = useState<ProductVariantCombo[]>([]);

  // Warranty Options
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>([]);

  // Initialize form when opening/editing
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setSlug(initialData.slug || "");
      setCategoryId(initialData.category_id || categories[0]?.id || "");
      setBrand(initialData.compatible_brands?.[0] || "Samsung");
      setDescription(initialData.description || "");
      setShortDesc(initialData.delivery_info || "");
      setFeatured(!!initialData.featured);
      setStatus("active");
      setBasePrice(initialData.price || 0);
      setBaseOldPrice(initialData.old_price || null);
      if (initialData.old_price && initialData.price && initialData.old_price > initialData.price) {
        setDiscountPercent(Math.round(((initialData.old_price - initialData.price) / initialData.old_price) * 100));
      } else {
        setDiscountPercent(0);
      }
      setAllowCod(initialData.allow_cod !== false);
      setAllowCard(initialData.allow_card !== false);
      setAllowWhatsapp(initialData.allow_whatsapp !== false);
      setDeliveryInfo(initialData.delivery_info || "1-3 Business Days Islandwide Courier Delivery");

      // Spec Rows
      const rows = Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value }));
      setSpecRows(rows.length > 0 ? rows : [{ key: "Display", value: "" }, { key: "Processor", value: "" }]);

      // Colours
      if (initialData.color_variants && initialData.color_variants.length > 0) {
        setColorVariants(initialData.color_variants);
      } else if (initialData.colors && initialData.colors.length > 0) {
        setColorVariants(
          initialData.colors.map((c, i) => ({
            id: `col-${i}`,
            name: c,
            hex: getColorCSS(c),
            images: initialData.images || [],
            is_default: i === 0,
            active: true,
          }))
        );
      } else {
        setColorVariants([
          {
            id: "col-default",
            name: "Standard Black",
            hex: "#000000",
            images: initialData.images || [],
            is_default: true,
            active: true,
          },
        ]);
      }

      // Variant Combos
      if (initialData.variant_combos && initialData.variant_combos.length > 0) {
        setVariantCombos(initialData.variant_combos);
      } else {
        setVariantCombos([
          {
            id: "v-1",
            color_name: initialData.colors?.[0] || "Standard Black",
            ram: "8GB",
            storage: "128GB",
            sku: initialData.code || `${initialData.slug}-8-128`,
            price: initialData.price || 0,
            old_price: initialData.old_price,
            stock_quantity: initialData.stock_count || 10,
            reserved_stock: 0,
            available_stock: initialData.stock_count || 10,
            low_stock_threshold: 3,
            status: "active",
          },
        ]);
      }

      // Warranty Options
      if (initialData.warranty_options && initialData.warranty_options.length > 0) {
        setWarrantyOptions(initialData.warranty_options);
      } else {
        setWarrantyOptions([
          {
            id: "w-1",
            title: initialData.warranty || "1 Month Limited Shop Warranty",
            type: "Shop Warranty",
            duration_value: 1,
            duration_unit: "months",
            additional_price: 0,
            coverage_details: "Hardware defect warranty from Street Mobile main store.",
            status: "active",
            is_default: true,
          },
          ...(initialData.brand_warranty
            ? [
                {
                  id: "w-2",
                  title: initialData.brand_warranty,
                  type: "Manufacturer Warranty" as const,
                  duration_value: 1,
                  duration_unit: "years" as const,
                  additional_price: 0,
                  coverage_details: "Official manufacturer warranty from authorized service center.",
                  status: "active" as const,
                },
              ]
            : []),
        ]);
      }
    } else {
      // Reset New Product
      setName("");
      setCode(`SM-${Math.floor(1000 + Math.random() * 9000)}`);
      setSlug("");
      setCategoryId(categories[0]?.id || "");
      setBrand("Samsung");
      setDescription("");
      setShortDesc("");
      setFeatured(false);
      setStatus("active");
      setBasePrice(0);
      setBaseOldPrice(null);
      setAllowCod(true);
      setAllowCard(true);
      setAllowWhatsapp(true);

      setSpecRows([
        { key: "Display", value: '6.7" Super AMOLED 120Hz' },
        { key: "Processor", value: "Octa-Core Flagship CPU" },
        { key: "Battery", value: "5000 mAh Fast Charging" },
      ]);

      setColorVariants([
        {
          id: "col-1",
          name: "Awesome Black",
          hex: "#000000",
          images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"],
          is_default: true,
          active: true,
        },
        {
          id: "col-2",
          name: "Awesome White",
          hex: "#FFFFFF",
          images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800"],
          is_default: false,
          active: true,
        },
      ]);

      setVariantCombos([
        {
          id: "v-1",
          color_name: "Awesome Black",
          ram: "8GB",
          storage: "128GB",
          sku: "SM-8-128-BLK",
          price: 165000,
          old_price: 175000,
          stock_quantity: 10,
          reserved_stock: 0,
          available_stock: 10,
          low_stock_threshold: 3,
          status: "active",
        },
        {
          id: "v-2",
          color_name: "Awesome Black",
          ram: "8GB",
          storage: "256GB",
          sku: "SM-8-256-BLK",
          price: 185000,
          old_price: 195000,
          stock_quantity: 5,
          reserved_stock: 0,
          available_stock: 5,
          low_stock_threshold: 2,
          status: "active",
        },
      ]);

      setWarrantyOptions([
        {
          id: "w-1",
          title: "1 Month Limited Shop Warranty",
          type: "Shop Warranty",
          duration_value: 1,
          duration_unit: "months",
          additional_price: 0,
          coverage_details: "Hardware defect warranty provided by Street Mobile Vavuniya.",
          status: "active",
          is_default: true,
        },
        {
          id: "w-2",
          title: "1 Year Official Brand Warranty",
          type: "Manufacturer Warranty",
          duration_value: 1,
          duration_unit: "years",
          additional_price: 0,
          coverage_details: "Official brand service center warranty.",
          status: "active",
        },
      ]);
    }

    setHasUnsavedChanges(false);
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  // Auto Generate Slug from Name
  const handleNameChange = (val: string) => {
    setName(val);
    setHasUnsavedChanges(true);
    if (!initialData) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // Add Custom Colour
  const handleAddColour = () => {
    if (!newColorName.trim()) return;
    const newCol: ProductColor = {
      id: `col-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      images: [],
      active: true,
      is_default: colorVariants.length === 0,
    };
    setColorVariants([...colorVariants, newCol]);
    setNewColorName("");
    setHasUnsavedChanges(true);
  };

  // Auto Generate Variant Combinations Matrix
  const handleGenerateCombinations = () => {
    const activeColors = colorVariants.filter((c) => c.active !== false);
    const newCombos: ProductVariantCombo[] = [];

    activeColors.forEach((col) => {
      PRESET_STORAGE.slice(1, 3).forEach((st) => {
        ["Physical SIM + eSIM", "eSIM Only (USA)"].forEach((sim) => {
          const skuStr = `${brand.slice(0, 3).toUpperCase()}-${col.name.slice(0, 3).toUpperCase()}-${st}-${sim.includes("eSIM Only") ? "ESIM" : "PHYS"}`;
          newCombos.push({
            id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            color_id: col.id,
            color_name: col.name,
            ram: "8GB",
            storage: st,
            sim_type: sim,
            sku: skuStr,
            price: basePrice || 150000,
            old_price: baseOldPrice,
            stock_quantity: 10,
            reserved_stock: 0,
            available_stock: 10,
            low_stock_threshold: 3,
            status: "active",
          });
        });
      });
    });

    setVariantCombos(newCombos);
    setHasUnsavedChanges(true);
  };

  // Save Product Handler
  const handleSaveProduct = async (publishStatus: "active" | "draft" = "active") => {
    if (!name.trim()) {
      alert("Please enter a Product Name.");
      setActiveTab(1);
      return;
    }

    try {
      setIsSubmitting(true);

      const categoryObj = categories.find((c) => c.id === categoryId);
      const categoryName = categoryObj?.name || "Mobile Phones";

      // Compute Total Stock from active variants
      const totalVariantStock = variantCombos.reduce((s, v) => s + (v.stock_quantity || 0), 0);
      const isOutOfStock = totalVariantStock === 0;

      // Extract all gallery images
      const allImages: string[] = [];
      colorVariants.forEach((c) => {
        if (c.images) allImages.push(...c.images);
      });
      const finalImages = allImages.length > 0 ? Array.from(new Set(allImages)) : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"];

      // First active price
      const primaryPrice = variantCombos[0]?.price || basePrice || 0;
      const primaryOldPrice = variantCombos[0]?.old_price || baseOldPrice || null;

      const productPayload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        code: code.trim(),
        category_id: categoryId,
        category_name: categoryName,
        price: primaryPrice,
        old_price: primaryOldPrice,
        description: description.trim(),
        delivery_info: deliveryInfo.trim(),
        stock_status: isOutOfStock ? "out_of_stock" : totalVariantStock <= 5 ? "low_stock" : "in_stock",
        stock_count: totalVariantStock,
        featured,
        images: finalImages,
        colors: colorVariants.map((c) => c.name),
        color_variants: colorVariants,
        variant_combos: variantCombos,
        warranty_options: warrantyOptions,
        warranty: warrantyOptions[0]?.title || "1 Month Shop Warranty",
        brand_warranty: warrantyOptions.find((w) => w.type === "Manufacturer Warranty")?.title || "",
        specifications: specRows.reduce((acc, r) => {
          if (r.key.trim()) acc[r.key.trim()] = r.value.trim();
          return acc;
        }, {} as Record<string, string>),
        allow_cod: allowCod,
        allow_card: allowCard,
        allow_whatsapp: allowWhatsapp,
        compatible_brands: [brand],
        created_at: initialData?.created_at || new Date().toISOString(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "products", initialData.id), productPayload);
      } else {
        await addDoc(collection(db, "products"), productPayload);
      }

      setHasUnsavedChanges(false);
      onSave();
      onClose();
    } catch (e) {
      console.error("Error saving product:", e);
      alert("Failed to save product. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-gray-900 overflow-hidden flex flex-col animate-in fade-in">
      {/* ── TOP STICKY EDITOR BAR ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            title="Close Editor"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
              {initialData ? `Edit Product: ${initialData.name}` : "Create New Product"}
              {hasUnsavedChanges && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Unsaved Changes
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Full-page variant manager, colour galleries & warranty config
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSaveProduct("draft")}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all border border-gray-200"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSaveProduct("active")}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initialData ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* ── 7 TAB NAVIGATION HEADER ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 overflow-x-auto shrink-0 select-none">
        <div className="flex items-center gap-1 min-w-[750px]">
          {[
            { id: 1, label: "1. Basic Info", icon: Tag },
            { id: 2, label: "2. Media & Colours", icon: Palette },
            { id: 3, label: "3. Variants & Stock", icon: Sliders },
            { id: 4, label: "4. Specifications", icon: Cpu },
            { id: 5, label: "5. Warranty", icon: ShieldCheck },
            { id: 6, label: "6. Payments & Delivery", icon: Truck },
            { id: 7, label: "7. SEO & Publishing", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB BODY CONTENT AREA (SCROLLABLE) ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/40">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: BASIC INFORMATION
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Code / SKU Prefix *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SM-S24U"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="samsung-galaxy-s24-ultra-5g"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                  >
                    {DEFAULT_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Old / Regular Price */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Old Price (Regular Price LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={baseOldPrice || ""}
                    onChange={(e) => {
                      const oldVal = Number(e.target.value) || null;
                      setBaseOldPrice(oldVal);
                      if (oldVal && basePrice && oldVal > basePrice) {
                        setDiscountPercent(Math.round(((oldVal - basePrice) / oldVal) * 100));
                      } else {
                        setDiscountPercent(0);
                      }
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. 185000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-500 line-through outline-none focus:border-blue-500"
                  />
                </div>

                {/* Offer / Selling Price */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Offer Price (Selling Price LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basePrice}
                    onChange={(e) => {
                      const newSellingPrice = Number(e.target.value);
                      setBasePrice(newSellingPrice);
                      if (baseOldPrice && baseOldPrice > newSellingPrice) {
                        setDiscountPercent(Math.round(((baseOldPrice - newSellingPrice) / baseOldPrice) * 100));
                      } else {
                        setDiscountPercent(0);
                      }
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. 165000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-black text-blue-600 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Offer Percentage (%) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Offer Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={discountPercent || ""}
                      onChange={(e) => {
                        const pct = Math.min(99, Math.max(0, Number(e.target.value)));
                        setDiscountPercent(pct);
                        if (baseOldPrice && pct > 0) {
                          const calculatedPrice = Math.round(baseOldPrice * (1 - pct / 100));
                          setBasePrice(calculatedPrice);
                        }
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g. 15"
                      className="w-full px-3.5 py-2.5 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-black text-red-600 outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xs text-red-600">% OFF</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs">Full Product Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter complete product features and overview..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800 select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  Featured Product (Show on Homepage Grid)
                </label>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: MEDIA & COLOUR-SPECIFIC GALLERIES
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
                  Colour Variants & Dedicated Image Galleries
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add custom colours. Each colour has its own dedicated cover image and gallery thumbnails that update live when selected by customers.
                </p>
              </div>

              {/* Add New Colour Form */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-wrap items-end gap-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Colour Name</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="e.g. Titanium Natural"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hex Color</label>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-9 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddColour}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Colour
                </button>
              </div>

              {/* Colours List */}
              <div className="space-y-4">
                {colorVariants.map((col, cIdx) => (
                  <div key={col.id} className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-gray-300 shadow-xs" style={{ backgroundColor: col.hex }} />
                        <span className="font-extrabold text-sm text-gray-900">{col.name}</span>
                        {col.is_default && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>}
                      </div>

                      <button
                        onClick={() => setColorVariants(colorVariants.filter((c) => c.id !== col.id))}
                        className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    {/* Dedicated Gallery Image URLs for this Colour */}
                    <div className="space-y-2 text-xs">
                      <label className="block font-bold text-gray-700">Dedicated Gallery Image URLs (One URL per line)</label>
                      <textarea
                        rows={3}
                        value={(col.images || []).join("\n")}
                        onChange={(e) => {
                          const urls = e.target.value.split("\n").map((u) => u.trim()).filter(Boolean);
                          const updated = [...colorVariants];
                          updated[cIdx].images = urls;
                          setColorVariants(updated);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl font-mono text-[11px] outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Previews */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(col.images || []).map((img, i) => (
                        <div key={i} className="w-14 h-14 bg-white border border-gray-200 rounded-xl overflow-hidden p-1">
                          <img src={img} alt="" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: VARIANTS & STOCK MATRIX TABLE
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Variant Combinations & Inventory Matrix</h3>
                  <p className="text-xs text-gray-500 mt-1">Manage SKU, RAM, Storage, Price and exact Stock per variant</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCombinations}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" /> Auto Generate Combinations
                </button>
              </div>

              {/* Combinations Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px] text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-3 py-3">Colour</th>
                      <th className="px-3 py-3">RAM</th>
                      <th className="px-3 py-3">Storage</th>
                      <th className="px-3 py-3">SIM / Variant</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3">Offer Price (LKR)</th>
                      <th className="px-3 py-3">Old Price (LKR)</th>
                      <th className="px-3 py-3">Discount</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variantCombos.map((v, vIdx) => {
                      const vOldPrice = v.old_price || 0;
                      const vDiscountPct = vOldPrice > v.price ? Math.round(((vOldPrice - v.price) / vOldPrice) * 100) : 0;

                      return (
                        <tr key={v.id} className="hover:bg-gray-50/80 font-medium">
                          <td className="px-3 py-3 font-bold text-gray-900">{v.color_name}</td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              value={v.ram || ""}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].ram = e.target.value;
                                setVariantCombos(updated);
                              }}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              value={v.storage || ""}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].storage = e.target.value;
                                setVariantCombos(updated);
                              }}
                              className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              placeholder="Physical + eSIM"
                              value={v.sim_type || ""}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].sim_type = e.target.value;
                                setVariantCombos(updated);
                              }}
                              className="w-32 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                            />
                          </td>
                          <td className="px-3 py-3 font-mono">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].sku = e.target.value;
                                setVariantCombos(updated);
                              }}
                              className="w-28 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                            />
                          </td>
                          {/* Offer Price */}
                          <td className="px-3 py-3 font-mono">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].price = Number(e.target.value);
                                setVariantCombos(updated);
                              }}
                              className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-black text-blue-600"
                            />
                          </td>
                          {/* Old Price */}
                          <td className="px-3 py-3 font-mono">
                            <input
                              type="number"
                              value={v.old_price || ""}
                              placeholder="Optional"
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                updated[vIdx].old_price = Number(e.target.value) || null;
                                setVariantCombos(updated);
                              }}
                              className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-400 line-through"
                            />
                          </td>
                          {/* Discount % Badge */}
                          <td className="px-3 py-3 font-mono">
                            {vDiscountPct > 0 ? (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 font-black text-[10px] rounded-md">
                                {vDiscountPct}% OFF
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">—</span>
                            )}
                          </td>
                          {/* Stock Quantity */}
                          <td className="px-3 py-3 font-mono">
                            <input
                              type="number"
                              min={0}
                              value={v.stock_quantity}
                              onChange={(e) => {
                                const updated = [...variantCombos];
                                const cnt = Number(e.target.value);
                                updated[vIdx].stock_quantity = cnt;
                                updated[vIdx].available_stock = Math.max(0, cnt - (updated[vIdx].reserved_stock || 0));
                                setVariantCombos(updated);
                              }}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                            />
                          </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setVariantCombos(variantCombos.filter((item) => item.id !== v.id))}
                            className="text-red-600 hover:underline text-xs font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 4: SPECIFICATIONS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 4 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">Technical Specifications</h3>

              {/* Preset Shortcuts */}
              <div className="flex flex-wrap gap-2 text-xs">
                {DEFAULT_SPEC_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (!specRows.find((r) => r.key === key)) {
                        setSpecRows([...specRows, { key, value: "" }]);
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                  >
                    + {key}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-xs">
                {specRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Spec Key (e.g. Display)"
                      value={row.key}
                      onChange={(e) => {
                        const updated = [...specRows];
                        updated[idx].key = e.target.value;
                        setSpecRows(updated);
                      }}
                      className="w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Spec Value (e.g. 6.7 inch AMOLED)"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...specRows];
                        updated[idx].value = e.target.value;
                        setSpecRows(updated);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecRows(specRows.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Specification Row
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 5: UNIFIED WARRANTY SYSTEM
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 5 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Warranty System</h3>
                  <p className="text-xs text-gray-500 mt-1">Configure multiple warranty plans for customers to select on the product page.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newW: WarrantyOption = {
                      id: `w-${Date.now()}`,
                      title: "New Warranty Plan",
                      type: "Shop Warranty",
                      duration_value: 6,
                      duration_unit: "months",
                      additional_price: 0,
                      coverage_details: "Hardware defect warranty from Street Mobile.",
                      status: "active",
                      is_default: warrantyOptions.length === 0,
                    };
                    setWarrantyOptions([...warrantyOptions, newW]);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Warranty Plan
                </button>
              </div>

              {/* Preset Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-bold text-gray-400 self-center">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => {
                    setWarrantyOptions([
                      ...warrantyOptions,
                      {
                        id: `w-${Date.now()}`,
                        title: "1 Month Limited Shop Warranty",
                        type: "Shop Warranty",
                        duration_value: 1,
                        duration_unit: "months",
                        additional_price: 0,
                        coverage_details: "Hardware defect warranty from Street Mobile Vavuniya.",
                        status: "active",
                        is_default: warrantyOptions.length === 0,
                      },
                    ]);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg"
                >
                  + 1 Month Shop Warranty (Free)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWarrantyOptions([
                      ...warrantyOptions,
                      {
                        id: `w-${Date.now()}`,
                        title: "1 Year Official Brand Warranty",
                        type: "Manufacturer Warranty",
                        duration_value: 1,
                        duration_unit: "years",
                        additional_price: 0,
                        coverage_details: "Official manufacturer warranty from authorized service center.",
                        status: "active",
                        is_default: false,
                      },
                    ]);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg"
                >
                  + 1 Year Brand Warranty (Free)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWarrantyOptions([
                      ...warrantyOptions,
                      {
                        id: `w-${Date.now()}`,
                        title: "6 Month Extended AppleCare/Extended Warranty",
                        type: "Extended Warranty",
                        duration_value: 6,
                        duration_unit: "months",
                        additional_price: 3500,
                        coverage_details: "Comprehensive hardware & liquid damage extended warranty.",
                        status: "active",
                        is_default: false,
                      },
                    ]);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg"
                >
                  + 6 Month Extended (+LKR 3,500)
                </button>
              </div>

              {/* Warranty Plans List */}
              <div className="space-y-4">
                {warrantyOptions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border border-dashed border-gray-300 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-600 text-xs">No warranty plans added yet.</p>
                    <p className="text-[11px] text-gray-400">Click "+ Add Warranty Plan" above to create options for customers.</p>
                  </div>
                ) : (
                  warrantyOptions.map((w, wIdx) => (
                    <div key={w.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span className="font-extrabold text-gray-900">Warranty Plan #{wIdx + 1}</span>
                          {w.is_default && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Default Selection
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWarrantyOptions(warrantyOptions.filter((item) => item.id !== w.id));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Warranty Title *</label>
                          <input
                            type="text"
                            value={w.title}
                            onChange={(e) => {
                              const updated = [...warrantyOptions];
                              updated[wIdx].title = e.target.value;
                              setWarrantyOptions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="e.g. 1 Year AppleCare Warranty"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Warranty Type</label>
                          <select
                            value={w.type}
                            onChange={(e) => {
                              const updated = [...warrantyOptions];
                              updated[wIdx].type = e.target.value as any;
                              setWarrantyOptions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-blue-500"
                          >
                            <option value="Shop Warranty">Shop Warranty</option>
                            <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                            <option value="Extended Warranty">Extended Warranty</option>
                            <option value="Lifetime Warranty">Lifetime Warranty</option>
                            <option value="Unlimited Warranty">Unlimited Warranty</option>
                            <option value="No Warranty">No Warranty</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Additional Charge (LKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={w.additional_price}
                            onChange={(e) => {
                              const updated = [...warrantyOptions];
                              updated[wIdx].additional_price = Number(e.target.value);
                              setWarrantyOptions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-blue-600 font-mono outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Coverage Details / Instructions</label>
                        <input
                          type="text"
                          value={w.coverage_details || ""}
                          onChange={(e) => {
                            const updated = [...warrantyOptions];
                            updated[wIdx].coverage_details = e.target.value;
                            setWarrantyOptions(updated);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="e.g. Hardware defect warranty covered by Street Mobile Vavuniya main store."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 6: PAYMENTS & DELIVERY
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 6 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">Payment Options & Delivery</h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCod}
                    onChange={(e) => setAllowCod(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-900">Allow Cash on Delivery (COD)</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCard}
                    onChange={(e) => setAllowCard(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-900">Allow Card Payment (PayHere Online)</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowWhatsapp}
                    onChange={(e) => setAllowWhatsapp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-900">Allow Direct WhatsApp Ordering</span>
                </label>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 7: SEO & PUBLISHING
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 7 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">SEO & Publishing</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SEO Title Tag</label>
                  <input
                    type="text"
                    value={metaTitle || name}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="STREET MOBILE - Buy Phone Online"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={metaDescription || shortDesc}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Short SEO snippet for Google search..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
