import React, { useState, useEffect } from "react";
import { Copy, RotateCw, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { webhookTriggerManager } from "../../utils/webhookTrigger";

export default function WebhookTriggerNode({ workflowId, nodeId, nodeConfig = {} }) {
  const [trigger, setTrigger] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    let existingTrigger = webhookTriggerManager.getWebhookTrigger(workflowId, nodeId);
    if (!existingTrigger) {
      existingTrigger = webhookTriggerManager.createWebhookTrigger(workflowId, nodeId, nodeConfig);
    }
    setTrigger(existingTrigger);
    setEventLog(webhookTriggerManager.getEventLog(workflowId, nodeId));
  }, [workflowId, nodeId, nodeConfig]);

  const handleCopyURL = async () => {
    if (trigger?.publicURL) {
      const copied = await webhookTriggerManager.copyToClipboard(trigger.publicURL);
      if (copied) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleRotateToken = () => {
    if (trigger && window.confirm("Rotate token? This will invalidate the old token.")) {
      const updated = webhookTriggerManager.rotateToken(workflowId, nodeId);
      if (updated) {
        setTrigger(updated);
      }
    }
  };

  const handleToggleActive = () => {
    if (trigger) {
      const updated = webhookTriggerManager.updateWebhookTrigger(workflowId, nodeId, {
        isActive: !trigger.isActive,
      });
      if (updated) {
        setTrigger(updated);
      }
    }
  };

  if (!trigger) return null;

  return (
    <div className="w-full max-w-sm rounded-xl border border-teal-400/50 bg-teal-500/10 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3 justify-between">
        <div>
          <h3 className="text-sm font-bold text-teal-300">Webhook Trigger</h3>
          <p className="text-xs text-teal-200/70 mt-0.5">Public URL Integration</p>
        </div>
        <button
          onClick={handleToggleActive}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            trigger.isActive
              ? "bg-green-400/20 text-green-400"
              : "bg-red-400/20 text-red-400"
          }`}
        >
          {trigger.isActive ? "Active" : "Disabled"}
        </button>
      </div>

      {/* Public URL */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-teal-300">Public URL</p>
        <div className="flex items-center gap-2 p-2 rounded bg-teal-900/30 border border-teal-400/20">
          <input
            type="text"
            value={trigger.publicURL}
            readOnly
            className="flex-1 bg-transparent text-[10px] text-teal-100 font-mono focus:outline-none truncate"
          />
          <button
            onClick={handleCopyURL}
            className="p-1 rounded hover:bg-teal-400/20 transition-colors text-teal-300 hover:text-teal-200"
            title="Copy URL"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Token */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-teal-300">Auth Token</p>
        <div className="flex items-center gap-2 p-2 rounded bg-teal-900/30 border border-teal-400/20">
          <input
            type={showToken ? "text" : "password"}
            value={trigger.token}
            readOnly
            className="flex-1 bg-transparent text-[10px] text-teal-100 font-mono focus:outline-none truncate"
          />
          <button
            onClick={() => setShowToken(!showToken)}
            className="p-1 rounded hover:bg-teal-400/20 transition-colors text-teal-300 hover:text-teal-200"
          >
            {showToken ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleRotateToken}
            className="p-1 rounded hover:bg-teal-400/20 transition-colors text-teal-300 hover:text-teal-200"
            title="Rotate token"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded bg-teal-900/20 border border-teal-400/10">
        <div className="text-center">
          <p className="text-xs font-bold text-teal-300">{trigger.triggerCount}</p>
          <p className="text-[9px] text-teal-200/60">Triggered</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-teal-300">
            {trigger.lastTriggered
              ? new Date(trigger.lastTriggered).toLocaleTimeString()
              : "Never"}
          </p>
          <p className="text-[9px] text-teal-200/60">Last</p>
        </div>
      </div>

      {/* Recent Events */}
      {eventLog.length > 0 && (
        <div className="p-2 rounded bg-teal-900/20 border border-teal-400/10 space-y-1">
          <p className="text-[10px] font-semibold text-teal-300">Recent Events ({eventLog.length})</p>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {eventLog.slice(-3).reverse().map((event) => (
              <div key={event.id} className="text-[9px] text-teal-200/70">
                <p>{new Date(event.timestamp).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example cURL */}
      <div className="p-2 rounded bg-teal-900/20 border border-teal-400/10">
        <p className="text-[10px] font-semibold text-teal-300 mb-1">Example cURL</p>
        <code className="text-[8px] text-teal-200/60 font-mono leading-tight break-all">
          curl -X POST {trigger.publicURL} \<br />
          -H "Content-Type: application/json" \<br />
          -H "{trigger.config.authHeaderName || 'X-Webhook-Token'}: {trigger.token.slice(0, 8)}..." \<br />
          -d '{"{"}data: value{"}"}'
        </code>
      </div>
    </div>
  );
}