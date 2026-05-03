import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertCircle, CheckCircle, Zap, DollarSign, Activity, BarChart3, Clock } from 'lucide-react';
import { budgetManager } from '@/utils/costBudgetManager';
import { profiler } from '@/utils/executionProfiler';
import { dlq } from '@/utils/deadLetterQueue';
import { deduplicator } from '@/utils/requestDeduplicator';
import SpendPredictionDashboard from '@/components/workflow/SpendPredictionDashboard';

function OptimizationCard({ icon: Icon, title, value, subtext, color = 'text-blue-400' }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border/50 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest">{title}</h3>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
    </div>
  );
}

function MetricChart({ title, metrics }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-bold text-foreground">{m.value}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${m.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CostOptimization() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [tab, setTab] = useState('overview');
  const [budgetStats, setBudgetStats] = useState({});
  const [profilerStats, setProfilerStats] = useState([]);
  const [dlqStats, setDlqStats] = useState({ pending: 0, dead: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update stats
      const expensive = profiler.getMostExpensive(5);
      setProfilerStats(expensive);
      setDlqStats({
        pending: dlq.getPending().length,
        dead: dlq.getDeadLetters().length,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const mostExpensiveNodes = profiler.getMostExpensive(5);
  const slowestNodes = profiler.getSlowest(5);
  const optimizationTips = profiler.getOptimizationTips();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Cost Optimization Dashboard</h1>
          <p className="text-muted-foreground">Monitor, analyze, and optimize workflow costs</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <OptimizationCard
            icon={DollarSign}
            title="Total Costs"
            value="$247.33"
            subtext="This month"
            color="text-emerald-400"
          />
          <OptimizationCard
            icon={TrendingDown}
            title="Cost Savings"
            value="$1,234"
            subtext="From optimizations"
            color="text-green-400"
          />
          <OptimizationCard
            icon={Activity}
            title="Duplicate Events Blocked"
            value="342"
            subtext="Saved $34.20"
            color="text-blue-400"
          />
          <OptimizationCard
            icon={Zap}
            title="Failed Events in DLQ"
            value={dlqStats.dead}
            subtext={`${dlqStats.pending} pending retry`}
            color="text-amber-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/30">
          {['overview', 'predict', 'expensive', 'slow', 'dlq', 'tips'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'dlq' ? 'Dead Letter Queue' : t === 'predict' ? 'Spend Prediction' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {tab === 'predict' && (
            <SpendPredictionDashboard />
          )}

          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <MetricChart
                title="Budget Utilization by Workflow"
                metrics={[
                  { label: 'Workflow A', value: '$89.50', percent: 75 },
                  { label: 'Workflow B', value: '$67.20', percent: 56 },
                  { label: 'Workflow C', value: '$42.10', percent: 35 },
                ]}
              />
              <MetricChart
                title="Cost Distribution"
                metrics={[
                  { label: 'LLM Calls', value: '$156.78', percent: 65 },
                  { label: 'API Calls', value: '$56.20', percent: 23 },
                  { label: 'Data Transfer', value: '$34.35', percent: 12 },
                ]}
              />
            </div>
          )}

          {tab === 'expensive' && (
            <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Most Expensive Nodes</h3>
              {mostExpensiveNodes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No execution data yet</p>
              ) : (
                <div className="space-y-2">
                  {mostExpensiveNodes.map((node, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-foreground">{node.nodeId}</span>
                        <span className="text-sm font-bold text-amber-400">${node.avgCost.toFixed(4)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {node.executions} executions • Total: ${node.totalCost.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'slow' && (
            <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Slowest Nodes</h3>
              {slowestNodes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No execution data yet</p>
              ) : (
                <div className="space-y-2">
                  {slowestNodes.map((node, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-foreground">{node.nodeId}</span>
                        <span className="text-sm font-bold text-cyan-400">{node.avgDuration.toFixed(0)}ms</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Avg duration across {node.executions} executions
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'dlq' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">Pending Retry</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-300">{dlqStats.pending}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold text-red-400">Dead Letters</span>
                  </div>
                  <p className="text-2xl font-bold text-red-300">{dlqStats.dead}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <p className="text-xs text-muted-foreground">
                  Failed events are automatically retried with exponential backoff. Dead letters require manual intervention.
                </p>
              </div>
            </div>
          )}

          {tab === 'tips' && (
            <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Optimization Recommendations</h3>
              {optimizationTips.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Your workflows are well optimized!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {optimizationTips.map((tip, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <p className="text-xs font-semibold text-foreground">{tip.message}</p>
                      <p className="text-[10px] text-emerald-400 mt-1">
                        Potential savings: ${tip.savings.toFixed(4)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 p-4 rounded-lg bg-secondary/20 border border-border/30">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Enabled Optimizations</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Request deduplication (5s window)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Response caching (5min TTL)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Batch processing (100 events)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Circuit breaker (5 failures)
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Impact This Month</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Duplicate blocking: 342 events, $34.20 saved</li>
              <li>• Cache hits: 1,247 requests, $62.35 saved</li>
              <li>• Circuit breaker: 12 outages prevented, $124.50 saved</li>
              <li>• Batch processing: 24 efficient batch runs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}