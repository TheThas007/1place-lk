// Comprehensive Color name -> Hex color mapping for all smartphone & laptop variant colors
export const COLOR_MAP: Record<string, string> = {
  // Apple Titanium Palette
  "desert titanium": "#C5A582",
  "desert": "#C5A582",
  "natural titanium": "#9F9B93",
  "natural": "#9F9B93",
  "black titanium": "#38373B",
  "white titanium": "#ECEAE4",
  "blue titanium": "#404B5B",
  "titanium gray": "#8C8782",
  "titanium grey": "#8C8782",
  "titanium black": "#2C2C2C",
  "titanium violet": "#5B506D",
  "titanium yellow": "#E3C676",
  "titanium silver": "#C9CBCF",

  // Apple Flagship Colors
  "space black": "#1F2022",
  "space gray": "#535150",
  "space grey": "#535150",
  "silver": "#E3E4E5",
  "gold": "#F4E8CE",
  "rose gold": "#E8B4A2",
  "starlight": "#F0EDE5",
  "midnight": "#1C222E",
  "midnight black": "#1A1A1A",
  "ultramarine": "#40598F",
  "teal": "#729B9B",
  "pink": "#F5C7CD",
  "purple": "#C8B6E2",
  "deep purple": "#4E3D53",
  "sierra blue": "#9BB5CE",
  "alpine green": "#505F4E",
  "pacific blue": "#2D4756",
  "graphite": "#54524F",
  "coral": "#EE675C",
  "yellow": "#F4D03F",
  "green": "#A8C686",
  "blue": "#6DA9E4",
  "red": "#E03A3E",
  "product red": "#C8102E",
  "product(red)": "#C8102E",

  // Samsung Galaxy & Flagship Colors
  "phantom black": "#1B1B1B",
  "cream": "#F5E9D3",
  "lavender": "#C8B6E2",
  "lime": "#B8D430",
  "sky blue": "#8CC7E8",
  "navy": "#243B6B",
  "amber yellow": "#F5DF88",
  "cobalt violet": "#5B4F78",
  "onyx black": "#212121",
  "marble gray": "#DFDFDE",
  "marble grey": "#DFDFDE",
  "jade green": "#789B84",
  "sandstone orange": "#DCA066",
  "sapphire blue": "#48698C",
  "emerald green": "#0F7B5F",
  "flowy emerald": "#50C878",
  "silky black": "#1F1F1F",
  "arctic sky": "#DCEAF7",
  "eternal green": "#3D8B5A",
  "ice blue": "#9FD7F6",
  "mint green": "#8FD6B5",
  "pearl white": "#FAFAFA",
  "sunset orange": "#F28C28",
  "deep orange": "#FF5722",

  // Google Pixel & OnePlus Palette
  "obsidian": "#26282B",
  "porcelain": "#F4F3F0",
  "hazel": "#7C837C",
  "rose": "#E8B7B8",
  "mint": "#BBE3D5",
  "bay": "#749BC2",
  "lemongrass": "#D2E49E",
  "snow": "#F9F9F9",
  "charcoal": "#373737",
  "sage": "#B5C4B1",
  "chalk": "#ECECEC",

  // Standard Neutrals & Accents
  "black": "#111111",
  "white": "#FFFFFF",
  "grey": "#808080",
  "gray": "#808080",
  "dark grey": "#444444",
  "dark gray": "#444444",
  "light grey": "#D3D3D3",
  "light gray": "#D3D3D3",
  "beige": "#F5F5DC",
  "brown": "#8B4513",
  "orange": "#FFA500",
  "cyan": "#00BCD4",
  "magenta": "#E91E63",
  "bronze": "#CD7F32",
  "copper": "#B87333",
  "champagne": "#F7E7CE",
  "midnight blue": "#191970",
  "cosmic black": "#181818",
  "glacier blue": "#99BADD",
  "prism white": "#F2F5F8",
  "prism black": "#1E1E1E",
  "aura glow": "#D4E0EE",
};

export const PRESET_COLORS = Object.keys(COLOR_MAP).map(
  (k) => k.charAt(0).toUpperCase() + k.slice(1)
);

export function normalizeColor(input: string): string {
  if (!input || typeof input !== "string") return "";
  const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanInput) return input;

  for (const key of Object.keys(COLOR_MAP)) {
    if (key.replace(/[^a-z0-9]/g, "") === cleanInput) {
      return key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  }

  return input.trim();
}

/**
 * Resolves any color input (string name, hex code, or variant object) to a valid CSS hex code.
 */
export function resolveColorHex(input: any): string {
  if (!input) return "#2C2C2E";

  // If object with hex/color fields
  if (typeof input === "object") {
    if (input.hex && typeof input.hex === "string" && input.hex.startsWith("#")) return input.hex;
    if (input.colorHex && typeof input.colorHex === "string" && input.colorHex.startsWith("#")) return input.colorHex;
    if (input.color_hex && typeof input.color_hex === "string" && input.color_hex.startsWith("#")) return input.color_hex;
    if (input.value && typeof input.value === "string" && input.value.startsWith("#")) return input.value;
    if (input.name && typeof input.name === "string") return resolveColorHex(input.name);
    if (input.color && typeof input.color === "string") return resolveColorHex(input.color);
    return "#2C2C2E";
  }

  if (typeof input !== "string") return "#2C2C2E";

  const raw = input.trim();
  if (raw.startsWith("#")) {
    if (raw.length === 4 || raw.length === 7 || raw.length === 9) return raw;
    return "#" + raw.replace("#", "").slice(0, 6);
  }

  const key = raw.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];

  // Normalized search (removing spaces/hyphens)
  const normalizedKey = key.replace(/[^a-z0-9]/g, "");
  for (const [mapKey, hexVal] of Object.entries(COLOR_MAP)) {
    if (mapKey.replace(/[^a-z0-9]/g, "") === normalizedKey) {
      return hexVal;
    }
  }

  // Keyword heuristic search
  if (normalizedKey.includes("desert") && normalizedKey.includes("titanium")) return COLOR_MAP["desert titanium"];
  if (normalizedKey.includes("natural") && normalizedKey.includes("titanium")) return COLOR_MAP["natural titanium"];
  if (normalizedKey.includes("black") && normalizedKey.includes("titanium")) return COLOR_MAP["black titanium"];
  if (normalizedKey.includes("white") && normalizedKey.includes("titanium")) return COLOR_MAP["white titanium"];
  if (normalizedKey.includes("blue") && normalizedKey.includes("titanium")) return COLOR_MAP["blue titanium"];
  if (normalizedKey.includes("space") && normalizedKey.includes("black")) return COLOR_MAP["space black"];
  if (normalizedKey.includes("space") && (normalizedKey.includes("gray") || normalizedKey.includes("grey"))) return COLOR_MAP["space gray"];
  if (normalizedKey.includes("rose") && normalizedKey.includes("gold")) return COLOR_MAP["rose gold"];
  if (normalizedKey.includes("starlight")) return COLOR_MAP["starlight"];
  if (normalizedKey.includes("midnight")) return COLOR_MAP["midnight"];
  if (normalizedKey.includes("ultramarine")) return COLOR_MAP["ultramarine"];
  if (normalizedKey.includes("teal")) return COLOR_MAP["teal"];
  if (normalizedKey.includes("pink")) return COLOR_MAP["pink"];
  if (normalizedKey.includes("purple") || normalizedKey.includes("violet")) return COLOR_MAP["purple"];
  if (normalizedKey.includes("gold")) return COLOR_MAP["gold"];
  if (normalizedKey.includes("silver")) return COLOR_MAP["silver"];
  if (normalizedKey.includes("white")) return COLOR_MAP["white"];
  if (normalizedKey.includes("black")) return COLOR_MAP["black"];
  if (normalizedKey.includes("blue")) return COLOR_MAP["blue"];
  if (normalizedKey.includes("green")) return COLOR_MAP["green"];
  if (normalizedKey.includes("yellow")) return COLOR_MAP["yellow"];
  if (normalizedKey.includes("red")) return COLOR_MAP["red"];
  if (normalizedKey.includes("orange")) return COLOR_MAP["orange"];
  if (normalizedKey.includes("grey") || normalizedKey.includes("gray")) return COLOR_MAP["gray"];

  return "#444444";
}

export function getColorCSS(colorName: string): string {
  return resolveColorHex(colorName);
}

/**
 * Extracts and resolves actual color swatches for a product card or details page.
 */
export function resolveProductSwatches(product: any): Array<{ name: string; hex: string }> {
  if (!product) return [];

  const seen = new Set<string>();
  const swatches: Array<{ name: string; hex: string }> = [];

  const addSwatch = (name: string, hexHint?: string) => {
    if (!name || typeof name !== "string") return;
    const cleanName = name.trim();
    if (!cleanName || seen.has(cleanName.toLowerCase())) return;
    seen.add(cleanName.toLowerCase());

    const hex = hexHint && hexHint.startsWith("#") ? hexHint : resolveColorHex(cleanName);
    swatches.push({ name: cleanName, hex });
  };

  // 1. Check color_variants
  if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
    product.color_variants.forEach((cv: any) => {
      if (typeof cv === "string") addSwatch(cv);
      else if (cv && typeof cv === "object") addSwatch(cv.name || cv.color || "", cv.hex || cv.colorHex);
    });
  }

  // 2. Check variant_combos
  if (Array.isArray(product.variant_combos) && product.variant_combos.length > 0) {
    product.variant_combos.forEach((combo: any) => {
      if (combo && combo.color_name) addSwatch(combo.color_name);
    });
  }

  // 3. Check colors array
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    product.colors.forEach((c: any) => {
      if (typeof c === "string") addSwatch(c);
      else if (c && typeof c === "object") addSwatch(c.name || c.color || "", c.hex || c.colorHex);
    });
  }

  // Fallback defaults if no colors defined
  if (swatches.length === 0) {
    return [
      { name: "Space Black", hex: "#1F2022" },
      { name: "Natural Titanium", hex: "#9F9B93" },
      { name: "White Titanium", hex: "#ECEAE4" },
      { name: "Desert Titanium", hex: "#C5A582" },
    ];
  }

  return swatches;
}

export function isLightColor(hex: string): boolean {
  if (!hex || typeof hex !== "string") return true;
  const c = hex.replace("#", "");
  if (c.length !== 6 && c.length !== 3) return true;
  const fullHex = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(fullHex.slice(0, 2), 16) || 0;
  const g = parseInt(fullHex.slice(2, 4), 16) || 0;
  const b = parseInt(fullHex.slice(4, 6), 16) || 0;
  return (r * 0.299 + g * 0.587 + b * 0.114) > 175;
}

