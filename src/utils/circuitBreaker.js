/**
 * Circuit Breaker - Auto-pauses failing nodes to prevent cascading waste
 */

export function createCircuitBreaker(failureThreshold = 5, resetTimeMs = 60000) {
  const breakers = new Map();

  const getBreaker = (nodeId) => {
    if (!breakers.has(nodeId)) {
      breakers.set(nodeId, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        openedAt: null,
      });
    }
    return breakers.get(nodeId);
  };

  const recordSuccess = (nodeId) => {
    const breaker = getBreaker(nodeId);
    breaker.failureCount = 0;
    breaker.state = 'closed';
  };

  const recordFailure = (nodeId) => {
    const breaker = getBreaker(nodeId);
    breaker.failureCount += 1;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= failureThreshold) {
      breaker.state = 'open';
      breaker.openedAt = Date.now();
    }
  };

  const canExecute = (nodeId) => {
    const breaker = getBreaker(nodeId);

    if (breaker.state === 'closed') return true;

    if (breaker.state === 'open') {
      if (Date.now() - breaker.openedAt > resetTimeMs) {
        breaker.state = 'half-open';
        return true; // Allow one test execution
      }
      return false;
    }

    if (breaker.state === 'half-open') {
      return true; // Test execution
    }

    return false;
  };

  const getStatus = (nodeId) => {
    const breaker = getBreaker(nodeId);
    return {
      state: breaker.state,
      failureCount: breaker.failureCount,
      lastFailure: breaker.lastFailureTime,
    };
  };

  const reset = (nodeId) => {
    const breaker = getBreaker(nodeId);
    breaker.state = 'closed';
    breaker.failureCount = 0;
  };

  return { canExecute, recordSuccess, recordFailure, getStatus, reset, getBreaker };
}

export const circuitBreaker = createCircuitBreaker();