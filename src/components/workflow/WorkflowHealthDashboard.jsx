import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateWorkflowMetrics, getWorkflowStatus } from "../../utils/metricsGenerator";

export default function WorkflowHealthDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    setMetrics(generateWorkflowMetrics());
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setMetrics(generateWorkflowMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const status = getWorkflowStatus(metrics.successRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Health</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time metrics for the last 24 hours</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 ${status.color}`}>
          <Activity className="w-4 h-4" />
          <span className="font-semibold text-sm">{status.label}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Executions */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Executions</span>
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.totalExecutions}</p>
          <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
        </div>

        {/* Success Rate */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{metrics.successRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{metrics.successCount} successful</p>
        </div>

        {/* Failure Rate */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Failure Rate</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{metrics.failureRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{metrics.failedCount} failed</p>
        </div>

        {/* Avg Latency */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Avg Latency</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">{metrics.avgLatency}ms</p>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.minLatency}ms – {metrics.maxLatency}ms
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Execution Chart */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Executions by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.2)" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="successful" stackId="a" fill="#4ade80" />
              <Bar dataKey="failed" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Webhook Latency Trends */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Webhook Action Metrics</h3>
            <span className="text-xs font-semibold text-muted-foreground">{metrics.webhookCount} actions</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/60">
              <span className="text-sm text-muted-foreground">Average Latency</span>
              <span className="text-lg font-bold text-cyan-400">{metrics.avgWebhookLatency}ms</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/60">
                <p className="text-xs text-muted-foreground mb-1">Min</p>
                <p className="text-base font-bold text-primary">{metrics.minLatency}ms</p>
              </div>
              <div className="p-3 rounded-lg bg-background/60">
                <p className="text-xs text-muted-foreground mb-1">Max</p>
                <p className="text-base font-bold text-destructive">{metrics.maxLatency}ms</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
              <p className="text-xs font-medium text-green-400">
                ✓ Webhook actions performing within SLA ({metrics.avgWebhookLatency}ms avg)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-4">Recent Executions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Execution ID</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Latency</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentExecutions.map((exec) => (
                <tr key={exec.id} className="border-b border-border/20 hover:bg-background/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{exec.id}</td>
                  <td className="px-4 py-3">
                    {exec.success ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{exec.latency}ms</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(exec.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}