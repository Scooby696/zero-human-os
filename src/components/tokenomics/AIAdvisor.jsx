import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    healthScore: { type: "number", description: "Overall tokenomics health score from 0 to 100" },
    verdict: { type: "string", description: "One-paragraph summary verdict of the plan" },
    strengths: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["title", "detail", "priority"],
      },
    },
    suggestedTweaks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          change: { type: "string" },
          reason: { type: "string" },
        },
        required: ["area", "change", "reason"],
      },
    },
  },
  required: ["healthScore", "verdict", "strengths", "risks", "recommendations", "suggestedTweaks"],
};

const PRIORITY_STYLE = {
  high: "bg-red-400/10 text-red-400 border-red-400/30",
  medium: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  low: "bg-green-400/10 text-green-400 border-green-400/30",
};

export default function AIAdvisor({ plan }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert tokenomics economist advising a crypto project team. Analyze this tokenomics plan and help the team decide on improvements.

Consider best practices for: allocation balance between team/investors/community/treasury/liquidity, cliff and vesting schedules (the locks will be deployed via Streamflow vesting contracts on Solana/EVM), supply concentration and dump risk, burn and buyback program sustainability, circulating vs total supply dynamics, and long-term incentive alignment.

Plan (JSON):
${JSON.stringify(plan, null, 2)}

Respond with a health score (0-100), a concise verdict, key strengths, key risks, prioritized recommendations, and specific suggested tweaks to the allocation percentages, lock/vesting parameters, or burn/buyback settings.`,
        response_json_schema: RESPONSE_SCHEMA,
      });
      setResult(res);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const score = result?.healthScore ?? 0;
  const scoreColor = score >= 75 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Tokenomics Advisor
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Analyzes your current distribution, Streamflow locks, and burn/buyback program — and suggests what to change.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={analyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Analyzing tokenomics…" : "Analyze my tokenomics"}
        </Button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {loading && !result && (
          <div className="h-32 rounded-xl bg-secondary/30 border border-border/30 animate-pulse" />
        )}

        {result && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
              <div className={`text-4xl font-black ${scoreColor}`}>{Math.round(score)}</div>
              <p className="text-sm text-muted-foreground">{result.verdict}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20">
                <p className="text-xs font-bold text-green-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </p>
                <ul className="space-y-1.5">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/20">
                <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Risks
                </p>
                <ul className="space-y-1.5">
                  {result.risks?.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground mb-2">Recommendations</p>
              <div className="space-y-2">
                {result.recommendations?.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{r.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.low}`}>
                        {r.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggested tweaks
              </p>
              <div className="space-y-2">
                {result.suggestedTweaks?.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">{t.area}: {t.change}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}