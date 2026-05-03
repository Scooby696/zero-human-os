import React, { useState } from "react";
import { Cloud, Activity, AlertCircle, CheckCircle, Pause, Trash2, Settings, BarChart3, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  deploying: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const HEALTH_ICONS = {
  healthy: <CheckCircle className="w-4 h-4 text-green-400" />,
  degraded: <AlertCircle className="w-4 h-4 text-amber-400" />,
  unknown: <Activity className="w-4 h-4 text-slate-400" />,
};

export default function DeploymentCard({
  deployment,
  onScale,
  onHealthCheck,
  onDelete,
  onConfigure,
  onMetrics,
}) {
  const [isScaling, setIsScaling] = useState(false);
  const [newInstanceCount, setNewInstanceCount] = useState(deployment.instanceCount);

  const handleScale = () => {
    if (newInstanceCount !== deployment.instanceCount) {
      onScale(deployment.id, newInstanceCount);
    }
    setIsScaling(false);
  };

  const cloudProviderColors = {
    aws: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
    gcp: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    azure: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  };

  const cloudProviderLabels = { aws: "AWS", gcp: "Google Cloud", azure: "Azure" };

  return (
    <div className={`rounded-xl border p-4 backdrop-blur-sm bg-gradient-to-br ${cloudProviderColors[deployment.cloudProvider]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{deployment.workflowName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{cloudProviderLabels[deployment.cloudProvider]}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{deployment.region}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[deployment.status]}`}>
              {deployment.status}
            </span>
          </div>
        </div>
        <Cloud className="w-5 h-5 text-muted-foreground/60" />
      </div>

      {/* Health Status */}
      <div className="mb-3 p-2 rounded-lg bg-background/40 border border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {HEALTH_ICONS[deployment.healthStatus]}
            <span className="text-xs font-medium text-foreground">
              {deployment.healthStatus === "healthy"
                ? "All systems operational"
                : deployment.healthStatus === "degraded"
                  ? "Some issues detected"
                  : "Checking..."}
            </span>
          </div>
          <button
            onClick={() => onHealthCheck(deployment.id)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Run health check"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {deployment.lastHealthCheck && (
          <div className="text-[10px] text-muted-foreground/70 mt-1 space-y-0.5 font-mono">
            <p>Response: {deployment.lastHealthCheck.responseTime}ms | CPU: {deployment.lastHealthCheck.cpu}% | Memory: {deployment.lastHealthCheck.memory}%</p>
            <p>Errors: {(deployment.lastHealthCheck.errorRate * 100).toFixed(2)}% | RPS: {deployment.lastHealthCheck.requestsPerSecond}</p>
          </div>
        )}
      </div>

      {/* Instances & Scaling */}
      <div className="mb-3 p-2 rounded-lg bg-background/40 border border-border/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Running Instances</p>
            <p className="text-lg font-bold text-primary mt-1">{deployment.instanceCount}</p>
          </div>
          {isScaling ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={deployment.config.autoScaling.minInstances}
                max={deployment.config.autoScaling.maxInstances}
                value={newInstanceCount}
                onChange={(e) => setNewInstanceCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 px-2 py-1 bg-background border border-border/50 rounded text-xs text-foreground text-center focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleScale}
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setIsScaling(false);
                  setNewInstanceCount(deployment.instanceCount);
                }}
                className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsScaling(true)}
              className="px-3 py-1 text-xs font-medium bg-secondary/50 text-foreground border border-border/30 rounded hover:bg-secondary transition-colors"
            >
              Scale
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          Auto-scale: {deployment.config.autoScaling.minInstances}–{deployment.config.autoScaling.maxInstances} (Target CPU: {deployment.config.autoScaling.targetCPU}%)
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onMetrics(deployment.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Metrics
        </button>
        <button
          onClick={() => onConfigure(deployment.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-secondary/50 border border-border/30 text-foreground rounded-lg hover:bg-secondary transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Config
        </button>
        <button
          onClick={() => onDelete(deployment.id)}
          className="px-3 py-2 text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Version & Time */}
      <p className="text-[10px] text-muted-foreground/50 mt-3 pt-3 border-t border-border/20">
        v{deployment.version} • Deployed {deployment.lastDeployedAt ? new Date(deployment.lastDeployedAt).toLocaleDateString() : "never"}
      </p>
    </div>
  );
}