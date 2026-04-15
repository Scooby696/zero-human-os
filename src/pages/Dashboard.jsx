import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ROIMetrics from "../components/dashboard/ROIMetrics";
import RevenueChart from "../components/dashboard/RevenueChart";
import AgentActivity from "../components/dashboard/AgentActivity";
import SystemHealth from "../components/dashboard/SystemHealth";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">All systems operational · Zero humans required · April 15, 2026</p>
        </motion.div>

        {/* ROI Metrics */}
        <ROIMetrics />

        {/* Revenue Charts */}
        <RevenueChart />

        {/* Agent Activity Table */}
        <AgentActivity />

        {/* System Health + Logs */}
        <SystemHealth />
      </main>
    </div>
  );
}