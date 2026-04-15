import React from "react";
import { motion } from "framer-motion";
import { Globe, ShoppingCart, Users, Package, Play, Bitcoin, Building2 } from "lucide-react";

const cases = [
  { icon: Globe, label: "SaaS / Software" },
  { icon: ShoppingCart, label: "E-commerce & Dropshipping" },
  { icon: Users, label: "Consulting & Services" },
  { icon: Package, label: "Physical Product Companies" },
  { icon: Play, label: "Content & Media" },
  { icon: Bitcoin, label: "Crypto / Web3 Projects" },
  { icon: Building2, label: "Traditional Enterprises" },
];

const benefits = [
  { value: "90%+", label: "Reduction in operational human hours" },
  { value: "24/7", label: "Continuous operation & instant scaling" },
  { value: "60-80%", label: "Lower burn rate vs. traditional teams" },
  { value: "∞", label: "Ability to run multiple businesses simultaneously" },
];

export default function UseCases() {
  return (
    <section id="usecases" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Expected <span className="text-primary">Outcomes</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-12">
            Real results for any business that deploys Zero Human Systems.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {benefits.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all"
              >
                <div className="text-3xl sm:text-4xl font-black text-primary mb-2">{b.value}</div>
                <div className="text-sm text-muted-foreground leading-snug">{b.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Supported business types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-8">Works For Any Business Model</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {cases.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 text-muted-foreground hover:text-foreground"
              >
                <c.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{c.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}