/**
 * Execution Profiler - Tracks execution time and cost per node
 */

export function createExecutionProfiler() {
  const executions = [];
  const nodeStats = new Map();

  const startExecution = (workflowId) => {
    return {
      workflowId,
      startTime: Date.now(),
      nodes: [],
    };
  };

  const recordNodeExecution = (execution, nodeId, nodeType, cost, duration) => {
    execution.nodes.push({
      id: nodeId,
      type: nodeType,
      cost,
      duration,
      timestamp: Date.now(),
    });

    // Update global stats
    if (!nodeStats.has(nodeId)) {
      nodeStats.set(nodeId, { executions: 0, totalCost: 0, totalDuration: 0, avgCost: 0, avgDuration: 0 });
    }

    const stats = nodeStats.get(nodeId);
    stats.executions += 1;
    stats.totalCost += cost;
    stats.totalDuration += duration;
    stats.avgCost = stats.totalCost / stats.executions;
    stats.avgDuration = stats.totalDuration / stats.executions;
  };

  const endExecution = (execution) => {
    execution.endTime = Date.now();
    execution.totalDuration = execution.endTime - execution.startTime;
    execution.totalCost = execution.nodes.reduce((sum, n) => sum + n.cost, 0);
    executions.push(execution);
    return execution;
  };

  const getMostExpensive = (limit = 10) => {
    return Array.from(nodeStats.entries())
      .map(([nodeId, stats]) => ({ nodeId, ...stats }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  };

  const getSlowest = (limit = 10) => {
    return Array.from(nodeStats.entries())
      .map(([nodeId, stats]) => ({ nodeId, ...stats }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  };

  const getOptimizationTips = () => {
    const tips = [];
    const expensive = getMostExpensive(5);

    for (const node of expensive) {
      if (node.avgCost > 0.05) {
        tips.push({
          nodeId: node.nodeId,
          type: 'cost',
          message: 'This node is expensive. Consider using a cheaper LLM model or simplifying logic.',
          savings: node.avgCost * 0.3,
        });
      }
    }

    return tips;
  };

  return {
    startExecution,
    recordNodeExecution,
    endExecution,
    getMostExpensive,
    getSlowest,
    getOptimizationTips,
    executions,
  };
}

export const profiler = createExecutionProfiler();