import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertCircle, CheckCircle, DollarSign, Zap } from 'lucide-react';
import { estimateWorkflowCost, compareWorkflowVersions } from '@/utils/costEstimator';

export default function CostEstimatorPanel({ nodes, edges, onClose }) {
  const [cost, setCost] = useState(null);
  const [dailyVolume, setDailyVolume] = useState(100);
  const [budgetLimit, setBudgetLimit] = useState(1000);
  const [optimizations, setOptimizations] = useState([]);

  useEffect(() => {
    const estimated = estimateWorkflowCost(nodes, edges);
    setCost(estimated);

    // Generate optimization suggestions
    const tips = [];
    const expensiveNodes = Object.entries(estimated.perNode)
      .map(([id, data]) => ({ id, ...data }))
      .filter((n) => n.cost > 0.05);

    if (expensiveNodes.length > 0) {
      tips.push({
        type: 'expensive',
        message: `Found ${expensiveNodes.length} expensive nodes. Consider using cheaper models.`,
        savings: expensiveNodes.length * 0.02,
      });
    }

    if (nodes.filter((n) => n.type === 'llm').length > 3) {
      tips.push({
        type: 'redundant_llm',
        message: 'Multiple LLM nodes detected. Consolidate where possible.',
        savings: 0.05,
      });
    }

    setOptimizations(tips);
  }, [nodes, edges]);

  if (!cost) return null;

  const dailyCost = cost.total * dailyVolume;
  const monthlyCost = dailyCost * 30;
  const overBudget = monthlyCost > budgetLimit;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-30 overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20 shrink-0">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Cost Estimator</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cost Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-[9px] font-bold text-primary uppercase mb-1">Per Execution</p>
            <p className="text-lg font-bold text-foreground">${cost.total.toFixed(4)}</p>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              overBudget
                ? 'bg-red-400/10 border-red-400/20'
                : 'bg-green-400/10 border-green-400/20'
            }`}
          >
            <p className={`text-[9px] font-bold uppercase ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
              Monthly
            </p>
            <p className={`text-lg font-bold ${overBudget ? 'text-red-300' : 'text-green-300'}`}>
              ${monthlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Projections */}
        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Daily Volume (events)
            </label>
            <input
              type="number"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(parseInt(e.target.value) || 100)}
              className="w-full px-2 py-1 text-xs bg-background border border-border/50 rounded focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Budget Limit ($)
            </label>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 1000)}
              className="w-full px-2 py-1 text-xs bg-background border border-border/50 rounded focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Budget Status */}
        {overBudget && (
          <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300">
              Monthly cost exceeds budget by ${(monthlyCost - budgetLimit).toFixed(2)}
            </p>
          </div>
        )}

        {/* Optimizations */}
        {optimizations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground">Optimization Tips</h4>
            {optimizations.map((opt, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                <p className="text-[9px] text-amber-300">{opt.message}</p>
                <p className="text-[8px] text-amber-400 mt-1">
                  Potential savings: ${opt.savings.toFixed(4)}/execution
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground">Cost Breakdown</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(cost.perNode)
              .map(([id, data]) => ({ id, ...data }))
              .sort((a, b) => b.cost - a.cost)
              .map((node) => (
                <div key={node.id} className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground font-mono truncate">{node.type}</span>
                  <span className="font-bold text-foreground">${node.cost.toFixed(4)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40 bg-secondary/10 text-[10px] text-muted-foreground/70 shrink-0">
        Estimates based on current workflow structure • Update daily volume for accurate projections
      </div>
    </div>
  );
}