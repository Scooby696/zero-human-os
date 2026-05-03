import React, { useState } from "react";
import { Save, FolderOpen, Trash2, Download, ChevronDown } from "lucide-react";
import { DEFAULT_WORKFLOWS } from "./workflowData";

export default function WorkflowToolbar({ nodes, edges, workflowName, onLoad, onClear }) {
  const [showTemplates, setShowTemplates] = useState(false);

  const exportJSON = () => {
    const data = JSON.stringify({ name: workflowName, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Templates */}
      <div className="relative">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Templates
          <ChevronDown className="w-3 h-3" />
        </button>
        {showTemplates && (
          <div className="absolute right-0 top-8 w-48 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
            {DEFAULT_WORKFLOWS.map((wf) => (
              <button
                key={wf.name}
                onClick={() => { onLoad(wf); setShowTemplates(false); }}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
              >
                {wf.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={exportJSON}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Clear
      </button>

      <div className="text-xs text-muted-foreground">
        {nodes.length} nodes · {edges.length} edges
      </div>
    </div>
  );
}