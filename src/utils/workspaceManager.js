import { base44 } from "@/api/base44Client";

export function createWorkspaceManager() {
  const ROLES = {
    viewer: { label: "Viewer", permissions: ["read"] },
    editor: { label: "Editor", permissions: ["read", "write", "edit"] },
    admin: { label: "Admin", permissions: ["read", "write", "edit", "delete", "invite", "manage_roles"] },
  };

  const createWorkspace = async (name, ownerId, description = "") => {
    try {
      const workspace = await base44.entities.Workspace.create({
        name,
        ownerId,
        description,
        isActive: true,
      });

      // Add owner as admin member
      await base44.entities.WorkspaceTeamMember.create({
        workspaceId: workspace.id,
        userId: ownerId,
        email: "", // Will be populated from User entity
        role: "admin",
      });

      return workspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  };

  const getWorkspace = async (workspaceId) => {
    try {
      return await base44.entities.Workspace.get(workspaceId);
    } catch (error) {
      console.error("Error getting workspace:", error);
      return null;
    }
  };

  const getWorkspaces = async (userId) => {
    try {
      const members = await base44.entities.WorkspaceTeamMember.filter({
        userId,
      });
      const workspaceIds = members.map((m) => m.workspaceId);
      const workspaces = await Promise.all(
        workspaceIds.map((id) => base44.entities.Workspace.get(id))
      );
      return workspaces.filter(Boolean);
    } catch (error) {
      console.error("Error getting workspaces:", error);
      return [];
    }
  };

  const inviteUser = async (workspaceId, email, role, invitedBy) => {
    try {
      const workspace = await getWorkspace(workspaceId);
      if (!workspace) return { error: "Workspace not found" };

      const inviter = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId: invitedBy,
      });

      if (
        !inviter[0] ||
        !ROLES[inviter[0].role]?.permissions.includes("invite")
      ) {
        return { error: "You don't have permission to invite members" };
      }

      if (!ROLES[role]) {
        return { error: "Invalid role" };
      }

      const existingMember = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        email,
      });

      if (existingMember.length > 0) {
        return { error: "User already a member" };
      }

      const invite = await base44.entities.WorkspaceInvite.create({
        workspaceId,
        email,
        role,
        status: "pending",
        invitedBy,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      return { success: true, invite };
    } catch (error) {
      console.error("Error inviting user:", error);
      return { error: error.message };
    }
  };

  const acceptInvite = async (inviteId, userId, email) => {
    try {
      const invite = await base44.entities.WorkspaceInvite.get(inviteId);

      if (!invite) {
        return { error: "Invite not found" };
      }

      if (invite.email !== email) {
        return { error: "Email mismatch" };
      }

      if (new Date(invite.expiresAt) < new Date()) {
        return { error: "Invite expired" };
      }

      // Add member
      await base44.entities.WorkspaceTeamMember.create({
        workspaceId: invite.workspaceId,
        userId,
        email,
        role: invite.role,
      });

      // Update invite status
      await base44.entities.WorkspaceInvite.update(inviteId, {
        status: "accepted",
        acceptedBy: userId,
      });

      const workspace = await getWorkspace(invite.workspaceId);
      return { success: true, workspace };
    } catch (error) {
      console.error("Error accepting invite:", error);
      return { error: error.message };
    }
  };

  const updateMemberRole = async (workspaceId, userId, newRole, updatedBy) => {
    try {
      const workspace = await getWorkspace(workspaceId);
      if (!workspace) return { error: "Workspace not found" };

      const updater = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId: updatedBy,
      });

      if (
        !updater[0] ||
        !ROLES[updater[0].role]?.permissions.includes("manage_roles")
      ) {
        return { error: "You don't have permission to manage roles" };
      }

      if (!ROLES[newRole]) {
        return { error: "Invalid role" };
      }

      const members = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId,
      });

      if (members.length === 0) return { error: "Member not found" };

      const member = await base44.entities.WorkspaceTeamMember.update(
        members[0].id,
        { role: newRole }
      );

      return { success: true, member };
    } catch (error) {
      console.error("Error updating member role:", error);
      return { error: error.message };
    }
  };

  const removeMember = async (workspaceId, userId, removedBy) => {
    try {
      const workspace = await getWorkspace(workspaceId);
      if (!workspace) return { error: "Workspace not found" };

      const remover = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId: removedBy,
      });

      if (
        !remover[0] ||
        !ROLES[remover[0].role]?.permissions.includes("delete")
      ) {
        return { error: "You don't have permission to remove members" };
      }

      const members = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId,
      });

      if (members.length === 0) return { error: "Member not found" };

      await base44.entities.WorkspaceTeamMember.delete(members[0].id);
      return { success: true };
    } catch (error) {
      console.error("Error removing member:", error);
      return { error: error.message };
    }
  };

  const getMembers = async (workspaceId) => {
    try {
      return await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
      });
    } catch (error) {
      console.error("Error getting members:", error);
      return [];
    }
  };

  const getInvites = async (workspaceId) => {
    try {
      return await base44.entities.WorkspaceInvite.filter({
        workspaceId,
        status: "pending",
      });
    } catch (error) {
      console.error("Error getting invites:", error);
      return [];
    }
  };

  const getUserRole = async (workspaceId, userId) => {
    try {
      const members = await base44.entities.WorkspaceTeamMember.filter({
        workspaceId,
        userId,
      });
      return members[0]?.role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  const hasPermission = async (workspaceId, userId, permission) => {
    const role = await getUserRole(workspaceId, userId);
    if (!role) return false;
    return ROLES[role]?.permissions.includes(permission);
  };

  const canEdit = async (workspaceId, userId) => {
    return (
      (await hasPermission(workspaceId, userId, "edit")) ||
      (await hasPermission(workspaceId, userId, "write"))
    );
  };

  const canDelete = async (workspaceId, userId) => {
    return hasPermission(workspaceId, userId, "delete");
  };

  return {
    ROLES,
    createWorkspace,
    getWorkspace,
    getWorkspaces,
    inviteUser,
    acceptInvite,
    updateMemberRole,
    removeMember,
    getMembers,
    getInvites,
    getUserRole,
    hasPermission,
    canEdit,
    canDelete,
  };
}

export const workspaceManager = createWorkspaceManager();