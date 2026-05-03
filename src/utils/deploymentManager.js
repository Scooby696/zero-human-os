export function createDeploymentConfig() {
  let deployments = [];

  const createDeployment = (config) => {
    const deployment = {
      id: `deploy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      workflowId: config.workflowId,
      workflowName: config.workflowName,
      environment: config.environment, // staging, production
      cloudProvider: config.cloudProvider, // aws, gcp, azure
      region: config.region,
      status: "pending", // pending, deploying, active, failed, paused
      createdAt: new Date().toISOString(),
      version: config.version || "1.0.0",
      instanceCount: config.instanceCount || 1,
      healthStatus: "unknown",
      lastDeployedAt: null,
      lastHealthCheck: null,
      config: {
        autoScaling: config.autoScaling || {
          enabled: true,
          minInstances: 1,
          maxInstances: 10,
          targetCPU: 70,
          targetMemory: 80,
        },
        healthCheck: config.healthCheck || {
          enabled: true,
          interval: 30, // seconds
          timeout: 10,
          unhealthyThreshold: 3,
          healthyThreshold: 2,
        },
        rollout: config.rollout || {
          strategy: "blue-green", // blue-green, canary, rolling
          canaryPercentage: 10,
          maxSurge: 25,
          maxUnavailable: 10,
        },
        resources: config.resources || {
          cpu: "500m",
          memory: "512Mi",
          storage: "5Gi",
        },
        env: config.env || {},
      },
    };
    deployments.push(deployment);
    return deployment;
  };

  const updateDeploymentStatus = (deploymentId, newStatus, details = {}) => {
    const deployment = deployments.find((d) => d.id === deploymentId);
    if (deployment) {
      deployment.status = newStatus;
      deployment.lastDeployedAt = new Date().toISOString();
      Object.assign(deployment, details);
    }
    return deployment;
  };

  const getDeployments = (filters = {}) => {
    let results = deployments;
    if (filters.environment) results = results.filter((d) => d.environment === filters.environment);
    if (filters.status) results = results.filter((d) => d.status === filters.status);
    if (filters.cloudProvider) results = results.filter((d) => d.cloudProvider === filters.cloudProvider);
    return results;
  };

  const simulateHealthCheck = (deploymentId) => {
    const deployment = deployments.find((d) => d.id === deploymentId);
    if (!deployment) return null;

    const healthy = Math.random() > 0.15; // 85% healthy
    const metrics = {
      timestamp: new Date().toISOString(),
      status: healthy ? "healthy" : "unhealthy",
      responseTime: Math.floor(Math.random() * 300) + 50,
      uptime: (Math.random() * 100).toFixed(2),
      activeConnections: Math.floor(Math.random() * 500),
      cpu: (Math.random() * 85).toFixed(1),
      memory: (Math.random() * 80).toFixed(1),
      errorRate: ((Math.random() * 5) / 100).toFixed(3),
      requestsPerSecond: Math.floor(Math.random() * 1000) + 100,
    };

    deployment.lastHealthCheck = metrics;
    deployment.healthStatus = healthy ? "healthy" : "degraded";
    return metrics;
  };

  const scaleDeployment = (deploymentId, newInstanceCount) => {
    const deployment = deployments.find((d) => d.id === deploymentId);
    if (deployment) {
      const config = deployment.config.autoScaling;
      const scaled = Math.max(config.minInstances, Math.min(config.maxInstances, newInstanceCount));
      deployment.instanceCount = scaled;
      return { success: true, newInstanceCount: scaled };
    }
    return { success: false };
  };

  const deleteDeployment = (deploymentId) => {
    const index = deployments.findIndex((d) => d.id === deploymentId);
    if (index > -1) {
      const deleted = deployments.splice(index, 1);
      return deleted[0];
    }
    return null;
  };

  const getMetrics = (deploymentId) => {
    const deployment = deployments.find((d) => d.id === deploymentId);
    if (!deployment) return null;

    return {
      deploymentId,
      status: deployment.status,
      healthStatus: deployment.healthStatus,
      lastHealthCheck: deployment.lastHealthCheck,
      uptime: (Math.random() * 100).toFixed(2),
      costPerHour: (Math.random() * 50 + 10).toFixed(2),
      requestsPerDay: Math.floor(Math.random() * 1000000) + 100000,
    };
  };

  return {
    createDeployment,
    updateDeploymentStatus,
    getDeployments,
    simulateHealthCheck,
    scaleDeployment,
    deleteDeployment,
    getMetrics,
  };
}

export const deploymentManager = createDeploymentConfig();