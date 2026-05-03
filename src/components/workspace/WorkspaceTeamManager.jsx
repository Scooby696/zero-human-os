import React, { useState } from "react";
import { Users, Trash2, Shield, Eye, Edit } from "lucide-react";
import { workspaceManager } from "../../utils/workspaceManager";

export default function WorkspaceTeamManager({ workspaceId, currentUserId }) {
  const [members, setMembers] = useState(workspaceManager.getMembers(workspaceId));
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const workspace = workspaceManager.getWorkspace(workspaceId);
  const userRole = workspaceManager.getUserRole(workspaceId, currentUserId);

  const handleRoleChange = (userId, newRole) => {
    const result = workspaceManager.updateMemberRole(workspaceId, userId, newRole, currentUserId);
    if (result.success) {
      setMembers(workspaceManager.getMembers(workspaceId));
      setEditingMemberId(null);
    }
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm("Remove this member from the workspace?")) {
      const result = workspaceManager.removeMember(workspaceId, userId, currentUserId);
      if (result.success) {
        setMembers(workspaceManager.getMembers(workspaceId));
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3.5 h-3.5 text-orange-400" />;
      case "editor":
        return <Edit className="w-3.5 h-3.5 text-blue-400" />;
      case "viewer":
        return <Eye className="w-3.5 h-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Team Members ({members.length})</h3>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const isOwner = member.userId === workspace.ownerId;
          const canManage = userRole === "admin" && !isOwner;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border/30 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(member.email || member.userId).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {member.email || member.userId}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 capitalize">
                    {isOwner ? "Owner" : member.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-secondary/50">
                  {getRoleIcon(member.role)}
                  <span className="text-[10px] font-medium text-foreground capitalize">
                    {isOwner ? "Owner" : member.role}
                  </span>
                </div>

                {canManage && !editingMemberId && (
                  <button
                    onClick={() => {
                      setEditingMemberId(member.userId);
                      setSelectedRole(member.role);
                    }}
                    className="px-2 py-1 text-[10px] rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    Change
                  </button>
                )}

                {editingMemberId === member.userId && (
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      handleRoleChange(member.userId, e.target.value);
                    }}
                    className="px-2 py-1 text-[10px] rounded bg-background border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                )}

                {canManage && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">No team members yet</p>
      )}
    </div>
  );
}