/**
 * Workflow Optimizer - Detects optimization opportunities
 */

export function analyzeWorkflow(nodes, edges) {
  const issues = [];
  const optimizations = [];

  // Check for sequential independent branches
  const findIndependentBranches = () => {
    const outgoing = {};
    for (const node of nodes) {
      outgoing[node.id] = edges.filter((e) => e.from === node.id).map((e) => e.to);
    }

    // Find nodes with multiple outgoing edges to independent branches
    for (const nodeId in outgoing) {
      if (outgoing[nodeId].length > 1) {
        optimizations.push({
          type: 'parallelization',
          nodeId,
          message: 'This node has independent branches that can run in parallel',
          impact: 'Could reduce total execution time by 30-50%',
        });
      }
    }
  };

  // Check for expensive node patterns
  const findExpensivePatterns = () => {
    let llmCount = 0;
    for (const node of nodes) {
      if (node.type === 'llm' || node.type === 'agent') {
        llmCount++;
      }
    }

    if (llmCount > 3) {
      optimizations.push({
        type: 'redundant_ai',
        count: llmCount,
        message: `Workflow uses ${llmCount} expensive AI nodes. Consider consolidating.`,
        impact: 'Could save 20-40% on execution costs',
      });
    }
  };

  // Check for unreachable nodes
  const findUnreachableNodes = () => {
    const reachable = new Set();
    const startNodes = nodes.filter((n) => n.type === 'trigger' || n.type === 'webhook_trigger');

    const traverse = (nodeId) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      const nextEdges = edges.filter((e) => e.from === nodeId);
      for (const edge of nextEdges) {
        traverse(edge.to);
      }
    };

    for (const node of startNodes) {
      traverse(node.id);
    }

    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        issues.push({
          type: 'unreachable_node',
          nodeId: node.id,
          message: 'This node is unreachable from any trigger',
        });
      }
    }
  };

  findIndependentBranches();
  findExpensivePatterns();
  findUnreachableNodes();

  return { issues, optimizations };
}

export function generateOptimizationPlan(nodes, edges) {
  const analysis = analyzeWorkflow(nodes, edges);
  const plan = [];

  for (const opt of analysis.optimizations) {
    plan.push({
      priority: opt.type === 'parallelization' ? 'high' : 'medium',
      ...opt,
    });
  }

  for (const issue of analysis.issues) {
    plan.push({
      priority: 'critical',
      action: 'fix',
      ...issue,
    });
  }

  return plan.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}