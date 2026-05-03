import React, { useState } from "react";
import { NODE_TYPES } from "./workflowData";
import ConnectorManager from "../connector/ConnectorManager";

export default function WorkflowSidebar({ onAddNode, onOpenAgentSelector, onAddCustomNode }) {
  const [showConnectors, setShowConnectors] = useState(false);
  return (
    <aside className="w-52 shrink-0 border-r border-border/50 bg-card/40 overflow-y-auto p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Node Types</p>
      </div>
      <button
        onClick={onOpenAgentSelector}
        className="w-full text-left px-3 py-2.5 rounded-xl border bg-purple-500/20 border-purple-500/50 text-purple-400 text-xs font-medium transition-all hover:scale-[1.02] active:scale-95"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base leading-none">🤖</span>
          <span className="font-semibold">Custom Agent</span>
        </div>
        <p className="text-[10px] opacity-70 leading-relaxed">Add x402 or custom agents</p>
      </button>

      <button
        onClick={() => onAddNode("cost_estimator")}
        className="w-full text-left px-3 py-2.5 rounded-xl border bg-green-500/20 border-green-500/50 text-green-400 text-xs font-medium transition-all hover:scale-[1.02] active:scale-95"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base leading-none">💰</span>
          <span className="font-semibold">Cost Estimator</span>
        </div>
        <p className="text-[10px] opacity-70 leading-relaxed">Calculate execution costs</p>
      </button>

      {Object.entries(NODE_TYPES)
        .filter(([type]) => type !== "agent" && type !== "cost_estimator")
        .map(([type, def]) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            draggable
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 ${def.color}`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base leading-none">{def.icon}</span>
              <span className="font-semibold">{def.label}</span>
            </div>
            <p className="text-[10px] opacity-70 leading-relaxed">{def.description}</p>
          </button>
        ))}

      <div className="mt-4 border-t border-border/30 pt-3">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          className="w-full text-left px-1 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
        >
          {showConnectors ? "▼ Custom Connectors" : "▶ Custom Connectors"}
        </button>
        {showConnectors && (
          <div className="mt-2 px-1">
            <ConnectorManager
              onSelectEndpoint={(node) => {
                onAddCustomNode?.(node);
                setShowConnectors(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-border/30 pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Tips</p>
        <div className="space-y-1.5 text-[10px] text-muted-foreground px-1 leading-relaxed">
          <p>• Click a node type to add it to the canvas</p>
          <p>• Drag nodes to reposition them</p>
          <p>• Click a node to edit its label</p>
          <p>• Hover a node to see connect/delete buttons</p>
          <p>• Click "Connect" then click target node to draw an edge</p>
        </div>
      </div>
    </aside>
  );
}