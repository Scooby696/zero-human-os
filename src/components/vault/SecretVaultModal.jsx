import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, RotateCw, Copy, Eye, EyeOff, AlertCircle } from "lucide-react";
import { secretVault } from "../../utils/secretVault";
import { toast } from "sonner";

export default function SecretVaultModal({ isOpen, onClose }) {
  const [secrets, setSecrets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    rotationInterval: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSecrets();
    }
  }, [isOpen]);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      const list = await secretVault.listSecrets();
      setSecrets(list);
      setError(null);
    } catch (err) {
      setError("Failed to load secrets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.value) {
      setError("Name and value are required");
      return;
    }

    try {
      const newSecret = await secretVault.createSecret(
        formData.name,
        formData.value,
        formData.description,
        formData.rotationInterval
      );
      setSecrets([...secrets, newSecret]);
      setFormData({ name: "", value: "", description: "", rotationInterval: 0 });
      setShowForm(false);
      setError(null);
      toast.success("Secret created");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (secretId) => {
    if (!window.confirm("Delete this secret? This cannot be undone.")) return;
    try {
      await secretVault.deleteSecret(secretId);
      setSecrets(secrets.filter((s) => s.id !== secretId));
      setError(null);
      toast.success("Secret deleted");
    } catch (err) {
      setError("Failed to delete secret");
    }
  };

  const handleRotate = async (secretId) => {
    try {
      const updated = await secretVault.rotateSecret(secretId);
      setSecrets(secrets.map((s) => (s.id === secretId ? updated : s)));
      toast.success("Secret rotated");
    } catch (err) {
      setError("Failed to rotate secret");
    }
  };

  const handleViewSecret = async (secretId) => {
    if (visibleSecrets[secretId]) {
      setVisibleSecrets({ ...visibleSecrets, [secretId]: null });
      return;
    }
    try {
      const value = await secretVault.getSecret(secretId);
      setVisibleSecrets({ ...visibleSecrets, [secretId]: value });
    } catch (err) {
      setError("Failed to retrieve secret");
    }
  };

  const handleCopyReference = (secretId) => {
    const ref = secretVault.generateSecretReference(secretId);
    navigator.clipboard.writeText(ref);
    toast.success("Reference copied to clipboard");
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
            <p className="text-xs text-muted-foreground mt-1">Encrypted secrets stored securely on backend</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setFormData({ name: "", value: "", description: "", rotationInterval: 0 });
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
                {error && (
                  <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
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

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Secret Value</label>
                  <textarea
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Your secret value (encrypted on backend)"
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

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Rotation Interval (days, 0 = no auto-rotation)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rotationInterval}
                    onChange={(e) => setFormData({ ...formData, rotationInterval: parseInt(e.target.value) || 0 })}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Secret
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ name: "", value: "", description: "", rotationInterval: 0 });
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading secrets...</p>
              </div>
            ) : secrets.length === 0 ? (
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
                      {secret.description && <p className="text-xs text-muted-foreground mt-1">{secret.description}</p>}
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Created {new Date(secret.createdAt).toLocaleDateString()}
                        {secret.lastUsedAt && ` • Last used ${new Date(secret.lastUsedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded bg-card/60 border border-border/20">
                    <span className="text-xs font-mono text-muted-foreground flex-1">
                      {visibleSecrets[secret.id] ? visibleSecrets[secret.id] : secret.masked}
                    </span>
                    <button
                      onClick={() => handleViewSecret(secret.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title={visibleSecrets[secret.id] ? "Hide" : "View"}
                    >
                      {visibleSecrets[secret.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyReference(secret.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy reference for use in workflows"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRotate(secret.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded hover:bg-cyan-400/20 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Rotate
                    </button>
                    <button
                      onClick={() => handleDelete(secret.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 rounded hover:bg-red-400/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}