import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Search, Filter, ChevronDown, Copy, Eye, EyeOff, Play } from 'lucide-react';
import { toast } from 'sonner';
import WebhookDeduplicationMonitor from '@/components/workflow/WebhookDeduplicationMonitor';

function LogViewer({ logs }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-background/60 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/30"
      >
        <span className="text-xs font-semibold text-foreground">Processing Logs ({logs.length})</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {!collapsed && (
        <div className="max-h-64 overflow-y-auto font-mono text-[10px] p-3 space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground/50">No logs available</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className={`${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                <span className="text-muted-foreground/40">[{log.timestamp}]</span> {log.message}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PayloadViewer({ data, title = 'Payload' }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-background/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-secondary/20">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisible(!visible)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title={visible ? 'Hide' : 'Show'}
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto p-3">
        {visible ? (
          <pre className="font-mono text-[9px] text-foreground/70 whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-[10px] text-muted-foreground/50">••••• (Click eye to reveal)</p>
        )}
      </div>
    </div>
  );
}

function EventRow({ event, onReplay }) {
  const statusConfig = {
    received: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    processing: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[event.status] || statusConfig.received;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border border-border/40 ${config.bg} space-y-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <div>
            <p className="text-xs font-semibold text-foreground">Event {event.id}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(event.created_date).toLocaleString()} • {event.webhookTriggerId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${config.color} ${config.bg}`}>
            {event.status}
          </span>
          {event.status === 'failed' && (
            <button
              onClick={() => onReplay(event)}
              className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
              title="Replay event"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {event.status === 'failed' && event.errorMessage && (
        <div className="p-2 rounded-lg bg-red-400/10 border border-red-400/20">
          <p className="text-[10px] text-red-300 font-mono">{event.errorMessage}</p>
        </div>
      )}

      <div className="grid gap-3">
        <PayloadViewer data={JSON.parse(event.payload)} title="Request Payload" />
        <LogViewer logs={event.logs || []} />
        {event.processingTime && (
          <p className="text-[10px] text-muted-foreground">⏱️ Processing time: {event.processingTime}ms</p>
        )}
      </div>
    </div>
  );
}

export default function WebhookDebuggerPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replayingId, setReplayingId] = useState(null);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const data = await base44.entities.WebhookEventLog.list('-created_date', 50);
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to load webhook events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (event) => {
    setReplayingId(event.id);
    try {
      const payload = JSON.parse(event.payload);
      const response = await base44.functions.invoke('webhookHandler', {
        webhookId: event.webhookTriggerId,
        payload,
      });

      if (response.data.success) {
        toast.success('Event replayed successfully');
        loadEvents();
      } else {
        toast.error('Replay failed: ' + response.data.error);
      }
    } catch (error) {
      toast.error('Error replaying event: ' + error.message);
    } finally {
      setReplayingId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.webhookTriggerId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Webhook Debugger</h1>
          <p className="text-muted-foreground">Monitor, inspect, and replay webhook events in real-time</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by event ID or webhook trigger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={loadEvents}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Deduplication Monitor */}
        <WebhookDeduplicationMonitor />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Events', value: events.length, color: 'text-foreground' },
            { label: 'Successful', value: events.filter((e) => e.status === 'success').length, color: 'text-green-400' },
            { label: 'Failed', value: events.filter((e) => e.status === 'failed').length, color: 'text-red-400' },
            { label: 'Processing', value: events.filter((e) => e.status === 'processing').length, color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg bg-card border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 rounded-lg border border-border/50 bg-card/50 text-center">
              <p className="text-muted-foreground">No webhook events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onReplay={handleReplay}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}