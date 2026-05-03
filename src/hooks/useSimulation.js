import { useState, useCallback, useRef } from "react";

/**
 * Walks the workflow graph from trigger → end, visiting each node
 * in topological BFS order with a timed delay between steps.
 */
export function useSimulation(nodes, edges) {
  const [simState, setSimState] = useState("idle"); // idle | running | done | error
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [visitedEdgeIds, setVisitedEdgeIds] = useState([]);
  const [log, setLog] = useState([]);
  const cancelRef = useRef(false);

  const delay = (ms) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      // allow cancellation
      cancelRef.current && clearTimeout(t);
    });

  const addLog = (msg, type = "info") =>
    setLog((prev) => [...prev, { msg, type, ts: Date.now() }]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setSimState("idle");
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setVisitedNodeIds([]);
    setVisitedEdgeIds([]);
    setLog([]);
  }, []);

  const run = useCallback(async () => {
    if (nodes.length === 0) return;
    cancelRef.current = false;
    setSimState("running");
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setVisitedNodeIds([]);
    setVisitedEdgeIds([]);
    setLog([]);

    // Find starting node (trigger, or first node if none)
    const start = nodes.find((n) => n.type === "trigger") || nodes[0];
    addLog(`Starting simulation from "${start.label}"`, "info");

    let current = start;
    const visitedNodes = new Set();

    while (current && !cancelRef.current) {
      visitedNodes.add(current.id);
      setActiveNodeId(current.id);
      setVisitedNodeIds([...visitedNodes]);

      const stepMs = getStepDuration(current.type);
      addLog(getNodeLog(current), getLogType(current.type));

      await delay(stepMs);
      if (cancelRef.current) break;

      setActiveNodeId(null);

      // Find outgoing edges from this node
      const outEdges = edges.filter((e) => e.from === current.id);

      if (outEdges.length === 0) {
        addLog(`Flow ended at "${current.label}"`, "success");
        break;
      }

      // Pick first unvisited outgoing edge (avoid infinite loops)
      const nextEdge = outEdges.find((e) => !visitedNodes.has(e.to)) || outEdges[0];
      const nextNode = nodes.find((n) => n.id === nextEdge.to);

      if (!nextNode || visitedNodes.has(nextEdge.to)) {
        addLog(`No further path — flow complete.`, "success");
        break;
      }

      // Animate the edge
      setActiveEdgeId(nextEdge.id);
      setVisitedEdgeIds((prev) => [...prev, nextEdge.id]);
      await delay(400);
      if (cancelRef.current) break;
      setActiveEdgeId(null);

      current = nextNode;
    }

    if (!cancelRef.current) {
      setSimState("done");
      setActiveNodeId(null);
    }
  }, [nodes, edges]);

  return { simState, activeNodeId, activeEdgeId, visitedNodeIds, visitedEdgeIds, log, run, reset };
}

function getStepDuration(type) {
  const map = { trigger: 800, condition: 1000, llm: 1400, action: 1100, response: 900, end: 600 };
  return map[type] || 800;
}

function getNodeLog(node) {
  const labels = {
    trigger: `⚡ Trigger fired: "${node.label}"`,
    condition: `🔀 Evaluating condition: "${node.label}"`,
    llm: `🤖 LLM processing: "${node.label}"${node.config?.model ? ` [${node.config.model}]` : ""}`,
    action: `🔧 Executing action: "${node.label}"${node.config?.endpoint_url ? ` → ${node.config.endpoint_url}` : ""}`,
    response: `💬 Generating response: "${node.label}"`,
    end: `✅ End node reached: "${node.label}"`,
  };
  return labels[node.type] || `Processing "${node.label}"`;
}

function getLogType(type) {
  const map = { trigger: "trigger", llm: "llm", action: "action", condition: "condition", response: "response", end: "success" };
  return map[type] || "info";
}