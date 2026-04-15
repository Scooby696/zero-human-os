import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, Brain, Megaphone, TrendingUp, DollarSign,
  Settings, HeadphonesIcon, Scale, BarChart3, Crown
} from "lucide-react";

const agents = [
  {
    icon: Crown,
    name: "CEO Orchestrator",
    tag: "The Brain",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "Translates high-level goals into executable tasks. Coordinates all agents, allocates resources, monitors performance, and provides daily executive reports.",
  },
  {
    icon: Bot,
    name: "Product & Dev Agent",
    tag: "Builder",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    description: "Market research, MVP building, feature iteration, A/B testing, and automated code generation.",
  },
  {
    icon: Megaphone,
    name: "Marketing Agent",
    tag: "Growth",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    description: "Content creation, SEO, social media, ad campaigns, and viral growth strategies — all automated.",
  },
  {
    icon: TrendingUp,
    name: "Sales Agent",
    tag: "Revenue",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    description: "Lead generation, personalized outreach, CRM management, deal closing, and upselling.",
  },
  {
    icon: DollarSign,
    name: "Finance Agent",
    tag: "Treasury",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    description: "Invoicing, bookkeeping, forecasting, payments, tax compliance, and optional on-chain DeFi yield.",
  },
  {
    icon: Settings,
    name: "Operations Agent",
    tag: "Execution",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    description: "Workflow automation, supply chain, inventory, and vendor management — end to end.",
  },
  {
    icon: HeadphonesIcon,
    name: "Customer Success Agent",
    tag: "Support",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    description: "24/7 support, ticket resolution, feedback loops, and churn prevention — zero wait times.",
  },
  {
    icon: Scale,
    name: "Legal & Compliance Agent",
    tag: "Protection",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    description: "Contract generation, regulatory monitoring, and risk assessment with full audit trails.",
  },
  {
    icon: BarChart3,
    name: "Analytics & Strategy Agent",
    tag: "Intelligence",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
    description: "Data analysis, competitive intelligence, opportunity discovery, and predictive modeling.",
  },
];

export default function AgentsSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="agents" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Your <span className="text-primary">Agent Team</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Modular, plug-and-play departments. Activate only what your business needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent list */}
          <div className="lg:col-span-1 space-y-2">
            {agents.map((agent, i) => (
              <motion.button
                key={agent.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                  active === i
                    ? `${agent.bg} ${agent.border} ${agent.color}`
                    : "border-transparent hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-2 rounded-lg ${active === i ? agent.bg : "bg-secondary/50"}`}>
                  <agent.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{agent.name}</div>
                  <div className="text-xs opacity-70">{agent.tag}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail card */}
          <div className="lg:col-span-2">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`h-full p-8 rounded-2xl bg-card border ${agents[active].border} min-h-[320px] flex flex-col justify-between`}
            >
              <div>
                <div className={`inline-flex p-4 rounded-2xl ${agents[active].bg} mb-6`}>
                  {React.createElement(agents[active].icon, { className: `w-8 h-8 ${agents[active].color}` })}
                </div>
                <div className={`text-xs font-semibold uppercase tracking-widest ${agents[active].color} mb-2`}>
                  {agents[active].tag}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {agents[active].name}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {agents[active].description}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${agents[active].bg.replace('/10', '')} animate-pulse`} style={{backgroundColor: "currentColor"}} />
                <span className="text-sm text-muted-foreground font-mono">Agent ready to deploy</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}