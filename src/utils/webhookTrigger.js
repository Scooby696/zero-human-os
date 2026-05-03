export function createWebhookTriggerManager() {
  let webhookTriggers = {};

  const generateSecureToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const generatePublicURL = (workflowId, triggerId) => {
    const baseURL = window.location.origin;
    return `${baseURL}/api/webhooks/${workflowId}/${triggerId}`;
  };

  const createWebhookTrigger = (workflowId, triggerId, nodeConfig = {}) => {
    const token = generateSecureToken();
    const publicURL = generatePublicURL(workflowId, triggerId);

    const trigger = {
      id: triggerId,
      workflowId,
      token,
      publicURL,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0,
      isActive: true,
      eventLog: [],
      config: nodeConfig,
      ipWhitelist: nodeConfig.ipWhitelist || [],
      requiresAuth: nodeConfig.requiresAuth || false,
      authHeaderName: nodeConfig.authHeaderName || "X-Webhook-Token",
    };

    if (!webhookTriggers[workflowId]) {
      webhookTriggers[workflowId] = {};
    }

    webhookTriggers[workflowId][triggerId] = trigger;
    return trigger;
  };

  const getWebhookTrigger = (workflowId, triggerId) => {
    return webhookTriggers[workflowId]?.[triggerId];
  };

  const getAllWebhookTriggers = (workflowId) => {
    return Object.values(webhookTriggers[workflowId] || {});
  };

  const validateWebhookRequest = (workflowId, triggerId, token, clientIP = null) => {
    const trigger = getWebhookTrigger(workflowId, triggerId);

    if (!trigger) {
      return { valid: false, error: "Webhook trigger not found" };
    }

    if (!trigger.isActive) {
      return { valid: false, error: "Webhook trigger is disabled" };
    }

    if (trigger.requiresAuth && trigger.token !== token) {
      return { valid: false, error: "Invalid authentication token" };
    }

    if (trigger.ipWhitelist.length > 0 && clientIP && !trigger.ipWhitelist.includes(clientIP)) {
      return { valid: false, error: "IP address not whitelisted" };
    }

    return { valid: true };
  };

  const logWebhookEvent = (workflowId, triggerId, event) => {
    const trigger = getWebhookTrigger(workflowId, triggerId);
    if (!trigger) return;

    const eventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      payload: event,
      status: "received",
    };

    trigger.eventLog.push(eventRecord);
    trigger.lastTriggered = new Date().toISOString();
    trigger.triggerCount += 1;

    // Keep only last 100 events
    if (trigger.eventLog.length > 100) {
      trigger.eventLog = trigger.eventLog.slice(-100);
    }

    return eventRecord;
  };

  const getEventLog = (workflowId, triggerId) => {
    const trigger = getWebhookTrigger(workflowId, triggerId);
    return trigger?.eventLog || [];
  };

  const updateWebhookTrigger = (workflowId, triggerId, updates) => {
    const trigger = getWebhookTrigger(workflowId, triggerId);
    if (!trigger) return null;

    Object.assign(trigger, updates);
    return trigger;
  };

  const deleteWebhookTrigger = (workflowId, triggerId) => {
    if (webhookTriggers[workflowId]) {
      delete webhookTriggers[workflowId][triggerId];
      return true;
    }
    return false;
  };

  const rotateToken = (workflowId, triggerId) => {
    const trigger = getWebhookTrigger(workflowId, triggerId);
    if (!trigger) return null;

    trigger.token = generateSecureToken();
    trigger.publicURL = generatePublicURL(workflowId, triggerId);
    return trigger;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    createWebhookTrigger,
    getWebhookTrigger,
    getAllWebhookTriggers,
    validateWebhookRequest,
    logWebhookEvent,
    getEventLog,
    updateWebhookTrigger,
    deleteWebhookTrigger,
    rotateToken,
    copyToClipboard,
    generateSecureToken,
    generatePublicURL,
  };
}

export const webhookTriggerManager = createWebhookTriggerManager();