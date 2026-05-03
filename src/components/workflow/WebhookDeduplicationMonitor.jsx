import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Activity, TrendingDown } from 'lucide-react';
import { webhookMiddleware } from '@/utils/webhookMiddleware';
import { deduplicationCache } from '@/utils/webhookDeduplicationCache';

export default function WebhookDeduplicationMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(webhookMiddleware.getMetrics());
      setCacheStats(deduplicationCache.getCacheStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  return (
    <div className="p-4 rounded-lg bg-card border border-border/50 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Webhook Deduplication Monitor</h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[9px] font-bold text-primary uppercase">Total Received</p>
          <p className="text-lg font-bold text-foreground">{metrics.received}</p>
        </div>

        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
          <p className="text-[9px] font-bold text-green-400 uppercase">Duplicates Blocked</p>
          <p className="text-lg font-bold text-green-300">{metrics.duplicates}</p>
        </div>

        <div className="p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
          <p className="text-[9px] font-bold text-blue-400 uppercase">Duplicate Rate</p>
          <p className="text-lg font-bold text-blue-300">{metrics.duplicateRate}%</p>
        </div>

        <div className="p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <p className="text-[9px] font-bold text-emerald-400 uppercase">Cost Saved</p>
          <p className="text-lg font-bold text-emerald-300">${metrics.costSaved.toFixed(4)}</p>
        </div>
      </div>

      {/* Cache Info */}
      {cacheStats && (
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">Active Tracking Window (5s)</p>
            <p className="text-xs font-bold text-primary">{cacheStats.size} entries</p>
          </div>
          {cacheStats.size === 0 ? (
            <p className="text-xs text-muted-foreground/50">No active requests in window</p>
          ) : (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {cacheStats.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-[8px]">
                  <span className="text-muted-foreground font-mono truncate">{entry.id}</span>
                  <span className="text-muted-foreground/70">{entry.age}ms ago</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-400/10 border border-green-400/20">
        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
        <p className="text-xs text-green-300 font-medium">
          Deduplication middleware is active • Filtering 5-second duplicate window
        </p>
      </div>
    </div>
  );
}