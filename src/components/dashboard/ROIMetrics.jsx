import React from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Cpu, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  {
    title: "Revenue Generated",
    value: "$847,320",
    change: "+18.4%",
    period: "vs last month",
    up: true,
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    title: "Compute Costs",
    value: "$2,140",
    change: "-12.1%",
    period: "vs last month",
    up: false,
    icon: Cpu,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    title: "ROI (30-day)",
    value: "395x",
    change: "+47pts",
    period: "vs last month",
    up: true,
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Human Hours Saved",
    value: "3,847 hrs",
    change: "+22%",
    period: "vs last month",
    up: true,
    icon: Users,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

export default function ROIMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((m, i) => (
        <motion.div
          key={m.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${m.up ? "text-green-400" : "text-red-400"}`}>
                  {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {m.change}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{m.value}</div>
              <div className="text-sm text-muted-foreground">{m.title}</div>
              <div className="text-xs text-muted-foreground/60 mt-1">{m.period}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}