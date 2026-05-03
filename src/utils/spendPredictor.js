/**
 * Spend Predictor - Forecasts monthly spend based on execution patterns
 * Uses linear regression and seasonal analysis
 */

export function createSpendPredictor() {
  const predictMonthlySpend = (executionHistory, daysToProject = 30) => {
    if (executionHistory.length < 7) {
      return {
        predictedMonthlySpend: 0,
        confidence: 'low',
        message: 'Insufficient data for prediction',
        breakdown: {},
      };
    }

    // Calculate daily spend
    const dailySpend = {};
    executionHistory.forEach((exec) => {
      const date = new Date(exec.timestamp).toLocaleDateString();
      dailySpend[date] = (dailySpend[date] || 0) + (exec.cost || 0);
    });

    const spendValues = Object.values(dailySpend);
    const avgDailySpend = spendValues.reduce((a, b) => a + b, 0) / spendValues.length;
    const trend = calculateTrend(spendValues);

    // Forecast using linear regression with trend
    const projectedDailySpend = avgDailySpend + trend * (daysToProject / 2);
    const predictedMonthlySpend = (projectedDailySpend * daysToProject).toFixed(2);

    // Calculate confidence based on variance
    const variance = spendValues.reduce((sum, val) => sum + Math.pow(val - avgDailySpend, 2), 0) / spendValues.length;
    const stdDev = Math.sqrt(variance);
    const confidence = stdDev < avgDailySpend * 0.3 ? 'high' : stdDev < avgDailySpend * 0.6 ? 'medium' : 'low';

    // Breakdown by node type
    const breakdown = {};
    executionHistory.forEach((exec) => {
      const nodeType = exec.nodeType || 'unknown';
      breakdown[nodeType] = (breakdown[nodeType] || 0) + (exec.cost || 0);
    });

    return {
      predictedMonthlySpend,
      avgDailySpend: avgDailySpend.toFixed(4),
      trend: trend.toFixed(6),
      confidence,
      breakdown,
      variance: variance.toFixed(6),
      stdDev: stdDev.toFixed(4),
    };
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const predictCostByNodeType = (patterns, daysToProject = 30) => {
    const predictions = {};

    Object.entries(patterns).forEach(([nodeType, data]) => {
      const dailyCount = data.count / 30; // Estimate daily count
      const projectedCount = dailyCount * daysToProject;
      const projectedCost = (projectedCount * data.avgCost).toFixed(4);

      predictions[nodeType] = {
        nodeType,
        projectedExecutions: Math.round(projectedCount),
        avgCostPerExecution: data.avgCost.toFixed(6),
        projectedCost,
        contribution: ((projectedCost / 100) * 100).toFixed(2) + '%',
      };
    });

    return predictions;
  };

  const generateSpendWarnings = (prediction, threshold = 1000) => {
    const warnings = [];

    if (parseFloat(prediction.predictedMonthlySpend) > threshold) {
      warnings.push({
        severity: 'high',
        message: `Projected spend ($${prediction.predictedMonthlySpend}) exceeds budget threshold ($${threshold})`,
        recommendation: 'Consider enabling cost optimizations or switching to cheaper model variants',
      });
    }

    if (prediction.trend > 0.1) {
      warnings.push({
        severity: 'medium',
        message: 'Spending trend is increasing',
        recommendation: 'Monitor execution patterns and consider implementing cost controls',
      });
    }

    if (prediction.confidence === 'low') {
      warnings.push({
        severity: 'medium',
        message: 'Low confidence in prediction due to high variance',
        recommendation: 'Collect more execution data for better forecasting',
      });
    }

    return warnings;
  };

  return {
    predictMonthlySpend,
    predictCostByNodeType,
    generateSpendWarnings,
    calculateTrend,
  };
}

export const spendPredictor = createSpendPredictor();