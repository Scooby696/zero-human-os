/**
 * Execution Pattern Analyzer - Identifies patterns in workflow execution
 * Tracks metrics by node type, time of day, and workflow characteristics
 */

export function createExecutionPatternAnalyzer() {
  let executionHistory = [];
  const MAX_HISTORY = 1000;

  const recordExecution = (execution) => {
    executionHistory.push({
      ...execution,
      timestamp: Date.now(),
      date: new Date(),
    });

    // Maintain size limit
    if (executionHistory.length > MAX_HISTORY) {
      executionHistory = executionHistory.slice(-MAX_HISTORY);
    }
  };

  const getExecutionsByTimeWindow = (windowHours = 24) => {
    const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
    return executionHistory.filter((e) => e.timestamp > cutoff);
  };

  const analyzeNodeTypePatterns = () => {
    const patterns = {};

    executionHistory.forEach((exec) => {
      const nodeType = exec.nodeType || 'unknown';
      if (!patterns[nodeType]) {
        patterns[nodeType] = {
          nodeType,
          count: 0,
          totalCost: 0,
          totalDuration: 0,
          failures: 0,
          modelVariants: {},
        };
      }

      patterns[nodeType].count++;
      patterns[nodeType].totalCost += exec.cost || 0;
      patterns[nodeType].totalDuration += exec.duration || 0;
      if (exec.status === 'failed') patterns[nodeType].failures++;

      if (exec.modelVariant) {
        const variant = exec.modelVariant;
        if (!patterns[nodeType].modelVariants[variant]) {
          patterns[nodeType].modelVariants[variant] = {
            variant,
            count: 0,
            avgCost: 0,
            avgDuration: 0,
          };
        }
        patterns[nodeType].modelVariants[variant].count++;
        patterns[nodeType].modelVariants[variant].avgCost = exec.cost || 0;
        patterns[nodeType].modelVariants[variant].avgDuration = exec.duration || 0;
      }
    });

    // Calculate averages
    Object.values(patterns).forEach((p) => {
      p.avgCost = p.count > 0 ? p.totalCost / p.count : 0;
      p.avgDuration = p.count > 0 ? p.totalDuration / p.count : 0;
      p.failureRate = p.count > 0 ? (p.failures / p.count) * 100 : 0;
    });

    return patterns;
  };

  const analyzeTimePatterns = () => {
    const byHour = {};
    const byDayOfWeek = {};

    executionHistory.forEach((exec) => {
      const date = new Date(exec.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Hour patterns
      if (!byHour[hour]) {
        byHour[hour] = {
          hour,
          executions: 0,
          avgCost: 0,
          avgDuration: 0,
          totalCost: 0,
        };
      }
      byHour[hour].executions++;
      byHour[hour].totalCost += exec.cost || 0;

      // Day of week patterns
      if (!byDayOfWeek[dayOfWeek]) {
        byDayOfWeek[dayOfWeek] = {
          day: dayOfWeek,
          executions: 0,
          totalCost: 0,
        };
      }
      byDayOfWeek[dayOfWeek].executions++;
      byDayOfWeek[dayOfWeek].totalCost += exec.cost || 0;
    });

    // Calculate averages
    Object.values(byHour).forEach((h) => {
      h.avgCost = h.executions > 0 ? h.totalCost / h.executions : 0;
    });

    return { byHour, byDayOfWeek };
  };

  const getParallelizationOpportunities = () => {
    const opportunities = [];

    executionHistory.forEach((exec) => {
      if (exec.nodeCount && exec.nodeCount > 1 && !exec.parallelized) {
        opportunities.push({
          workflowId: exec.workflowId,
          nodeCount: exec.nodeCount,
          sequentialTime: exec.duration,
          estimatedParallelTime: exec.duration * 0.6, // Estimate 40% time savings
          potentialSavings: (exec.cost * 0.4).toFixed(4),
        });
      }
    });

    return opportunities;
  };

  const getPeakUsageHours = () => {
    const timePatterns = analyzeTimePatterns();
    return Object.values(timePatterns.byHour)
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);
  };

  const getModelVariantRecommendations = () => {
    const patterns = analyzeNodeTypePatterns();
    const recommendations = [];

    Object.entries(patterns).forEach(([nodeType, data]) => {
      if (nodeType === 'llm' || nodeType === 'agent') {
        const variants = Object.entries(data.modelVariants || {});

        if (variants.length > 1) {
          const sorted = variants.sort((a, b) => b[1].avgCost - a[1].avgCost);
          const cheapest = sorted[sorted.length - 1];
          const mostExpensive = sorted[0];

          const costDiff = mostExpensive[1].avgCost - cheapest[1].avgCost;
          const monthlySavings = costDiff * 30 * data.count;

          if (costDiff > 0.001) {
            recommendations.push({
              nodeType,
              currentVariant: mostExpensive[0],
              recommendedVariant: cheapest[0],
              currentCost: mostExpensive[1].avgCost,
              recommendedCost: cheapest[1].avgCost,
              costDifference: costDiff,
              monthlySavings: monthlySavings.toFixed(4),
              accuracy: 0.95, // Assume high accuracy with cheaper variants
            });
          }
        }
      }
    });

    return recommendations;
  };

  return {
    recordExecution,
    getExecutionsByTimeWindow,
    analyzeNodeTypePatterns,
    analyzeTimePatterns,
    getParallelizationOpportunities,
    getPeakUsageHours,
    getModelVariantRecommendations,
    getExecutionHistory: () => [...executionHistory],
  };
}

export const executionPatternAnalyzer = createExecutionPatternAnalyzer();