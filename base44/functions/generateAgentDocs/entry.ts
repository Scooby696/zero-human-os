import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Agent configurations — source of truth for doc generation
const AGENT_CONFIGS = [
  {
    name: "CEO Orchestrator",
    role: "Top-level orchestrator agent",
    goal: "Allocate tasks across all department agents, track KPIs, and make autonomous strategic decisions",
    tools: ["spawn_agent", "kill_agent", "read_dashboard", "set_budget", "send_briefing", "escalate_to_human"],
    llm: "claude-3-5-sonnet (primary), llama3.3 (fallback)",
    triggers: ["daily_cron: 08:00 UTC", "budget_threshold_alert", "kpi_drop_>10%"],
    outputs: ["daily_briefing_report", "budget_allocation_json", "agent_task_assignments"],
    integrations: ["Slack (notifications)", "Supabase (state persistence)", "n8n (workflow triggers)"],
    example_input: { task: "Generate Q2 strategy", priority: "high", deadline: "2026-06-30" }
  },
  {
    name: "Marketing Agent",
    role: "Autonomous content and SEO marketing agent",
    goal: "Generate, publish, and optimize marketing content across all channels to drive organic traffic and leads",
    tools: ["write_blog_post", "publish_to_cms", "seo_optimize", "social_post", "email_campaign", "analytics_read"],
    llm: "claude-3-5-sonnet (content), mistral-small (drafts)",
    triggers: ["content_calendar_cron", "trending_topic_webhook", "low_traffic_alert"],
    outputs: ["published_articles", "social_posts", "email_sequences", "seo_reports"],
    integrations: ["WordPress/Ghost CMS", "Twitter/X API", "Mailchimp", "Google Analytics", "Ahrefs"],
    example_input: { task: "write_seo_article", topic: "autonomous AI agents 2026", target_keywords: ["agentic AI", "zero human systems"], word_count: 1500 }
  },
  {
    name: "Sales Agent",
    role: "Autonomous outbound and inbound sales agent",
    goal: "Qualify leads, conduct outreach, follow up on pipelines, and close deals autonomously",
    tools: ["search_leads", "send_email", "update_crm", "schedule_call", "generate_proposal", "close_deal"],
    llm: "gpt-4o (negotiation), llama3.3 (research)",
    triggers: ["new_lead_webhook", "follow_up_cron", "deal_stage_update"],
    outputs: ["outreach_emails", "crm_updates", "proposals", "deal_closed_events"],
    integrations: ["HubSpot CRM", "Gmail API", "Calendly", "Stripe (invoicing)", "LinkedIn API"],
    example_input: { task: "outreach_sequence", lead: { name: "Acme Corp", email: "ceo@acme.com", company_size: 50 }, offer: "ZHS Enterprise Plan" }
  },
  {
    name: "Finance Agent",
    role: "Autonomous financial operations and reporting agent",
    goal: "Monitor revenue, reconcile accounts, generate financial reports, and manage treasury autonomously",
    tools: ["read_stripe_revenue", "reconcile_transactions", "generate_p_and_l", "pay_invoice", "tax_calculation", "treasury_rebalance"],
    llm: "claude-3-5-sonnet (analysis), llama3.3 (reports)",
    triggers: ["monthly_close_cron", "transaction_webhook", "budget_exceeded_alert"],
    outputs: ["monthly_p_and_l", "tax_reports", "invoice_payments", "treasury_snapshots"],
    integrations: ["Stripe API", "QuickBooks/Xero", "Coinbase CDP (treasury)", "Supabase (ledger)"],
    example_input: { task: "monthly_reconciliation", period: "2026-03", include_crypto: true, output_format: "pdf" }
  },
  {
    name: "Support Agent",
    role: "Autonomous customer support and ticket resolution agent",
    goal: "Resolve customer tickets, answer product questions, and escalate complex issues with zero human involvement",
    tools: ["read_ticket", "search_knowledge_base", "send_reply", "escalate_ticket", "update_ticket_status", "refund_customer"],
    llm: "mistral-small (fast responses), claude-3-5-sonnet (complex issues)",
    triggers: ["new_ticket_webhook", "ticket_sla_breach", "customer_churn_risk"],
    outputs: ["ticket_responses", "resolved_tickets", "escalation_reports", "csat_scores"],
    integrations: ["Intercom/Zendesk API", "Stripe (refunds)", "Slack (escalations)", "Knowledge Base (RAG)"],
    example_input: { task: "resolve_ticket", ticket_id: "T-4821", customer_email: "user@example.com", issue: "billing question" }
  },
  {
    name: "Legal Agent",
    role: "Autonomous legal review and contract analysis agent",
    goal: "Review contracts, flag risks, draft standard agreements, and monitor regulatory compliance",
    tools: ["analyze_contract", "flag_legal_risk", "draft_nda", "check_compliance", "summarize_terms", "escalate_to_lawyer"],
    llm: "claude-3-5-sonnet (legal reasoning — required)",
    triggers: ["new_contract_upload", "compliance_check_cron", "regulatory_change_alert"],
    outputs: ["contract_reviews", "risk_reports", "drafted_agreements", "compliance_checklists"],
    integrations: ["DocuSign API", "Google Drive (contract storage)", "Slack (alerts)", "Legal compliance APIs"],
    example_input: { task: "review_contract", document_url: "https://storage/contracts/vendor-agreement.pdf", focus_areas: ["IP rights", "liability caps", "termination clauses"] }
  },
  {
    name: "Product Agent",
    role: "Autonomous product development and feature management agent",
    goal: "Manage product roadmap, write tickets, coordinate engineering tasks, and ship features autonomously",
    tools: ["create_github_issue", "write_prd", "update_roadmap", "code_review", "deploy_feature", "user_feedback_analysis"],
    llm: "claude-3-5-sonnet (PRD writing), llama3.3 (code review)",
    triggers: ["user_feedback_webhook", "sprint_start_cron", "bug_severity_alert"],
    outputs: ["product_requirements_docs", "github_issues", "roadmap_updates", "release_notes"],
    integrations: ["GitHub API", "Linear/Jira", "Vercel (deploys)", "PostHog (analytics)", "Notion"],
    example_input: { task: "write_prd", feature: "x402 payment integration", priority: "high", target_sprint: "2026-Q2-S3" }
  },
  {
    name: "Analytics Agent",
    role: "Autonomous data analysis and business intelligence agent",
    goal: "Collect, analyze, and report on business metrics, competitor intelligence, and market trends",
    tools: ["query_database", "run_analysis", "generate_chart", "competitive_research", "forecast_revenue", "send_report"],
    llm: "claude-3-5-sonnet (insight generation), llama3.3 (data processing)",
    triggers: ["weekly_report_cron", "metric_anomaly_alert", "competitor_news_webhook"],
    outputs: ["weekly_dashboards", "competitive_reports", "revenue_forecasts", "anomaly_alerts"],
    integrations: ["Supabase (data)", "Google Analytics", "Ahrefs (SEO)", "Recharts (viz)", "Slack (reports)"],
    example_input: { task: "competitive_analysis", competitors: ["AgentOS", "AutoGPT", "CrewAI Cloud"], metrics: ["pricing", "features", "market_share"] }
  },
  {
    name: "Ops Agent",
    role: "Autonomous infrastructure and DevOps agent",
    goal: "Monitor system health, scale infrastructure, deploy updates, and respond to incidents autonomously",
    tools: ["check_server_health", "scale_containers", "deploy_update", "rotate_secrets", "rollback_deploy", "incident_response"],
    llm: "llama3.3 (fast ops decisions), claude-3-5-sonnet (complex incidents)",
    triggers: ["health_check_cron (every 5min)", "cpu_threshold_alert", "error_rate_spike", "deploy_webhook"],
    outputs: ["health_reports", "scale_events", "incident_reports", "deployment_logs"],
    integrations: ["Docker API", "GitHub Actions", "Oracle Cloud API", "PagerDuty", "Langfuse (monitoring)"],
    example_input: { task: "scale_service", service: "agent-core", reason: "high_cpu_load", target_replicas: 3 }
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agentName, docType } = body;

    // Find the agent config
    const agent = AGENT_CONFIGS.find(a => a.name === agentName);
    if (!agent) {
      return Response.json({ error: `Agent "${agentName}" not found` }, { status: 404 });
    }

    const prompts = {
      overview: `You are a technical documentation writer for an autonomous AI agent platform called Zero Human Systems.
Generate comprehensive documentation for the following AI agent configuration.

Agent Config:
${JSON.stringify(agent, null, 2)}

Write a structured documentation page with these exact sections (use markdown):

## Overview
Brief description of the agent's role and purpose in the Zero Human Systems platform.

## Capabilities
Bullet-point list of what this agent can do autonomously.

## Tools & APIs
For each tool listed, explain what it does, inputs, and outputs in a table format.

## Trigger Events
Explain what events/schedules activate this agent and how it responds.

## LLM Configuration
Explain the model routing strategy and why specific models were chosen.

## Integration Points
List all external services this agent connects to and what data flows.

## Example Request
Show a realistic JSON request payload with all required fields explained.

## Example Response
Show a realistic JSON response the agent would return.

## Best Practices & Limits
Key limits, safety constraints, and operational best practices.

Keep it concise, technical, and accurate. Use proper markdown formatting.`,

      api_reference: `Generate a precise REST API reference for the "${agent.name}" agent in Zero Human Systems.

Agent Config:
${JSON.stringify(agent, null, 2)}

Format as markdown with:
## POST /api/agents/${agent.name.toLowerCase().replace(/\s+/g, '-')}/run
### Request Schema
A JSON schema for the request body with all fields, types, and descriptions.
### Response Schema
A JSON schema for the response with all possible fields.
### Example cURL Request
Complete curl command with headers and body.
### Example Response (200 OK)
Full JSON response example.
### Error Codes
Table of error codes, causes, and resolution.
### Rate Limits & Pricing
x402 payment details if applicable, rate limits, and cost estimates.`,

      examples: `Generate 5 real-world usage examples for the "${agent.name}" agent in Zero Human Systems.

Agent Config:
${JSON.stringify(agent, null, 2)}

For each example provide:
1. **Use Case**: What business problem this solves
2. **Input JSON**: The exact request payload
3. **Expected Output**: What the agent produces
4. **x402 Cost**: Estimated payment in USDC for this operation
5. **Time to Complete**: Estimated execution time

Make examples progressively more complex. Use realistic business scenarios.`,
    };

    const prompt = prompts[docType] || prompts.overview;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
    });

    return Response.json({
      agentName: agent.name,
      docType,
      content: result,
      generatedAt: new Date().toISOString(),
      config: agent,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});