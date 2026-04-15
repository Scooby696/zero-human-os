import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Coins, Zap, Layers, ArrowRight, ArrowLeftRight,
  Shield, TrendingUp, Clock, CheckCircle2, ExternalLink,
  ChevronDown, ChevronUp, Wallet, Globe, BarChart3, Lock,
  RefreshCw, Server, Code2, Cpu, DollarSign, GitBranch
} from "lucide-react";

const PHASES = [
  { phase: "MVP", focus: "x402 on core endpoints", deliverables: "Platform + 1 ZHC x402 flow", time: "1–2 weeks", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { phase: "Dual-Sided", focus: "User treasury contracts", deliverables: "Auto-deploy per ZHC", time: "+2 weeks", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { phase: "Full Economy", focus: "$ZHS token + staking", deliverables: "Treasury automation", time: "+3–4 weeks", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { phase: "Scale", focus: "Yield + marketplace", deliverables: "Agent-to-agent commerce", time: "Ongoing", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
];

const STACK_LAYERS = [
  {
    num: "1",
    title: "Application & Orchestration",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      { name: "LangGraph", desc: "Stateful multi-step agent workflows" },
      { name: "CrewAI", desc: "Role-based agent teams with defined tools" },
      { name: "x402 Tool", desc: "Payment function injected into every agent" },
      { name: "Next.js + Vercel", desc: "Dashboard with embedded wallet UI" },
    ],
  },
  {
    num: "2",
    title: "Payment Layer (x402 Middleware)",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    items: [
      { name: "Coinbase x402 SDK", desc: "Wrap every ZHS API endpoint with 402 middleware" },
      { name: "USDC on Base", desc: "Low-fee stablecoin, instant finality" },
      { name: "USDC on Solana", desc: "Ultra-fast for high-volume agent payments" },
      { name: "viem / ethers.js", desc: "On-chain tx verification and signing" },
    ],
  },
  {
    num: "3",
    title: "Wallet & Agent Identity",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    items: [
      { name: "Dynamic.xyz", desc: "Embedded agent wallets (Base + Solana)" },
      { name: "Privy", desc: "Alternative embedded wallet provider" },
      { name: "Spending Controls", desc: "Per-agent budgets + human-in-the-loop gates" },
      { name: "On-Chain Passports", desc: "Agent identity NFTs for trust & discovery" },
    ],
  },
  {
    num: "4",
    title: "On-Chain Infrastructure",
    color: "text-green-400",
    bg: "bg-green-400/10",
    items: [
      { name: "Platform Treasury Contract", desc: "Receives all ZHS fees, managed by Finance Agent" },
      { name: "Per-ZHC Treasury", desc: "Auto-deployed smart contract per user company" },
      { name: "$ZHS Token (ERC-20/SPL)", desc: "Staking, governance, fee discounts" },
      { name: "Revenue Share Contracts", desc: "DeFi yield on USDC, auto-distribution" },
    ],
  },
  {
    num: "5",
    title: "Treasury & Yield",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    items: [
      { name: "Finance Agent", desc: "Monitors treasury 24/7, triggers yield moves" },
      { name: "Lending Protocols", desc: "Auto-yield on idle USDC in treasury" },
      { name: "$ZHS Buybacks", desc: "Platform fees → open market buybacks" },
      { name: "Dual Distribution", desc: "Platform treasury + ZHC treasury → stakers" },
    ],
  },
  {
    num: "6",
    title: "Analytics & Compliance",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    items: [
      { name: "Dune Analytics", desc: "Real-time on-chain revenue dashboard" },
      { name: "LangSmith", desc: "Agent trace observability + cost tracking" },
      { name: "Legal Agent", desc: "Regulatory compliance + audit log generation" },
      { name: "Spending Caps", desc: "Hard limits per agent, per wallet, per tx" },
    ],
  },
];

const FLOWS = [
  {
    id: "platform",
    title: "Platform Revenue (ZHS Earns)",
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/20",
    icon: DollarSign,
    steps: [
      "User / ZHC triggers an agent workflow",
      "ZHS x402 middleware intercepts → returns HTTP 402",
      "Agent wallet auto-pays USDC (e.g. $0.10–$5 per run)",
      "Payment proof attached → request retried and fulfilled",
      "Fee lands in Central Platform Treasury (multi-sig)",
      "Finance Agent deploys to yield / $ZHS buyback",
    ],
  },
  {
    id: "user",
    title: "User / ZHC Revenue (You Earn)",
    color: "text-amber-400",
    bg: "bg-amber-400/5",
    border: "border-amber-400/20",
    icon: TrendingUp,
    steps: [
      "ZHC Marketing Agent generates a competitive report",
      "Report endpoint is x402-gated (price set by ZHC owner)",
      "External agent or human requests the report",
      "Buyer's wallet auto-pays → payment lands in ZHC Treasury",
      "ZHC Treasury auto-distributes: owner share + $ZHS staker share",
      "Finance Agent compounds yield on idle USDC",
    ],
  },
];

function FlowStep({ step, index }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-secondary/80 text-xs font-bold text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30 bg-secondary/20 flex items-center gap-2">
        <Code2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Architecture Flow</span>
        <span className="text-xs text-muted-foreground ml-auto">Base + Solana · USDC · x402</span>
      </div>
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* User/ZHC Side */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">User / ZHC Layer</div>
            <div className="space-y-2">
              {["ZHC Agents (Product, Sales, Marketing…)", "x402-Enabled Output Endpoints", "Agent Wallet (Spending Limits)", "ZHC On-Chain Treasury"].map((n, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Shared infra */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Shared On-Chain Infra</div>
            <div className="space-y-2 flex-1">
              {["$ZHS Token (Utility + Governance)", "USDC on Base / Solana", "Agent Wallets (Dynamic.xyz/Privy)", "Smart Contracts (Yield, Buyback, Revenue Share)"].map((n, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {n}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              <div className="flex flex-col items-center gap-1">
                <ArrowLeftRight className="w-4 h-4 text-primary/50" />
                <span className="text-xs text-muted-foreground/50">ZHC Treasury</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowLeftRight className="w-4 h-4 text-primary/50" />
                <span className="text-xs text-muted-foreground/50">Platform Treasury</span>
              </div>
            </div>
          </div>

          {/* ZHS Platform Side */}
          <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-4">
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">ZHS Platform Layer</div>
            <div className="space-y-2">
              {["ZHS Orchestrator (LangGraph/CrewAI)", "x402 Middleware (All Endpoints)", "Platform Revenue Wallet", "Central Treasury (Multi-Sig + Finance Agent)"].map((n, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flywheel */}
        <div className="mt-6 p-4 rounded-xl bg-secondary/20 border border-border/30">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">Compounding Flywheel</div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            {["More Agents", "→", "More Payments", "→", "Treasury Yield", "→", "$ZHS Buybacks", "→", "Higher Token Value", "→", "More Staking", "→", "Better Discounts", "→", "More Adoption", "→"].map((s, i) => (
              <span key={i} className={s === "→" ? "text-primary/40" : "px-2 py-1 rounded-lg bg-secondary/60 text-foreground/80"}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CryptoArchitecture() {
  const [openStack, setOpenStack] = useState(null);

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
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-foreground">Crypto Monetization Architecture</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">COMING SOON</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Coming Soon — Implementation in Progress
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
              Dual-Sided Crypto<br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-primary bg-clip-text text-transparent">
                Monetization Architecture
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-3 leading-relaxed">
              <strong className="text-foreground">Monetize Both Ends:</strong> Platform Revenue + User ZHC Revenue — All On-Chain & Agent-Native.
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              "Agents pay agents. The platform earns. Your Zero Human Companies earn. Everything compounds autonomously."
            </p>
          </div>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-400/10 via-orange-400/5 to-transparent border border-amber-400/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Status: Architecture Defined — Implementation Pending</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">What's Being Built</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  This page documents the complete dual-sided crypto monetization stack for ZHS. The architecture is finalized. Smart contracts, x402 middleware, and treasury automation are in the implementation queue. This is not a simulation — this is the actual technical blueprint.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 shrink-0">
                {[
                  { label: "Architecture", status: "Complete", color: "text-green-400" },
                  { label: "x402 Middleware", status: "In Progress", color: "text-amber-400" },
                  { label: "Smart Contracts", status: "Pending", color: "text-orange-400" },
                  { label: "$ZHS Token", status: "Pending", color: "text-orange-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-background/60 rounded-xl p-3 text-center">
                    <div className={`text-xs font-bold ${s.color} mb-0.5`}>{s.status}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-card border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Platform Side (ZHS Earns)</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn from every agent execution, API call, report, or compute usage via instant x402 micropayments. Every workflow run triggers a sub-cent to multi-dollar USDC payment directly into the ZHS treasury — zero billing, zero invoices.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-amber-400/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-400/10">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <span className="font-semibold text-foreground">User / ZHC Side (You Earn)</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every deployed Zero Human Company can autonomously monetize its own outputs — selling reports, services, and workflows to other agents or humans using the same x402 rails. Your agents earn while you sleep.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Philosophy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">Core Philosophy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "x402 Protocol", color: "text-primary", bg: "bg-primary/10", desc: "HTTP 402 'Payment Required' — the 2026 standard for AI agent micropayments. Agents pay instantly without accounts, logins, or human approval. Coinbase + Cloudflare backed." },
              { icon: ArrowLeftRight, title: "Dual Revenue Flows", color: "text-amber-400", bg: "bg-amber-400/10", desc: "Platform collects fees from users. Users collect fees from external agents. Both sides compound through the same $ZHS treasury and staking mechanics." },
              { icon: Lock, title: "On-Chain Treasury", color: "text-green-400", bg: "bg-green-400/10", desc: "All fees flow into smart-contract treasuries managed by the Finance Agent. Fully transparent, auditable, yield-generating, with automated buyback logic." },
            ].map((c) => (
              <div key={c.title} className="p-5 rounded-2xl bg-card border border-border/50">
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.color} w-fit mb-3`}>
                  <c.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">Architecture Diagram</h2>
          <ArchDiagram />
        </motion.div>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">Layered Tech Stack</h2>
          <p className="text-sm text-muted-foreground mb-5">Production-ready 2026. Click each layer to expand.</p>
          <div className="space-y-3">
            {STACK_LAYERS.map((layer) => (
              <div key={layer.num} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                <button
                  onClick={() => setOpenStack(openStack === layer.num ? null : layer.num)}
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${layer.bg} ${layer.color} flex items-center justify-center text-sm font-bold`}>
                      {layer.num}
                    </div>
                    <span className="font-semibold text-foreground">{layer.title}</span>
                  </div>
                  {openStack === layer.num ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openStack === layer.num && (
                  <div className="px-5 pb-5 border-t border-border/30 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {layer.items.map((item) => (
                      <div key={item.name} className="flex items-start gap-3 bg-background/60 rounded-xl p-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${layer.color} mt-1.5 shrink-0`} style={{ background: "currentColor" }} />
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monetization Flows */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <h2 className="text-2xl font-bold text-foreground mb-5">Monetization Flows (Both Ends)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FLOWS.map((flow) => (
              <div key={flow.id} className={`p-6 rounded-2xl border ${flow.bg} ${flow.border}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-xl bg-background/60`}>
                    <flow.icon className={`w-4 h-4 ${flow.color}`} />
                  </div>
                  <h3 className={`font-bold ${flow.color}`}>{flow.title}</h3>
                </div>
                <div className="space-y-3">
                  {flow.steps.map((step, i) => (
                    <FlowStep key={i} step={step} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-foreground mb-5">Implementation Roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((p, i) => (
              <div key={p.phase} className={`p-5 rounded-2xl bg-card border ${p.border}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>Phase {i + 1}</span>
                </div>
                <div className={`text-lg font-black ${p.color} mb-1`}>{p.phase}</div>
                <div className="text-sm font-medium text-foreground mb-1">{p.focus}</div>
                <div className="text-xs text-muted-foreground mb-3">{p.deliverables}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {p.time}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <h2 className="text-2xl font-bold text-foreground mb-5">Why This Architecture Wins in 2026</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Cpu, title: "Agent-First", color: "text-primary", desc: "Designed for machine-to-machine payments. x402 is the emerging HTTP standard — adopted by Coinbase, Cloudflare, and top AI labs." },
              { icon: Zap, title: "Zero Friction", color: "text-amber-400", desc: "No subscriptions, no invoices, no billing cycles for one-off agent usage. Pay per call, in USDC, instantly." },
              { icon: ArrowLeftRight, title: "Dual Revenue", color: "text-green-400", desc: "You earn as the platform operator AND your users earn through their ZHC agents. Viral growth mechanic built in." },
              { icon: Globe, title: "Completely On-Chain", color: "text-violet-400", desc: "Every payment, fee, and distribution is transparent, auditable, and yield-generating. No black-box billing." },
              { icon: Shield, title: "Future-Proof", color: "text-cyan-400", desc: "Works with any frontier LLM or new agent framework. x402 is chain-agnostic and model-agnostic." },
              { icon: RefreshCw, title: "Self-Compounding", color: "text-orange-400", desc: "Treasury yields fund buybacks. Buybacks increase token value. Higher value attracts stakers. Stakers drive adoption. Repeat." },
            ].map((b) => (
              <div key={b.title} className="p-5 rounded-2xl bg-card border border-border/50">
                <div className={`${b.color} mb-3`}><b.icon className="w-5 h-5" /></div>
                <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-400/10 via-primary/5 to-transparent border border-amber-400/20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold mb-4">
              <Clock className="w-3.5 h-3.5" /> COMING SOON
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">
              This Is Not Just Monetization
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm leading-relaxed">
              It's an entire agent economy running on your platform. When x402 middleware ships, every agent execution on ZHS becomes a real revenue event — for the platform and for every Zero Human Company deployed on it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://docs.cdp.coinbase.com/x402" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors">
                <Zap className="w-4 h-4" /> x402 Docs <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link to="/monetization"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                <Coins className="w-4 h-4" /> Token Economy
              </Link>
              <Link to="/audit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-4 h-4" /> Deployment Audit
              </Link>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}