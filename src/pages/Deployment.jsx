import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cloud, Plus, Search, Filter, AlertCircle, CheckCircle, Activity } from "lucide-react";
import { deploymentManager } from "../utils/deploymentManager";
import DeploymentCard from "../components/deployment/DeploymentCard";
import DeploymentWizard from "../components/deployment/DeploymentWizard";
import DeploymentMetricsModal from "../components/deployment/DeploymentMetricsModal";
import DeploymentConfigModal from "../components/deployment/DeploymentConfigModal";

export default function Deployment() {
  const [deployments, setDeployments] = useState(() => deploymentManager.getDeployments());
  const [showWizard, setShowWizard] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnv, setFilterEnv] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setDeployments(deploymentManager.getDeployments());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDeploy = (config) => {
    const newDeployment = deploymentManager.createDeployment(config);
    // Simulate deployment process
    setTimeout(() => {
      deploymentManager.updateDeploymentStatus(newDeployment.id, "deploying");
      setDeployments(deploymentManager.getDeployments());
    }, 500);
    setTimeout(() => {
      deploymentManager.updateDeploymentStatus(newDeployment.id, "active");
      deploymentManager.simulateHealthCheck(newDeployment.id);
      setDeployments(deploymentManager.getDeployments());
    }, 3000);
    setShowWizard(false);
  };

  const handleHealthCheck = (deploymentId) => {
    deploymentManager.simulateHealthCheck(deploymentId);
    setDeployments(deploymentManager.getDeployments());
  };

  const handleScale = (deploymentId, newInstanceCount) => {
    deploymentManager.scaleDeployment(deploymentId, newInstanceCount);
    setDeployments(deploymentManager.getDeployments());
  };

  const handleDelete = (deploymentId) => {
    if (window.confirm("Delete this deployment? This cannot be undone.")) {
      deploymentManager.deleteDeployment(deploymentId);
      setDeployments(deploymentManager.getDeployments());
    }
  };

  const filteredDeployments = deployments.filter((d) => {
    const matchesSearch = d.workflowName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = filterEnv === "all" || d.environment === filterEnv;
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesEnv && matchesStatus;
  });

  const stats = {
    active: deployments.filter((d) => d.status === "active").length,
    total: deployments.length,
    healthy: deployments.filter((d) => d.healthStatus === "healthy").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="h-4 w-px bg-border/50" />
              <Cloud className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Production Deployments</h1>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Deploy Workflow
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Active Deployments</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.healthy}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search deployments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <select
              value={filterEnv}
              onChange={(e) => setFilterEnv(e.target.value)}
              className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Environments</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="deploying">Deploying</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {deployments.length === 0 ? (
          <div className="text-center py-16">
            <Cloud className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No deployments yet</p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Deploy Your First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeployments.map((deployment) => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                onScale={handleScale}
                onHealthCheck={handleHealthCheck}
                onDelete={handleDelete}
                onConfigure={(id) => {
                  setSelectedDeploymentId(id);
                  setShowConfigModal(true);
                }}
                onMetrics={(id) => {
                  setSelectedDeploymentId(id);
                  setShowMetricsModal(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <DeploymentWizard isOpen={showWizard} onClose={() => setShowWizard(false)} onDeploy={handleDeploy} />
      {selectedDeploymentId && (
        <DeploymentMetricsModal
          isOpen={showMetricsModal}
          onClose={() => {
            setShowMetricsModal(false);
            setSelectedDeploymentId(null);
          }}
          deploymentId={selectedDeploymentId}
        />
      )}
      {selectedDeploymentId && (
        <DeploymentConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedDeploymentId(null);
          }}
          deploymentId={selectedDeploymentId}
        />
      )}
    </div>
  );
}