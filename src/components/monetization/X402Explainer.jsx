import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Server, CheckCircle2, Bot, ArrowRight, ExternalLink } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Agent Requests Resource",
    desc: "An AI agent (or human) makes an HTTP request to a ZHS API endpoint — e.g., run a marketing analysis, generate a sales report, or execute a workflow.",
    code: 'GET /api/agents/marketing/run\nAuthorization: none',
  },
  {
    num: "02",
    icon: Server,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "Server Returns HTTP 402",
    desc: "The ZHS server responds with payment instructions: amount in USDC, wallet address on Base/Solana, and a payment nonce.",
    code: 'HTTP/1.1 402 Payment Required\n{\n  "amount": "0.50",\n  "token": "USDC",\n  "chain": "base",\n  "address": "0x...ZHS_TREASURY",\n  "nonce": "abc123"\n}',
  },
  {
    num: "03",
    icon: Zap,
    color: "text-green-400",
    bg: "bg-green-400/10",
    title: "Agent Pays Instantly",
    desc: "The agent's embedded wallet signs and submits the on-chain payment — no human approval needed. Transaction settles in ~1 second on Base.",
    code: 'POST /api/agents/marketing/run\nX-Payment-Tx: 0x9f2a...\nX-Payment-Nonce: abc123',
  },
  {
    num: "04",
    icon: CheckCircle2,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    title: "Server Verifies & Delivers",
    desc: "ZHS verifies the on-chain transaction, logs the payment to the treasury, and delivers the requested output. Full cycle: ~2 seconds.",
    code: 'HTTP/1.1 200 OK\n{\n  "status": "success",\n  "output": { ...report },\n  "tx_logged": true\n}',
  },
];

export default function X402Explainer() {
  const [active, setActive] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-amber-400/10">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">What is x402?</h2>
          <p className="text-muted-foreground text-sm">The HTTP payment standard that powers ZHS agent payments</p>
        </div>
        <a
          href="https://x402.org"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          x402.org <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 text-sm text-muted-foreground mb-8 leading-relaxed">
        <strong className="text-amber-400">x402</strong> revives the long-dormant HTTP 402 "Payment Required" status code as an open, internet-native micropayment standard — backed by <strong className="text-foreground">Coinbase, Stripe, Cloudflare, and Vercel</strong>. 
        It's the perfect payment rail for AI agents: no accounts, no subscriptions, no human approval — just instant stablecoin payments.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step list */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <button
              key={step.num}
              onClick={() => setActive(i)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${
                active === i
                  ? "bg-card border-amber-400/30"
                  : "border-border/30 hover:bg-secondary/30"
              }`}
            >
              <div className={`p-2 rounded-xl ${step.bg} ${step.color} shrink-0`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground/60">{step.num}</span>
                  <span className={`text-sm font-semibold ${active === i ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Code preview */}
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl bg-background border border-border/50 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/20">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">x402-flow — step {steps[active].num}</span>
          </div>
          <pre className="p-6 text-sm font-mono text-green-400/90 leading-loose whitespace-pre-wrap">
            {steps[active].code}
          </pre>
        </motion.div>
      </div>
    </motion.div>
  );
}