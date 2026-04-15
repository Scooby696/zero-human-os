import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

const risks = [
  {
    risk: "Regulatory Uncertainty",
    mitigation: "Focus on utility token mechanics, not securities. Engage Legal Agent to monitor jurisdiction-specific regulations. Consult qualified crypto legal counsel before token launch.",
    severity: "medium",
  },
  {
    risk: "Token Price Volatility",
    mitigation: "Default all platform fees to USDC stablecoins. $ZHS is a utility/governance token — not the primary payment currency. Treasury holds 80%+ in stablecoins.",
    severity: "medium",
  },
  {
    risk: "Adoption Friction",
    mitigation: "Start with a strong free tier powered by Ollama. Document everything. Prioritize developer UX. Onboard first 100 users manually before activating monetization.",
    severity: "low",
  },
  {
    risk: "Smart Contract Exploits",
    mitigation: "Use audited OpenZeppelin contracts. Bounty program via Immunefi. Multi-sig treasury with 3-of-5 signers. Set per-tx spending caps on Finance Agent.",
    severity: "high",
  },
  {
    risk: "LLM API Cost Overruns",
    mitigation: "Route to local Ollama models by default. Set hard monthly caps on Claude/GPT-4o. Implement agent-level budget limits. Log all LLM costs via Langfuse.",
    severity: "low",
  },
  {
    risk: "x402 Protocol Adoption",
    mitigation: "x402 is backed by Coinbase, Stripe, and Vercel — adoption is accelerating. Offer traditional payment fallback (Stripe fiat) during early rollout.",
    severity: "low",
  },
];

const severityConfig = {
  high: { color: "text-red-400", bg: "bg-red-400/10", label: "High Risk" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Medium Risk" },
  low: { color: "text-green-400", bg: "bg-green-400/10", label: "Low Risk" },
};

export default function RisksMitigation() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-red-400/10">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Risks & Mitigation</h2>
          <p className="text-muted-foreground text-sm">Identified risks and how ZHS addresses each</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((r, i) => {
          const s = severityConfig[r.severity];
          return (
            <motion.div
              key={r.risk}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl bg-card border border-border/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`w-4 h-4 ${s.color}`} />
                <span className="text-sm font-semibold text-foreground flex-1">{r.risk}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>{s.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.mitigation}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}