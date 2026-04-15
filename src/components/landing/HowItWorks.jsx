import React from "react";
import { motion } from "framer-motion";
import { FileText, Puzzle, Plug, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Define Your Business",
    description: "Fill a simple form or natural language prompt: industry, product/service, target customers, revenue model, and goals.",
  },
  {
    num: "02",
    icon: Puzzle,
    title: "Assemble Agents",
    description: "Select and customize the departmental agents your business needs — mix and match from the full library.",
  },
  {
    num: "03",
    icon: Plug,
    title: "Connect Tools & Data",
    description: "Link existing accounts (Stripe, GitHub, CRMs) and upload your knowledge base to power agent memory.",
  },
  {
    num: "04",
    icon: Rocket,
    title: "Launch & Monitor",
    description: "Activate the system, receive initial reports, and provide strategic input via dashboard only when needed.",
  },
  {
    num: "05",
    icon: TrendingUp,
    title: "Scale Autonomously",
    description: "Agents handle growth, optimization, and expansion — 24/7 — while you focus on vision only.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Deploy in <span className="text-primary">5 Steps</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg">
            From idea to autonomous company — no engineering degree required.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute left-[calc(50%-0.5px)] top-8 bottom-8 w-px bg-border/50" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-6 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <div className={`inline-block p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 max-w-md ${i % 2 === 0 ? "lg:ml-auto" : ""}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center node */}
                <div className="hidden lg:flex w-12 h-12 rounded-full bg-primary/10 border border-primary/30 items-center justify-center shrink-0 z-10">
                  <span className="text-primary font-bold text-sm">{i + 1}</span>
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}