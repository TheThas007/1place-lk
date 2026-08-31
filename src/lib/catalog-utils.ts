import { Product } from "./types";

// ══════════════════════════════════════════════════════════════════════════════
// 1. CANONICAL PRODUCT CATEGORIES (Product Types Only — NEVER Brand Names)
// ══════════════════════════════════════════════════════════════════════════════
export const STANDARD_CATEGORIES: string[] = [
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
  "Keyboards & Mouse",
  "Gimbals & Tripods",
  "OTG & Storage",
  "Mobile Accessories",
  "Repair Parts",
];

// ══════════════════════════════════════════════════════════════════════════════
// 2. CANONICAL BRANDS (Manufacturers Only — NEVER Category Names)
// ══════════════════════════════════════════════════════════════════════════════
export const STANDARD_BRANDS: string[] = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Redmi",
  "Honor",
  "Oppo",
  "Vivo",
  "Realme",
  "OnePlus",
  "Google",
  "JBL",
  "Anker",
  "Soundcore",
  "Baseus",
  "UGREEN",
  "LENYES",
  "Oraimo",
  "Joyroom",
  "Hoco",
  "REMAX",
  "LDNIO",
  "Wiwu",
  "Aspor",
  "Porodo",
  "Brodo",
  "Bugani",
  "Sony",
  "Bose",
  "Marshall",
  "Sennheiser",
  "Fitbit",
  "Haylou",
  "DJI",
  "Huawei",
  "Nokia",
  "HMD",
  "Greentel",
  "Kingston",
  "SanDisk",
  "Hollyland",
  "CMF",
  "Nothing",
  "Asus",
  "MSI",
  "Dell",
  "Lenovo",
  "SHARGE",
  "Yesido",
  "Aukey",
  "Dudao",
  "Havit",
  "Riversong",
  "Boat",
  "Noise",
  "Infinix",
  "Tecno",
  "ZTE",
  "Motorola",
  "Other",
];

// ══════════════════════════════════════════════════════════════════════════════
// 3. ALIAS MAPS FOR ROBUST NORMALIZATION
// ══════════════════════════════════════════════════════════════════════════════
export const BRAND_ALIASES: Record<string, string> = {
  "1+": "OnePlus",
  "oneplus": "OnePlus",
  "one plus": "OnePlus",
  "xiomi": "Xiaomi",
  "xiaomi": "Xiaomi",
  "mi": "Xiaomi",
  "redmi": "Redmi",
  "apple": "Apple",
  "samsung": "Samsung",
  "lenyes": "LENYES",
  "ugreen": "UGREEN",
  "anker": "Anker",
  "baseus": "Baseus",
  "oraimo": "Oraimo",
  "soundcore": "Soundcore",
  "joyroom": "Joyroom",
  "hoco": "Hoco",
  "remax": "REMAX",
  "ldnio": "LDNIO",
  "wiwu": "Wiwu",
  "aspor": "Aspor",
  "porodo": "Porodo",
  "brodo": "Brodo",
  "bugani": "Bugani",
  "sony": "Sony",
  "bose": "Bose",
  "marshall": "Marshall",
  "sennheiser": "Sennheiser",
  "fitbit": "Fitbit",
  "haylou": "Haylou",
  "dji": "DJI",
  "huawei": "Huawei",
  "nokia": "Nokia",
  "hmd": "HMD",
  "greentel": "Greentel",
  "kingston": "Kingston",
  "sandisk": "SanDisk",
  "hollyland": "Hollyland",
  "cmf": "CMF",
  "nothing": "Nothing",
  "asus": "Asus",
  "msi": "MSI",
  "dell": "Dell",
  "lenovo": "Lenovo",
  "sharge": "SHARGE",
  "yesido": "Yesido",
  "aukey": "Aukey",
  "dudao": "Dudao",
  "havit": "Havit",
  "riversong": "Riversong",
  "boat": "Boat",
  "noise": "Noise",
  "infinix": "Infinix",
  "tecno": "Tecno",
  "zte": "ZTE",
  "motorola": "Motorola",
  "moto": "Motorola",
  "honor": "Honor",
  "oppo": "Oppo",
  "vivo": "Vivo",
  "realme": "Realme",
  "google": "Google",
  "jbl": "JBL",
  "other": "Other",
};

export const CATEGORY_ALIASES: Record<string, string> = {
  "smartphone": "Smartphones",
  "smartphones": "Smartphones",
  "smart phones": "Smartphones",
  "phones": "Smartphones",
  "phone": "Smartphones",
  "mobile": "Smartphones",
  "mobiles": "Smartphones",
  "feature phone": "Feature Phones",
  "feature phones": "Feature Phones",
  "tablets": "Tablets & iPads",
  "tablet": "Tablets & iPads",
  "tablets & ipads": "Tablets & iPads",
  "tab": "Tablets & iPads",
  "tabs": "Tablets & iPads",
  "ipad": "Tablets & iPads",
  "ipads": "Tablets & iPads",
  "smart watch": "Smart Watches",
  "smart watches": "Smart Watches",
  "watches": "Smart Watches",
  "watch": "Smart Watches",
  "smartwatch": "Smart Watches",
  "smartwatches": "Smart Watches",
  "buds & tws": "Earbuds & TWS",
  "earbuds": "Earbuds & TWS",
  "earbuds & tws": "Earbuds & TWS",
  "airpods": "Earbuds & TWS",
  "tws": "Earbuds & TWS",
  "earphones": "Earbuds & TWS",
  "earphone": "Earbuds & TWS",
  "wireless earbuds": "Earbuds & TWS",
  "headphones": "Headphones",
  "headphone": "Headphones",
  "headphone & audio": "Headphones",
  "headphones & audio": "Headphones",
  "headset": "Headphones",
  "speakers": "Speakers",
  "speaker": "Speakers",
  "bluetooth speaker": "Speakers",
  "bluetooth speakers": "Speakers",
  "soundbar": "Speakers",
  "soundbars": "Speakers",
  "chargers & adapters": "Chargers & Adapters",
  "charger": "Chargers & Adapters",
  "chargers": "Chargers & Adapters",
  "adapter": "Chargers & Adapters",
  "adapters": "Chargers & Adapters",
  "wall charger": "Chargers & Adapters",
  "fast charger": "Chargers & Adapters",
  "charging cables": "Charging Cables",
  "cable": "Charging Cables",
  "cables": "Charging Cables",
  "usb cable": "Charging Cables",
  "type c cable": "Charging Cables",
  "power banks": "Power Banks",
  "power bank": "Power Banks",
  "powerbank": "Power Banks",
  "powerbanks": "Power Banks",
  "battery": "Power Banks",
  "phone cases": "Phone Cases",
  "phone case": "Phone Cases",
  "cases": "Phone Cases",
  "case": "Phone Cases",
  "covers": "Phone Cases",
  "cover": "Phone Cases",
  "back cover": "Phone Cases",
  "screen protectors": "Screen Protectors",
  "screen protector": "Screen Protectors",
  "display": "Screen Protectors",
  "screen guard": "Screen Protectors",
  "tempered glass": "Screen Protectors",
  "laptops & macbooks": "Laptops & MacBooks",
  "laptops": "Laptops & MacBooks",
  "laptop": "Laptops & MacBooks",
  "macbook": "Laptops & MacBooks",
  "macbooks": "Laptops & MacBooks",
  "keyboards & mouse": "Keyboards & Mouse",
  "keyboard": "Keyboards & Mouse",
  "mouse": "Keyboards & Mouse",
  "gimbals & tripods": "Gimbals & Tripods",
  "gimbal": "Gimbals & Tripods",
  "gimbals": "Gimbals & Tripods",
  "tripod": "Gimbals & Tripods",
  "otg & storage": "OTG & Storage",
  "otg": "OTG & Storage",
  "storage": "OTG & Storage",
  "pen drive": "OTG & Storage",
  "flash drive": "OTG & Storage",
  "mobile accessories": "Mobile Accessories",
  "accessories": "Mobile Accessories",
  "accessory": "Mobile Accessories",
  "repair parts": "Repair Parts",
  "repairs": "Repair Parts",
  "spare parts": "Repair Parts",
  "smart camera": "Mobile Accessories",
  "camera": "Mobile Accessories",
  "projector": "Mobile Accessories",
  "studio light": "Mobile Accessories",
  "router": "Mobile Accessories",
  "selfie stick": "Mobile Accessories",
  "stand": "Mobile Accessories",
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. CLEANING & IDENTIFICATION HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/** Strip emojis, symbols, leading/trailing spaces */
export function cleanCatalogString(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "")
    .replace(/[📁🏷️📱🔌🎧🔋🛡️📷⌨️🖱️💻⌚🔊🤳💡📶📐🛠️✨⭐🚀❌⚠️]/g, "")
    .trim();
}

/** Check if a string is a Brand name */
export function isBrandName(str?: string | null): boolean {
  if (!str) return false;
  const clean = cleanCatalogString(str).toLowerCase();
  if (!clean) return false;

  // Exact check in Brand Aliases
  if (BRAND_ALIASES[clean]) return true;

  // Check in STANDARD_BRANDS
  return STANDARD_BRANDS.some((b) => b.toLowerCase() === clean);
}

/** Check if a string is a Product Category name */
export function isCategoryName(str?: string | null): boolean {
  if (!str) return false;
  const clean = cleanCatalogString(str).toLowerCase();
  if (!clean) return false;

  // "iphone" or "apple" should NOT be classified as category
  if (clean === "iphone" || clean === "apple" || clean === "samsung") return false;

  // Exact check in Category Aliases
  if (CATEGORY_ALIASES[clean]) return true;

  // Check in STANDARD_CATEGORIES
  return STANDARD_CATEGORIES.some((c) => c.toLowerCase() === clean);
}

/**
 * Filter and sanitize a list of categories so that:
 * - NO brand names are included (e.g. Apple, Samsung, JBL are excluded)
 * - Aliases are normalized to canonical standard names
 * - Unique and sorted list is returned
 */
export function sanitizeCategoriesList(rawList: (string | { name?: string })[]): string[] {
  const set = new Set<string>(STANDARD_CATEGORIES);

  rawList.forEach((item) => {
    const rawName = typeof item === "string" ? item : item?.name || "";
    const clean = cleanCatalogString(rawName);
    if (!clean) return;

    const lower = clean.toLowerCase();

    // If it's recognized as a brand name, EXCLUDE IT completely!
    if (isBrandName(clean) || lower === "apple" || lower === "samsung" || lower === "xiaomi" || lower === "redmi") {
      return;
    }

    if (CATEGORY_ALIASES[lower]) {
      set.add(CATEGORY_ALIASES[lower]);
    } else if (clean.length > 1 && !clean.startsWith("--")) {
      set.add(clean);
    }
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Filter and sanitize a list of brands so that:
 * - NO category names are included (e.g. Smartphones, Earbuds are excluded)
 * - Aliases are normalized to canonical standard names
 * - Unique and sorted list is returned
 */
export function sanitizeBrandsList(rawList: (string | { name?: string })[]): string[] {
  const set = new Set<string>(STANDARD_BRANDS);

  rawList.forEach((item) => {
    const rawName = typeof item === "string" ? item : item?.name || "";
    const clean = cleanCatalogString(rawName);
    if (!clean) return;

    const lower = clean.toLowerCase();

    // If it's recognized as a category name, EXCLUDE IT completely!
    if (isCategoryName(clean) || lower === "smartphones" || lower === "phone" || lower === "earbuds" || lower === "headphones") {
      return;
    }

    if (BRAND_ALIASES[lower]) {
      set.add(BRAND_ALIASES[lower]);
    } else if (clean.length > 1 && !clean.startsWith("--")) {
      set.add(clean);
    }
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Robust Product Category Classifier
 * Resolves the genuine category (Product Type) of any product, prioritizing manual user assignments.
 */
export function getProductCategory(p: Product): string {
  const rawCat = cleanCatalogString(
    p.category_name || p.categoryName || (p as any).category || p.category_id || ""
  );

  const name = (p.name || "").toLowerCase();
  const rawCatLower = rawCat.toLowerCase();

  // If no category is specified, infer from product name
  if (!rawCat || rawCatLower === "general" || rawCatLower === "other" || rawCatLower === "all") {
    if (name.includes("iphone") || name.includes("galaxy") || name.includes("smartphone") || name.includes("5g") || name.includes("redmi note") || name.includes("pixel") || p.productType === "phone") {
      return "Smartphones";
    }
    if (name.includes("feature phone") || name.includes("button phone") || name.includes("nokia 105") || name.includes("greentel")) {
      return "Feature Phones";
    }
    if (name.includes("ipad") || name.includes("tablet") || name.includes("tab ")) {
      return "Tablets & iPads";
    }
    if (name.includes("watch") || name.includes("fitbit") || name.includes("band")) {
      return "Smart Watches";
    }
    if (name.includes("airpods") || name.includes("buds") || name.includes("earbuds") || name.includes("tws") || name.includes("earphone")) {
      return "Earbuds & TWS";
    }
    if (name.includes("headphone") || name.includes("headset") || name.includes("marshall major") || name.includes("sony wh-")) {
      return "Headphones";
    }
    if (name.includes("speaker") || name.includes("soundbar") || name.includes("jbl flip") || name.includes("charge 5")) {
      return "Speakers";
    }
    if (name.includes("charger") || name.includes("adapter") || name.includes("fast charge") || name.includes("gan") || name.includes("20w") || name.includes("65w")) {
      return "Chargers & Adapters";
    }
    if (name.includes("cable") || name.includes("type-c") || name.includes("lightning") || name.includes("usb-c")) {
      return "Charging Cables";
    }
    if (name.includes("power bank") || name.includes("powerbank") || name.includes("mah") || name.includes("magsafe battery")) {
      return "Power Banks";
    }
    if (name.includes("case") || name.includes("cover") || name.includes("silicone case")) {
      return "Phone Cases";
    }
    if (name.includes("screen") || name.includes("glass") || name.includes("tempered") || name.includes("protector") || name.includes("display guard")) {
      return "Screen Protectors";
    }
    if (name.includes("macbook") || name.includes("laptop") || name.includes("thinkpad") || name.includes("notebook") || p.productType === "laptop") {
      return "Laptops & MacBooks";
    }
    if (name.includes("keyboard") || name.includes("mouse")) {
      return "Keyboards & Mouse";
    }
    if (name.includes("gimbal") || name.includes("tripod")) {
      return "Gimbals & Tripods";
    }
    if (name.includes("otg") || name.includes("flash drive") || name.includes("pen drive") || name.includes("sandisk") || name.includes("sd card")) {
      return "OTG & Storage";
    }
    return "Smartphones";
  }

  // Map known alias if matched
  if (CATEGORY_ALIASES[rawCatLower]) {
    return CATEGORY_ALIASES[rawCatLower];
  }

  // If rawCat was mistakenly saved as a brand name without category info, infer category
  if (isBrandName(rawCat) && !isCategoryName(rawCat)) {
    if (name.includes("iphone") || name.includes("phone") || p.productType === "phone") return "Smartphones";
    if (name.includes("ipad") || name.includes("tablet")) return "Tablets & iPads";
    if (name.includes("macbook") || name.includes("laptop") || p.productType === "laptop") return "Laptops & MacBooks";
    if (name.includes("airpods") || name.includes("buds") || name.includes("earbuds") || name.includes("tws")) return "Earbuds & TWS";
    if (name.includes("charger") || name.includes("adapter")) return "Chargers & Adapters";
    if (name.includes("cable")) return "Charging Cables";
    if (name.includes("case") || name.includes("cover")) return "Phone Cases";
    if (name.includes("watch")) return "Smart Watches";
    if (name.includes("power bank") || name.includes("powerbank")) return "Power Banks";
    return "Smartphones";
  }

  return rawCat;
}

/**
 * Robust Product Brand Classifier
 * Resolves the genuine manufacturer brand of any product, prioritizing manual user assignments.
 */
export function getProductBrand(p: Product): string {
  const rawBrand = cleanCatalogString(
    p.brand_name || p.brandName || p.brand || (p as any).brand_id || ""
  );
  const rawCat = cleanCatalogString(
    p.category_name || p.categoryName || (p as any).category || ""
  );
  const name = (p.name || "").toLowerCase();
  const rawBrandLower = rawBrand.toLowerCase();

  // If no brand is specified or set to generic placeholders, infer from name/cat
  if (!rawBrand || rawBrandLower === "general" || rawBrandLower === "other") {
    // Check if rawCat was actually a brand (e.g. category_name was "Apple" or "Samsung")
    if (isBrandName(rawCat)) {
      const brandLower = rawCat.toLowerCase();
      if (BRAND_ALIASES[brandLower]) return BRAND_ALIASES[brandLower];
      return rawCat;
    }

    // Infer from product name
    if (name.includes("apple") || name.includes("iphone") || name.includes("macbook") || name.includes("ipad") || name.includes("airpods") || name.includes("apple watch")) return "Apple";
    if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
    if (name.includes("redmi")) return "Redmi";
    if (name.includes("xiaomi") || name.includes("mi ")) return "Xiaomi";
    if (name.includes("honor")) return "Honor";
    if (name.includes("oppo")) return "Oppo";
    if (name.includes("vivo")) return "Vivo";
    if (name.includes("realme")) return "Realme";
    if (name.includes("oneplus") || name.includes("1+")) return "OnePlus";
    if (name.includes("google") || name.includes("pixel")) return "Google";
    if (name.includes("soundcore")) return "Soundcore";
    if (name.includes("jbl")) return "JBL";
    if (name.includes("lenyes")) return "LENYES";
    if (name.includes("ugreen")) return "UGREEN";
    if (name.includes("anker")) return "Anker";
    if (name.includes("baseus")) return "Baseus";
    if (name.includes("oraimo")) return "Oraimo";
    if (name.includes("joyroom")) return "Joyroom";
    if (name.includes("hoco")) return "Hoco";
    if (name.includes("remax")) return "REMAX";
    if (name.includes("ldnio")) return "LDNIO";
    if (name.includes("wiwu")) return "Wiwu";
    if (name.includes("aspor")) return "Aspor";
    if (name.includes("porodo")) return "Porodo";
    if (name.includes("brodo")) return "Brodo";
    if (name.includes("bugani")) return "Bugani";
    if (name.includes("sony")) return "Sony";
    if (name.includes("bose")) return "Bose";
    if (name.includes("marshall")) return "Marshall";
    if (name.includes("fitbit")) return "Fitbit";
    if (name.includes("dji")) return "DJI";
    if (name.includes("huawei")) return "Huawei";
    if (name.includes("nokia")) return "Nokia";
    if (name.includes("hmd")) return "HMD";
    if (name.includes("greentel")) return "Greentel";
    if (name.includes("asus")) return "Asus";
    if (name.includes("dell")) return "Dell";
    if (name.includes("lenovo")) return "Lenovo";
    if (name.includes("msi")) return "MSI";
    if (name.includes("sharge")) return "SHARGE";
    if (name.includes("yesido")) return "Yesido";
    if (name.includes("sandisk")) return "SanDisk";

    return "Other";
  }

  // Map known alias if matched
  if (BRAND_ALIASES[rawBrandLower]) {
    return BRAND_ALIASES[rawBrandLower];
  }

  // If rawBrand was mistakenly set to a pure category name, check if category has brand
  if (isCategoryName(rawBrand) && !isBrandName(rawBrand)) {
    if (isBrandName(rawCat)) return rawCat;
    if (name.includes("apple") || name.includes("iphone") || name.includes("macbook") || name.includes("ipad")) return "Apple";
    if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
    if (name.includes("xiaomi") || name.includes("redmi")) return "Xiaomi";
    if (name.includes("anker") || name.includes("soundcore")) return "Anker";
    if (name.includes("jbl")) return "JBL";
    if (name.includes("ugreen")) return "UGREEN";
    if (name.includes("baseus")) return "Baseus";
    if (name.includes("sony")) return "Sony";
    if (name.includes("bose")) return "Bose";
    return rawBrand;
  }

  return rawBrand;
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 5. DEVICE & ACCESSORY SEGMENT CLASSIFIERS
// ══════════════════════════════════════════════════════════════════════════════

/** Known accessory keywords that disqualify a product from being a pure Phone or Laptop/Tablet */
export const ACCESSORY_INDICATORS: string[] = [
  "case", "cover", "protector", "guard", "glass", "tempered", "sleeve", "pouch", "bag",
  "charger", "adapter", "cable", "cord", "wire", "power bank", "powerbank", "battery",
  "earbud", "earbuds", "earphone", "earphones", "headphone", "headphones", "headset", "tws",
  "speaker", "soundbar", "audio", "mic", "microphone",
  "watch", "strap", "band", "fitbit",
  "mount", "holder", "stand", "dock", "tripod", "gimbal", "selfie",
  "keyboard", "mouse", "stylus", "pencil", "pen", "tip", "nibs",
  "otg", "hub", "dongle", "card reader", "flash drive", "pen drive", "memory card", "sd card", "ssd enclosure",
  "cleaning", "skin", "film", "filter", "parts", "repair", "camera lens", "lens protector", "ring"
];

/** Check if product is a Mobile Phone (Smartphone / Feature Phone) ONLY — Never Accessories */
export function isPhoneSegment(p: Product): boolean {
  if (p.productType === "accessory" || p.productType === "laptop") return false;

  const cat = getProductCategory(p).toLowerCase();
  const name = (p.name || "").toLowerCase();

  // If category or name indicates an accessory, it's NOT a phone!
  const isAccByCat = ACCESSORY_INDICATORS.some((acc) => cat.includes(acc));
  const isAccByName = ACCESSORY_INDICATORS.some((acc) => {
    // Only match word boundaries or obvious indicators
    const regex = new RegExp(`\\b${acc}\\b`, "i");
    return regex.test(name);
  });
  if (isAccByCat || isAccByName) return false;

  if (p.productType === "phone") return true;
  if (cat === "smartphones" || cat === "feature phones" || cat === "phones") return true;

  if (
    name.includes("iphone") ||
    name.includes("galaxy s") ||
    name.includes("galaxy z") ||
    name.includes("galaxy a") ||
    name.includes("galaxy m") ||
    name.includes("galaxy f") ||
    name.includes("redmi note") ||
    name.includes("redmi 1") ||
    name.includes("redmi 9") ||
    name.includes("smartphone") ||
    name.includes("pixel ") ||
    name.includes("nokia 105") ||
    name.includes("nokia 110") ||
    name.includes("nokia 130") ||
    name.includes("nokia 150") ||
    name.includes("nokia 210") ||
    name.includes("nokia 225")
  ) {
    return true;
  }

  return false;
}

/** Check if product is a Laptop / MacBook / iPad / Tablet ONLY — Never Accessories */
export function isLaptopTabletSegment(p: Product): boolean {
  if (p.productType === "accessory" || p.productType === "phone") return false;

  const cat = getProductCategory(p).toLowerCase();
  const name = (p.name || "").toLowerCase();

  // If category or name indicates an accessory, it's NOT a laptop/tablet!
  const isAccByCat = ACCESSORY_INDICATORS.some((acc) => cat.includes(acc));
  const isAccByName = ACCESSORY_INDICATORS.some((acc) => {
    const regex = new RegExp(`\\b${acc}\\b`, "i");
    return regex.test(name);
  });
  if (isAccByCat || isAccByName) return false;

  if (p.productType === "laptop") return true;
  if (
    cat === "laptops & macbooks" ||
    cat === "laptops" ||
    cat === "tablets & ipads" ||
    cat === "tablets" ||
    cat === "ipads"
  ) {
    return true;
  }

  if (
    name.includes("macbook") ||
    name.includes("laptop") ||
    name.includes("thinkpad") ||
    name.includes("notebook") ||
    name.includes("rog strix") ||
    name.includes("ipad") ||
    name.includes("galaxy tab") ||
    name.includes("tablet") ||
    name.includes("redmi pad") ||
    name.includes("xiaomi pad")
  ) {
    return true;
  }

  return false;
}

/** Alias for laptop/tablet segment */
export const isLaptopSegment = isLaptopTabletSegment;

/** Check if product is an Accessory / Audio / Wearable / Peripheral */
export function isAccessorySegment(p: Product): boolean {
  if (p.productType === "accessory") return true;
  if (p.productType === "phone" || p.productType === "laptop") return false;
  return !isPhoneSegment(p) && !isLaptopTabletSegment(p);
}

