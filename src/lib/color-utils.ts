// Color name -> Hex color mapping
export const COLOR_MAP: Record<string, string> = {
  midnight: "#1C1C1E",
  starlight: "#F5F5DC",
  blue: "#6DA9E4",
  pink: "#F7C5D9",
  green: "#A8C686",
  yellow: "#F4D03F",
  purple: "#C8B6E2",
  "product red": "#C8102E",
  "natural titanium": "#D8D2C8",
  "blue titanium": "#5A7890",
  "white titanium": "#F4F4F2",
  "black titanium": "#3A3A3C",
  "phantom black": "#1B1B1B",
  cream: "#F5E9D3",
  lavender: "#C8B6E2",
  graphite: "#525252",
  lime: "#B8D430",
  "sky blue": "#8CC7E8",
  navy: "#243B6B",
  "titanium gray": "#A5A5A5",
  "titanium black": "#2C2C2C",
  black: "#111111",
  white: "#F5F5F5",
  "emerald green": "#0F7B5F",
  "flowy emerald": "#50C878",
  "silky black": "#1F1F1F",
  "arctic sky": "#DCEAF7",
  "eternal green": "#3D8B5A",
  "midnight black": "#1A1A1A",
  "ice blue": "#9FD7F6",
  "mint green": "#8FD6B5",
  "pearl white": "#FAFAFA",
  "sunset orange": "#F28C28",
  "deep orange": "#FF5722",
};

export const PRESET_COLORS = [
  "Midnight", "Starlight", "Blue", "Pink", "Green", "Yellow", "Purple", "Product RED",
  "Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium",
  "Phantom Black", "Cream", "Lavender", "Graphite", "Lime", "Sky Blue", "Navy",
  "Titanium Gray", "Titanium Black", "Black", "White", "Emerald Green", "Flowy Emerald",
  "Silky Black", "Arctic Sky", "Eternal Green", "Midnight Black", "Ice Blue",
  "Mint Green", "Pearl White", "Sunset Orange", "Deep Orange"
];

export function normalizeColor(input: string): string {
  const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanInput) return input;

  // Check matching in presets
  const matched = PRESET_COLORS.find(preset => {
    const cleanPreset = preset.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanPreset === cleanInput;
  });

  if (matched) return matched;

  // Custom mapping rules
  const aliases: Record<string, string> = {
    skyblue: "Sky Blue",
    deeporange: "Deep Orange",
    mintgreen: "Mint Green",
    productred: "Product RED",
    midnightblack: "Midnight Black",
    pearlwhite: "Pearl White",
    sunsetorange: "Sunset Orange",
    emeraldgreen: "Emerald Green",
    flowyemerald: "Flowy Emerald",
    silkyblack: "Silky Black",
    arcticsky: "Arctic Sky",
    eternalgreen: "Eternal Green",
    naturaltitanium: "Natural Titanium",
    bluetitanium: "Blue Titanium",
    whitetitanium: "White Titanium",
    blacktitanium: "Black Titanium",
    phantomblack: "Phantom Black",
    titaniumgray: "Titanium Gray",
    titaniumblack: "Titanium Black",
    iceblue: "Ice Blue"
  };

  if (aliases[cleanInput]) return aliases[cleanInput];
  return input;
}

export function getColorCSS(colorName: string): string {
  const key = colorName.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  return colorName; // Fallback to CSS color name/value if not mapped
}

export function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}
