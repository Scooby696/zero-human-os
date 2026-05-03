/**
 * Cost Budget Manager - Tracks costs against budgets with alerts
 */

export function createCostBudgetManager() {
  const budgets = new Map();
  const costs = new Map();
  const alerts = [];

  const setBudget = (workflowId, dailyLimit, monthlyLimit = dailyLimit * 30) => {
    budgets.set(workflowId, { dailyLimit, monthlyLimit });
    costs.set(workflowId, { daily: 0, monthly: 0, lastReset: Date.now() });
  };

  const recordCost = (workflowId, amount) => {
    if (!costs.has(workflowId)) {
      costs.set(workflowId, { daily: 0, monthly: 0, lastReset: Date.now() });
    }

    const cost = costs.get(workflowId);
    cost.daily += amount;
    cost.monthly += amount;

    const budget = budgets.get(workflowId);
    if (!budget) return { allowed: true };

    const dailyExceeded = cost.daily > budget.dailyLimit;
    const monthlyExceeded = cost.monthly > budget.monthlyLimit;

    if (dailyExceeded || monthlyExceeded) {
      alerts.push({
        workflowId,
        type: dailyExceeded ? 'daily' : 'monthly',
        exceeded: true,
        current: dailyExceeded ? cost.daily : cost.monthly,
        limit: dailyExceeded ? budget.dailyLimit : budget.monthlyLimit,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      allowed: !dailyExceeded && !monthlyExceeded,
      dailyExceeded,
      monthlyExceeded,
    };
  };

  const getStatus = (workflowId) => {
    const budget = budgets.get(workflowId);
    const cost = costs.get(workflowId);
    if (!budget || !cost) return null;

    return {
      daily: { spent: cost.daily, limit: budget.dailyLimit, percent: (cost.daily / budget.dailyLimit) * 100 },
      monthly: { spent: cost.monthly, limit: budget.monthlyLimit, percent: (cost.monthly / budget.monthlyLimit) * 100 },
    };
  };

  const resetDaily = () => {
    for (const cost of costs.values()) {
      cost.daily = 0;
    }
  };

  const resetMonthly = () => {
    for (const cost of costs.values()) {
      cost.monthly = 0;
    }
  };

  return { setBudget, recordCost, getStatus, resetDaily, resetMonthly, alerts };
}

export const budgetManager = createCostBudgetManager();