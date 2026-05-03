import React from "react";
import { AlertCircle, X, ZapOff, Zap } from "lucide-react";

export default function ValidationPanel({ errors, onClose, onIgnore, canIgnore }) {
  if (!errors || errors.length === 0) return null;

  const criticalErrors = errors.filter((e) => ["no_trigger", "no_end"].includes(e.type));
  const warningErrors = errors.filter((e) => !["no_trigger", "no_end"].includes(e.type));
  const hasCritical = criticalErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-96 max-w-[90vw] bg-card border border-red-400/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-400/20 bg-red-400/10">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-red-400">Workflow Validation Failed</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {errors.length} issue{errors.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error list */}
        <div className="max-h-60 overflow-y-auto px-6 py-4 space-y-2">
          {criticalErrors.length > 0 && (
            <>
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">
                Critical Issues
              </div>
              {criticalErrors.map((error, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-red-400/10 border border-red-400/20">
                  <ZapOff className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300 leading-relaxed">{error.message}</p>
                </div>
              ))}
            </>
          )}

          {warningErrors.length > 0 && (
            <>
              {criticalErrors.length > 0 && <div className="border-t border-border/20 my-2" />}
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-2">
                Configuration Issues
              </div>
              {warningErrors.map((error, i) => (
                <div
                  key={i}
                  className="flex gap-2 p-2 rounded-lg bg-amber-400/10 border border-amber-400/20"
                  title={error.nodeId ? `Node: ${error.nodeId}` : ""}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300 leading-relaxed">{error.message}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-red-400/20 bg-secondary/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-foreground text-xs font-medium hover:bg-secondary/50 transition-colors"
          >
            Back to Editor
          </button>
          {!hasCritical && canIgnore && (
            <button
              onClick={onIgnore}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-medium hover:bg-amber-400/20 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Run Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}