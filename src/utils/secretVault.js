import { base44 } from "@/api/base44Client";

/**
 * Frontend secret vault interface
 * - Communicates with backend secret management
 * - Never stores actual secret values
 * - Manages metadata and UI state only
 */

export function createSecretVault() {
  const callSecretAPI = async (action, data = {}) => {
    try {
      const response = await base44.functions.invoke("manageSecrets", {
        action,
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error(`Secret operation failed (${action}):`, error);
      throw error;
    }
  };

  const createSecret = async (name, value, description = "", rotationInterval = 0) => {
    if (!name || !value) {
      throw new Error("Secret name and value are required");
    }

    if (name.length < 3 || name.length > 50) {
      throw new Error("Secret name must be 3-50 characters");
    }

    const result = await callSecretAPI("create", {
      name,
      value,
      description,
      rotationInterval,
    });

    return result.secret;
  };

  const listSecrets = async () => {
    const result = await callSecretAPI("list");
    return result.secrets || [];
  };

  const getSecret = async (secretId) => {
    const result = await callSecretAPI("read", { secretId });
    // Frontend never persists this value
    return result.value;
  };

  const updateSecret = async (secretId, updates) => {
    const result = await callSecretAPI("update", {
      secretId,
      ...updates,
    });
    return result.secret;
  };

  const deleteSecret = async (secretId) => {
    const result = await callSecretAPI("delete", { secretId });
    return result.success;
  };

  const rotateSecret = async (secretId) => {
    const result = await callSecretAPI("rotate", { secretId });
    return result.secret;
  };

  const resolveSecret = async (secretId) => {
    // Backend-only resolution for workflow execution
    const result = await callSecretAPI("resolve", { secretId });
    return result.value;
  };

  const generateSecretReference = (secretId) => {
    // Return a reference string that workflow backend will resolve
    return `{{SECRET:${secretId}}}`;
  };

  const validateSecretReference = (text) => {
    const regex = /\{\{SECRET:[a-f0-9-]+\}\}/g;
    return text.match(regex) || [];
  };

  return {
    createSecret,
    listSecrets,
    getSecret,
    updateSecret,
    deleteSecret,
    rotateSecret,
    resolveSecret,
    generateSecretReference,
    validateSecretReference,
  };
}

export const secretVault = createSecretVault();