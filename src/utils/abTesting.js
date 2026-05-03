/**
 * A/B Testing - Compare workflow versions with real traffic
 */

export function createABTesting() {
  const tests = new Map();
  let testId = 0;

  const startTest = (workflowId, versionA, versionB, sampleRate = 0.1) => {
    const id = `test_${testId++}`;
    const test = {
      id,
      workflowId,
      versionA,
      versionB,
      sampleRate,
      startedAt: Date.now(),
      results: {
        A: { count: 0, totalCost: 0, totalDuration: 0, errors: 0 },
        B: { count: 0, totalCost: 0, totalDuration: 0, errors: 0 },
      },
    };

    tests.set(id, test);
    return id;
  };

  const recordExecution = (testId, version, cost, duration, error = null) => {
    const test = tests.get(testId);
    if (!test) return;

    const result = test.results[version];
    result.count += 1;
    result.totalCost += cost;
    result.totalDuration += duration;
    if (error) result.errors += 1;
  };

  const getResults = (testId) => {
    const test = tests.get(testId);
    if (!test) return null;

    const resultA = test.results.A;
    const resultB = test.results.B;

    const avgCostA = resultA.count > 0 ? resultA.totalCost / resultA.count : 0;
    const avgCostB = resultB.count > 0 ? resultB.totalCost / resultB.count : 0;

    const avgDurationA = resultA.count > 0 ? resultA.totalDuration / resultA.count : 0;
    const avgDurationB = resultB.count > 0 ? resultB.totalDuration / resultB.count : 0;

    return {
      versionA: {
        executions: resultA.count,
        avgCost: parseFloat(avgCostA.toFixed(6)),
        avgDuration: Math.round(avgDurationA),
        errorRate: resultA.count > 0 ? (resultA.errors / resultA.count * 100).toFixed(2) : 0,
      },
      versionB: {
        executions: resultB.count,
        avgCost: parseFloat(avgCostB.toFixed(6)),
        avgDuration: Math.round(avgDurationB),
        errorRate: resultB.count > 0 ? (resultB.errors / resultB.count * 100).toFixed(2) : 0,
      },
      recommendation: avgCostB < avgCostA ? 'Use Version B (Cheaper)' : 'Use Version A (Cheaper)',
      costSavings: parseFloat(Math.abs(avgCostA - avgCostB).toFixed(6)),
    };
  };

  const selectVersion = (shouldUseA) => (Math.random() < 0.5 ? 'A' : 'B');

  return { startTest, recordExecution, getResults, selectVersion, tests };
}

export const abTesting = createABTesting();