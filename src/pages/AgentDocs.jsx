import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, FileText, Code2, Zap, RefreshCw, ChevronRight, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DocViewer from "../components/docs/DocViewer";
import AgentSelector from "../components/docs/AgentSelector";

const DOC_TYPES = [
  { id: "overview", label: "Full Guide", icon: BookOpen, desc: "Usage guide, capabilities, integrations" },
  { id: "api_reference", label: "API Reference", icon: Code2, desc: "Endpoints, schemas, cURL examples" },
  { id: "examples", label: "Examples", icon: Zap, desc: "5 real-world usage examples with cost" },
];

export default function AgentDocs() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [docType, setDocType] = useState("overview");
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    setDoc(null);
    setError(null);
    try {
      const res = await base44.functions.invoke("generateAgentDocs", {
        agentName: selectedAgent,
        docType,
      });
      setDoc(res.data);
    } catch (e) {
      setError(e.message || "Failed to generate documentation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">AI Agent Documentation</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI-Generated</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

          {/* Left panel */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-xl font-bold text-foreground mb-1">Generate Docs</h1>
              <p className="text-sm text-muted-foreground">
                Select an agent and doc type. AI generates comprehensive documentation from the agent's configuration and tool definitions.
              </p>
            </motion.div>

            <AgentSelector selected={selectedAgent} onSelect={setSelectedAgent} />

            {/* Doc type */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Documentation Type</div>
              <div className="space-y-2">
                {DOC_TYPES.map((dt) => (
                  <button
                    key={dt.id}
                    onClick={() => setDocType(dt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                      docType === dt.id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/40 hover:bg-secondary/30 text-muted-foreground"
                    }`}
                  >
                    <dt.icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{dt.label}</div>
                      <div className="text-xs opacity-70">{dt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <button
                onClick={generate}
                disabled={!selectedAgent || loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating with Claude...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Documentation
                  </>
                )}
              </button>
              {!selectedAgent && (
                <p className="text-xs text-muted-foreground text-center mt-2">Select an agent to continue</p>
              )}
              <p className="text-xs text-muted-foreground/60 text-center mt-2">Uses Claude Sonnet — ~5–10s generation time</p>
            </motion.div>

            {/* Quick links */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Related</div>
              <div className="space-y-1">
                <Link to="/audit" className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" /> Deployment Audit
                </Link>
                <Link to="/dashboard/tools" className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" /> Tools Database
                </Link>
                <Link to="/monetization" className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" /> Monetization Guide
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right panel — doc output */}
          <div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary animate-pulse" />
                  </div>
                  <p className="text-foreground font-semibold mb-1">Claude is generating documentation...</p>
                  <p className="text-sm text-muted-foreground">Analyzing agent config, tools, and integrations</p>
                  <div className="flex gap-1.5 mt-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {error && !loading && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl bg-red-400/5 border border-red-400/20 text-center"
                >
                  <p className="text-red-400 font-medium mb-1">Generation failed</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <button onClick={generate} className="mt-4 text-xs text-primary hover:underline">Try again</button>
                </motion.div>
              )}

              {doc && !loading && (
                <motion.div key="doc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <DocViewer doc={doc} onRegenerate={generate} />
                </motion.div>
              )}

              {!doc && !loading && !error && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">No documentation generated yet</p>
                  <p className="text-sm text-muted-foreground/60">Select an agent and click Generate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}