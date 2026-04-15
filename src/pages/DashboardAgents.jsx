import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import AgentActivity from "../components/dashboard/AgentActivity";
import RevenueChart from "../components/dashboard/RevenueChart";

export default function DashboardAgents() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Agent Activity</h1>
          <p className="text-muted-foreground">Live performance data for all deployed agents.</p>
        </motion.div>
        <AgentActivity />
        <RevenueChart />
      </main>
    </div>
  );
}