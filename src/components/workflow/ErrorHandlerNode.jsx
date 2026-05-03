import React, { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronDown, ChevronRight } from "lucide-react";
import { errorHandler } from "../../utils/errorHandler";

export default function ErrorHandlerNode({ nodeId, config = {} }) {
  const [expanded, setExpanded] = useState(false);
  const [failures, setFailures] = useState([]);

  React.useEffect(() => {
    const logs = errorHandler.getFailureLog({ nodeId });
    setFailures(logs);
  }, [nodeId]);

  const failureCount = failures.length;
  const recentFailure = failures[failures.length - 1];

  return (
    <div className="w-full max-w-sm rounded-xl border border-orange-400/50 bg-orange-500/10 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-orange-300">Error Handler</h3>
          <p className="text-xs text-orange-200/70 mt-0.5">
            Catches: {config.error_types || "all"}
          </p>
        </div>
      </div>

      {/* Fallback Action */}
      <div className="p-2 rounded bg-orange-900/30 border border-orange-400/20">
        <p className="text-[10px] font-semibold text-orange-300 mb-1">Fallback:</p>
        <p className="text-xs text-orange-100 font-mono capitalize">
          {config.fallback_action || "none"}
        </p>
      </div>

      {/* Alerts */}
      {(config.alert_email || config.alert_slack_webhook) && (
        <div className="p-2 rounded bg-orange-900/30 border border-orange-400/20">
          <p className="text-[10px] font-semibold text-orange-300 mb-1">Alerts:</p>
          <div className="space-y-0.5">
            {config.alert_email && (
              <p className="text-[10px] text-orange-100">✉️ {config.alert_email}</p>
            )}
            {config.alert_slack_webhook && (
              <p className="text-[10px] text-orange-100">💬 Slack notif</p>
            )}
          </div>
        </div>
      )}

      {/* Failure Log */}
      {failureCount > 0 && (
        <div className="p-2 rounded bg-red-900/20 border border-red-400/20">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between"
          >
            <p className="text-[10px] font-bold text-red-300">
              Failures: {failureCount}
            </p>
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-red-300" />
            ) : (
              <ChevronRight className="w-3 h-3 text-red-300" />
            )}
          </button>

          {expanded && recentFailure && (
            <div className="mt-2 p-2 rounded bg-background/40 space-y-1 text-[9px]">
              <p className="text-red-300 font-mono truncate">
                {recentFailure.error}
              </p>
              <p className="text-muted-foreground/50">
                {new Date(recentFailure.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Retry Config */}
      {config.fallback_action === "retry" && (
        <div className="p-2 rounded bg-orange-900/30 border border-orange-400/20">
          <p className="text-[10px] font-semibold text-orange-300 mb-1">Retry:</p>
          <p className="text-[10px] text-orange-100">
            {config.retry_count || 3}x with {config.retry_delay_ms || 1000}ms delay
          </p>
        </div>
      )}
    </div>
  );
}