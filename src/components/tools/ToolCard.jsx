import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Star, Server, ChevronDown, ChevronUp, Copy, Check, Terminal } from "lucide-react";

const difficultyColor = {
  Beginner: "text-green-400 bg-green-400/10",
  Intermediate: "text-amber-400 bg-amber-400/10",
  Advanced: "text-red-400 bg-red-400/10",
};

const categoryColor = {
  workflow: "text-primary bg-primary/10 border-primary/20",
  marketing: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  community: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

const categoryLabel = {
  workflow: "Workflow",
  marketing: "Marketing",
  community: "Community",
};

export default function ToolCard({ tool, expanded, onToggle, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tool.install.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-border transition-all duration-200"
    >
      {/* Main row */}
      <button onClick={onToggle} className="w-full flex items-start sm:items-center gap-4 p-5 text-left hover:bg-secondary/10 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-base font-bold text-foreground">{tool.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor[tool.category]}`}>
              {categoryLabel[tool.category]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[tool.difficulty]}`}>
              {tool.difficulty}
            </span>
            {!tool.selfHost && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Hosted</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tool.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>{tool.stars}</span>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {tool.github && (
            <a
              href={tool.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/30"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
              {/* Install */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    <Terminal className="w-3.5 h-3.5" />
                    Install / Setup
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-background rounded-xl p-4 text-xs font-mono text-green-400/90 overflow-x-auto border border-border/40 leading-relaxed">
                  {tool.install.map((line, i) => (
                    <div key={i} className={line.startsWith("#") ? "text-muted-foreground/60" : ""}>
                      {line || "\u00a0"}
                    </div>
                  ))}
                </pre>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Real-World Use Case</div>
                  <p className="text-sm text-foreground leading-relaxed bg-primary/5 border border-primary/10 rounded-xl p-3">{tool.useCase}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <div className="text-muted-foreground mb-1">License</div>
                    <div className="font-medium text-foreground">{tool.license}</div>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <div className="text-muted-foreground mb-1">Hosting</div>
                    <div className="font-medium text-foreground flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      {tool.selfHost ? "Self-hostable" : "Managed"}
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <div className="text-muted-foreground mb-1">GitHub Stars</div>
                    <div className="font-medium text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {tool.stars}
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <div className="text-muted-foreground mb-1">Difficulty</div>
                    <div className={`font-medium text-xs px-2 py-0.5 rounded-full inline-block ${difficultyColor[tool.difficulty]}`}>
                      {tool.difficulty}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                  </a>
                  {tool.github && (
                    <a
                      href={tool.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary border border-border/40 text-muted-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" /> View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}