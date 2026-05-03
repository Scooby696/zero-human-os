import React, { useState } from "react";
import { X, Save, RotateCcw, Trash2, Clock, Edit2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function VersionHistory({
  isOpen,
  onClose,
  versions,
  onRestore,
  onDelete,
  onUpdateLabel,
  onSaveVersion,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [saveLabel, setSaveLabel] = useState("");

  const handleSave = () => {
    if (saveLabel.trim()) {
      onSaveVersion(saveLabel);
      setSaveLabel("");
    }
  };

  const handleUpdateLabel = (id) => {
    if (editLabel.trim()) {
      onUpdateLabel(id, editLabel);
      setEditingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Save new version section */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Save Current State
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. Before webhook integration"
                className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleSave}
                disabled={!saveLabel.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>

          {/* Versions list */}
          <div className="border-t border-border/30 pt-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Saved Versions ({versions.length})
            </p>
            {versions.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 py-4 text-center">No versions saved yet</p>
            ) : (
              <div className="space-y-2">
                {[...versions].reverse().map((version) => (
                  <div key={version.id} className="flex items-start gap-2 p-3 rounded-lg bg-background/60 border border-border/30 hover:border-border/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      {editingId === version.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleUpdateLabel(version.id)}
                            className="flex-1 bg-card border border-primary/50 rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateLabel(version.id)}
                            className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-foreground truncate">{version.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {version.nodes.length} nodes • {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {editingId !== version.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(version.id);
                              setEditLabel(version.label);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit label"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRestore(version)}
                            className="p-1 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(version.id)}
                            className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Delete version"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/40 bg-secondary/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-border/50 text-foreground text-xs font-medium hover:bg-secondary/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}