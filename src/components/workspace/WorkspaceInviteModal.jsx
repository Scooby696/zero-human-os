import React, { useState } from "react";
import { X, Mail, Check, AlertCircle } from "lucide-react";
import { workspaceManager } from "../../utils/workspaceManager";

export default function WorkspaceInviteModal({ isOpen, onClose, workspaceId, currentUserId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [invites, setInvites] = useState(workspaceManager.getInvites(workspaceId));

  const handleInvite = () => {
    setError(null);
    setSuccess(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    const result = workspaceManager.inviteUser(workspaceId, email, role, currentUserId);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Invite sent to ${email}`);
      setInvites(workspaceManager.getInvites(workspaceId));
      setEmail("");
      setRole("editor");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
          <h2 className="text-sm font-bold text-foreground">Invite Team Members</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/30 flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-300">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleInvite()}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="viewer">Viewer - View only</option>
              <option value="editor">Editor - Edit workflows</option>
              <option value="admin">Admin - Manage team & settings</option>
            </select>
          </div>

          {invites.length > 0 && (
            <div className="border-t border-border/30 pt-4">
              <h3 className="text-xs font-bold text-foreground mb-2">Pending Invites</h3>
              <div className="space-y-1">
                {invites.map((invite) => (
                  <div key={invite.id} className="p-2 rounded bg-secondary/30 text-[10px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{invite.email}</p>
                        <p className="text-muted-foreground/60 capitalize">{invite.role}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[9px] font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-secondary/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleInvite}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!email.trim()}
          >
            <Mail className="w-4 h-4" />
            Send Invite
          </button>
        </div>
      </div>
    </>
  );
}