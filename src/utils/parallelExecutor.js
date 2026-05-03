/**
 * Parallel Executor - Executes workflow nodes in parallel when possible
 * Manages concurrent execution and dependency resolution
 */

export function createParallelExecutor() {
  const executionLog = [];
  let executionId = 0;

  const executeNode = async (node, context = {}) => {
    const startTime = Date.now();

    try {
      // Simulate node execution
      const result = await simulateNodeExecution(node, context);
      const duration = Date.now() - startTime;

      return {
        nodeId: node.id,
        status: 'success',
        result,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        nodeId: node.id,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const simulateNodeExecution = async (node, context) => {
    // Simulate different node types with different execution times
    const delays = {
      trigger: 10,
      condition: 20,
      llm: 500,
      agent: 800,
      action: 200,
      response: 50,
      webhook_trigger: 10,
      webhook_action: 150,
      error_handler: 30,
      cost_estimator: 40,
      end: 10,
    };

    const delay = delays[node.type] || 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return {
      nodeId: node.id,
      nodeType: node.type,
      output: {
        message: `${node.label} executed successfully`,
        timestamp: Date.now(),
      },
    };
  };

  const executeNodesInParallel = async (nodeIds, nodes, context = {}) => {
    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const nodesToExecute = nodeIds.map((id) => nodeMap[id]);

    const startTime = Date.now();
    const results = await Promise.all(nodesToExecute.map((node) => executeNode(node, context)));

    const duration = Date.now() - startTime;

    return {
      parallelExecutionId: executionId++,
      nodeIds,
      results,
      duration,
      parallelismLevel: nodeIds.length,
      speedupFactor: calculateSpeedup(results),
    };
  };

  const calculateSpeedup = (results) => {
    const totalSequentialTime = results.reduce((sum, r) => sum + r.duration, 0);
    const parallelTime = Math.max(...results.map((r) => r.duration));

    if (parallelTime === 0) return 1;
    return (totalSequentialTime / parallelTime).toFixed(2);
  };

  const executeBatches = async (batches, nodes, context = {}) => {
    const allResults = [];
    let totalTime = 0;
    let totalSpeedup = 0;

    for (const batch of batches) {
      if (batch.type === 'parallel_branches') {
        for (const branch of batch.branches) {
          const result = await executeNodesInParallel(branch, nodes, context);
          allResults.push(result);
          totalTime += result.duration;
          totalSpeedup += parseFloat(result.speedupFactor);
        }
      }
    }

    return {
      batches: allResults,
      totalTime,
      averageSpeedup: (totalSpeedup / Math.max(allResults.length, 1)).toFixed(2),
    };
  };

  return {
    executeNode,
    executeNodesInParallel,
    executeBatches,
    executionLog,
  };
}

export const parallelExecutor = createParallelExecutor();