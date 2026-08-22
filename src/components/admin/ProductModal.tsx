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
  Image as ImageIcon,
  Heart,
  RotateCcw,
} from "lucide-react";
import { Product, Category, ProductColor, ProductVariantCombo, WarrantyOption, InventoryLog, ProductImageSettings } from "@/lib/types";
import { db } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection, setDoc } from "firebase/firestore";
import { PRESET_COLORS, getColorCSS, normalizeColor } from "@/lib/color-utils";
import { formatLKR } from "@/lib/order-utils";
import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categories: Category[];
  initialData?: Product | null;
}

const DEFAULT_SPEC_KEYS = ["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "OS", "Network", "Sensors", "Weight"];
const PRESET_RAM = ["4GB", "6GB", "8GB", "12GB", "16GB"];
const PRESET_STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB"];

const PRESET_WARRANTIES = [
  "One Year ABANS Warranty",
  "18 Month Limited Warranty",
  "One Month Limited Warranty",
  "One Year Limited Warranty",
  "Two Year Limited Warranty",
  "Three Month Limited Warranty",
  "Three Year Limited Warranty",
  "Six Month Limited Warranty",
  "ANKER 18 MONTHS WARRANTY",
  "BASEUS 15 MONTH OFFICIAL WARRANTY",
  "Two Year Brownse Warranty",
  "One Year Limited Warranty. Warranty Doesn't Cover For Logic Board Error",
  "One Year GNEXT Warranty",
  "2 Time Screen Replacement Within 1 Year",
  "Two Year GNEXT Warranty. With Shield Pro",
  "18 MONTH TECHSAS WARRANTY",
  "One Year Limited Warranty. (Six Month for Battery & Charger)",
  "Two Year JKOA Warranty, Two Year Two Time Screen replacement with Break Free Offer",
  "One Year JKOA Warranty, One Year One Time Screen replacement with Break Free Offer",
  "Seven Days Checking Warranty Only!",
  "One Year Apple Care Warranty",
  "One Month Checking Warranty. Six Month Software & Service Warranty. Warranty Doesn't Cover For Display",
  "One Month Checking Warranty. Six Month Software & Service Warranty",
  "One Year SINGER Warranty",
  "One Year SOFTLOGIC Warranty, With 1 Year One-Time Break Free Offer",
  "One Year SOFTLOGIC Warranty",
  "Two Year SOFTLOGIC Warranty, With 2 Year One-Time Break Free Offer",
  "One Year TDRA Warranty",
];

const DEFAULT_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Anker",
  "Baseus",
  "Redmi",
  "Oppo",
  "Vivo",
  "Realme",
  "Google",
  "Honor",
  "OnePlus",
  "JBL",
  "Sony",
  "Bose",
  "Huawei",
  "Joyroom",
  "Hoco",
  "REMAX",
  "Ugreen",
  "LDNIO",
  "Marshall",
  "Sennheiser",
  "Kingston",
  "SanDisk",
];

const DEFAULT_PRODUCT_CATEGORIES: Category[] = [
  { id: "cat-smartphones", name: "Smartphones", slug: "smartphones", icon: "📱", image_url: "", sort_order: 1, group: "product_categories" },
  { id: "cat-laptops", name: "Laptops & MacBooks", slug: "laptops", icon: "💻", image_url: "", sort_order: 2, group: "product_categories" },
  { id: "cat-watches", name: "Smart Watches", slug: "smart-watches", icon: "⌚", image_url: "", sort_order: 3, group: "product_categories" },
  { id: "cat-earbuds", name: "Earbuds & TWS", slug: "earbuds", icon: "🎧", image_url: "", sort_order: 4, group: "product_categories" },
  { id: "cat-headphones", name: "Headphones", slug: "headphones", icon: "🎧", image_url: "", sort_order: 5, group: "product_categories" },
  { id: "cat-adapter", name: "Chargers & Adapters", slug: "chargers-adapters", icon: "🔌", image_url: "", sort_order: 6, group: "product_categories" },
  { id: "cat-cables", name: "Charging Cables", slug: "charging-cables", icon: "🔌", image_url: "", sort_order: 7, group: "product_categories" },
  { id: "cat-powerbanks", name: "Power Banks", slug: "power-banks", icon: "🔋", image_url: "", sort_order: 8, group: "product_categories" },
  { id: "cat-cases", name: "Phone Cases", slug: "phone-cases", icon: "📱", image_url: "", sort_order: 9, group: "product_categories" },
  { id: "cat-screen-protectors", name: "Screen Protectors", slug: "screen-protectors", icon: "🛡️", image_url: "", sort_order: 10, group: "product_categories" },
  { id: "cat-accessories", name: "Mobile Accessories", slug: "mobile-accessories", icon: "🎧", image_url: "", sort_order: 11, group: "product_categories" },
  { id: "cat-tablets", name: "Tablets", slug: "tablets", icon: "📱", image_url: "", sort_order: 12, group: "product_categories" },
  { id: "cat-speakers", name: "Speakers", slug: "speakers", icon: "🔊", image_url: "", sort_order: 13, group: "product_categories" },
];

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
}

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

  // Feature Flags
  const [productType, setProductType] = useState<"phone" | "accessory">("phone");
  const [hasColorVariants, setHasColorVariants] = useState<boolean>(true);
  const [hasStorageVariants, setHasStorageVariants] = useState<boolean>(true);

  // Custom Category & Brand Toggle States
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");

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

  // General Product Image Gallery (For non-color accessories or product-level images)
  const [generalImages, setGeneralImages] = useState<string[]>([]);
  const [imageSettings, setImageSettings] = useState<ProductImageSettings>({
    fit: "contain",
    scale: 100,
    positionX: 0,
    positionY: 0,
  });
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
  const [selectedPresetWarranty, setSelectedPresetWarranty] = useState("");

  // Helper function to check if category is phone-related
  const isPhoneCategory = (catIdOrName: string) => {
    if (!catIdOrName) return false;
    const lower = catIdOrName.toLowerCase();
    return (
      lower.includes("phone") ||
      lower.includes("smartphone") ||
      lower.includes("iphone") ||
      lower.includes("samsung") ||
      lower.includes("xiaomi") ||
      lower.includes("redmi") ||
      lower.includes("oppo") ||
      lower.includes("vivo") ||
      lower.includes("realme") ||
      lower.includes("google") ||
      lower.includes("honor") ||
      lower.includes("oneplus")
    );
  };

  // Merged Categories List (Default 12 Categories + Props Categories, filtered to exclude Brand names)
  const mergedCategories = React.useMemo(() => {
    const map = new Map<string, Category>();
    DEFAULT_PRODUCT_CATEGORIES.forEach((c) => map.set(c.id, c));
    categories.forEach((c) => {
      const cName = (c.name || "").toLowerCase();
      const cSlug = (c.slug || "").toLowerCase();
      const isBrand = KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
      if (!isBrand) {
        const existingKey = Array.from(map.keys()).find((k) => {
          const item = map.get(k);
          return item && (item.name.toLowerCase() === c.name.toLowerCase() || item.slug === c.slug);
        });
        if (existingKey) {
          map.set(existingKey, c);
        } else {
          map.set(c.id || `c-${c.name}`, c);
        }
      }
    });
    return Array.from(map.values());
  }, [categories]);

  // Dynamic Brand Options (Clean List of Brands)
  const brandOptions = React.useMemo(() => {
    return Array.from(new Set(DEFAULT_BRANDS));
  }, []);

  // Initialize form when opening/editing
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setSlug(initialData.slug || "");
      // Initialize edit category data flexibly matching mergedCategories
      const rawCatId = initialData?.category_id || (initialData as any)?.categoryId || "";
      const rawCatName = (initialData?.category_name || (initialData as any)?.categoryName || "").replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim();

      const matchedCategory = mergedCategories.find((c) => {
        const cClean = c.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim();
        return (
          c.id === rawCatId ||
          c.slug === rawCatId ||
          c.slug === initialData?.category_slug ||
          cClean.toLowerCase() === rawCatName.toLowerCase()
        );
      });

      const initCatId = matchedCategory ? matchedCategory.id : (mergedCategories[0]?.id || "cat-smartphones");
      setCategoryId(initCatId);
      setBrand(
        initialData?.brand_name ||
        initialData?.brandName ||
        initialData?.brand ||
        initialData?.compatible_brands?.[0] ||
        "Apple"
      );
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
      setMetaTitle((initialData as any).meta_title || (initialData as any).metaTitle || "");
      setMetaDescription((initialData as any).meta_description || (initialData as any).metaDescription || "");
      setGeneralImages(initialData.images || []);
      setImageSettings(
        initialData.imageSettings ||
        initialData.productImageSettings || {
          fit: "contain",
          scale: 100,
          positionX: 0,
          positionY: 0,
        }
      );

      // Feature Flags detection
      const catNameOrId = initialData.category_name || initialData.category_id || "";
      const isPhoneCat = isPhoneCategory(catNameOrId);
      const detectedType: "phone" | "accessory" = initialData.productType
        ? initialData.productType
        : isPhoneCat
        ? "phone"
        : "accessory";

      setProductType(detectedType);

      const detectedHasColor = typeof initialData.hasColorVariants === "boolean"
        ? initialData.hasColorVariants
        : Boolean(
            (initialData.color_variants && initialData.color_variants.length > 0 && initialData.color_variants.some(c => c.name && c.name.trim() !== "" && c.name !== "Standard" && c.name !== "Standard Black")) ||
            (initialData.colors && initialData.colors.length > 0 && initialData.colors.some(c => c && c.trim() !== "" && c !== "Standard" && c !== "Standard Black"))
          );

      setHasColorVariants(detectedHasColor);

      const detectedHasStorage = typeof initialData.hasStorageVariants === "boolean"
        ? initialData.hasStorageVariants
        : Boolean(
            initialData.variant_combos &&
            initialData.variant_combos.length > 0 &&
            initialData.variant_combos.some(v => Boolean(v.storage && v.storage.trim() !== ""))
          );

      setHasStorageVariants(detectedHasStorage);

      // Spec Rows
      const rows = Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value }));
      setSpecRows(rows.length > 0 ? rows : [{ key: "Display", value: "" }, { key: "Processor", value: "" }]);

      // Colours
      if (detectedHasColor) {
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
          setColorVariants([]);
        }
      } else {
        setColorVariants([]);
      }

      // Variant Combos
      if (initialData.variant_combos && initialData.variant_combos.length > 0) {
        setVariantCombos(initialData.variant_combos);
      } else {
        setVariantCombos([]);
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
      const defaultCatId = categories[0]?.id || "";
      const defaultCatName = categories[0]?.name || "Smartphones";
      const isPhone = isPhoneCategory(defaultCatName);

      setProductType(isPhone ? "phone" : "accessory");
      setHasColorVariants(isPhone);
      setHasStorageVariants(isPhone);

      setCategoryId(defaultCatId);
      setBrand("Apple");
      setDescription("");
      setShortDesc("");
      setFeatured(false);
      setStatus("active");
      setBasePrice(0);
      setBaseOldPrice(null);
      setAllowCod(true);
      setAllowCard(true);
      setAllowWhatsapp(true);
      setMetaTitle("");
      setMetaDescription("");
      setGeneralImages(["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"]);
      setImageSettings({
        fit: "contain",
        scale: 100,
        positionX: 0,
        positionY: 0,
      });

      setSpecRows([
        { key: "Display", value: '6.7" Super AMOLED 120Hz' },
        { key: "Processor", value: "Octa-Core Flagship CPU" },
        { key: "Battery", value: "5000 mAh Fast Charging" },
      ]);

      if (isPhone) {
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
        ]);
      } else {
        // Non-phone / Accessory default: NO colors and NO variant matrix
        setColorVariants([]);
        setVariantCombos([]);
      }

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

  // Add Single Manual Variant Row
  const handleAddManualVariant = () => {
    const defaultCol = colorVariants[0]?.name || "Standard";
    const defaultHex = colorVariants[0]?.hex || "#000000";
    const defaultColId = colorVariants[0]?.id || "col-1";
    const newVariant: ProductVariantCombo = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      color_id: defaultColId,
      color_name: defaultCol,
      color_hex: defaultHex,
      ram: "8GB",
      storage: "128GB",
      sim_type: "Physical SIM + eSIM",
      sku: code ? `${code}-${defaultCol.slice(0, 3).toUpperCase()}-128` : `SM-${Date.now()}`,
      price: basePrice || 0,
      old_price: baseOldPrice || null,
      stock_quantity: 10,
      reserved_stock: 0,
      available_stock: 10,
      low_stock_threshold: 3,
      status: "active",
      warranty: warrantyOptions[0]?.title || "1 Month Shop Warranty",
    };
    setVariantCombos([...variantCombos, newVariant]);
    setHasUnsavedChanges(true);
  };

  // Auto Generate Variant Combinations Matrix
  const handleGenerateCombinations = () => {
    const activeColors = colorVariants.filter((c) => c.active !== false);

    if (hasColorVariants && activeColors.length === 0) {
      alert("Please add at least one color in Tab 2 (Media & Colours) before auto-generating color variants.");
      return;
    }

    const storagePresets = hasStorageVariants ? ["128GB", "256GB", "512GB"] : [""];
    const newCombos: ProductVariantCombo[] = [];

    if (hasColorVariants) {
      activeColors.forEach((col) => {
        storagePresets.forEach((st) => {
          const skuStr = `${brand.slice(0, 3).toUpperCase()}-${col.name.slice(0, 3).toUpperCase()}${st ? `-${st}` : ""}`;
          newCombos.push({
            id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            color_id: col.id,
            color_name: col.name,
            color_hex: col.hex || getColorCSS(col.name),
            ram: st ? "8GB" : "",
            storage: st,
            sim_type: "Physical SIM + eSIM",
            sku: skuStr,
            price: basePrice || 150000,
            old_price: baseOldPrice,
            stock_quantity: 10,
            reserved_stock: 0,
            available_stock: 10,
            low_stock_threshold: 3,
            status: "active",
            image_ref: col.images?.[0] || col.cover_image,
            warranty: warrantyOptions[0]?.title || "1 Month Shop Warranty",
          });
        });
      });
    } else if (hasStorageVariants) {
      storagePresets.forEach((st) => {
        const skuStr = `${brand.slice(0, 3).toUpperCase()}-${st}`;
        newCombos.push({
          id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          color_name: "Standard",
          color_hex: "#000000",
          ram: "8GB",
          storage: st,
          sim_type: "Standard",
          sku: skuStr,
          price: basePrice || 150000,
          old_price: baseOldPrice,
          stock_quantity: 10,
          reserved_stock: 0,
          available_stock: 10,
          low_stock_threshold: 3,
          status: "active",
          warranty: warrantyOptions[0]?.title || "1 Month Shop Warranty",
        });
      });
    }

    if (newCombos.length > 0) {
      setVariantCombos(newCombos);
      setHasUnsavedChanges(true);
      alert(`Successfully generated ${newCombos.length} variant combinations!`);
    } else {
      alert("No variants could be generated. Make sure Color or Storage options are enabled.");
    }
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

      const finalCategoryObj = mergedCategories.find((c) => c.id === categoryId);
      const rawCatName = isCustomCategory
        ? customCategoryName.trim()
        : (finalCategoryObj?.name || "Smartphones");

      // Strip emoji prefix from category name for database consistency
      const finalCategoryName = rawCatName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim() || "Smartphones";
      const finalCategorySlug = finalCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const finalCategoryId = isCustomCategory
        ? `cat-${finalCategorySlug}`
        : (finalCategoryObj?.id || `cat-${finalCategorySlug}`);

      const finalBrand = isCustomBrand ? customBrandName.trim() : (brand.trim() || "Apple");
      const finalBrandSlug = finalBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Save Custom Category or Brand to Firestore Catalog Collections if new
      if (isCustomCategory && customCategoryName.trim()) {
        try {
          const catSlug = customCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await setDoc(doc(db, "categories", `cat-${catSlug}`), {
            id: `cat-${catSlug}`,
            name: customCategoryName.trim(),
            slug: catSlug,
            icon: "📱",
            image_url: "",
            sort_order: 99,
            status: "active",
            show_on_homepage: true,
            show_in_selector: true,
            group: "product_categories",
          }, { merge: true });
        } catch (err) {
          console.warn("Failed to save custom category to catalog:", err);
        }
      }

      if (isCustomBrand && customBrandName.trim()) {
        try {
          const bSlug = customBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await setDoc(doc(db, "brands", `brand-${bSlug}`), {
            id: `brand-${bSlug}`,
            name: customBrandName.trim(),
            slug: bSlug,
            logo_url: "",
            sort_order: 99,
            status: "active",
            show_on_homepage: true,
          }, { merge: true });
        } catch (err) {
          console.warn("Failed to save custom brand to catalog:", err);
        }
      }

      // Compute Total Stock from active variants or default stock
      const totalVariantStock = variantCombos.length > 0
        ? variantCombos.reduce((s, v) => s + (v.stock_quantity || 0), 0)
        : 10;
      const isOutOfStock = totalVariantStock === 0;

      // Combine general product images and color-specific images
      const allImages: string[] = [...generalImages];
      colorVariants.forEach((c) => {
        if (c.images && c.images.length > 0) allImages.push(...c.images);
      });
      const cleanImages = allImages.map((u) => u.trim()).filter(Boolean);
      const finalImages = cleanImages.length > 0
        ? Array.from(new Set(cleanImages))
        : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"];

      // First active price
      const primaryPrice = variantCombos[0]?.price || basePrice || 0;
      const primaryOldPrice = variantCombos[0]?.old_price || baseOldPrice || null;

      // Enrich every variant combo with full variant metadata (color_hex, image_ref, warranty, storage, stock, sku, price)
      const enrichedVariantCombos: ProductVariantCombo[] = variantCombos.map((v) => {
        const matchedColor = colorVariants.find((c) => c.name === v.color_name || c.id === v.color_id);
        const colorHex = v.color_hex || matchedColor?.hex || (v.color_name ? getColorCSS(v.color_name) : "#000000");
        const colorImage = matchedColor?.images?.[0] || matchedColor?.cover_image || finalImages[0];
        return {
          ...v,
          id: v.id || `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          color_id: v.color_id || matchedColor?.id,
          color_name: v.color_name || matchedColor?.name || "Standard",
          color_hex: colorHex,
          storage: v.storage || "",
          price: Number(v.price) || primaryPrice,
          old_price: v.old_price ? Number(v.old_price) : primaryOldPrice,
          stock_quantity: Number(v.stock_quantity) || 0,
          available_stock: Math.max(0, (Number(v.stock_quantity) || 0) - (v.reserved_stock || 0)),
          sku: v.sku || code || slug,
          image_ref: v.image_ref || colorImage,
          warranty: v.warranty || warrantyOptions[0]?.title || "1 Month Shop Warranty",
        };
      });

      const productPayload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        code: code.trim(),
        
        category_id: finalCategoryId,
        category_name: finalCategoryName,
        category_slug: finalCategorySlug,
        categoryId: finalCategoryId,
        categoryName: finalCategoryName,
        categorySlug: finalCategorySlug,

        brand: finalBrand,
        brand_id: `brand-${finalBrandSlug}`,
        brand_name: finalBrand,
        brand_slug: finalBrandSlug,
        brandId: `brand-${finalBrandSlug}`,
        brandName: finalBrand,
        brandSlug: finalBrandSlug,

        price: primaryPrice,
        old_price: primaryOldPrice,
        description: description.trim(),
        delivery_info: deliveryInfo.trim(),
        stock_status: isOutOfStock ? "out_of_stock" : totalVariantStock <= 5 ? "low_stock" : "in_stock",
        stock_count: totalVariantStock,
        featured,
        images: finalImages,
        imageSettings: imageSettings,
        productImageSettings: imageSettings,
        colors: colorVariants.map((c) => c.name),
        color_variants: colorVariants,
        variant_combos: enrichedVariantCombos,
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
        meta_title: metaTitle.trim(),
        metaTitle: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        metaDescription: metaDescription.trim(),
        compatible_brands: [finalBrand],
        created_at: initialData?.created_at || new Date().toISOString(),
      };

      const cleanedPayload = sanitizeForFirestore(productPayload);

      if (initialData?.id) {
        await updateDoc(doc(db, "products", initialData.id), cleanedPayload);
      } else {
        await addDoc(collection(db, "products"), cleanedPayload);
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

                {/* Category Selector with Custom Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) {
                          setCustomCategoryName("");
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      {isCustomCategory ? "Select from List" : "+ Add Custom Category"}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => {
                        setCustomCategoryName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Type custom category (e.g. Smart Glasses)"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        setCategoryId(newCatId);
                        const catObj = mergedCategories.find((c) => c.id === newCatId);
                        const catName = catObj?.name || newCatId;
                        const isPhone = isPhoneCategory(catName);
                        setProductType(isPhone ? "phone" : "accessory");
                        setHasColorVariants(isPhone);
                        setHasStorageVariants(isPhone);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                    >
                      {mergedCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Brand Name Selector with Custom Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700">Brand Name *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomBrand(!isCustomBrand);
                        if (!isCustomBrand) {
                          setCustomBrandName("");
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      {isCustomBrand ? "Select from List" : "+ Add Custom Brand"}
                    </button>
                  </div>

                  {isCustomBrand ? (
                    <input
                      type="text"
                      value={customBrandName}
                      onChange={(e) => {
                        setCustomBrandName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Type custom brand name (e.g. Bose, Sony, Marshall)"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500"
                    >
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ── Product Type & Variant Feature Flags Block ── */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 border border-blue-100/80 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        Product Type & Variant Configurations
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Choose whether this product requires color options or storage variant combinations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-xs">
                    {/* Product Type Setting */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">Product Type</label>
                      <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setProductType("phone");
                            setHasColorVariants(true);
                            setHasStorageVariants(true);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            productType === "phone"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          📱 Smartphone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProductType("accessory");
                            setHasColorVariants(false);
                            setHasStorageVariants(false);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            productType === "accessory"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          🎧 Accessory
                        </button>
                      </div>
                    </div>

                    {/* Color Options Setting */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">Does this product have color options?</label>
                      <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl w-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasColorVariants && colorVariants.length > 0) {
                              if (
                                !confirm(
                                  "Are you sure you want to disable color options? Existing color variants will be cleared."
                                )
                              ) {
                                return;
                              }
                            }
                            setHasColorVariants(false);
                            setColorVariants([]);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            !hasColorVariants
                              ? "bg-slate-800 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasColorVariants(true);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            hasColorVariants
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>

                    {/* Storage Options Setting */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">Does this product have storage options?</label>
                      <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl w-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasStorageVariants && variantCombos.some((v) => Boolean(v.storage))) {
                              if (
                                !confirm(
                                  "Are you sure you want to disable storage options? Existing storage variants will be cleared."
                                )
                              ) {
                                return;
                              }
                            }
                            setHasStorageVariants(false);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            !hasStorageVariants
                              ? "bg-slate-800 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasStorageVariants(true);
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            hasStorageVariants
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>
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
                  <label className="block font-bold text-gray-700 mb-1">
                    Offer Price (Selling Price LKR) <span className="text-gray-400 font-normal">(Optional if variants added)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={basePrice || ""}
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
                  Product Media & Image Galleries
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload multiple product images for general view, as well as color-specific gallery thumbnails.
                </p>
              </div>

              {/* ── General Product Gallery Images (Multi-Slot Upload & Auto-Split Paste) ── */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      General Product Gallery Images ({generalImages.filter((u) => u && u.trim()).length} Active Images)
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload or enter 2, 3, 4 or more image URLs for this product. You can paste comma-separated or newline-separated URLs into any slot!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setGeneralImages([...generalImages, ""]);
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Image Slot
                  </button>
                </div>

                {/* Individual Image Input Slots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(generalImages.length > 0 ? generalImages : ["", "", "", ""]).map((imgUrl, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                      {/* Thumbnail Preview */}
                      <div className="w-12 h-12 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-0.5 relative">
                        {imgUrl && imgUrl.trim() ? (
                          <img src={imgUrl.trim()} alt={`Image ${i + 1}`} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>

                      {/* URL Input */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-extrabold text-gray-500 mb-0.5 uppercase tracking-wider">
                          Product Image {i + 1}
                        </label>
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Support auto-split if pasting comma, semicolon, or newline separated URLs
                            if (raw.includes(",") || raw.includes("\n") || raw.includes(";")) {
                              const parts = raw.split(/[\n,;]+/).map((u) => u.trim()).filter(Boolean);
                              const updated = [...generalImages];
                              updated.splice(i, 1, ...parts);
                              setGeneralImages(updated);
                            } else {
                              const updated = [...generalImages];
                              updated[i] = raw;
                              setGeneralImages(updated);
                            }
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Paste image URL (e.g. https://i.postimg.cc/...)"
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = generalImages.filter((_, idx) => idx !== i);
                          setGeneralImages(updated.length > 0 ? updated : [""]);
                          setHasUnsavedChanges(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove image slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bulk Paste / Edit Toggle */}
                <details className="text-xs group pt-1">
                  <summary className="font-bold text-gray-600 cursor-pointer hover:text-blue-600 select-none">
                    ⚡ Bulk Paste / Raw URL Editor (Comma or Newline Separated)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      value={generalImages.join("\n")}
                      onChange={(e) => {
                        const urls = e.target.value.split(/[\n,;]+/).map((u) => u.trim());
                        setGeneralImages(urls);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Paste multiple URLs (One per line or separated by commas)"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl font-mono text-[11px] outline-none focus:border-blue-500"
                    />
                  </div>
                </details>
              </div>

              {/* ── Product Card Image Frame & Fitting Controls (Per-Product Zoom & Alignment) ── */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      Product Card Image Frame &amp; Fitting Controls
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fine-tune how the primary product image fits inside the 1:1 square card frame across the website.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImageSettings({
                        fit: "contain",
                        scale: 100,
                        positionX: 0,
                        positionY: 0,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Image Position</span>
                  </button>
                </div>

                {/* Admin Tip / Excessive Whitespace Warning */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Image Fitting Tip:</span> This image contains excessive empty space or large white margins (e.g. DJI Osmo, Gimbals, small accessories). Use <strong>Image Zoom</strong> (e.g. 120% &ndash; 160%) or upload a tightly cropped product image so the product occupies 75%&ndash;85% of the frame naturally.
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
                  {/* Controls Column */}
                  <div className="lg:col-span-7 space-y-4 text-xs">
                    {/* 1. Image Fit */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">1. Image Fit Mode</label>
                      <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl w-full">
                        {(["contain", "cover", "custom"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setImageSettings((prev) => ({ ...prev, fit: mode }));
                              setHasUnsavedChanges(true);
                            }}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                              (imageSettings.fit || "contain") === mode
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Image Zoom */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-gray-700">2. Product Image Zoom</label>
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {imageSettings.scale || 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={200}
                        step={2}
                        value={imageSettings.scale || 100}
                        onChange={(e) => {
                          setImageSettings((prev) => ({ ...prev, scale: Number(e.target.value) }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-mono">
                        <span>80% (Zoom Out)</span>
                        <span>100% (Default)</span>
                        <span>200% (Zoom In)</span>
                      </div>
                    </div>

                    {/* 3. Horizontal Position (X) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-gray-700">3. Horizontal Position (X)</label>
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {imageSettings.positionX || 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={imageSettings.positionX || 0}
                        onChange={(e) => {
                          setImageSettings((prev) => ({ ...prev, positionX: Number(e.target.value) }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-mono">
                        <span>-50% (Left)</span>
                        <span>0% (Center)</span>
                        <span>+50% (Right)</span>
                      </div>
                    </div>

                    {/* 4. Vertical Position (Y) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-gray-700">4. Vertical Position (Y)</label>
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {imageSettings.positionY || 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={imageSettings.positionY || 0}
                        onChange={(e) => {
                          setImageSettings((prev) => ({ ...prev, positionY: Number(e.target.value) }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-mono">
                        <span>-50% (Up)</span>
                        <span>0% (Center)</span>
                        <span>+50% (Down)</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Card Column */}
                  <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-700 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> Live Product Card Preview
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">1:1 Square Frame</span>
                    </div>

                    {/* Live Card Simulation */}
                    <div className="w-full max-w-[220px] mx-auto bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                      {/* Image Container with 1:1 Aspect Ratio and #F7F7F7 Background */}
                      <div className="product-image-container relative aspect-square bg-[#F7F7F7] flex items-center justify-center overflow-hidden rounded-t-2xl">
                        {/* Bottom-Left Offer Badge */}
                        <div className="product-offer-badge absolute bottom-0 left-0 z-10">
                          {discountPercent > 0 ? (
                            <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-tr-md uppercase tracking-wider shadow-2xs inline-block">
                              -{discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="bg-neutral-900 text-white text-[9px] font-black px-2 py-0.5 rounded-tr-md uppercase tracking-wider shadow-2xs inline-block">
                              New
                            </span>
                          )}
                        </div>

                        {/* Top-Right Wishlist Heart */}
                        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center text-neutral-400 shadow-2xs">
                          <Heart className="w-3 h-3" />
                        </div>

                        {/* Live Product Image with Transform Origin Center */}
                        <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
                          <img
                            src={
                              generalImages[0] ||
                              colorVariants[0]?.images?.[0] ||
                              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"
                            }
                            alt="Preview"
                            style={{
                              objectPosition: `${50 + (imageSettings.positionX || 0)}% ${50 + (imageSettings.positionY || 0)}%`,
                              transform: `scale(${(imageSettings.scale || 100) / 100})`,
                              transformOrigin: "center center",
                            }}
                            className={`w-full h-full ${
                              imageSettings.fit === "cover" ? "object-cover" : "object-contain"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-3 bg-white">
                        <span className="text-[9px] font-extrabold uppercase text-neutral-400 block mb-0.5">
                          {mergedCategories.find((c) => c.id === categoryId)?.name || customCategoryName || "SMARTPHONES"}
                        </span>
                        <h5 className="font-bold text-xs text-neutral-900 line-clamp-1 mb-1">
                          {name || "Product Name"}
                        </h5>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="font-extrabold text-xs text-neutral-900">
                            {formatLKR(basePrice || 150000)}
                          </span>
                          {baseOldPrice && baseOldPrice > basePrice && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              {formatLKR(baseOldPrice)}
                            </span>
                          )}
                        </div>
                        <div className="w-full py-1.5 bg-black text-white text-[10px] font-bold rounded-lg text-center">
                          Add to Bag
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!hasColorVariants ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-center text-xs space-y-3">
                  <Palette className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm">Color Options Disabled</h4>
                    <p className="text-amber-700 text-xs mt-1 max-w-md mx-auto">
                      Color options are turned OFF for this product. You can save this product without any color variants.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHasColorVariants(true);
                      setHasUnsavedChanges(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Enable Color Options
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: VARIANTS & STOCK MATRIX TABLE
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Variant Combinations & Inventory Matrix</h3>
                  <p className="text-xs text-gray-500 mt-1">Manage SKU, Colour, RAM, Storage, Price and exact Stock per variant</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddManualVariant}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Variant Row
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateCombinations}
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" /> Auto Generate
                  </button>
                  {variantCombos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Clear all variant combinations? Base price and stock will be used instead.")) {
                          setVariantCombos([]);
                          setHasUnsavedChanges(true);
                        }
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  )}
                </div>
              </div>

              {!hasColorVariants && !hasStorageVariants ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs space-y-2">
                  <Sliders className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-extrabold text-slate-900 text-sm">No Variant Matrix Required</p>
                  <p className="text-slate-600 text-xs max-w-md mx-auto">
                    This product has no color or storage options enabled. Standard product-level Offer Price (LKR {basePrice.toLocaleString()}) and stock count will be used on the storefront.
                  </p>
                </div>
              ) : variantCombos.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs space-y-3">
                  <Sliders className="w-8 h-8 text-gray-300 mx-auto" />
                  <div>
                    <p className="font-extrabold text-gray-800 text-sm">No Variants Added Yet</p>
                    <p className="text-gray-500 text-xs mt-1">
                      You can add manual variant rows or automatically generate combinations from your active colors.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAddManualVariant}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Manual Variant Row
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateCombinations}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" /> Auto Generate Combinations
                    </button>
                  </div>
                </div>
              ) : (
                /* Combinations Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px] text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {hasColorVariants && <th className="px-3 py-3">Colour</th>}
                        <th className="px-3 py-3">RAM</th>
                        {hasStorageVariants && <th className="px-3 py-3">Storage</th>}
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
                            {hasColorVariants && (
                              <td className="px-3 py-3 font-bold text-gray-900">
                                {colorVariants.length > 0 ? (
                                  <select
                                    value={v.color_name || colorVariants[0]?.name || ""}
                                    onChange={(e) => {
                                      const newColName = e.target.value;
                                      const matchedCol = colorVariants.find((c) => c.name === newColName);
                                      const updated = [...variantCombos];
                                      updated[vIdx].color_name = newColName;
                                      if (matchedCol) {
                                        updated[vIdx].color_id = matchedCol.id;
                                        updated[vIdx].color_hex = matchedCol.hex;
                                      }
                                      setVariantCombos(updated);
                                      setHasUnsavedChanges(true);
                                    }}
                                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                                  >
                                    {colorVariants.map((c) => (
                                      <option key={c.id || c.name} value={c.name}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={v.color_name || ""}
                                    onChange={(e) => {
                                      const updated = [...variantCombos];
                                      updated[vIdx].color_name = e.target.value;
                                      setVariantCombos(updated);
                                      setHasUnsavedChanges(true);
                                    }}
                                    className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                                  />
                                )}
                              </td>
                            )}
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
                            {hasStorageVariants && (
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
                            )}
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
                                onClick={() => {
                                  setVariantCombos(variantCombos.filter((item) => item.id !== v.id));
                                  setHasUnsavedChanges(true);
                                }}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-colors"
                                title="Delete variant row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

              {/* Preset Quick Add Dropdown Bar */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100 rounded-2xl p-4 space-y-2.5">
                <label className="block font-extrabold text-xs text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Quick Select Warranty Preset (30+ Official Sri Lankan Warranties):
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                  <select
                    value={selectedPresetWarranty}
                    onChange={(e) => setSelectedPresetWarranty(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500 shadow-xs"
                  >
                    <option value="">-- Choose Official Warranty Preset --</option>
                    {PRESET_WARRANTIES.map((wTitle, idx) => (
                      <option key={idx} value={wTitle}>
                        {wTitle}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedPresetWarranty) return;
                      const newW: WarrantyOption = {
                        id: `w-${Date.now()}`,
                        title: selectedPresetWarranty,
                        type: selectedPresetWarranty.toLowerCase().includes("shop") || selectedPresetWarranty.toLowerCase().includes("checking")
                          ? "Shop Warranty"
                          : "Manufacturer Warranty",
                        duration_value: 1,
                        duration_unit: selectedPresetWarranty.toLowerCase().includes("month")
                          ? "months"
                          : "years",
                        additional_price: 0,
                        coverage_details: selectedPresetWarranty,
                        status: "active",
                        is_default: warrantyOptions.length === 0,
                      };
                      setWarrantyOptions([...warrantyOptions, newW]);
                      setSelectedPresetWarranty("");
                      setHasUnsavedChanges(true);
                    }}
                    disabled={!selectedPresetWarranty}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Selected Warranty
                  </button>
                </div>
              </div>

              {/* Warranty Plans List */}
              <div className="space-y-4">
                {warrantyOptions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border border-dashed border-gray-300 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-600 text-xs">No warranty plans added yet.</p>
                    <p className="text-[11px] text-gray-400">Choose a preset from the dropdown above or click "+ Add Warranty Plan".</p>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
                        {/* Warranty Title - 2 Cols */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="block font-bold text-gray-700">Warranty Title *</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={PRESET_WARRANTIES.includes(w.title) ? w.title : "custom"}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "custom") {
                                  const updated = [...warrantyOptions];
                                  updated[wIdx].title = val;
                                  setWarrantyOptions(updated);
                                  setHasUnsavedChanges(true);
                                }
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-blue-500 shadow-xs"
                            >
                              <option value="custom">✍️ Type Custom Warranty Title</option>
                              {PRESET_WARRANTIES.map((pW, pIdx) => (
                                <option key={pIdx} value={pW}>
                                  {pW}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={w.title}
                              onChange={(e) => {
                                const updated = [...warrantyOptions];
                                updated[wIdx].title = e.target.value;
                                setWarrantyOptions(updated);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="e.g. 1 Year ABANS Warranty"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-blue-500 shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Additional Charge - 1 Col */}
                        <div>
                          <label className="block font-bold text-gray-700 mb-1.5">Additional Charge (LKR)</label>
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
                            placeholder="0 (Free)"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-blue-600 font-mono outline-none focus:border-blue-500 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Coverage Details & Default Checkbox */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end pt-1">
                        <div className="md:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">Coverage Details / Notes</label>
                          <input
                            type="text"
                            value={w.coverage_details || ""}
                            onChange={(e) => {
                              const updated = [...warrantyOptions];
                              updated[wIdx].coverage_details = e.target.value;
                              setWarrantyOptions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="e.g. Hardware defect warranty covered by Street Mobile main store."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 outline-none focus:border-blue-500 shadow-xs"
                          />
                        </div>

                        <div className="flex items-center h-10">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={w.is_default || false}
                              onChange={(e) => {
                                const updated = warrantyOptions.map((item, i) => ({
                                  ...item,
                                  is_default: i === wIdx ? e.target.checked : false,
                                }));
                                setWarrantyOptions(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="font-bold text-gray-900 text-xs">Set as Default Selection</span>
                          </label>
                        </div>
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
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">SEO & Publishing Settings</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom SEO Title Tag</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder={name || "STREET MOBILE - Buy Phone Online"}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Leaves default product name if empty, or type custom text to override.</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder={shortDesc || "Short SEO snippet for Google search..."}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-blue-500 resize-none text-xs"
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
