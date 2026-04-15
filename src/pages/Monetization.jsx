import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Zap, Coins, TrendingUp, Globe, Shield, ArrowRight,
  ChevronDown, ChevronUp, ExternalLink, DollarSign, Layers, Lock,
  RefreshCw, Users, BarChart3, Wallet, Bot
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TokenFlowDiagram from "../components/monetization/TokenFlowDiagram";
import X402Explainer from "../components/monetization/X402Explainer";
import RevenueModels from "../components/monetization/RevenueModels";
import TokenEconomy from "../components/monetization/TokenEconomy";
import RevenueProjections from "../components/monetization/RevenueProjections";
import RisksMitigation from "../components/monetization/RisksMitigation";

export default function Monetization() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <span className="font-semibold text-foreground">Crypto & x402 Monetization</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <span className="text-xs font-bold text-amber-400">$ZHS</span>
            <span className="text-xs text-muted-foreground">Token Economy</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Version 1.0 — April 2026
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-4 leading-tight">
              Let Agents Pay<br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-primary bg-clip-text text-transparent">
                Agents
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              ZERO HUMAN SYSTEMS is the first agentic platform with a built-in crypto-native revenue engine. 
              Build permissionless, recurring income streams — powered by the <strong className="text-amber-400">$ZHS token</strong> and x402 micropayments.
            </p>
            <p className="text-muted-foreground/70 italic">
              "The platform doesn't just run companies — it becomes one."
            </p>
          </div>
        </motion.div>

        {/* x402 Explainer */}
        <X402Explainer />

        {/* Token Flow Diagram */}
        <TokenFlowDiagram />

        {/* Revenue Models */}
        <RevenueModels />

        {/* Token Economy */}
        <TokenEconomy />

        {/* Revenue Projections */}
        <RevenueProjections />

        {/* Risks */}
        <RisksMitigation />

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-amber-400/10 via-primary/5 to-transparent border border-amber-400/20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-400 text-sm font-medium mb-4">
              <Zap className="w-3.5 h-3.5" />
              Monetized by agents, for agents
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Ready to Launch <span className="text-amber-400">$ZHS</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Integrate x402 today and launch your token on Base or Solana for maximum agent compatibility.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://docs.cdp.coinbase.com/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-background font-semibold text-sm hover:bg-amber-300 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Integrate x402
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://pump.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Coins className="w-4 h-4" />
                Launch on Pump.fun
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                View Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}