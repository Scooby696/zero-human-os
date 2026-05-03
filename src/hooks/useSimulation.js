import { useState, useCallback, useRef } from "react";
import { errorHandler } from "../utils/errorHandler";

export function useSimulation(nodes, edges) {
  const [simState, setSimState] = useState("idle"); // idle | running | paused | done
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [visitedEdgeIds, setVisitedEdgeIds] = useState([]);
  const [log, setLog] = useState([]);
  const [nodeData, setNodeData] = useState({}); // { [nodeId]: { input, output } }
  const [pausedNodeId, setPausedNodeId] = useState(null);
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      cancelRef._lastTimer = id;
    });

  const addLog = (msg, type = "info") =>
    setLog((prev) => [...prev, { msg, type, ts: Date.now() }]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setSimState("idle");
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setVisitedNodeIds([]);
    setVisitedEdgeIds([]);
    setLog([]);
    setNodeData({});
    setPausedNodeId(null);
  }, []);

  const resume = useCallback(() => {
    pauseRef.current = false;
    setSimState("running");
    setPausedNodeId(null);
  }, []);

  const run = useCallback(async (breakpoints = new Set()) => {
    if (nodes.length === 0) return;
    cancelRef.current = false;
    pauseRef.current = false;
    setSimState("running");
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setVisitedNodeIds([]);
    setVisitedEdgeIds([]);
    setLog([]);
    setNodeData({});
    setPausedNodeId(null);

    const start = nodes.find((n) => n.type === "trigger") || nodes[0];
    addLog(`🚀 Test Mode started — entry: "${start.label}"`, "info");

    let current = start;
    const visitedNodes = new Set();
    // Data context that flows between nodes
    let context = generateTriggerPayload(start);
    // Variables storage
    let variables = {};

    while (current && !cancelRef.current) {
      visitedNodes.add(current.id);
      setActiveNodeId(current.id);
      setVisitedNodeIds([...visitedNodes]);

      const input = { ...context };
      const stepMs = getStepDuration(current.type);
      addLog(getNodeLog(current), getLogType(current.type));

      await sleep(stepMs);
      if (cancelRef.current) break;

      let output;
      let nodeError = null;
      try {
        output = processNode(current, context, variables);
        context = { ...context, ...output };
      } catch (error) {
        nodeError = error;
        addLog(`❌ Error in "${current.label}": ${error.message}`, "error");
        
        // Look for error handler nodes connected to this node
        const errorHandlers = edges.filter((e) => e.from === current.id).map((e) => nodes.find((n) => n.id === e.to)).filter((n) => n?.type === "error_handler");
        
        if (errorHandlers.length > 0) {
          const handler = errorHandlers[0];
          const handlerResult = errorHandler.handleError(
            handler.id,
            error,
            handler.config || {},
            { nodeName: handler.label }
          );
          
          if (handlerResult.handled) {
            addLog(`🛡️ Error handled: ${handlerResult.action}`, "error_handler");
            if (handlerResult.alerts) {
              handlerResult.alerts.forEach((alert) => {
                addLog(`📧 Alert sent via ${alert.type}`, "info");
              });
            }
            output = handlerResult.fallbackResult || { error_handled: true };
          }
        } else if (!current.config?.continue_on_error) {
          // No error handler, stop execution
          addLog(`❌ Fatal error — no handler defined`, "error");
          break;
        }
      }

      // Handle variable setting
      if (current.type === "variable") {
        const varName = current.config?.variable_name;
        if (varName) {
          variables[varName] = output.variable_value;
          addLog(`📌 Set ${varName} = ${output.variable_value}`, "info");
        }
      }

      setNodeData((prev) => ({
        ...prev,
        [current.id]: { input, output },
      }));

      setActiveNodeId(null);

      // Check for breakpoint
      if (breakpoints.has(current.id)) {
        addLog(`⏸ Breakpoint hit on "${current.label}" — paused`, "breakpoint");
        setSimState("paused");
        setPausedNodeId(current.id);
        pauseRef.current = true;
        // Wait for resume
        await new Promise((resolve) => {
          const checkResume = setInterval(() => {
            if (!pauseRef.current) {
              clearInterval(checkResume);
              resolve();
            }
          }, 100);
        });
        if (cancelRef.current) break;
      }

      const outEdges = edges.filter((e) => e.from === current.id);
      if (outEdges.length === 0) {
        addLog(`✅ Flow ended at "${current.label}"`, "success");
        break;
      }

      const nextEdge =
        outEdges.find((e) => !visitedNodes.has(e.to)) || outEdges[0];
      const nextNode = nodes.find((n) => n.id === nextEdge.to);

      if (!nextNode || visitedNodes.has(nextEdge.to)) {
        addLog(`✅ No further path — flow complete.`, "success");
        break;
      }

      setActiveEdgeId(nextEdge.id);
      setVisitedEdgeIds((prev) => [...prev, nextEdge.id]);
      addLog(`→ Passing data to "${nextNode.label}"`, "edge");
      await sleep(450);
      if (cancelRef.current) break;
      setActiveEdgeId(null);

      current = nextNode;
    }

    if (!cancelRef.current) {
      setSimState("done");
      setActiveNodeId(null);
      addLog(`🏁 Simulation complete. ${visitedNodes.size} nodes executed.`, "success");
    }
  }, [nodes, edges]);

  return {
    simState, activeNodeId, activeEdgeId,
    visitedNodeIds, visitedEdgeIds,
    log, nodeData, pausedNodeId,
    run, reset, resume,
  };
}

// ── Helper: Substitute variables in text ──────────────────────────────────────
function substituteVariables(text, variables) {
  if (typeof text !== "string") return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

// ── Node processing — generates simulated output per type ────────────────────

function generateTriggerPayload(node) {
  const phrase = node.config?.voice_phrase || "new order";
  return {
    event: "voice_trigger",
    phrase,
    confidence: node.config?.confidence_threshold || 0.91,
    timestamp: new Date().toISOString(),
    session_id: `sess_${Math.random().toString(36).slice(2, 9)}`,
    user_id: "usr_demo_001",
  };
}

function processNode(node, ctx, variables = {}) {
  // Simulate random failures for testing error handlers (20% chance)
  if (node.type === "action" || node.type === "llm") {
    if (Math.random() < 0.15) {
      const errors = [
        { message: "Connection timeout", code: "timeout" },
        { message: "API rate limit exceeded", code: "429" },
        { message: "Service unavailable", code: "503" },
      ];
      throw errors[Math.floor(Math.random() * errors.length)];
    }
  }

  switch (node.type) {
    case "variable": {
      const varValue = node.config?.variable_value || "undefined";
      const substituted = substituteVariables(varValue, variables);
      return {
        variable_name: node.config?.variable_name || "var",
        variable_value: substituted,
        description: node.config?.variable_description || "",
      };
    }

    case "webhook_trigger": {
      const url = node.config?.webhook_url || "https://webhook.site/demo";
      return {
        webhook_url: url,
        received_data: {
          user_id: "usr_" + Math.random().toString(36).slice(2, 8),
          action: "workflow_started",
          timestamp: new Date().toISOString(),
        },
        status_code: 200,
      };
    }

    case "webhook_action": {
      const url = node.config?.target_url || "https://api.example.com/callback";
      const method = node.config?.http_method || "POST";
      const payloadTemplate = node.config?.payload_template || '{"status": "completed"}';
      const payload = JSON.parse(payloadTemplate.replace(/\{\{(\w+)\}\}/g, (_, k) => JSON.stringify(ctx[k] || "")));
      return {
        target_url: url,
        http_method: method,
        payload_sent: payload,
        status_code: 200,
        latency_ms: Math.floor(Math.random() * 400) + 100,
      };
    }

    case "trigger":
      return generateTriggerPayload(node);

    case "llm": {
      const model = node.config?.model || "gpt-4o-mini";
      return {
        llm_model: model,
        llm_input: ctx.phrase || ctx.message || "User query",
        llm_output: generateLLMOutput(node, ctx),
        tokens_used: Math.floor(Math.random() * 300) + 80,
        latency_ms: Math.floor(Math.random() * 800) + 200,
      };
    }

    case "condition": {
      const expr = node.config?.condition_expression || "inventory > 0";
      const result = Math.random() > 0.35;
      return {
        condition: expr,
        result,
        branch: result
          ? node.config?.true_label || "true"
          : node.config?.false_label || "false",
      };
    }

    case "action": {
      const url = node.config?.endpoint_url || "https://api.example.com/action";
      const method = node.config?.http_method || "POST";
      return {
        http_method: method,
        endpoint: url,
        status_code: 200,
        response_body: { success: true, id: `rec_${Math.random().toString(36).slice(2, 8)}` },
        latency_ms: Math.floor(Math.random() * 400) + 80,
      };
    }

    case "response": {
      const template = node.config?.response_template || "Your request has been processed.";
      const substituted = substituteVariables(template, variables);
      return {
        message: substituted.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] || k),
        voice_speed: node.config?.voice_speed || "normal",
        emotion: node.config?.emotion || "friendly",
        tts_chars: template.length,
      };
    }

    case "agent": {
      const agentId = node.config?.agent_id || "custom_agent";
      const prompt = node.config?.agent_prompt || "Execute task";
      return {
        agent_id: agentId,
        agent_prompt: prompt,
        agent_timeout: node.config?.agent_timeout || 30,
        agent_temperature: node.config?.agent_temperature || 0.7,
        execution_result: {
          status: "completed",
          output: `Agent (${agentId}) executed successfully`,
          tokens_used: Math.floor(Math.random() * 500) + 100,
        },
      };
    }

    case "end":
      return {
        status: "completed",
        summary: node.config?.summary_message || "Workflow finished successfully.",
        logged: node.config?.log_result !== "no",
      };

    case "error_handler":
      return {
        handler_type: node.config?.fallback_action || "alert",
        status: "ready",
      };

    default:
      return { processed: true };
  }
}

function generateLLMOutput(node, ctx) {
  const schema = node.config?.output_schema;
  if (schema) {
    try {
      const parsed = JSON.parse(schema);
      const mock = {};
      Object.entries(parsed).forEach(([k, v]) => {
        mock[k] = v === "number" ? Math.floor(Math.random() * 100) : `mock_${k}`;
      });
      return mock;
    } catch (_) {}
  }
  const examples = [
    { intent: "create_order", entities: { product: "Widget A", qty: 3 }, confidence: 0.94 },
    { intent: "check_status", entities: { order_id: "ORD-8821" }, confidence: 0.87 },
    { intent: "schedule_meeting", entities: { date: "2026-05-10", attendees: 3 }, confidence: 0.91 },
  ];
  return examples[Math.floor(Math.random() * examples.length)];
}

function getStepDuration(type) {
  const map = { trigger: 700, condition: 900, llm: 1300, action: 1000, response: 800, agent: 1500, end: 500 };
  return map[type] || 750;
}

function getNodeLog(node) {
  const labels = {
    trigger: `⚡ Trigger fired: "${node.label}"`,
    condition: `🔀 Evaluating: "${node.label}"`,
    llm: `🤖 LLM call: "${node.label}"${node.config?.model ? ` [${node.config.model}]` : ""}`,
    action: `🔧 Action: "${node.label}"${node.config?.endpoint_url ? ` → ${node.config.endpoint_url}` : ""}`,
    response: `💬 Response: "${node.label}"`,
    variable: `📝 Variable: "${node.label}"`,
    webhook_trigger: `🔗 Webhook received: "${node.label}"${node.config?.webhook_url ? ` from ${node.config.webhook_url}` : ""}`,
    webhook_action: `📤 Webhook sent: "${node.label}"${node.config?.target_url ? ` to ${node.config.target_url}` : ""}`,
    agent: `🤖 Agent: "${node.label}"${node.config?.agent_id ? ` [${node.config.agent_id}]` : ""}`,
    end: `⏹ End: "${node.label}"`,
  };
  return labels[node.type] || `▶ Processing "${node.label}"`;
}

function getLogType(type) {
  const map = {
    trigger: "trigger", llm: "llm", action: "action",
    condition: "condition", response: "response", variable: "info",
    webhook_trigger: "action", webhook_action: "action", agent: "action", end: "success",
  };
  return map[type] || "info";
}