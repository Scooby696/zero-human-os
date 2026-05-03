export function generateWorkflowMetrics() {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  // Generate execution data
  const executions = Array.from({ length: 150 }, (_, i) => ({
    id: `exec_${i}`,
    timestamp: last24h + Math.random() * (now - last24h),
    success: Math.random() > 0.15,
    latency: Math.floor(Math.random() * 3000) + 100,
    workflowId: `wf_${Math.floor(Math.random() * 5)}`,
  }));

  // Calculate aggregates
  const successCount = executions.filter((e) => e.success).length;
  const failedCount = executions.length - successCount;
  const avgLatency = Math.round(
    executions.reduce((sum, e) => sum + e.latency, 0) / executions.length
  );
  const maxLatency = Math.max(...executions.map((e) => e.latency));
  const minLatency = Math.min(...executions.map((e) => e.latency));

  // Webhook action metrics
  const webhookActions = executions.filter((e) => Math.random() > 0.6).map((e) => ({
    ...e,
    actionType: "webhook_action",
  }));
  const webhookLatencies = webhookActions.map((a) => a.latency);
  const avgWebhookLatency = webhookLatencies.length > 0 
    ? Math.round(webhookLatencies.reduce((a, b) => a + b, 0) / webhookLatencies.length)
    : 0;

  // Hourly breakdown for chart
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourStart = now - (24 - hour) * 60 * 60 * 1000;
    const hourEnd = now - (23 - hour) * 60 * 60 * 1000;
    const hourExecutions = executions.filter((e) => e.timestamp >= hourStart && e.timestamp < hourEnd);
    
    return {
      hour: new Date(hourStart).getHours(),
      successful: hourExecutions.filter((e) => e.success).length,
      failed: hourExecutions.filter((e) => !e.success).length,
      total: hourExecutions.length,
    };
  });

  return {
    totalExecutions: executions.length,
    successCount,
    failedCount,
    successRate: Math.round((successCount / executions.length) * 100),
    failureRate: Math.round((failedCount / executions.length) * 100),
    avgLatency,
    maxLatency,
    minLatency,
    webhookCount: webhookActions.length,
    avgWebhookLatency,
    hourlyData,
    recentExecutions: executions.slice(-10).reverse(),
  };
}

export function getWorkflowStatus(successRate) {
  if (successRate >= 95) return { label: "Healthy", color: "text-green-400" };
  if (successRate >= 85) return { label: "Degraded", color: "text-yellow-400" };
  return { label: "Critical", color: "text-red-400" };
}