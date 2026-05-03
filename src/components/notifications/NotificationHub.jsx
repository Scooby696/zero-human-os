import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EVENT_TYPE_COLORS = {
  agent_failure: { bg: 'bg-red-400/10', text: 'text-red-400', label: '⚠️ Agent Failure' },
  budget_exceeded: { bg: 'bg-amber-400/10', text: 'text-amber-400', label: '💰 Budget Exceeded' },
  security_alert: { bg: 'bg-orange-400/10', text: 'text-orange-400', label: '🔒 Security Alert' },
  workflow_complete: { bg: 'bg-green-400/10', text: 'text-green-400', label: '✓ Workflow Complete' },
};

const CHANNEL_ICONS = {
  email: Mail,
  slack: MessageSquare,
  sms: Phone,
};

export default function NotificationHub() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const logs = await base44.entities.NotificationLog.filter(
          { userId: currentUser.id },
          '-created_date',
          50
        );
        setLogs(logs);
      } catch (error) {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const logs = await base44.entities.NotificationLog.filter(
        { userId: user.id },
        '-created_date',
        50
      );
      setLogs(logs);
      toast.success('Notifications refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent =
      filterEventType === 'all' || log.eventType === filterEventType;
    const matchesStatus =
      filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Notification Hub
          </h2>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time alerts for critical system events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Total Sent</p>
          <p className="text-2xl font-bold text-foreground">
            {logs.filter((l) => l.status === 'sent').length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">
            {logs.filter((l) => l.status === 'failed').length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-primary">
            {logs.filter((l) => {
              const today = new Date();
              const logDate = new Date(l.created_date);
              return logDate.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
        </div>

        <select
          value={filterEventType}
          onChange={(e) => setFilterEventType(e.target.value)}
          className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Events</option>
          {Object.entries(EVENT_TYPE_COLORS).map(([type, config]) => (
            <option key={type} value={type}>
              {config.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-lg bg-card border border-border/50 text-center">
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const eventConfig = EVENT_TYPE_COLORS[log.eventType];
            const channels = JSON.parse(log.channels || '[]');
            const statusIcon =
              log.status === 'sent' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : log.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              );

            return (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${eventConfig.bg} border-border/50 space-y-2`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {statusIcon}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${eventConfig.text}`}>
                        {eventConfig.label}
                      </h3>
                      <p className="font-medium text-foreground mt-0.5">
                        {log.subject}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {log.message.substring(0, 100)}
                        {log.message.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        log.status === 'sent'
                          ? 'bg-green-400/20 text-green-400'
                          : log.status === 'failed'
                          ? 'bg-red-400/20 text-red-400'
                          : 'bg-amber-400/20 text-amber-400'
                      }`}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Channels */}
                <div className="flex gap-2 ml-8">
                  {channels.map((channel) => {
                    const Icon = CHANNEL_ICONS[channel];
                    return Icon ? (
                      <div
                        key={channel}
                        className="flex items-center gap-1 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded"
                      >
                        <Icon className="w-3 h-3" />
                        {channel}
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Error Message */}
                {log.errorMessage && (
                  <div className="ml-8 p-2 rounded bg-red-400/10 border border-red-400/20">
                    <p className="text-xs text-red-300 font-mono">
                      {log.errorMessage}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground/60 ml-8">
                  {new Date(log.created_date).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}