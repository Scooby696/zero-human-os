import React, { useState, useRef } from "react";
import { Trash2, Link2, Check } from "lucide-react";
import { NODE_TYPES } from "./workflowData";

export default function WorkflowNode({
  node, selected, connecting,
  onMouseDown, onDelete, onStartConnect, onLabelChange,
  simActive, simVisited, isBreakpoint, onToggleBreakpoint,
  isInvalid = false,
}) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  const def = NODE_TYPES[node.type] || NODE_TYPES.action;

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleLabelBlur = () => {
    setEditing(false);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === "Enter") setEditing(false);
    e.stopPropagation();
  };

  return (
    <div
      style={{ position: "absolute", left: node.x, top: node.y, userSelect: "none" }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative w-44 rounded-xl border-2 px-3 py-2.5 shadow-lg transition-all cursor-move
          ${isInvalid ? "border-red-500/80 bg-red-500/10" : def.color}
          ${selected ? "ring-2 ring-white/40 scale-105 shadow-xl" : ""}
          ${connecting ? "ring-2 ring-primary scale-105" : ""}
          ${simActive ? "ring-4 ring-yellow-400 scale-110 shadow-yellow-400/40 shadow-2xl" : ""}
          ${simVisited && !simActive ? "opacity-70 brightness-75" : ""}
        `}
      >
        {isInvalid && (
          <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">!</span>
          </span>
        )}
        {simActive && (
          <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 animate-ping" />
        )}
        {isBreakpoint && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBreakpoint?.();
            }}
            className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 border-2 border-background shadow-lg transition-colors"
            title="Click to remove breakpoint"
          />
        )}
        {/* Type badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm leading-none">{def.icon}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{def.label}</span>
        </div>

        {/* Label */}
        {editing ? (
          <input
            ref={inputRef}
            value={node.label}
            onChange={(e) => onLabelChange(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs font-semibold bg-transparent border-b border-current/50 focus:outline-none py-0.5 text-current"
          />
        ) : (
          <p className="text-xs font-semibold leading-tight text-current opacity-90 truncate">{node.label}</p>
        )}

        {/* Connection dot (output) */}
        <div className={`absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background ${def.dot}`} />

        {/* Connection dot (input) */}
        <div className={`absolute left-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background ${def.dot} opacity-60`} />
      </div>

      {/* Action buttons */}
      {(hovered || selected) && (
        <div className="absolute -top-7 left-0 flex gap-1">
          <button
            onMouseDown={(e) => { e.stopPropagation(); onToggleBreakpoint?.(); }}
            title={isBreakpoint ? "Remove breakpoint" : "Set breakpoint (pause on this node)"}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
              isBreakpoint
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                : "bg-card border-border/50 text-muted-foreground hover:text-red-400 hover:border-red-400/40"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-current" />
            {isBreakpoint ? "Remove" : "Breakpoint"}
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onStartConnect(); }}
            title="Connect to another node"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
              connecting
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40"
            }`}
          >
            <Link2 className="w-3 h-3" />
            {connecting ? "Cancel" : "Connect"}
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete node"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-card border border-border/50 text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}