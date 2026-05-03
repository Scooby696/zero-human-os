import { base44 } from "@/api/base44Client";

export function createWebhookTriggerManager() {
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

  const createWebhookTrigger = async (workflowId, triggerId, nodeConfig = {}) => {
    try {
      const token = generateSecureToken();
      const publicURL = generatePublicURL(workflowId, triggerId);

      const trigger = await base44.entities.WebhookTrigger.create({
        workflowId,
        triggerId,
        token,
        publicURL,
        isActive: true,
        triggerCount: 0,
        authHeaderName: nodeConfig.authHeaderName || "X-Webhook-Token",
        requiresAuth: nodeConfig.requiresAuth || false,
        ipWhitelist: JSON.stringify(nodeConfig.ipWhitelist || []),
      });

      return trigger;
    } catch (error) {
      console.error("Error creating webhook trigger:", error);
      throw error;
    }
  };

  const getWebhookTrigger = async (workflowId, triggerId) => {
    try {
      const triggers = await base44.entities.WebhookTrigger.filter({
        workflowId,
        triggerId,
      });
      return triggers[0] || null;
    } catch (error) {
      console.error("Error getting webhook trigger:", error);
      return null;
    }
  };

  const getAllWebhookTriggers = async (workflowId) => {
    try {
      return await base44.entities.WebhookTrigger.filter({ workflowId });
    } catch (error) {
      console.error("Error getting webhook triggers:", error);
      return [];
    }
  };

  const validateWebhookRequest = async (workflowId, triggerId, token, clientIP = null) => {
    const trigger = await getWebhookTrigger(workflowId, triggerId);

    if (!trigger) {
      return { valid: false, error: "Webhook trigger not found" };
    }

    if (!trigger.isActive) {
      return { valid: false, error: "Webhook trigger is disabled" };
    }

    if (trigger.requiresAuth && trigger.token !== token) {
      return { valid: false, error: "Invalid authentication token" };
    }

    const whitelist = JSON.parse(trigger.ipWhitelist || "[]");
    if (whitelist.length > 0 && clientIP && !whitelist.includes(clientIP)) {
      return { valid: false, error: "IP address not whitelisted" };
    }

    return { valid: true };
  };

  const logWebhookEvent = async (workflowId, triggerId, event, status = "received", clientIP = null, headers = {}) => {
    try {
      const trigger = await getWebhookTrigger(workflowId, triggerId);
      if (!trigger) return null;

      const eventRecord = await base44.entities.WebhookEventLog.create({
        webhookTriggerId: trigger.id,
        workflowId,
        payload: JSON.stringify(event),
        status,
        clientIP: clientIP || "",
        headers: JSON.stringify(headers),
        processingTime: 0,
      });

      // Update trigger count and last triggered
      await base44.entities.WebhookTrigger.update(trigger.id, {
        triggerCount: trigger.triggerCount + 1,
        lastTriggered: new Date().toISOString(),
      });

      return eventRecord;
    } catch (error) {
      console.error("Error logging webhook event:", error);
      return null;
    }
  };

  const getEventLog = async (workflowId, triggerId, limit = 100) => {
    try {
      const trigger = await getWebhookTrigger(workflowId, triggerId);
      if (!trigger) return [];

      const events = await base44.entities.WebhookEventLog.filter({
        webhookTriggerId: trigger.id,
      }, "-created_date", limit);

      return events.map((e) => ({
        ...e,
        payload: JSON.parse(e.payload),
        headers: JSON.parse(e.headers),
      }));
    } catch (error) {
      console.error("Error getting event log:", error);
      return [];
    }
  };

  const updateWebhookTrigger = async (workflowId, triggerId, updates) => {
    try {
      const trigger = await getWebhookTrigger(workflowId, triggerId);
      if (!trigger) return null;

      return await base44.entities.WebhookTrigger.update(trigger.id, updates);
    } catch (error) {
      console.error("Error updating webhook trigger:", error);
      return null;
    }
  };

  const deleteWebhookTrigger = async (workflowId, triggerId) => {
    try {
      const trigger = await getWebhookTrigger(workflowId, triggerId);
      if (!trigger) return false;

      await base44.entities.WebhookTrigger.delete(trigger.id);
      return true;
    } catch (error) {
      console.error("Error deleting webhook trigger:", error);
      return false;
    }
  };

  const rotateToken = async (workflowId, triggerId) => {
    try {
      const trigger = await getWebhookTrigger(workflowId, triggerId);
      if (!trigger) return null;

      const newToken = generateSecureToken();
      const newURL = generatePublicURL(workflowId, triggerId);

      return await base44.entities.WebhookTrigger.update(trigger.id, {
        token: newToken,
        publicURL: newURL,
      });
    } catch (error) {
      console.error("Error rotating token:", error);
      return null;
    }
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