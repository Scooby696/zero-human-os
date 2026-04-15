import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Zap } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    label: "MVP",
    timeline: "2–4 weeks",
    status: "active",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    items: [
      "CEO Orchestrator Agent",
      "Product & Dev Agent",
      "Marketing Agent",
      "Sales Agent",
      "Finance Agent",
      "Basic dashboard & tool integrations",
    ],
  },
  {
    phase: "Phase 2",
    label: "Full Autonomy",
    timeline: "1–3 months",
    status: "upcoming",
    icon: Clock,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    items: [
      "All 9 departmental agents",
      "Advanced shared memory",
      "On-chain autonomy module",
      "Self-optimization loops",
      "Multi-agent negotiation",
      "Predictive analytics",
    ],
  },
  {
    phase: "Phase 3",
    label: "Enterprise",
    timeline: "3–6 months",
    status: "upcoming",
    icon: CheckCircle2,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    items: [
      "Team augmentation features",
      "Advanced compliance & security",
      "White-label multi-company management",
      "GDPR-ready data privacy",
      "Enterprise audit logs",
      "SLA guarantees",
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Implementation <span className="text-primary">Roadmap</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg">
            A clear path from MVP to fully autonomous enterprise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-7 rounded-2xl bg-card border ${phase.border} relative overflow-hidden`}
            >
              {phase.status === "active" && (
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">Active</span>
                </div>
              )}
              <div className={`inline-flex p-3 rounded-xl ${phase.bg} ${phase.color} mb-5`}>
                <phase.icon className="w-5 h-5" />
              </div>
              <div className={`text-xs font-semibold uppercase tracking-widest ${phase.color} mb-1`}>
                {phase.phase}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">{phase.label}</h3>
              <p className="text-sm text-muted-foreground mb-5">{phase.timeline}</p>
              <ul className="space-y-2.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${phase.color.replace("text-", "bg-")} opacity-70`} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}