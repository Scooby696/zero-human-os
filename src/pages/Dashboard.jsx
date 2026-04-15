import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { 
  Bot, Brain, Activity, Zap, LogOut, Settings, 
  TrendingUp, Clock, CheckCircle2, BarChart3, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SocialLinks from "../components/landing/SocialLinks";

const statCards = [
  { title: "Active Agents", value: "47", icon: Bot, change: "+3 this week", color: "text-primary" },
  { title: "Tasks Completed", value: "12,847", icon: CheckCircle2, change: "+2.4% today", color: "text-green-400" },
  { title: "System Uptime", value: "99.97%", icon: Activity, change: "Last 30 days", color: "text-cyan-400" },
  { title: "Efficiency Score", value: "94.2%", icon: TrendingUp, change: "+1.8% this month", color: "text-amber-400" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69df985c75b2b8e8f4b5ac85/06958c67a_logo.png"
              alt="Zero Human Systems"
              className="h-9 w-9 rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Zero Human<span className="text-primary"> OS</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SocialLinks size="md" />
            <div className="hidden sm:block h-6 w-px bg-border/50" />
            <span className="hidden sm:block text-sm text-muted-foreground">
              {user?.full_name || user?.email || "Agent"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">All systems operational. Zero humans required.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-secondary/50 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                  <div className="text-xs text-primary mt-2">{stat.change}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Activity and Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { agent: "Revenue Agent", action: "Optimized pricing model", time: "2 min ago", status: "success" },
                  { agent: "Ops Agent", action: "Deployed infrastructure update", time: "15 min ago", status: "success" },
                  { agent: "Analytics Agent", action: "Generated weekly report", time: "1 hr ago", status: "success" },
                  { agent: "Security Agent", action: "Completed threat scan", time: "2 hrs ago", status: "success" },
                  { agent: "Strategy Agent", action: "Updated Q2 roadmap", time: "4 hrs ago", status: "success" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{item.agent}</div>
                      <div className="text-xs text-muted-foreground">{item.action}</div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-card border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono ml-2">system-monitor</span>
              </div>
              <CardContent className="p-5 font-mono text-xs sm:text-sm space-y-2.5 min-h-[360px]">
                <div className="text-muted-foreground"><span className="text-primary">→</span> Initializing system monitor...</div>
                <div className="text-green-400/80">✓ All 47 agents reporting nominal</div>
                <div className="text-green-400/80">✓ Zero incidents in last 72 hours</div>
                <div className="text-green-400/80">✓ Revenue pipeline: $847K processed today</div>
                <div className="text-green-400/80">✓ Infrastructure: 12 regions, all healthy</div>
                <div className="text-muted-foreground mt-3"><span className="text-primary">→</span> agent.metrics()</div>
                <div className="text-foreground/70">  CPU utilization: 23.4%</div>
                <div className="text-foreground/70">  Memory usage: 41.2%</div>
                <div className="text-foreground/70">  API latency: 12ms (p99)</div>
                <div className="text-foreground/70">  Queue depth: 0 pending</div>
                <div className="text-muted-foreground mt-3"><span className="text-primary">→</span> system.humans_required()</div>
                <div className="text-primary font-semibold">  → 0</div>
                <div className="text-muted-foreground mt-3 flex items-center gap-1">
                  <span className="text-primary">→</span>
                  <span className="animate-pulse">▊</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Social CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">Follow our journey building the world's first zero-human company.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/zerohuman87307"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 border border-border/50 text-sm font-medium text-foreground transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow
              </a>
              <a
                href="https://t.me/zerohumansystems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-sm font-medium text-foreground transition-all"
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                Telegram
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}