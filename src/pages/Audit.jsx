import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, Terminal, Cpu, Database, Globe, Layers, ShieldCheck,
  DollarSign, Rocket, ArrowLeft, Copy, Check, Activity, Zap,
  GitBranch, Bot, Coins, Server, Lock, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ── Audit checklist ───────────────────────────────────────────────────────────
const auditSections = [
  {
    id: "llm",
    icon: Cpu,
    title: "LLM / Model Layer",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      { label: "Ollama installed & serving Llama 3.3 / Mistral Small", status: "pass", free: true, note: "Verify: curl http://localhost:11434/api/tags — should list available models." },
      { label: "Groq free tier configured as speed-critical fallback", status: "pass", free: true, note: "Free: 14,400 req/day, 6,000 tokens/min. No CC required. Set GROQ_API_KEY in .env." },
      { label: "Model routing logic in CEO Orchestrator (local → Groq → Claude)", status: "warn", free: true, note: "CRITICAL: Without routing, all calls default to paid APIs. Implement cost-tier logic FIRST." },
      { label: "Embedding model for RAG (nomic-embed-text via Ollama)", status: "pass", free: true, note: "ollama pull nomic-embed-text — 768-dim embeddings, free, fast." },
      { label: "Hard monthly spend caps set on all paid LLM APIs", status: "warn", free: true, note: "Set in OpenAI/Anthropic dashboards. Recommended: $50/mo hard limit to start." },
      { label: "LLM timeout & retry logic implemented", status: "warn", free: true, note: "Add 30s timeout + 3 retries with exponential backoff. Missing = agents hang indefinitely." },
    ],
  },
  {
    id: "orchestration",
    icon: Layers,
    title: "Agent Orchestration",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    items: [
      { label: "CrewAI installed and agent roles defined (pip install crewai)", status: "pass", free: true, note: "All 9 agents need: role, goal, backstory, tools[], llm config, max_iter." },
      { label: "CEO Orchestrator can spawn/pause/kill sub-agents", status: "warn", free: true, note: "REAL-WORLD RISK: Without kill switches, runaway agents loop and burn API credits." },
      { label: "Agent-level memory: Chroma PersistentClient on disk", status: "pass", free: true, note: "client = chromadb.PersistentClient(path='./memory') — survives container restarts." },
      { label: "LangGraph stateful workflows for multi-step tasks", status: "pass", free: true, note: "pip install langgraph. Required for: sales pipelines, approval flows, report chains." },
      { label: "n8n self-hosted for external triggers & integrations", status: "pass", free: true, note: "docker run n8nio/n8n — 400+ integrations, cron triggers, webhook handlers." },
      { label: "Dead letter queue for failed agent tasks", status: "fail", free: true, note: "MISSING: Failed tasks need a DLQ (Redis list or Supabase table) or they silently disappear." },
      { label: "Agent output validation layer (schema checking)", status: "fail", free: true, note: "MISSING: Agents return unstructured text. Add Pydantic output parsers or JSON schema validation." },
      { label: "Max task execution time enforced per agent", status: "warn", free: true, note: "Set max_execution_time in CrewAI config. Without this, agents can run for hours." },
    ],
  },
  {
    id: "infra",
    icon: Server,
    title: "Infrastructure & Hosting",
    color: "text-green-400",
    bg: "bg-green-400/10",
    items: [
      { label: "Oracle Cloud Free Tier provisioned (4 ARM CPU, 24GB RAM)", status: "pass", free: true, note: "cloud.oracle.com → Always Free → VM.Standard.A1.Flex. Enough for full 9-agent stack." },
      { label: "Docker Compose with health checks on all services", status: "warn", free: true, note: "REAL-WORLD: Add healthcheck: to each service in docker-compose.yml or containers restart silently broken." },
      { label: "Nginx reverse proxy routing all subdomains", status: "pass", free: true, note: "api.yourdomain.com → :8000 | n8n.yourdomain.com → :5678 | app.yourdomain.com → :3000" },
      { label: "Let's Encrypt SSL with auto-renewal (certbot)", status: "pass", free: true, note: "certbot --nginx -d yourdomain.com && systemctl enable certbot.timer" },
      { label: "Automated daily backups (Supabase + Chroma + .env)", status: "fail", free: true, note: "MISSING: No backup = total data loss on server failure. Use rclone to S3-compatible storage." },
      { label: "Server firewall: UFW rules (only 22, 80, 443 open)", status: "warn", free: true, note: "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable — close all internal ports." },
      { label: "Coolify or Portainer for container management UI", status: "pass", free: true, note: "Self-hosted PaaS. One-click redeployments, logs, env var management." },
      { label: "Swap space configured (8GB+) for Ollama model loading", status: "warn", free: true, note: "CRITICAL: Without swap, Ollama OOM-kills on model load. sudo fallocate -l 8G /swapfile" },
    ],
  },
  {
    id: "database",
    icon: Database,
    title: "Database & Memory",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    items: [
      { label: "Supabase free tier: Postgres + auth + REST API", status: "pass", free: true, note: "500MB DB, 1GB storage. Enable Row Level Security on all tables." },
      { label: "Row Level Security (RLS) enabled on Supabase tables", status: "fail", free: true, note: "CRITICAL SECURITY GAP: Without RLS, any authenticated user can read all data." },
      { label: "Chroma (self-hosted) vector DB for agent semantic memory", status: "pass", free: true, note: "pip install chromadb. Backup the ./memory directory daily." },
      { label: "Redis for agent task queue + pub/sub messaging", status: "pass", free: true, note: "docker run -d -p 6379:6379 --requirepass YOUR_PASS redis:alpine" },
      { label: "Redis password configured (not open by default)", status: "fail", free: true, note: "SECURITY: Default Redis has no auth. --requirepass STRONG_PASSWORD mandatory." },
      { label: "Database connection pooling configured (pgbouncer)", status: "warn", free: true, note: "Without pooling, many agents hit Supabase connection limit (60 free tier)." },
      { label: "Chroma collection TTL / memory pruning strategy defined", status: "warn", free: true, note: "Agent memories grow unbounded. Set TTL or max collection size to prevent disk fill." },
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Security & Hardening",
    color: "text-red-400",
    bg: "bg-red-400/10",
    items: [
      { label: "All secrets in .env — never hardcoded in source", status: "pass", free: true, note: "Use python-dotenv. Verify: git grep -r 'sk-' — should return nothing." },
      { label: ".env added to .gitignore (verified, not just assumed)", status: "warn", free: true, note: "REAL-WORLD INCIDENT CAUSE: Devs push .env to GitHub. Run: git ls-files .env — must return nothing." },
      { label: "Human-in-the-loop gate for actions > $500", status: "warn", free: true, note: "LangGraph interrupt() node before high-value transactions. No HITL = no safety net." },
      { label: "Agent permission scoping (least-privilege per agent)", status: "fail", free: true, note: "MISSING: Finance Agent should not have Stripe write access by default. Scope each agent's tools." },
      { label: "API key rotation schedule defined (quarterly)", status: "fail", free: true, note: "MISSING: All keys should rotate every 90 days. Document in runbook." },
      { label: "Rate limiting on public-facing agent API endpoints", status: "fail", free: true, note: "MISSING: Without rate limits, $100+ LLM bills from a single abuse event." },
      { label: "Agent action audit trail in Langfuse", status: "pass", free: true, note: "Langfuse self-hosted: docker run langfuse/langfuse. Full trace log of every LLM call." },
      { label: "Secrets scanning in CI/CD pipeline (gitleaks)", status: "warn", free: true, note: "pip install gitleaks or use GitHub secret scanning. Block commits with leaked keys." },
    ],
  },
  {
    id: "monitoring",
    icon: Activity,
    title: "Observability & Monitoring",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    items: [
      { label: "Langfuse (self-hosted) for LLM traces + cost tracking", status: "pass", free: true, note: "docker run langfuse/langfuse — tracks every token, cost, latency per agent." },
      { label: "Uptime monitoring (UptimeRobot free tier)", status: "warn", free: true, note: "FREE: Monitor all 5 endpoints. Alert to Slack/email on downtime. uptimerobot.com" },
      { label: "Structured logging (JSON) from all agent processes", status: "warn", free: true, note: "Use Python structlog or loguru. JSON logs required for log aggregation tools." },
      { label: "Loki + Grafana for log aggregation (self-hosted)", status: "warn", free: true, note: "docker-compose with grafana/loki. Free alternative to Datadog/Splunk." },
      { label: "Weekly cost report: LLM spend, compute, API fees", status: "fail", free: true, note: "MISSING: No cost visibility = surprise bills. Add Finance Agent cron to summarize weekly." },
      { label: "Agent error rate tracking + alerting (>5% triggers alert)", status: "fail", free: true, note: "MISSING: High error rates are silent without alerting. Set up Grafana alerts." },
    ],
  },
  {
    id: "cicd",
    icon: GitBranch,
    title: "CI/CD & DevOps",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    items: [
      { label: "GitHub Actions pipeline: test → lint → build → deploy", status: "pass", free: true, note: "Free for public repos. 2,000 minutes/mo free for private." },
      { label: "Automated tests for agent output schemas", status: "fail", free: true, note: "MISSING: Without tests, agent output format regressions are only caught in production." },
      { label: "Docker image pinned to specific versions (not :latest)", status: "warn", free: true, note: "REAL-WORLD ISSUE: :latest pulls break builds. Pin: n8nio/n8n:1.30.0" },
      { label: "Rolling deploys (zero-downtime) for agent services", status: "warn", free: true, note: "docker-compose up --no-deps --build agent-core — avoids full stack restart." },
      { label: "Environment parity: dev / staging / prod", status: "fail", free: true, note: "MISSING: Without staging, every deploy is a production experiment." },
    ],
  },
  {
    id: "crypto",
    icon: Coins,
    title: "Crypto & x402 Readiness",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    items: [
      { label: "x402 middleware installed on agent API endpoints", status: "warn", free: true, note: "npm install x402 (Node) or pip install x402 (Python). Wrap endpoints that require payment." },
      { label: "USDC payment wallet configured on Base network", status: "warn", free: false, note: "Use Coinbase CDP or Dynamic.xyz for embedded agent wallets. Base = low fees, fast finality." },
      { label: "Agent spending limits enforced on wallet (per-tx cap)", status: "fail", free: true, note: "CRITICAL: Without spending caps, an agent bug could drain the treasury." },
      { label: "On-chain treasury multi-sig (3-of-5 signers)", status: "fail", free: false, note: "MISSING: Single key treasury = single point of failure. Use Safe.global multi-sig." },
      { label: "x402 fallback to Stripe fiat for non-crypto users", status: "warn", free: false, note: "Maintain Stripe integration as fallback during x402 adoption curve." },
      { label: "$ZHS token contract audited before launch", status: "fail", free: false, note: "CRITICAL: Never launch an unaudited token. Use OpenZeppelin Defender or Zellic audit." },
    ],
  },
  {
    id: "integrations",
    icon: Globe,
    title: "Business Integrations",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    items: [
      { label: "Stripe API for autonomous payments (webhook verified)", status: "pass", free: true, note: "IMPORTANT: Verify Stripe webhook signatures. Unverified = replay attack vulnerability." },
      { label: "Gmail OAuth2 with refresh token (not just access token)", status: "warn", free: true, note: "Access tokens expire in 1hr. Store refresh token or agent loses email access overnight." },
      { label: "Slack webhook for agent alerts + daily briefings", status: "pass", free: true, note: "Free. Create Slack App → Incoming Webhooks → copy URL to SLACK_WEBHOOK_URL." },
      { label: "GitHub fine-grained PAT scoped to required repos only", status: "warn", free: true, note: "Never use classic PAT with full repo access. Fine-grained PAT per repo per agent." },
      { label: "Webhook HMAC signature validation on all inbound hooks", status: "fail", free: true, note: "SECURITY: Verify X-Hub-Signature-256 on GitHub, Stripe-Signature on Stripe, etc." },
    ],
  },
];

// ── Critical Issues ───────────────────────────────────────────────────────────
const criticalIssues = [
  { id: "rls", label: "Supabase RLS disabled", impact: "Any authenticated user can read/write ALL data", fix: "Enable RLS in Supabase dashboard → Auth → Policies → add policies per table", severity: "critical" },
  { id: "redis-auth", label: "Redis has no password", impact: "Open Redis = data exfil, cache poisoning, remote code execution", fix: "Add --requirepass STRONG_PASSWORD to Redis Docker command", severity: "critical" },
  { id: "rate-limits", label: "No API rate limiting on public endpoints", impact: "Single abusive request = $100+ LLM bill", fix: "Add nginx rate limiting: limit_req_zone + limit_req directives", severity: "critical" },
  { id: "dlq", label: "No dead letter queue for failed agent tasks", impact: "Failed tasks silently disappear with no retry or alerting", fix: "Add Redis list as DLQ: LPUSH failed_tasks {task_json} on exception", severity: "high" },
  { id: "permissions", label: "Agent permission scoping not implemented", impact: "Any agent can call any API — Finance Agent could delete users", fix: "Define tools[] per agent. Only assign tools the agent strictly needs.", severity: "high" },
  { id: "backups", label: "No automated backups configured", impact: "Server failure = permanent loss of all agent memory + data", fix: "cron: 0 2 * * * rclone sync /data backblaze:zhs-backup", severity: "high" },
];

// ── Deploy steps ──────────────────────────────────────────────────────────────
const deploySteps = [
  {
    step: "01",
    title: "Spin Up Free Server",
    time: "~15 min",
    commands: [
      "# Oracle Cloud Free Tier (recommended — always free)",
      "# cloud.oracle.com → Always Free → VM.Standard.A1.Flex",
      "# OS: Ubuntu 22.04 LTS | 4 OCPU | 24GB RAM | 200GB storage",
      "",
      "# After SSH in — configure swap for Ollama",
      "sudo fallocate -l 8G /swapfile",
      "sudo chmod 600 /swapfile && sudo mkswap /swapfile",
      "sudo swapon /swapfile",
      "echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab",
    ],
  },
  {
    step: "02",
    title: "Install Core Dependencies",
    time: "~10 min",
    commands: [
      "sudo apt update && sudo apt install -y docker.io docker-compose git python3-pip nginx certbot python3-certbot-nginx",
      "sudo usermod -aG docker $USER && newgrp docker",
      "",
      "# Install Ollama",
      "curl -fsSL https://ollama.com/install.sh | sh",
      "ollama pull llama3.3        # main reasoning model",
      "ollama pull mistral-small   # fast, cheap fallback",
      "ollama pull nomic-embed-text  # RAG embeddings",
    ],
  },
  {
    step: "03",
    title: "Configure Firewall",
    time: "~5 min",
    commands: [
      "# Only expose ports 22 (SSH), 80 (HTTP), 443 (HTTPS)",
      "sudo ufw default deny incoming",
      "sudo ufw default allow outgoing",
      "sudo ufw allow 22/tcp",
      "sudo ufw allow 80/tcp",
      "sudo ufw allow 443/tcp",
      "sudo ufw enable",
      "",
      "# Verify",
      "sudo ufw status verbose",
    ],
  },
  {
    step: "04",
    title: "Deploy Agent Stack",
    time: "~20 min",
    commands: [
      "git clone https://github.com/YOUR_ORG/zero-human-os.git",
      "cd zero-human-os",
      "cp .env.example .env",
      "# Fill in: GROQ_API_KEY, ANTHROPIC_API_KEY, SUPABASE_URL,",
      "# SUPABASE_ANON_KEY, REDIS_PASSWORD, STRIPE_SECRET_KEY",
      "",
      "docker-compose up -d",
      "",
      "# Verify all services healthy",
      "docker-compose ps",
      "curl http://localhost:8000/health  # agent API",
      "curl http://localhost:11434/api/tags  # Ollama models",
    ],
  },
  {
    step: "05",
    title: "Set Up SSL & Domain",
    time: "~10 min",
    commands: [
      "# Point DNS A records to your server IP:",
      "# yourdomain.com       → YOUR_IP",
      "# api.yourdomain.com   → YOUR_IP",
      "# n8n.yourdomain.com   → YOUR_IP",
      "",
      "# Get free wildcard SSL",
      "sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com -d n8n.yourdomain.com",
      "",
      "# Enable auto-renewal",
      "sudo systemctl enable certbot.timer",
      "sudo systemctl start certbot.timer",
    ],
  },
  {
    step: "06",
    title: "Configure Automated Backups",
    time: "~15 min",
    commands: [
      "# Install rclone (free, supports B2/S3/GDrive)",
      "curl https://rclone.org/install.sh | sudo bash",
      "rclone config  # add your backup provider",
      "",
      "# Create backup script",
      "cat > /home/ubuntu/backup.sh << 'EOF'",
      "#!/bin/bash",
      "DATE=$(date +%Y%m%d)",
      "docker exec postgres pg_dump zhs_db > /tmp/db_$DATE.sql",
      "tar -czf /tmp/memory_$DATE.tar.gz /data/chroma",
      "rclone copy /tmp/ backblaze:zhs-backups/$DATE/",
      "EOF",
      "chmod +x /home/ubuntu/backup.sh",
      "",
      "# Schedule daily at 2am",
      "(crontab -l; echo '0 2 * * * /home/ubuntu/backup.sh') | crontab -",
    ],
  },
  {
    step: "07",
    title: "Start Monitoring Stack",
    time: "~10 min",
    commands: [
      "# Langfuse (LLM observability — self-hosted free)",
      "docker run -d --name langfuse -p 3001:3000 \\",
      "  -e NEXTAUTH_SECRET=yoursecret \\",
      "  -e DATABASE_URL=postgresql://... \\",
      "  langfuse/langfuse:latest",
      "",
      "# UptimeRobot: free account at uptimerobot.com",
      "# Add monitors for:",
      "# - https://api.yourdomain.com/health",
      "# - https://n8n.yourdomain.com",
      "# Alert to Slack on downtime",
    ],
  },
  {
    step: "08",
    title: "Harden & Go Live",
    time: "~15 min",
    commands: [
      "# Enable Supabase RLS on all tables",
      "# Supabase dashboard → Table Editor → RLS → Enable",
      "",
      "# Set Redis password (restart required)",
      "# In docker-compose.yml: command: redis-server --requirepass YOURPASSWORD",
      "docker-compose restart redis",
      "",
      "# Add Nginx rate limiting",
      "# In /etc/nginx/conf.d/api.conf:",
      "# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;",
      "# limit_req zone=api burst=20 nodelay;",
      "sudo nginx -t && sudo systemctl reload nginx",
      "",
      "# Final health check",
      "docker-compose ps  # all services should show 'healthy'",
    ],
  },
];

// ── Cost breakdown ────────────────────────────────────────────────────────────
const costs = [
  { item: "Server (Oracle Cloud Free)", monthly: "$0", annual: "$0", note: "Always-free, 4 CPU + 24GB RAM" },
  { item: "LLM — Ollama local (Llama 3.3)", monthly: "$0", annual: "$0", note: "Runs on your server, zero API cost" },
  { item: "LLM — Groq (fast fallback)", monthly: "$0", annual: "$0", note: "14.4K req/day free tier" },
  { item: "Database — Supabase", monthly: "$0", annual: "$0", note: "500MB free tier" },
  { item: "Automation — n8n (self-hosted)", monthly: "$0", annual: "$0", note: "Docker container, no license fee" },
  { item: "Vector DB — Chroma (self-hosted)", monthly: "$0", annual: "$0", note: "Runs on same server" },
  { item: "Monitoring — Langfuse (self-hosted)", monthly: "$0", annual: "$0", note: "Full LLM observability, free" },
  { item: "SSL Certificate", monthly: "$0", annual: "$0", note: "Let's Encrypt auto-renews" },
  { item: "Backups — Backblaze B2", monthly: "$0", annual: "$0", note: "10GB free, then $0.006/GB" },
  { item: "Uptime Monitoring — UptimeRobot", monthly: "$0", annual: "$0", note: "50 monitors free" },
  { item: "Domain name", monthly: "$1", annual: "$12", note: "Namecheap ~$12/yr — only required cost" },
  { item: "Claude API (optional, complex tasks)", monthly: "$15–40", annual: "$180–480", note: "~500K tokens/mo. Use only when needed." },
];

// ── Readiness score ───────────────────────────────────────────────────────────
const readinessItems = [
  { label: "Free deployment possible", score: 10, max: 10 },
  { label: "Infrastructure stability", score: 8, max: 10 },
  { label: "Security & hardening", score: 5, max: 10 },
  { label: "Production observability", score: 6, max: 10 },
  { label: "Agent reliability", score: 6, max: 10 },
  { label: "Scalability headroom", score: 7, max: 10 },
  { label: "Crypto/x402 readiness", score: 4, max: 10 },
  { label: "CI/CD maturity", score: 5, max: 10 },
];

// ── CodeBlock ─────────────────────────────────────────────────────────────────
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

const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "CRITICAL" },
  high: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "HIGH" },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Audit() {
  const [openSection, setOpenSection] = useState("security");
  const [openStep, setOpenStep] = useState("01");

  const allItems = auditSections.flatMap(s => s.items);
  const totalPasses = allItems.filter(i => i.status === "pass").length;
  const totalWarns = allItems.filter(i => i.status === "warn").length;
  const totalFails = allItems.filter(i => i.status === "fail").length;
  const totalFree = allItems.filter(i => i.free).length;
  const overallScore = Math.round((totalPasses / allItems.length) * 100);

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
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">Readiness Score</span>
            <span className={`text-lg font-bold ${overallScore >= 70 ? "text-green-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {overallScore}%
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Zero Human Systems — Full Deployment Audit
                </h1>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                  Comprehensive real-world assessment covering infrastructure, security hardening, agent reliability, observability, CI/CD, and crypto readiness. Identifies critical gaps before production launch.
                </p>
              </div>
              <div className="flex flex-wrap gap-5 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">{totalPasses}</div>
                  <div className="text-xs text-muted-foreground mt-1">Passing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-amber-400">{totalWarns}</div>
                  <div className="text-xs text-muted-foreground mt-1">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-red-400">{totalFails}</div>
                  <div className="text-xs text-muted-foreground mt-1">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary">{totalFree}</div>
                  <div className="text-xs text-muted-foreground mt-1">Free Tools</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Critical Issues */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-foreground">Critical Issues — Fix Before Launch</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalIssues.map((issue) => {
              const s = severityConfig[issue.severity];
              return (
                <div key={issue.id} className={`p-5 rounded-2xl bg-card border ${s.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                    <span className="text-sm font-semibold text-foreground">{issue.label}</span>
                  </div>
                  <p className="text-xs text-red-400/80 mb-2"><strong>Impact:</strong> {issue.impact}</p>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed"><strong className="text-foreground">Fix:</strong> {issue.fix}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Readiness Scorecard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Readiness Scorecard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {readinessItems.map((item) => {
              const pct = (item.score / item.max) * 100;
              const color = pct >= 80 ? "from-green-400 to-emerald-400" : pct >= 60 ? "from-amber-400 to-yellow-400" : "from-red-400 to-orange-400";
              return (
                <Card key={item.label} className="bg-card border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-lg font-bold text-foreground">{item.score}<span className="text-xs text-muted-foreground">/{item.max}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/50">
                      <motion.div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Audit Checklist */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Full Technical Audit Checklist</h2>
          <div className="space-y-3">
            {auditSections.map((section) => {
              const passes = section.items.filter(i => i.status === "pass").length;
              const fails = section.items.filter(i => i.status === "fail").length;
              return (
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
                      <span className="text-xs text-green-400">{passes} pass</span>
                      {fails > 0 && <span className="text-xs text-red-400">{fails} fail</span>}
                    </div>
                    {openSection === section.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {openSection === section.id && (
                    <div className="px-5 pb-5 space-y-3 border-t border-border/30">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 pt-3">
                          {item.status === "pass" && <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />}
                          {item.status === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                          {item.status === "fail" && <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${item.status === "fail" ? "text-red-300" : "text-foreground"}`}>{item.label}</span>
                              {item.free && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 font-medium">FREE</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono leading-relaxed">{item.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Deploy Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Step-by-Step Deployment Guide</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">From zero to hardened production deployment. Estimated: ~100 minutes total.</p>
          <div className="space-y-3">
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
                  <div className="px-5 pb-5 border-t border-border/30 pt-4">
                    <CodeBlock lines={step.commands} />
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
              <p className="text-muted-foreground text-sm">Fix the 6 critical issues first, then follow the 8-step guide. Total cost: $1/year.</p>
            </div>
            <div className="flex flex-wrap gap-3">
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
                to="/monetization"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium hover:bg-amber-400/20 transition-colors"
              >
                <Coins className="w-4 h-4" />
                Monetization Guide
              </Link>
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