import React from "react";
import { X, Settings } from "lucide-react";
import { NODE_TYPES } from "./workflowData";
import SecretSelector from "../vault/SecretSelector";

// Field definitions per node type
const CONFIG_FIELDS = {
  agent: [
    { key: "agent_id", label: "Agent Type", type: "select", options: ["x402_data_analyst", "x402_api_integrator", "x402_content_creator", "x402_compliance_reviewer", "custom_langchain_agent", "custom_crewai_agent", "custom_local_agent"] },
    { key: "agent_prompt", label: "Instructions/Prompt", type: "textarea", placeholder: "What should the agent do? Include specific guidelines and constraints." },
    { key: "agent_timeout", label: "Timeout (seconds)", type: "number", placeholder: "30" },
    { key: "agent_temperature", label: "Temperature (0–2)", type: "number", placeholder: "0.7" },
  ],
  trigger: [
    { key: "voice_phrase", label: "Voice Trigger Phrase", type: "text", placeholder: 'e.g. "new order", "check status"' },
    { key: "fallback_phrase", label: "Fallback Phrase (optional)", type: "text", placeholder: 'e.g. "order created"' },
    { key: "confidence_threshold", label: "Confidence Threshold (0–1)", type: "number", placeholder: "0.8" },
  ],
  variable: [
    { key: "variable_name", label: "Variable Name", type: "text", placeholder: 'e.g. user_name, order_id' },
    { key: "variable_value", label: "Value (or reference {{key}})", type: "text", placeholder: 'e.g. {{order_id}} or static value' },
    { key: "variable_description", label: "Description (optional)", type: "text", placeholder: 'What is this variable for?' },
  ],
  condition: [
    { key: "condition_expression", label: "Condition Expression", type: "text", placeholder: 'e.g. inventory > 0' },
    { key: "true_label", label: "True Branch Label", type: "text", placeholder: "Yes / Available" },
    { key: "false_label", label: "False Branch Label", type: "text", placeholder: "No / Unavailable" },
  ],
  action: [
    { key: "endpoint_url", label: "API Endpoint URL", type: "text", placeholder: "https://api.example.com/endpoint" },
    { key: "http_method", label: "HTTP Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    { key: "request_body", label: "Request Body (JSON)", type: "textarea", placeholder: '{"key": "value"}' },
    { key: "auth_header", label: "Authorization Header (or select secret)", type: "secret", placeholder: "Bearer token" },
    { key: "timeout_ms", label: "Timeout (ms)", type: "number", placeholder: "5000" },
  ],
  response: [
    { key: "response_template", label: "Response Template", type: "textarea", placeholder: 'e.g. "Your order {{order_id}} has been placed."' },
    { key: "voice_speed", label: "Voice Speed", type: "select", options: ["slow", "normal", "fast"] },
    { key: "emotion", label: "Tone / Emotion", type: "select", options: ["neutral", "friendly", "professional", "urgent"] },
  ],
  llm: [
    { key: "system_prompt", label: "System Prompt", type: "textarea", placeholder: "You are a ZHS assistant. Extract the following fields from the user input..." },
    { key: "model", label: "Model", type: "select", options: ["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet", "llama-3.3", "mistral-small"] },
    { key: "temperature", label: "Temperature (0–2)", type: "number", placeholder: "0.7" },
    { key: "output_schema", label: "Expected Output Schema (JSON)", type: "textarea", placeholder: '{"order_id": "string", "quantity": "number"}' },
    { key: "max_tokens", label: "Max Tokens", type: "number", placeholder: "512" },
  ],
  webhook_trigger: [
    { key: "authHeaderName", label: "Auth Header Name", type: "text", placeholder: "X-Webhook-Token" },
    { key: "requiresAuth", label: "Require Authentication", type: "select", options: ["true", "false"] },
    { key: "ipWhitelist", label: "IP Whitelist (comma-separated, optional)", type: "textarea", placeholder: "192.168.1.1, 10.0.0.1" },
    { key: "expected_fields", label: "Expected Fields (JSON)", type: "textarea", placeholder: '{"user_id": "string", "action": "string"}' },
  ],
  webhook_action: [
    { key: "target_url", label: "Target Endpoint URL", type: "text", placeholder: "https://api.example.com/callback" },
    { key: "http_method", label: "HTTP Method", type: "select", options: ["GET", "POST", "PUT", "PATCH"] },
    { key: "payload_template", label: "Payload (JSON with {{variables}})", type: "textarea", placeholder: '{"status": "completed", "result": {{result}}}' },
    { key: "headers", label: "Custom Headers (JSON)", type: "textarea", placeholder: '{"Authorization": "Bearer TOKEN", "Content-Type": "application/json"}' },
    { key: "timeout_ms", label: "Timeout (ms)", type: "number", placeholder: "5000" },
  ],
  end: [
    { key: "summary_message", label: "Completion Message (optional)", type: "text", placeholder: "Flow completed successfully." },
    { key: "log_result", label: "Log Result", type: "select", options: ["yes", "no"] },
  ],
  error_handler: [
    { key: "error_types", label: "Catch Error Types", type: "text", placeholder: "timeout, 404, 500, all (comma-separated)" },
    { key: "fallback_action", label: "Fallback Action", type: "select", options: ["retry", "skip", "alert", "custom_response"] },
    { key: "retry_count", label: "Retry Count", type: "number", placeholder: "3" },
    { key: "retry_delay_ms", label: "Retry Delay (ms)", type: "number", placeholder: "1000" },
    { key: "alert_email", label: "Alert Email (optional)", type: "text", placeholder: "admin@example.com" },
    { key: "alert_slack_webhook", label: "Slack Webhook URL (or select secret)", type: "secret", placeholder: "https://hooks.slack.com/..." },
    { key: "fallback_response", label: "Fallback Response Template", type: "textarea", placeholder: 'e.g. "Service temporarily unavailable, retrying..."' },
    { key: "escalation_threshold", label: "Escalation After N Failures", type: "number", placeholder: "5" },
  ],
};

function Field({ field, value, onChange }) {
  const baseClass =
    "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors";

  if (field.type === "secret") {
    return (
      <SecretSelector
        value={value}
        onChange={onChange}
        label={field.label}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${baseClass} resize-none font-mono`}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={baseClass}
      >
        <option value="">— select —</option>
        {field.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value || ""}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={baseClass}
    />
  );
}

export default function NodeConfigPanel({ node, onUpdateNode, onClose }) {
  if (!node) return null;

  const def = NODE_TYPES[node.type] || NODE_TYPES.action;
  const fields = CONFIG_FIELDS[node.type] || [];

  const handleConfigChange = (key, value) => {
    onUpdateNode(node.id, { config: { ...node.config, [key]: value } });
  };

  const handleLabelChange = (e) => {
    onUpdateNode(node.id, { label: e.target.value });
  };

  return (
    <div className="w-72 shrink-0 border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{def.icon}</span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{def.label}</p>
            <p className="text-xs font-semibold text-foreground">Node Config</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Label field always shown */}
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Node Label
          </label>
          <input
            value={node.label}
            onChange={handleLabelChange}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Divider */}
        {fields.length > 0 && (
          <div className="border-t border-border/30 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Configuration</p>
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1.5">
                    {field.label}
                  </label>
                  <Field
                    field={field}
                    value={node.config?.[field.key]}
                    onChange={handleConfigChange}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node ID (read-only) */}
        <div className="border-t border-border/20 pt-3">
          <p className="text-[9px] text-muted-foreground/40 font-mono">ID: {node.id}</p>
        </div>
      </div>
    </div>
  );
}