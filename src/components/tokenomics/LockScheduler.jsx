import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOCATION_GROUPS } from "./AllocationBuilder";

const FREQUENCIES = ["monthly", "quarterly", "weekly"];

export default function LockScheduler({ locks, allocations, tokenSymbol, totalSupply, onChange }) {
  const horizon = Math.max(
    12,
    ...ALLOCATION_GROUPS.map((g) => (locks[g.key]?.cliffMonths || 0) + (locks[g.key]?.vestMonths || 1))
  );

  const chartData = [];
  for (let m = 0; m <= horizon; m++) {
    const row = { month: `M${m}` };
    ALLOCATION_GROUPS.forEach((g) => {
      const l = locks[g.key] || {};
      const cliff = l.cliffMonths || 0;
      const vest = Math.max(1, l.vestMonths || 1);
      row[g.label] = m <= cliff ? 0 : Math.min(100, Math.round(((m - cliff) / vest) * 100));
    });
    chartData.push(row);
  }

  const handleExport = () => {
    const config = {
      protocol: "streamflow",
      contractType: "vesting-lock",
      token: tokenSymbol,
      totalSupply: Number(totalSupply),
      schedules: ALLOCATION_GROUPS.map((g) => ({
        group: g.label,
        tokenAmount: Math.round(((Number(allocations[g.key]) || 0) / 100) * totalSupply),
        cliffMonths: locks[g.key]?.cliffMonths || 0,
        vestingMonths: locks[g.key]?.vestMonths || 0,
        releaseFrequency: locks[g.key]?.frequency || "monthly",
        unlockStyle: "linear",
      })),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(tokenSymbol || "token").toLowerCase()}-streamflow-locks.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateLock = (key, field, value) =>
    onChange({ ...locks, [key]: { ...locks[key], [field]: value } });

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Streamflow Locks & Distribution Scheduling
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure cliffs and linear vesting per group — matches Streamflow vesting contracts on Solana and EVM chains.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {ALLOCATION_GROUPS.map((g) => {
            const l = locks[g.key] || {};
            return (
              <div
                key={g.key}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-center p-3 rounded-xl bg-secondary/30 border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
                  <span className="text-sm font-medium text-foreground">{g.label}</span>
                </div>
                <label className="text-xs text-muted-foreground">
                  Cliff (months)
                  <input
                    type="number"
                    min="0"
                    max="48"
                    value={l.cliffMonths ?? 0}
                    onChange={(e) => updateLock(g.key, "cliffMonths", Number(e.target.value))}
                    className="mt-1 w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Vesting duration (months)
                  <input
                    type="number"
                    min="1"
                    max="96"
                    value={l.vestMonths ?? 12}
                    onChange={(e) => updateLock(g.key, "vestMonths", Number(e.target.value))}
                    className="mt-1 w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Release frequency
                  <select
                    value={l.frequency || "monthly"}
                    onChange={(e) => updateLock(g.key, "frequency", e.target.value)}
                    className="mt-1 w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Unlock Timeline (cumulative % unlocked)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.ceil(horizon / 12)} />
                <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 44% 8%)",
                    border: "1px solid hsl(222 30% 16%)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {ALLOCATION_GROUPS.map((g) => (
                  <Line
                    key={g.key}
                    type="monotone"
                    dataKey={g.label}
                    stroke={g.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export Streamflow lock config
            </Button>
            <a
              href="https://app.streamflow.tv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Streamflow
            </a>
            <p className="text-xs text-muted-foreground/70 flex-1">
              Import the exported config into Streamflow to deploy on-chain vesting contracts for each group.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}