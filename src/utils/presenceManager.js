export function createPresenceManager() {
  const listeners = new Set();

  return {
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    notify(presence) {
      listeners.forEach((cb) => cb(presence));
    },

    generateColor() {
      const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
        "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#A9DFBF",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
  };
}

export const presenceManager = createPresenceManager();