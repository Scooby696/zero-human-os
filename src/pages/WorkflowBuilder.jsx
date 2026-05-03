import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitBranch } from "lucide-react";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import WorkflowSidebar from "../components/workflow/WorkflowSidebar";
import WorkflowToolbar from "../components/workflow/WorkflowToolbar";
import NodeConfigPanel from "../components/workflow/NodeConfigPanel";
import SimulationLog from "../components/workflow/SimulationLog";
import TestModePanel from "../components/workflow/TestModePanel";
import { DEFAULT_WORKFLOWS } from "../components/workflow/workflowData";
import { useSimulation } from "../hooks/useSimulation";

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState(DEFAULT_WORKFLOWS[0].nodes);
  const [edges, setEdges] = useState(DEFAULT_WORKFLOWS[0].edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState(DEFAULT_WORKFLOWS[0].name);
  const nextId = useRef(100);
  const sim = useSimulation(nodes, edges);

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
        </div>
        <WorkflowToolbar
          nodes={nodes}
          edges={edges}
          workflowName={workflowName}
          onLoad={loadWorkflow}
          onClear={clearCanvas}
          simState={sim.simState}
          onSimulate={sim.run}
          onSimStop={sim.reset}
        />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar onAddNode={addNode} />
        <div className="flex-1 relative overflow-hidden">
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