// Secret Vault with client-side encryption simulation
// In production, use TweetNaCl.js or libsodium.js for real encryption

export function createSecretVault() {
  let secrets = [];
  let encryptionKey = null;

  const generateKey = () => {
    // Simulate key generation - in production use crypto.getRandomValues()
    return `key_${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`;
  };

  const encryptSecret = (value) => {
    // Simulate encryption - in production use actual encryption
    if (!encryptionKey) encryptionKey = generateKey();
    const encrypted = btoa(value); // Browser native base64 encoding
    return {
      encrypted,
      keyId: encryptionKey,
      algorithm: 'AES-256-GCM',
    };
  };

  const decryptSecret = (encryptedData) => {
    // Simulate decryption
    try {
      return atob(encryptedData.encrypted); // Browser native base64 decoding
    } catch (e) {
      return null;
    }
  };

  const createSecret = (config) => {
    const secret = {
      id: `secret_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: config.name,
      type: config.type, // api_key, env_var, token, password
      description: config.description || '',
      value: encryptSecret(config.value),
      tags: config.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rotatedAt: new Date().toISOString(),
      rotationPolicy: config.rotationPolicy || {
        enabled: false,
        interval: 90, // days
        lastRotated: new Date().toISOString(),
      },
      accessLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          user: 'system',
        },
      ],
      metadata: {
        provider: config.provider || null, // aws, gcp, stripe, etc.
        environment: config.environment || 'all',
      },
    };
    secrets.push(secret);
    return secret;
  };

  const getSecret = (secretId) => {
    const secret = secrets.find((s) => s.id === secretId);
    if (!secret) return null;
    return {
      ...secret,
      value: decryptSecret(secret.value),
    };
  };

  const getSecrets = (filters = {}) => {
    let results = secrets;
    if (filters.type) results = results.filter((s) => s.type === filters.type);
    if (filters.tags) results = results.filter((s) => filters.tags.some((tag) => s.tags.includes(tag)));
    if (filters.provider) results = results.filter((s) => s.metadata.provider === filters.provider);

    return results.map((s) => ({
      ...s,
      value: '••••••••', // Never return decrypted value in list
    }));
  };

  const updateSecret = (secretId, updates) => {
    const secret = secrets.find((s) => s.id === secretId);
    if (!secret) return null;

    const encrypted = updates.value ? encryptSecret(updates.value) : secret.value;

    secret.name = updates.name || secret.name;
    secret.description = updates.description || secret.description;
    secret.value = encrypted;
    secret.updatedAt = new Date().toISOString();
    secret.accessLog.push({
      timestamp: new Date().toISOString(),
      action: 'updated',
      user: 'system',
    });

    return secret;
  };

  const rotateSecret = (secretId, newValue) => {
    const secret = secrets.find((s) => s.id === secretId);
    if (!secret) return null;

    secret.value = encryptSecret(newValue);
    secret.rotatedAt = new Date().toISOString();
    secret.rotationPolicy.lastRotated = new Date().toISOString();
    secret.accessLog.push({
      timestamp: new Date().toISOString(),
      action: 'rotated',
      user: 'system',
    });

    return secret;
  };

  const deleteSecret = (secretId) => {
    const index = secrets.findIndex((s) => s.id === secretId);
    if (index > -1) {
      const deleted = secrets.splice(index, 1);
      return deleted[0];
    }
    return null;
  };

  const getAccessLog = (secretId) => {
    const secret = secrets.find((s) => s.id === secretId);
    return secret ? secret.accessLog : [];
  };

  const generateSecretReference = (secretId) => {
    // Generate reference syntax for use in nodes: {{secret:secret_id}}
    return `{{secret:${secretId}}}`;
  };

  const resolveSecrets = (text) => {
    // Replace secret references with actual values
    const secretRegex = /\{\{secret:([^}]+)\}\}/g;
    let resolved = text;
    const matches = text.matchAll(secretRegex);

    for (const match of matches) {
      const secretId = match[1];
      const secret = getSecret(secretId);
      if (secret) {
        resolved = resolved.replace(match[0], secret.value);
      }
    }

    return resolved;
  };

  const validateSecretPolicy = (secret) => {
    const issues = [];
    if (!secret.name || secret.name.length < 3) {
      issues.push('Secret name must be at least 3 characters');
    }
    if (!secret.value || secret.value.length < 8) {
      issues.push('Secret value must be at least 8 characters');
    }
    if (secret.rotationPolicy.enabled && secret.rotationPolicy.interval < 7) {
      issues.push('Rotation interval must be at least 7 days');
    }
    return {
      valid: issues.length === 0,
      issues,
    };
  };

  return {
    createSecret,
    getSecret,
    getSecrets,
    updateSecret,
    rotateSecret,
    deleteSecret,
    getAccessLog,
    generateSecretReference,
    resolveSecrets,
    validateSecretPolicy,
  };
}

export const secretVault = createSecretVault();