import React, { useEffect, useState } from "react";
import { Activity, AlertCircle } from "lucide-react";

export default function CollaborationSync({ isConnected = true, syncStatus = "synced" }) {
  const statusConfig = {
    synced: { icon: Activity, color: "text-green-400", label: "Synced", bg: "bg-green-400/10" },
    syncing: { icon: Activity, color: "text-blue-400", label: "Syncing...", bg: "bg-blue-400/10" },
    error: { icon: AlertCircle, color: "text-red-400", label: "Sync error", bg: "bg-red-400/10" },
  };

  const config = statusConfig[syncStatus] || statusConfig.synced;
  const Icon = config.icon;

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-card border border-red-400/30 shadow-lg flex items-center gap-2 text-xs font-medium text-red-400">
        <AlertCircle className="w-3.5 h-3.5" />
        Offline — local changes only
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-lg flex items-center gap-2 text-xs font-medium ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
      {config.label}
    </div>
  );
}