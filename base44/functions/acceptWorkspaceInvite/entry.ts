import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { inviteId } = await req.json();
    if (!inviteId) return Response.json({ error: 'Invite ID is required' }, { status: 400 });

    const service = base44.asServiceRole;

    const invite = await service.entities.WorkspaceInvite.get(inviteId);
    if (!invite) return Response.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.email !== user.email) {
      return Response.json({ error: 'This invite was sent to a different email address' }, { status: 403 });
    }
    if (invite.status !== 'pending') {
      return Response.json({ error: 'Invite already ' + invite.status }, { status: 400 });
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return Response.json({ error: 'Invite expired' }, { status: 400 });
    }

    const existing = await service.entities.WorkspaceTeamMember.filter({
      workspaceId: invite.workspaceId,
      userId: user.id,
    });
    if (existing.length === 0) {
      await service.entities.WorkspaceTeamMember.create({
        workspaceId: invite.workspaceId,
        userId: user.id,
        email: user.email,
        role: invite.role,
      });
    }

    await service.entities.WorkspaceInvite.update(inviteId, {
      status: 'accepted',
      acceptedBy: user.id,
    });

    // Add the user to the workspace member list (grants shared access)
    const workspace = await service.entities.Workspace.get(invite.workspaceId);
    if (workspace) {
      const members = Array.isArray(workspace.members) ? workspace.members : [];
      if (!members.includes(user.id)) {
        await service.entities.Workspace.update(invite.workspaceId, {
          members: [...members, user.id],
        });
      }
    }

    // Sync the member list onto all workflows in this workspace so the new
    // teammate can view and edit the shared workflows
    await service.entities.Workflow.updateMany(
      { workspaceId: invite.workspaceId },
      { $addToSet: { members: user.id } }
    );

    return Response.json({ success: true, workspace });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}