export function createWorkspaceManager() {
  let workspaces = [];
  let currentWorkspaceId = null;
  let teamMembers = {};

  const ROLES = {
    viewer: { label: "Viewer", permissions: ["read"] },
    editor: { label: "Editor", permissions: ["read", "write", "edit"] },
    admin: { label: "Admin", permissions: ["read", "write", "edit", "delete", "invite", "manage_roles"] },
  };

  const createWorkspace = (name, ownerId) => {
    const workspace = {
      id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [{ userId: ownerId, role: "admin" }],
      workflows: [],
    };
    workspaces.push(workspace);
    if (!currentWorkspaceId) currentWorkspaceId = workspace.id;
    return workspace;
  };

  const getWorkspace = (workspaceId) => {
    return workspaces.find((w) => w.id === workspaceId);
  };

  const getWorkspaces = (userId) => {
    return workspaces.filter((w) => w.members.some((m) => m.userId === userId));
  };

  const getCurrentWorkspace = () => {
    return getWorkspace(currentWorkspaceId);
  };

  const setCurrentWorkspace = (workspaceId) => {
    if (getWorkspace(workspaceId)) {
      currentWorkspaceId = workspaceId;
      return true;
    }
    return false;
  };

  const inviteUser = (workspaceId, email, role, invitedBy) => {
    const workspace = getWorkspace(workspaceId);
    if (!workspace) return { error: "Workspace not found" };

    const inviter = workspace.members.find((m) => m.userId === invitedBy);
    if (!inviter || !ROLES[inviter.role]?.permissions.includes("invite")) {
      return { error: "You don't have permission to invite members" };
    }

    if (!ROLES[role]) {
      return { error: "Invalid role" };
    }

    const existingMember = workspace.members.find((m) => m.email === email);
    if (existingMember) {
      return { error: "User already a member" };
    }

    const invite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      workspaceId,
      email,
      role,
      status: "pending",
      invitedBy,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    if (!teamMembers[workspaceId]) {
      teamMembers[workspaceId] = { members: [], invites: [] };
    }

    teamMembers[workspaceId].invites.push(invite);
    workspace.updatedAt = new Date().toISOString();

    return { success: true, invite };
  };

  const acceptInvite = (inviteId, userId, email) => {
    for (const ws of Object.values(teamMembers)) {
      const invite = ws.invites.find((i) => i.id === inviteId);
      if (invite) {
        if (invite.email !== email) {
          return { error: "Email mismatch" };
        }
        if (new Date(invite.expiresAt) < new Date()) {
          return { error: "Invite expired" };
        }

        const workspace = getWorkspace(invite.workspaceId);
        workspace.members.push({ userId, email, role: invite.role });
        ws.invites = ws.invites.filter((i) => i.id !== inviteId);
        workspace.updatedAt = new Date().toISOString();

        return { success: true, workspace };
      }
    }
    return { error: "Invite not found" };
  };

  const updateMemberRole = (workspaceId, userId, newRole, updatedBy) => {
    const workspace = getWorkspace(workspaceId);
    if (!workspace) return { error: "Workspace not found" };

    const updater = workspace.members.find((m) => m.userId === updatedBy);
    if (!updater || !ROLES[updater.role]?.permissions.includes("manage_roles")) {
      return { error: "You don't have permission to manage roles" };
    }

    if (!ROLES[newRole]) {
      return { error: "Invalid role" };
    }

    const member = workspace.members.find((m) => m.userId === userId);
    if (!member) return { error: "Member not found" };

    member.role = newRole;
    workspace.updatedAt = new Date().toISOString();

    return { success: true, member };
  };

  const removeMember = (workspaceId, userId, removedBy) => {
    const workspace = getWorkspace(workspaceId);
    if (!workspace) return { error: "Workspace not found" };

    const remover = workspace.members.find((m) => m.userId === removedBy);
    if (!remover || !ROLES[remover.role]?.permissions.includes("delete")) {
      return { error: "You don't have permission to remove members" };
    }

    const memberIndex = workspace.members.findIndex((m) => m.userId === userId);
    if (memberIndex === -1) return { error: "Member not found" };

    workspace.members.splice(memberIndex, 1);
    workspace.updatedAt = new Date().toISOString();

    return { success: true };
  };

  const getMembers = (workspaceId) => {
    const workspace = getWorkspace(workspaceId);
    return workspace ? workspace.members : [];
  };

  const getInvites = (workspaceId) => {
    return teamMembers[workspaceId]?.invites || [];
  };

  const getUserRole = (workspaceId, userId) => {
    const member = getMembers(workspaceId).find((m) => m.userId === userId);
    return member?.role;
  };

  const hasPermission = (workspaceId, userId, permission) => {
    const role = getUserRole(workspaceId, userId);
    if (!role) return false;
    return ROLES[role]?.permissions.includes(permission);
  };

  const canEdit = (workspaceId, userId) => {
    return hasPermission(workspaceId, userId, "edit") || hasPermission(workspaceId, userId, "write");
  };

  const canDelete = (workspaceId, userId) => {
    return hasPermission(workspaceId, userId, "delete");
  };

  return {
    ROLES,
    createWorkspace,
    getWorkspace,
    getWorkspaces,
    getCurrentWorkspace,
    setCurrentWorkspace,
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