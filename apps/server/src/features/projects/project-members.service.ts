import type { Prisma, ProjectRole } from '@prisma/client';

import { prisma } from '../../db.js';
import { env } from '../../env.js';
import { createOpaqueToken, hashToken } from '../auth/auth.crypto.js';
import {
  EmailDeliveryError,
  ensureEmailDeliveryConfigured,
  sendProjectInvitationEmail,
} from '../auth/auth.email.js';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ASSIGNABLE_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class ProjectMembersError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ProjectMembersError';
    this.status = status;
  }
}

export async function listProjectMembersForUser(projectId: string, userId: string) {
  const [canRead, canManageMembers] = await Promise.all([
    userCanReadProject(projectId, userId),
    userCanManageMembers(projectId, userId),
  ]);
  if (!canRead) return null;

  const [members, invitations] = await prisma.$transaction([
    prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.projectInvitation.findMany({
      where: { projectId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        inviter: { select: { name: true } },
      },
    }),
  ]);

  return {
    members: members.map((member) => serializeMember(member, userId)),
    invitations: await serializeInvitations(invitations),
    canManageMembers,
  };
}

export async function previewProjectInviteForUser({
  projectId,
  userId,
  email,
}: {
  projectId: string;
  userId: string;
  email: string;
}) {
  const canManage = await userCanManageMembers(projectId, userId);
  if (!canManage) return null;

  const normalizedEmail = normalizeEmail(email);
  const [recipient, member, invitation] = await prisma.$transaction([
    prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, name: true } }),
    prisma.projectMember.findFirst({
      where: { projectId, user: { email: normalizedEmail } },
      select: { id: true },
    }),
    prisma.projectInvitation.findFirst({
      where: { projectId, email: normalizedEmail, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { inviter: { select: { name: true } } },
    }),
  ]);

  return {
    email: normalizedEmail,
    recipientExists: Boolean(recipient),
    recipientName: recipient?.name ?? null,
    alreadyMember: Boolean(member),
    pendingInvitation: invitation ? await serializeInvitation(invitation) : null,
  };
}

export async function inviteProjectMemberForUser({
  projectId,
  userId,
  email,
  role,
}: {
  projectId: string;
  userId: string;
  email: string;
  role: AssignableRole;
}) {
  assertAssignableRole(role);
  ensureEmailDeliveryConfigured();

  const normalizedEmail = normalizeEmail(email);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } },
    },
    select: {
      id: true,
      name: true,
      members: {
        where: { user: { email: normalizedEmail } },
        select: { id: true },
      },
      owner: { select: { email: true } },
    },
  });
  if (!project) return null;
  if (project.members.length > 0 || project.owner.email === normalizedEmail) {
    throw new ProjectMembersError(409, 'This user is already a project member.');
  }

  const [recipient, inviter] = await prisma.$transaction([
    prisma.user.findUnique({ where: { email: normalizedEmail }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
  ]);
  const token = createOpaqueToken();
  const invitation = await prisma.$transaction(async (tx) => {
    await tx.projectInvitation.updateMany({
      where: { projectId, email: normalizedEmail, status: 'PENDING' },
      data: { status: 'REVOKED' },
    });

    return tx.projectInvitation.create({
      data: {
        projectId,
        email: normalizedEmail,
        role,
        tokenHash: hashToken(token),
        inviterId: userId,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      include: { inviter: { select: { name: true } } },
    });
  });

  try {
    await sendProjectInvitationEmail({
      to: normalizedEmail,
      inviterName: inviter?.name ?? inviter?.email ?? null,
      projectName: project.name,
      role,
      recipientExists: Boolean(recipient),
      invitationUrl: projectInvitationUrl(token),
    });
  } catch (error) {
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: 'REVOKED' },
    });
    if (error instanceof EmailDeliveryError) throw error;
    throw error;
  }

  return {
    invitation: await serializeInvitation(invitation),
    recipientExists: Boolean(recipient),
  };
}

export async function updateProjectMemberRoleForUser({
  projectId,
  memberId,
  userId,
  role,
}: {
  projectId: string;
  memberId: string;
  userId: string;
  role: AssignableRole;
}) {
  assertAssignableRole(role);
  const canManage = await userCanManageMembers(projectId, userId);
  if (!canManage) return null;

  const member = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!member) return null;
  if (member.role === 'OWNER') {
    throw new ProjectMembersError(400, 'Project owners cannot be reassigned from this page.');
  }

  const updated = await prisma.projectMember.update({
    where: { id: member.id },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return serializeMember(updated, userId);
}

export async function removeProjectMemberForUser({
  projectId,
  memberId,
  userId,
}: {
  projectId: string;
  memberId: string;
  userId: string;
}) {
  const canManage = await userCanManageMembers(projectId, userId);
  if (!canManage) return null;

  const member = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
    select: { id: true, role: true, userId: true },
  });
  if (!member) return null;
  if (member.role === 'OWNER') {
    throw new ProjectMembersError(400, 'Project owners cannot be removed.');
  }
  if (member.userId === userId) {
    throw new ProjectMembersError(400, 'You cannot remove yourself from project settings.');
  }

  await prisma.projectMember.delete({ where: { id: member.id } });
  return { deleted: true as const };
}

export async function revokeProjectInvitationForUser({
  projectId,
  invitationId,
  userId,
}: {
  projectId: string;
  invitationId: string;
  userId: string;
}) {
  const canManage = await userCanManageMembers(projectId, userId);
  if (!canManage) return null;

  const result = await prisma.projectInvitation.updateMany({
    where: { id: invitationId, projectId, status: 'PENDING' },
    data: { status: 'REVOKED' },
  });

  return { revoked: result.count > 0 };
}

export async function getProjectInvitationContext(token: string) {
  const invitation = await prisma.projectInvitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      project: { select: { id: true, name: true } },
      inviter: { select: { name: true, email: true } },
    },
  });

  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt <= new Date()) {
    throw new ProjectMembersError(404, 'Invitation not found or expired.');
  }

  const recipient = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true },
  });

  return {
    projectId: invitation.projectId,
    projectName: invitation.project.name,
    invitedEmail: invitation.email,
    role: invitation.role as AssignableRole,
    inviterName: invitation.inviter.name ?? invitation.inviter.email,
    recipientExists: Boolean(recipient),
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

export async function acceptProjectInvitationForUser({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  const invitation = await prisma.projectInvitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { project: { select: { id: true } } },
  });
  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt <= new Date()) {
    throw new ProjectMembersError(404, 'Invitation not found or expired.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user || user.email !== invitation.email) {
    throw new ProjectMembersError(403, 'Sign in with the invited email address to accept.');
  }

  await acceptInvitationForUserId(invitation.id, userId);
  return { projectId: invitation.projectId };
}

export async function acceptPendingInvitationDuringRegistration({
  invitationToken,
  userId,
  email,
}: {
  invitationToken: string;
  userId: string;
  email: string;
}) {
  const invitation = await prisma.projectInvitation.findUnique({
    where: { tokenHash: hashToken(invitationToken) },
    select: { id: true, email: true, status: true, expiresAt: true },
  });
  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt <= new Date()) {
    throw new ProjectMembersError(400, 'Invitation not found or expired.');
  }
  if (invitation.email !== normalizeEmail(email)) {
    throw new ProjectMembersError(400, 'Use the invited email address to create this account.');
  }

  await acceptInvitationForUserId(invitation.id, userId);
}

async function acceptInvitationForUserId(invitationId: string, userId: string) {
  await prisma.$transaction(async (tx) => {
    const invitation = await tx.projectInvitation.findUnique({
      where: { id: invitationId },
      select: { id: true, projectId: true, role: true },
    });
    if (!invitation) throw new ProjectMembersError(404, 'Invitation not found.');

    await tx.projectMember.upsert({
      where: { projectId_userId: { projectId: invitation.projectId, userId } },
      create: {
        projectId: invitation.projectId,
        userId,
        role: invitation.role,
      },
      update: {
        role: invitation.role,
      },
    });
    await tx.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedById: userId, acceptedAt: new Date() },
    });
  });
}

async function userCanReadProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    select: { id: true },
  });
  return Boolean(project);
}

async function userCanManageMembers(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
    select: { id: true },
  });
  return Boolean(project);
}

function serializeMember(
  member: Prisma.ProjectMemberGetPayload<{
    include: { user: { select: { id: true; name: true; email: true } } };
  }>,
  currentUserId: string,
) {
  return {
    id: member.id,
    userId: member.userId,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    isCurrentUser: member.userId === currentUserId,
    joinedAt: member.createdAt.toISOString(),
  };
}

async function serializeInvitations(
  invitations: Array<
    Prisma.ProjectInvitationGetPayload<{ include: { inviter: { select: { name: true } } } }>
  >,
) {
  return Promise.all(invitations.map((invitation) => serializeInvitation(invitation)));
}

async function serializeInvitation(
  invitation: Prisma.ProjectInvitationGetPayload<{
    include: { inviter: { select: { name: true } } };
  }>,
) {
  const recipient = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { name: true },
  });
  const status = invitation.expiresAt <= new Date() ? 'EXPIRED' : invitation.status;
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role as AssignableRole,
    status,
    recipientExists: Boolean(recipient),
    recipientName: recipient?.name ?? null,
    inviterName: invitation.inviter.name,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}

function assertAssignableRole(role: ProjectRole | string): asserts role is AssignableRole {
  if (!ASSIGNABLE_ROLES.includes(role as AssignableRole)) {
    throw new ProjectMembersError(400, 'Choose Admin, Editor, or Viewer for invited members.');
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function projectInvitationUrl(token: string) {
  return new URL(`/invite/${token}`, env().APP_URL).toString();
}
