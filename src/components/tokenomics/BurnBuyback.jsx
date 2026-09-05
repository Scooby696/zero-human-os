import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Flame, ArrowUpRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

export default function BurnBuyback({ config, tokenSymbol, onChange }) {
  const price = Number(config.tokenPriceUsd) || 0;
  const monthlyTokens = price > 0 ? Number(config.monthlyBudgetUsd || 0) / price : 0;
  const burnShare = Number(config.burnPercent || 0) / 100;
  const monthlyBurn = monthlyTokens * burnShare;
  const monthlyBuyback = monthlyTokens - monthlyBurn;
  const supply = Number(config.circulatingSupply) || 0;
  const months = Number(config.projectionMonths) || 24;

  const projection = [];
  let burned = 0;
  let circulating = supply;
  for (let m = 1; m <= months; m++) {
    burned += monthlyBurn;
    circulating = Math.max(0, circulating - monthlyBurn);
    projection.push({ month: `M${m}`, burned: Math.round(burned), circulating: Math.round(circulating) });
  }
  const at12 = projection[Math.min(11, projection.length - 1)];
  const reduction12 = supply > 0 && at12 ? (at12.burned / supply) * 100 : 0;

  const field = (label, key, opts = {}) => (
    <label className="text-xs text-muted-foreground block">
      {label}
      <input
        type={opts.type || "number"}
        min={opts.min ?? 0}
        step={opts.step || "any"}
        value={config[key] ?? ""}
        onChange={(e) => onChange({ ...config, [key]: opts.type === "select" ? Number(e.target.value) : Number(e.target.value) })}
        className="mt-1 w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
      />
    </label>
  );

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Burns & Buybacks
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule recurring deflation: a share of the budget burns supply, the rest buys back {tokenSymbol} to the treasury.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={!!config.enabled} onCheckedChange={(v) => onChange({ ...config, enabled: v })} />
            <span className="text-sm text-muted-foreground">{config.enabled ? "Program active" : "Program off"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${config.enabled ? "" : "opacity-40 pointer-events-none"}`}>
          {field("Monthly budget (USD)", "monthlyBudgetUsd")}
          {field(`${tokenSymbol} price (USD)`, "tokenPriceUsd", { step: "0.0001" })}
          {field("Circulating supply", "circulatingSupply")}
          <label className="text-xs text-muted-foreground block">
            Projection window
            <select
              value={config.projectionMonths || 24}
              onChange={(e) => onChange({ ...config, projectionMonths: Number(e.target.value) })}
              className="mt-1 w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
            >
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </label>
        </div>

        <div className={config.enabled ? "" : "opacity-40 pointer-events-none"}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-foreground">Burn share of budget</span>
            <span className="text-xs sm:text-sm font-mono text-muted-foreground">
              {config.burnPercent ?? 50}% burn · {100 - (config.burnPercent ?? 50)}% buyback
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.burnPercent ?? 50}
            onChange={(e) => onChange({ ...config, burnPercent: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {config.enabled && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-orange-400/10 border border-orange-400/20">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Burned / month
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{fmt(monthlyBurn)}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" /> Bought back / month
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{fmt(monthlyBuyback)}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-400/10 border border-green-400/20">
                <p className="text-xs text-muted-foreground">Supply reduction at 12 months</p>
                <p className="text-xl font-bold text-foreground mt-1">{reduction12.toFixed(2)}%</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 44% 8%)",
                      border: "1px solid hsl(222 30% 16%)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [fmt(value), name === "burned" ? "Total burned" : "Circulating supply"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => (v === "burned" ? "Total burned" : "Circulating supply")} />
                  <Area type="monotone" dataKey="circulating" stroke="#3b82f6" strokeWidth={2} fill="transparent" name="circulating" />
                  <Area type="monotone" dataKey="burned" stroke="#f97316" strokeWidth={2} fill="url(#burnGrad)" name="burned" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}