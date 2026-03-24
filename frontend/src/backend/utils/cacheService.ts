/**
 * Enterprise-grade Caching Utility
 * Design: Tiered caching (Memory L1, Redis L2)
 * Currently implemented: L1 Memory Cache with TTL logic.
 * Ready for L2 (Upstash Redis) connector.
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const L1_CACHE = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 60 * 1000; // 1 minute default

export const cacheService = {
  /**
   * Retrieves data from cache or executes the fetcher function
   */
  async wrap<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
    const now = Date.now();
    const cached = L1_CACHE.get(key);

    if (cached && cached.expiry > now) {
      console.log(`[CACHE HIT]: ${key}`);
      return cached.data;
    }

    console.log(`[CACHE MISS]: ${key}`);
    const data = await fetcher();
    
    L1_CACHE.set(key, {
      data,
      expiry: now + ttl
    });

    return data;
  },

  /**
   * Manual eviction for data mutations
   */
  invalidate(key: string) {
    L1_CACHE.delete(key);
  },

  /**
   * Clear all (use sparingly in production)
   */
  flush() {
    L1_CACHE.clear();
  }
};
