import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const ALLOCATION_GROUPS = [
  { key: "team", label: "Team & Founders", color: "#3b82f6" },
  { key: "investors", label: "Investors", color: "#a78bfa" },
  { key: "community", label: "Community & Rewards", color: "#22c55e" },
  { key: "treasury", label: "Treasury & Buybacks", color: "#f59e0b" },
  { key: "liquidity", label: "Liquidity", color: "#ec4899" },
];

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

export default function AllocationBuilder({ allocations, totalSupply, onChange }) {
  const total = ALLOCATION_GROUPS.reduce((s, g) => s + Number(allocations[g.key] || 0), 0);
  const chartData = ALLOCATION_GROUPS.map((g) => ({
    name: g.label,
    value: Number(allocations[g.key] || 0),
    color: g.color,
  }));

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Token Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag the sliders to split the total supply across groups. The split must total 100%.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {ALLOCATION_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
                    {g.label}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                    {allocations[g.key] || 0}% · {fmt(((Number(allocations[g.key]) / 100) * totalSupply))} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocations[g.key] || 0}
                  onChange={(e) => onChange({ ...allocations, [g.key]: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            ))}
            <div
              className={`text-sm font-medium ${total === 100 ? "text-green-400" : "text-amber-400"}`}
            >
              Total: {total}%{" "}
              {total !== 100 && "— adjust sliders so the allocation totals 100%"}
            </div>
          </div>

          <div className="h-64 lg:h-full min-h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 44% 8%)",
                    border: "1px solid hsl(222 30% 16%)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}