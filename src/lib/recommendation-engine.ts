import { Product } from "@/lib/types";

export type ProductType =
  | "phone"
  | "charger"
  | "cable"
  | "audio"
  | "watch"
  | "powerbank"
  | "case"
  | "protector"
  | "tablet"
  | "laptop"
  | "general_accessory";

/**
 * Normalizes and detects the brand for any product
 */
export function detectProductBrand(product: Product): string {
  const brandRaw = (
    product.brand_name ||
    product.brandName ||
    product.brand ||
    ""
  ).trim();

  const nameLower = product.name.toLowerCase();
  const catLower = (product.category_name || "").toLowerCase();

  // Explicit brand check
  if (brandRaw && brandRaw.toLowerCase() !== "other" && brandRaw.toLowerCase() !== "standard" && brandRaw.toLowerCase() !== "general") {
    const bLower = brandRaw.toLowerCase();
    if (bLower.includes("apple") || bLower.includes("iphone")) return "Apple";
    if (bLower.includes("samsung") || bLower.includes("galaxy")) return "Samsung";
    if (bLower.includes("xiaomi") || bLower.includes("redmi") || bLower.includes("poco") || bLower.includes("mi")) return "Xiaomi";
    if (bLower.includes("google") || bLower.includes("pixel")) return "Google";
    if (bLower.includes("oneplus")) return "OnePlus";
    if (bLower.includes("huawei")) return "Huawei";
    if (bLower.includes("oppo")) return "Oppo";
    if (bLower.includes("vivo")) return "Vivo";
    if (bLower.includes("realme")) return "Realme";
    if (bLower.includes("anker") || bLower.includes("soundcore")) return "Anker";
    if (bLower.includes("baseus")) return "Baseus";
    if (bLower.includes("ugreen")) return "UGREEN";
    if (bLower.includes("oraimo")) return "Oraimo";
    if (bLower.includes("hoco")) return "Hoco";
    if (bLower.includes("joyroom")) return "Joyroom";
    if (bLower.includes("wiwu")) return "Wiwu";
    if (bLower.includes("lenyes")) return "LENYES";
    if (bLower.includes("sony")) return "Sony";
    if (bLower.includes("jbl")) return "JBL";
    return brandRaw;
  }

  // Name & Category Inferences
  if (
    nameLower.includes("iphone") ||
    nameLower.includes("apple") ||
    nameLower.includes("airpod") ||
    nameLower.includes("magsafe") ||
    nameLower.includes("macbook") ||
    catLower.includes("iphone") ||
    catLower.includes("apple")
  ) {
    return "Apple";
  }

  if (
    nameLower.includes("samsung") ||
    nameLower.includes("galaxy") ||
    nameLower.includes("buds2") ||
    nameLower.includes("buds3") ||
    catLower.includes("samsung")
  ) {
    return "Samsung";
  }

  if (
    nameLower.includes("redmi") ||
    nameLower.includes("xiaomi") ||
    nameLower.includes("poco") ||
    catLower.includes("xiaomi") ||
    catLower.includes("redmi")
  ) {
    return "Xiaomi";
  }

  if (nameLower.includes("pixel") || catLower.includes("pixel") || catLower.includes("google")) {
    return "Google";
  }

  if (nameLower.includes("oneplus") || catLower.includes("oneplus")) return "OnePlus";
  if (nameLower.includes("huawei") || catLower.includes("huawei")) return "Huawei";
  if (nameLower.includes("oppo") || catLower.includes("oppo")) return "Oppo";
  if (nameLower.includes("vivo") || catLower.includes("vivo")) return "Vivo";
  if (nameLower.includes("realme") || catLower.includes("realme")) return "Realme";
  if (nameLower.includes("soundcore") || nameLower.includes("anker")) return "Anker";
  if (nameLower.includes("baseus")) return "Baseus";
  if (nameLower.includes("ugreen")) return "UGREEN";
  if (nameLower.includes("oraimo")) return "Oraimo";
  if (nameLower.includes("hoco")) return "Hoco";
  if (nameLower.includes("joyroom")) return "Joyroom";
  if (nameLower.includes("wiwu")) return "Wiwu";
  if (nameLower.includes("lenyes")) return "LENYES";
  if (nameLower.includes("jbl")) return "JBL";
  if (nameLower.includes("sony")) return "Sony";

  return "Universal";
}

/**
 * Detects the product category type
 */
export function detectProductType(product: Product): ProductType {
  const cat = (product.category_name || "").toLowerCase();
  const name = product.name.toLowerCase();

  if (
    cat.includes("charger") ||
    cat.includes("adapter") ||
    name.includes("adapter") ||
    name.includes("charger") ||
    name.includes("power adapter") ||
    name.includes("fast charge") ||
    name.includes("20w") ||
    name.includes("25w") ||
    name.includes("35w") ||
    name.includes("45w") ||
    name.includes("65w") ||
    name.includes("magsafe charger")
  ) {
    return "charger";
  }

  if (
    cat.includes("cable") ||
    name.includes("cable") ||
    name.includes("type-c to") ||
    name.includes("usb-c to") ||
    name.includes("lightning to")
  ) {
    return "cable";
  }

  if (
    cat.includes("earbud") ||
    cat.includes("headphone") ||
    cat.includes("buds") ||
    cat.includes("audio") ||
    cat.includes("tws") ||
    name.includes("airpods") ||
    name.includes("earbuds") ||
    name.includes("earphone") ||
    name.includes("headphone") ||
    name.includes("earpods") ||
    name.includes("buds") ||
    name.includes("tws") ||
    name.includes("wireless headset")
  ) {
    return "audio";
  }

  if (
    cat.includes("watch") ||
    name.includes("watch") ||
    name.includes("smart watch") ||
    name.includes("band")
  ) {
    return "watch";
  }

  if (
    cat.includes("power") ||
    cat.includes("powerbank") ||
    name.includes("power bank") ||
    name.includes("powerbank") ||
    name.includes("battery pack")
  ) {
    return "powerbank";
  }

  if (cat.includes("case") || name.includes("case") || name.includes("cover")) {
    return "case";
  }

  if (
    cat.includes("screen") ||
    cat.includes("protector") ||
    cat.includes("display") ||
    name.includes("tempered glass") ||
    name.includes("screen guard") ||
    name.includes("protector")
  ) {
    return "protector";
  }

  if (cat.includes("tab") || cat.includes("ipad") || name.includes("ipad") || name.includes("tablet") || name.includes("tab")) {
    return "tablet";
  }

  if (cat.includes("laptop") || cat.includes("macbook") || name.includes("macbook") || name.includes("laptop")) {
    return "laptop";
  }

  if (
    cat.includes("phone") ||
    cat.includes("smartphone") ||
    name.includes("iphone") ||
    name.includes("galaxy") ||
    name.includes("pixel") ||
    name.includes("redmi") ||
    name.includes("poco") ||
    name.includes("5g") ||
    name.includes("pro max") ||
    name.includes("ultra") ||
    name.includes("phone")
  ) {
    return "phone";
  }

  return "general_accessory";
}

/**
 * Computes a high-converting "Frequently Bought Together" Bundle (1-Click Add)
 */
export function getFrequentlyBoughtTogetherBundle(
  currentProduct: Product,
  allProducts: Product[]
): {
  primary: Product;
  bundleItems: Product[];
  totalPrice: number;
  originalTotalPrice: number;
  savings: number;
} {
  const pool = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status !== "draft" && p.status !== "inactive" && p.stock_status !== "out_of_stock"
  );

  const brand = detectProductBrand(currentProduct);
  const type = detectProductType(currentProduct);

  const bundleItems: Product[] = [];

  if (type === "phone" || type === "tablet" || type === "laptop") {
    // 1. Find best matching Charger / Adapter (Apple 20W/35W for iPhone, Samsung 25W/45W for Galaxy, Anker/Baseus universal)
    const charger = pool.find((p) => {
      const pType = detectProductType(p);
      const pBrand = detectProductBrand(p);
      if (pType !== "charger") return false;
      if (brand !== "Universal" && pBrand === brand) return true;
      return pBrand === "Anker" || pBrand === "Baseus" || pBrand === "UGREEN" || pBrand === "Universal";
    });

    if (charger) bundleItems.push(charger);

    // 2. Find best matching Audio / Earbuds or Cable (AirPods / EarPods for iPhone, Galaxy Buds for Samsung, etc.)
    const audioOrCable = pool.find((p) => {
      if (bundleItems.some((b) => b.id === p.id)) return false;
      const pType = detectProductType(p);
      const pBrand = detectProductBrand(p);

      if (pType === "audio" || pType === "cable") {
        if (brand !== "Universal" && pBrand === brand) return true;
        return pBrand === "Anker" || pBrand === "Soundcore" || pBrand === "Baseus" || pBrand === "Oraimo";
      }
      return false;
    });

    if (audioOrCable) bundleItems.push(audioOrCable);

    // If still need items, look for Power Bank or Screen Protector / Watch
    if (bundleItems.length < 2) {
      const thirdItem = pool.find((p) => {
        if (bundleItems.some((b) => b.id === p.id)) return false;
        const pType = detectProductType(p);
        const pBrand = detectProductBrand(p);
        if (pType === "powerbank" || pType === "watch" || pType === "protector" || pType === "case") {
          if (brand !== "Universal" && pBrand === brand) return true;
          return true;
        }
        return false;
      });
      if (thirdItem) bundleItems.push(thirdItem);
    }
  } else if (type === "charger" || type === "cable" || type === "audio" || type === "watch" || type === "powerbank") {
    // If viewing an accessory, pair with companion accessories
    const companion = pool.find((p) => {
      const pType = detectProductType(p);
      const pBrand = detectProductBrand(p);
      if (type === "charger" && (pType === "cable" || pType === "powerbank")) return true;
      if (type === "cable" && (pType === "charger" || pType === "powerbank")) return true;
      if (type === "audio" && (pType === "charger" || pType === "watch" || pType === "powerbank")) return true;
      if (type === "watch" && (pType === "audio" || pType === "charger")) return true;
      if (type === "powerbank" && (pType === "cable" || pType === "charger")) return true;
      return false;
    });

    if (companion) bundleItems.push(companion);

    // Add a second companion
    const secondCompanion = pool.find((p) => {
      if (bundleItems.some((b) => b.id === p.id)) return false;
      const pType = detectProductType(p);
      if (pType !== "phone" && pType !== type) return true;
      return false;
    });
    if (secondCompanion) bundleItems.push(secondCompanion);
  }

  // Calculate pricing
  const allBundleProducts = [currentProduct, ...bundleItems];
  const totalPrice = allBundleProducts.reduce((sum, item) => sum + (item.price || 0), 0);
  const originalTotalPrice = allBundleProducts.reduce(
    (sum, item) => sum + (item.old_price && item.old_price > item.price ? item.old_price : item.price || 0),
    0
  );
  const savings = Math.max(0, originalTotalPrice - totalPrice);

  return {
    primary: currentProduct,
    bundleItems,
    totalPrice,
    originalTotalPrice,
    savings,
  };
}

/**
 * Returns prioritized list of compatible accessories for the product
 */
export function getCompatibleAccessories(
  currentProduct: Product,
  allProducts: Product[],
  limit = 8
): Product[] {
  const pool = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status !== "draft" && p.status !== "inactive" && p.stock_status !== "out_of_stock"
  );

  const brand = detectProductBrand(currentProduct);
  const currentType = detectProductType(currentProduct);

  const scored = pool.map((item) => {
    let score = 0;
    const itemBrand = detectProductBrand(item);
    const itemType = detectProductType(item);

    // Is it an accessory?
    const isAccessory =
      itemType === "charger" ||
      itemType === "cable" ||
      itemType === "audio" ||
      itemType === "watch" ||
      itemType === "powerbank" ||
      itemType === "case" ||
      itemType === "protector" ||
      itemType === "general_accessory";

    if (!isAccessory) {
      score -= 50; // Deprioritize phones when looking for accessories
    } else {
      score += 40;
    }

    // Exact Brand Match (e.g. Apple Adapter / AirPods for iPhone)
    if (brand !== "Universal" && itemBrand.toLowerCase() === brand.toLowerCase()) {
      score += 50;
    }

    // Name keyword match (e.g. contains "iPhone", "Apple", "Galaxy", "Samsung")
    const brandLower = brand.toLowerCase();
    const itemName = item.name.toLowerCase();
    if (brandLower.length > 2 && itemName.includes(brandLower)) {
      score += 30;
    }

    // Product Type priorities for Smartphones:
    if (currentType === "phone") {
      if (itemType === "charger") score += 35;
      else if (itemType === "audio") score += 30;
      else if (itemType === "cable") score += 25;
      else if (itemType === "watch") score += 20;
      else if (itemType === "powerbank") score += 15;
    } else if (currentType === "charger") {
      if (itemType === "cable") score += 35;
      else if (itemType === "powerbank") score += 30;
      else if (itemType === "audio") score += 20;
    } else if (currentType === "audio") {
      if (itemType === "watch") score += 30;
      else if (itemType === "charger") score += 25;
      else if (itemType === "powerbank") score += 20;
    }

    // Premium Universal Accessory Brands get a boost
    if (
      itemBrand === "Anker" ||
      itemBrand === "Soundcore" ||
      itemBrand === "Baseus" ||
      itemBrand === "UGREEN" ||
      itemBrand === "Oraimo" ||
      itemBrand === "Hoco"
    ) {
      score += 20;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .map((s) => s.item)
    .slice(0, limit);
}

/**
 * When viewing an accessory, returns compatible smartphones / devices
 */
export function getCompatibleDevices(
  currentProduct: Product,
  allProducts: Product[],
  limit = 4
): Product[] {
  const pool = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status !== "draft" && p.status !== "inactive"
  );

  const brand = detectProductBrand(currentProduct);

  const scored = pool.map((item) => {
    let score = 0;
    const itemBrand = detectProductBrand(item);
    const itemType = detectProductType(item);

    // Looking for phones and tablets
    if (itemType === "phone") score += 50;
    else if (itemType === "tablet") score += 40;
    else if (itemType === "laptop") score += 30;
    else score -= 30;

    // Brand Match
    if (brand !== "Universal" && itemBrand.toLowerCase() === brand.toLowerCase()) {
      score += 40;
    }

    const brandLower = brand.toLowerCase();
    const itemName = item.name.toLowerCase();
    if (brandLower.length > 2 && itemName.includes(brandLower)) {
      score += 20;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .map((s) => s.item)
    .slice(0, limit);
}

/**
 * Returns other devices / products from the same brand
 */
export function getMoreFromBrand(
  currentProduct: Product,
  allProducts: Product[],
  limit = 4
): { brandName: string; products: Product[] } {
  const brand = detectProductBrand(currentProduct);
  if (!brand || brand === "Universal") {
    return { brandName: "", products: [] };
  }

  const pool = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status !== "draft" && p.status !== "inactive"
  );

  const brandLower = brand.toLowerCase();

  const matches = pool.filter((p) => {
    const pBrand = detectProductBrand(p).toLowerCase();
    const pName = p.name.toLowerCase();
    return pBrand === brandLower || (brandLower.length > 2 && pName.includes(brandLower));
  });

  // Sort by featured / price descending
  matches.sort((a, b) => (b.price || 0) - (a.price || 0));

  return {
    brandName: brand,
    products: matches.slice(0, limit),
  };
}
