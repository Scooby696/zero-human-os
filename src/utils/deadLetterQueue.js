/**
 * Dead Letter Queue - Manages failed events for retry
 */

export function createDeadLetterQueue() {
  const queue = [];
  let dlqId = 0;

  const addFailedEvent = (workflowId, payload, error, retryCount = 0) => {
    const dlqEntry = {
      id: `dlq_${dlqId++}`,
      workflowId,
      payload,
      error: error.message,
      errorStack: error.stack,
      retryCount,
      maxRetries: 5,
      createdAt: Date.now(),
      nextRetryAt: calculateNextRetry(retryCount),
      status: 'pending',
    };

    queue.push(dlqEntry);
    return dlqEntry;
  };

  const calculateNextRetry = (retryCount) => {
    const baseDelay = 1000; // 1 second
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    return Date.now() + exponentialDelay;
  };

  const getReadyForRetry = () => {
    return queue.filter((entry) => {
      return entry.status === 'pending' && entry.retryCount < entry.maxRetries && Date.now() >= entry.nextRetryAt;
    });
  };

  const markRetrying = (dlqId) => {
    const entry = queue.find((e) => e.id === dlqId);
    if (entry) entry.status = 'retrying';
  };

  const markSuccess = (dlqId) => {
    const idx = queue.findIndex((e) => e.id === dlqId);
    if (idx !== -1) {
      queue[idx].status = 'resolved';
      queue[idx].resolvedAt = Date.now();
    }
  };

  const markFailed = (dlqId) => {
    const entry = queue.find((e) => e.id === dlqId);
    if (entry) {
      entry.retryCount += 1;
      if (entry.retryCount >= entry.maxRetries) {
        entry.status = 'dead';
        entry.deadAt = Date.now();
      } else {
        entry.status = 'pending';
        entry.nextRetryAt = calculateNextRetry(entry.retryCount);
      }
    }
  };

  const getQueue = () => queue;
  const getDeadLetters = () => queue.filter((e) => e.status === 'dead');
  const getPending = () => queue.filter((e) => e.status === 'pending' || e.status === 'retrying');

  return {
    addFailedEvent,
    getReadyForRetry,
    markRetrying,
    markSuccess,
    markFailed,
    getQueue,
    getDeadLetters,
    getPending,
  };
}

export const dlq = createDeadLetterQueue();