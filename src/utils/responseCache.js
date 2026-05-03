/**
 * Response Cache - Caches API responses by URL+params with configurable TTL
 * Prevents expensive redundant API calls
 */

export function createResponseCache(defaultTtlMs = 300000) {
  const cache = new Map();

  const getCacheKey = (url, params = {}) => {
    return `${url}::${JSON.stringify(params)}`;
  };

  const get = (url, params) => {
    const key = getCacheKey(url, params);
    const entry = cache.get(key);

    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  };

  const set = (url, params, data, ttl = defaultTtlMs) => {
    const key = getCacheKey(url, params);
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  };

  const clear = (url) => {
    if (!url) {
      cache.clear();
      return;
    }
    for (const [key] of cache.entries()) {
      if (key.startsWith(url)) {
        cache.delete(key);
      }
    }
  };

  const getStats = () => ({
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      ttl: value.ttl,
    })),
  });

  return { get, set, clear, getStats };
}

export const responseCache = createResponseCache();