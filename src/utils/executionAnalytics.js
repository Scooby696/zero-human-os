export function createExecutionMetrics() {
  let executions = [];

  const recordExecution = (execution) => {
    const record = {
      id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      workflowId: execution.workflowId,
      status: execution.status, // success, failed, timeout
      duration: execution.duration, // ms
      cost: execution.cost, // cost units
      nodeCount: execution.nodeCount,
      errorMessage: execution.errorMessage || null,
      ...execution,
    };
    executions.push(record);
    return record;
  };

  const getMetrics = () => {
    const total = executions.length;
    const successful = executions.filter((e) => e.status === "success").length;
    const failed = executions.filter((e) => e.status === "failed").length;
    const avgDuration = total > 0 ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / total : 0;
    const totalCost = executions.reduce((sum, e) => sum + (e.cost || 0), 0);
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      failed,
      successRate: successRate.toFixed(2),
      avgDuration: Math.round(avgDuration),
      totalCost: totalCost.toFixed(2),
      costPerExecution: total > 0 ? (totalCost / total).toFixed(4) : 0,
    };
  };

  const getOptimizations = () => {
    const metrics = getMetrics();
    const recommendations = [];

    if (metrics.successRate < 95) {
      recommendations.push({
        type: "reliability",
        severity: "high",
        message: `Success rate ${metrics.successRate}% - Consider adding retry logic or error handling`,
      });
    }

    if (metrics.avgDuration > 10000) {
      recommendations.push({
        type: "performance",
        severity: "medium",
        message: `Average execution takes ${(metrics.avgDuration / 1000).toFixed(1)}s - Consider parallel execution or batching`,
      });
    }

    if (parseFloat(metrics.costPerExecution) > 1) {
      recommendations.push({
        type: "cost",
        severity: "medium",
        message: `High cost per execution (${metrics.costPerExecution} units) - Use batch processing or rate limiting`,
      });
    }

    if (executions.length > 100) {
      const recentAvg = executions.slice(0, 10).reduce((sum, e) => sum + (e.duration || 0), 0) / 10;
      const earlierAvg = executions.slice(-10).reduce((sum, e) => sum + (e.duration || 0), 0) / 10;
      if (recentAvg > earlierAvg * 1.5) {
        recommendations.push({
          type: "trend",
          severity: "warning",
          message: "Performance degrading - Recent executions 50% slower than earlier runs",
        });
      }
    }

    return recommendations;
  };

  const getExecutionHistory = (limit = 50) => executions.slice(0, limit);

  const clearOldExecutions = (daysOld = 30) => {
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    executions = executions.filter((e) => new Date(e.timestamp).getTime() > cutoff);
  };

  return {
    recordExecution,
    getMetrics,
    getOptimizations,
    getExecutionHistory,
    clearOldExecutions,
  };
}

export const executionMetrics = createExecutionMetrics();