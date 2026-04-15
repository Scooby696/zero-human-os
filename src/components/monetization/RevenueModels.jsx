import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Coins, CreditCard, Store, TrendingUp, Layers, ExternalLink } from "lucide-react";

const models = [
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    title: "x402 Pay-Per-Use",
    badge: "Core Model",
    badgeColor: "bg-amber-400/15 text-amber-400",
    desc: "Charge per agent execution, API call, report, or workflow. AI agents pay autonomously with no human approval needed.",
    pricing: [
      { item: "Simple agent task", price: "$0.01–$0.10" },
      { item: "Complex orchestration", price: "$0.50–$5.00" },
      { item: "Full report generation", price: "$1–$20" },
      { item: "API access (per call)", price: "$0.001–$0.05" },
    ],
    link: "https://docs.cdp.coinbase.com/x402",
    linkLabel: "x402 Docs",
  },
  {
    icon: Coins,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    title: "$ZHS Tokenomics",
    badge: "Native Token",
    badgeColor: "bg-violet-400/15 text-violet-400",
    desc: "Launch $ZHS on Base or Solana. Token holders get discounts, staking yield, and governance rights.",
    pricing: [
      { item: "Staking APY (target)", price: "15–40%" },
      { item: "Fee discount (holders)", price: "20–50%" },
      { item: "Fair launch (Pump.fun)", price: "~$500 setup" },
      { item: "Platform fee cut", price: "10–20%" },
    ],
    link: "https://pump.fun",
    linkLabel: "Launch Token",
  },
  {
    icon: CreditCard,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Subscription Tiers",
    badge: "Recurring",
    badgeColor: "bg-primary/15 text-primary",
    desc: "Monthly/annual plans paid in USDC or $ZHS. Higher tiers unlock more agents, compute, and private instances.",
    pricing: [
      { item: "Free tier", price: "$0/mo" },
      { item: "Starter (3 agents)", price: "$29/mo USDC" },
      { item: "Pro (all agents)", price: "$99/mo USDC" },
      { item: "Enterprise", price: "Custom" },
    ],
    link: null,
  },
  {
    icon: Store,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    title: "Agent Marketplace",
    badge: "Ecosystem",
    badgeColor: "bg-green-400/15 text-green-400",
    desc: "Users list and sell custom agents, templates, and ZHC blueprints. Platform takes 10–20% via x402.",
    pricing: [
      { item: "Platform cut", price: "10–20%" },
      { item: "Template listing", price: "$5–$500" },
      { item: "White-label license", price: "$1K–$50K" },
      { item: "Custom ZHC deploy", price: "$500–$5K" },
    ],
    link: null,
  },
  {
    icon: TrendingUp,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    title: "On-Chain Treasury",
    badge: "Yield",
    badgeColor: "bg-cyan-400/15 text-cyan-400",
    desc: "All fees flow to an on-chain treasury. Finance Agent autonomously earns DeFi yield and distributes dividends.",
    pricing: [
      { item: "DeFi lending yield", price: "5–15% APY" },
      { item: "Liquidity provision", price: "10–30% APY" },
      { item: "Auto-buyback", price: "20% of fees" },
      { item: "Staker dividends", price: "Weekly USDC" },
    ],
    link: "https://docs.cdp.coinbase.com",
    linkLabel: "Coinbase CDP",
  },
  {
    icon: Layers,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    title: "Hybrid Freemium",
    badge: "Growth",
    badgeColor: "bg-orange-400/15 text-orange-400",
    desc: "Free tier with Ollama/local models drives adoption. Top-up credits via x402. Upsell to frontier models.",
    pricing: [
      { item: "Free: Ollama/Groq", price: "$0" },
      { item: "Top-up credits", price: "$0.001/task" },
      { item: "Claude/GPT-4o access", price: "+30% margin" },
      { item: "Custom memory/RAG", price: "+$20/mo" },
    ],
    link: null,
  },
];

export default function RevenueModels() {
  const [active, setActive] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Revenue Models</h2>
        <p className="text-muted-foreground">Six monetization streams for the ZHS platform — stack them for maximum revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setActive(active === i ? null : i)}
            className={`cursor-pointer p-6 rounded-2xl bg-card border transition-all duration-300 ${
              active === i ? `${m.border}` : "border-border/50 hover:border-border"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">{m.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.desc}</p>

            {active === i && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <div className="border-t border-border/40 pt-4 space-y-2">
                  {m.pricing.map((p) => (
                    <div key={p.item} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{p.item}</span>
                      <span className={`font-semibold ${m.color}`}>{p.price}</span>
                    </div>
                  ))}
                  {m.link && (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${m.color} hover:underline`}
                    >
                      {m.linkLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            <div className={`text-xs font-medium ${m.color} mt-2`}>
              {active === i ? "Click to collapse ↑" : "Click for pricing ↓"}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}