import { Product, Category, Brand } from "./types";
import { DEFAULT_BRANDS } from "./data";

export interface MigrationAuditResult {
  productId: string;
  productName: string;
  slug: string;
  originalCategory: string;
  originalBrand?: string;
  suggestedCategoryId: string;
  suggestedCategoryName: string;
  suggestedCategorySlug: string;
  suggestedBrandId: string;
  suggestedBrandName: string;
  suggestedBrandSlug: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "REQUIRES_REVIEW";
  reason: string;
}

const KNOWN_BRAND_NAMES = [
  "Apple", "Samsung", "Redmi", "Xiaomi", "Honor", "Oppo", "Vivo", "Realme",
  "Google", "OnePlus", "JBL", "LENYES", "UGREEN", "Anker", "Baseus", "Oraimo",
  "DJI", "Sony", "Bose", "Huawei", "Joyroom", "Hoco", "REMAX", "LDNIO",
  "Marshall", "Sennheiser", "Kingston", "Wiwu", "Lenyes", "Hollyland"
];

const STANDARD_CATEGORIES = [
  { id: "cat-smartphones", name: "Smartphones", slug: "smartphones" },
  { id: "cat-feature-phones", name: "Feature Phones", slug: "feature-phones" },
  { id: "cat-tablets", name: "Tablets", slug: "tablets" },
  { id: "cat-watches", name: "Smart Watches", slug: "smart-watches" },
  { id: "cat-earbuds", name: "Earbuds & TWS", slug: "earbuds" },
  { id: "cat-headphones", name: "Headphones", slug: "headphones" },
  { id: "cat-speakers", name: "Speakers", slug: "speakers" },
  { id: "cat-adapter", name: "Chargers & Adapters", slug: "chargers-adapters" },
  { id: "cat-cables", name: "Charging Cables", slug: "charging-cables" },
  { id: "cat-powerbanks", name: "Power Banks", slug: "power-banks" },
  { id: "cat-cases", name: "Phone Cases", slug: "phone-cases" },
  { id: "cat-screen-protectors", name: "Screen Protectors", slug: "screen-protectors" },
  { id: "cat-accessories", name: "Mobile Accessories", slug: "mobile-accessories" },
  { id: "cat-repair-parts", name: "Repair Parts", slug: "repair-parts" },
  { id: "cat-laptops", name: "Laptops & MacBooks", slug: "laptops" }
];

export function auditProductClassification(product: Product): MigrationAuditResult {
  const currentCat = product.category_name || product.category_id || "";
  const nameLower = product.name.toLowerCase();
  const descLower = (product.description || "").toLowerCase();

  let detectedBrandName = product.brandName || product.brand || "";
  let confidence: "HIGH" | "MEDIUM" | "LOW" | "REQUIRES_REVIEW" = "HIGH";
  let reason = "Verified separate category and brand.";

  // Check if current category string is actually a brand manufacturer
  const isCategoryABrand = KNOWN_BRAND_NAMES.some(
    b => b.toLowerCase() === currentCat.toLowerCase()
  );

  if (isCategoryABrand && !detectedBrandName) {
    detectedBrandName = KNOWN_BRAND_NAMES.find(
      b => b.toLowerCase() === currentCat.toLowerCase()
    ) || currentCat;
    reason = `Extracted manufacturer brand '${detectedBrandName}' from legacy category field.`;
  }

  // Infer brand if missing
  if (!detectedBrandName) {
    for (const b of KNOWN_BRAND_NAMES) {
      if (nameLower.includes(b.toLowerCase())) {
        detectedBrandName = b;
        break;
      }
    }
  }

  if (!detectedBrandName) {
    detectedBrandName = "Other";
  }

  // Infer actual Product Category (Product Type)
  let targetCat = STANDARD_CATEGORIES.find(c => c.name.toLowerCase() === currentCat.toLowerCase() || c.slug === currentCat.toLowerCase());

  if (!targetCat || isCategoryABrand) {
    if (
      nameLower.includes("iphone") || nameLower.includes("galaxy") ||
      nameLower.includes("phone") || nameLower.includes("redmi note") ||
      nameLower.includes("pixel") || nameLower.includes("smartphone") ||
      product.productType === "phone"
    ) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "smartphones");
      reason += " Identified as Smartphone from product title.";
    } else if (nameLower.includes("watch") || nameLower.includes("fitbit") || nameLower.includes("band")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "smart-watches");
    } else if (nameLower.includes("headphone") || nameLower.includes("headset")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "headphones");
    } else if (nameLower.includes("earbud") || nameLower.includes("airpod") || nameLower.includes("tws") || nameLower.includes("earphone")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "earbuds");
    } else if (nameLower.includes("speaker") || nameLower.includes("soundbar")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "speakers");
    } else if (nameLower.includes("charger") || nameLower.includes("adapter") || nameLower.includes("wall charger")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "chargers-adapters");
    } else if (nameLower.includes("cable") || nameLower.includes("type-c") || nameLower.includes("lightning cable")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "charging-cables");
    } else if (nameLower.includes("power bank") || nameLower.includes("powerbank")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "power-banks");
    } else if (nameLower.includes("macbook") || nameLower.includes("laptop")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "laptops");
    } else if (nameLower.includes("ipad") || nameLower.includes("tab") || nameLower.includes("tablet")) {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "tablets");
    } else {
      targetCat = STANDARD_CATEGORIES.find(c => c.slug === "mobile-accessories");
      confidence = "REQUIRES_REVIEW";
      reason = "Could not identify explicit product type. Moved to review queue.";
    }
  }

  const brandSlug = detectedBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    productId: product.id,
    productName: product.name,
    slug: product.slug,
    originalCategory: currentCat,
    originalBrand: product.brand || product.brandName,
    suggestedCategoryId: targetCat?.id || "cat-accessories",
    suggestedCategoryName: targetCat?.name || "Mobile Accessories",
    suggestedCategorySlug: targetCat?.slug || "mobile-accessories",
    suggestedBrandId: `brand-${brandSlug}`,
    suggestedBrandName: detectedBrandName,
    suggestedBrandSlug: brandSlug,
    confidence,
    reason,
  };
}
