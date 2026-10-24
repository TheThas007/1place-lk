import { Product, AssistantProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { WritingStyle } from "./language-detector";

export interface ParsedUserIntent {
  intent:
    | "find_products"
    | "budget_recommend"
    | "compare_products"
    | "spec_question"
    | "accessory_recommend"
    | "compatibility_check"
    | "brand_advice"
    | "stock_price"
    | "general_chat";
  category?: "phone" | "laptop" | "audio" | "wearable" | "power" | "accessory" | "all";
  budget?: { min?: number; max?: number };
  usagePriority?: "gaming" | "camera" | "battery" | "daily_use" | "content_creation" | "value";
  brandPreference?: string;
  compareProducts?: string[];
  queriedProductName?: string;
  isSpecificProductQuery?: boolean;
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

export interface RecommendationResult {
  headline: string;
  text: string;
  products: AssistantProductSummary[];
  comparisonProducts?: AssistantProductSummary[];
  actions?: { label: string; action: string; payload?: any }[];
  followUpQuestions?: string[];
}

// ─────────────────────────────────────────────────────────────
// 1. INTENT & ENTITY EXTRACTION
// ─────────────────────────────────────────────────────────────

export function parseUserQuery(
  text: string,
  style: WritingStyle,
  context?: { currentProduct?: Product | null; previousBudget?: number; previousUsage?: string }
): ParsedUserIntent {
  const clean = text.toLowerCase().trim();

  // 1. Budget extraction
  const budget = extractBudget(clean) || (context?.previousBudget ? { max: context.previousBudget } : undefined);

  // 2. Usage Priority extraction
  let usagePriority: ParsedUserIntent["usagePriority"] = undefined;
  if (
    clean.includes("gaming") ||
    clean.includes("game") ||
    clean.includes("pubg") ||
    clean.includes("free fire") ||
    clean.includes("fps") ||
    clean.includes("கேமிங்")
  ) {
    usagePriority = "gaming";
  } else if (
    clean.includes("camera") ||
    clean.includes("photo") ||
    clean.includes("video") ||
    clean.includes("selfie") ||
    clean.includes("புகைப்படம்") ||
    clean.includes("கேமரா")
  ) {
    usagePriority = "camera";
  } else if (
    clean.includes("battery") ||
    clean.includes("charging") ||
    clean.includes("power") ||
    clean.includes("long lasting") ||
    clean.includes("பேட்டரி")
  ) {
    usagePriority = "battery";
  } else if (
    clean.includes("daily") ||
    clean.includes("normal") ||
    clean.includes("office") ||
    clean.includes("student") ||
    clean.includes("basic") ||
    clean.includes("பயன்பாடு")
  ) {
    usagePriority = "daily_use";
  } else if (
    clean.includes("content") ||
    clean.includes("vlog") ||
    clean.includes("tiktok") ||
    clean.includes("youtube") ||
    clean.includes("reels")
  ) {
    usagePriority = "content_creation";
  } else if (clean.includes("best value") || clean.includes("worth") || clean.includes("value for money")) {
    usagePriority = "value";
  } else if (context?.previousUsage) {
    usagePriority = context.previousUsage as any;
  }

  // 3. Category extraction
  let category: ParsedUserIntent["category"] = "phone"; // default for mobile store
  if (clean.includes("laptop") || clean.includes("macbook") || clean.includes("tab") || clean.includes("ipad") || clean.includes("tablet")) {
    category = "laptop";
  } else if (clean.includes("airpod") || clean.includes("earbud") || clean.includes("headphone") || clean.includes("earphone") || clean.includes("tws") || clean.includes("buds")) {
    category = "audio";
  } else if (clean.includes("watch") || clean.includes("smartwatch") || clean.includes("fitband") || clean.includes("wearable")) {
    category = "wearable";
  } else if (clean.includes("charger") || clean.includes("adapter") || clean.includes("cable") || clean.includes("powerbank") || clean.includes("power bank")) {
    category = "power";
  } else if (clean.includes("case") || clean.includes("cover") || clean.includes("tempered") || clean.includes("guard") || clean.includes("protector") || clean.includes("gimbal")) {
    category = "accessory";
  }

  // 4. Brand Preference extraction
  let brandPreference: string | undefined = undefined;
  if (clean.includes("apple") || clean.includes("iphone") || clean.includes("ipad") || clean.includes("macbook") || clean.includes("ஆப்பிள்")) {
    brandPreference = "Apple";
  } else if (clean.includes("samsung") || clean.includes("galaxy") || clean.includes("சாம்சங்")) {
    brandPreference = "Samsung";
  } else if (clean.includes("xiaomi") || clean.includes("redmi") || clean.includes("poco")) {
    brandPreference = "Xiaomi";
  } else if (clean.includes("anker")) {
    brandPreference = "Anker";
  } else if (clean.includes("baseus")) {
    brandPreference = "Baseus";
  }

  // 5. Comparison Intent check
  const isCompare =
    clean.includes(" vs ") ||
    clean.includes(" vs. ") ||
    clean.includes("compare") ||
    clean.includes("better") ||
    clean.includes("difference") ||
    clean.includes("ஒப்பீடு") ||
    clean.includes("ethu best") ||
    clean.includes("ethu nalla") ||
    clean.includes("edhu best") ||
    clean.includes("mokakda hoda") ||
    (clean.includes("iphone") && clean.includes("samsung"));

  if (isCompare) {
    return {
      intent: "compare_products",
      category,
      brandPreference,
      usagePriority,
      budget,
    };
  }

  // 6. Accessory / Compatibility check
  const isAccessory =
    clean.includes("charger") ||
    clean.includes("case") ||
    clean.includes("cover") ||
    clean.includes("tempered") ||
    clean.includes("cable") ||
    clean.includes("accessory") ||
    clean.includes("compatible") ||
    clean.includes("work aaguma") ||
    clean.includes("set aaguma") ||
    clean.includes("பொருந்துமா");

  if (isAccessory) {
    return {
      intent: "accessory_recommend",
      category: "accessory",
      brandPreference,
      budget,
    };
  }

  // 7. Spec Question check
  const isSpec =
    clean.includes("ram") ||
    clean.includes("storage") ||
    clean.includes("battery") ||
    clean.includes("display") ||
    clean.includes("processor") ||
    clean.includes("spec") ||
    clean.includes("color") ||
    clean.includes("colour") ||
    clean.includes("features") ||
    clean.includes("warranty");

  if (isSpec && !budget) {
    return {
      intent: "spec_question",
      category,
      brandPreference,
    };
  }

  // 8. Budget Recommendation
  if (budget) {
    return {
      intent: "budget_recommend",
      category,
      budget,
      usagePriority,
      brandPreference,
    };
  }

  // 9. Broad request (e.g. "best phone recommend pannunga", "good phone needed")
  if (
    clean.includes("recommend") ||
    clean.includes("best phone") ||
    clean.includes("nalla phone") ||
    clean.includes("phone venum") ||
    clean.includes("hoda phone") ||
    clean.includes("suggest") ||
    clean.includes("வாங்கலாம்") ||
    clean.includes("தெரிவு")
  ) {
    if (!budget && !usagePriority) {
      return {
        intent: "find_products",
        category: "phone",
        needsClarification: true,
      };
    }
    return {
      intent: "budget_recommend",
      category,
      usagePriority,
      brandPreference,
    };
  }

  return {
    intent: "find_products",
    category,
    brandPreference,
    usagePriority,
  };
}

/**
 * Extracts numeric budget from LKR expressions (e.g. 100k, 1.5 lakh, 50,000, 150000)
 */
export function extractBudget(text: string): { min?: number; max?: number } | null {
  // Range: "between 50k and 100k", "50k to 100k"
  const rangeMatch = text.match(/(?:between|from)?\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs)?\s*(?:to|and|-)\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs)?/i);
  if (rangeMatch) {
    let minVal = parseFloat(rangeMatch[1]);
    const minUnit = rangeMatch[2]?.toLowerCase();
    if (minUnit === "k") minVal *= 1000;
    else if (minUnit === "lakh" || minUnit === "lakhs") minVal *= 100000;

    let maxVal = parseFloat(rangeMatch[3]);
    const maxUnit = rangeMatch[4]?.toLowerCase();
    if (maxUnit === "k") maxVal *= 1000;
    else if (maxUnit === "lakh" || maxUnit === "lakhs") maxVal *= 100000;

    return { min: minVal, max: maxVal };
  }

  // Single value: "under 100k", "100000 budget kulla", "1.5 lakh", "Rs. 95000", "50k"
  const singleMatch = text.match(/(under|below|around|budget|within|kulla|less than|upto|up to|rs\.?|lkr|ரூபாய்|ரூபா)?\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs|thousand)?/i);
  if (singleMatch) {
    const prefix = singleMatch[1];
    let num = parseFloat(singleMatch[2]);
    const unit = singleMatch[3]?.toLowerCase();

    // Must have a unit (k, lakh), a budget prefix (budget, under, kulla), or be a 5+ digit number (e.g. 100000)
    const hasBudgetIndicator =
      Boolean(unit) ||
      Boolean(prefix) ||
      text.includes("budget") ||
      text.includes("kulla") ||
      text.includes("under") ||
      text.includes("below") ||
      text.includes("விலை") ||
      text.includes("ரூபாய்");

    if (unit === "k") {
      num *= 1000;
    } else if (unit === "lakh" || unit === "lakhs") {
      num *= 100000;
    } else if (unit === "thousand") {
      num *= 1000;
    } else if (hasBudgetIndicator && num < 1000 && num >= 15) {
      num *= 1000; // e.g. "budget 50" -> 50,000
    }

    // Must be a realistic budget (>= 5,000 LKR) and triggered with a budget indicator or raw large number
    if (num >= 5000 && (hasBudgetIndicator || num >= 10000)) {
      return { max: num };
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// 2. PRODUCT SCORING ALGORITHM
// ─────────────────────────────────────────────────────────────

export function scoreProductForUsage(
  product: Product,
  usagePriority?: ParsedUserIntent["usagePriority"],
  budgetMax?: number
): number {
  let score = 50;

  // Stock status
  if (product.stock_status === "in_stock") score += 15;
  else if (product.stock_status === "low_stock") score += 10;
  else if (product.stock_status === "out_of_stock") score -= 25;

  const price = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;

  // Budget matching
  if (budgetMax && budgetMax > 0) {
    if (price <= budgetMax) {
      // Proximity to budget (getting the most performance for the budget)
      const ratio = price / budgetMax;
      score += Math.round(ratio * 25);
    } else {
      score -= 30; // Exceeds budget
    }
  }

  const blob = `${product.name} ${product.description || ""} ${JSON.stringify(product.specifications || {})} ${(product.tags || []).join(" ")}`.toLowerCase();

  // Usage priority scoring
  if (usagePriority === "gaming") {
    if (blob.includes("snapdragon 8") || blob.includes("a17") || blob.includes("a18") || blob.includes("dimensity 9")) score += 35;
    else if (blob.includes("snapdragon 7") || blob.includes("dimensity 8") || blob.includes("bionic")) score += 25;
    else if (blob.includes("snapdragon 6") || blob.includes("helio g")) score += 15;

    if (blob.includes("120hz") || blob.includes("144hz") || blob.includes("165hz") || blob.includes("pro-motion")) score += 20;
    if (blob.includes("12gb") || blob.includes("16gb")) score += 20;
    else if (blob.includes("8gb")) score += 15;
    if (blob.includes("5000mah") || blob.includes("6000mah")) score += 15;
  } else if (usagePriority === "camera") {
    if (blob.includes("ois") || blob.includes("optical image")) score += 25;
    if (blob.includes("telephoto") || blob.includes("periscope") || blob.includes("5x") || blob.includes("10x")) score += 25;
    if (blob.includes("4k") || blob.includes("8k") || blob.includes("prores") || blob.includes("cinematic")) score += 20;
    if (blob.includes("50mp") || blob.includes("108mp") || blob.includes("200mp") || blob.includes("48mp")) score += 15;
  } else if (usagePriority === "battery") {
    if (blob.includes("6000mah") || blob.includes("7000mah")) score += 35;
    else if (blob.includes("5000mah")) score += 25;
    if (blob.includes("67w") || blob.includes("120w") || blob.includes("80w") || blob.includes("45w")) score += 25;
  } else if (usagePriority === "value") {
    if (product.old_price && product.old_price > price) {
      score += 25; // Good active discount
    }
    if (price < 100000 && (blob.includes("amoled") || blob.includes("120hz"))) score += 20;
  }

  return score;
}

// ─────────────────────────────────────────────────────────────
// 3. TO PRODUCT SUMMARY CONVERTER
// ─────────────────────────────────────────────────────────────

export function toProductSummary(p: Product): AssistantProductSummary {
  const effPrice = p.sale_price && p.sale_price > 0 && p.sale_price < p.price ? p.sale_price : p.price;
  const image =
    p.images && p.images.length > 0
      ? p.images[0]
      : p.image_url || p.image || p.thumbnail || p.cover_image || "/placeholder.png";

  const keySpecs: string[] = [];
  if (p.specifications) {
    for (const [k, v] of Object.entries(p.specifications)) {
      if (keySpecs.length < 3 && v) {
        keySpecs.push(`${k}: ${v}`);
      }
    }
  }

  return {
    id: p.id || p.slug,
    name: p.name,
    slug: p.slug,
    brand_name: p.brand_name || p.brand || p.brandName || "Brand",
    category_name: p.category_name || p.categoryName || "Smartphones",
    price: effPrice,
    old_price: p.old_price || undefined,
    image,
    stock_status: p.stock_status || "in_stock",
    warranty: p.warranty || "1 Year Official Warranty",
    keySpecs: keySpecs.length > 0 ? keySpecs : ["100% Genuine Device", "Official Company Warranty"],
  };
}

// ─────────────────────────────────────────────────────────────
// 4. COMPARISON ANALYSIS GENERATOR
// ─────────────────────────────────────────────────────────────

export function generateProductComparison(
  p1: Product,
  p2: Product,
  style: WritingStyle
): { text: string; products: AssistantProductSummary[] } {
  const p1Price = p1.sale_price && p1.sale_price > 0 ? p1.sale_price : p1.price;
  const p2Price = p2.sale_price && p2.sale_price > 0 ? p2.sale_price : p2.price;

  const p1Specs = p1.specifications || {};
  const p2Specs = p2.specifications || {};

  const p1Processor = p1Specs.Processor || p1Specs.Chipset || p1Specs.CPU || "Flagship Processor";
  const p2Processor = p2Specs.Processor || p2Specs.Chipset || p2Specs.CPU || "Flagship Processor";

  const p1Display = p1Specs.Display || p1Specs.Screen || "High Refresh Rate OLED/AMOLED";
  const p2Display = p2Specs.Display || p2Specs.Screen || "High Refresh Rate OLED/AMOLED";

  const p1Camera = p1Specs.Camera || p1Specs["Main Camera"] || "Pro-Grade Camera System";
  const p2Camera = p2Specs.Camera || p2Specs["Main Camera"] || "Pro-Grade Camera System";

  const p1Battery = p1Specs.Battery || p1Specs["Battery & Charging"] || "All-Day Battery Life";
  const p2Battery = p2Specs.Battery || p2Specs["Battery & Charging"] || "All-Day Battery Life";

  let response = "";

  if (style === "thanglish") {
    response = `⚖️ **${p1.name} vs ${p2.name} - Honest Comparison**

| Feature | ${p1.name.slice(0, 18)} | ${p2.name.slice(0, 18)} |
| :--- | :--- | :--- |
| **Price** | ${formatPrice(p1Price)} | ${formatPrice(p2Price)} |
| **Processor** | ${p1Processor} | ${p2Processor} |
| **Display** | ${p1Display} | ${p2Display} |
| **Camera** | ${p1Camera} | ${p2Camera} |
| **Battery** | ${p1Battery} | ${p2Battery} |
| **Warranty** | ${p1.warranty || "1 Year Warranty"} | ${p2.warranty || "1 Year Warranty"} |

---

🎯 **Enudaiya Recommendation (Ethu Ungaluku Set Aagum?):**

• **${p1.name}**: Video recording, iOS ecosystem, long-term software updates and smooth daily performance-ku best choice.
• **${p2.name}**: Zoom camera, display brightness, multitasking and battery speed-ku super choice.

Neenga camera & video-ku mukkiyam tharingala, illa gaming & battery-ka? Sollunga, correct-ana option select panna help panren!`;
  } else if (style === "ta") {
    response = `⚖️ **${p1.name} vs ${p2.name} - நேரடி ஒப்பீடு (Direct Comparison)**

| அம்சம் (Feature) | ${p1.name.slice(0, 18)} | ${p2.name.slice(0, 18)} |
| :--- | :--- | :--- |
| **விலை (Price)** | ${formatPrice(p1Price)} | ${formatPrice(p2Price)} |
| **Processor** | ${p1Processor} | ${p2Processor} |
| **திரை (Display)** | ${p1Display} | ${p2Display} |
| **Camera** | ${p1Camera} | ${p2Camera} |
| **Battery** | ${p1Battery} | ${p2Battery} |
| **Warranty** | ${p1.warranty || "1 வருட Warranty"} | ${p2.warranty || "1 வருட Warranty"} |

---

🎯 **1Place AI-ன் பரிந்துரை:**

• **${p1.name}**: சிறந்த Video தரம், மென்மையான இயங்குதளம் மற்றும் நீண்ட கால மறுவிற்பனை மதிப்புக்கு (Resale Value) சிறந்தது.
• **${p2.name}**: சிறந்த Zoom Camera, பல்துறை Display மற்றும் வேகமான Charging-க்கு உகந்தது.

உங்களுக்கு Video முக்கியமா அல்லது Zoom & Battery முக்கியமா?`;
  } else if (style === "si" || style === "singlish") {
    response = `⚖️ **${p1.name} vs ${p2.name} - සන්සන්දනය**

| විශේෂාංග | ${p1.name.slice(0, 18)} | ${p2.name.slice(0, 18)} |
| :--- | :--- | :--- |
| **මිල** | ${formatPrice(p1Price)} | ${formatPrice(p2Price)} |
| **Processor** | ${p1Processor} | ${p2Processor} |
| **Display** | ${p1Display} | ${p2Display} |
| **Camera** | ${p1Camera} | ${p2Camera} |
| **Battery** | ${p1Battery} | ${p2Battery} |
| **Warranty** | ${p1.warranty || "වසරක වගකීම"} | ${p2.warranty || "වසරක වගකීම"} |

---

🎯 **නිර්දේශය:**
• **${p1.name}**: වීඩියෝ සහ සුමට ක්‍රියාකාරීත්වයට වඩාත් සුදුසුය.
• **${p2.name}**: විශිෂ්ට Camera Zoom සහ Display ගුණාත්මකභාවයට හොඳම තේරීමයි.`;
  } else {
    response = `⚖️ **${p1.name} vs ${p2.name} - In-Depth Comparison**

| Feature | ${p1.name.slice(0, 20)} | ${p2.name.slice(0, 20)} |
| :--- | :--- | :--- |
| **Price** | ${formatPrice(p1Price)} | ${formatPrice(p2Price)} |
| **Processor** | ${p1Processor} | ${p2Processor} |
| **Display** | ${p1Display} | ${p2Display} |
| **Camera** | ${p1Camera} | ${p2Camera} |
| **Battery** | ${p1Battery} | ${p2Battery} |
| **Warranty** | ${p1.warranty || "1 Year Official Warranty"} | ${p2.warranty || "1 Year Official Warranty"} |

---

🎯 **Honest Verdict:**

• **Choose ${p1.name}** if you prioritize class-leading video recording, ecosystem integration, and sustained resale value.
• **Choose ${p2.name}** if you want superior zoom optics, ultra-vivid display brightness, and versatile multitasking.

Which aspect matters most for your daily use: **Camera**, **Gaming**, or **Battery**?`;
  }

  return {
    text: response,
    products: [toProductSummary(p1), toProductSummary(p2)],
  };
}
