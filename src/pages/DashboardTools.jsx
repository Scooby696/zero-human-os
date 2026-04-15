import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ToolsDatabase from "../components/dashboard/ToolsDatabase";

export default function DashboardTools() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ToolsDatabase />
      </main>
    </div>
  );
}