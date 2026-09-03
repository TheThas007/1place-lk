/**
 * Global In-Memory and In-Flight Request Cache Layer
 * 
 * Provides:
 * 1. Time-to-Live (TTL) caching in both Server (Node.js) and Client (Browser) runtimes.
 * 2. In-flight request deduplication: if multiple components trigger the same query concurrently,
 *    only a single Firestore network read is performed.
 * 3. Stale-while-revalidate / Instant cache hits: subsequent page navigations return instantly
 *    with 0 Firestore reads.
 * 4. Cache invalidation on administrative updates.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache map
const memoryCache = new Map<string, CacheEntry<any>>();

// In-flight pending promises map to deduplicate concurrent requests
const inFlightRequests = new Map<string, Promise<any>>();

// Default TTL configurations (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000,      // 5 minutes
  CATEGORIES: 10 * 60 * 1000,   // 10 minutes
  BRANDS: 10 * 60 * 1000,       // 10 minutes
  BANNERS: 5 * 60 * 1000,       // 5 minutes
  SETTINGS: 10 * 60 * 1000,     // 10 minutes
  REVIEWS: 10 * 60 * 1000,      // 10 minutes
  GALLERY: 15 * 60 * 1000,      // 15 minutes
  COUPONS: 5 * 60 * 1000,       // 5 minutes
};

/**
 * Fetch data with in-memory TTL caching and concurrent in-flight deduplication.
 * 
 * @param key Unique cache key (e.g. 'products:all', 'settings:mega_menu')
 * @param fetcher Async function to retrieve data from Firestore if cache is stale or missing
 * @param ttlMs Time-to-live in milliseconds (defaults to 5 minutes)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = CACHE_TTL.PRODUCTS
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // 1. Return fresh cached data if within TTL
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data as T;
  }

  // 2. Return in-flight request if already pending (deduplication)
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  // 3. Initiate new fetch and track in-flight promise
  const promise = (async () => {
    try {
      const data = await fetcher();
      
      // Store in memory cache
      if (data !== undefined && data !== null) {
        memoryCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: ttlMs,
        });
      }
      return data;
    } catch (err) {
      // If fetch fails but we have stale cache, return stale data instead of breaking UI
      if (cached) {
        console.warn(`[data-cache] Fetch failed for '${key}', serving stale cache:`, err);
        return cached.data as T;
      }
      throw err;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Manually set or prime cache data (e.g. after server rendering or initial seed).
 */
export function setCachedData<T>(key: string, data: T, ttlMs: number = CACHE_TTL.PRODUCTS): void {
  if (data !== undefined && data !== null) {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
}

/**
 * Get synchronously cached data if exists and fresh.
 */
export function getCachedData<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    return cached.data as T;
  }
  return null;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 * 
 * Examples:
 * - clearDataCache('products') invalidates 'products:all', 'products:featured', etc.
 * - clearDataCache() clears the entire cache.
 */
export function clearDataCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}
