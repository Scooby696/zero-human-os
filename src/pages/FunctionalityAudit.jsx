import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { runFunctionalityAudit } from '@/utils/functionalityAudit';

function TestCard({ test }) {
  const statusConfig = {
    pass: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[test.status];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border border-border/30 ${config.bg}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${config.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${config.color}`}>{test.name}</p>
          <p className="text-[10px] text-foreground/70 mt-0.5">{test.details}</p>
          {test.recommendation && (
            <p className="text-[9px] text-amber-400 mt-1">
              💡 {test.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FunctionalityAudit() {
  const [auditData, setAuditData] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runAudit() {
      try {
        const results = await runFunctionalityAudit();
        setAuditData(results);
      } catch (error) {
        console.error('Audit failed:', error);
      } finally {
        setLoading(false);
      }
    }

    runAudit();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Failed to run audit</p>
      </div>
    );
  }

  const { sections, summary } = auditData;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">ZHS App Functionality Audit</h1>
          <p className="text-muted-foreground">
            Comprehensive functional testing report • {new Date(auditData.timestamp).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Scores */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Overall Score
            </p>
            <p className="text-5xl font-bold text-primary">{summary.score}%</p>
            <p className="text-xs text-muted-foreground mt-2">Functionality Complete</p>
          </div>

          <div className="p-6 rounded-2xl bg-green-400/10 border border-green-400/30">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
              Passing Tests
            </p>
            <p className="text-5xl font-bold text-green-400">{summary.passed}</p>
            <p className="text-xs text-muted-foreground mt-2">of {summary.total}</p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-400/10 border border-amber-400/30">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
              Warnings
            </p>
            <p className="text-5xl font-bold text-amber-400">{summary.warnings}</p>
            <p className="text-xs text-muted-foreground mt-2">Minor Issues</p>
          </div>

          <div className="p-6 rounded-2xl bg-red-400/10 border border-red-400/30">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
              Failed Tests
            </p>
            <p className="text-5xl font-bold text-red-400">{summary.failed}</p>
            <p className="text-xs text-muted-foreground mt-2">Critical Issues</p>
          </div>
        </div>

        {/* Key Findings */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
          <h2 className="text-lg font-bold text-primary">✅ Key Strengths</h2>
          <ul className="text-xs text-foreground/80 space-y-1">
            <li>✓ Robust workflow builder with 10+ node types</li>
            <li>✓ Parallel execution engine with performance metrics</li>
            <li>✓ Comprehensive cost optimization and prediction</li>
            <li>✓ Self-healing DLQ with custom recovery rules</li>
            <li>✓ Multi-workspace collaboration with role-based access</li>
            <li>✓ Webhook triggers with event logging and deduplication</li>
          </ul>
        </div>

        {/* Critical Warnings */}
        <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/30 space-y-2">
          <h2 className="text-lg font-bold text-amber-400">⚠️ Critical Warnings for Production</h2>
          <ul className="text-xs text-foreground/80 space-y-1">
            <li>🔴 <strong>In-Memory Storage:</strong> All data lost on restart - needs persistent database</li>
            <li>🔴 <strong>Secret Encryption:</strong> Base64 frontend-only encryption - use backend KMS</li>
            <li>🔴 <strong>Webhook Auth:</strong> Token-based only - add HMAC-SHA256 verification</li>
            <li>🔴 <strong>Error Tracking:</strong> Console logging only - integrate Sentry/DataDog</li>
            <li>🟡 <strong>Canvas Performance:</strong> May lag with 100+ nodes - add virtualization</li>
            <li>🟡 <strong>Audit Logging:</strong> Limited compliance trail - implement comprehensive logging</li>
          </ul>
        </div>

        {/* Audit Sections */}
        <div className="space-y-3">
          {Object.entries(sections).map(([key, section]) => {
            const passed = section.tests.filter((t) => t.status === 'pass').length;
            const total = section.tests.length;

            return (
              <div key={key} className="rounded-lg border border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-foreground">{section.name}</h3>
                      <p className="text-xs text-muted-foreground/70">
                        {passed}/{total} tests passing
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      {Math.round((passed / total) * 100)}%
                    </p>
                  </div>
                </button>

                {expandedSection === key && (
                  <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border/30 bg-background/50">
                    {section.tests.map((test, i) => (
                      <TestCard key={i} test={test} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400">🎯 Production Readiness Recommendations</h2>
          <div className="space-y-2 text-xs text-foreground/80">
            <p><strong>Priority 1 (Before Any Deployment):</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Implement persistent database (PostgreSQL/MongoDB)</li>
              <li>Move secrets to AWS Secrets Manager or HashiCorp Vault</li>
              <li>Add HMAC-SHA256 webhook signature verification</li>
              <li>Configure CORS and security headers on all endpoints</li>
            </ul>

            <p className="pt-2"><strong>Priority 2 (Week 1-2):</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Setup Sentry or DataDog for error tracking and APM</li>
              <li>Implement comprehensive audit logging</li>
              <li>Add /health check endpoint for monitoring</li>
              <li>Enable database encryption at rest</li>
            </ul>

            <p className="pt-2"><strong>Priority 3 (Week 2-3):</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Add React virtualization for large workflows</li>
              <li>Setup CI/CD pipeline (GitHub Actions)</li>
              <li>Configure automated database backups</li>
              <li>Write comprehensive test suite (80%+ coverage)</li>
            </ul>
          </div>
        </div>

        {/* Test Coverage */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-3">📊 Test Coverage by Category</h2>
          <div className="space-y-2">
            {Object.entries(sections).map(([key, section]) => {
              const passed = section.tests.filter((t) => t.status === 'pass').length;
              const warnings = section.tests.filter((t) => t.status === 'warning').length;
              const total = section.tests.length;
              const percentage = Math.round((passed / total) * 100);

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{section.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {passed}✓ {warnings > 0 && `${warnings}⚠️`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage >= 80
                          ? 'bg-green-400'
                          : percentage >= 50
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conclusion */}
        <div className="p-4 rounded-lg bg-secondary/20 border border-border/30">
          <h2 className="text-lg font-bold text-foreground mb-2">📝 Conclusion</h2>
          <p className="text-xs text-foreground/80 leading-relaxed">
            The ZHS workflow automation platform has <strong>strong core functionality</strong> with robust workflow building,
            simulation, cost optimization, and error recovery. However, <strong>production deployment requires immediate attention</strong> to
            data persistence, security hardening, and observability. The app is currently suitable for development and
            internal testing but needs the Priority 1 items addressed before any customer-facing deployment.
          </p>
        </div>
      </div>
    </div>
  );
}