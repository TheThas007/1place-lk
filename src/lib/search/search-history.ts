"use client";

const RECENT_SEARCHES_KEY = "sm_recent_searches";
const SEARCH_CLICKS_KEY = "sm_search_clicks";
const MAX_RECENT_SEARCHES = 10;

/** Default trending / popular search phrases */
export const TRENDING_SEARCHES = [
  "iPhone 16 Pro Max",
  "Samsung Galaxy S25",
  "Apple Watch",
  "AirPods Pro",
  "Fast Charger 20W",
  "JBL Bluetooth Speaker",
  "Anker Power Bank",
  "Tempered Glass",
];

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch (e) {
    console.warn("Failed to read recent searches:", e);
    return [];
  }
}

/**
 * Add a query to recent searches
 */
export function addRecentSearch(query: string): string[] {
  if (typeof window === "undefined") return [];
  const clean = query.trim();
  if (!clean || clean.length < 2) return getRecentSearches();

  try {
    const current = getRecentSearches();
    // Remove if already present (so it moves to top)
    const filtered = current.filter((q) => q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to save recent search:", e);
    return [];
  }
}

/**
 * Remove a specific search term from recent searches
 */
export function removeRecentSearch(query: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter((q) => q.toLowerCase() !== query.toLowerCase().trim());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to remove recent search:", e);
    return [];
  }
}

/**
 * Clear all recent searches
 */
export function clearAllRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.warn("Failed to clear recent searches:", e);
  }
}

/**
 * Track when a user clicks a product after searching a query.
 * Boosts that product's relevance score for similar future searches.
 */
export function recordProductSearchClick(query: string, productId: string): void {
  if (typeof window === "undefined") return;
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery || !productId) return;

  try {
    const raw = localStorage.getItem(SEARCH_CLICKS_KEY);
    const data: Record<string, Record<string, number>> = raw ? JSON.parse(raw) : {};

    if (!data[cleanQuery]) {
      data[cleanQuery] = {};
    }

    data[cleanQuery][productId] = (data[cleanQuery][productId] || 0) + 1;

    // Prune data to keep only last 50 queries
    const keys = Object.keys(data);
    if (keys.length > 50) {
      delete data[keys[0]];
    }

    localStorage.setItem(SEARCH_CLICKS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to record product search click:", e);
  }
}

/**
 * Get click count boost for a given query and product ID
 */
export function getProductSearchClickBoost(query: string, productId: string): number {
  if (typeof window === "undefined") return 0;
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery || !productId) return 0;

  try {
    const raw = localStorage.getItem(SEARCH_CLICKS_KEY);
    if (!raw) return 0;
    const data: Record<string, Record<string, number>> = JSON.parse(raw);

    // Exact query click count
    const directClicks = data[cleanQuery]?.[productId] || 0;
    if (directClicks > 0) return Math.min(directClicks * 5, 25);

    // Substring / partial query click count
    let partialClicks = 0;
    for (const [qKey, clicksMap] of Object.entries(data)) {
      if (cleanQuery.includes(qKey) || qKey.includes(cleanQuery)) {
        partialClicks += clicksMap[productId] || 0;
      }
    }

    return Math.min(partialClicks * 3, 20);
  } catch {
    return 0;
  }
}
