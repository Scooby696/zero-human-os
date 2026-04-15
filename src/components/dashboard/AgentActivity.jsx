import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";

const agents = [
  { name: "CEO Orchestrator", status: "active", tasks: 1247, uptime: "99.9%", cost: "$0.18/hr", revenue: "—", lastAction: "Allocated Q2 budget across agents" },
  { name: "Marketing Agent", status: "active", tasks: 3891, uptime: "99.7%", cost: "$0.12/hr", revenue: "$198K", lastAction: "Published 12 SEO articles" },
  { name: "Sales Agent", status: "active", tasks: 2134, uptime: "99.8%", cost: "$0.11/hr", revenue: "$312K", lastAction: "Closed 3 enterprise deals" },
  { name: "Finance Agent", status: "active", tasks: 892, uptime: "100%", cost: "$0.09/hr", revenue: "$145K", lastAction: "Reconciled monthly statements" },
  { name: "Product Agent", status: "active", tasks: 654, uptime: "98.4%", cost: "$0.15/hr", revenue: "$87K", lastAction: "Shipped v2.3 feature update" },
  { name: "Support Agent", status: "active", tasks: 5621, uptime: "100%", cost: "$0.10/hr", revenue: "$72K", lastAction: "Resolved 47 tickets" },
  { name: "Legal Agent", status: "idle", tasks: 112, uptime: "97.2%", cost: "$0.08/hr", revenue: "—", lastAction: "Reviewed vendor contracts" },
  { name: "Analytics Agent", status: "active", tasks: 341, uptime: "99.1%", cost: "$0.06/hr", revenue: "$33K", lastAction: "Generated competitive report" },
  { name: "Ops Agent", status: "active", tasks: 789, uptime: "99.5%", cost: "$0.09/hr", revenue: "—", lastAction: "Scaled infra in us-east-1" },
];

const statusConfig = {
  active: { color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2, label: "Active" },
  idle: { color: "text-amber-400", bg: "bg-amber-400/10", icon: Clock, label: "Idle" },
  error: { color: "text-red-400", bg: "bg-red-400/10", icon: AlertCircle, label: "Error" },
};

export default function AgentActivity() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Agent Performance Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Agent", "Status", "Tasks", "Uptime", "Cost/hr", "Revenue", "Last Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agents.map((agent, i) => {
                  const s = statusConfig[agent.status];
                  return (
                    <tr key={agent.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">{agent.name}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                          <s.icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{agent.tasks.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{agent.uptime}</td>
                      <td className="py-3 pr-4 text-cyan-400 font-mono">{agent.cost}</td>
                      <td className="py-3 pr-4 text-green-400 font-semibold">{agent.revenue}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs max-w-[200px] truncate">{agent.lastAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}