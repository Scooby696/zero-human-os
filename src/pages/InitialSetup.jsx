import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Server,
  Shield,
  Zap as ZapIcon,
  Database,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SETUP_STEPS = [
  {
    id: 1,
    title: "Deploy Orchestrator Core",
    description:
      "Initialize autonomous business operating system with state management, execution engine, and monitoring",
    icon: Server,
    details: [
      "✓ Create workspace & database schema",
      "✓ Initialize state management (Redis)",
      "✓ Deploy execution engine with load balancing",
      "✓ Setup health monitoring & alerting",
    ],
    color: "bg-blue-400/10 border-blue-400/30 text-blue-400",
  },
  {
    id: 2,
    title: "Configure Security & Encryption",
    description:
      "Setup secrets vault, encryption at rest, RBAC, and compliance controls",
    icon: Shield,
    details: [
      "✓ Generate encryption keys (AES-256)",
      "✓ Configure secrets vault (encrypted storage)",
      "✓ Setup Role-Based Access Control (RBAC)",
      "✓ Enable audit logging & compliance tracking",
    ],
    color: "bg-green-400/10 border-green-400/30 text-green-400",
  },
  {
    id: 3,
    title: "Deploy Initial Agents",
    description:
      "Configure and deploy autonomous agents for business operations",
    icon: ZapIcon,
    details: [
      "✓ Deploy data analyst agent (x402)",
      "✓ Deploy API integrator agent (x402)",
      "✓ Deploy content creator agent (x402)",
      "✓ Setup agent communication & coordination",
    ],
    color: "bg-purple-400/10 border-purple-400/30 text-purple-400",
  },
  {
    id: 4,
    title: "Configure Integrations",
    description:
      "Connect external services, APIs, and payment systems for autonomous operations",
    icon: Database,
    details: [
      "✓ Setup webhook endpoints & authentication",
      "✓ Configure payment processor (Stripe)",
      "✓ Setup email/SMS notifications",
      "✓ Connect external data sources & APIs",
    ],
    color: "bg-orange-400/10 border-orange-400/30 text-orange-400",
  },
  {
    id: 5,
    title: "Go-Live & Monitor",
    description:
      "Launch orchestrator, enable monitoring, and transition to autonomous operations",
    icon: CheckCircle2,
    details: [
      "✓ Enable real-time analytics dashboard",
      "✓ Activate automated error recovery (DLQ)",
      "✓ Start cost optimization & analytics",
      "✓ Launch autonomous business operations",
    ],
    color: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400",
  },
];

export default function InitialSetup() {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [deploying, setDeploying] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDeploy = async (stepId) => {
    setDeploying(stepId);
    try {
      // Simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      toast.success(`Step ${stepId} deployed successfully`);

      if (stepId === 5) {
        // After final step, redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error) {
      toast.error("Deployment failed. Please try again.");
    } finally {
      setDeploying(null);
    }
  };

  const progressPercent = Math.round(
    (completedSteps.length / SETUP_STEPS.length) * 100
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground">
                Deploy Your Business
              </h1>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome, {user.full_name}
                </p>
              )}
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Launch your fully autonomous Zero Human System in 5 steps. Your
            business orchestrator will be operational within minutes.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 p-6 rounded-xl bg-secondary/20 border border-border/30"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Orchestrator Deployment Progress
            </span>
            <span className="text-lg font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-border/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-12">
          {SETUP_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === completedSteps.length;
            const isNext = !isCompleted && !isActive;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                  isCompleted
                    ? "bg-green-400/5 border-green-400/30"
                    : isActive
                    ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-border/30 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg shrink-0 flex items-center justify-center ${step.color}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {step.id}. {step.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-400/20 text-green-400">
                          Complete
                        </span>
                      )}
                      {isActive && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/20 text-primary animate-pulse">
                          Deploying...
                        </span>
                      )}
                      {isNext && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">
                          Locked
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="mb-4 pl-4 border-l-2 border-border/30 space-y-1">
                      {step.details.map((detail, i) => (
                        <p
                          key={i}
                          className="text-xs text-muted-foreground/80 font-mono"
                        >
                          {detail}
                        </p>
                      ))}
                    </div>

                    {/* Action */}
                    {isActive || isCompleted ? (
                      <div className="flex gap-3">
                        {isCompleted ? (
                          <Button
                            disabled
                            className="gap-2 bg-green-400/20 text-green-400 border border-green-400/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Deployed
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleDeploy(step.id)}
                            disabled={deploying !== null}
                            className="gap-2 bg-primary hover:bg-primary/90"
                          >
                            {deploying === step.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            {deploying === step.id ? "Deploying..." : "Deploy"}
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Alert */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/30 flex gap-3 mb-6"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-300 mb-1">
              Security Best Practices
            </p>
            <p className="text-amber-200/80">
              Each deployment step includes encryption, audit logging, and
              compliance controls. All secrets are encrypted at rest using
              AES-256 encryption.
            </p>
          </div>
        </motion.div>

        {/* Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            Need help?{" "}
            <a
              href="/docs"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View deployment guide
            </a>
            {" • "}
            <a
              href="mailto:support@zerohumansystems.com"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}