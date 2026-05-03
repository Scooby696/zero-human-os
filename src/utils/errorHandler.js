export function createErrorHandler() {
  let failureLog = [];
  let alertSent = new Set();

  const matchesErrorType = (error, errorTypes) => {
    if (!errorTypes || errorTypes === "all") return true;
    const types = errorTypes.split(",").map((t) => t.trim().toLowerCase());
    const errorType = (error.type || error.code || "unknown").toString().toLowerCase();
    return types.some((t) => errorType.includes(t) || t === "all");
  };

  const executeRetry = async (nodeFn, config) => {
    const { retry_count = 3, retry_delay_ms = 1000 } = config;
    let lastError = null;

    for (let attempt = 1; attempt <= retry_count; attempt++) {
      try {
        const result = await nodeFn();
        return { success: true, result, attempt };
      } catch (error) {
        lastError = error;
        if (attempt < retry_count) {
          await new Promise((resolve) => setTimeout(resolve, retry_delay_ms * attempt));
        }
      }
    }

    return { success: false, error: lastError, attempts: retry_count };
  };

  const sendEmailAlert = (config, error, context) => {
    return {
      type: "email",
      to: config.alert_email,
      subject: `Workflow Error Alert: ${context.nodeName}`,
      body: `
Node: ${context.nodeName}
Error: ${error.message}
Timestamp: ${new Date().toISOString()}
Workflow: ${context.workflowName}

Fallback Action: ${config.fallback_action}
      `.trim(),
      sent: true,
    };
  };

  const sendSlackAlert = (config, error, context) => {
    return {
      type: "slack",
      webhook: config.alert_slack_webhook,
      payload: {
        text: `⚠️ Workflow Error Alert`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Error in Node:* ${context.nodeName}\n*Workflow:* ${context.workflowName}\n*Error:* ${error.message}\n*Fallback:* ${config.fallback_action}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`,
              },
            ],
          },
        ],
      },
      sent: true,
    };
  };

  const logFailure = (nodeId, error, config) => {
    const failure = {
      id: `failure_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      nodeId,
      error: error.message,
      errorType: error.type || error.code,
      timestamp: new Date().toISOString(),
      fallbackAction: config.fallback_action,
      config,
    };
    failureLog.push(failure);
    return failure;
  };

  const handleError = async (nodeId, error, config, context = {}) => {
    const { nodeName = nodeId, workflowName = "Unknown" } = context;

    // Check if error type matches configured handlers
    if (!matchesErrorType(error, config.error_types)) {
      return { handled: false, error };
    }

    // Log the failure
    const failure = logFailure(nodeId, error, config);

    // Send alerts
    const alerts = [];
    if (config.alert_email) {
      alerts.push(sendEmailAlert(config, error, { nodeName, workflowName }));
    }
    if (config.alert_slack_webhook) {
      alerts.push(sendSlackAlert(config, error, { nodeName, workflowName }));
    }

    // Check escalation threshold
    const failureCount = failureLog.filter((f) => f.nodeId === nodeId).length;
    const escalate = config.escalation_threshold && failureCount >= config.escalation_threshold;

    // Execute fallback action
    let fallbackResult = null;
    switch (config.fallback_action) {
      case "retry":
        // Retry will be handled by caller with executeRetry
        return { handled: true, action: "retry", failure, alerts, escalate };

      case "skip":
        fallbackResult = { skipped: true, message: "Skipped due to error" };
        break;

      case "alert":
        fallbackResult = { alerted: true, message: "Alerts sent" };
        break;

      case "custom_response":
        fallbackResult = { custom: true, message: config.fallback_response || "Error handled" };
        break;

      default:
        fallbackResult = { error: error.message };
    }

    return {
      handled: true,
      action: config.fallback_action,
      failure,
      fallbackResult,
      alerts,
      escalate,
    };
  };

  const getFailureLog = (filters = {}) => {
    let results = failureLog;
    if (filters.nodeId) {
      results = results.filter((f) => f.nodeId === filters.nodeId);
    }
    if (filters.since) {
      results = results.filter((f) => new Date(f.timestamp) >= new Date(filters.since));
    }
    return results;
  };

  const clearFailureLog = () => {
    failureLog = [];
  };

  return {
    matchesErrorType,
    executeRetry,
    handleError,
    sendEmailAlert,
    sendSlackAlert,
    getFailureLog,
    clearFailureLog,
    logFailure,
  };
}

export const errorHandler = createErrorHandler();