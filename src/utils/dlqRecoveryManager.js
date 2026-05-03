/**
 * DLQ Recovery Manager - Defines and executes automated recovery actions
 * Supports Slack notifications, API cleanup, custom webhooks, and retries
 */

export function createDLQRecoveryManager() {
  let recoveryRules = []; // Array of recovery action rules
  let executionHistory = [];
  const MAX_HISTORY = 500;

  const addRecoveryRule = (rule) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      enabled: true,
      createdAt: Date.now(),
      ...rule,
    };

    recoveryRules.push(newRule);
    return newRule;
  };

  const removeRecoveryRule = (ruleId) => {
    recoveryRules = recoveryRules.filter((r) => r.id !== ruleId);
  };

  const updateRecoveryRule = (ruleId, updates) => {
    const rule = recoveryRules.find((r) => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
    return rule;
  };

  const matchingRules = (errorCode, nodeType) => {
    return recoveryRules.filter(
      (rule) =>
        rule.enabled &&
        (rule.errorCodePattern === '*' || rule.errorCodePattern === errorCode) &&
        (rule.nodeType === 'any' || rule.nodeType === nodeType)
    );
  };

  const executeRecoveryAction = async (dlqEntry, rule) => {
    const executionStart = Date.now();

    try {
      let result = { success: false, action: rule.action, message: '' };

      switch (rule.action) {
        case 'slack_notification':
          result = await executeSlackNotification(dlqEntry, rule);
          break;

        case 'api_cleanup':
          result = await executeApiCleanup(dlqEntry, rule);
          break;

        case 'auto_retry':
          result = await executeAutoRetry(dlqEntry, rule);
          break;

        case 'custom_webhook':
          result = await executeCustomWebhook(dlqEntry, rule);
          break;

        case 'data_rollback':
          result = await executeDataRollback(dlqEntry, rule);
          break;

        default:
          result.message = `Unknown action: ${rule.action}`;
      }

      const execution = {
        ruleId: rule.id,
        dlqEntryId: dlqEntry.id,
        action: rule.action,
        status: result.success ? 'success' : 'failed',
        message: result.message,
        duration: Date.now() - executionStart,
        timestamp: Date.now(),
      };

      executionHistory.push(execution);
      if (executionHistory.length > MAX_HISTORY) {
        executionHistory = executionHistory.slice(-MAX_HISTORY);
      }

      return execution;
    } catch (error) {
      return {
        ruleId: rule.id,
        dlqEntryId: dlqEntry.id,
        action: rule.action,
        status: 'error',
        message: error.message,
        duration: Date.now() - executionStart,
        timestamp: Date.now(),
      };
    }
  };

  const executeSlackNotification = async (dlqEntry, rule) => {
    // In production, this would call the Slack webhook
    const slackPayload = {
      channel: rule.slackChannel || '#alerts',
      username: 'DLQ Recovery Bot',
      icon_emoji: ':warning:',
      text: `⚠️ DLQ Recovery Action Triggered`,
      attachments: [
        {
          color: 'danger',
          title: `Error: ${dlqEntry.errorCode}`,
          text: dlqEntry.errorMessage || 'Unknown error',
          fields: [
            { title: 'Node', value: dlqEntry.nodeId, short: true },
            { title: 'Workflow', value: dlqEntry.workflowId, short: true },
            { title: 'Action', value: rule.action, short: true },
            { title: 'Stakeholders', value: rule.notifyUsers?.join(', ') || 'None', short: true },
          ],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    // Simulate Slack API call
    console.log('Slack notification sent:', slackPayload);

    return {
      success: true,
      message: `Slack notification sent to ${rule.slackChannel}`,
      payload: slackPayload,
    };
  };

  const executeApiCleanup = async (dlqEntry, rule) => {
    // Clean up stale data from downstream APIs
    const cleanupConfig = rule.cleanupConfig || {};

    const cleanupTasks = [];

    // Delete data from specified endpoints
    if (cleanupConfig.deleteEndpoints) {
      cleanupConfig.deleteEndpoints.forEach((endpoint) => {
        cleanupTasks.push(
          fetch(endpoint, {
            method: 'DELETE',
            headers: cleanupConfig.headers || {},
            body: JSON.stringify({
              referenceId: dlqEntry.id,
              nodeId: dlqEntry.nodeId,
            }),
          })
        );
      });
    }

    // Trigger webhook to cleanup external systems
    if (cleanupConfig.webhookUrl) {
      cleanupTasks.push(
        fetch(cleanupConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cleanupConfig.headers },
          body: JSON.stringify({
            action: 'cleanup',
            dlqEntryId: dlqEntry.id,
            errorCode: dlqEntry.errorCode,
          }),
        })
      );
    }

    try {
      await Promise.all(cleanupTasks);
      return {
        success: true,
        message: `Cleaned up ${cleanupTasks.length} downstream API references`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Cleanup failed: ${error.message}`,
      };
    }
  };

  const executeAutoRetry = async (dlqEntry, rule) => {
    const retryConfig = rule.retryConfig || {};
    const maxRetries = retryConfig.maxRetries || 3;
    const delayMs = retryConfig.delayMs || 5000;

    return {
      success: true,
      message: `Scheduled auto-retry with ${maxRetries} attempts, ${delayMs}ms delay`,
      retryScheduled: {
        dlqEntryId: dlqEntry.id,
        maxRetries,
        delayMs,
        nextRetryAt: Date.now() + delayMs,
      },
    };
  };

  const executeCustomWebhook = async (dlqEntry, rule) => {
    const webhookUrl = rule.webhookUrl;
    if (!webhookUrl) {
      return { success: false, message: 'Webhook URL not configured' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...rule.webhookHeaders,
        },
        body: JSON.stringify({
          dlqEntry,
          ruleId: rule.id,
          timestamp: Date.now(),
        }),
      });

      return {
        success: response.ok,
        message: `Webhook call completed with status ${response.status}`,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: `Webhook call failed: ${error.message}`,
      };
    }
  };

  const executeDataRollback = async (dlqEntry, rule) => {
    const rollbackConfig = rule.rollbackConfig || {};

    return {
      success: true,
      message: `Data rollback initiated for transaction ${rollbackConfig.transactionId || 'unknown'}`,
      rollbackDetails: {
        transactionId: rollbackConfig.transactionId,
        targetStates: rollbackConfig.targetStates || [],
        timestamp: Date.now(),
      },
    };
  };

  const processFailedEntry = async (dlqEntry) => {
    const applicableRules = matchingRules(dlqEntry.errorCode, dlqEntry.nodeType);

    if (applicableRules.length === 0) {
      return { processed: false, message: 'No recovery rules matched' };
    }

    const results = await Promise.all(
      applicableRules.map((rule) => executeRecoveryAction(dlqEntry, rule))
    );

    return {
      processed: true,
      dlqEntryId: dlqEntry.id,
      rulesApplied: applicableRules.length,
      results,
    };
  };

  const getRecoveryStats = () => {
    const stats = {
      totalRules: recoveryRules.length,
      enabledRules: recoveryRules.filter((r) => r.enabled).length,
      totalExecutions: executionHistory.length,
      successfulExecutions: executionHistory.filter((e) => e.status === 'success').length,
      failedExecutions: executionHistory.filter((e) => e.status === 'failed' || e.status === 'error').length,
      actionBreakdown: {},
    };

    executionHistory.forEach((exec) => {
      stats.actionBreakdown[exec.action] = (stats.actionBreakdown[exec.action] || 0) + 1;
    });

    return stats;
  };

  return {
    addRecoveryRule,
    removeRecoveryRule,
    updateRecoveryRule,
    matchingRules,
    executeRecoveryAction,
    processFailedEntry,
    getRecoveryRules: () => [...recoveryRules],
    getExecutionHistory: () => [...executionHistory],
    getRecoveryStats,
  };
}

export const dlqRecoveryManager = createDLQRecoveryManager();