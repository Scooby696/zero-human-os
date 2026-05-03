import React, { useState } from "react";
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, AlertTriangle, Lock, Zap, TrendingUp } from "lucide-react";

export default function PreLaunchAudit() {
  const [expandedSections, setExpandedSections] = useState(["functionality", "security", "realworld"]);

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const AuditItem = ({ status, title, description, details }) => (
    <div className={`p-4 rounded-lg border ${
      status === "pass" ? "bg-green-400/10 border-green-400/30" :
      status === "warn" ? "bg-amber-400/10 border-amber-400/30" :
      "bg-red-400/10 border-red-400/30"
    }`}>
      <div className="flex items-start gap-3">
        {status === "pass" && <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />}
        {status === "warn" && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />}
        {status === "fail" && <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />}
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {details && (
            <div className="mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground space-y-1">
              {details.map((detail, i) => <div key={i}>• {detail}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AuditSection = ({ title, icon: Icon, description, items, section }) => (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-6 py-4 bg-secondary/20 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <div className="text-left">
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {expandedSections.includes(section) ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {expandedSections.includes(section) && (
        <div className="px-6 py-4 space-y-3 bg-background/40">
          {items.map((item, i) => (
            <AuditItem key={i} {...item} />
          ))}
        </div>
      )}
    </div>
  );

  const functionalityItems = [
    {
      status: "pass",
      title: "Workflow Canvas",
      description: "Node creation, deletion, connection, dragging, and panning all functional",
      details: ["✓ All 10 node types working", "✓ Edge creation and deletion", "✓ Canvas pan and zoom"]
    },
    {
      status: "pass",
      title: "Node Configuration",
      description: "Node label editing and configuration panel fully operational",
      details: ["✓ All node types have required config fields", "✓ Real-time label updates", "✓ Config persistence"]
    },
    {
      status: "pass",
      title: "Simulation Engine",
      description: "Workflow test mode with breakpoints and data flow inspection",
      details: ["✓ Simulation runs without errors", "✓ Breakpoint pausing works", "✓ Data flow tracking accurate"]
    },
    {
      status: "pass",
      title: "Template System",
      description: "Browse, preview, and import pre-built workflow templates",
      details: ["✓ 5 pre-built templates included", "✓ Template import creates nodes/edges correctly", "✓ Category filtering works"]
    },
    {
      status: "pass",
      title: "Version Control",
      description: "Save, restore, and manage workflow snapshots",
      details: ["✓ Version saving functional", "✓ Restore preserves exact state", "✓ Delete and rename working"]
    },
    {
      status: "pass",
      title: "Agent Integration",
      description: "Agent selector and x402 agent node configuration",
      details: ["✓ Agent registry loads correctly", "✓ Custom agent nodes created", "✓ Agent config persists"]
    },
    {
      status: "warn",
      title: "Real-Time Collaboration",
      description: "Multi-user editing with cursor tracking and presence",
      details: ["⚠ Tested with mock users only", "⚠ Needs WebSocket server validation", "⚠ Conflict resolution untested with >3 users"]
    },
    {
      status: "pass",
      title: "Export/Import",
      description: "Workflow JSON export and PDF simulation reports",
      details: ["✓ JSON export creates valid files", "✓ PDF generation works", "✓ Imports parse correctly"]
    },
    {
      status: "warn",
      title: "Voice Integration",
      description: "LiveKit voice-to-voice assistant connection",
      details: ["⚠ Requires valid LiveKit token", "⚠ Microphone permissions needed", "⚠ Transcript reliability untested in noisy environments"]
    },
    {
      status: "pass",
      title: "Wallet Management",
      description: "Agent wallet creation, fund tracking, and viability analysis",
      details: ["✓ Wallet CRUD operations work", "✓ Cost calculations accurate", "✓ LocalStorage persistence verified"]
    }
  ];

  const securityItems = [
    {
      status: "fail",
      title: "Authentication",
      description: "User identity verification and session management",
      details: ["❌ No multi-factor authentication (MFA)", "❌ Session timeout not implemented", "❌ No rate limiting on login"]
    },
    {
      status: "fail",
      title: "Authorization",
      description: "Role-based access control (RBAC) and permissions",
      details: ["❌ No workflow-level access control", "❌ All users see all agents", "❌ No audit logging of changes"]
    },
    {
      status: "warn",
      title: "Data Encryption",
      description: "Encryption at rest and in transit",
      details: ["⚠ HTTPS/TLS in production only", "⚠ Sensitive config stored in localStorage (unencrypted)", "⚠ Agent API keys visible in frontend logs"]
    },
    {
      status: "fail",
      title: "API Security",
      description: "Backend endpoint protection and input validation",
      details: ["❌ No CORS restriction on /voiceToken endpoint", "❌ No request body validation on functions", "❌ Missing API key rotation mechanism"]
    },
    {
      status: "fail",
      title: "Secret Management",
      description: "Secure handling of API keys and credentials",
      details: ["❌ VOCAL_BRIDGE_API_KEY logged in console", "❌ Agent API keys hardcoded in templates", "❌ No secret expiration policy"]
    },
    {
      status: "warn",
      title: "Input Validation",
      description: "Sanitization of user inputs and workflow configs",
      details: ["⚠ Node labels accept any input (XSS risk)", "⚠ Webhook URLs not validated", "⚠ JSON schema fields not sanitized"]
    },
    {
      status: "fail",
      title: "Dependency Vulnerabilities",
      description: "Third-party package security",
      details: ["❌ @livekit/components-react has 2 medium CVEs", "❌ Dependencies not pinned to patch versions", "❌ No automated vulnerability scanning"]
    },
    {
      status: "warn",
      title: "Error Handling",
      description: "Sensitive information exposure in error messages",
      details: ["⚠ Stack traces visible in console", "⚠ API error responses show internal paths", "⚠ No structured error logging"]
    },
    {
      status: "fail",
      title: "CSRF Protection",
      description: "Cross-site request forgery prevention",
      details: ["❌ No CSRF tokens on state-changing operations", "❌ No SameSite cookie policy", "❌ Webhook actions lack origin verification"]
    },
    {
      status: "warn",
      title: "Data Privacy",
      description: "User data handling and GDPR compliance",
      details: ["⚠ No data retention policy", "⚠ No user deletion/export mechanism", "⚠ Third-party integrations not privacy-audited"]
    }
  ];

  const realworldItems = [
    {
      status: "fail",
      title: "Scalability",
      description: "Performance under production load",
      details: ["❌ No load testing (stress test at 1000 concurrent users needed)", "❌ Canvas becomes sluggish >100 nodes", "❌ WebSocket server capacity unknown"]
    },
    {
      status: "warn",
      title: "Uptime & Reliability",
      description: "99.9% SLA readiness",
      details: ["⚠ No backup/disaster recovery plan", "⚠ Single-region deployment only", "⚠ No automatic failover configured"]
    },
    {
      status: "fail",
      title: "Monitoring & Observability",
      description: "Application health tracking and diagnostics",
      details: ["❌ No application performance monitoring (APM)", "❌ No centralized logging (ELK, Datadog, etc.)", "❌ No alerting on errors >5/min"]
    },
    {
      status: "fail",
      title: "Incident Response",
      description: "Procedures for handling outages and data breaches",
      details: ["❌ No runbook documentation", "❌ No incident communication template", "❌ No post-mortem process"]
    },
    {
      status: "warn",
      title: "Onboarding",
      description: "User training and documentation",
      details: ["⚠ Basic tutorials added but no video guides", "⚠ No in-app help tooltips", "⚠ API documentation incomplete"]
    },
    {
      status: "fail",
      title: "Support Infrastructure",
      description: "User support systems and SLAs",
      details: ["❌ No support ticket system", "❌ No FAQ or knowledge base", "❌ No support email/chat channel"]
    },
    {
      status: "warn",
      title: "Database Backups",
      description: "Data persistence and recovery",
      details: ["⚠ Workflows stored in localStorage (single browser)", "⚠ No cloud backup solution", "⚠ No backup testing/validation"]
    },
    {
      status: "fail",
      title: "Compliance Documentation",
      description: "SOC 2, Privacy Policy, Terms of Service",
      details: ["❌ No Privacy Policy published", "❌ No Terms of Service", "❌ SOC 2 Type II not started"]
    },
    {
      status: "warn",
      title: "Cost Management",
      description: "Billing, usage limits, and cost controls",
      details: ["⚠ No usage tracking/metering", "⚠ No rate limits on API calls", "⚠ Agent costs not enforced against wallet"]
    },
    {
      status: "fail",
      title: "User Feedback Loop",
      description: "Gathering and acting on user feedback",
      details: ["❌ No in-app feedback mechanism", "❌ No feature request voting", "❌ No user research plan"]
    }
  ];

  const criticalBlocking = [
    "Authentication & authorization (basic RBAC required)",
    "API security (CORS, input validation, rate limiting)",
    "Dependency vulnerability fixes (LiveKit CVEs)",
    "Monitoring & alerting (error tracking minimum)",
    "Data backups (cloud storage for workflows)",
    "Privacy Policy & Terms of Service"
  ];

  const highPriority = [
    "Multi-factor authentication (MFA)",
    "Automated security scanning",
    "User support system",
    "Documentation & onboarding",
    "Database encryption",
    "Incident response plan"
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Pre-Launch Audit</h1>
          <p className="text-muted-foreground">Comprehensive functionality, security, and real-world readiness assessment for ZHS platform</p>
        </div>

        {/* Executive Summary */}
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-lg text-foreground mb-2">🚨 NOT READY FOR PRODUCTION</h2>
              <p className="text-muted-foreground">6 critical blocking issues must be resolved before launch. See checklist below.</p>
            </div>
          </div>
        </div>

        {/* Critical Blocking Issues */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Critical Blocking Issues
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {criticalBlocking.map((issue, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                <p className="text-sm text-foreground">{issue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* High Priority Items */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            High Priority (Before Public Launch)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {highPriority.map((issue, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                <p className="text-sm text-foreground">{issue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Sections */}
        <div className="space-y-6">
          <AuditSection
            title="Functionality Audit"
            icon={Zap}
            description="Feature completeness and operational correctness"
            section="functionality"
            items={functionalityItems}
          />

          <AuditSection
            title="Security Audit"
            icon={Lock}
            description="Vulnerability assessment and security best practices"
            section="security"
            items={securityItems}
          />

          <AuditSection
            title="Real-World Readiness"
            icon={TrendingUp}
            description="Production deployment and operational maturity"
            section="realworld"
            items={realworldItems}
          />
        </div>

        {/* Recommended Next Steps */}
        <div className="mt-12 bg-primary/10 border border-primary/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Recommended Launch Roadmap</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Phase 1: Secure MVP (2-3 weeks)</h3>
              <p className="text-sm text-muted-foreground">Fix critical blocking issues, implement basic auth/RBAC, fix CVEs, add monitoring</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Phase 2: Hardening (2-3 weeks)</h3>
              <p className="text-sm text-muted-foreground">Security testing, compliance docs, backup systems, incident response plan</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Phase 3: Beta Launch (1 week)</h3>
              <p className="text-sm text-muted-foreground">Private beta with 50-100 trusted users, gather feedback, stress test at scale</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Phase 4: Public Launch (1 week)</h3>
              <p className="text-sm text-muted-foreground">Full production deployment, support systems online, monitoring active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}