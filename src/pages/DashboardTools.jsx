import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ToolsDatabase from "../components/dashboard/ToolsDatabase";

export default function DashboardTools() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then((u) => { setUser(u); setAuthChecked(true); })
      .catch(() => {
        setAuthChecked(true);
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ToolsDatabase />
      </main>
    </div>
  );
}