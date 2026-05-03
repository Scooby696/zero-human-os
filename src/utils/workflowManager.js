import { base44 } from "@/api/base44Client";

export function createWorkflowManager() {
  const createWorkflow = async (workspaceId, name, nodes, edges, description = "") => {
    try {
      const workflow = await base44.entities.Workflow.create({
        workspaceId,
        name,
        description,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        isActive: true,
        executionCount: 0,
      });
      return workflow;
    } catch (error) {
      console.error("Error creating workflow:", error);
      throw error;
    }
  };

  const getWorkflow = async (workflowId) => {
    try {
      const workflow = await base44.entities.Workflow.get(workflowId);
      if (workflow) {
        workflow.nodes = JSON.parse(workflow.nodes);
        workflow.edges = JSON.parse(workflow.edges);
      }
      return workflow;
    } catch (error) {
      console.error("Error getting workflow:", error);
      return null;
    }
  };

  const getWorkflowsByWorkspace = async (workspaceId) => {
    try {
      const workflows = await base44.entities.Workflow.filter({
        workspaceId,
        isActive: true,
      });
      return workflows.map((w) => ({
        ...w,
        nodes: JSON.parse(w.nodes),
        edges: JSON.parse(w.edges),
      }));
    } catch (error) {
      console.error("Error getting workflows:", error);
      return [];
    }
  };

  const updateWorkflow = async (workflowId, updates) => {
    try {
      const updateData = { ...updates };
      if (updates.nodes) updateData.nodes = JSON.stringify(updates.nodes);
      if (updates.edges) updateData.edges = JSON.stringify(updates.edges);

      const workflow = await base44.entities.Workflow.update(workflowId, updateData);
      if (workflow) {
        workflow.nodes = JSON.parse(workflow.nodes);
        workflow.edges = JSON.parse(workflow.edges);
      }
      return workflow;
    } catch (error) {
      console.error("Error updating workflow:", error);
      throw error;
    }
  };

  const deleteWorkflow = async (workflowId) => {
    try {
      await base44.entities.Workflow.delete(workflowId);
      return true;
    } catch (error) {
      console.error("Error deleting workflow:", error);
      return false;
    }
  };

  const duplicateWorkflow = async (workflowId, newName) => {
    try {
      const original = await getWorkflow(workflowId);
      if (!original) return null;

      return await createWorkflow(
        original.workspaceId,
        newName,
        original.nodes,
        original.edges,
        `Copy of ${original.description}`
      );
    } catch (error) {
      console.error("Error duplicating workflow:", error);
      throw error;
    }
  };

  const recordExecution = async (workflowId) => {
    try {
      const workflow = await getWorkflow(workflowId);
      if (!workflow) return null;

      return await base44.entities.Workflow.update(workflowId, {
        executionCount: workflow.executionCount + 1,
        lastExecuted: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error recording execution:", error);
      return null;
    }
  };

  return {
    createWorkflow,
    getWorkflow,
    getWorkflowsByWorkspace,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    recordExecution,
  };
}

export const workflowManager = createWorkflowManager();