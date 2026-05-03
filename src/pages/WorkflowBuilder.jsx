import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitBranch, Library, Save, Clock, CreditCard, Zap, TrendingUp, Lock, Plus } from "lucide-react";
import { useEffect } from "react";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import WorkflowSidebar from "../components/workflow/WorkflowSidebar";
import WorkflowToolbar from "../components/workflow/WorkflowToolbar";
import NodeConfigPanel from "../components/workflow/NodeConfigPanel";
import SimulationLog from "../components/workflow/SimulationLog";
import TestModePanel from "../components/workflow/TestModePanel";
import WorkflowTemplateLibraryV2 from "../components/workflow/WorkflowTemplateLibraryV2";
import SaveTemplateModal from "../components/workflow/SaveTemplateModal";
import ValidationPanel from "../components/workflow/ValidationPanel";
import { DEFAULT_WORKFLOWS } from "../components/workflow/workflowData";
import { useSimulation } from "../hooks/useSimulation";
import { useTemplateManager } from "../hooks/useTemplateManager";
import { validateWorkflow } from "../utils/workflowValidator";
import { layoutNodes } from "../utils/layoutAlgorithm";
import { useCollaboration } from "../hooks/useCollaboration";
import PresenceIndicators from "../components/workflow/PresenceIndicators";
import CollaborationSync from "../components/workflow/CollaborationSync";
import { createVersionControl } from "../utils/versionControl";
import VersionHistory from "../components/workflow/VersionHistory";
import AgentSelector from "../components/workflow/AgentSelector";
import WalletManagement from "../components/workflow/WalletManagement";
import TemplateLibraryModal from "../components/workflow/TemplateLibraryModal";
import WebhookDebugger from "../components/workflow/WebhookDebugger";
import { webhookLogger } from "../utils/webhookLogger";
import AdvancedScheduler from "../components/workflow/AdvancedScheduler";
import ExecutionAnalyticsPanel from "../components/workflow/ExecutionAnalyticsPanel";
import SecretVaultModal from "../components/vault/SecretVaultModal";
import WorkspaceSelector from "../components/workspace/WorkspaceSelector";
import WorkspaceInviteModal from "../components/workspace/WorkspaceInviteModal";
import WorkspaceTeamManager from "../components/workspace/WorkspaceTeamManager";
import { workspaceManager } from "../utils/workspaceManager";

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState(DEFAULT_WORKFLOWS[0].nodes);
  const [edges, setEdges] = useState(DEFAULT_WORKFLOWS[0].edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState(DEFAULT_WORKFLOWS[0].name);
  const [breakpoints, setBreakpoints] = useState(new Set());
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [ignoreValidation, setIgnoreValidation] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showWalletManagement, setShowWalletManagement] = useState(false);
  const [showWebhookDebugger, setShowWebhookDebugger] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSecretVault, setShowSecretVault] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [showWorkspaceInvite, setShowWorkspaceInvite] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [currentUserId] = useState("user_demo_001");
  const nextId = useRef(100);
  const versionControl = useRef(null);
  const sim = useSimulation(nodes, edges);
  const templates = useTemplateManager();
  const { activeUsers, cursorPositions, updateCursor } = useCollaboration();

  // Initialize version control
  useEffect(() => {
    versionControl.current = createVersionControl(workflowName);
    setVersions(versionControl.current.listVersions());
  }, [workflowName]);

  const toggleBreakpoint = useCallback((nodeId) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const addNode = useCallback((type, agentData = null) => {
    const id = `node-${nextId.current++}`;
    const newNode = {
      id,
      type,
      label: agentData ? agentData.name : getDefaultLabel(type),
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      config: agentData ? { agent_id: agentData.id } : {},
    };
    setNodes((prev) => [...prev, newNode]);
  }, []);

  const handleAgentSelect = (agent) => {
    addNode("agent", agent);
  };

  const updateNode = useCallback((id, updates) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedNode((s) => (s?.id === id ? null : s));
  }, []);

  const addEdge = useCallback((from, to) => {
    const exists = edges.some((e) => e.from === from && e.to === to);
    if (!exists && from !== to) {
      setEdges((prev) => [...prev, { id: `edge-${from}-${to}`, from, to }]);
    }
  }, [edges]);

  const deleteEdge = useCallback((id) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const loadWorkflow = (wf) => {
    setNodes(wf.nodes);
    setEdges(wf.edges);
    setWorkflowName(wf.name);
    setSelectedNode(null);
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setWorkflowName("New Workflow");
  };

  const loadTemplate = (template) => {
    const startX = 80;
    const startY = 100;
    const nodeSpacing = 200;

    const newNodes = template.nodes.map((tpl, idx) => ({
      id: `node-${nextId.current++}`,
      type: tpl.type,
      label: tpl.label,
      x: startX + idx * nodeSpacing,
      y: startY,
      config: tpl.config || {},
    }));

    const newEdges = template.edges.map(({ from, to }) => ({
      id: `edge-${newNodes[from].id}-${newNodes[to].id}`,
      from: newNodes[from].id,
      to: newNodes[to].id,
    }));

    setNodes((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
  };

  const handleImportTemplate = (template) => {
    loadTemplate(template);
  };

  const handleSaveTemplate = (name, description) => {
    templates.saveTemplate(name, description, nodes, edges);
  };

  const handleDragTemplate = (e, template) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("template", JSON.stringify(template));
  };

  const handleSimulate = () => {
    const errors = validateWorkflow(nodes, edges);
    if (errors.length > 0 && !ignoreValidation) {
      setValidationErrors(errors);
      return;
    }
    sim.run(breakpoints);
  };

  const invalidNodeIds = new Set(validationErrors.filter((e) => e.nodeId).map((e) => e.nodeId));

  const handleTidyUp = () => {
    const arrangedNodes = layoutNodes(nodes, edges);
    setNodes(arrangedNodes);
  };

  const handleCanvasMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateCursor(e.clientX - rect.left, e.clientY - rect.top, selectedNode?.id);
    setSyncStatus("synced");
  };

  const handleSaveVersion = (label) => {
    const newVersion = versionControl.current.saveVersion(nodes, edges, label);
    setVersions(versionControl.current.listVersions());
  };

  const handleRestoreVersion = (version) => {
    setNodes(JSON.parse(JSON.stringify(version.nodes)));
    setEdges(JSON.parse(JSON.stringify(version.edges)));
    setSelectedNode(null);
    setShowVersionHistory(false);
  };

  const handleDeleteVersion = (versionId) => {
    versionControl.current.deleteVersion(versionId);
    setVersions(versionControl.current.listVersions());
  };

  const handleUpdateLabel = (versionId, newLabel) => {
    versionControl.current.updateLabel(versionId, newLabel);
    setVersions(versionControl.current.listVersions());
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-2">
          <WorkspaceSelector currentUserId={currentUserId} onWorkspaceChange={() => {}} />
          <div className="h-4 w-px bg-border/50" />
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-border/50" />
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary transition-colors"
            title="View version history"
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </button>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-sm font-semibold bg-transparent text-foreground focus:outline-none focus:border-b focus:border-primary/50 min-w-[160px]"
            />
          </div>
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary transition-colors"
            title="Browse and import templates"
          >
            <Library className="w-3.5 h-3.5" />
            Templates
          </button>
          <button
            onClick={() => setShowWebhookDebugger(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
            title="Debug webhook payloads"
          >
            <Zap className="w-3.5 h-3.5" />
            Webhooks
          </button>
          <button
            onClick={() => setShowScheduler(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-400/10 border border-violet-400/20 text-violet-400 hover:bg-violet-400/20 transition-colors"
            title="Advanced scheduling and optimization"
          >
            <Clock className="w-3.5 h-3.5" />
            Scheduler
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
            title="View execution analytics"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => setShowWalletManagement(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-colors"
            title="Manage wallets for paid agents"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Wallets
          </button>
          <button
            onClick={() => setShowSecretVault(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-400/10 border border-green-400/20 text-green-400 hover:bg-green-400/20 transition-colors"
            title="Manage encrypted secrets and API keys"
          >
            <Zap className="w-3.5 h-3.5" />
            Secret Vault
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save current workflow as template"
          >
            <Save className="w-3.5 h-3.5" />
            Save Template
          </button>
          <button
            onClick={() => setShowTeamManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-400/10 border border-purple-400/20 text-purple-400 hover:bg-purple-400/20 transition-colors"
            title="Manage team members"
          >
            👥 Team
          </button>
          <button
            onClick={() => setShowWorkspaceInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-400/10 border border-pink-400/20 text-pink-400 hover:bg-pink-400/20 transition-colors"
            title="Invite team members"
          >
            <Plus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
        <WorkflowToolbar
          nodes={nodes}
          edges={edges}
          workflowName={workflowName}
          onLoad={loadWorkflow}
          onClear={clearCanvas}
          simState={sim.simState}
          onSimulate={handleSimulate}
          onSimStop={sim.reset}
          onResume={sim.resume}
          isPaused={sim.simState === "paused"}
          onTidyUp={handleTidyUp}
        />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar 
          onAddNode={addNode} 
          onOpenAgentSelector={() => setShowAgentSelector(true)}
          onAddCustomNode={(node) => {
            setNodes((prev) => [...prev, node]);
          }}
        />
        <SaveTemplateModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveTemplate}
          selectedNodeCount={nodes.length}
        />
        <div className="flex-1 relative overflow-hidden" onMouseMove={handleCanvasMouseMove}>
          <PresenceIndicators activeUsers={activeUsers} cursorPositions={cursorPositions} />
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onAddEdge={addEdge}
            onDeleteEdge={deleteEdge}
            activeNodeId={sim.activeNodeId}
            activeEdgeId={sim.activeEdgeId}
            visitedNodeIds={sim.visitedNodeIds}
            visitedEdgeIds={sim.visitedEdgeIds}
            breakpoints={breakpoints}
            onToggleBreakpoint={toggleBreakpoint}
            invalidNodeIds={invalidNodeIds}
          />
          {(sim.simState === "running" || sim.simState === "done") && (
            <SimulationLog
              log={sim.log}
              simState={sim.simState}
              onClose={sim.reset}
            />
          )}
        </div>
        {(sim.simState === "running" || sim.simState === "done") && (
          <TestModePanel
            nodes={nodes}
            nodeData={sim.nodeData}
            simState={sim.simState}
            onClose={sim.reset}
            log={sim.log}
            workflowName={workflowName}
          />
        )}
        {selectedNode && sim.simState === "idle" && (
          <NodeConfigPanel
            node={nodes.find((n) => n.id === selectedNode.id)}
            onUpdateNode={updateNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      <ValidationPanel
        errors={validationErrors}
        onClose={() => setValidationErrors([])}
        onIgnore={() => {
          setIgnoreValidation(true);
          setValidationErrors([]);
          sim.run(breakpoints);
        }}
        canIgnore={validationErrors.filter((e) => !["no_trigger", "no_end"].includes(e.type)).length > 0}
      />
      <CollaborationSync isConnected={true} syncStatus={syncStatus} />
      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        onRestore={handleRestoreVersion}
        onDelete={handleDeleteVersion}
        onUpdateLabel={handleUpdateLabel}
        onSaveVersion={handleSaveVersion}
      />
      <AgentSelector
        isOpen={showAgentSelector}
        onClose={() => setShowAgentSelector(false)}
        onSelect={handleAgentSelect}
      />
      <WalletManagement
        isOpen={showWalletManagement}
        onClose={() => setShowWalletManagement(false)}
        agents={nodes}
      />
      <TemplateLibraryModal
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onImport={handleImportTemplate}
      />
      <WebhookDebugger
        isOpen={showWebhookDebugger}
        onClose={() => setShowWebhookDebugger(false)}
        nodes={nodes}
      />
      <AdvancedScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        workflow={workflowName}
        onSave={(config) => {
          setScheduleConfig(config);
        }}
      />
      <ExecutionAnalyticsPanel
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
      <SecretVaultModal
        isOpen={showSecretVault}
        onClose={() => setShowSecretVault(false)}
      />

      <WorkspaceInviteModal
        isOpen={showWorkspaceInvite}
        onClose={() => setShowWorkspaceInvite(false)}
        workspaceId={workspaceManager.getCurrentWorkspace()?.id}
        currentUserId={currentUserId}
      />

      {showTeamManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowTeamManager(false)} />
      )}
      {showTeamManager && (
        <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
            <h2 className="text-lg font-bold text-foreground">Team Management</h2>
            <button
              onClick={() => setShowTeamManager(false)}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <WorkspaceTeamManager
              workspaceId={workspaceManager.getCurrentWorkspace()?.id}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultLabel(type) {
  const labels = {
    trigger: "Voice Trigger",
    condition: "Check Condition",
    action: "Execute Action",
    response: "Agent Response",
    llm: "LLM Decision",
    end: "End Flow",
  };
  return labels[type] || "Node";
}