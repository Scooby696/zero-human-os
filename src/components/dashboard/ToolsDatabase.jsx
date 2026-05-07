import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const tools = [
  // Orchestration
  { name: "CrewAI", category: "Orchestration", plan: "Free / Pro", price: "$0–$99/mo", url: "https://crewai.com", desc: "Role-based multi-agent teams with goals, tools, and memory.", badge: "Recommended" },
  { name: "LangGraph Cloud", category: "Orchestration", plan: "Paid", price: "$20+/mo", url: "https://langchain.com/langgraph", desc: "Production stateful agent workflows with persistence and human-in-the-loop." },
  { name: "AutoGen Studio", category: "Orchestration", plan: "Free / Enterprise", price: "$0 / Custom", url: "https://microsoft.github.io/autogen", desc: "Microsoft's conversational multi-agent collaboration framework." },
  { name: "Dify", category: "Orchestration", plan: "Free / Cloud", price: "$0–$59/mo", url: "https://dify.ai", desc: "Visual no-code agent builder with RAG and workflow tools." },

  // LLMs
  { name: "Claude API (Anthropic)", category: "LLM", plan: "Pay-per-use", price: "From $3/1M tokens", url: "https://anthropic.com", desc: "Claude 3.5/4 — best for reasoning, coding, and long-context tasks.", badge: "Top Pick" },
  { name: "OpenAI API", category: "LLM", plan: "Pay-per-use", price: "From $2.50/1M tokens", url: "https://platform.openai.com", desc: "GPT-4o and o1 series — versatile, widely supported.", badge: "Top Pick" },
  { name: "Groq", category: "LLM", plan: "Free / Pro", price: "$0–$79/mo", url: "https://groq.com", desc: "Ultra-fast inference for open-source models (Llama, Mixtral). Free tier available." },
  { name: "Ollama", category: "LLM", plan: "Free (self-hosted)", price: "$0", url: "https://ollama.com", desc: "Run Llama 4, Mistral, Gemma locally — zero API cost.", badge: "Free" },
  { name: "Together AI", category: "LLM", plan: "Pay-per-use", price: "From $0.20/1M tokens", url: "https://together.ai", desc: "Fast, cheap inference for open-source models with generous free tier." },

  // Memory & Vector DB
  { name: "Pinecone", category: "Memory", plan: "Free / Paid", price: "$0–$70+/mo", url: "https://pinecone.io", desc: "Managed vector database for semantic search and agent memory.", badge: "Top Pick" },
  { name: "Weaviate Cloud", category: "Memory", plan: "Free / Paid", price: "$0–$25+/mo", url: "https://weaviate.io", desc: "Open-source vector DB with hybrid search capabilities." },
  { name: "Chroma", category: "Memory", plan: "Free (open-source)", price: "$0", url: "https://trychroma.com", desc: "Lightweight local vector store — perfect for prototyping.", badge: "Free" },
  { name: "Supabase", category: "Memory", plan: "Free / Pro", price: "$0–$25/mo", url: "https://supabase.com", desc: "Postgres + pgvector + auth + storage. Best free-tier database.", badge: "Recommended" },

  // Automation / Integrations
  { name: "n8n Cloud", category: "Automation", plan: "Starter / Pro", price: "$20–$50/mo", url: "https://n8n.io", desc: "400+ integrations, AI nodes, visual workflow builder. Self-hostable free.", badge: "Recommended" },
  { name: "Zapier", category: "Automation", plan: "Free / Paid", price: "$0–$69+/mo", url: "https://zapier.com", desc: "5000+ app integrations. Best for non-technical users." },
  { name: "Make (Integromat)", category: "Automation", plan: "Free / Pro", price: "$0–$29/mo", url: "https://make.com", desc: "Visual automation with advanced data manipulation. Strong free tier." },
  { name: "LangChain Tools", category: "Automation", plan: "Free (open-source)", price: "$0", url: "https://langchain.com", desc: "Built-in tools for browser, code execution, search, and 100+ APIs.", badge: "Free" },

  // Infrastructure
  { name: "Railway", category: "Hosting", plan: "Hobby / Pro", price: "$5–$20/mo", url: "https://railway.app", desc: "Simple deployment for Docker containers, Python, Node apps." },
  { name: "Vercel", category: "Hosting", plan: "Free / Pro", price: "$0–$20/mo", url: "https://vercel.com", desc: "Frontend hosting with free tier. Perfect for dashboards.", badge: "Free" },
  { name: "Google Cloud Run", category: "Hosting", plan: "Pay-per-use", price: "From ~$0 (free tier)", url: "https://cloud.google.com/run", desc: "Serverless containers — pay only for requests. Generous free tier." },
  { name: "Oracle Cloud Free", category: "Hosting", plan: "Always Free", price: "$0", url: "https://oracle.com/cloud/free", desc: "4 ARM CPUs, 24GB RAM forever free — best for self-hosted agents.", badge: "Free" },

  // Observability
  { name: "Langfuse", category: "Monitoring", plan: "Free / Cloud", price: "$0–$59/mo", url: "https://langfuse.com", desc: "Open-source LLM observability, traces, evals, and cost tracking.", badge: "Recommended" },
  { name: "Arize Phoenix", category: "Monitoring", plan: "Free (open-source)", price: "$0", url: "https://phoenix.arize.com", desc: "AI observability and evals. Self-hosted, fully free.", badge: "Free" },

  // On-Chain
  { name: "Coinbase CDP (Base)", category: "On-Chain", plan: "Free / Pay-per-use", price: "$0+", url: "https://docs.cdp.coinbase.com", desc: "Agent wallets, smart contracts, and autonomous payments on Base.", badge: "Recommended" },
  { name: "Solana Web3.js", category: "On-Chain", plan: "Free (open-source)", price: "$0", url: "https://solana-labs.github.io/solana-web3.js", desc: "Build autonomous treasury and payment agents on Solana.", badge: "Free" },

  // Agentic Projects — Finance, Business & E-commerce
  { name: "Automated Trading Bot", category: "Agentic Projects", subcategory: "Finance, Business & E-commerce", plan: "Open Source", price: "$0", url: "https://github.com/topics/automated-trading-bot", desc: "Autonomous agent that monitors markets, executes trades, and manages a portfolio based on pre-set strategies.", badge: "Project" },
  { name: "Product Recommendation Agent", category: "Agentic Projects", subcategory: "Finance, Business & E-commerce", plan: "Open Source", price: "$0", url: "https://github.com/topics/recommendation-agent", desc: "AI agent that personalizes product suggestions based on user behavior, purchase history, and preferences.", badge: "Project" },
  { name: "E-commerce Personal Shopper Agent", category: "Agentic Projects", subcategory: "Finance, Business & E-commerce", plan: "Open Source", price: "$0", url: "https://github.com/topics/personal-shopper-agent", desc: "Agent that browses e-commerce catalogs, compares prices, and completes purchases autonomously on behalf of users.", badge: "Project" },
  { name: "Recruitment Recommendation Agent", category: "Agentic Projects", subcategory: "Finance, Business & E-commerce", plan: "Open Source", price: "$0", url: "https://github.com/topics/recruitment-agent", desc: "Multi-agent system that screens resumes, ranks candidates, and recommends top applicants to hiring managers.", badge: "Project" },
  { name: "Property Pricing Agent", category: "Agentic Projects", subcategory: "Finance, Business & E-commerce", plan: "Open Source", price: "$0", url: "https://github.com/topics/property-pricing-agent", desc: "Agentic system that scrapes listings, analyzes market data, and estimates real estate property prices.", badge: "Project" },

  // Agentic Projects — Healthcare & Medical Systems
  { name: "AI Health Assistant", category: "Agentic Projects", subcategory: "Healthcare & Medical Systems", plan: "Open Source", price: "$0", url: "https://github.com/topics/ai-health-assistant", desc: "Conversational medical agent that triages symptoms, answers health questions, and recommends next steps.", badge: "Project" },

  // Agentic Projects — Customer Experience & Content
  { name: "Content Personalization Agent", category: "Agentic Projects", subcategory: "Customer Experience & Content", plan: "Open Source", price: "$0", url: "https://github.com/topics/content-personalization-agent", desc: "Agent that curates and personalizes content feeds for users based on real-time engagement signals.", badge: "Project" },

  // Agentic Projects — Education, Travel & Lifestyle
  { name: "AI Tutor Agent", category: "Agentic Projects", subcategory: "Education, Travel & Lifestyle", plan: "Open Source", price: "$0", url: "https://github.com/topics/ai-tutor-agent", desc: "Adaptive learning agent that creates personalized study plans, quizzes students, and tracks progress over time.", badge: "Project" },
  { name: "Travel Planning Agent", category: "Agentic Projects", subcategory: "Education, Travel & Lifestyle", plan: "Open Source", price: "$0", url: "https://github.com/topics/travel-planning-agent", desc: "End-to-end travel agent that searches flights, hotels, and activities, then builds a full itinerary autonomously.", badge: "Project" },
  { name: "Recipe & Meal Planning Agent", category: "Agentic Projects", subcategory: "Education, Travel & Lifestyle", plan: "Open Source", price: "$0", url: "https://github.com/topics/meal-planning-agent", desc: "Agent that plans weekly meals based on dietary preferences, generates shopping lists, and tracks nutrition.", badge: "Project" },

  // Agentic Projects — Research & Data
  { name: "Research Summarization Agent", category: "Agentic Projects", subcategory: "Research & Data", plan: "Open Source", price: "$0", url: "https://github.com/topics/research-agent", desc: "Agent that searches academic papers, synthesizes findings, and produces structured research summaries.", badge: "Project" },
  { name: "Data Analysis Agent", category: "Agentic Projects", subcategory: "Research & Data", plan: "Open Source", price: "$0", url: "https://github.com/topics/data-analysis-agent", desc: "Agentic system that ingests CSV/SQL data, runs analysis, generates visualizations, and writes reports.", badge: "Project" },
  { name: "Web Scraping & Report Agent", category: "Agentic Projects", subcategory: "Research & Data", plan: "Open Source", price: "$0", url: "https://github.com/topics/web-scraping-agent", desc: "Agent that autonomously browses websites, extracts structured data, and compiles it into formatted reports.", badge: "Project" },

  // Agentic Projects — Productivity & DevOps
  { name: "Code Review Agent", category: "Agentic Projects", subcategory: "Productivity & DevOps", plan: "Open Source", price: "$0", url: "https://github.com/topics/code-review-agent", desc: "Agent that reviews pull requests, suggests improvements, flags bugs, and enforces coding standards automatically.", badge: "Project" },
  { name: "Email & Calendar Management Agent", category: "Agentic Projects", subcategory: "Productivity & DevOps", plan: "Open Source", price: "$0", url: "https://github.com/topics/email-agent", desc: "AI agent that reads, drafts, and prioritizes emails while scheduling calendar events based on context.", badge: "Project" },
  { name: "Customer Support Agent", category: "Agentic Projects", subcategory: "Productivity & DevOps", plan: "Open Source", price: "$0", url: "https://github.com/topics/customer-support-agent", desc: "Multi-turn support agent with tool use for order lookups, FAQ retrieval, and ticket escalation.", badge: "Project" },
  { name: "Social Media Management Agent", category: "Agentic Projects", subcategory: "Productivity & DevOps", plan: "Open Source", price: "$0", url: "https://github.com/topics/social-media-agent", desc: "Agent that generates posts, schedules content across platforms, and monitors engagement metrics.", badge: "Project" },
];

const categories = ["All", "Orchestration", "LLM", "Memory", "Automation", "Hosting", "Monitoring", "On-Chain", "Agentic Projects"];

const badgeColors = {
  "Recommended": "bg-primary/15 text-primary",
  "Top Pick": "bg-amber-400/15 text-amber-400",
  "Free": "bg-green-400/15 text-green-400",
  "Project": "bg-violet-400/15 text-violet-400",
};

export default function ToolsDatabase() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = tools.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Tools & OS Database</h2>
        <p className="text-muted-foreground">All the platforms, models, and infrastructure you need to run a Zero Human Company.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((tool, i) => (
          <motion.a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 block"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/70 text-muted-foreground">{tool.category}</span>
                {tool.badge && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColors[tool.badge]}`}>{tool.badge}</span>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
            {tool.subcategory && (
              <p className="text-[10px] font-medium text-violet-400/70 mb-1">{tool.subcategory}</p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{tool.plan}</span>
              <span className="font-semibold text-primary">{tool.price}</span>
            </div>
          </motion.a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No tools found matching your search.</div>
      )}
    </div>
  );
}