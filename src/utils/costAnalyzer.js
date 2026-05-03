import { AVAILABLE_AGENTS } from "./agentRegistry";

export function analyzePaidAgentViability(walletBalance, agents, executionFrequency = 1) {
  // Calculate total cost basis
  const paidAgents = agents.filter((a) => a.type === "agent" && a.config?.agent_id);
  const agentCosts = paidAgents.map((agent) => {
    const agentDef = AVAILABLE_AGENTS.find((a) => a.id === agent.config.agent_id);
    return {
      agentId: agent.id,
      agentName: agent.label,
      costPerCall: agentDef?.cost || 0,
      costPerDay: (agentDef?.cost || 0) * executionFrequency,
      costPer30Days: (agentDef?.cost || 0) * executionFrequency * 30,
    };
  });

  const totalCostPerCall = agentCosts.reduce((sum, a) => sum + a.costPerCall, 0);
  const totalCostPerDay = agentCosts.reduce((sum, a) => sum + a.costPerDay, 0);
  const totalCostPer30Days = agentCosts.reduce((sum, a) => sum + a.costPer30Days, 0);

  // Calculate viability
  const daysOfFunding = totalCostPerDay > 0 ? Math.floor(walletBalance / totalCostPerDay) : Infinity;
  const isViable = walletBalance > totalCostPerCall && daysOfFunding > 0;

  return {
    isViable,
    status: isViable ? "viable" : "insufficient-funds",
    walletBalance,
    totalCostPerCall,
    totalCostPerDay,
    totalCostPer30Days,
    daysOfFunding,
    agents: agentCosts,
    recommendation:
      isViable && daysOfFunding > 30
        ? "✓ Sufficient funds for long-term use"
        : isViable && daysOfFunding > 7
        ? "⚠ Adequate for short-term, consider refunding soon"
        : "✗ Insufficient funds, schedule refund",
  };
}

export function calculateROI(earnings, totalSpent) {
  if (totalSpent === 0) return 0;
  return Math.round(((earnings - totalSpent) / totalSpent) * 100);
}