import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, Save, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import AllocationBuilder from "../components/tokenomics/AllocationBuilder";
import LockScheduler from "../components/tokenomics/LockScheduler";
import BurnBuyback from "../components/tokenomics/BurnBuyback";
import AIAdvisor from "../components/tokenomics/AIAdvisor";

const DEFAULT_ALLOCATIONS = { team: 15, investors: 18, community: 32, treasury: 25, liquidity: 10 };

const DEFAULT_LOCKS = {
  team: { cliffMonths: 12, vestMonths: 24, frequency: "monthly" },
  investors: { cliffMonths: 6, vestMonths: 24, frequency: "monthly" },
  community: { cliffMonths: 0, vestMonths: 36, frequency: "monthly" },
  treasury: { cliffMonths: 0, vestMonths: 48, frequency: "quarterly" },
  liquidity: { cliffMonths: 0, vestMonths: 12, frequency: "monthly" },
};

const DEFAULT_BURN_BUYBACK = {
  enabled: true,
  monthlyBudgetUsd: 5000,
  tokenPriceUsd: 0.01,
  burnPercent: 60,
  circulatingSupply: 250000000,
  projectionMonths: 24,
};

const parseJsonField = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed || fallback;
  } catch {
    return fallback;
  }
};

export default function TokenomicsEngine() {
  const [tokenSymbol, setTokenSymbol] = useState("ZHS");
  const [totalSupply, setTotalSupply] = useState(1000000000);
  const [allocations, setAllocations] = useState(DEFAULT_ALLOCATIONS);
  const [locks, setLocks] = useState(DEFAULT_LOCKS);
  const [burnBuyback, setBurnBuyback] = useState(DEFAULT_BURN_BUYBACK);
  const [planName, setPlanName] = useState("");
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const saved = await base44.entities.TokenomicsPlan.list("-created_date", 20);
      setPlans(saved || []);
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error("Give your plan a name first");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.TokenomicsPlan.create({
        planName: planName.trim(),
        tokenSymbol,
        totalSupply: Number(totalSupply),
        allocations: JSON.stringify(allocations),
        lockSchedule: JSON.stringify(locks),
        burnBuyback: JSON.stringify(burnBuyback),
        isActive: true,
      });
      toast.success("Tokenomics plan saved");
      setPlanName("");
      await loadPlans();
    } catch (e) {
      toast.error(e.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (planId) => {
    if (!planId) return;
    try {
      const plan = await base44.entities.TokenomicsPlan.get(planId);
      setTokenSymbol(plan.tokenSymbol || "ZHS");
      setTotalSupply(Number(plan.totalSupply) || 1000000000);
      setAllocations(parseJsonField(plan.allocations, DEFAULT_ALLOCATIONS));
      setLocks(parseJsonField(plan.lockSchedule, DEFAULT_LOCKS));
      setBurnBuyback(parseJsonField(plan.burnBuyback, DEFAULT_BURN_BUYBACK));
      toast.success(`Loaded plan: ${plan.planName}`);
    } catch (e) {
      toast.error(e.message || "Failed to load plan");
    }
  };

  const planForAI = { tokenSymbol, totalSupply: Number(totalSupply), allocations, locks, burnBuyback };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-foreground">Tokenomics Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <span className="text-xs font-bold text-amber-400">${tokenSymbol || "TOKEN"}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Streamflow · Burns · Buybacks · AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground">
            Design, lock, and deflate your token —{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-primary bg-clip-text text-transparent">
              with AI help
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Build the distribution, schedule Streamflow vesting locks, plan burns and buybacks, then ask the AI
            advisor what to change before you deploy.
          </p>
        </motion.div>

        {/* Token basics + plan management */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <label className="text-xs text-muted-foreground block">
                Token symbol
                <Input value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} className="mt-1" />
              </label>
              <label className="text-xs text-muted-foreground block">
                Total supply
                <Input
                  type="number"
                  min="1"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(Number(e.target.value))}
                  className="mt-1"
                />
              </label>
              <label className="text-xs text-muted-foreground block">
                New plan name
                <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Conservative launch" className="mt-1" />
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save plan
                </Button>
                <label className="text-xs text-muted-foreground flex-1">
                  <span className="flex items-center gap-1.5 mb-1">
                    <FolderOpen className="w-3.5 h-3.5" /> Load plan
                  </span>
                  <select
                    onChange={(e) => handleLoad(e.target.value)}
                    value=""
                    className="w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-foreground text-sm"
                  >
                    <option value="">{loadingPlans ? "Loading…" : plans.length ? "Choose a saved plan…" : "No saved plans yet"}</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.planName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto h-auto p-1 gap-1">
            <TabsTrigger value="distribution" className="text-xs sm:text-sm px-3 py-2">Distribution</TabsTrigger>
            <TabsTrigger value="locks" className="text-xs sm:text-sm px-3 py-2">Locks & Vesting</TabsTrigger>
            <TabsTrigger value="burns" className="text-xs sm:text-sm px-3 py-2">Burns & Buybacks</TabsTrigger>
            <TabsTrigger value="advisor" className="text-xs sm:text-sm px-3 py-2">AI Advisor</TabsTrigger>
          </TabsList>
          <TabsContent value="distribution" className="mt-6">
            <AllocationBuilder allocations={allocations} totalSupply={Number(totalSupply)} onChange={setAllocations} />
          </TabsContent>
          <TabsContent value="locks" className="mt-6">
            <LockScheduler
              locks={locks}
              allocations={allocations}
              tokenSymbol={tokenSymbol}
              totalSupply={Number(totalSupply)}
              onChange={setLocks}
            />
          </TabsContent>
          <TabsContent value="burns" className="mt-6">
            <BurnBuyback config={burnBuyback} tokenSymbol={tokenSymbol} onChange={setBurnBuyback} />
          </TabsContent>
          <TabsContent value="advisor" className="mt-6">
            <AIAdvisor plan={planForAI} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}