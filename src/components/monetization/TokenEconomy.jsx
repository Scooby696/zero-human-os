import React from "react";
import { motion } from "framer-motion";
import { Coins, ExternalLink } from "lucide-react";

const distribution = [
  { label: "Community / Fair Launch", pct: 40, color: "bg-amber-400" },
  { label: "Platform Treasury", pct: 25, color: "bg-primary" },
  { label: "Team (2-yr vesting)", pct: 15, color: "bg-violet-400" },
  { label: "Ecosystem Grants", pct: 10, color: "bg-green-400" },
  { label: "Liquidity Pool", pct: 10, color: "bg-cyan-400" },
];

const tokenDetails = [
  { label: "Token Name", value: "Zero Human Systems Token" },
  { label: "Ticker", value: "$ZHS" },
  { label: "Preferred Chain", value: "Base (low fees, agent-friendly)" },
  { label: "Alternative Chain", value: "Solana (ultra-fast, Pump.fun ready)" },
  { label: "Total Supply", value: "1,000,000,000 $ZHS" },
  { label: "Launch Method", value: "Fair Launch (Pump.fun or Unicorn.eth)" },
  { label: "Standard", value: "ERC-20 (Base) / SPL (Solana)" },
  { label: "Treasury", value: "On-chain multisig, managed by Finance Agent" },
];

export default function TokenEconomy() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-amber-400/10">
          <Coins className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">$ZHS Token Details</h2>
          <p className="text-muted-foreground text-sm">Technical specs and token distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token details */}
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Token Specs</h3>
          <div className="space-y-3">
            {tokenDetails.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium text-foreground text-right max-w-[55%]">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:underline"
            >
              Pump.fun (Solana) <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://app.uniswap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Unicorn / Base <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Token Distribution</h3>
          <div className="space-y-3">
            {distribution.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold text-foreground">{d.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/50">
                  <motion.div
                    className={`h-2 rounded-full ${d.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs text-muted-foreground">
            <strong className="text-amber-400">40% fair launch</strong> ensures community ownership from day 1. 
            No VC allocation. Team tokens vest over 2 years with 6-month cliff.
          </div>
        </div>
      </div>
    </motion.div>
  );
}