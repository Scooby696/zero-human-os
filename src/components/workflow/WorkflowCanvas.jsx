import React, { useState, useRef, useCallback, useEffect } from "react";
import WorkflowNode from "./WorkflowNode";
import WorkflowEdges from "./WorkflowEdges";

export default function WorkflowCanvas({
  nodes, edges, selectedNode,
  onSelectNode, onUpdateNode, onDeleteNode, onAddEdge, onDeleteEdge,
  activeNodeId, activeEdgeId, visitedNodeIds = [], visitedEdgeIds = [],
  breakpoints = new Set(), onToggleBreakpoint,
  invalidNodeIds = new Set(),
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [connecting, setConnecting] = useState(null); // source node id
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getCanvasPos = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left - pan.x,
      y: clientY - rect.top - pan.y,
    };
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    setMousePos(pos);

    if (dragging) {
      onUpdateNode(dragging.id, {
        x: pos.x - dragging.offsetX,
        y: pos.y - dragging.offsetY,
      });
    } else if (panStart) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [dragging, panStart, getCanvasPos, onUpdateNode]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setPanStart(null);
  }, []);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      onSelectNode(null);
      setConnecting(null);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan, onSelectNode]);

  const handleNodeMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting !== node.id) {
        onAddEdge(connecting, node.id);
      }
      setConnecting(null);
      return;
    }
    const pos = getCanvasPos(e.clientX, e.clientY);
    setDragging({ id: node.id, offsetX: pos.x - node.x, offsetY: pos.y - node.y });
    onSelectNode(node);
  }, [connecting, getCanvasPos, onAddEdge, onSelectNode]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:28px_28px]"
      onMouseDown={handleCanvasMouseDown}
      style={{ cursor: panStart ? "grabbing" : connecting ? "crosshair" : "default" }}
    >
      {/* Panned layer */}
      <div
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, position: "absolute", width: "100%", height: "100%" }}
      >
        {/* SVG for edges */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <WorkflowEdges
            edges={edges}
            nodes={nodes}
            onDeleteEdge={onDeleteEdge}
            activeEdgeId={activeEdgeId}
            visitedEdgeIds={visitedEdgeIds}
          />
          {/* Live connecting line */}
          {connecting && (() => {
            const src = nodes.find((n) => n.id === connecting);
            if (!src) return null;
            return (
              <line
                x1={src.x + 90} y1={src.y + 24}
                x2={mousePos.x} y2={mousePos.y}
                stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 4"
                opacity="0.7"
              />
            );
          })()}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            selected={selectedNode?.id === node.id}
            connecting={connecting === node.id}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
            onDelete={() => onDeleteNode(node.id)}
            onStartConnect={() => setConnecting(connecting === node.id ? null : node.id)}
            onLabelChange={(label) => onUpdateNode(node.id, { label })}
            simActive={activeNodeId === node.id}
            simVisited={visitedNodeIds.includes(node.id)}
            isBreakpoint={breakpoints.has(node.id)}
            onToggleBreakpoint={() => onToggleBreakpoint?.(node.id)}
            isInvalid={invalidNodeIds.has(node.id)}
          />
        ))}
      </div>

      {/* Connecting mode hint */}
      {connecting && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-medium pointer-events-none">
          Click another node to connect — or click canvas to cancel
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <div className="text-5xl mb-4 opacity-20">⬡</div>
          <p className="text-muted-foreground/50 text-sm font-medium">Canvas is empty</p>
          <p className="text-muted-foreground/30 text-xs mt-1">Add nodes from the sidebar or load a template</p>
        </div>
      )}
    </div>
  );
}