import { Product, Category, Brand } from "@/lib/types";
import { getProductSearchClickBoost } from "./search-history";

// ─────────────────────────────────────────────────────────────
// 1. SYNONYMS & EXPANSION DICTIONARY
// ─────────────────────────────────────────────────────────────
export const SYNONYM_MAP: Record<string, string[]> = {
  // Mobile Phones & Models
  phone: ["mobile", "smartphone", "cellphone", "ios phone", "android", "handset", "device", "cellular"],
  mobile: ["phone", "smartphone", "cellphone", "handset"],
  smartphone: ["phone", "mobile", "cellphone", "handset"],
  iphone: ["apple phone", "ios phone", "apple mobile", "smartphone", "iphone pro", "iphone pro max", "iphone plus"],
  galaxy: ["samsung phone", "samsung galaxy", "smartphone", "galaxy ultra", "galaxy plus"],
  redmi: ["xiaomi redmi", "xiaomi", "poco", "smartphone"],
  pixel: ["google pixel", "google phone", "smartphone"],

  // Redmi Note Models & Shorthands
  "note 15": ["redmi note 15", "note15"],
  "note 15 pro": ["redmi note 15 pro", "note15 pro", "note 15 pro 5g"],
  "note 15 plus": ["redmi note 15 plus", "redmi note 15+"],
  "note 15 pro plus": ["redmi note 15 pro+", "redmi note 15+ pro", "redmi note 15 pro plus 5g", "note 15 pro+ 5g"],
  "note 15+ pro": ["redmi note 15 pro+", "redmi note 15 pro plus", "redmi note 15+ pro 5g", "note 15 pro+ 5g"],
  "note 15 pro+": ["redmi note 15 pro plus", "redmi note 15+ pro", "redmi note 15 pro+ 5g"],
  "note 14 pro+": ["redmi note 14 pro plus", "redmi note 14+ pro", "redmi note 14 pro+ 5g"],
  "note 13 pro+": ["redmi note 13 pro plus", "redmi note 13+ pro", "redmi note 13 pro+ 5g"],

  // Shorthand Model Specifics
  s26: ["samsung galaxy s26", "galaxy s26", "samsung s26", "s26 ultra", "s26 plus", "galaxy s26 ultra"],
  "s26 ultra": ["samsung galaxy s26 ultra", "galaxy s26 ultra", "s26 ultra"],
  s25: ["samsung galaxy s25", "galaxy s25", "samsung s25", "s25 ultra", "s25 plus"],
  s24: ["samsung galaxy s24", "galaxy s24", "samsung s24", "s24 ultra", "s24 plus"],
  s23: ["samsung galaxy s23", "galaxy s23", "samsung s23", "s23 ultra"],
  s22: ["samsung galaxy s22", "galaxy s22", "samsung s22", "s22 ultra"],
  "17pro": ["iphone 17 pro", "apple iphone 17 pro", "iphone 17 pro max"],
  "17 pro": ["iphone 17 pro", "apple iphone 17 pro", "iphone 17 pro max"],
  "17promax": ["iphone 17 pro max", "apple iphone 17 pro max"],
  "17 pro max": ["iphone 17 pro max", "apple iphone 17 pro max"],
  "16pro": ["iphone 16 pro", "apple iphone 16 pro", "iphone 16 pro max"],
  "16 pro": ["iphone 16 pro", "apple iphone 16 pro", "iphone 16 pro max"],
  "16promax": ["iphone 16 pro max", "apple iphone 16 pro max"],
  "16 pro max": ["iphone 16 pro max", "apple iphone 16 pro max"],
  "15pro": ["iphone 15 pro", "apple iphone 15 pro", "iphone 15 pro max"],
  "15 pro": ["iphone 15 pro", "apple iphone 15 pro", "iphone 15 pro max"],
  "15promax": ["iphone 15 pro max", "apple iphone 15 pro max"],
  "15 pro max": ["iphone 15 pro max", "apple iphone 15 pro max"],
  "14pro": ["iphone 14 pro", "apple iphone 14 pro", "iphone 14 pro max"],
  "14 pro": ["iphone 14 pro", "apple iphone 14 pro"],
  "13pro": ["iphone 13 pro", "apple iphone 13 pro"],
  "13 pro": ["iphone 13 pro", "apple iphone 13 pro"],

  // Accessories
  accessory: ["accessories", "gear", "add-on", "gadget", "peripheral"],
  accessories: ["accessory", "gear", "add-on", "gadgets", "phone accessories", "mobile accessories"],

  // Power & Charging
  charger: ["charging adapter", "charging plug", "power adapter", "fast charger", "wall charger", "power brick", "gan charger", "pd charger"],
  adapter: ["charger", "power adapter", "charging plug", "converter", "otg", "hub"],
  cable: ["charging cable", "cord", "wire", "type c cable", "lightning cable", "usb c cable", "data cable", "fast charging cable"],
  powerbank: ["power bank", "portable charger", "battery pack", "external battery", "portable battery"],
  "power bank": ["powerbank", "portable charger", "battery pack", "external battery"],
  battery: ["powerbank", "power bank", "replacement battery"],

  // Audio
  headphones: ["headset", "earphones", "earbuds", "airpods", "tws", "buds", "wireless audio", "sound", "over ear"],
  headphone: ["headphones", "headset", "earphones", "earbuds", "tws"],
  headset: ["headphones", "earphones", "earbuds", "mic"],
  earbuds: ["earphones", "airpods", "buds", "tws", "wireless earbuds", "in ear", "headphones"],
  earbud: ["earbuds", "earphones", "buds", "tws"],
  earphones: ["earbuds", "headphones", "in ear", "handsfree"],
  earphone: ["earphones", "earbuds", "headphones"],
  airpods: ["apple earbuds", "earbuds", "airpods pro", "airpods max", "tws"],
  airpod: ["airpods", "earbuds", "apple earbuds"],
  speaker: ["bluetooth speaker", "wireless speaker", "soundbar", "audio speaker", "portable speaker", "jbl"],

  // Computing & Tablets
  laptop: ["notebook", "macbook", "computer", "pc", "laptop computer"],
  macbook: ["apple laptop", "laptop", "macbook pro", "macbook air", "mac"],
  tablet: ["ipad", "tab", "galaxy tab", "pad", "tablet pc"],
  ipad: ["apple tablet", "tablet", "ipad pro", "ipad air", "ipad mini", "pad"],
  tab: ["tablet", "galaxy tab", "pad"],

  // Protection & Cases
  case: ["cover", "back cover", "phone case", "silicon case", "pouch", "sleeve", "protector"],
  cover: ["case", "phone cover", "back cover", "protection"],
  sleeve: ["laptop sleeve", "case", "bag", "laptop bag", "pouch"],
  glass: ["tempered glass", "screen protector", "screen guard", "privacy glass", "uv glass", "protector"],
  "tempered glass": ["screen protector", "screen guard", "glass", "privacy glass"],
  "screen protector": ["tempered glass", "screen guard", "glass", "screen shield"],
  protector: ["screen protector", "tempered glass", "case", "cover", "camera protector"],

  // Wearables
  watch: ["smartwatch", "smart watch", "fitness band", "apple watch", "galaxy watch", "wearable"],
  smartwatch: ["watch", "smart watch", "fitness tracker", "wearable"],
  "smart watch": ["smartwatch", "watch", "wearable"],
  strap: ["watch band", "watch strap", "silicone strap", "metal band", "belt"],
  band: ["fitness band", "smart band", "watch strap"],

  // Peripherals & Storage
  storage: ["sd card", "memory card", "flash drive", "pen drive", "usb drive", "ssd", "hard drive"],
  "sd card": ["memory card", "micro sd", "storage", "tf card"],
  "memory card": ["sd card", "micro sd", "storage"],
  "pen drive": ["flash drive", "usb drive", "thumb drive", "storage"],
  gimbal: ["stabilizer", "tripod", "selfie stick", "camera stand", "dji"],
  tripod: ["stand", "holder", "mount", "gimbal"],
  holder: ["mount", "car mount", "stand", "dock"],
  mount: ["holder", "car mount", "bike mount", "stand"],
  pencil: ["stylus", "apple pencil", "pen", "touch pen"],
  stylus: ["pencil", "touch pen", "apple pencil"],
  mouse: ["wireless mouse", "bluetooth mouse", "optical mouse"],
  keyboard: ["wireless keyboard", "bluetooth keyboard", "mechanical keyboard"],
};

// Common typos and phonetic corrections
export const COMMON_TYPOS: Record<string, string> = {
  iphnoe: "iphone",
  iphon: "iphone",
  ipone: "iphone",
  ifone: "iphone",
  iphne: "iphone",
  iphoen: "iphone",
  aple: "apple",
  appl: "apple",
  samsng: "samsung",
  samsun: "samsung",
  sumsung: "samsung",
  samusng: "samsung",
  samung: "samsung",
  airpod: "airpods",
  airpode: "airpods",
  arpod: "airpods",
  chargar: "charger",
  chager: "charger",
  chargre: "charger",
  charjer: "charger",
  headphon: "headphones",
  headphons: "headphones",
  hedphone: "headphones",
  hedphones: "headphones",
  erbuds: "earbuds",
  earbud: "earbuds",
  earpod: "earbuds",
  erphones: "earphones",
  moblie: "mobile",
  mobiel: "mobile",
  mobil: "mobile",
  samrtphone: "smartphone",
  smartphon: "smartphone",
  smartpone: "smartphone",
  laptap: "laptop",
  labtop: "laptop",
  loptop: "laptop",
  mackbook: "macbook",
  macbok: "macbook",
  xiami: "xiaomi",
  xiomi: "xiaomi",
  xaomi: "xiaomi",
  redmi: "redmi",
  radmi: "redmi",
  readmi: "redmi",
  ancker: "anker",
  ankor: "anker",
  ankr: "anker",
  soundcor: "soundcore",
  soundcore: "soundcore",
  baseous: "baseus",
  basus: "baseus",
  ugren: "ugreen",
  sonny: "sony",
  tablit: "tablet",
  tablat: "tablet",
  screan: "screen",
  protactor: "protector",
  protectr: "protector",
  tampered: "tempered",
  tempared: "tempered",
  cabel: "cable",
  caable: "cable",
  pwerbank: "powerbank",
  powerbak: "powerbank",
  powebank: "powerbank",
  wtach: "watch",
  whatch: "watch",
  smrtwatch: "smartwatch",
};

// ─────────────────────────────────────────────────────────────
// 2. NORMALIZATION & LEVENSHTEIN FUZZY MATCHING
// ─────────────────────────────────────────────────────────────

/** Normalize string into clean searchable lowercase tokens */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "") // remove emojis
    .replace(/\+/g, " plus ") // convert + to plus so 15+ / Pro+ is distinguished from 15 / Pro
    .replace(/&/g, " and ")
    .replace(/([a-z]+)(\d+)/gi, "$1 $2") // e.g. note15 -> note 15
    .replace(/(\d+)(pro|plus|max|ultra|mini|lite)/gi, "$1 $2") // e.g. 15pro -> 15 pro
    .replace(/[^a-z0-9\s]/g, " ") // replace special chars with spaces
    .replace(/\s+/g, " ")
    .trim();
}

/** Compute Levenshtein distance between two strings */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/** Check if query token is a fuzzy match for target word */
export function isFuzzyMatch(queryToken: string, targetWord: string): boolean {
  if (targetWord.includes(queryToken)) return true;
  if (queryToken.length < 3) return false;

  // Exact prefix match
  if (targetWord.startsWith(queryToken)) return true;

  // Max allowed distance depends on length
  const maxDistance = queryToken.length <= 4 ? 1 : queryToken.length <= 8 ? 2 : 3;
  const dist = levenshteinDistance(queryToken, targetWord);
  return dist <= maxDistance;
}

// ─────────────────────────────────────────────────────────────
// 3. TYPO DETECTION & "DID YOU MEAN?" GENERATOR
// ─────────────────────────────────────────────────────────────

/** Build search vocabulary from existing catalog for dynamic typo correction */
export function buildSearchVocabulary(
  products: Product[],
  categories: Category[],
  brands: Brand[]
): string[] {
  const set = new Set<string>();

  // Add standard terms
  [
    "iphone", "apple", "samsung", "galaxy", "xiaomi", "redmi", "google", "pixel", "anker",
    "jbl", "sony", "baseus", "ugreen", "phone", "smartphone", "laptop", "macbook", "tablet",
    "ipad", "watch", "smartwatch", "charger", "adapter", "cable", "earbuds", "airpods",
    "headphones", "speaker", "case", "cover", "tempered", "glass", "protector", "powerbank",
    "storage", "pencil", "gimbal", "pro", "max", "plus", "ultra", "mini", "series",
  ].forEach((w) => set.add(w));

  // Add brand names
  brands.forEach((b) => {
    if (b.name) {
      normalizeText(b.name).split(" ").forEach((w) => w.length >= 2 && set.add(w));
    }
  });

  // Add category names
  categories.forEach((c) => {
    if (c.name) {
      normalizeText(c.name).split(" ").forEach((w) => w.length >= 2 && set.add(w));
    }
  });

  // Add product words
  products.forEach((p) => {
    if (p.name) {
      normalizeText(p.name).split(" ").forEach((w) => w.length >= 2 && set.add(w));
    }
    if (p.tags) {
      p.tags.forEach((t) => normalizeText(t).split(" ").forEach((w) => w.length >= 2 && set.add(w)));
    }
  });

  return Array.from(set);
}

/** Detect if user made a typo and propose best "Did you mean" correction */
export function detectTypoCorrection(
  query: string,
  vocabulary: string[]
): string | null {
  const cleanQ = normalizeText(query);
  if (!cleanQ || cleanQ.length < 3) return null;

  const tokens = cleanQ.split(" ").filter(Boolean);
  let changed = false;
  const correctedTokens: string[] = [];

  for (const token of tokens) {
    // 1. Direct match in common typo dictionary
    if (COMMON_TYPOS[token]) {
      correctedTokens.push(COMMON_TYPOS[token]);
      changed = true;
      continue;
    }

    // 2. If token is already in vocabulary or very short, keep it
    if (token.length < 3 || vocabulary.includes(token)) {
      correctedTokens.push(token);
      continue;
    }

    // 3. Find closest word in vocabulary
    let bestWord = token;
    let minDistance = 999;
    const maxDistAllowed = token.length <= 4 ? 1 : 2;

    for (const vocabWord of vocabulary) {
      if (Math.abs(vocabWord.length - token.length) > maxDistAllowed) continue;
      const dist = levenshteinDistance(token, vocabWord);
      if (dist < minDistance && dist <= maxDistAllowed) {
        minDistance = dist;
        bestWord = vocabWord;
      }
    }

    if (bestWord !== token) {
      correctedTokens.push(bestWord);
      changed = true;
    } else {
      correctedTokens.push(token);
    }
  }

  if (changed) {
    const candidate = correctedTokens.join(" ");
    return candidate !== cleanQ ? candidate : null;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// 4. SEARCHABLE BLOB GENERATOR FOR PRODUCT
// ─────────────────────────────────────────────────────────────

export interface SearchableProductIndex {
  product: Product;
  cleanName: string;
  cleanBrand: string;
  cleanCategory: string;
  cleanSubcategory: string;
  cleanTags: string[];
  cleanSpecs: string;
  cleanDesc: string;
  cleanStorage: string[];
  cleanColors: string[];
  cleanCode: string;
  fullBlob: string;
}

export function indexProduct(p: Product): SearchableProductIndex {
  const cleanName = normalizeText(p.name || "");
  const cleanBrand = normalizeText(p.brand_name || p.brandName || p.brand || "");
  const cleanCategory = normalizeText(p.category_name || p.categoryName || "");
  const cleanSubcategory = normalizeText(p.subcategory_name || p.subcategoryName || p.subcategory_slug || p.subcategorySlug || p.subcategory_id || p.subcategoryId || "");
  const cleanTags = (p.tags || []).map((t) => normalizeText(t)).filter(Boolean);

  const specsText = p.specifications
    ? Object.entries(p.specifications)
        .map(([k, v]) => `${k} ${v}`)
        .join(" ")
    : "";
  const cleanSpecs = normalizeText(specsText);
  const cleanDesc = normalizeText(p.description || "").slice(0, 500);

  const cleanStorage = (p.storage_options || []).map((s) => normalizeText(s));
  const rawColors = (p.colors || p.color_variants || []) as (string | { name?: string })[];
  const cleanColors = rawColors
    .map((c) => (typeof c === "string" ? normalizeText(c) : normalizeText(c?.name || "")))
    .filter(Boolean);
  const cleanCode = normalizeText(p.code || p.sku || "");

  const fullBlob = `${cleanName} ${cleanBrand} ${cleanCategory} ${cleanSubcategory} ${cleanTags.join(" ")} ${cleanSpecs} ${cleanStorage.join(" ")} ${cleanColors.join(" ")} ${cleanCode} ${cleanDesc}`;

  return {
    product: p,
    cleanName,
    cleanBrand,
    cleanCategory,
    cleanSubcategory,
    cleanTags,
    cleanSpecs,
    cleanDesc,
    cleanStorage,
    cleanColors,
    cleanCode,
    fullBlob,
  };
}

// ─────────────────────────────────────────────────────────────
// 5. WEIGHTED RELEVANCE SCORING ALGORITHM
// ─────────────────────────────────────────────────────────────

export interface ScoredProduct {
  product: Product;
  score: number;
  matchReasons: string[];
}

export function scoreProductForQuery(
  indexed: SearchableProductIndex,
  query: string,
  synonyms: string[] = []
): ScoredProduct | null {
  const q = normalizeText(query);
  if (!q) return null;

  const { product, cleanName, cleanBrand, cleanCategory, cleanSubcategory, cleanTags, cleanSpecs, cleanStorage, cleanColors, cleanCode, cleanDesc, fullBlob } = indexed;

  let score = 0;
  const matchReasons: string[] = [];

  // 1. Exact Full Name Match (Top Priority)
  if (cleanName === q) {
    score += 120;
    matchReasons.push("exact_name");
  } else if (cleanName.startsWith(q)) {
    score += 100;
    matchReasons.push("name_starts_with");
  } else if (cleanName.includes(q)) {
    score += 85;
    matchReasons.push("name_contains");
  }

  // 2. Brand Match
  if (cleanBrand === q) {
    score += 85;
    matchReasons.push("exact_brand");
  } else if (cleanBrand.startsWith(q)) {
    score += 75;
    matchReasons.push("brand_starts_with");
  } else if (cleanBrand.includes(q)) {
    score += 65;
    matchReasons.push("brand_contains");
  }

  // 3. Category / Subcategory Match
  if (cleanCategory === q || cleanSubcategory === q) {
    score += 75;
    matchReasons.push("exact_category");
  } else if (cleanCategory.startsWith(q)) {
    score += 65;
    matchReasons.push("category_starts_with");
  } else if (cleanCategory.includes(q)) {
    score += 55;
    matchReasons.push("category_contains");
  }

  // 4. Code / Sku Match
  if (cleanCode && (cleanCode === q || cleanCode.includes(q))) {
    score += 90;
    matchReasons.push("code_match");
  }

  // 5. Individual Token Matching
  const queryTokens = q.split(" ").filter(Boolean);
  let matchedTokensCount = 0;

  for (const token of queryTokens) {
    let tokenMatched = false;

    // Word boundary check in name
    const nameWords = cleanName.split(" ");
    if (nameWords.some((w) => w === token || w.startsWith(token))) {
      score += 35;
      tokenMatched = true;
    } else if (cleanName.includes(token)) {
      score += 20;
      tokenMatched = true;
    }

    // Brand word check
    if (cleanBrand.includes(token)) {
      score += 25;
      tokenMatched = true;
    }

    // Category check
    if (cleanCategory.includes(token)) {
      score += 20;
      tokenMatched = true;
    }

    // Tags check
    if (cleanTags.some((t) => t.includes(token))) {
      score += 25;
      tokenMatched = true;
    }

    // Storage / Specs check
    if (cleanStorage.some((s) => s.includes(token)) || cleanColors.some((c) => c.includes(token))) {
      score += 25;
      tokenMatched = true;
    }

    // Specs check
    if (cleanSpecs.includes(token)) {
      score += 15;
      tokenMatched = true;
    }

    // Description check
    if (cleanDesc.includes(token)) {
      score += 10;
      tokenMatched = true;
    }

    // Fuzzy check if not matched yet
    if (!tokenMatched && token.length >= 3) {
      if (nameWords.some((w) => isFuzzyMatch(token, w))) {
        score += 15;
        tokenMatched = true;
        matchReasons.push("fuzzy_name");
      } else if (isFuzzyMatch(token, cleanBrand) || isFuzzyMatch(token, cleanCategory)) {
        score += 12;
        tokenMatched = true;
        matchReasons.push("fuzzy_brand_cat");
      }
    }

    if (tokenMatched) matchedTokensCount++;
  }

  // 6. Token Coverage Multiplier (Rewards products matching all words in query)
  if (queryTokens.length > 1 && matchedTokensCount === queryTokens.length) {
    score = Math.round(score * 1.4);
    matchReasons.push("all_tokens_matched");
  }

  // 7. Synonym Expansions Match
  if (synonyms.length > 0) {
    for (const syn of synonyms) {
      if (cleanName.includes(syn) || cleanBrand.includes(syn) || cleanCategory.includes(syn)) {
        score += 30;
        matchReasons.push(`synonym_${syn}`);
        break;
      }
    }
  }

  // If score is 0, product is not a match
  if (score <= 0) {
    // Last fallback: check if full blob contains all tokens
    const allTokensInBlob = queryTokens.every((t) => fullBlob.includes(t));
    if (allTokensInBlob) {
      score = 25;
      matchReasons.push("blob_fallback");
    } else {
      return null;
    }
  }

  // 8. Stock Status Boosts / Penalties
  if (product.stock_status === "out_of_stock" || (typeof product.stock_count === "number" && product.stock_count <= 0)) {
    score -= 30;
  } else {
    score += 15; // In-stock boost
  }

  // 9. Featured & Popularity Boosts
  if (product.featured) {
    score += 10;
  }

  // 10. Click Analytics Boost
  const clickBoost = getProductSearchClickBoost(q, product.id || product.slug);
  score += clickBoost;

  return {
    product,
    score: Math.max(score, 1),
    matchReasons,
  };
}

// ─────────────────────────────────────────────────────────────
// 6. MULTI-SECTION INTELLIGENT AUTOCOMPLETE ENGINE
// ─────────────────────────────────────────────────────────────

export interface CategoryMatch {
  category: Category;
  count: number;
  score: number;
}

export interface BrandMatch {
  brand: Brand;
  count: number;
  score: number;
}

export interface SearchEngineResults {
  query: string;
  didYouMean: string | null;
  suggestions: string[];
  categories: CategoryMatch[];
  brands: BrandMatch[];
  products: Product[];
  totalMatches: number;
}

/**
 * Execute full intelligent search across the real catalog
 */
export function executeIntelligentSearch(
  query: string,
  products: Product[],
  categories: Category[],
  brands: Brand[]
): SearchEngineResults {
  const cleanQ = normalizeText(query);
  if (!cleanQ) {
    return {
      query: "",
      didYouMean: null,
      suggestions: [],
      categories: [],
      brands: [],
      products: [],
      totalMatches: 0,
    };
  }

  // 1. Gather Synonyms for Query
  const synonyms: string[] = [];
  const queryTokens = cleanQ.split(" ").filter(Boolean);

  // Direct phrase synonym
  if (SYNONYM_MAP[cleanQ]) {
    synonyms.push(...SYNONYM_MAP[cleanQ]);
  }
  // Word synonyms
  for (const token of queryTokens) {
    if (SYNONYM_MAP[token]) {
      synonyms.push(...SYNONYM_MAP[token]);
    }
  }

  // 2. Build Vocabulary & Check for Typo Correction
  const vocabulary = buildSearchVocabulary(products, categories, brands);
  const didYouMean = detectTypoCorrection(query, vocabulary);

  // If typo was detected, also grab synonyms for the corrected query
  if (didYouMean) {
    const correctedClean = normalizeText(didYouMean);
    if (SYNONYM_MAP[correctedClean]) {
      synonyms.push(...SYNONYM_MAP[correctedClean]);
    }
  }

  // 3. Index & Score All Products
  const indexedProducts = products.map(indexProduct);
  const scoredProducts: ScoredProduct[] = [];

  for (const indexed of indexedProducts) {
    const scored = scoreProductForQuery(indexed, cleanQ, synonyms);
    if (scored) {
      scoredProducts.push(scored);
    } else if (didYouMean) {
      // Try scoring with the corrected query with a small discount
      const typoScored = scoreProductForQuery(indexed, normalizeText(didYouMean), synonyms);
      if (typoScored) {
        scoredProducts.push({
          ...typoScored,
          score: Math.round(typoScored.score * 0.85),
          matchReasons: [...typoScored.matchReasons, "corrected_query_match"],
        });
      }
    }
  }

  // Sort products by score descending
  scoredProducts.sort((a, b) => b.score - a.score);
  const rankedProducts = scoredProducts.map((sp) => sp.product);

  // 4. Match Categories
  const categoryMatches: CategoryMatch[] = [];
  for (const cat of categories) {
    const cName = normalizeText(cat.name || "");
    const cSlug = normalizeText(cat.slug || "");

    let catScore = 0;
    if (cName === cleanQ || cSlug === cleanQ) catScore = 100;
    else if (cName.startsWith(cleanQ) || cSlug.startsWith(cleanQ)) catScore = 80;
    else if (cName.includes(cleanQ) || cSlug.includes(cleanQ)) catScore = 60;
    else if (synonyms.some((syn) => cName.includes(syn))) catScore = 50;
    else if (cleanQ.length >= 3 && isFuzzyMatch(cleanQ, cName)) catScore = 40;

    if (catScore > 0) {
      // Count products in this category
      const count = rankedProducts.filter((p) => {
        const pCat = normalizeText(p.category_name || p.category_id || p.category_slug || "");
        return pCat === cName || pCat === cSlug || pCat.includes(cSlug);
      }).length;

      categoryMatches.push({ category: cat, count, score: catScore });
    }
  }
  categoryMatches.sort((a, b) => b.score - a.score || b.count - a.count);

  // 5. Match Brands
  const brandMatches: BrandMatch[] = [];
  for (const brand of brands) {
    const bName = normalizeText(brand.name || "");
    const bSlug = normalizeText(brand.slug || "");

    let brandScore = 0;
    if (bName === cleanQ || bSlug === cleanQ) brandScore = 100;
    else if (bName.startsWith(cleanQ) || bSlug.startsWith(cleanQ)) brandScore = 80;
    else if (bName.includes(cleanQ) || bSlug.includes(cleanQ)) brandScore = 60;
    else if (cleanQ.length >= 3 && isFuzzyMatch(cleanQ, bName)) brandScore = 40;

    if (brandScore > 0) {
      const count = rankedProducts.filter((p) => {
        const pBrand = normalizeText(p.brand_name || p.brandName || p.brand || "");
        return pBrand === bName || pBrand === bSlug || pBrand.includes(bSlug);
      }).length;

      brandMatches.push({ brand, count, score: brandScore });
    }
  }
  brandMatches.sort((a, b) => b.score - a.score || b.count - a.count);

  // 6. Generate Dynamic Keyword Suggestions (Amazon / Daraz style)
  const suggestionsSet = new Set<string>();

  // Add the cleaned query itself if reasonable
  if (rankedProducts.length > 0) {
    suggestionsSet.add(cleanQ);
  }

  // Suggest popular product name phrases
  for (const p of rankedProducts.slice(0, 8)) {
    const nameWords = normalizeText(p.name || "").split(" ");
    // Generate 2-3 word key phrases
    for (let i = 0; i < nameWords.length; i++) {
      const phrase2 = nameWords.slice(i, i + 2).join(" ");
      const phrase3 = nameWords.slice(i, i + 3).join(" ");
      if (phrase2.includes(cleanQ) && phrase2.length >= cleanQ.length) {
        suggestionsSet.add(phrase2);
      }
      if (phrase3.includes(cleanQ) && phrase3.length >= cleanQ.length) {
        suggestionsSet.add(phrase3);
      }
    }
  }

  // Brand + Category or Brand + Accessories suggestions
  for (const b of brandMatches.slice(0, 2)) {
    suggestionsSet.add(`${b.brand.name.toLowerCase()} phone`);
    suggestionsSet.add(`${b.brand.name.toLowerCase()} accessories`);
  }

  // Synonyms suggestions
  for (const syn of synonyms.slice(0, 2)) {
    if (syn !== cleanQ) suggestionsSet.add(syn);
  }

  const suggestions = Array.from(suggestionsSet)
    .filter((s) => s.length >= 2)
    .slice(0, 5);

  return {
    query: cleanQ,
    didYouMean,
    suggestions,
    categories: categoryMatches.slice(0, 4),
    brands: brandMatches.slice(0, 4),
    products: rankedProducts,
    totalMatches: rankedProducts.length,
  };
}
