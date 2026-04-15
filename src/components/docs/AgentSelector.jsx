import React from "react";
import { motion } from "framer-motion";
import {
  Crown, Megaphone, DollarSign, BarChart3, Package, Headphones,
  Scale, LineChart, Server
} from "lucide-react";

const AGENTS = [
  { name: "CEO Orchestrator", icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" },
  { name: "Marketing Agent", icon: Megaphone, color: "text-pink-400", bg: "bg-pink-400/10" },
  { name: "Sales Agent", icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
  { name: "Finance Agent", icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "Product Agent", icon: Package, color: "text-violet-400", bg: "bg-violet-400/10" },
  { name: "Support Agent", icon: Headphones, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "Legal Agent", icon: Scale, color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "Analytics Agent", icon: LineChart, color: "text-primary", bg: "bg-primary/10" },
  { name: "Ops Agent", icon: Server, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

export default function AgentSelector({ selected, onSelect }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Select Agent</div>
      <div className="grid grid-cols-1 gap-1.5">
        {AGENTS.map((agent) => (
          <button
            key={agent.name}
            onClick={() => onSelect(agent.name)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
              selected === agent.name
                ? `${agent.bg} border-opacity-50 border-current`
                : "border-border/40 hover:bg-secondary/30"
            }`}
            style={selected === agent.name ? { borderColor: "currentColor" } : {}}
          >
            <div className={`p-1.5 rounded-lg ${agent.bg} ${agent.color} shrink-0`}>
              <agent.icon className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm font-medium ${selected === agent.name ? agent.color : "text-muted-foreground"}`}>
              {agent.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}