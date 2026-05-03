import React, { useState } from "react";

function getBezierPath(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const cx = dx * 0.5;
  return `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`;
}

function Edge({ edge, nodes, onDeleteEdge }) {
  const [hovered, setHovered] = useState(false);
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  const x1 = from.x + 176; // right dot
  const y1 = from.y + 24;
  const x2 = to.x - 7;     // left dot
  const y2 = to.y + 24;

  const path = getBezierPath(x1, y1, x2, y2);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      {/* Wider invisible hit area */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ cursor: "pointer", pointerEvents: "stroke" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke={hovered ? "hsl(var(--destructive))" : "hsl(var(--primary)/0.5)"}
        strokeWidth={hovered ? 2.5 : 1.5}
        strokeDasharray={hovered ? "none" : "none"}
        markerEnd="url(#arrow)"
        style={{ pointerEvents: "none", transition: "stroke 0.15s" }}
      />
      {/* Delete button on hover */}
      {hovered && (
        <g
          transform={`translate(${midX}, ${midY})`}
          style={{ cursor: "pointer", pointerEvents: "all" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onDeleteEdge(edge.id)}
        >
          <circle r="9" fill="hsl(var(--destructive))" opacity="0.9" />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">×</text>
        </g>
      )}
    </g>
  );
}

export default function WorkflowEdges({ edges, nodes, onDeleteEdge }) {
  return (
    <>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="hsl(var(--primary)/0.6)" />
        </marker>
      </defs>
      {edges.map((edge) => (
        <Edge key={edge.id} edge={edge} nodes={nodes} onDeleteEdge={onDeleteEdge} />
      ))}
    </>
  );
}