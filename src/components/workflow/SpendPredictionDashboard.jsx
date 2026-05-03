import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Zap, DollarSign, Target, Lightbulb } from 'lucide-react';
import { executionPatternAnalyzer } from '@/utils/executionPatternAnalyzer';
import { spendPredictor } from '@/utils/spendPredictor';
import { costRecommendationEngine } from '@/utils/costRecommendationEngine';

function RecommendationCard({ rec, index }) {
  const priorityColor = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    low: 'text-blue-400 bg-blue-400/10',
  };

  const priorityClass = priorityColor[rec.priority] || priorityColor.low;

  if (rec.recommendedModel) {
    // Model switch recommendation
    return (
      <div className="p-3 rounded-lg bg-card border border-border/30 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">Model Switch</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {rec.currentModel} → {rec.recommendedModel}
            </p>
          </div>
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${priorityClass}`}>
            {rec.priority}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div>
            <p className="text-muted-foreground/70">Current Cost</p>
            <p className="font-bold text-foreground">${rec.currentCostPerExecution}</p>
          </div>
          <div>
            <p className="text-muted-foreground/70">Recommended</p>
            <p className="font-bold text-emerald-400">${rec.recommendedCostPerExecution}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border/20">
          <p className="text-[9px] text-emerald-400 font-semibold">
            💰 Monthly Savings: ${rec.monthlySavings}
          </p>
        </div>
      </div>
    );
  }

  if (rec.parallelizableNodes) {
    // Parallelization recommendation
    return (
      <div className="p-3 rounded-lg bg-card border border-border/30 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">Parallelization</p>
            <p className="text-[10px] text-muted-foreground mt-1">Workflow {rec.workflowId}</p>
          </div>
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${priorityClass}`}>
            {rec.priority}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div>
            <p className="text-muted-foreground/70">Time Reduction</p>
            <p className="font-bold text-foreground">{rec.estimatedTimeReduction}</p>
          </div>
          <div>
            <p className="text-muted-foreground/70">Cost Reduction</p>
            <p className="font-bold text-emerald-400">{rec.estimatedCostReduction}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border/20">
          <p className="text-[9px] text-emerald-400 font-semibold">
            ⚡ Monthly Savings: ${rec.monthlySavings}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function SpendPredictionDashboard() {
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeAndPredict();
    const interval = setInterval(analyzeAndPredict, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const analyzeAndPredict = () => {
    setLoading(true);

    // Simulate some execution history for demo
    const mockHistory = generateMockExecutionHistory();
    mockHistory.forEach((exec) => executionPatternAnalyzer.recordExecution(exec));

    const history = executionPatternAnalyzer.getExecutionHistory();
    const patterns = executionPatternAnalyzer.analyzeNodeTypePatterns();
    const pred = spendPredictor.predictMonthlySpend(history, 30);
    setPatterns(patterns);
    setPrediction(pred);

    // Generate recommendations
    const modelRecs = costRecommendationEngine.generateModelSwitchRecommendations(patterns);
    const parallelRecs = costRecommendationEngine.generateParallelizationRecommendations(history);
    const allRecs = [...modelRecs, ...parallelRecs];
    const prioritized = costRecommendationEngine.prioritizeRecommendations(allRecs);

    setRecommendations(prioritized);
    setLoading(false);
  };

  const generateMockExecutionHistory = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      nodeType: ['llm', 'agent', 'action', 'condition'].sort(() => Math.random() - 0.5)[0],
      cost: Math.random() * 0.1,
      duration: Math.random() * 1000 + 100,
      status: Math.random() > 0.95 ? 'failed' : 'success',
      modelVariant: Math.random() > 0.5 ? 'gpt-4o-mini' : 'gpt-4o',
      timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    }));
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
        <p className="text-xs text-muted-foreground">Analyzing patterns...</p>
      </div>
    );
  }

  const warnings = prediction ? spendPredictor.generateSpendWarnings(prediction, 500) : [];

  return (
    <div className="space-y-4">
      {/* Spend Prediction */}
      {prediction && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">30-Day Spend Forecast</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                prediction.confidence === 'high'
                  ? 'bg-green-400/20 text-green-400'
                  : prediction.confidence === 'medium'
                    ? 'bg-amber-400/20 text-amber-400'
                    : 'bg-red-400/20 text-red-400'
              }`}
            >
              {prediction.confidence.toUpperCase()} CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-2 rounded-lg bg-background/50">
              <p className="text-[9px] text-muted-foreground/70">Predicted Spend</p>
              <p className="text-lg font-bold text-primary">${prediction.predictedMonthlySpend}</p>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <p className="text-[9px] text-muted-foreground/70">Avg Daily</p>
              <p className="text-lg font-bold text-foreground">${prediction.avgDailySpend}</p>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <p className="text-[9px] text-muted-foreground/70">Trend</p>
              <p className={`text-lg font-bold ${parseFloat(prediction.trend) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {parseFloat(prediction.trend) > 0 ? '+' : ''}{prediction.trend}
              </p>
            </div>
          </div>

          {/* Breakdown by node type */}
          <div className="pt-2 border-t border-primary/20">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Cost Breakdown</p>
            <div className="space-y-1">
              {Object.entries(prediction.breakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([nodeType, cost]) => (
                  <div key={nodeType} className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground capitalize">{nodeType}</span>
                    <span className="font-semibold text-foreground">${(cost * 30).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                warning.severity === 'high'
                  ? 'bg-red-400/10 border-red-400/30'
                  : 'bg-amber-400/10 border-amber-400/30'
              }`}
            >
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${warning.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-xs font-semibold ${warning.severity === 'high' ? 'text-red-300' : 'text-amber-300'}`}>
                  {warning.message}
                </p>
                <p className="text-[9px] text-muted-foreground/70 mt-1">{warning.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">Cost Optimization Recommendations</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recommendations.slice(0, 6).map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
          {recommendations.length > 6 && (
            <p className="text-[9px] text-muted-foreground/50">
              +{recommendations.length - 6} more recommendations available
            </p>
          )}
        </div>
      )}

      {/* Summary Impact */}
      {recommendations.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/30">
          <p className="text-[9px] font-bold text-emerald-400 uppercase">💰 Total Monthly Savings Opportunity</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">
            $
            {recommendations
              .reduce((sum, rec) => sum + parseFloat(rec.monthlySavings || 0), 0)
              .toFixed(2)}
          </p>
          <p className="text-[9px] text-emerald-400/70 mt-1">
            Potential reduction: {((recommendations.length / 5) * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
}