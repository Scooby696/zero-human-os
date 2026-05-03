import React, { useState } from "react";
import { X, Plus, Trash2, RefreshCw, Copy, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { secretVault } from "../../utils/secretVault";

export default function SecretVaultModal({ isOpen, onClose }) {
  const [secrets, setSecrets] = useState(secretVault.getSecrets());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleSecrets, setVisibleSecrets] = useState(new Set());
  const [formData, setFormData] = useState({
    name: "",
    type: "api_key",
    value: "",
    description: "",
    provider: "",
    tags: "",
  });
  const [validationError, setValidationError] = useState(null);

  const handleAdd = () => {
    setValidationError(null);
    const validation = secretVault.validateSecretPolicy({
      name: formData.name,
      value: formData.value,
    });

    if (!validation.valid) {
      setValidationError(validation.issues[0]);
      return;
    }

    if (editingId) {
      secretVault.updateSecret(editingId, {
        name: formData.name,
        type: formData.type,
        value: formData.value,
        description: formData.description,
      });
    } else {
      secretVault.createSecret({
        name: formData.name,
        type: formData.type,
        value: formData.value,
        description: formData.description,
        provider: formData.provider || null,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
      });
    }

    setSecrets(secretVault.getSecrets());
    setFormData({
      name: "",
      type: "api_key",
      value: "",
      description: "",
      provider: "",
      tags: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this secret? This cannot be undone.")) {
      secretVault.deleteSecret(id);
      setSecrets(secretVault.getSecrets());
    }
  };

  const handleRotate = (id) => {
    const newValue = prompt("Enter new secret value:");
    if (newValue) {
      secretVault.rotateSecret(id, newValue);
      setSecrets(secretVault.getSecrets());
    }
  };

  const handleCopy = (id) => {
    const secret = secretVault.getSecret(id);
    navigator.clipboard.writeText(secret.value);
  };

  const toggleVisibility = (id) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleSecrets(newVisible);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Secret Vault</h2>
            <p className="text-xs text-muted-foreground mt-1">Manage encrypted API keys and environment variables</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: "", type: "api_key", value: "", description: "", provider: "", tags: "" });
              }}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Secret
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showForm && (
            <div className="border-b border-border/40 bg-secondary/10 p-6">
              <div className="space-y-4">
                {validationError && (
                  <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{validationError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Secret Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., STRIPE_API_KEY"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="api_key">API Key</option>
                      <option value="env_var">Environment Variable</option>
                      <option value="token">Token</option>
                      <option value="password">Password</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Provider</label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="e.g., stripe, aws"
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Secret Value</label>
                  <textarea
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Your secret value (encrypted)"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none h-20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this secret for?"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {editingId ? "Update Secret" : "Create Secret"}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ name: "", type: "api_key", value: "", description: "", provider: "", tags: "" });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-3">
            {secrets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-3">No secrets yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Create First Secret
                </button>
              </div>
            ) : (
              secrets.map((secret) => (
                <div key={secret.id} className="p-4 rounded-lg bg-background/60 border border-border/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{secret.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{secret.type}</span>
                        {secret.metadata.provider && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground">
                            {secret.metadata.provider}
                          </span>
                        )}
                      </div>
                      {secret.description && <p className="text-xs text-muted-foreground mt-1">{secret.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded bg-card/60 border border-border/20">
                    <span className="text-xs font-mono text-muted-foreground flex-1">
                      {visibleSecrets.has(secret.id) ? secretVault.getSecret(secret.id).value : "••••••••"}
                    </span>
                    <button
                      onClick={() => toggleVisibility(secret.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Toggle visibility"
                    >
                      {visibleSecrets.has(secret.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(secret.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRotate(secret.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded hover:bg-cyan-400/20 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Rotate
                    </button>
                    <button
                      onClick={() => handleDelete(secret.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 rounded hover:bg-red-400/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-border/20">
                    Created {new Date(secret.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}