import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const projections = [
  { month: "Mo 1", revenue: 2800, users: 20 },
  { month: "Mo 2", revenue: 8400, users: 60 },
  { month: "Mo 3", revenue: 18000, users: 130 },
  { month: "Mo 4", revenue: 34000, users: 240 },
  { month: "Mo 5", revenue: 62000, users: 420 },
  { month: "Mo 6", revenue: 95000, users: 630 },
  { month: "Mo 9", revenue: 150000, users: 1000 },
  { month: "Mo 12", revenue: 280000, users: 1800 },
];

const scenarios = [
  {
    label: "Early Stage",
    color: "text-primary",
    bg: "bg-primary/10",
    detail: "100 users × 50 daily runs × $0.50 avg",
    monthly: "$150K/mo",
    note: "Achievable in 6–9 months",
  },
  {
    label: "Scale",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    detail: "Agent-to-agent payments + marketplace 10% cut",
    monthly: "$500K–$2M/mo",
    note: "As ZHCs proliferate on the platform",
  },
  {
    label: "High Upside",
    color: "text-green-400",
    bg: "bg-green-400/10",
    detail: "10–20% of all ZHS agent economy activity",
    monthly: "Unbounded",
    note: "Protocol-level take rate on entire ecosystem",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-primary font-semibold">Revenue: ${payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueProjections() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-green-400/10">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Projections</h2>
          <p className="text-muted-foreground text-sm">Realistic growth scenarios for ZHS monetization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {scenarios.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border/50"
          >
            <div className={`text-xs font-semibold uppercase tracking-widest ${s.color} mb-2`}>{s.label}</div>
            <div className={`text-2xl font-black ${s.color} mb-1`}>{s.monthly}</div>
            <div className="text-xs text-muted-foreground mb-3">{s.detail}</div>
            <div className={`text-xs px-2.5 py-1 rounded-full ${s.bg} ${s.color} font-medium inline-block`}>{s.note}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50">
        <div className="text-sm font-medium text-muted-foreground mb-4">Projected Monthly Revenue — 12-Month Ramp</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={projections}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#revGrad2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}