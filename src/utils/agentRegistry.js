export const AVAILABLE_AGENTS = [
  // x402 Paid Agents
  {
    id: "x402_data_analyst",
    name: "Data Analyst (x402)",
    category: "x402",
    cost: 0.05,
    description: "Process and analyze complex datasets with advanced reasoning",
    icon: "📊",
    capabilities: ["data-processing", "statistical-analysis", "report-generation"],
  },
  {
    id: "x402_api_integrator",
    name: "API Integrator (x402)",
    category: "x402",
    cost: 0.08,
    description: "Connect and orchestrate third-party APIs with error handling",
    icon: "🔗",
    capabilities: ["api-orchestration", "error-handling", "rate-limiting"],
  },
  {
    id: "x402_content_creator",
    name: "Content Creator (x402)",
    category: "x402",
    cost: 0.03,
    description: "Generate high-quality content in multiple formats and styles",
    icon: "✍️",
    capabilities: ["content-generation", "formatting", "seo-optimization"],
  },
  {
    id: "x402_compliance_reviewer",
    name: "Compliance Reviewer (x402)",
    category: "x402",
    cost: 0.12,
    description: "Review and ensure compliance with regulations and policies",
    icon: "⚖️",
    capabilities: ["compliance-check", "policy-enforcement", "audit-logging"],
  },
  // Open-Source Custom Agents
  {
    id: "custom_langchain_agent",
    name: "LangChain Custom Agent",
    category: "opensource",
    cost: 0,
    description: "Flexible agent built with LangChain framework",
    icon: "🔗",
    capabilities: ["custom-logic", "tool-use", "multi-step-reasoning"],
  },
  {
    id: "custom_crewai_agent",
    name: "CrewAI Agent",
    category: "opensource",
    cost: 0,
    description: "Multi-agent orchestration with role-based cooperation",
    icon: "👥",
    capabilities: ["multi-agent", "role-based", "task-delegation"],
  },
  {
    id: "custom_local_agent",
    name: "Local Custom Agent",
    category: "custom",
    cost: 0,
    description: "Deploy your own agent from source code",
    icon: "⚙️",
    capabilities: ["full-control", "no-external-calls", "offline-capable"],
  },
];

export function getAgentById(id) {
  return AVAILABLE_AGENTS.find((a) => a.id === id);
}

export function getAgentsByCategory(category) {
  return AVAILABLE_AGENTS.filter((a) => a.category === category);
}

export function getAllAgents() {
  return AVAILABLE_AGENTS;
}