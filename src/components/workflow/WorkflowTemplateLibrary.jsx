import React from "react";
import { X, Zap, Package, MessageCircle } from "lucide-react";

const TEMPLATES = [
  {
    id: "welcome-flow",
    icon: Zap,
    name: "Welcome Flow",
    description: "Simple greeting and option selection",
    preview: "Trigger → LLM → Response",
    nodes: [
      { type: "trigger", label: "Voice Trigger", config: { voice_phrase: "hello" } },
      { type: "llm", label: "Process Intent", config: { system_prompt: "Extract user intent" } },
      { type: "response", label: "Send Welcome", config: { response_template: "Welcome to our service!" } },
      { type: "end", label: "Flow Complete", config: {} },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
  },
  {
    id: "order-check",
    icon: Package,
    name: "Order Status Check",
    description: "Verify inventory and create order",
    preview: "Trigger → Condition → Action",
    nodes: [
      { type: "trigger", label: "Order Request", config: { voice_phrase: "new order" } },
      { type: "condition", label: "Check Inventory", config: { condition_expression: "stock > 0" } },
      { type: "action", label: "Create Order", config: { http_method: "POST", endpoint_url: "https://api.example.com/orders" } },
      { type: "response", label: "Confirm Order", config: { response_template: "Order {{order_id}} created successfully" } },
      { type: "response", label: "Out of Stock", config: { response_template: "Sorry, out of stock" } },
      { type: "end", label: "Done", config: {} },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 1, to: 4 },
      { from: 2, to: 3 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },
  {
    id: "support-escalate",
    icon: MessageCircle,
    name: "Support Escalation",
    description: "Triage support issue and escalate if needed",
    preview: "Trigger → LLM → Condition → Action",
    nodes: [
      { type: "trigger", label: "Support Request", config: { voice_phrase: "help needed" } },
      { type: "llm", label: "Analyze Severity", config: { system_prompt: "Determine issue severity: low, medium, high" } },
      { type: "condition", label: "Is Critical?", config: { condition_expression: "severity === 'high'" } },
      { type: "action", label: "Create Ticket", config: { http_method: "POST", endpoint_url: "https://api.example.com/tickets" } },
      { type: "response", label: "Auto-Resolve", config: { response_template: "Issue resolved automatically" } },
      { type: "response", label: "Escalated", config: { response_template: "Escalated to support team" } },
      { type: "end", label: "Complete", config: {} },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ],
  },
];

export default function WorkflowTemplateLibrary({ isOpen, onClose, onLoadTemplate }) {
  if (!isOpen) return null;

  const handleLoadTemplate = (template) => {
    onLoadTemplate(template);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border/50 shadow-xl z-50 flex flex-col overflow-hidden md:relative md:w-80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">Node Templates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-configured patterns</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="p-3 rounded-xl border border-border/50 bg-background/80 hover:bg-secondary/50 hover:border-border/80 transition-all cursor-pointer group"
                onClick={() => handleLoadTemplate(template)}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {template.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground/50 font-mono px-2 py-1 rounded bg-background/60 truncate">
                  {template.preview}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-border/30 bg-secondary/10 text-[9px] text-muted-foreground/60 leading-relaxed shrink-0">
          Click a template to load it on your canvas. Nodes will be positioned automatically.
        </div>
      </div>
    </>
  );
}