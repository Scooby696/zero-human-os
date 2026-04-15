import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock } from "lucide-react";

const healthItems = [
  { label: "Agent Network", value: "47/47 Online", status: "ok" },
  { label: "API Gateway", value: "12ms p99", status: "ok" },
  { label: "Memory / Vector DB", value: "41.2% used", status: "ok" },
  { label: "Task Queue", value: "0 pending", status: "ok" },
  { label: "Revenue Pipeline", value: "Active", status: "ok" },
  { label: "Compliance Monitor", value: "No alerts", status: "ok" },
];

const recentLogs = [
  { time: "14:32", msg: "Sales Agent closed deal #4291 — $18,400", type: "revenue" },
  { time: "14:18", msg: "Marketing Agent published 3 articles to blog", type: "info" },
  { time: "13:55", msg: "Finance Agent completed tax reconciliation", type: "info" },
  { time: "13:40", msg: "Ops Agent scaled compute in eu-west-1", type: "info" },
  { time: "12:20", msg: "CEO Orchestrator reallocated budget to Sales", type: "info" },
  { time: "11:45", msg: "Support Agent resolved 24 tickets (100% CSAT)", type: "revenue" },
];

export default function SystemHealth() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Health */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Live Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap mt-0.5">{log.time}</span>
                <span className={`text-xs leading-relaxed ${log.type === "revenue" ? "text-green-400" : "text-muted-foreground"}`}>
                  {log.msg}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}