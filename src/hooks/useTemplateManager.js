import { useState, useEffect } from "react";

const STORAGE_KEY = "zhs_workflow_templates";

export function useTemplateManager() {
  const [customTemplates, setCustomTemplates] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates:", e);
      }
    }
  }, []);

  const saveTemplate = (name, description, nodes, edges) => {
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      isCustom: true,
      nodes: nodes.map((n) => ({
        type: n.type,
        label: n.label,
        config: n.config || {},
      })),
      edges: edges
        .map((e) => {
          const fromIdx = nodes.findIndex((n) => n.id === e.from);
          const toIdx = nodes.findIndex((n) => n.id === e.to);
          return fromIdx !== -1 && toIdx !== -1 ? { from: fromIdx, to: toIdx } : null;
        })
        .filter(Boolean),
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTemplate;
  };

  const deleteTemplate = (templateId) => {
    const updated = customTemplates.filter((t) => t.id !== templateId);
    setCustomTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getTemplate = (templateId) => {
    return customTemplates.find((t) => t.id === templateId);
  };

  return {
    customTemplates,
    saveTemplate,
    deleteTemplate,
    getTemplate,
  };
}