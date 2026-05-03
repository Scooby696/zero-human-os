import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, FolderOpen } from "lucide-react";
import { workspaceManager } from "../../utils/workspaceManager";

export default function WorkspaceSelector({ currentUserId, onWorkspaceChange }) {
  const [expanded, setExpanded] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [userWorkspaces, setUserWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, [currentUserId]);

  const loadWorkspaces = async () => {
    setLoading(true);
    const workspaces = await workspaceManager.getWorkspaces(currentUserId);
    setUserWorkspaces(workspaces);
    if (workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
    setLoading(false);
  };

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    onWorkspaceChange?.(workspace.id);
    setExpanded(false);
  };

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      try {
        const workspace = await workspaceManager.createWorkspace(
          newWorkspaceName,
          currentUserId
        );
        handleSelectWorkspace(workspace);
        setNewWorkspaceName("");
        setShowNewWorkspace(false);
        await loadWorkspaces();
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary transition-colors"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="text-xs font-medium truncate max-w-[150px]">
          {currentWorkspace?.name || "No Workspace"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="absolute top-10 left-0 w-56 bg-card border border-border/50 rounded-xl shadow-xl z-40 overflow-hidden">
          {/* Workspace List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-xs text-muted-foreground/50">
                Loading workspaces...
              </div>
            ) : userWorkspaces.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground/50">
                No workspaces yet
              </div>
            ) : (
              userWorkspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors border-b border-border/20 last:border-b-0 ${
                    currentWorkspace?.id === workspace.id
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <p className="font-medium">{workspace.name}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    Created {new Date(workspace.created_date).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-border/20 p-2">
            {!showNewWorkspace ? (
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workspace
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateWorkspace()}
                  placeholder="Workspace name"
                  autoFocus
                  className="w-full px-2 py-1 text-xs bg-background border border-border/50 rounded focus:outline-none focus:border-primary/50 text-foreground"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleCreateWorkspace}
                    disabled={!newWorkspaceName.trim()}
                    className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewWorkspace(false);
                      setNewWorkspaceName("");
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-secondary/50 text-foreground rounded hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}