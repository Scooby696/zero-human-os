/**
 * Cost Recommendation Engine - Generates proactive cost optimization suggestions
 * Analyzes patterns and recommends model switches, parallelization, caching
 */

export function createCostRecommendationEngine() {
  const MODEL_VARIANTS = {
    llm: [
      { name: 'gpt-4o-mini', costPer1kTokens: 0.00015, quality: 0.8, speed: 'fast' },
      { name: 'gpt-4o', costPer1kTokens: 0.003, quality: 0.95, speed: 'medium' },
      { name: 'claude-3-5-haiku', costPer1kTokens: 0.00008, quality: 0.75, speed: 'fast' },
      { name: 'claude-3-5-sonnet', costPer1kTokens: 0.003, quality: 0.95, speed: 'medium' },
      { name: 'mistral-small', costPer1kTokens: 0.000035, quality: 0.7, speed: 'fast' },
    ],
    agent: [
      { name: 'x402_data_analyst', costPer1kTokens: 0.005, quality: 0.9, speed: 'medium' },
      { name: 'x402_api_integrator', costPer1kTokens: 0.004, quality: 0.85, speed: 'fast' },
      { name: 'custom_langchain_agent', costPer1kTokens: 0.001, quality: 0.7, speed: 'fast' },
    ],
  };

  const generateModelSwitchRecommendations = (executionPatterns) => {
    const recommendations = [];

    Object.entries(executionPatterns).forEach(([nodeType, pattern]) => {
      if (!MODEL_VARIANTS[nodeType]) return;

      const currentModel = pattern.currentModel || 'unknown';
      const currentVariant = MODEL_VARIANTS[nodeType].find((v) => v.name === currentModel);

      if (!currentVariant) return;

      // Find cheaper variants with acceptable quality
      const alternatives = MODEL_VARIANTS[nodeType]
        .filter(
          (v) =>
            v.costPer1kTokens < currentVariant.costPer1kTokens &&
            v.quality >= currentVariant.quality * 0.85 // Accept 15% quality drop for cost savings
        )
        .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);

      alternatives.forEach((alt) => {
        const costSavingsPerExecution = (
          (currentVariant.costPer1kTokens - alt.costPer1kTokens) *
          (pattern.avgTokensPerExecution || 100)
        ).toFixed(6);

        const monthlySavings = (costSavingsPerExecution * pattern.count).toFixed(2);

        if (parseFloat(monthlySavings) > 0.01) {
          recommendations.push({
            nodeType,
            priority: parseFloat(monthlySavings) > 10 ? 'high' : 'medium',
            currentModel,
            recommendedModel: alt.name,
            currentCostPerExecution: (
              currentVariant.costPer1kTokens * (pattern.avgTokensPerExecution || 100)
            ).toFixed(6),
            recommendedCostPerExecution: (alt.costPer1kTokens * (pattern.avgTokensPerExecution || 100)).toFixed(6),
            monthlySavings,
            qualityImpact: ((1 - alt.quality / currentVariant.quality) * 100).toFixed(1),
            speedImpact: alt.speed,
          });
        }
      });
    });

    return recommendations.sort((a, b) => parseFloat(b.monthlySavings) - parseFloat(a.monthlySavings));
  };

  const generateParallelizationRecommendations = (executionHistory) => {
    const recommendations = [];
    const workflows = {};

    executionHistory.forEach((exec) => {
      if (exec.sequentialNodeCount && exec.sequentialNodeCount > 1) {
        const workflowId = exec.workflowId || 'unknown';
        if (!workflows[workflowId]) {
          workflows[workflowId] = {
            workflowId,
            totalExecutions: 0,
            totalSequentialTime: 0,
            totalCost: 0,
            nodeCount: 0,
          };
        }
        workflows[workflowId].totalExecutions++;
        workflows[workflowId].totalSequentialTime += exec.duration || 0;
        workflows[workflowId].totalCost += exec.cost || 0;
        workflows[workflowId].nodeCount = Math.max(workflows[workflowId].nodeCount, exec.sequentialNodeCount);
      }
    });

    Object.values(workflows).forEach((wf) => {
      const avgSequentialTime = wf.totalSequentialTime / wf.totalExecutions;
      const estimatedParallelTime = avgSequentialTime * 0.6; // Assume 40% time reduction
      const timeSavingsPerExecution = avgSequentialTime - estimatedParallelTime;
      const costSavingsPerExecution = (timeSavingsPerExecution / avgSequentialTime) * (wf.totalCost / wf.totalExecutions);
      const monthlySavings = (costSavingsPerExecution * wf.totalExecutions * 30).toFixed(2);

      if (parseFloat(monthlySavings) > 0.1) {
        recommendations.push({
          workflowId: wf.workflowId,
          priority: parseFloat(monthlySavings) > 5 ? 'high' : 'medium',
          currentNodeCount: wf.nodeCount,
          parallelizableNodes: Math.ceil(wf.nodeCount * 0.6), // Estimate 60% can be parallelized
          estimatedTimeReduction: `${(40).toFixed(0)}%`,
          estimatedCostReduction: `${((costSavingsPerExecution / (wf.totalCost / wf.totalExecutions)) * 100).toFixed(1)}%`,
          monthlySavings,
          implementationEffort: 'low',
        });
      }
    });

    return recommendations.sort((a, b) => parseFloat(b.monthlySavings) - parseFloat(a.monthlySavings));
  };

  const generateCachingRecommendations = (executionHistory) => {
    const nodeOutputFrequency = {};

    executionHistory.forEach((exec) => {
      const outputHash = JSON.stringify(exec.output || {});
      const key = `${exec.nodeType}_${outputHash}`;

      if (!nodeOutputFrequency[key]) {
        nodeOutputFrequency[key] = {
          nodeType: exec.nodeType,
          frequency: 0,
          cost: 0,
        };
      }
      nodeOutputFrequency[key].frequency++;
      nodeOutputFrequency[key].cost += exec.cost || 0;
    });

    const recommendations = Object.values(nodeOutputFrequency)
      .filter((item) => item.frequency >= 5) // Cache only if repeated 5+ times
      .map((item) => ({
        nodeType: item.nodeType,
        frequency: item.frequency,
        totalCost: item.cost.toFixed(4),
        estimatedCacheHitRate: Math.min(item.frequency * 0.7, 0.9), // Estimate hit rate
        monthlySavings: (item.cost * 0.5 * 30).toFixed(2), // Assume 50% cost reduction with caching
        ttl: 300, // Default 5-minute TTL
      }))
      .sort((a, b) => parseFloat(b.monthlySavings) - parseFloat(a.monthlySavings));

    return recommendations;
  };

  const generateBatchProcessingRecommendations = (executionHistory) => {
    const recommendations = [];
    const sequentialExecutions = executionHistory.filter((e) => e.batchable);

    if (sequentialExecutions.length >= 10) {
      const avgCostPerExecution = sequentialExecutions.reduce((sum, e) => sum + (e.cost || 0), 0) / sequentialExecutions.length;
      const monthlySavings = (avgCostPerExecution * sequentialExecutions.length * 0.3 * 30).toFixed(2); // 30% cost savings

      recommendations.push({
        name: 'Batch Processing',
        applicableToNodes: sequentialExecutions.length,
        frequency: 'daily',
        estimatedCostReduction: '30%',
        monthlySavings,
        implementationEffort: 'medium',
      });
    }

    return recommendations;
  };

  const prioritizeRecommendations = (allRecommendations) => {
    const sorted = allRecommendations.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityMap[a.priority] || 0;
      const bPriority = priorityMap[b.priority] || 0;

      if (aPriority !== bPriority) return bPriority - aPriority;
      return parseFloat(b.monthlySavings || b.estimatedCostReduction || 0) - parseFloat(a.monthlySavings || a.estimatedCostReduction || 0);
    });

    return sorted.slice(0, 10); // Top 10 recommendations
  };

  return {
    generateModelSwitchRecommendations,
    generateParallelizationRecommendations,
    generateCachingRecommendations,
    generateBatchProcessingRecommendations,
    prioritizeRecommendations,
    MODEL_VARIANTS,
  };
}

export const costRecommendationEngine = createCostRecommendationEngine();