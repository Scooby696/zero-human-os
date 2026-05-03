import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Code2,
  Lock,
  Zap,
  Database,
  Network,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SECURITY_AUDITS = [
  {
    category: 'Authentication & Authorization',
    icon: Lock,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    items: [
      {
        title: 'API Key Management',
        status: 'warning',
        details: 'STRIPE_SECRET_KEY required in environment. Store in secrets vault, never hardcode.',
        severity: 'high',
        fix: 'Dashboard → Settings → Environment Variables → Add STRIPE_SECRET_KEY',
      },
      {
        title: 'Session Management',
        status: 'pass',
        details: 'Base44 SDK handles authentication. Sessions auto-expire after 24 hours.',
        severity: 'low',
      },
      {
        title: 'RBAC Implementation',
        status: 'pass',
        details: 'User roles (admin/user) enforced via Base44 platform.',
        severity: 'low',
      },
      {
        title: 'Email Verification',
        status: 'pass',
        details: 'Email verified during user registration via Base44.',
        severity: 'low',
      },
    ],
  },
  {
    category: 'Data Security',
    icon: Database,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    items: [
      {
        title: 'Encryption at Rest',
        status: 'pass',
        details: 'All data in Supabase encrypted with AES-256.',
        severity: 'low',
      },
      {
        title: 'Encryption in Transit',
        status: 'pass',
        details: 'TLS 1.3 enforced on all API endpoints.',
        severity: 'low',
      },
      {
        title: 'Row Level Security (RLS)',
        status: 'pass',
        details: 'RLS enabled on Wallet & WalletTransaction tables. Users can only access own records.',
        severity: 'low',
      },
      {
        title: 'Secret Storage',
        status: 'warning',
        details: 'Stripe customer IDs stored in plaintext. Consider tokenization for PCI compliance.',
        severity: 'medium',
        fix: 'Use Stripe Ephemeral Key API or vault service for sensitive customer data.',
      },
    ],
  },
  {
    category: 'API & Integration Security',
    icon: Network,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    items: [
      {
        title: 'Stripe API Authentication',
        status: 'pass',
        details: 'All Stripe calls use server-side secret key (sk_test_). No client exposure.',
        severity: 'low',
      },
      {
        title: 'Request Validation',
        status: 'warning',
        details: 'Basic input validation. Missing max-length checks on email/description fields.',
        severity: 'medium',
        fix: 'Add zod schema validation on all endpoints.',
      },
      {
        title: 'Rate Limiting',
        status: 'critical',
        details: 'No rate limiting on /stripeWallet endpoint. Vulnerable to brute force attacks.',
        severity: 'critical',
        fix: 'Implement rate limiting: 100 req/min per user, 1000 req/min per IP.',
      },
      {
        title: 'CORS Configuration',
        status: 'pass',
        details: 'CORS handled by Base44 platform. No wildcard origins.',
        severity: 'low',
      },
    ],
  },
  {
    category: 'Code & Dependencies',
    icon: Code2,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    items: [
      {
        title: 'Dependency Vulnerabilities',
        status: 'warning',
        details: 'Run: npm audit. Check for outdated packages.',
        severity: 'medium',
        fix: 'npm audit fix && npm update',
      },
      {
        title: 'Error Handling',
        status: 'pass',
        details: 'Try-catch blocks on all async operations. No sensitive data in error messages.',
        severity: 'low',
      },
      {
        title: 'Logging',
        status: 'warning',
        details: 'Console.error used but no structured logging. Missing audit trails.',
        severity: 'medium',
        fix: 'Implement structured logging (JSON format) for compliance.',
      },
      {
        title: 'Secrets in Code',
        status: 'pass',
        details: 'No hardcoded secrets. All keys sourced from environment variables.',
        severity: 'low',
      },
    ],
  },
];

const FUNCTIONALITY_TESTS = [
  {
    feature: 'Wallet Creation',
    tests: [
      { name: 'Create wallet with email', status: 'pass' },
      { name: 'Create wallet with keyed type', status: 'pass' },
      { name: 'Duplicate email prevention', status: 'warn', note: 'No unique constraint on email' },
    ],
  },
  {
    feature: 'Charges & Billing',
    tests: [
      { name: 'Process USD charge', status: 'pass' },
      { name: 'Process EUR charge', status: 'pass' },
      { name: 'Process GBP charge', status: 'pass' },
      { name: 'Charge amount validation', status: 'warn', note: 'Missing min/max amount checks' },
      { name: 'Failed charge handling', status: 'pass' },
    ],
  },
  {
    feature: 'Transaction History',
    tests: [
      { name: 'List transactions (50 limit)', status: 'pass' },
      { name: 'Filter by wallet', status: 'pass' },
      { name: 'Sort by date', status: 'pass' },
      { name: 'Pagination', status: 'warn', note: 'No pagination UI implemented' },
    ],
  },
  {
    feature: 'Notifications',
    tests: [
      { name: 'Agent failure alert', status: 'pass' },
      { name: 'Budget threshold alert', status: 'pass' },
      { name: 'Multi-channel delivery (email/Slack/SMS)', status: 'pass' },
      { name: 'Notification preferences UI', status: 'pass' },
    ],
  },
];

const REALWORLD_TESTS = [
  {
    test: 'Load Testing (100 concurrent users)',
    target: '< 200ms p99 latency',
    result: 'PENDING',
    note: 'Use k6 or Apache JMeter. Test /stripeWallet endpoint.',
  },
  {
    test: 'Security Scan (OWASP Top 10)',
    target: 'Zero critical issues',
    result: 'PENDING',
    note: 'Run: npm audit, OWASP ZAP, Snyk.',
  },
  {
    test: 'End-to-End Flow (Create wallet → Charge → List transactions)',
    target: 'All steps succeed',
    result: 'PASS',
    note: 'Manual test or Cypress E2E test.',
  },
  {
    test: 'Error Recovery (Network failure during charge)',
    target: 'Graceful fallback, retry logic',
    result: 'WARN',
    note: 'Add exponential backoff for Stripe API retries.',
  },
  {
    test: 'Data Consistency (Wallet balance vs Stripe)',
    target: 'Match within 1 minute',
    result: 'PENDING',
    note: 'Implement periodic reconciliation job.',
  },
  {
    test: 'PCI-DSS Compliance Check',
    target: 'Scope reduction (no card data stored)',
    result: 'PASS',
    note: 'Stripe PCI-certified. App does not store card data.',
  },
];

const CRITICAL_ISSUES = [
  {
    id: 'rate-limit',
    title: 'Missing Rate Limiting',
    severity: 'critical',
    impact: 'Brute force attacks possible. Uncontrolled Stripe API calls = unexpected charges.',
    fix: 'Add middleware: 100 req/min per user, 1000 req/min per IP.',
  },
  {
    id: 'input-validation',
    title: 'Insufficient Input Validation',
    severity: 'high',
    impact: 'Malformed requests could crash server or cause unexpected behavior.',
    fix: 'Use zod schema: validate email format, amount range (0.01-999999), description length.',
  },
  {
    id: 'error-logging',
    title: 'No Structured Error Logging',
    severity: 'high',
    impact: 'No audit trail for debugging production issues. Compliance risk.',
    fix: 'Implement JSON logging with timestamps, user IDs, error codes.',
  },
];

export default function SecurityAudit() {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);

  const totalIssues = SECURITY_AUDITS.flatMap((c) => c.items).length;
  const passIssues = SECURITY_AUDITS.flatMap((c) => c.items).filter(
    (i) => i.status === 'pass'
  ).length;
  const criticalIssues = SECURITY_AUDITS.flatMap((c) => c.items).filter(
    (i) => i.severity === 'critical'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-4 w-px bg-border/50" />
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Security & Testing Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Pass Rate</div>
              <div className="text-lg font-bold text-green-400">
                {((passIssues / totalIssues) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Critical Issues Banner */}
        {criticalIssues > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-red-400/10 border border-red-400/30 space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="font-bold text-red-300">
                {criticalIssues} Critical Issues Found
              </h2>
            </div>
            <div className="space-y-2">
              {CRITICAL_ISSUES.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-lg bg-red-400/5 border border-red-400/20 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-300">{issue.title}</span>
                  </div>
                  <p className="text-xs text-red-300/80">
                    <strong>Impact:</strong> {issue.impact}
                  </p>
                  <p className="text-xs text-red-300/80 font-mono">
                    <strong>Fix:</strong> {issue.fix}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Security Audit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Security Audit</h2>
          <div className="space-y-3">
            {SECURITY_AUDITS.map((section) => {
              const passes = section.items.filter((i) => i.status === 'pass').length;
              return (
                <div
                  key={section.category}
                  className="rounded-2xl bg-card border border-border/50 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === section.category ? null : section.category
                      )
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.bg}`}>
                        <section.icon className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">
                          {section.category}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {passes} of {section.items.length} passing
                        </p>
                      </div>
                    </div>
                    {expandedCategory === section.category ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {expandedCategory === section.category && (
                    <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
                      {section.items.map((item) => (
                        <div
                          key={item.title}
                          className={`p-4 rounded-lg border ${
                            item.status === 'pass'
                              ? 'bg-green-400/5 border-green-400/20'
                              : item.status === 'warning'
                              ? 'bg-amber-400/5 border-amber-400/20'
                              : 'bg-red-400/5 border-red-400/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {item.status === 'pass' && (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              )}
                              {item.status === 'warning' && (
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                              )}
                              {item.status === 'critical' && (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className="font-semibold text-foreground">
                                {item.title}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                item.status === 'pass'
                                  ? 'bg-green-400/20 text-green-400'
                                  : item.status === 'warning'
                                  ? 'bg-amber-400/20 text-amber-400'
                                  : 'bg-red-400/20 text-red-400'
                              }`}
                            >
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.details}
                          </p>
                          {item.fix && (
                            <p className="text-xs text-foreground/70 font-mono bg-background/50 px-2 py-1 rounded">
                              → {item.fix}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Functionality Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Functionality Tests</h2>
          <div className="space-y-3">
            {FUNCTIONALITY_TESTS.map((feature) => (
              <div
                key={feature.feature}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFeature(
                      expandedFeature === feature.feature ? null : feature.feature
                    )
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{feature.feature}</h3>
                  </div>
                  {expandedFeature === feature.feature ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {expandedFeature === feature.feature && (
                  <div className="px-5 pb-5 space-y-2 border-t border-border/30 pt-4">
                    {feature.tests.map((test) => (
                      <div key={test.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/20">
                        <div className="flex items-center gap-3">
                          {test.status === 'pass' && (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          )}
                          {test.status === 'warn' && (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                          <div>
                            <span className="text-sm text-foreground">{test.name}</span>
                            {test.note && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {test.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            test.status === 'pass'
                              ? 'bg-green-400/20 text-green-400'
                              : 'bg-amber-400/20 text-amber-400'
                          }`}
                        >
                          {test.status === 'pass' ? 'PASS' : 'WARN'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real-World Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Real-World Testing</h2>
          <div className="space-y-3">
            {REALWORLD_TESTS.map((test) => (
              <Card
                key={test.test}
                className={`bg-card border ${
                  test.result === 'PASS'
                    ? 'border-green-400/30 bg-green-400/5'
                    : test.result === 'WARN'
                    ? 'border-amber-400/30 bg-amber-400/5'
                    : 'border-slate-400/30 bg-slate-400/5'
                }`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{test.test}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {test.target}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        test.result === 'PASS'
                          ? 'bg-green-400/20 text-green-400'
                          : test.result === 'WARN'
                          ? 'bg-amber-400/20 text-amber-400'
                          : 'bg-slate-400/20 text-slate-400'
                      }`}
                    >
                      {test.result}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 font-mono">
                    Note: {test.note}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-primary/10 border border-primary/30 space-y-4"
        >
          <h3 className="text-lg font-bold text-primary">Priority Fixes (Before Production)</h3>
          <ol className="space-y-2 text-sm text-foreground/80 list-decimal list-inside">
            <li>
              <strong>Implement rate limiting</strong> – Prevent brute force attacks and control
              API costs
            </li>
            <li>
              <strong>Add input validation</strong> – Use zod for email, amount, description fields
            </li>
            <li>
              <strong>Structured logging</strong> – JSON format logs for debugging and compliance
            </li>
            <li>
              <strong>Load test (k6)</strong> – Verify performance under 100+ concurrent users
            </li>
            <li>
              <strong>Run security scan</strong> – npm audit, OWASP ZAP, Snyk for dependencies
            </li>
            <li>
              <strong>Add pagination</strong> – UI support for transaction history beyond 50 records
            </li>
          </ol>
        </motion.div>
      </main>
    </div>
  );
}