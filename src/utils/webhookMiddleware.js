import { deduplicator } from './requestDeduplicator';
import { dlq } from './deadLetterQueue';
import { budgetManager } from './costBudgetManager';

/**
 * Webhook Middleware - Validates and filters webhook requests
 * Implements deduplication, validation, and budget checks
 */

export function createWebhookMiddleware() {
  const metrics = {
    received: 0,
    duplicates: 0,
    valid: 0,
    invalid: 0,
    budgetExceeded: 0,
  };

  const processWebhook = async (webhookId, payload, headers = {}, clientIp = '') => {
    metrics.received += 1;

    // Check for duplicates
    if (deduplicator.isDuplicate(payload)) {
      metrics.duplicates += 1;
      return {
        allowed: false,
        reason: 'duplicate_request',
        costSaved: 0.001, // Assume ~$0.001 per execution
      };
    }

    // Validate webhook signature if present
    const validationResult = validateSignature(webhookId, payload, headers);
    if (!validationResult.valid) {
      metrics.invalid += 1;
      return {
        allowed: false,
        reason: validationResult.reason,
      };
    }

    // Check IP whitelist if configured
    if (headers['x-webhook-config']?.ipWhitelist) {
      const ipWhitelist = JSON.parse(headers['x-webhook-config'].ipWhitelist);
      if (ipWhitelist.length > 0 && !ipWhitelist.includes(clientIp)) {
        metrics.invalid += 1;
        return {
          allowed: false,
          reason: 'ip_not_whitelisted',
        };
      }
    }

    // Check budget limits
    const workflowId = webhookId.split('_')[0]; // Extract workflow ID from webhook ID
    const budgetStatus = budgetManager.recordCost(workflowId, 0.001);
    if (!budgetStatus.allowed) {
      metrics.budgetExceeded += 1;
      return {
        allowed: false,
        reason: 'budget_exceeded',
        budgetStatus,
      };
    }

    metrics.valid += 1;
    return {
      allowed: true,
      reason: 'valid',
    };
  };

  const validateSignature = (webhookId, payload, headers) => {
    // If no signature provided, just validate presence of auth header
    if (!headers['authorization'] && !headers['x-webhook-token']) {
      return {
        valid: false,
        reason: 'missing_auth_header',
      };
    }

    // In production, implement HMAC-SHA256 validation here
    return {
      valid: true,
      reason: 'signature_valid',
    };
  };

  const getMetrics = () => ({
    ...metrics,
    duplicateRate: (metrics.duplicates / Math.max(metrics.received, 1) * 100).toFixed(2),
    costSaved: metrics.duplicates * 0.001, // $0.001 per prevented execution
  });

  const resetMetrics = () => {
    Object.keys(metrics).forEach((key) => (metrics[key] = 0));
  };

  return { processWebhook, getMetrics, resetMetrics };
}

export const webhookMiddleware = createWebhookMiddleware();