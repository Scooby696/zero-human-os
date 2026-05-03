const MAX_LOGS = 100;

export function createWebhookLogger() {
  let logs = [];

  const addLog = (log) => {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
    return entry;
  };

  const getLogs = () => [...logs];

  const getLogsByNode = (nodeId) => logs.filter((l) => l.nodeId === nodeId);

  const clearLogs = () => {
    logs = [];
  };

  const deleteLog = (logId) => {
    logs = logs.filter((l) => l.id !== logId);
  };

  return {
    addLog,
    getLogs,
    getLogsByNode,
    clearLogs,
    deleteLog,
  };
}

// Global singleton instance
export const webhookLogger = createWebhookLogger();