/**
 * Workflow Graph Analyzer - Identifies parallel execution opportunities
 * Detects independent branches and dependency chains
 */

export function analyzeWorkflowGraph(nodes, edges) {
  // Build adjacency lists
  const outgoing = {};
  const incoming = {};

  nodes.forEach((node) => {
    outgoing[node.id] = [];
    incoming[node.id] = [];
  });

  edges.forEach((edge) => {
    outgoing[edge.from].push(edge.to);
    incoming[edge.to].push(edge.from);
  });

  // Find all trigger nodes (entry points)
  const triggerNodes = nodes.filter((n) => n.type === 'trigger' || n.type === 'webhook_trigger');

  // Find all independent branches starting from a node
  const findIndependentBranches = (nodeId, visited = new Set()) => {
    const branches = [];
    const nextNodes = outgoing[nodeId] || [];

    for (const nextId of nextNodes) {
      if (!visited.has(nextId)) {
        const branch = traverseBranch(nextId, visited);
        if (branch.length > 0) {
          branches.push(branch);
        }
      }
    }

    return branches;
  };

  const traverseBranch = (nodeId, visited = new Set()) => {
    const branch = [];
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;

      visited.add(current);
      branch.push(current);

      const next = outgoing[current] || [];
      queue.push(...next);
    }

    return branch;
  };

  // Find convergence points (nodes with multiple incoming edges)
  const findConvergencePoints = () => {
    return nodes
      .filter((n) => incoming[n.id].length > 1)
      .map((n) => ({ nodeId: n.id, incomingEdges: incoming[n.id].length }));
  };

  // Find all execution paths
  const getAllPaths = () => {
    const paths = [];

    for (const trigger of triggerNodes) {
      const paths_from_trigger = findAllPathsFrom(trigger.id, outgoing);
      paths.push(...paths_from_trigger);
    }

    return paths;
  };

  const findAllPathsFrom = (nodeId, outgoing, visited = new Set(), path = []) => {
    path = [...path, nodeId];
    visited.add(nodeId);

    const nextNodes = outgoing[nodeId] || [];

    if (nextNodes.length === 0) {
      return [path];
    }

    const allPaths = [];
    for (const next of nextNodes) {
      if (!visited.has(next)) {
        allPaths.push(...findAllPathsFrom(next, outgoing, new Set(visited), path));
      }
    }

    return allPaths.length > 0 ? allPaths : [path];
  };

  // Group nodes into parallel execution batches
  const getParallelBatches = () => {
    const batches = [];
    const processed = new Set();

    for (const trigger of triggerNodes) {
      const branches = findIndependentBranches(trigger.id);

      if (branches.length > 1) {
        // Multiple independent branches can run in parallel
        batches.push({
          type: 'parallel_branches',
          branches,
          trigger: trigger.id,
          parallelismLevel: branches.length,
        });
      }
    }

    return batches;
  };

  const convergencePoints = findConvergencePoints();
  const paths = getAllPaths();
  const parallelBatches = getParallelBatches();

  return {
    outgoing,
    incoming,
    triggerNodes: triggerNodes.map((n) => n.id),
    convergencePoints,
    paths,
    parallelBatches,
    parallelismPotential: parallelBatches.reduce((sum, b) => sum + b.parallelismLevel, 0),
  };
}

// Check if two nodes are independent (no shared dependencies)
export function areNodesIndependent(nodeA, nodeB, graph) {
  const ancestorsA = getAncestors(nodeA, graph.incoming);
  const ancestorsB = getAncestors(nodeB, graph.incoming);

  // Check if they share any common ancestor
  return !ancestorsA.some((a) => ancestorsB.includes(a));
}

// Get all nodes that must execute before this node
export function getAncestors(nodeId, incoming, visited = new Set()) {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const ancestors = [...(incoming[nodeId] || [])];
  for (const parent of incoming[nodeId] || []) {
    ancestors.push(...getAncestors(parent, incoming, visited));
  }

  return ancestors;
}

// Get all nodes that depend on this node
export function getDescendants(nodeId, outgoing, visited = new Set()) {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const descendants = [...(outgoing[nodeId] || [])];
  for (const child of outgoing[nodeId] || []) {
    descendants.push(...getDescendants(child, outgoing, visited));
  }

  return descendants;
}