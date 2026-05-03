import React, { useState } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Lock, Shield, Zap, Server, Users, Code, Database } from "lucide-react";

const AUDIT_CATEGORIES = {
  functionality: {
    title: "Functionality",
    icon: Zap,
    items: [
      {
        id: "workflow-canvas",
        name: "Workflow Canvas & Node System",
        status: "pass",
        details: "Complete drag-drop workflow builder with 10+ node types implemented",
      },
      {
        id: "real-time-collab",
        name: "Real-time Collaboration",
        status: "warning",
        details: "Presence indicators exist but websocket sync not persisted to database",
      },
      {
        id: "workspace-mgmt",
        name: "Workspace & Team Management",
        status: "pass",
        details: "Role-based access (Viewer/Editor/Admin) with invites and permissions implemented",
      },
      {
        id: "webhook-triggers",
        name: "Webhook Triggers",
        status: "pass",
        details: "Secure public URLs with token auth and IP whitelisting, but events not persisted",
      },
      {
        id: "simulation",
        name: "Workflow Simulation & Testing",
        status: "pass",
        details: "Full simulation mode with breakpoints, node data inspection, and export",
      },
      {
        id: "secret-vault",
        name: "Secret Vault & Credential Management",
        status: "warning",
        details: "Frontend-only encryption (base64), no backend key management",
      },
      {
        id: "error-handling",
        name: "Error Handler Nodes",
        status: "pass",
        details: "Retry logic, fallbacks, and alert notifications configured per node",
      },
      {
        id: "version-control",
        name: "Version Control & History",
        status: "pass",
        details: "Local version snapshots with restore capability",
      },
    ],
  },
  security: {
    title: "Security",
    icon: Shield,
    items: [
      {
        id: "auth",
        name: "Authentication",
        status: "pass",
        details: "Base44 SDK handles auth, user session checked on app load",
      },
      {
        id: "rbac",
        name: "Role-Based Access Control",
        status: "pass",
        details: "Workspace roles enforced on client-side, permission checks exist",
      },
      {
        id: "secret-encryption",
        name: "Secret Encryption",
        status: "critical",
        details: "⚠️ CRITICAL: Frontend-only base64 encryption is NOT secure. Secrets transmitted/stored insecurely",
        action: "Move to Backend KMS (AWS Secrets Manager/HashiCorp Vault)",
      },
      {
        id: "data-persistence",
        name: "Data Persistence",
        status: "critical",
        details: "⚠️ CRITICAL: All data (workspaces, workflows, secrets) stored in-memory. Lost on app restart",
        action: "Implement persistent database (PostgreSQL/MongoDB) with Row-Level Security",
      },
      {
        id: "webhook-auth",
        name: "Webhook Authentication",
        status: "warning",
        details: "Token-based auth implemented but no HMAC signature verification",
        action: "Add HMAC-SHA256 signature verification for webhook requests",
      },
      {
        id: "input-validation",
        name: "Input Validation",
        status: "warning",
        details: "Limited server-side validation on webhook payloads, no rate limiting",
        action: "Add request size limits, JSON schema validation, and rate limiting",
      },
      {
        id: "cors",
        name: "CORS & Headers",
        status: "warning",
        details: "No explicit CORS policy or security headers configured",
        action: "Configure CORS, Content-Security-Policy, X-Frame-Options",
      },
      {
        id: "sql-injection",
        name: "Data Sanitization",
        status: "pass",
        details: "No SQL used (in-memory), but workflow payload injection possible in simulation",
      },
    ],
  },
  production: {
    title: "Production Readiness",
    icon: Server,
    items: [
      {
        id: "scaling",
        name: "Scalability",
        status: "critical",
        details: "⚠️ In-memory state limits to single instance. No horizontal scaling possible",
        action: "Implement distributed state management (Redis/Pub-Sub)",
      },
      {
        id: "monitoring",
        name: "Monitoring & Logging",
        status: "warning",
        details: "Basic console.log statements, no structured logging or metrics",
        action: "Add Sentry/DataDog for error tracking and performance monitoring",
      },
      {
        id: "performance",
        name: "Performance",
        status: "warning",
        details: "Canvas rendering with 100+ nodes may be slow, no virtualization",
        action: "Implement React virtualization for large node lists",
      },
      {
        id: "error-recovery",
        name: "Error Recovery & Resilience",
        status: "warning",
        details: "No circuit breakers, retry logic on 429/503 but limited",
        action: "Add exponential backoff, circuit breakers, and DLQ for failed events",
      },
      {
        id: "testing",
        name: "Testing Coverage",
        status: "critical",
        details: "⚠️ No unit/integration tests found, only manual simulation testing",
        action: "Add Jest unit tests and Cypress E2E tests (target 80%+ coverage)",
      },
      {
        id: "api-versioning",
        name: "API Versioning",
        status: "warning",
        details: "No API versioning strategy for webhook endpoints",
        action: "Implement /api/v1/ versioning for breaking changes",
      },
      {
        id: "documentation",
        name: "API Documentation",
        status: "warning",
        details: "Webhook URLs shown in UI but no OpenAPI/Swagger spec",
        action: "Generate OpenAPI spec for webhook/API endpoints",
      },
      {
        id: "deployment",
        name: "Deployment & DevOps",
        status: "warning",
        details: "No CI/CD pipeline, env config in code, no secrets management",
        action: "Setup GitHub Actions CI/CD with automated testing and deployment",
      },
    ],
  },
};

const BLOCKERS = [
  {
    severity: "critical",
    issue: "No Persistent Database",
    impact: "All user data lost on restart; unacceptable for production",
    required: "PostgreSQL/MongoDB with proper indexing and backups",
  },
  {
    severity: "critical",
    issue: "Frontend-Only Secret Encryption",
    impact: "Secrets visible in browser memory/network traffic; major compliance violation",
    required: "Backend KMS with encrypted-at-rest storage",
  },
  {
    severity: "critical",
    issue: "No Testing Suite",
    impact: "Cannot confidently deploy; regressions undetected",
    required: "Jest unit tests + Cypress E2E tests (80%+ coverage)",
  },
  {
    severity: "high",
    issue: "No Monitoring/Observability",
    impact: "Production incidents invisible; impossible to debug",
    required: "Sentry, DataDog, or similar APM/error tracking",
  },
  {
    severity: "high",
    issue: "Single-Instance Only (In-Memory State)",
    impact: "Cannot scale; no high availability",
    required: "Distributed state (Redis) or move to persistent DB",
  },
];

const DEPLOYMENT_CHECKLIST = [
  {
    phase: "Phase 1: Data Layer (Week 1-2)",
    items: [
      "✓ Setup PostgreSQL with Row-Level Security policies",
      "✓ Create schema for workspaces, workflows, invites, webhooks, secrets",
      "✓ Implement Base44 SDK entity integration",
      "✓ Run migrations and test data integrity",
    ],
  },
  {
    phase: "Phase 2: Security Hardening (Week 2-3)",
    items: [
      "✓ Move secrets to AWS Secrets Manager / HashiCorp Vault",
      "✓ Add HMAC signature validation to webhooks",
      "✓ Implement request size limits & rate limiting",
      "✓ Add CORS and security headers",
      "✓ Enable Row-Level Security on all data tables",
    ],
  },
  {
    phase: "Phase 3: Testing & QA (Week 3-4)",
    items: [
      "✓ Write Jest unit tests (auth, workspace, webhooks)",
      "✓ Write Cypress E2E tests (workflow creation, collab, invites)",
      "✓ Load test with k6 (1000+ concurrent users)",
      "✓ Security audit with OWASP Top 10 checklist",
    ],
  },
  {
    phase: "Phase 4: Deployment Infrastructure (Week 4)",
    items: [
      "✓ Setup GitHub Actions CI/CD pipeline",
      "✓ Configure Sentry/DataDog monitoring",
      "✓ Setup database backups and recovery procedures",
      "✓ Configure CloudFlare/WAF for DDoS protection",
    ],
  },
  {
    phase: "Phase 5: Pre-Launch (Final Week)",
    items: [
      "✓ Run full security penetration test",
      "✓ Verify SLA targets (99.9% uptime, <100ms latency)",
      "✓ Conduct disaster recovery drill",
      "✓ Update privacy policy & terms of service",
      "✓ Launch beta to 50 users, gather feedback",
      "✓ Fix critical bugs, scale resources as needed",
    ],
  },
];

const AuditItem = ({ item }) => {
  const statusConfig = {
    pass: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
    critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border border-border/30 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 ${config.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.color}`}>{item.name}</p>
          <p className="text-xs text-foreground/70 mt-1">{item.details}</p>
          {item.action && (
            <p className="text-xs text-foreground/50 mt-1.5 font-mono">→ {item.action}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const BlockerCard = ({ blocker }) => (
  <div className="p-4 rounded-lg border border-red-400/30 bg-red-400/10">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-300">{blocker.issue}</p>
        <p className="text-xs text-foreground/70 mt-1"><strong>Impact:</strong> {blocker.impact}</p>
        <p className="text-xs text-foreground/70 mt-1"><strong>Required Fix:</strong> {blocker.required}</p>
      </div>
    </div>
  </div>
);

export default function PreLaunchAudit() {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const getCategoryStats = (category) => {
    const items = category.items;
    return {
      total: items.length,
      pass: items.filter((i) => i.status === "pass").length,
      warning: items.filter((i) => i.status === "warning").length,
      critical: items.filter((i) => i.status === "critical").length,
    };
  };

  const overallStats = {
    pass: Object.values(AUDIT_CATEGORIES).flatMap((c) => c.items).filter((i) => i.status === "pass").length,
    warning: Object.values(AUDIT_CATEGORIES).flatMap((c) => c.items).filter((i) => i.status === "warning").length,
    critical: Object.values(AUDIT_CATEGORIES).flatMap((c) => c.items).filter((i) => i.status === "critical").length,
    total: Object.values(AUDIT_CATEGORIES).flatMap((c) => c.items).length,
  };

  const readinessScore = Math.round(
    ((overallStats.pass * 100 + overallStats.warning * 25 + overallStats.critical * 0) / 
    (overallStats.total * 100)) * 100
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pre-Launch Audit Report</h1>
          <p className="text-muted-foreground">
            Comprehensive security, functionality, and production readiness assessment
          </p>
        </div>

        {/* Overall Score */}
        <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Overall Readiness
              </p>
              <p className="text-4xl font-bold text-foreground">{readinessScore}%</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-400">{overallStats.pass} Pass</div>
              <div className="text-sm font-semibold text-amber-400">{overallStats.warning} Warning</div>
              <div className="text-sm font-semibold text-red-400">{overallStats.critical} Blocker</div>
            </div>
          </div>
          <p className="text-xs text-red-300 font-semibold">
            ⚠️ {BLOCKERS.length} Critical Blockers Found — Cannot launch without addressing these
          </p>
        </div>

        {/* Critical Blockers */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">🚨 Critical Blockers</h2>
          <div className="space-y-2">
            {BLOCKERS.map((blocker, i) => (
              <BlockerCard key={i} blocker={blocker} />
            ))}
          </div>
        </div>

        {/* Audit Categories */}
        <div className="space-y-3">
          {Object.entries(AUDIT_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const stats = getCategoryStats(category);
            const isExpanded = expandedCategory === key;

            return (
              <div key={key} className="rounded-lg border border-border/50 overflow-hidden bg-card/50">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-foreground">{category.title}</h3>
                      <p className="text-xs text-muted-foreground/70">
                        {stats.pass} pass · {stats.warning} warning · {stats.critical} critical
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">{stats.pass}/{stats.total}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border/30 bg-background/50">
                    {category.items.map((item) => (
                      <AuditItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Deployment Roadmap */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">📋 Launch Roadmap (4-5 Weeks)</h2>
          <div className="space-y-3">
            {DEPLOYMENT_CHECKLIST.map((phase, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-border/50">
                <h3 className="text-sm font-bold text-foreground mb-2">{phase.phase}</h3>
                <ul className="space-y-1">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-xs text-foreground/70 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Recommendations */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
          <h3 className="text-sm font-bold text-primary">🎯 Key Recommendations Before Launch</h3>
          <ul className="text-xs text-foreground/70 space-y-1">
            <li>1. <strong>Migrate to persistent database</strong> with encryption at rest (Priority: CRITICAL)</li>
            <li>2. <strong>Implement backend secret management</strong> using AWS Secrets Manager (Priority: CRITICAL)</li>
            <li>3. <strong>Add comprehensive test coverage</strong> (unit + E2E) minimum 80% (Priority: CRITICAL)</li>
            <li>4. <strong>Setup observability stack</strong> (Sentry, DataDog, or ELK) for production monitoring</li>
            <li>5. <strong>Implement distributed state management</strong> (Redis) for multi-instance scaling</li>
            <li>6. <strong>Add HMAC webhook signature verification</strong> and request size limits</li>
            <li>7. <strong>Configure CORS, CSP, and security headers</strong> on all endpoints</li>
            <li>8. <strong>Implement rate limiting and circuit breakers</strong> for resilience</li>
            <li>9. <strong>Setup automated backups</strong> and disaster recovery procedures</li>
            <li>10. <strong>Conduct security penetration test</strong> before public launch</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-xs text-muted-foreground/70">
          <p>This audit was performed on 2026-05-03. Recommendations are based on current codebase analysis and production best practices. Re-run after each major feature addition.</p>
        </div>
      </div>
    </div>
  );
}