import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { RefreshCw, Copy, Check, Download, Clock, Bot } from "lucide-react";

export default function DocViewer({ doc, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([doc.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.agentName.replace(/\s+/g, "-").toLowerCase()}-${doc.docType}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const docTypeLabel = {
    overview: "Full Guide",
    api_reference: "API Reference",
    examples: "Usage Examples",
  }[doc.docType] || doc.docType;

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{doc.agentName}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{docTypeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Clock className="w-3 h-3" />
            <span>{new Date(doc.generatedAt).toLocaleTimeString()}</span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy markdown"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Download .md"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Markdown content */}
      <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
        <ReactMarkdown
          className="prose prose-sm prose-invert max-w-none"
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mt-0 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-8 mb-3 pb-2 border-b border-border/40">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>,
            ul: ({ children }) => <ul className="space-y-1 mb-4 ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-1 mb-4 ml-4 list-decimal">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
            strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
            code: ({ inline, children }) =>
              inline ? (
                <code className="px-1.5 py-0.5 rounded bg-secondary/80 text-primary text-xs font-mono">{children}</code>
              ) : (
                <code className="block bg-background border border-border/50 rounded-xl p-4 text-xs font-mono text-green-400/90 overflow-x-auto leading-relaxed whitespace-pre">{children}</code>
              ),
            pre: ({ children }) => <div className="my-4">{children}</div>,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-xs border-collapse">{children}</table>
              </div>
            ),
            th: ({ children }) => <th className="text-left p-2.5 border-b border-border/50 text-muted-foreground font-medium bg-secondary/30">{children}</th>,
            td: ({ children }) => <td className="p-2.5 border-b border-border/20 text-muted-foreground">{children}</td>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary/40 pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
            ),
            hr: () => <hr className="border-border/30 my-6" />,
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/30 bg-secondary/10 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60">Generated by Claude Sonnet from agent config & tool definitions</span>
        <span className="text-xs text-muted-foreground/60">{doc.content.split(" ").length.toLocaleString()} words</span>
      </div>
    </div>
  );
}