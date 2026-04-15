import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, Terminal, Cpu, Database, Globe, Layers, ShieldCheck,
  DollarSign, Rocket, ArrowLeft, Copy, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Audit checklist ──────────────────────────────────────────────────────────
const auditSections = [
  {
    id: "llm",
    icon: Cpu,
    title: "LLM / Model Layer",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      { label: "Use Ollama locally (Llama 3.3 / Mistral Small 4)", status: "pass", free: true, note: "Zero API cost. Install: curl -fsSL https://ollama.com/install.sh | sh" },
      { label: "Fallback to Groq free tier for speed-critical tasks", status: "pass", free: true, note: "Free tier: 14,400 requests/day. No credit card required." },
      { label: "Route complex reasoning to Claude / GPT-4o (paid)", status: "warn", free: false, note: "~$3–10/1M tokens. Use only when local models fall short." },
      { label: "Define model routing logic in CEO Orchestrator", status: "pass", free: true, note: "Use cost-tier routing: local → Groq → Claude. Saves 80%+ costs." },
    ],
  },
  {
    id: "orchestration",
    icon: Layers,
    title: "Agent Orchestration",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    items: [
      { label: "Install CrewAI (pip install crewai)", status: "pass", free: true, note: "MIT license. Supports role-based agents, tools, memory, tasks." },
      { label: "Define Agent roles: CEO, Marketing, Sales, Finance, Ops, Support, Legal, Analytics", status: "pass", free: true, note: "Each agent needs: role, goal, backstory, tools, llm config." },
      { label: "Set up shared memory with Chroma (vector DB)", status: "pass", free: true, note: "pip install chromadb. Persist to disk: client = chromadb.PersistentClient(path='./memory')" },
      { label: "Use LangGraph for stateful multi-step workflows", status: "pass", free: true, note: "pip install langgraph. Best for sequential decision trees." },
      { label: "Wire n8n self-hosted for all integrations & triggers", status: "pass", free: true, note: "docker run -d -p 5678:5678 n8nio/n8n — Free, 400+ integrations." },
    ],
  },
  {
    id: "infra",
    icon: Globe,
    title: "Infrastructure & Hosting",
    color: "text-green-400",
    bg: "bg-green-400/10",
    items: [
      { label: "Oracle Cloud Free Tier — 4 ARM CPUs + 24GB RAM", status: "pass", free: true, note: "Always-free. Enough to run all 9 agents + n8n + Chroma simultaneously." },
      { label: "Alternatively: Hetzner VPS (€5/mo) for EU hosting", status: "pass", free: false, note: "CX22: 2vCPU, 4GB RAM, 40GB SSD. Best price/performance ratio." },
      { label: "Containerize agents with Docker Compose", status: "pass", free: true, note: "docker-compose.yml with services: agent-core, n8n, chroma, postgres." },
      { label: "Use Coolify (self-hosted PaaS) to manage deployments", status: "pass", free: true, note: "Free alternative to Heroku/Railway. One-click deploys via Git." },
      { label: "Set up Nginx reverse proxy + SSL (Let's Encrypt)", status: "pass", free: true, note: "certbot --nginx -d yourdomain.com — free wildcard SSL." },
      { label: "Configure GitHub Actions for CI/CD pipeline", status: "pass", free: true, note: "Free for public repos. Automate: test → build → push → deploy." },
    ],
  },
  {
    id: "database",
    icon: Database,
    title: "Database & Memory",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    items: [
      { label: "Supabase free tier for structured data (Postgres)", status: "pass", free: true, note: "500MB DB, 1GB file storage, auth, REST API — all free." },
      { label: "Chroma (self-hosted) for vector/semantic memory", status: "pass", free: true, note: "Agent long-term memory. No cloud costs." },
      { label: "Redis for task queue & real-time agent communication", status: "pass", free: true, note: "docker run -d -p 6379:6379 redis:alpine" },
      { label: "Implement RAG pipeline for document knowledge base", status: "warn", free: true, note: "LangChain + Chroma + Ollama embeddings (nomic-embed-text)." },
    ],
  },
  {
    id: "integrations",
    icon: Globe,
    title: "Business Integrations",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    items: [
      { label: "Stripe API for autonomous payment processing", status: "pass", free: true, note: "2.9% + 30¢ per transaction. No monthly fee. Agents can create charges." },
      { label: "Gmail API for autonomous email (OAuth2)", status: "pass", free: true, note: "Free. Enable via Google Cloud Console → Gmail API." },
      { label: "Slack webhook for agent notifications", status: "pass", free: true, note: "Free tier: unlimited messages. Create incoming webhook in Slack apps." },
      { label: "GitHub API for code deployment automation", status: "pass", free: true, note: "Free for public repos. Fine-grained PAT tokens for agents." },
      { label: "Airtable / Notion API for knowledge management", status: "pass", free: true, note: "Both have free tiers with API access." },
      { label: "Twilio / WhatsApp Business API for outreach", status: "warn", free: false, note: "Twilio: ~$0.005/SMS. WhatsApp Business: free sandbox, paid production." },
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Security & Compliance",
    color: "text-red-400",
    bg: "bg-red-400/10",
    items: [
      { label: "Store all API keys in .env (never in code)", status: "pass", free: true, note: "Use python-dotenv or Docker secrets. Add .env to .gitignore." },
      { label: "Implement human-in-the-loop for financial actions > $500", status: "warn", free: true, note: "LangGraph interrupt() node before high-value transactions." },
      { label: "Set rate limits & spending caps on all LLM APIs", status: "pass", free: true, note: "OpenAI/Anthropic dashboards allow hard monthly spending caps." },
      { label: "Enable audit logging for all agent actions", status: "pass", free: true, note: "Langfuse free tier: full trace logging, cost tracking, evals." },
      { label: "Restrict agent permissions with least-privilege principle", status: "warn", free: true, note: "Each agent should only have access to APIs it needs." },
    ],
  },
];

// ── Deploy steps ─────────────────────────────────────────────────────────────
const deploySteps = [
  {
    step: "01",
    title: "Spin Up Free Server",
    time: "~15 min",
    commands: [
      "# Oracle Cloud Free Tier (recommended)",
      "# Sign up: cloud.oracle.com → Always Free resources",
      "# Create VM: Ubuntu 22.04, VM.Standard.A1.Flex (4 CPU, 24GB RAM)",
      "",
      "# Or use Hetzner (€5/mo)",
      "# hcloud server create --type cx22 --image ubuntu-22.04 --name zhs-server",
    ],
  },
  {
    step: "02",
    title: "Install Core Dependencies",
    time: "~10 min",
    commands: [
      "sudo apt update && sudo apt install -y docker.io docker-compose git python3-pip",
      "sudo usermod -aG docker $USER",
      "",
      "# Install Ollama",
      "curl -fsSL https://ollama.com/install.sh | sh",
      "ollama pull llama3.3  # or mistral-small",
      "ollama pull nomic-embed-text  # for RAG",
    ],
  },
  {
    step: "03",
    title: "Deploy Agent Stack",
    time: "~20 min",
    commands: [
      "git clone https://github.com/YOUR_ORG/zero-human-os.git",
      "cd zero-human-os",
      "cp .env.example .env  # fill in your API keys",
      "",
      "# Start all services",
      "docker-compose up -d",
      "",
      "# Services started:",
      "# → agent-core (CrewAI + LangGraph) on :8000",
      "# → n8n (automations) on :5678",
      "# → chroma (vector DB) on :8001",
      "# → redis (queue) on :6379",
    ],
  },
  {
    step: "04",
    title: "Configure n8n Workflows",
    time: "~30 min",
    commands: [
      "# Access n8n at http://YOUR_IP:5678",
      "# Import workflow templates from /workflows/*.json",
      "",
      "# Required workflows:",
      "# - daily-briefing.json      (CEO agent daily report)",
      "# - lead-capture.json        (Sales agent trigger)",
      "# - content-publish.json     (Marketing agent schedule)",
      "# - invoice-automation.json  (Finance agent)",
      "# - support-tickets.json     (Support agent webhook)",
    ],
  },
  {
    step: "05",
    title: "Set Up SSL & Domain",
    time: "~10 min",
    commands: [
      "# Install Nginx + Certbot",
      "sudo apt install -y nginx certbot python3-certbot-nginx",
      "",
      "# Get free SSL cert",
      "sudo certbot --nginx -d yourdomain.com",
      "",
      "# Nginx routes:",
      "# yourdomain.com      → React dashboard (:3000)",
      "# api.yourdomain.com  → Agent API (:8000)",
      "# n8n.yourdomain.com  → n8n (:5678)",
    ],
  },
  {
    step: "06",
    title: "Go Live & Monitor",
    time: "~15 min",
    commands: [
      "# Start Langfuse (self-hosted observability)",
      "docker run -d -p 3001:3000 langfuse/langfuse",
      "",
      "# Verify all agents are running",
      "curl http://localhost:8000/health",
      "",
      "# Monitor agent logs",
      "docker-compose logs -f agent-core",
      "",
      "# Set up weekly backup",
      "0 2 * * 0 /home/ubuntu/scripts/backup.sh",
    ],
  },
];

// ── Cost breakdown ────────────────────────────────────────────────────────────
const costs = [
  { item: "Server (Oracle Cloud Free)", monthly: "$0", annual: "$0", note: "Always-free tier" },
  { item: "LLM (Ollama local)", monthly: "$0", annual: "$0", note: "Runs on your server" },
  { item: "Groq API (fast fallback)", monthly: "$0", annual: "$0", note: "14.4K req/day free" },
  { item: "Supabase (database)", monthly: "$0", annual: "$0", note: "Free tier: 500MB" },
  { item: "n8n (self-hosted)", monthly: "$0", annual: "$0", note: "Docker, no fee" },
  { item: "Chroma (vector DB)", monthly: "$0", annual: "$0", note: "Self-hosted" },
  { item: "Langfuse (monitoring)", monthly: "$0", annual: "$0", note: "Self-hosted" },
  { item: "SSL Certificate", monthly: "$0", annual: "$0", note: "Let's Encrypt free" },
  { item: "Domain name", monthly: "$1", annual: "$12", note: "Namecheap ~$12/yr" },
  { item: "Claude API (complex tasks)", monthly: "$15–40", annual: "$180–480", note: "Optional, ~500K tokens/mo" },
];

// ── Readiness score ───────────────────────────────────────────────────────────
const readinessItems = [
  { label: "Free deployment possible", score: 10, max: 10 },
  { label: "No vendor lock-in", score: 9, max: 10 },
  { label: "Production-ready stack", score: 8, max: 10 },
  { label: "Security & compliance", score: 7, max: 10 },
  { label: "Scalability", score: 8, max: 10 },
  { label: "Documentation quality", score: 7, max: 10 },
];

// ── CodeBlock component ───────────────────────────────────────────────────────
function CodeBlock({ lines }) {
  const [copied, setCopied] = useState(false);
  const code = lines.join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-background rounded-xl p-4 text-xs font-mono text-green-400/90 overflow-x-auto border border-border/50 leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.startsWith("#") ? "text-muted-foreground/60" : ""}>
            {line || "\u00a0"}
          </div>
        ))}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-secondary/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Audit() {
  const [openSection, setOpenSection] = useState("llm");
  const [openStep, setOpenStep] = useState("01");

  const totalPasses = auditSections.flatMap(s => s.items).filter(i => i.status === "pass").length;
  const totalItems = auditSections.flatMap(s => s.items).length;
  const totalWarns = auditSections.flatMap(s => s.items).filter(i => i.status === "warn").length;
  const totalFree = auditSections.flatMap(s => s.items).filter(i => i.free).length;
  const overallScore = Math.round((totalPasses / totalItems) * 100);

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
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Real-World Deployment Audit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Readiness:</span>
            <span className="text-lg font-bold text-green-400">{overallScore}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

        {/* Hero summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-400/10 via-primary/5 to-transparent border border-green-400/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Deployment Audit — Zero Human Systems
                </h1>
                <p className="text-muted-foreground max-w-xl">
                  A real-world technical assessment of the free open-source stack, covering infrastructure, agent orchestration, security, and step-by-step deployment guide.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">{totalPasses}/{totalItems}</div>
                  <div className="text-xs text-muted-foreground mt-1">Checks Passing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-amber-400">{totalWarns}</div>
                  <div className="text-xs text-muted-foreground mt-1">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary">{totalFree}</div>
                  <div className="text-xs text-muted-foreground mt-1">Free Tools</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Readiness Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Readiness Scorecard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readinessItems.map((item) => (
              <Card key={item.label} className="bg-card border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-lg font-bold text-foreground">{item.score}/{item.max}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/50">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-green-400 transition-all"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Audit Checklist */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Technical Audit Checklist</h2>
          <div className="space-y-3">
            {auditSections.map((section) => (
              <div key={section.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                <button
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${section.bg} ${section.color}`}>
                      <section.icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-foreground">{section.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {section.items.filter(i => i.status === "pass").length}/{section.items.length} passing
                    </span>
                  </div>
                  {openSection === section.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openSection === section.id && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border/30">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 pt-3">
                        {item.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        ) : item.status === "warn" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{item.label}</span>
                            {item.free && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 font-medium">FREE</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step-by-step deploy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Step-by-Step Deployment Guide</h2>
          </div>
          <p className="text-muted-foreground mb-6">From zero to fully deployed — estimated total time: ~100 minutes.</p>
          <div className="space-y-4">
            {deploySteps.map((step) => (
              <div key={step.step} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                <button
                  onClick={() => setOpenStep(openStep === step.step ? null : step.step)}
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-primary/30 font-mono">{step.step}</span>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.time}</div>
                    </div>
                  </div>
                  {openStep === step.step ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openStep === step.step && (
                  <div className="px-5 pb-5 border-t border-border/30">
                    <div className="mt-4">
                      <CodeBlock lines={step.commands} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">True Cost Breakdown (Free Stack)</h2>
          </div>
          <Card className="bg-card border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Component</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Monthly</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Annual</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {costs.map((row) => (
                      <tr key={row.item} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 font-medium text-foreground">{row.item}</td>
                        <td className={`p-4 font-semibold ${row.monthly === "$0" ? "text-green-400" : "text-amber-400"}`}>{row.monthly}</td>
                        <td className={`p-4 font-semibold ${row.annual === "$0" ? "text-green-400" : "text-amber-400"}`}>{row.annual}</td>
                        <td className="p-4 text-muted-foreground text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border/50 bg-secondary/20">
                      <td className="p-4 font-bold text-foreground">TOTAL (minimum)</td>
                      <td className="p-4 font-black text-green-400 text-base">$1/mo</td>
                      <td className="p-4 font-black text-green-400 text-base">$12/yr</td>
                      <td className="p-4 text-muted-foreground text-xs">Domain only. Everything else is free.</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Ready to Deploy?</h3>
              <p className="text-muted-foreground text-sm">Total cost to start: $1/year (domain only). All infrastructure is free.</p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://cloud.oracle.com/free"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Rocket className="w-4 h-4" />
                Get Free Server
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/dashboard/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                View Tools DB
              </Link>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}