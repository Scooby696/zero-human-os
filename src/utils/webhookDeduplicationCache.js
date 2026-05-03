/**
 * Webhook Deduplication Cache - In-memory cache for webhook tracking
 * Tracks webhook events and prevents duplicates within time window
 */

export function createWebhookDeduplicationCache(windowMs = 5000) {
  const cache = new Map();
  let requestId = 0;

  const generateRequestHash = (webhookId, payload) => {
    const content = JSON.stringify({ webhookId, payload });
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const track = (webhookId, payload) => {
    const hash = generateRequestHash(webhookId, payload);
    const now = Date.now();
    const id = `req_${requestId++}`;

    // Check if duplicate
    if (cache.has(hash)) {
      const existing = cache.get(hash);
      if (now - existing.timestamp < windowMs) {
        return {
          id,
          isDuplicate: true,
          originalId: existing.id,
          timeSinceLast: now - existing.timestamp,
        };
      }
    }

    // Store new request
    cache.set(hash, {
      id,
      timestamp: now,
      webhookId,
      payloadHash: hash,
    });

    // Cleanup old entries
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > windowMs) {
        cache.delete(key);
      }
    }

    return {
      id,
      isDuplicate: false,
      timestamp: now,
    };
  };

  const getCacheStats = () => ({
    size: cache.size,
    entries: Array.from(cache.values()).map((entry) => ({
      id: entry.id,
      webhookId: entry.webhookId,
      age: Date.now() - entry.timestamp,
    })),
  });

  const clear = () => cache.clear();

  return { track, getCacheStats, clear };
}

export const deduplicationCache = createWebhookDeduplicationCache();