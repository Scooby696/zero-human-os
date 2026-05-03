import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, Server, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const SETUP_STEPS = [
  {
    id: 1,
    title: "Deploy Orchestrator",
    description: "Initialize your autonomous business operating system",
    icon: Server,
    action: "Deploy Now",
    color: "bg-blue-400/10 border-blue-400/30 text-blue-400",
  },
  {
    id: 2,
    title: "Configure Security",
    description: "Setup encryption, secrets vault, and access controls",
    icon: Shield,
    action: "Configure",
    color: "bg-green-400/10 border-green-400/30 text-green-400",
  },
  {
    id: 3,
    title: "View Dashboard",
    description: "Monitor agents, revenue, and system performance",
    icon: BarChart3,
    action: "View",
    color: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400",
  },
];

export default function InitialSetup() {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async (stepId) => {
    setDeploying(true);
    try {
      // Simulate orchestrator deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCompletedSteps([...completedSteps, stepId]);
      
      if (stepId === 3) {
        // After final step, redirect to dashboard
        window.location.href = "/dashboard";
      }
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground">
              Deploy Your Business
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Initialize your Zero Human System orchestrator in 3 simple steps. Your autonomous company awaits.
          </p>
        </motion.div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-12">
          {SETUP_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === completedSteps.length;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? "bg-card border-green-400/30 bg-green-400/5"
                    : isActive
                    ? `border-primary/50 bg-primary/5 ${step.color.split(" ")[0]} ${step.color.split(" ")[1]}`
                    : "border-border/30 bg-card/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg shrink-0 ${step.color}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-400/20 text-green-400">
                          Done
                        </span>
                      )}
                      {isActive && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/20 text-primary animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>

                    {isActive || isCompleted ? (
                      <div className="flex gap-3">
                        {isCompleted ? (
                          <Button
                            disabled
                            className="gap-2 bg-green-400/20 text-green-400 border border-green-400/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {step.action}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleDeploy(step.id)}
                            disabled={deploying}
                            className={`gap-2 ${
                              step.id === 1
                                ? "bg-primary hover:bg-primary/90"
                                : step.id === 2
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {deploying ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            {deploying ? "Deploying..." : step.action}
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm font-bold text-muted-foreground/50">
                    Step {step.id}/3
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-secondary/20 border border-border/30"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Deployment Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round((completedSteps.length / SETUP_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-border/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(completedSteps.length / SETUP_STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        {/* Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          Need help?{" "}
          <a
            href="/docs"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View setup guide
          </a>
        </motion.div>
      </div>
    </div>
  );
}