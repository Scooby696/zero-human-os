import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitBranch, Library, Save } from "lucide-react";
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
  const nextId = useRef(100);
  const sim = useSimulation(nodes, edges);
  const templates = useTemplateManager();
  const { activeUsers, cursorPositions, updateCursor } = useCollaboration();

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

  const addNode = useCallback((type) => {
    const id = `node-${nextId.current++}`;
    const newNode = {
      id,
      type,
      label: getDefaultLabel(type),
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      config: {},
    };
    setNodes((prev) => [...prev, newNode]);
  }, []);

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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-sm font-semibold bg-transparent text-foreground focus:outline-none focus:border-b focus:border-primary/50 min-w-[160px]"
            />
          </div>
          <button
            onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary transition-colors"
            title="Open template library"
          >
            <Library className="w-3.5 h-3.5" />
            Templates
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
        <WorkflowTemplateLibraryV2
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          onLoadTemplate={loadTemplate}
          customTemplates={templates.customTemplates}
          onDeleteTemplate={templates.deleteTemplate}
          onDragStart={handleDragTemplate}
        />
        <WorkflowSidebar onAddNode={addNode} />
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