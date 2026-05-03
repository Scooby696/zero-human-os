import React, { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Zap, Lock, Gauge } from 'lucide-react';
import { deploymentAudit } from '@/utils/deploymentAudit';

function AuditItemCard({ item, sectionName }) {
  const statusConfig = {
    pass: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border border-border/30 ${config.bg}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${config.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${config.color}`}>{item.name}</p>
          <p className="text-[10px] text-foreground/70 mt-0.5">{item.description}</p>
          {item.recommendation && (
            <p className="text-[9px] text-foreground/60 mt-1">
              → <span className="text-amber-400">Recommendation:</span> {item.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeploymentAudit() {
  const [expandedSection, setExpandedSection] = useState(null);

  const audit = deploymentAudit;
  const readinessScore = audit.calculateReadinessScore();
  const criticalIssues = audit.getCriticalIssues();
  const blockers = audit.getDeploymentBlockers();
  const phases = audit.getDeploymentPhases();
  const checklist = audit.getPreLaunchChecklist();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Deployment Audit Report</h1>
          <p className="text-muted-foreground">
            Comprehensive pre-deployment readiness assessment • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Readiness Score */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Deployment Readiness
            </p>
            <p className="text-5xl font-bold text-primary">{readinessScore}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              {readinessScore >= 80
                ? '✅ Ready for staging'
                : readinessScore >= 60
                  ? '⚠️ Needs critical fixes'
                  : '🚫 Not ready for deployment'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-red-400/10 border border-red-400/30">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
              Critical Blockers
            </p>
            <p className="text-5xl font-bold text-red-400">{blockers.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Must fix before launch</p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-400/10 border border-amber-400/30">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
              Warnings
            </p>
            <p className="text-5xl font-bold text-amber-400">
              {criticalIssues.filter((i) => i.status === 'warning').length}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Address before production</p>
          </div>
        </div>

        {/* Critical Blockers */}
        {blockers.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/30 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-red-300">🚨 Critical Blockers</h2>
            </div>
            <p className="text-sm text-red-300/80">
              The following issues must be resolved before any production deployment:
            </p>
            <div className="space-y-2">
              {blockers.map((blocker, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-red-400/20">
                  <p className="text-xs font-bold text-red-300">{blocker.issue}</p>
                  <p className="text-[10px] text-foreground/70 mt-1">{blocker.description}</p>
                  {blocker.recommendation && (
                    <p className="text-[9px] text-red-300/70 mt-1">
                      ✓ {blocker.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Sections */}
        <div className="space-y-3">
          {Object.entries(audit.auditSections).map(([key, section]) => (
            <div key={key} className="rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-foreground">{section.name}</h3>
                    <p className="text-xs text-muted-foreground/70">
                      {section.items.length} items •{' '}
                      {section.items.filter((i) => i.status === 'pass').length} passing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">
                    {section.items.filter((i) => i.status === 'pass').length}/{section.items.length}
                  </p>
                </div>
              </button>

              {expandedSection === key && (
                <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border/30 bg-background/50">
                  {section.items.map((item, i) => (
                    <AuditItemCard key={i} item={item} sectionName={section.name} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Deployment Phases */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">📋 4-Week Deployment Roadmap</h2>
          <div className="grid gap-4">
            {phases.map((phase, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-border/50">
                <h3 className="text-sm font-bold text-foreground mb-3">{phase.phase}</h3>
                <ul className="space-y-1">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="text-xs text-foreground/70 flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Launch Checklist */}
        <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
          <h2 className="text-lg font-bold text-foreground">✅ Pre-Launch Checklist</h2>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span className={`text-xs ${item.critical ? 'font-bold text-red-400' : 'text-foreground/70'}`}>
                  {item.item}
                  {item.critical && <span className="ml-1 text-red-400">*CRITICAL</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-2">
            * All critical items must be completed before production launch
          </p>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
          <h2 className="text-lg font-bold text-primary">🎯 Key Recommendations</h2>
          <ul className="space-y-1 text-xs text-foreground/80">
            <li>1. <strong>Immediate:</strong> Implement persistent database with encryption</li>
            <li>2. <strong>Immediate:</strong> Move all secrets to backend KMS</li>
            <li>3. <strong>Immediate:</strong> Add HMAC webhook signature verification</li>
            <li>4. <strong>Week 1:</strong> Configure CORS and security headers</li>
            <li>5. <strong>Week 1-2:</strong> Write comprehensive test suite (unit + E2E)</li>
            <li>6. <strong>Week 2:</strong> Setup CI/CD pipeline and automated testing</li>
            <li>7. <strong>Week 3:</strong> Implement monitoring and observability (Sentry/DataDog)</li>
            <li>8. <strong>Week 3:</strong> Setup database backups and disaster recovery</li>
            <li>9. <strong>Week 4:</strong> Load testing and performance optimization</li>
            <li>10. <strong>Week 4:</strong> Security penetration testing by external firm</li>
          </ul>
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <h2 className="text-lg font-bold text-cyan-400 mb-3">⏰ Timeline to Production</h2>
          <div className="space-y-2 text-sm">
            <p className="text-foreground/80">
              <strong>Estimated time to production readiness:</strong> 4-5 weeks from current date
            </p>
            <p className="text-foreground/70 text-xs">
              This timeline assumes dedicated team and existing infrastructure (AWS, PostgreSQL, CI/CD tools).
              Actual timeline may vary based on team size and complexity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}