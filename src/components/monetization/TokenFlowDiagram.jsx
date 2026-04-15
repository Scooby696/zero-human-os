import React from "react";
import { motion } from "framer-motion";
import { Coins, Wallet, Bot, ArrowRight, Building2, TrendingUp, RefreshCw, Users } from "lucide-react";

const nodes = [
  {
    id: "users",
    label: "Users / Businesses",
    sublabel: "Pay for ZHS platform access",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    x: "left-0",
    y: "top-0",
  },
  {
    id: "agents",
    label: "AI Agents",
    sublabel: "Pay each other autonomously",
    icon: Bot,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    x: "right-0",
    y: "top-0",
  },
  {
    id: "treasury",
    label: "ZHS Treasury",
    sublabel: "On-chain smart contract",
    icon: Wallet,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    center: true,
  },
  {
    id: "defi",
    label: "DeFi / Yield",
    sublabel: "Treasury earns yield 24/7",
    icon: TrendingUp,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    x: "left-0",
    y: "bottom-0",
  },
  {
    id: "stakers",
    label: "$ZHS Stakers",
    sublabel: "Revenue share + governance",
    icon: Coins,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
    x: "right-0",
    y: "bottom-0",
  },
];

const flows = [
  { from: "Users pay USDC/x402", to: "Treasury", label: "x402 payments", color: "text-primary" },
  { from: "Agents pay USDC/x402", to: "Treasury", label: "agent-to-agent fees", color: "text-green-400" },
  { from: "Treasury", to: "DeFi protocols", label: "yield farming", color: "text-cyan-400" },
  { from: "Treasury", to: "Stakers", label: "revenue share", color: "text-violet-400" },
  { from: "Treasury", to: "$ZHS buybacks", label: "token support", color: "text-amber-400" },
];

export default function TokenFlowDiagram() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-amber-400/10">
          <RefreshCw className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">$ZHS Token Economy</h2>
          <p className="text-muted-foreground text-sm">How value flows through the Zero Human Systems ecosystem</p>
        </div>
      </div>

      {/* Flow visual */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
        {/* Central treasury */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative p-6 rounded-2xl bg-amber-400/10 border-2 border-amber-400/40 text-center w-44"
          >
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
            <Wallet className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-amber-400">ZHS Treasury</div>
            <div className="text-xs text-muted-foreground mt-1">On-chain smart contract</div>
          </motion.div>
        </div>

        {/* Flow grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, label: "User Payments", sublabel: "USDC via x402", color: "text-primary", bg: "bg-primary/10", dir: "→ Treasury" },
            { icon: Bot, label: "Agent-to-Agent", sublabel: "Autonomous fees", color: "text-green-400", bg: "bg-green-400/10", dir: "→ Treasury" },
            { icon: TrendingUp, label: "DeFi Yield", sublabel: "24/7 earnings", color: "text-cyan-400", bg: "bg-cyan-400/10", dir: "Treasury →" },
            { icon: Coins, label: "$ZHS Stakers", sublabel: "Revenue share", color: "text-violet-400", bg: "bg-violet-400/10", dir: "Treasury →" },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 border border-border/40 text-center"
            >
              <div className={`p-2.5 rounded-xl ${node.bg} mb-3`}>
                <node.icon className={`w-5 h-5 ${node.color}`} />
              </div>
              <div className="text-sm font-semibold text-foreground">{node.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{node.sublabel}</div>
              <div className={`text-xs font-mono mt-2 ${node.color}`}>{node.dir}</div>
            </motion.div>
          ))}
        </div>

        {/* Token utility */}
        <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">$ZHS Token Utility</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Discounted Access", desc: "Hold $ZHS for fee discounts" },
              { label: "Staking Yield", desc: "Earn platform revenue share" },
              { label: "Governance", desc: "Vote on agent features" },
              { label: "Priority Queue", desc: "Stakers get faster compute" },
            ].map((u) => (
              <div key={u.label} className="text-center">
                <div className="text-xs font-semibold text-foreground mb-0.5">{u.label}</div>
                <div className="text-xs text-muted-foreground">{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}