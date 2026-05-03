import React, { useState } from "react";
import { Plug, Plus, Trash2, Play, Copy } from "lucide-react";
import { connectorBuilder } from "../../utils/connectorBuilder";
import ConnectorBuilderModal from "./ConnectorBuilderModal";

export default function ConnectorManager({ onSelectEndpoint }) {
  const [connectors, setConnectors] = useState(connectorBuilder.getConnectors());
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedConnector, setExpandedConnector] = useState(null);
  const [testResults, setTestResults] = useState({});

  const handleConnectorCreated = (connector) => {
    setConnectors(connectorBuilder.getConnectors());
  };

  const handleDeleteConnector = (connectorId) => {
    if (window.confirm("Delete this connector?")) {
      connectorBuilder.deleteConnector(connectorId);
      setConnectors(connectorBuilder.getConnectors());
      setExpandedConnector(null);
    }
  };

  const handleTestEndpoint = (connectorId, endpointId) => {
    const result = connectorBuilder.testEndpoint(connectorId, endpointId);
    setTestResults({ ...testResults, [endpointId]: result });
  };

  const handleUseEndpoint = (connectorId, endpointId) => {
    const node = connectorBuilder.generateNodeFromEndpoint(connectorId, endpointId);
    if (node && onSelectEndpoint) {
      onSelectEndpoint(node);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          Custom Connectors ({connectors.length})
        </h3>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Connector
        </button>
      </div>

      <div className="space-y-2">
        {connectors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No custom connectors yet. Create one to get started.
          </div>
        ) : (
          connectors.map((connector) => (
            <div key={connector.id} className="rounded-lg border border-border/30 bg-background/40 overflow-hidden">
              <button
                onClick={() => setExpandedConnector(expandedConnector === connector.id ? null : connector.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{connector.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{connector.endpoints.length} endpoints</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnector(connector.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>

              {expandedConnector === connector.id && (
                <div className="border-t border-border/20 p-3 space-y-2">
                  {connector.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="p-2 rounded bg-card/60 border border-border/20 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          endpoint.method === "GET" ? "bg-blue-400/20 text-blue-400" :
                          endpoint.method === "POST" ? "bg-green-400/20 text-green-400" :
                          "bg-amber-400/20 text-amber-400"
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="font-mono text-foreground truncate">{endpoint.path}</span>
                      </div>
                      {endpoint.summary && (
                        <p className="text-muted-foreground">{endpoint.summary}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleTestEndpoint(connector.id, endpoint.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-cyan-400/10 text-cyan-400 rounded hover:bg-cyan-400/20 transition-colors"
                        >
                          <Play className="w-2.5 h-2.5" />
                          Test
                        </button>
                        <button
                          onClick={() => handleUseEndpoint(connector.id, endpoint.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Use
                        </button>
                      </div>
                      {testResults[endpoint.id] && (
                        <p className="text-[9px] text-green-400 pt-1">✓ {testResults[endpoint.id].statusCode}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConnectorBuilderModal
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        onConnectorCreated={handleConnectorCreated}
      />
    </div>
  );
}