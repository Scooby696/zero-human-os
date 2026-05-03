import React, { useState } from "react";
import { X, Search, Trash2, Copy, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { webhookLogger } from "../../utils/webhookLogger";

function HeaderValue({ value }) {
  if (typeof value === "object") return <span className="text-muted-foreground">[object]</span>;
  return <span className="break-all">{String(value)}</span>;
}

function JsonTree({ data, depth = 0, maxDepth = 3 }) {
  const [collapsed, setCollapsed] = useState(depth > 0);

  if (data === null || data === undefined) return <span className="text-muted-foreground">null</span>;
  if (typeof data === "boolean") return <span className={data ? "text-green-400" : "text-red-400"}>{String(data)}</span>;
  if (typeof data === "number") return <span className="text-cyan-400">{data}</span>;
  if (typeof data === "string") return <span className="text-amber-300">"{data}"</span>;
  
  if (typeof data === "object") {
    const isArray = Array.isArray(data);
    const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
    
    if (entries.length === 0) return <span className="text-muted-foreground">{isArray ? "[]" : "{}"}</span>;
    if (depth >= maxDepth) return <span className="text-muted-foreground/40 italic text-xs">[nested...]</span>;

    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground/60 hover:text-foreground transition-colors mr-1"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
        </button>
        {collapsed ? (
          <span className="text-muted-foreground/40 italic text-xs">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
        ) : (
          <span>
            {isArray ? "[" : "{"}
            <div className="ml-4">
              {entries.map(([k, v]) => (
                <div key={k} className="font-mono text-xs leading-relaxed">
                  {!isArray && <span className="text-violet-300">{k}</span>}
                  {!isArray && <span className="text-muted-foreground/50">: </span>}
                  <JsonTree data={v} depth={depth + 1} maxDepth={maxDepth} />
                </div>
              ))}
            </div>
            {isArray ? "]" : "}"}
          </span>
        )}
      </span>
    );
  }

  return <span className="text-foreground">{String(data)}</span>;
}

function LogEntry({ log, nodes }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("request");

  const node = nodes.find((n) => n.id === log.nodeId);
  const statusClass = log.statusCode >= 200 && log.statusCode < 300 ? "text-green-400" :
    log.statusCode >= 400 ? "text-red-400" : "text-amber-400";

  return (
    <div className="border border-border/40 rounded-lg overflow-hidden bg-background/60">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left ${
          expanded ? "border-b border-border/30 bg-secondary/20" : ""
        }`}
      >
        {log.statusCode ? (
          log.statusCode >= 200 && log.statusCode < 300 ? (
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )
        ) : (
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {log.direction === "outgoing" ? "↗️" : "↙️"} {node?.label || log.nodeId}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{log.url}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {log.statusCode && (
            <span className={`text-xs font-semibold ${statusClass}`}>{log.statusCode}</span>
          )}
          <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 space-y-4 bg-card/40">
          {/* Tabs */}
          <div className="flex border-b border-border/30">
            {["request", "response", "headers"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs font-semibold uppercase py-2 transition-colors ${
                  tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "request" ? "Request" : t === "response" ? "Response" : "Headers"}
              </button>
            ))}
          </div>

          {/* Request Payload */}
          {tab === "request" && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-mono">
                {log.method} {log.url}
              </p>
              <div className="bg-background/80 rounded p-3 font-mono text-xs max-h-64 overflow-y-auto">
                {log.requestBody ? (
                  <JsonTree data={log.requestBody} />
                ) : (
                  <span className="text-muted-foreground/50">No request body</span>
                )}
              </div>
            </div>
          )}

          {/* Response Payload */}
          {tab === "response" && (
            <div>
              {log.statusCode && (
                <p className={`text-xs font-semibold mb-2 ${statusClass}`}>
                  HTTP {log.statusCode} {log.statusText}
                </p>
              )}
              <div className="bg-background/80 rounded p-3 font-mono text-xs max-h-64 overflow-y-auto">
                {log.responseBody ? (
                  <JsonTree data={log.responseBody} />
                ) : (
                  <span className="text-muted-foreground/50">
                    {log.error ? `Error: ${log.error}` : "No response body"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Headers */}
          {tab === "headers" && (
            <div className="space-y-4">
              {log.requestHeaders && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Request Headers</p>
                  <div className="bg-background/80 rounded p-3 space-y-1.5 max-h-48 overflow-y-auto">
                    {Object.entries(log.requestHeaders).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-violet-300">{key}:</span>{" "}
                        <HeaderValue value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {log.responseHeaders && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Response Headers</p>
                  <div className="bg-background/80 rounded p-3 space-y-1.5 max-h-48 overflow-y-auto">
                    {Object.entries(log.responseHeaders).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-cyan-300">{key}:</span>{" "}
                        <HeaderValue value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebhookDebugger({ isOpen, onClose, nodes }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNode, setFilterNode] = useState("all");
  const logs = webhookLogger.getLogs();

  const webhookNodes = nodes.filter((n) => n.type === "webhook_trigger" || n.type === "webhook_action");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.error?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNode = filterNode === "all" || log.nodeId === filterNode;
    return matchesSearch && matchesNode;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Webhook Debugger</h2>
            <p className="text-xs text-muted-foreground mt-1">Inspect incoming and outgoing webhook payloads</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-border/30 bg-background/40 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by URL or error..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={filterNode}
              onChange={(e) => setFilterNode(e.target.value)}
              className="px-3 py-2 bg-card border border-border/50 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Nodes</option>
              {webhookNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => webhookLogger.clearLogs()}
              className="ml-auto px-3 py-2 rounded-lg text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl mb-3 opacity-20">🔌</div>
              <p className="text-muted-foreground text-sm">
                {logs.length === 0 ? "No webhook logs captured yet" : "No logs match your filters"}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogEntry key={log.id} log={log} nodes={nodes} />
            ))
          )}
        </div>

        {/* Footer */}
        {logs.length > 0 && (
          <div className="px-6 py-3 border-t border-border/30 bg-secondary/10 text-xs text-muted-foreground shrink-0">
            Showing {filteredLogs.length} of {logs.length} logs (max 100 retained)
          </div>
        )}
      </div>
    </>
  );
}