import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { AVAILABLE_AGENTS } from "../../utils/agentRegistry";

export default function AgentSelector({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Agents" },
    { id: "x402", label: "Paid (x402)" },
    { id: "opensource", label: "Open-Source" },
    { id: "custom", label: "Custom" },
  ];

  const filteredAgents = AVAILABLE_AGENTS.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <h2 className="text-sm font-bold text-foreground">Select Agent</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-6 py-3 border-b border-border/30 bg-background/60 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="w-full pl-9 pr-3 py-2 bg-card border border-border/50 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filteredAgents.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 text-center py-8">
              No agents match your search
            </p>
          ) : (
            filteredAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelect(agent);
                  onClose();
                }}
                className="w-full text-left p-4 rounded-lg border border-border/30 bg-background/40 hover:bg-background/80 hover:border-border transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                      {agent.cost > 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-medium">
                          ${agent.cost}/call
                        </span>
                      )}
                      {agent.cost === 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-medium">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{agent.description}</p>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="text-[8px] px-2 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {cap}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span className="text-[8px] px-2 py-0.5 rounded bg-muted/50 text-muted-foreground">
                          +{agent.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}