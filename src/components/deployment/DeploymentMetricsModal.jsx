import React from "react";
import { X, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { deploymentManager } from "../../utils/deploymentManager";

export default function DeploymentMetricsModal({ isOpen, onClose, deploymentId }) {
  const metrics = deploymentManager.getMetrics(deploymentId);

  if (!isOpen || !metrics) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Deployment Metrics</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-bold text-primary mt-1">{metrics.status}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Health</p>
              <p className={`text-sm font-bold mt-1 ${metrics.healthStatus === "healthy" ? "text-green-400" : "text-amber-400"}`}>
                {metrics.healthStatus}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-sm font-bold text-cyan-400 mt-1">{metrics.uptime}%</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Cost/Hour</p>
              <p className="text-sm font-bold text-amber-400 mt-1">${metrics.costPerHour}</p>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Requests/Day</p>
              <p className="text-lg font-bold text-foreground mt-1">{metrics.requestsPerDay.toLocaleString()}</p>
            </div>
          </div>

          {metrics.lastHealthCheck && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <p className="text-xs font-bold text-primary">Latest Health Check</p>
              <div className="text-xs text-foreground space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span>{metrics.lastHealthCheck.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span>{metrics.lastHealthCheck.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>{metrics.lastHealthCheck.memory}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span>{(metrics.lastHealthCheck.errorRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>RPS:</span>
                  <span>{metrics.lastHealthCheck.requestsPerSecond}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-secondary/10">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}