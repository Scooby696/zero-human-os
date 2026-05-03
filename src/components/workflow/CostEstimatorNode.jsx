import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { estimateWorkflowCost, estimateExecutionPath, compareWorkflowVersions } from '@/utils/costEstimator';

export default function CostEstimatorNode({ node, nodes, edges, onUpdateNode }) {
  const [showDetail, setShowDetail] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [pathCosts, setPathCosts] = useState([]);

  useEffect(() => {
    const cost = estimateWorkflowCost(nodes, edges);
    setCostBreakdown(cost);

    // Calculate costs for paths starting from different triggers
    const triggers = nodes.filter((n) => n.type === 'trigger' || n.type === 'webhook_trigger');
    const paths = triggers.map((t) => estimateExecutionPath(nodes, edges, t.id));
    setPathCosts(paths);
  }, [nodes, edges]);

  const config = node.config || {};
  const projectedVolume = parseInt(config.daily_volume) || 100;
  const targetBudget = parseFloat(config.target_budget) || 100;

  if (!costBreakdown) return null;

  const dailyCost = costBreakdown.total * projectedVolume;
  const monthlyCost = dailyCost * 30;
  const budgetStatus =
    monthlyCost > targetBudget ? 'over' : monthlyCost > targetBudget * 0.8 ? 'warning' : 'ok';

  const recommendations = [];
  if (monthlyCost > targetBudget) {
    recommendations.push({
      type: 'budget_exceeded',
      message: `Monthly cost ($${monthlyCost.toFixed(2)}) exceeds budget ($${targetBudget})`,
      severity: 'critical',
    });
  }

  const expensiveNodes = Object.entries(costBreakdown.perNode)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);

  if (expensiveNodes.some((n) => n.cost > 0.05)) {
    recommendations.push({
      type: 'expensive_nodes',
      message: `${expensiveNodes[0].type} nodes are expensive. Consider using cheaper alternatives.`,
      severity: 'warning',
    });
  }

  return (
    <div className="w-full space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[9px] font-bold text-primary uppercase">Per Execution</p>
          <p className="text-sm font-bold text-foreground">${costBreakdown.total.toFixed(4)}</p>
        </div>
        <div
          className={`p-2 rounded-lg border ${
            budgetStatus === 'over'
              ? 'bg-red-400/10 border-red-400/20'
              : budgetStatus === 'warning'
                ? 'bg-amber-400/10 border-amber-400/20'
                : 'bg-green-400/10 border-green-400/20'
          }`}
        >
          <p className="text-[9px] font-bold uppercase">Monthly Cost</p>
          <p
            className={`text-sm font-bold ${budgetStatus === 'over' ? 'text-red-400' : budgetStatus === 'warning' ? 'text-amber-400' : 'text-green-400'}`}
          >
            ${monthlyCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Config inputs */}
      <div className="space-y-2">
        <div>
          <label className="text-[9px] font-semibold text-muted-foreground mb-1 block">
            Daily Volume (events)
          </label>
          <input
            type="number"
            value={config.daily_volume || 100}
            onChange={(e) => onUpdateNode(node.id, { config: { ...config, daily_volume: e.target.value } })}
            className="w-full px-2 py-1 text-xs bg-background border border-border/50 rounded focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-[9px] font-semibold text-muted-foreground mb-1 block">
            Target Budget ($)
          </label>
          <input
            type="number"
            value={config.target_budget || 100}
            onChange={(e) => onUpdateNode(node.id, { config: { ...config, target_budget: e.target.value } })}
            className="w-full px-2 py-1 text-xs bg-background border border-border/50 rounded focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-1">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border text-[9px] ${
                rec.severity === 'critical'
                  ? 'bg-red-400/10 border-red-400/20 text-red-300'
                  : 'bg-amber-400/10 border-amber-400/20 text-amber-300'
              }`}
            >
              {rec.message}
            </div>
          ))}
        </div>
      )}

      {/* Detailed view toggle */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="w-full px-2 py-1 text-[9px] font-semibold text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
      >
        {showDetail ? 'Hide Details' : 'Show Details'}
      </button>

      {/* Detailed breakdown */}
      {showDetail && (
        <div className="space-y-2 p-2 rounded-lg bg-secondary/30 border border-border/20">
          <p className="text-[9px] font-bold text-foreground">Cost by Node Type</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {expensiveNodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between text-[8px]">
                <span className="text-muted-foreground font-mono">{node.type}</span>
                <span className="font-bold text-foreground">${node.cost.toFixed(4)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 pt-2 mt-2">
            <p className="text-[9px] font-bold text-foreground mb-1">Execution Paths</p>
            {pathCosts.map((path, i) => (
              <div key={i} className="flex items-center justify-between text-[8px] mb-1">
                <span className="text-muted-foreground">Path {i + 1}</span>
                <span className="font-bold text-foreground">${path.estimatedCost.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}