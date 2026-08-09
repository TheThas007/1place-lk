import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Product, Category } from "./types";
import { categories as defaultCategories } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Consistently format numbers to Sri Lankan LKR currency strings: LKR 114,990
 */
export function formatPrice(price: number): string {
  if (typeof price !== "number" || isNaN(price)) {
    return "LKR 0";
  }
  const formattedNumber = Math.round(price).toLocaleString("en-US");
  return `LKR ${formattedNumber}`;
}

/**
 * Generate a WhatsApp chat URL using international format without spaces (+94774141118)
 */
export function generateWhatsAppUrl(message?: string, phoneOverride?: string): string {
  const phone = phoneOverride || "94774141118";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const text = message || "Hi! I'm interested in your products at STREET MOBILE.";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Announcement helper for screen readers
 */
export function announceToScreenReader(message: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById("cart-live-announce");
  if (el) {
    el.textContent = message;
  }
}

/**
 * Checks whether a given category ID or Name belongs to Mobile Phones (group: "phones" or phone brand).
 */
export function isPhoneCategory(categoryIdOrName?: string, categoriesList?: Category[]): boolean {
  if (!categoryIdOrName) return false;
  const cats = categoriesList && categoriesList.length > 0 ? categoriesList : defaultCategories;
  const searchKey = categoryIdOrName.trim().toLowerCase();

  // 1. Direct match in categories list
  const matchedCat = cats.find(
    (c) =>
      c.id.toLowerCase() === searchKey ||
      c.slug.toLowerCase() === searchKey ||
      c.name.toLowerCase() === searchKey
  );

  if (matchedCat) {
    if (matchedCat.group === "phones") return true;
    if (matchedCat.group === "accessories") return false;
  }

  // 2. Explicit accessory keywords (Return false immediately)
  const accessoryKeywords = [
    "accessories", "accessory", "anker", "soundcore", "ugreen", "baseus",
    "dji", "cmf", "wiwu", "lenyes", "hollyland", "green lion", "green-lion", "brodu", "jbl",
    "charger", "cable", "case", "cover", "protector", "tempered glass", "powerbank",
    "power bank", "headphone", "earphone", "earbuds", "airpods", "smartwatch",
    "smart watch", "watch", "tablet", "tablets", "ipad", "gadget", "gadgets", "holder",
    "mount", "adapter", "hub", "strap", "magsafe", "gimbal"
  ];
  if (accessoryKeywords.some((kw) => searchKey.includes(kw))) {
    return false;
  }

  // 3. Known phone brand names & IDs
  const phoneBrandKeys = [
    "1", "2", "3", "4", "5", "6", "7", "11", "12", "13",
    "iphone", "samsung", "xiaomi", "redmi", "oppo", "vivo", "realme",
    "google", "honor", "oneplus", "pixel", "apple", "huawei", "nothing",
    "motorola", "nokia", "sony", "asus", "iqoo", "poco", "infinix", "tecno",
    "phone", "phones", "mobile", "smartphones", "smartphone"
  ];

  return phoneBrandKeys.some((pb) => searchKey.includes(pb) || searchKey === pb);
}

/**
 * Checks whether a product is a Mobile Phone product (vs Accessory or Gadget).
 */
export function isPhoneProduct(product?: Partial<Product> | null, categoriesList?: Category[]): boolean {
  if (!product) return false;

  // 1. Check product category_id or category_name
  if (product.category_id && isPhoneCategory(product.category_id, categoriesList)) {
    return true;
  }
  if (product.category_name && isPhoneCategory(product.category_name, categoriesList)) {
    return true;
  }

  // 2. If category_name or category_id explicitly matched non-phone, verify accessory keywords
  const catText = ((product.category_id || "") + " " + (product.category_name || "")).toLowerCase();
  const accessoryKeywords = ["accessories", "accessory", "anker", "soundcore", "ugreen", "baseus", "dji", "charger", "cable", "case", "cover", "protector", "powerbank", "earbuds", "airpods", "watch", "headphone"];
  if (accessoryKeywords.some((kw) => catText.includes(kw))) {
    return false;
  }

  // 3. Check product name for phone keywords
  const nameLower = (product.name || "").toLowerCase();
  const phoneKeywords = ["iphone", "galaxy s", "galaxy a", "galaxy z", "pixel", "redmi note", "xiaomi", "oneplus", "oppo reno", "vivo v", "realme"];
  if (phoneKeywords.some((kw) => nameLower.includes(kw))) {
    return true;
  }

  return false;
}

