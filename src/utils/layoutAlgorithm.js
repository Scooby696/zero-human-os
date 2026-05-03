export function layoutNodes(nodes, edges) {
  if (nodes.length === 0) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjacency = new Map();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => {
    if (adjacency.has(e.from)) adjacency.get(e.from).push(e.to);
  });

  // Find layers using BFS from trigger nodes
  const layers = new Map();
  const visited = new Set();

  function assignLayers(nodeId, layer) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer).push(nodeId);

    const children = adjacency.get(nodeId) || [];
    children.forEach((childId) => assignLayers(childId, layer + 1));
  }

  // Start from trigger nodes
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  if (triggerNodes.length > 0) {
    triggerNodes.forEach((n) => assignLayers(n.id, 0));
  } else {
    // Fallback: start from first node
    assignLayers(nodes[0].id, 0);
  }

  // Assign remaining unvisited nodes
  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      assignLayers(n.id, 0);
    }
  });

  // Calculate positions based on layers
  const nodeWidth = 176; // w-44
  const nodeHeight = 48; // approximate
  const horizontalSpacing = 240;
  const verticalSpacing = 160;

  const positions = new Map();
  let maxWidth = 0;

  for (const [layer, nodeIds] of layers) {
    const layerSize = nodeIds.length;
    maxWidth = Math.max(maxWidth, layerSize);

    nodeIds.forEach((nodeId, index) => {
      const x = index * horizontalSpacing - (layerSize * horizontalSpacing) / 2 + horizontalSpacing / 2;
      const y = layer * verticalSpacing;
      positions.set(nodeId, { x, y });
    });
  }

  // Return updated nodes with new positions
  return nodes.map((node) => {
    const pos = positions.get(node.id);
    return pos ? { ...node, x: pos.x + 400, y: pos.y + 100 } : node;
  });
}