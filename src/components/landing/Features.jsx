import React from "react";
import { motion } from "framer-motion";
import { Bot, Brain, Cpu, Network, Shield, Workflow } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agents",
    description: "Autonomous agents that handle operations, decisions, and execution without human intervention.",
  },
  {
    icon: Brain,
    title: "Machine Intelligence",
    description: "Advanced reasoning and problem-solving capabilities that scale infinitely across operations.",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    description: "Self-orchestrating pipelines that adapt and optimize in real-time based on outcomes.",
  },
  {
    icon: Network,
    title: "Distributed Systems",
    description: "Decentralized architecture ensuring resilience, uptime, and seamless coordination.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Enterprise-grade security with built-in compliance and zero-trust architecture.",
  },
  {
    icon: Cpu,
    title: "Robotic Integration",
    description: "Seamless bridge between digital intelligence and physical robotic operations.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for <span className="text-primary">Autonomy</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Every component engineered to operate independently, intelligently, and at scale.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}