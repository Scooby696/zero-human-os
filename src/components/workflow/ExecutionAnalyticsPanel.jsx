import React, { useState } from "react";
import { X, TrendingUp, AlertTriangle, CheckCircle, ZapOff } from "lucide-react";
import { executionMetrics } from "../../utils/executionAnalytics";

export default function ExecutionAnalyticsPanel({ isOpen, onClose }) {
  const metrics = executionMetrics.getMetrics();
  const recommendations = executionMetrics.getOptimizations();
  const history = executionMetrics.getExecutionHistory(20);

  if (!isOpen) return null;

  const RecommendationCard = ({ rec }) => (
    <div className={`p-3 rounded-lg border ${
      rec.severity === "high" ? "bg-red-400/10 border-red-400/30" :
      rec.severity === "medium" ? "bg-amber-400/10 border-amber-400/30" :
      "bg-blue-400/10 border-blue-400/30"
    }`}>
      <div className="flex items-start gap-2">
        {rec.severity === "high" && <ZapOff className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
        {rec.severity === "medium" && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
        {rec.severity === "warning" && <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />}
        <p className="text-xs text-foreground">{rec.message}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Execution Analytics</h2>
            <p className="text-xs text-muted-foreground mt-1">Performance metrics and optimization recommendations</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Key Metrics */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Total Executions</p>
                <p className="text-xl font-bold text-primary mt-1">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold text-green-400 mt-1">{metrics.successRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-xl font-bold text-cyan-400 mt-1">{metrics.avgDuration}ms</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{metrics.totalCost}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Cost/Execution</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{metrics.costPerExecution}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-xl font-bold text-red-400 mt-1">{metrics.failed}</p>
              </div>
            </div>
          </div>

          {/* Optimization Recommendations */}
          {recommendations.length > 0 ? (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Optimization Recommendations
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-green-400/10 border border-green-400/30 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">Workflow is running efficiently! No optimization needed.</p>
            </div>
          )}

          {/* Recent Executions */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Recent Executions</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No executions recorded yet</p>
              ) : (
                history.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/30 text-xs">
                    <div className="flex items-center gap-2 flex-1">
                      {exec.status === "success" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      ) : (
                        <ZapOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="text-muted-foreground truncate">{new Date(exec.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex gap-2 text-right">
                      <span className={exec.status === "success" ? "text-green-400" : "text-red-400"}>
                        {exec.duration}ms
                      </span>
                      <span className="text-amber-400">${exec.cost?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Best Practices */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="text-xs font-bold text-primary mb-2">Best Practices for Efficiency</h4>
            <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
              <li>Use batch processing for multiple items to reduce API calls</li>
              <li>Implement caching for repeated queries</li>
              <li>Set rate limits to prevent API throttling</li>
              <li>Enable retry logic for fault tolerance</li>
              <li>Monitor execution patterns and adjust scheduling</li>
              <li>Use parallel workflows only when needed (≤5 concurrent)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}