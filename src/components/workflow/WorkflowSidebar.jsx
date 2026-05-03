import React from "react";
import { NODE_TYPES } from "./workflowData";

export default function WorkflowSidebar({ onAddNode }) {
  return (
    <aside className="w-52 shrink-0 border-r border-border/50 bg-card/40 overflow-y-auto p-3 flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 px-1">Node Types</p>
      {Object.entries(NODE_TYPES).map(([type, def]) => (
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