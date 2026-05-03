import React, { useEffect, useRef } from "react";
import { X, Terminal } from "lucide-react";

const TYPE_STYLES = {
  trigger: "text-yellow-400",
  llm: "text-violet-400",
  action: "text-blue-400",
  condition: "text-orange-400",
  response: "text-green-400",
  success: "text-green-400 font-semibold",
  edge: "text-muted-foreground/60 italic",
  breakpoint: "text-red-400 font-semibold",
  info: "text-muted-foreground",
};

export default function SimulationLog({ log, simState, onClose }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[520px] max-w-[90vw] rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-secondary/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Simulation Log</span>
          {simState === "running" && (
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Running...
            </span>
          )}
          {simState === "done" && (
            <span className="text-[10px] text-green-400 font-medium">Complete</span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log entries */}
      <div className="max-h-40 overflow-y-auto px-4 py-2 font-mono space-y-1 bg-background/60">
        {log.length === 0 && (
          <p className="text-xs text-muted-foreground/50 py-1">Waiting for simulation to start...</p>
        )}
        {log.map((entry, i) => (
          <p key={i} className={`text-xs leading-relaxed ${TYPE_STYLES[entry.type] || "text-muted-foreground"}`}>
            <span className="text-muted-foreground/30 mr-2 select-none">{String(i + 1).padStart(2, "0")}</span>
            {entry.msg}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}