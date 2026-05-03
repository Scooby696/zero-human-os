import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Activity } from 'lucide-react';

export default function ParallelExecutionMetrics({ executionData }) {
  if (!executionData) return null;

  const { batches = [], totalTime = 0, averageSpeedup = 1 } = executionData;

  return (
    <div className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Parallel Execution Metrics</h3>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[8px] font-bold text-primary uppercase">Parallel Batches</p>
          <p className="text-lg font-bold text-foreground">{batches.length}</p>
        </div>

        <div className="p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <p className="text-[8px] font-bold text-emerald-400 uppercase">Speedup Factor</p>
          <p className="text-lg font-bold text-emerald-300">{averageSpeedup}x</p>
        </div>

        <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <p className="text-[8px] font-bold text-cyan-400 uppercase">Total Time</p>
          <p className="text-lg font-bold text-cyan-300">{totalTime}ms</p>
        </div>
      </div>

      {/* Batch Details */}
      {batches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Batch Details</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {batches.map((batch, i) => (
              <div key={i} className="p-2 rounded-lg bg-secondary/30 border border-border/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-foreground">Batch {i + 1}</span>
                  <span className="text-[9px] font-bold text-primary">
                    {batch.parallelismLevel} parallel
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-[8px] text-muted-foreground">{batch.duration}ms duration</span>
                  <span className="text-[8px] text-green-400">
                    {batch.speedupFactor}x speedup
                  </span>
                </div>
                <p className="text-[8px] text-muted-foreground/70 mt-1">
                  Nodes: {batch.nodeIds.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}