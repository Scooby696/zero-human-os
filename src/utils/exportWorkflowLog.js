import jsPDF from "jspdf";

export function exportAsJSON(workflowName, nodes, log, nodeData) {
  const timestamp = new Date().toISOString();
  const export_data = {
    workflow: workflowName,
    exported_at: timestamp,
    summary: {
      total_nodes_executed: nodes.filter((n) => nodeData[n.id]).length,
      total_log_entries: log.length,
      execution_time_ms: log.length > 0 ? log[log.length - 1].ts - log[0].ts : 0,
    },
    log: log.map((entry) => ({
      message: entry.msg,
      type: entry.type,
      timestamp: new Date(entry.ts).toISOString(),
    })),
    node_data: Object.entries(nodeData).map(([nodeId, data]) => ({
      node_id: nodeId,
      node_label: nodes.find((n) => n.id === nodeId)?.label || nodeId,
      input: data.input,
      output: data.output,
    })),
  };

  const blob = new Blob([JSON.stringify(export_data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${workflowName.replace(/\s+/g, "_")}_log_${timestamp.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsPDF(workflowName, nodes, log, nodeData) {
  const timestamp = new Date().toISOString();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 10;

  const addPage = () => {
    doc.addPage();
    yPos = 10;
  };

  const addText = (text, options = {}) => {
    const { fontSize = 10, bold = false, color = [0, 0, 0], maxWidth = pageWidth - 20 } = options;
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    if (bold) doc.setFont(undefined, "bold");
    else doc.setFont(undefined, "normal");

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 10, yPos);
    yPos += lines.length * fontSize * 0.35 + 2;

    if (yPos > pageHeight - 15) addPage();
  };

  // Header
  addText(workflowName, { fontSize: 16, bold: true, color: [25, 118, 210] });
  addText(`Workflow Execution Log`, { fontSize: 12, bold: true });
  addText(`Exported: ${new Date(timestamp).toLocaleString()}`);
  addText("");

  // Summary
  const execTime = log.length > 0 ? log[log.length - 1].ts - log[0].ts : 0;
  addText("Summary", { fontSize: 11, bold: true, color: [100, 100, 100] });
  addText(`Total Nodes Executed: ${nodes.filter((n) => nodeData[n.id]).length}`);
  addText(`Log Entries: ${log.length}`);
  addText(`Execution Time: ${execTime}ms`);
  addText("");

  // Execution Log
  addText("Execution Log", { fontSize: 11, bold: true, color: [100, 100, 100] });
  log.forEach((entry, idx) => {
    const logColor = getLogColor(entry.type);
    addText(`${String(idx + 1).padStart(2, "0")}. ${entry.msg}`, { fontSize: 9, color: logColor });
  });
  addText("");

  // Node Data Details
  const executedNodes = nodes.filter((n) => nodeData[n.id]);
  if (executedNodes.length > 0) {
    addText("Node Data Flow", { fontSize: 11, bold: true, color: [100, 100, 100] });
    executedNodes.forEach((node) => {
      const data = nodeData[node.id];
      addText(`${node.label}`, { fontSize: 10, bold: true });
      if (data.input && Object.keys(data.input).length > 0) {
        addText(`Input: ${JSON.stringify(data.input).slice(0, 100)}...`, { fontSize: 8 });
      }
      if (data.output && Object.keys(data.output).length > 0) {
        addText(`Output: ${JSON.stringify(data.output).slice(0, 100)}...`, { fontSize: 8 });
      }
      addText("");
    });
  }

  const fileName = `${workflowName.replace(/\s+/g, "_")}_log_${timestamp.slice(0, 10)}.pdf`;
  doc.save(fileName);
}

function getLogColor(type) {
  const colors = {
    trigger: [255, 193, 7],
    llm: [156, 39, 176],
    action: [33, 150, 243],
    condition: [255, 152, 0],
    response: [76, 175, 80],
    success: [76, 175, 80],
    edge: [158, 158, 158],
    breakpoint: [244, 67, 54],
    info: [97, 97, 97],
  };
  return colors[type] || [0, 0, 0];
}