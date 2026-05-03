export function validateWorkflow(nodes, edges) {
  const errors = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Check for orphaned nodes (no connections, except trigger/end)
  nodes.forEach((node) => {
    const hasIncoming = edges.some((e) => e.to === node.id);
    const hasOutgoing = edges.some((e) => e.from === node.id);
    const isTerminal = node.type === "trigger" || node.type === "end";

    if (!isTerminal && !hasIncoming && node.type !== "trigger") {
      errors.push({
        type: "disconnected",
        nodeId: node.id,
        message: `"${node.label}" has no incoming connection`,
      });
    }

    if (!isTerminal && !hasOutgoing && node.type !== "end") {
      errors.push({
        type: "disconnected",
        nodeId: node.id,
        message: `"${node.label}" has no outgoing connection`,
      });
    }
  });

  // Check for missing required configs per node type
  nodes.forEach((node) => {
    const required = getRequiredFields(node.type);
    const missing = required.filter((field) => !node.config?.[field]);

    if (missing.length > 0) {
      errors.push({
        type: "missing_config",
        nodeId: node.id,
        message: `"${node.label}" missing: ${missing.join(", ")}`,
      });
    }
  });

  // Check for broken edge references
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) {
      errors.push({
        type: "broken_edge",
        edgeId: edge.id,
        message: `Connection "${edge.id}" references missing nodes`,
      });
    }
  });

  // Check for trigger node existence
  if (!nodes.some((n) => n.type === "trigger")) {
    errors.push({
      type: "no_trigger",
      message: "Workflow must start with a Trigger node",
    });
  }

  // Check for end node existence
  if (!nodes.some((n) => n.type === "end")) {
    errors.push({
      type: "no_end",
      message: "Workflow must end with an End node",
    });
  }

  return errors;
}

function getRequiredFields(nodeType) {
  const required = {
    trigger: ["voice_phrase"],
    condition: ["condition_expression"],
    action: ["endpoint_url", "http_method"],
    response: ["response_template"],
    llm: ["system_prompt"],
    variable: ["variable_name"],
    end: [],
  };
  return required[nodeType] || [];
}