import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Terminal className="w-3.5 h-3.5" />
              Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              The First Company
              <br />
              <span className="text-primary">Run Entirely by AI</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Zero Human Systems is pioneering a new paradigm where artificial intelligence 
              and robotic systems manage every aspect of business operations — from strategy 
              and decision-making to execution and delivery.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're building the infrastructure for a post-human enterprise, where AI agents 
              collaborate, compete, and create value autonomously. This isn't automation — 
              it's a fundamental reimagining of how companies operate.
            </p>
          </motion.div>

          {/* Right - Terminal visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-2xl shadow-black/20">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono ml-2">zero-human-os v2.0</span>
              </div>
              {/* Terminal body */}
              <div className="p-6 font-mono text-sm space-y-3">
                <div className="text-muted-foreground">
                  <span className="text-primary">$</span> system.initialize()
                </div>
                <div className="text-green-400/80">✓ AI Agent Network: Online</div>
                <div className="text-green-400/80">✓ Decision Engine: Active</div>
                <div className="text-green-400/80">✓ Robotic Fleet: Connected</div>
                <div className="text-green-400/80">✓ Revenue Pipeline: Optimizing</div>
                <div className="text-muted-foreground mt-4">
                  <span className="text-primary">$</span> agents.status()
                </div>
                <div className="text-foreground/80">
                  → 47 agents active, 0 humans required
                </div>
                <div className="text-muted-foreground mt-4">
                  <span className="text-primary">$</span> company.performance()
                </div>
                <div className="text-foreground/80">
                  → Operating at 99.97% efficiency
                </div>
                <div className="text-foreground/80">
                  → Cost reduction: 94% vs. traditional
                </div>
                <div className="text-muted-foreground mt-4 flex items-center gap-1">
                  <span className="text-primary">$</span> 
                  <span className="animate-pulse">▊</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}