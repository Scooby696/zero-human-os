import React, { useState } from "react";
import { X, Search, Download, Eye, ChevronRight } from "lucide-react";
import { WORKFLOW_TEMPLATES } from "../../utils/templateLibrary";

export default function TemplateLibraryModal({ isOpen, onClose, onImport }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "support", label: "Support" },
    { id: "sales", label: "Sales" },
    { id: "content", label: "Content" },
    { id: "data", label: "Data" },
    { id: "compliance", label: "Compliance" },
  ];

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">Workflow Template Library</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse and import pre-built templates for common use cases</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left panel: Templates list */}
          <div className="w-1/2 border-r border-border/40 flex flex-col overflow-hidden">
            {/* Search & Filter */}
            <div className="px-6 py-4 border-b border-border/30 bg-background/60 shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 border border-border/40 text-foreground hover:border-border"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-3xl mb-3 opacity-20">⬡</div>
                  <p className="text-sm text-muted-foreground">No templates match your search</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreviewTemplate(template)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      previewTemplate?.id === template.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-background/40 border-border/30 hover:bg-background/60 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {template.nodes.length} nodes
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {template.edges.length} connections
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${previewTemplate?.id === template.id ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Preview */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-background/40">
            {previewTemplate ? (
              <>
                {/* Preview header */}
                <div className="px-6 py-4 border-b border-border/30 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{previewTemplate.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{previewTemplate.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{previewTemplate.description}</p>
                    </div>
                  </div>
                </div>

                {/* Preview content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-card/80 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Total Nodes</p>
                      <p className="text-lg font-bold text-primary">{previewTemplate.nodes.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/80 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Connections</p>
                      <p className="text-lg font-bold text-cyan-400">{previewTemplate.edges.length}</p>
                    </div>
                  </div>

                  {/* Node breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Workflow Nodes</h4>
                    <div className="space-y-1.5">
                      {previewTemplate.nodes.map((node, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded bg-card/60 border border-border/20">
                          <span className="text-sm">
                            {node.type === "trigger" && "⚡"}
                            {node.type === "condition" && "◇"}
                            {node.type === "action" && "▶"}
                            {node.type === "response" && "💬"}
                            {node.type === "llm" && "🧠"}
                            {node.type === "variable" && "📝"}
                            {node.type === "webhook_trigger" && "🔗"}
                            {node.type === "webhook_action" && "📤"}
                            {node.type === "agent" && "🤖"}
                            {node.type === "end" && "⏹"}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{node.label}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use case info */}
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary font-medium">
                      ✓ Perfect for automating {previewTemplate.name.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Import button */}
                <div className="px-6 py-4 border-t border-border/30 bg-secondary/10 shrink-0">
                  <button
                    onClick={() => {
                      onImport(previewTemplate);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Import Template
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-4 opacity-20">👁️</div>
                <p className="text-muted-foreground text-sm">Select a template to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}