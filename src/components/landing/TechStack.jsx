import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Cpu, Globe, Layers, Coins } from "lucide-react";

const categories = [
  {
    icon: Cpu,
    title: "Agent Orchestration",
    color: "text-primary",
    items: ["CrewAI", "LangGraph", "AutoGen", "Dify", "Flowise"],
    free: ["CrewAI (MIT)", "LangGraph (MIT)", "AutoGen (MIT)", "Dify (open-source)", "Flowise (open-source)"],
  },
  {
    icon: Code2,
    title: "LLM Layer",
    color: "text-cyan-400",
    items: ["Claude 3.5/4", "GPT-5 class", "Grok", "Llama 4", "Mistral Small 4"],
    free: ["Ollama (local)", "Groq free tier", "Together.ai free", "Hugging Face", "Qwen / Gemma (local)"],
  },
  {
    icon: Database,
    title: "Memory & Data",
    color: "text-green-400",
    items: ["Pinecone", "Weaviate", "PostgreSQL", "Custom RAG"],
    free: ["Chroma (free)", "pgvector (free)", "Qdrant (open-source)", "SQLite / DuckDB"],
  },
  {
    icon: Globe,
    title: "Integrations",
    color: "text-orange-400",
    items: ["Stripe, Shopify", "QuickBooks, GitHub", "CRMs, Gmail", "Any REST API"],
    free: ["n8n self-hosted", "LangChain Tools", "Playwright (browser)", "Open APIs"],
  },
  {
    icon: Layers,
    title: "Frontend & Infra",
    color: "text-violet-400",
    items: ["React + custom UI", "GCP / AWS", "LangChain backbone", "Vertex AI"],
    free: ["Next.js + Vercel free", "Docker + local", "Oracle Cloud free", "Streamlit / Gradio"],
  },
  {
    icon: Coins,
    title: "On-Chain (Optional)",
    color: "text-amber-400",
    items: ["Base, Solana, Ethereum", "Smart contracts", "Agent wallets", "Treasury automation"],
    free: ["Base / Solana devnet", "viem / ethers.js", "Self-hosted wallets", "Testnet (zero cost)"],
  },
];

export default function TechStack() {
  const [showFree, setShowFree] = useState(false);

  return (
    <section id="stack" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            2026-Ready <span className="text-primary">Tech Stack</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-8">
            Production-grade or fully free — your choice. Toggle between stacks.
          </p>
          {/* Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/50">
            <button
              onClick={() => setShowFree(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !showFree ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Production Stack
            </button>
            <button
              onClick={() => setShowFree(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                showFree ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Free / Open-Source Stack 🆓
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300"
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-secondary/50 ${cat.color} mb-4`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-3">{cat.title}</h3>
              <ul className="space-y-2">
                {(showFree ? cat.free : cat.items).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${cat.color.replace("text-", "bg-")} opacity-60`} />
                    {item}
                  </li>
                ))}
              </ul>
              {showFree && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <span className="text-xs text-green-400 font-medium">$0 to start</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {showFree && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 rounded-2xl bg-green-400/5 border border-green-400/20 text-center"
          >
            <p className="text-green-400 font-semibold mb-1">Recommended Free Starter</p>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">Ollama</span> (local LLMs) + 
              <span className="text-foreground font-medium"> CrewAI</span> (agents) + 
              <span className="text-foreground font-medium"> n8n</span> (integrations) + 
              <span className="text-foreground font-medium"> Chroma</span> (memory) + 
              <span className="text-foreground font-medium"> Supabase free tier</span> (database)
              <br />
              <span className="text-green-400/70 mt-2 inline-block">Total initial cost: $0</span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}