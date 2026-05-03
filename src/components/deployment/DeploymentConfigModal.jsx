import React, { useState } from "react";
import { X, Settings } from "lucide-react";

export default function DeploymentConfigModal({ isOpen, onClose, deploymentId }) {
  const [config, setConfig] = useState({
    minInstances: 1,
    maxInstances: 10,
    targetCPU: 70,
    healthCheckInterval: 30,
    strategy: "blue-green",
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Deployment Configuration</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Min Instances</label>
            <input
              type="number"
              min="1"
              value={config.minInstances}
              onChange={(e) => setConfig({ ...config, minInstances: Math.max(1, parseInt(e.target.value)) })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Max Instances</label>
            <input
              type="number"
              min="1"
              value={config.maxInstances}
              onChange={(e) => setConfig({ ...config, maxInstances: Math.max(1, parseInt(e.target.value)) })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Target CPU %</label>
            <input
              type="number"
              min="10"
              max="90"
              value={config.targetCPU}
              onChange={(e) => setConfig({ ...config, targetCPU: Math.max(10, Math.min(90, parseInt(e.target.value))) })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Health Check Interval (seconds)</label>
            <input
              type="number"
              min="10"
              value={config.healthCheckInterval}
              onChange={(e) => setConfig({ ...config, healthCheckInterval: Math.max(10, parseInt(e.target.value)) })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Rollout Strategy</label>
            <select
              value={config.strategy}
              onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="blue-green">Blue-Green (zero downtime)</option>
              <option value="canary">Canary (gradual rollout)</option>
              <option value="rolling">Rolling (instance by instance)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-secondary/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}