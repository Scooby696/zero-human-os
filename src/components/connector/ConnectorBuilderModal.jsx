import React, { useState } from "react";
import { X, Plus, Trash2, Play, Copy, AlertCircle, CheckCircle } from "lucide-react";
import { connectorBuilder } from "../../utils/connectorBuilder";

export default function ConnectorBuilderModal({ isOpen, onClose, onConnectorCreated }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("openapi");
  const [openAPISpec, setOpenAPISpec] = useState("");
  const [connectorConfig, setConnectorConfig] = useState({
    name: "",
    description: "",
    baseUrl: "",
    authentication: { type: "none", location: "header", paramName: "" },
  });
  const [endpoints, setEndpoints] = useState([]);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const handleParseOpenAPI = () => {
    setError(null);
    const result = connectorBuilder.parseOpenAPISpec(openAPISpec);

    if (result.error) {
      setError(result.error);
      return;
    }

    setConnectorConfig({
      ...connectorConfig,
      name: result.name,
      description: result.description,
      baseUrl: result.baseUrl,
    });
    setEndpoints(result.endpoints);
    setStep(3);
  };

  const handleAddEndpointManual = () => {
    const newEndpoint = {
      id: `ep_${Date.now()}`,
      path: "/api/endpoint",
      method: "GET",
      summary: "New Endpoint",
      parameters: [],
      requestBody: null,
      responses: { "200": { description: "Success" } },
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const handleUpdateEndpoint = (endpointId, updates) => {
    setEndpoints(endpoints.map((e) => (e.id === endpointId ? { ...e, ...updates } : e)));
  };

  const handleDeleteEndpoint = (endpointId) => {
    setEndpoints(endpoints.filter((e) => e.id !== endpointId));
  };

  const handleTestEndpoint = (endpointId) => {
    const result = connectorBuilder.testEndpoint(
      `temp_${connectorConfig.name}`,
      endpointId
    );
    setTestResult(result);
  };

  const handleCreateConnector = () => {
    if (!connectorConfig.name || !connectorConfig.baseUrl || endpoints.length === 0) {
      setError("Name, base URL, and at least one endpoint are required");
      return;
    }

    const connector = connectorBuilder.createConnectorFromSchema({
      ...connectorConfig,
      endpoints,
      source: method,
    });

    onConnectorCreated(connector);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Connector Builder</h2>
            <p className="text-xs text-muted-foreground mt-1">Step {step} of 3 - {method === "openapi" ? "OpenAPI Spec" : "Manual"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Choose Configuration Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setMethod("openapi");
                    setStep(2);
                  }}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    method === "openapi"
                      ? "bg-primary/20 border-primary"
                      : "bg-background/60 border-border/30 hover:border-border"
                  }`}
                >
                  <p className="font-bold text-foreground">OpenAPI Spec</p>
                  <p className="text-xs text-muted-foreground mt-1">Paste JSON/YAML spec</p>
                </button>
                <button
                  onClick={() => {
                    setMethod("manual");
                    setStep(3);
                  }}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    method === "manual"
                      ? "bg-primary/20 border-primary"
                      : "bg-background/60 border-border/30 hover:border-border"
                  }`}
                >
                  <p className="font-bold text-foreground">Manual Schema</p>
                  <p className="text-xs text-muted-foreground mt-1">Add endpoints manually</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Paste OpenAPI Specification</h3>
              <textarea
                value={openAPISpec}
                onChange={(e) => setOpenAPISpec(e.target.value)}
                placeholder='Paste your OpenAPI spec (JSON format):\n{\n  "openapi": "3.0.0",\n  "info": { "title": "My API", ... }'
                className="w-full px-4 py-3 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-mono h-64 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Supports OpenAPI 3.0+ JSON format. YAML specs should be converted to JSON first.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground mb-4">Configure Connector</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={connectorConfig.name}
                    onChange={(e) => setConnectorConfig({ ...connectorConfig, name: e.target.value })}
                    placeholder="e.g., Stripe"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Base URL</label>
                  <input
                    type="text"
                    value={connectorConfig.baseUrl}
                    onChange={(e) => setConnectorConfig({ ...connectorConfig, baseUrl: e.target.value })}
                    placeholder="https://api.example.com"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Description</label>
                <textarea
                  value={connectorConfig.description}
                  onChange={(e) => setConnectorConfig({ ...connectorConfig, description: e.target.value })}
                  placeholder="What does this API do?"
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none h-16"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Authentication</label>
                <select
                  value={connectorConfig.authentication.type}
                  onChange={(e) =>
                    setConnectorConfig({
                      ...connectorConfig,
                      authentication: { ...connectorConfig.authentication, type: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="none">None</option>
                  <option value="api_key">API Key</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground">Endpoints ({endpoints.length})</h4>
                  {method === "manual" && (
                    <button
                      onClick={handleAddEndpointManual}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {endpoints.map((endpoint, idx) => (
                    <div key={endpoint.id} className="p-3 rounded-lg bg-background/60 border border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono mr-2 ${
                              endpoint.method === "GET" ? "bg-blue-400/20 text-blue-400" :
                              endpoint.method === "POST" ? "bg-green-400/20 text-green-400" :
                              "bg-amber-400/20 text-amber-400"
                            }`}>
                              {endpoint.method}
                            </span>
                            {endpoint.path}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{endpoint.summary}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEndpoint(endpoint.id)}
                          className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {testResult && (
            <div className="p-4 rounded-lg bg-green-400/10 border border-green-400/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-xs font-medium text-green-400">Test Successful</p>
              </div>
              <p className="text-[10px] text-foreground font-mono">Response: {testResult.statusCode}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-secondary/10 flex gap-3 shrink-0">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 2) handleParseOpenAPI();
                else setStep(3);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateConnector}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!connectorConfig.name || !connectorConfig.baseUrl || endpoints.length === 0}
            >
              Create Connector
            </button>
          )}
        </div>
      </div>
    </>
  );
}