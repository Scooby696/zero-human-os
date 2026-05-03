/**
 * Cost Estimator - Pre-calculates execution cost before running workflows
 */

const NODE_COSTS = {
  trigger: 0,
  condition: 0.001,
  llm: 0.05,
  agent: 0.1,
  action: 0.005,
  response: 0.001,
  webhook_trigger: 0,
  webhook_action: 0.002,
  error_handler: 0.001,
  end: 0,
};

export function estimateWorkflowCost(nodes, edges) {
  let totalCost = 0;
  let breakdown = {};

  for (const node of nodes) {
    const nodeCost = NODE_COSTS[node.type] || 0.01;
    totalCost += nodeCost;
    breakdown[node.id] = { type: node.type, cost: nodeCost };
  }

  // Add cost for edges (data transfer)
  totalCost += edges.length * 0.0005;

  return {
    total: parseFloat(totalCost.toFixed(6)),
    perNode: breakdown,
    edgeCost: parseFloat((edges.length * 0.0005).toFixed(6)),
  };
}

export function estimateExecutionPath(nodes, edges, startNodeId, conditions = {}) {
  const visited = new Set();
  let cost = 0;
  const path = [];

  const traverse = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodeCost = NODE_COSTS[node.type] || 0.01;
    cost += nodeCost;
    path.push(node.id);

    // Find next edges
    const nextEdges = edges.filter((e) => e.from === nodeId);
    for (const edge of nextEdges) {
      traverse(edge.to);
    }
  };

  traverse(startNodeId);

  return {
    path,
    estimatedCost: parseFloat(cost.toFixed(6)),
    nodeCount: visited.size,
  };
}

export function compareWorkflowVersions(nodesA, edgesA, nodesB, edgesB) {
  const costA = estimateWorkflowCost(nodesA, edgesA);
  const costB = estimateWorkflowCost(nodesB, edgesB);

  return {
    versionA: costA.total,
    versionB: costB.total,
    savings: parseFloat((costA.total - costB.total).toFixed(6)),
    percentDiff: parseFloat(((costB.total - costA.total) / costA.total * 100).toFixed(2)),
    cheaper: costB.total < costA.total ? 'B' : 'A',
  };
}