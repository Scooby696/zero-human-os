import React, { useState } from "react";
import { X, Cloud, ChevronRight, AlertCircle } from "lucide-react";

const CLOUD_PROVIDERS = [
  { id: "aws", name: "Amazon Web Services", icon: "☁️", regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"] },
  { id: "gcp", name: "Google Cloud Platform", icon: "🔵", regions: ["us-central1", "europe-west1", "asia-east1"] },
  { id: "azure", name: "Microsoft Azure", icon: "Ⓜ️", regions: ["East US", "West Europe", "Southeast Asia"] },
];

export default function DeploymentWizard({ isOpen, onClose, onDeploy }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    workflowName: "",
    workflowId: "",
    environment: "staging",
    cloudProvider: "aws",
    region: "us-east-1",
    version: "1.0.0",
    instanceCount: 2,
    autoScaling: {
      enabled: true,
      minInstances: 1,
      maxInstances: 10,
      targetCPU: 70,
    },
    healthCheck: {
      enabled: true,
      interval: 30,
    },
    rollout: {
      strategy: "blue-green",
    },
    env: {},
  });

  const handleDeploy = () => {
    if (config.workflowName && config.workflowId) {
      onDeploy(config);
      setStep(1);
      setConfig({
        workflowName: "",
        workflowId: "",
        environment: "staging",
        cloudProvider: "aws",
        region: "us-east-1",
        version: "1.0.0",
        instanceCount: 2,
        autoScaling: {
          enabled: true,
          minInstances: 1,
          maxInstances: 10,
          targetCPU: 70,
        },
        healthCheck: {
          enabled: true,
          interval: 30,
        },
        rollout: {
          strategy: "blue-green",
        },
        env: {},
      });
    }
  };

  if (!isOpen) return null;

  const currentProvider = CLOUD_PROVIDERS.find((p) => p.id === config.cloudProvider);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Deploy Workflow to Production</h2>
            <p className="text-xs text-muted-foreground mt-1">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Select Workflow</h3>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={config.workflowName}
                  onChange={(e) => setConfig({ ...config, workflowName: e.target.value })}
                  placeholder="e.g., Handle New Order"
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Workflow ID</label>
                <input
                  type="text"
                  value={config.workflowId}
                  onChange={(e) => setConfig({ ...config, workflowId: e.target.value })}
                  placeholder="wf_xyz123"
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Version</label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => setConfig({ ...config, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Choose Cloud Provider</h3>
              <div className="grid grid-cols-1 gap-3">
                {CLOUD_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setConfig({ ...config, cloudProvider: provider.id, region: provider.regions[0] })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      config.cloudProvider === provider.id
                        ? "bg-primary/20 border-primary"
                        : "bg-background/60 border-border/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.regions.length} regions available</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Region</label>
                <select
                  value={config.region}
                  onChange={(e) => setConfig({ ...config, region: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  {currentProvider?.regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Environment</label>
                <div className="flex gap-2">
                  {["staging", "production"].map((env) => (
                    <button
                      key={env}
                      onClick={() => setConfig({ ...config, environment: env })}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        config.environment === env
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-background/60 border-border/30 text-foreground hover:border-border"
                      }`}
                    >
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Auto-Scaling Configuration</h3>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground mb-3">
                  <input
                    type="checkbox"
                    checked={config.autoScaling.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      autoScaling: { ...config.autoScaling, enabled: e.target.checked }
                    })}
                  />
                  Enable Auto-Scaling
                </label>
              </div>
              {config.autoScaling.enabled && (
                <div className="space-y-3 p-3 rounded-lg bg-background/60 border border-border/30">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Min Instances</label>
                    <input
                      type="number"
                      min="1"
                      value={config.autoScaling.minInstances}
                      onChange={(e) => setConfig({
                        ...config,
                        autoScaling: { ...config.autoScaling, minInstances: Math.max(1, parseInt(e.target.value)) }
                      })}
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Max Instances</label>
                    <input
                      type="number"
                      min="1"
                      value={config.autoScaling.maxInstances}
                      onChange={(e) => setConfig({
                        ...config,
                        autoScaling: { ...config.autoScaling, maxInstances: Math.max(1, parseInt(e.target.value)) }
                      })}
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Target CPU %</label>
                    <input
                      type="number"
                      min="10"
                      max="90"
                      value={config.autoScaling.targetCPU}
                      onChange={(e) => setConfig({
                        ...config,
                        autoScaling: { ...config.autoScaling, targetCPU: Math.max(10, Math.min(90, parseInt(e.target.value))) }
                      })}
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded text-sm text-foreground"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={config.healthCheck.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      healthCheck: { ...config.healthCheck, enabled: e.target.checked }
                    })}
                  />
                  Enable Health Checks (every {config.healthCheck.interval}s)
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Rollout Strategy</label>
                <select
                  value={config.rollout.strategy}
                  onChange={(e) => setConfig({
                    ...config,
                    rollout: { ...config.rollout, strategy: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="blue-green">Blue-Green (zero downtime)</option>
                  <option value="canary">Canary (gradual rollout)</option>
                  <option value="rolling">Rolling (instance by instance)</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Review Deployment</h3>
              <div className="space-y-2 p-4 rounded-lg bg-background/60 border border-border/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Workflow:</span>
                  <span className="font-medium text-foreground">{config.workflowName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium text-foreground capitalize">{config.cloudProvider}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="font-medium text-foreground">{config.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-medium text-foreground capitalize">{config.environment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium text-foreground">{config.version}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                  <span className="text-muted-foreground">Auto-Scale:</span>
                  <span className="font-medium text-foreground">
                    {config.autoScaling.enabled ? `${config.autoScaling.minInstances}–${config.autoScaling.maxInstances}` : "Disabled"}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex gap-3">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-foreground">Deployment will take ~2–5 minutes. Health checks start automatically.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-secondary/10 flex gap-3 shrink-0">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={!config.workflowName || !config.workflowId}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deploy Now
            </button>
          )}
        </div>
      </div>
    </>
  );
}