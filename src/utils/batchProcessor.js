/**
 * Batch Processor - Groups events for efficient batch processing
 */

export function createBatchProcessor(batchSize = 100, flushIntervalMs = 30000) {
  let queue = [];
  let flushTimer = null;
  const callbacks = [];

  const onBatchReady = (callback) => {
    callbacks.push(callback);
  };

  const addEvent = (event) => {
    queue.push(event);

    if (queue.length >= batchSize) {
      flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => flush(), flushIntervalMs);
    }
  };

  const flush = async () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    if (queue.length === 0) return;

    const batch = queue.splice(0, queue.length);

    for (const callback of callbacks) {
      try {
        await callback(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }
  };

  const getQueueSize = () => queue.length;
  const getFlushStatus = () => ({ queueSize: queue.length, batchSize, flushIntervalMs });

  return { addEvent, onBatchReady, flush, getQueueSize, getFlushStatus };
}

export const batchProcessor = createBatchProcessor();