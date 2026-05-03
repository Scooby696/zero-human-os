import React, { useState } from "react";
import { X, ChevronDown, ChevronRight, ArrowRight, Database, Download, FileJson } from "lucide-react";
import { NODE_TYPES } from "./workflowData";
import { exportAsJSON, exportAsPDF } from "../../utils/exportWorkflowLog";
import ParallelExecutionMetrics from "./ParallelExecutionMetrics";

function JsonTree({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  if (data === null || data === undefined) return <span className="text-muted-foreground/50">null</span>;
  if (typeof data === "boolean") return <span className={data ? "text-green-400" : "text-red-400"}>{String(data)}</span>;
  if (typeof data === "number") return <span className="text-cyan-400">{data}</span>;
  if (typeof data === "string") return <span className="text-amber-300">"{data}"</span>;
  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="text-muted-foreground/50">{"{}"}</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground/60 hover:text-foreground transition-colors mr-1"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
        </button>
        {collapsed ? (
          <span className="text-muted-foreground/40 italic text-[10px]">{`{${entries.length} keys}`}</span>
        ) : (
          <span>
            {"{"}
            <div className="ml-4">
              {entries.map(([k, v]) => (
                <div key={k}>
                  <span className="text-violet-300">{k}</span>
                  <span className="text-muted-foreground/50">: </span>
                  <JsonTree data={v} depth={depth + 1} />
                </div>
              ))}
            </div>
            {"}"}
          </span>
        )}
      </span>
    );
  }
  return <span className="text-foreground">{String(data)}</span>;
}

function NodeDataCard({ node, data }) {
  const def = NODE_TYPES[node.type] || NODE_TYPES.action;
  const [tab, setTab] = useState("output");

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-background/60">
      {/* Node header */}
      <div className={`flex items-center gap-2 px-3 py-2 ${def.color.replace("border-", "border-b-")} border-b border-border/30 bg-secondary/20`}>
        <span className="text-sm">{def.icon}</span>
        <span className="text-xs font-semibold text-foreground truncate">{node.label}</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{def.label}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        {["input", "output"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-[10px] font-semibold uppercase tracking-widest py-1.5 transition-colors ${
              tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "input" ? "↓ Input" : "↑ Output"}
          </button>
        ))}
      </div>

      {/* Data */}
      <div className="px-3 py-2 font-mono text-xs leading-relaxed max-h-36 overflow-y-auto">
        {data[tab] && Object.keys(data[tab]).length > 0 ? (
          <JsonTree data={data[tab]} />
        ) : (
          <span className="text-muted-foreground/40 italic">No data</span>
        )}
      </div>
    </div>
  );
}

export default function TestModePanel({ nodes, nodeData, simState, onClose, log, workflowName, parallelExecutionData }) {
  const executedNodes = nodes.filter((n) => nodeData[n.id]);

  const handleExportJSON = () => {
    exportAsJSON(workflowName || "Workflow", nodes, log || [], nodeData);
  };

  const handleExportPDF = () => {
    exportAsPDF(workflowName || "Workflow", nodes, log || [], nodeData);
  };

  return (
    <div className="w-80 shrink-0 border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20 shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Data Flow Inspector</span>
          {simState === "running" && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
          {simState === "done" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-medium">Done</span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {parallelExecutionData && (
          <ParallelExecutionMetrics executionData={parallelExecutionData} />
        )}
        {executedNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3 opacity-20">⬡</div>
            <p className="text-xs text-muted-foreground/50">
              {simState === "running" ? "Waiting for first node..." : "Run a simulation to inspect data flow"}
            </p>
          </div>
        )}
        {executedNodes.map((node, i) => (
          <div key={node.id}>
            <NodeDataCard node={node} data={nodeData[node.id]} />
            {i < executedNodes.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with export buttons */}
      {simState === "done" && executedNodes.length > 0 && (
        <div className="px-4 py-3 border-t border-border/40 bg-secondary/10 shrink-0 space-y-3">
          <p className="text-[10px] text-muted-foreground text-center">
            {executedNodes.length} nodes executed
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <FileJson className="w-3 h-3" />
              Export JSON
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium hover:bg-amber-400/20 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}