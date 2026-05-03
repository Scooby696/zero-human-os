/**
 * Request Deduplicator - Detects and prevents duplicate webhook events
 * within a configurable time window (default 5 seconds)
 */

export function createRequestDeduplicator(windowMs = 5000) {
  const recentRequests = new Map();

  const generateHash = (payload) => {
    const str = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const isDuplicate = (payload) => {
    const hash = generateHash(payload);
    const now = Date.now();

    if (recentRequests.has(hash)) {
      const lastSeen = recentRequests.get(hash);
      if (now - lastSeen < windowMs) {
        return true; // Duplicate detected
      }
    }

    recentRequests.set(hash, now);

    // Cleanup old entries
    for (const [key, timestamp] of recentRequests.entries()) {
      if (now - timestamp > windowMs) {
        recentRequests.delete(key);
      }
    }

    return false;
  };

  return { isDuplicate };
}

export const deduplicator = createRequestDeduplicator();