import React, { useState } from "react";
import { X, Trash2, Star, Plus } from "lucide-react";

const BUILTIN_TEMPLATES = [
  {
    id: "welcome-flow",
    name: "Welcome Flow",
    description: "Simple greeting and option selection",
    isCustom: false,
    nodes: [
      { type: "trigger", label: "Voice Trigger", config: { voice_phrase: "hello" } },
      { type: "llm", label: "Process Intent", config: { system_prompt: "Extract user intent" } },
      { type: "response", label: "Send Welcome", config: { response_template: "Welcome!" } },
      { type: "end", label: "Complete", config: {} },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
  },
  {
    id: "order-check",
    name: "Order Status Check",
    description: "Verify inventory and create order",
    isCustom: false,
    nodes: [
      { type: "trigger", label: "Order Request", config: { voice_phrase: "new order" } },
      { type: "condition", label: "Check Inventory", config: { condition_expression: "stock > 0" } },
      { type: "action", label: "Create Order", config: { http_method: "POST" } },
      { type: "response", label: "Confirm", config: { response_template: "Order created" } },
      { type: "response", label: "Out of Stock", config: { response_template: "Out of stock" } },
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
];

function TemplateCard({ template, onDragStart, onLoad, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, template)}
      className="p-3 rounded-xl border border-border/50 bg-background/80 hover:bg-secondary/50 hover:border-border/80 transition-all cursor-move group"
    >
      <div className="flex items-start gap-2 mb-1.5">
        {!template.isCustom && <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {template.name}
          </h3>
          <p className="text-[10px] text-muted-foreground/70 leading-tight line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] text-muted-foreground/50">
          {template.nodes.length} nodes
        </span>
        <div className="flex-1" />
        {template.isCustom && (
          <button
            onClick={() => setIsDeleting(true)}
            className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete template"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onLoad(template)}
          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Load template"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 bg-background/95 rounded-xl flex items-center justify-center gap-2 p-2">
          <span className="text-[10px] font-medium text-red-400">Delete?</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
            className="px-2 py-0.5 rounded text-[9px] font-medium bg-red-400/20 text-red-400 hover:bg-red-400/30"
          >
            Confirm
          </button>
          <button
            onClick={() => setIsDeleting(false)}
            className="px-2 py-0.5 rounded text-[9px] font-medium bg-secondary text-foreground hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkflowTemplateLibraryV2({
  isOpen,
  onClose,
  onLoadTemplate,
  customTemplates = [],
  onDeleteTemplate,
  onDragStart,
}) {
  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];
  const customCount = customTemplates.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-card border-r border-border/50 shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">Template Library</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allTemplates.length} templates ({customCount} saved)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {customCount > 0 && (
            <>
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Your Templates
                </span>
              </div>
              {customTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDragStart={onDragStart}
                  onLoad={onLoadTemplate}
                  onDelete={onDeleteTemplate}
                />
              ))}
              <div className="border-t border-border/20 mt-3 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 block py-1.5">
                  Built-in Templates
                </span>
              </div>
            </>
          )}
          {BUILTIN_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDragStart={onDragStart}
              onLoad={onLoadTemplate}
              onDelete={() => {}}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-border/30 bg-secondary/10 text-[9px] text-muted-foreground/60 leading-relaxed shrink-0">
          Drag templates onto canvas or click + to load. Your templates are saved locally.
        </div>
      </div>
    </>
  );
}