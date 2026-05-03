import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { dlqRecoveryManager } from '@/utils/dlqRecoveryManager';
import { toast } from 'sonner';

const ACTION_TYPES = [
  { value: 'slack_notification', label: 'Slack Notification', icon: '💬' },
  { value: 'api_cleanup', label: 'API Cleanup', icon: '🧹' },
  { value: 'auto_retry', label: 'Auto Retry', icon: '🔄' },
  { value: 'custom_webhook', label: 'Custom Webhook', icon: '🔗' },
  { value: 'data_rollback', label: 'Data Rollback', icon: '↩️' },
];

function RuleForm({ rule, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    rule || {
      errorCodePattern: '',
      nodeType: 'any',
      action: 'slack_notification',
      enabled: true,
      slackChannel: '#alerts',
      notifyUsers: [],
    }
  );

  const handleSave = () => {
    if (!formData.errorCodePattern) {
      toast.error('Error code pattern is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border/30">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Error Code Pattern (use * for all)
          </label>
          <input
            type="text"
            value={formData.errorCodePattern}
            onChange={(e) => setFormData({ ...formData, errorCodePattern: e.target.value })}
            placeholder="e.g., 429, 503, timeout, *"
            className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Node Type
            </label>
            <select
              value={formData.nodeType}
              onChange={(e) => setFormData({ ...formData, nodeType: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="any">Any</option>
              <option value="llm">LLM</option>
              <option value="action">Action</option>
              <option value="agent">Agent</option>
              <option value="webhook_action">Webhook Action</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Recovery Action
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.action === 'slack_notification' && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Slack Channel
            </label>
            <input
              type="text"
              value={formData.slackChannel}
              onChange={(e) => setFormData({ ...formData, slackChannel: e.target.value })}
              placeholder="#alerts"
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        )}

        {formData.action === 'api_cleanup' && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Cleanup Webhook URL
            </label>
            <input
              type="text"
              value={formData.cleanupConfig?.webhookUrl || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cleanupConfig: { ...formData.cleanupConfig, webhookUrl: e.target.value },
                })
              }
              placeholder="https://api.example.com/cleanup"
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        )}

        {formData.action === 'auto_retry' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Max Retries
              </label>
              <input
                type="number"
                value={formData.retryConfig?.maxRetries || 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retryConfig: { ...formData.retryConfig, maxRetries: parseInt(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Delay (ms)
              </label>
              <input
                type="number"
                value={formData.retryConfig?.delayMs || 5000}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retryConfig: { ...formData.retryConfig, delayMs: parseInt(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {formData.action === 'custom_webhook' && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Webhook URL
            </label>
            <input
              type="text"
              value={formData.webhookUrl || ''}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              placeholder="https://api.example.com/recovery"
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="w-3 h-3"
          />
          <label className="text-xs text-muted-foreground">Enable this rule</label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Save Rule
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 rounded-lg border border-border/50 text-foreground text-xs font-medium hover:bg-secondary/50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function RuleCard({ rule, onEdit, onDelete }) {
  const actionType = ACTION_TYPES.find((a) => a.value === rule.action);

  return (
    <div className="p-3 rounded-lg bg-card border border-border/30 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{actionType?.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">
                {actionType?.label || rule.action}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Pattern: {rule.errorCodePattern}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {rule.enabled ? (
            <span className="w-2 h-2 rounded-full bg-green-400" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          )}
        </div>
      </div>

      <div className="text-[9px] text-muted-foreground/70">
        Node Type: {rule.nodeType === 'any' ? 'All Types' : rule.nodeType}
      </div>

      {rule.slackChannel && (
        <div className="text-[9px] text-muted-foreground/70">
          Slack: {rule.slackChannel}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(rule)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[9px] bg-primary/10 border border-primary/20 text-primary rounded hover:bg-primary/20 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(rule.id)}
          className="px-2 py-1 text-[9px] bg-red-400/10 border border-red-400/20 text-red-400 rounded hover:bg-red-400/20 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function DLQRecoveryPanel({ isOpen, onClose }) {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadRules();
    const interval = setInterval(loadRules, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRules = () => {
    setRules(dlqRecoveryManager.getRecoveryRules());
    setStats(dlqRecoveryManager.getRecoveryStats());
  };

  const handleSaveRule = (formData) => {
    if (editingRule) {
      dlqRecoveryManager.updateRecoveryRule(editingRule.id, formData);
      setEditingRule(null);
    } else {
      dlqRecoveryManager.addRecoveryRule(formData);
    }
    setShowForm(false);
    loadRules();
    toast.success(editingRule ? 'Rule updated' : 'Rule created');
  };

  const handleDeleteRule = (ruleId) => {
    if (window.confirm('Delete this recovery rule?')) {
      dlqRecoveryManager.removeRecoveryRule(ruleId);
      loadRules();
      toast.success('Rule deleted');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">DLQ Recovery Rules</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Define automated recovery actions for error codes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingRule(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-[9px] font-bold text-primary uppercase">Active Rules</p>
                <p className="text-xl font-bold text-foreground mt-1">{stats.enabledRules}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                <p className="text-[9px] font-bold text-emerald-400 uppercase">Successful</p>
                <p className="text-xl font-bold text-emerald-300 mt-1">{stats.successfulExecutions}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <p className="text-[9px] font-bold text-red-400 uppercase">Failed</p>
                <p className="text-xl font-bold text-red-300 mt-1">{stats.failedExecutions}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                <p className="text-[9px] font-bold text-cyan-400 uppercase">Total Executions</p>
                <p className="text-xl font-bold text-cyan-300 mt-1">{stats.totalExecutions}</p>
              </div>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <RuleForm
              rule={editingRule}
              onSave={handleSaveRule}
              onCancel={() => {
                setShowForm(false);
                setEditingRule(null);
              }}
            />
          )}

          {/* Rules List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Recovery Rules ({rules.length})
            </h3>
            {rules.length === 0 ? (
              <div className="p-8 rounded-lg border border-border/30 text-center">
                <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No recovery rules defined</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rules.map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={(r) => {
                      setEditingRule(r);
                      setShowForm(true);
                    }}
                    onDelete={handleDeleteRule}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}