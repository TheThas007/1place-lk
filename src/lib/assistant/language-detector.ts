/**
 * Language & Writing Style Detector for Street Assistant
 * Supports:
 * - "en" (English)
 * - "ta" (Tamil Unicode Script)
 * - "thanglish" (Tamil written in Latin/English alphabet)
 * - "si" (Sinhala Unicode Script)
 * - "singlish" (Sinhala written in Latin/English alphabet)
 */

export type WritingStyle = "en" | "ta" | "thanglish" | "si" | "singlish";

// Common Thanglish vocabulary patterns
const THANGLISH_KEYWORDS = [
  "enakku", "enaku", "nakku", "neenga", "ungalukku", "ungalku", "unga",
  "venum", "venam", "vnum", "venumnga", "thevai", "theva",
  "nalla", "nala", "nallatha", "super", "romba", "konjam", "chinna",
  "enna", "ethu", "edu", "edhu", "epdi", "eppadi", "evlo", "evvalavu", "evalo",
  "sollunga", "solunga", "pannunga", "panunga", "panren", "kudunga", "paathu", "pathu",
  "kulla", "ulla", "irukku", "iruka", "irukkum", "irukanum", "irukanumnga",
  "mattum", "maddum", "than", "mattumthan", "panna", "pannanum",
  "mukkiyam", "mukkiyamana", "romba nalla", "romba nala",
  "paakalam", "pakalam", "vaanga", "vanga", "vaangalaam", "vangalam",
  "edukalaam", "edukalam", "eduthukonga", "theriyuma",
  "parunga", "parungalen", "ithu", "athu", "ithuku", "athuku",
  "kadai", "kadayila", "kadaila", "vilai", "vila",
];

// Common Singlish vocabulary patterns
const SINGLISH_KEYWORDS = [
  "mata", "oyata", "api", "oya", "mage", "oyage",
  "ona", "one", "epa", "hoda", "hodama", "hondama",
  "kiyada", "monawada", "mokakda", "kohomada", "koheda",
  "kiyanna", "balanna", "ganna", "denna", "karanna",
  "thiyenawada", "thiyeda", "thiyenawa", "thiyanawa",
  "meka", "eka", "araka", "ganan", "mila", "labada",
  "kamak", "watinawa", "gannada", "hondada", "hodada",
];

/**
 * Detect language and writing style from input text
 */
export function detectWritingStyle(text: string, userExplicitLanguage?: string): WritingStyle {
  if (!text || typeof text !== "string") return "en";
  const trimmed = text.trim();
  if (!trimmed) return "en";

  // 1. Check for Tamil Unicode characters (\u0B80-\u0BFF)
  const tamilChars = (trimmed.match(/[\u0B80-\u0BFF]/g) || []).length;
  if (tamilChars >= 2 || (tamilChars > 0 && tamilChars / trimmed.length > 0.15)) {
    return "ta";
  }

  // 2. Check for Sinhala Unicode characters (\u0D80-\u0DFF)
  const sinhalaChars = (trimmed.match(/[\u0D80-\u0DFF]/g) || []).length;
  if (sinhalaChars >= 2 || (sinhalaChars > 0 && sinhalaChars / trimmed.length > 0.15)) {
    return "si";
  }

  // 3. Lowercase tokenized text for Latin-based analysis
  const lower = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "en";

  // Count Thanglish keywords
  let thanglishScore = 0;
  for (const w of words) {
    if (THANGLISH_KEYWORDS.includes(w)) {
      thanglishScore += 2;
    } else {
      // Partial prefix/suffix matches for Thanglish verbs
      if (
        w.endsWith("nga") ||
        w.endsWith("laam") ||
        w.endsWith("kulla") ||
        w.endsWith("ku") ||
        w.endsWith("kku") ||
        w.endsWith("um") ||
        w.startsWith("enna") ||
        w.startsWith("epdi")
      ) {
        thanglishScore += 1;
      }
    }
  }

  // Count Singlish keywords
  let singlishScore = 0;
  for (const w of words) {
    if (SINGLISH_KEYWORDS.includes(w)) {
      singlishScore += 2;
    } else if (w.endsWith("da") || w.endsWith("wada") || w.endsWith("la") || w.endsWith("ma")) {
      singlishScore += 0.5;
    }
  }

  // Thresholds
  if (thanglishScore >= 2 || (thanglishScore >= 1 && userExplicitLanguage === "ta")) {
    return "thanglish";
  }

  if (singlishScore >= 2 || (singlishScore >= 1 && userExplicitLanguage === "si")) {
    return "singlish";
  }

  // If user explicitly selected Tamil in UI and there are no strong Sinhala matches
  if (userExplicitLanguage === "ta") {
    // If predominantly English words, check if mixed
    if (thanglishScore > 0) return "thanglish";
  }

  if (userExplicitLanguage === "si") {
    if (singlishScore > 0) return "singlish";
  }

  return "en";
}

/**
 * Get base language code ('en', 'ta', 'si') from writing style
 */
export function getBaseLanguage(style: WritingStyle): "en" | "ta" | "si" {
  if (style === "ta" || style === "thanglish") return "ta";
  if (style === "si" || style === "singlish") return "si";
  return "en";
}
