import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiCheckLine,
  RiCloseLine,
  RiInformationLine,
  RiMailLine,
  RiMore2Fill,
  RiSearchLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserAddLine,
  RiUserUnfollowLine,
} from '@remixicon/react';

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  cn,
  toast,
} from '@ghostapi/ui';
import type {
  AssignableProjectRole,
  ProjectDetail,
  ProjectInvitation,
  ProjectMember,
  ProjectRole,
} from '@ghostapi/types';

import {
  inviteProjectMember,
  listProjectMembers,
  previewProjectInvite,
  removeProjectMember,
  revokeProjectInvitation,
  updateProjectMemberRole,
} from '@/features/projects/api/projects-api';

const MANAGED_ROLES: AssignableProjectRole[] = ['ADMIN', 'EDITOR', 'VIEWER'];
const FILTER_ROLES: Array<ProjectRole | 'ALL'> = ['ALL', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];

const ROLE_COPY: Record<ProjectRole, { label: string; summary: string; permissions: string[] }> = {
  OWNER: {
    label: 'Owner',
    summary: 'Has full control over the project, members, settings, and can perform all actions.',
    permissions: [
      'Manage settings and members',
      'Import / replace schema',
      'Access API workspace and logs',
      'Delete project',
    ],
  },
  ADMIN: {
    label: 'Admin',
    summary:
      'Has full access to project settings, workspace and logs, but cannot delete the project.',
    permissions: [
      'Manage settings (except delete project)',
      'Import / replace schema',
      'Access API workspace and logs',
      'Manage members (except owners)',
    ],
  },
  EDITOR: {
    label: 'Editor',
    summary: 'Can work in the API workspace and view logs, but cannot change project settings.',
    permissions: [
      'Access API workspace',
      'View and export logs',
      'Cannot manage settings or members',
    ],
  },
  VIEWER: {
    label: 'Viewer',
    summary: 'Can only view the API documentation and logs.',
    permissions: ['View API documentation', 'View logs', 'No access to settings or workspace'],
  },
};

const ROLE_ACCESS_LABEL: Record<ProjectRole, string> = {
  OWNER: 'Full Access',
  ADMIN: 'Full Access',
  EDITOR: 'Limited Access',
  VIEWER: 'Read Only',
};

export function ProjectSettingsMembers({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<ProjectRole | 'ALL'>('ALL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AssignableProjectRole>('VIEWER');

  const membersQuery = useQuery({
    queryKey: ['projects', project.id, 'members'],
    queryFn: () => listProjectMembers(project.id),
  });

  const previewQuery = useQuery({
    queryKey: ['projects', project.id, 'invite-preview', inviteEmail.trim().toLowerCase()],
    queryFn: () => previewProjectInvite({ projectId: project.id, email: inviteEmail }),
    enabled: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim()),
    staleTime: 10_000,
  });

  const invalidateMembers = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'members'] }),
      queryClient.invalidateQueries({ queryKey: ['projects', project.id] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
    ]);
  };

  const inviteMutation = useMutation({
    mutationFn: (input?: { email: string; role: AssignableProjectRole }) =>
      inviteProjectMember(project.id, {
        email: input?.email.trim() ?? inviteEmail.trim(),
        role: input?.role ?? inviteRole,
      }),
    onSuccess: async () => {
      setInviteEmail('');
      await invalidateMembers();
      toast.success('Invitation sent');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not send invitation');
    },
  });

  const roleMutation = useMutation({
    mutationFn: (input: { memberId: string; role: AssignableProjectRole }) =>
      updateProjectMemberRole({ projectId: project.id, ...input }),
    onSuccess: async () => {
      await invalidateMembers();
      toast.success('Member role updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update member');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeProjectMember({ projectId: project.id, memberId }),
    onSuccess: async () => {
      await invalidateMembers();
      toast.success('Member removed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not remove member');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) =>
      revokeProjectInvitation({ projectId: project.id, invitationId }),
    onSuccess: async () => {
      await invalidateMembers();
      toast.success('Invitation revoked');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not revoke invitation');
    },
  });

  const data = membersQuery.data;
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.members ?? []).filter((member) => {
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
      const matchesSearch =
        !query ||
        member.email.toLowerCase().includes(query) ||
        (member.name ?? '').toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [data?.members, roleFilter, search]);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (roleFilter === 'OWNER') return [];
    return (data?.invitations ?? []).filter((invitation) => {
      const matchesRole = roleFilter === 'ALL' || invitation.role === roleFilter;
      const matchesSearch =
        !query ||
        invitation.email.toLowerCase().includes(query) ||
        (invitation.recipientName ?? '').toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [data?.invitations, roleFilter, search]);

  const canInvite =
    data?.canManageMembers &&
    inviteEmail.trim().length > 0 &&
    !previewQuery.data?.alreadyMember &&
    !inviteMutation.isPending;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(390px,0.72fr)]">
      <div className="grid content-start gap-5">
        <section className="min-w-0 rounded-lg border border-white/10 bg-[#070c13]/90 p-6 shadow-[0_18px_80px_rgba(0,0,0,0.22)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Project Members</h2>
              <p className="text-white/56 mt-2 text-sm">
                Manage who has access to this project and their role.
              </p>
            </div>
            <Button asChild className="h-10 rounded-md px-4">
              <a href="#invite-member">
                <RiUserAddLine className="size-4" />
                Invite Member
              </a>
            </Button>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
            <label className="relative">
              <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members by name or email..."
                className="h-11 rounded-md border-white/10 bg-[#070b12] pl-11"
              />
            </label>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
            >
              <SelectTrigger className="h-11 rounded-md border-white/10 bg-[#070b12] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/12 bg-[#111722] text-white">
                {FILTER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === 'ALL' ? 'All Roles' : ROLE_COPY[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <div className="divide-white/8 divide-y">
              {membersQuery.isLoading ? (
                <MembersSkeleton />
              ) : membersQuery.isError ? (
                <div className="px-4 py-12 text-sm text-red-200">
                  Could not load project members. Refresh the page and try again.
                </div>
              ) : filteredMembers.length === 0 && filteredInvitations.length === 0 ? (
                <div className="px-4 py-14 text-center">
                  <p className="text-base font-medium text-white">No members match this view</p>
                  <p className="text-white/44 mt-1 text-sm">Adjust search or role filters.</p>
                </div>
              ) : (
                <>
                  {filteredMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      canManage={Boolean(data?.canManageMembers)}
                      rolePending={
                        roleMutation.isPending && roleMutation.variables?.memberId === member.id
                      }
                      removePending={
                        removeMutation.isPending && removeMutation.variables === member.id
                      }
                      onRoleChange={(role) => roleMutation.mutate({ memberId: member.id, role })}
                      onRemove={() => removeMutation.mutate(member.id)}
                    />
                  ))}
                  {filteredInvitations.map((invitation) => (
                    <InvitationRow
                      key={invitation.id}
                      invitation={invitation}
                      canManage={Boolean(data?.canManageMembers)}
                      revokePending={
                        revokeMutation.isPending && revokeMutation.variables === invitation.id
                      }
                      resendPending={inviteMutation.isPending && inviteEmail === invitation.email}
                      onRevoke={() => revokeMutation.mutate(invitation.id)}
                      onResend={() => {
                        setInviteEmail(invitation.email);
                        setInviteRole(invitation.role);
                        inviteMutation.mutate({ email: invitation.email, role: invitation.role });
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="text-white/66 mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <RiTeamLine className="size-4" />
              {data ? `${data.members.length} members` : 'Members'}
            </span>
            <span>All changes are saved automatically.</span>
          </div>
        </section>

        <section
          id="invite-member"
          className="rounded-lg border border-white/10 bg-[#070c13]/90 p-6 shadow-[0_18px_80px_rgba(0,0,0,0.2)]"
        >
          <h2 className="text-lg font-semibold text-white">Invite Member</h2>
          <p className="text-white/56 mt-2 text-sm">Send an invitation to join this project.</p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_86px]">
            <label className="relative">
              <RiMailLine className="text-white/52 pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2" />
              <Input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="Enter email address"
                disabled={!data?.canManageMembers}
                className="h-11 rounded-md border-white/10 bg-[#070b12] pl-11"
              />
            </label>
            <Select
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value as AssignableProjectRole)}
              disabled={!data?.canManageMembers}
            >
              <SelectTrigger className="h-11 rounded-md border-white/10 bg-[#070b12] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/12 bg-[#111722] text-white">
                {MANAGED_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_COPY[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="h-11 rounded-md"
              disabled={!canInvite}
              onClick={() => inviteMutation.mutate(undefined)}
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
            </Button>
          </div>

          <InvitePreview
            email={inviteEmail}
            preview={previewQuery.data}
            isLoading={previewQuery.isFetching}
          />
        </section>

        <div className="text-white/78 flex items-center gap-3 rounded-lg border border-white/10 bg-[#070c13]/90 px-5 py-4 text-sm">
          <RiInformationLine className="text-white/76 size-5 shrink-0" />
          <span>New members will receive an email invitation with access to this project.</span>
        </div>
      </div>

      <aside className="rounded-lg border border-white/10 bg-[#070c13]/90 p-6 shadow-[0_18px_80px_rgba(0,0,0,0.22)]">
        <h2 className="text-lg font-semibold text-white">Roles & Permissions</h2>
        <p className="text-white/56 mt-2 text-sm">
          Define access levels and what each role can do.
        </p>
        <div className="mt-5 grid gap-3">
          {(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'] as ProjectRole[]).map((role) => (
            <RoleCard key={role} role={role} />
          ))}
        </div>
      </aside>
    </div>
  );
}

function MemberRow({
  member,
  canManage,
  rolePending,
  removePending,
  onRoleChange,
  onRemove,
}: {
  member: ProjectMember;
  canManage: boolean;
  rolePending: boolean;
  removePending: boolean;
  onRoleChange: (role: AssignableProjectRole) => void;
  onRemove: () => void;
}) {
  const locked = member.role === 'OWNER' || member.isCurrentUser || !canManage;

  return (
    <div className="grid gap-4 bg-[#080d14]/80 px-3 py-4 md:grid-cols-[minmax(0,1fr)_142px_34px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className={cn('size-10 shadow-lg', avatarTone(member.name ?? member.email))}>
          <AvatarFallback className="bg-transparent font-semibold text-white">
            {initials(member.name ?? member.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {member.name ?? member.email}
              {member.isCurrentUser ? (
                <span className="font-normal text-white/70"> (You)</span>
              ) : null}
            </p>
            <MemberRoleBadge role={member.role} />
          </div>
          <p className="text-white/58 truncate text-sm">{member.email}</p>
        </div>
      </div>

      <Select
        value={member.role}
        onValueChange={(value) => onRoleChange(value as AssignableProjectRole)}
        disabled={locked || rolePending}
      >
        <SelectTrigger className="h-10 rounded-md border-white/10 bg-[#070b12] text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/12 bg-[#111722] text-white">
          {member.role === 'OWNER' ? (
            <SelectItem value="OWNER" disabled>
              Owner
            </SelectItem>
          ) : null}
          {MANAGED_ROLES.map((role) =>
            member.role === 'OWNER' ? null : (
              <SelectItem key={role} value={role}>
                {ROLE_COPY[role].label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={locked || removePending}
            className="text-white/72 flex size-9 items-center justify-center rounded-md transition hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <RiMore2Fill className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-white/12 bg-[#111722] text-white">
          <DropdownMenuItem onSelect={onRemove} variant="destructive">
            <RiUserUnfollowLine className="size-4" />
            Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function InvitationRow({
  invitation,
  canManage,
  revokePending,
  resendPending,
  onRevoke,
  onResend,
}: {
  invitation: ProjectInvitation;
  canManage: boolean;
  revokePending: boolean;
  resendPending: boolean;
  onRevoke: () => void;
  onResend: () => void;
}) {
  return (
    <div className="grid gap-4 bg-purple-500/[0.035] px-3 py-4 md:grid-cols-[minmax(0,1fr)_142px_112px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 bg-purple-600 shadow-lg">
          <AvatarFallback className="bg-transparent font-semibold text-white">
            {initials(invitation.recipientName ?? invitation.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {invitation.recipientName ?? invitation.email}
            </p>
            <span className="bg-purple-500/14 rounded px-1.5 py-0.5 text-xs font-medium text-purple-200">
              Pending
            </span>
          </div>
          <p className="text-white/58 truncate text-sm">
            {invitation.recipientExists
              ? `${invitation.email} has a GhostAPI account`
              : `${invitation.email} will be invited to GhostAPI`}
          </p>
        </div>
      </div>
      <MemberRoleBadge role={invitation.role} />
      <div className="flex justify-start gap-2 md:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canManage || resendPending}
          onClick={onResend}
        >
          Resend
        </Button>
        <button
          type="button"
          disabled={!canManage || revokePending}
          onClick={onRevoke}
          className="text-white/72 flex size-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          <RiCloseLine className="size-4" />
        </button>
      </div>
    </div>
  );
}

function InvitePreview({
  email,
  preview,
  isLoading,
}: {
  email: string;
  preview: Awaited<ReturnType<typeof previewProjectInvite>> | undefined;
  isLoading: boolean;
}) {
  if (!email.trim()) return null;
  if (isLoading) return <Skeleton className="mt-4 h-10 rounded-md bg-white/[0.05]" />;
  if (!preview) return null;

  if (preview.alreadyMember) {
    return (
      <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        This person already belongs to the project.
      </p>
    );
  }

  if (preview.pendingInvitation) {
    return (
      <p className="mt-4 rounded-md border border-purple-300/20 bg-purple-300/10 px-4 py-3 text-sm text-purple-100">
        There is already a pending invitation for this email. Sending again replaces the older link.
      </p>
    );
  }

  if (preview.recipientExists) {
    return (
      <p className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
        Invite {preview.recipientName ?? preview.email} to this project.
      </p>
    );
  }

  return (
    <p className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
      This email is not registered with GhostAPI yet. The invite will let them create an account and
      join this project.
    </p>
  );
}

function RoleCard({ role }: { role: ProjectRole }) {
  const copy = ROLE_COPY[role];

  return (
    <div className="rounded-md border border-white/10 bg-[#090f17] p-5">
      <div className="grid gap-4 sm:grid-cols-[48px_minmax(0,1fr)]">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-xl border',
            role === 'OWNER' && 'bg-purple-500/14 border-purple-400/20 text-purple-200',
            role === 'ADMIN' && 'bg-blue-500/14 border-blue-400/20 text-blue-200',
            role === 'EDITOR' && 'bg-orange-500/14 border-orange-400/20 text-orange-200',
            role === 'VIEWER' && 'bg-emerald-500/14 border-emerald-400/20 text-emerald-200',
          )}
        >
          <RiShieldCheckLine className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-white">{copy.label}</h3>
            <AccessBadge role={role} />
          </div>
          <p className="text-white/62 mt-1 text-sm leading-6">{copy.summary}</p>
          <ul className="text-white/74 mt-3 grid gap-2 text-sm">
            {copy.permissions.map((permission) => (
              <li key={permission} className="flex gap-3">
                <RiCheckLine className="mt-0.5 size-4 shrink-0 text-white" />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MemberRoleBadge({ role }: { role: ProjectRole }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-xs font-medium',
        role === 'OWNER' && 'bg-purple-500/14 text-purple-200',
        role === 'ADMIN' && 'bg-blue-500/14 text-blue-200',
        role === 'EDITOR' && 'bg-white/8 text-white/72',
        role === 'VIEWER' && 'bg-white/8 text-white/62',
      )}
    >
      {ROLE_COPY[role].label}
    </span>
  );
}

function AccessBadge({ role }: { role: ProjectRole }) {
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-semibold',
        role === 'OWNER' && 'bg-purple-500/16 text-purple-200',
        role === 'ADMIN' && 'bg-blue-500/16 text-blue-200',
        role === 'EDITOR' && 'bg-orange-500/16 text-orange-200',
        role === 'VIEWER' && 'bg-emerald-500/16 text-emerald-200',
      )}
    >
      {ROLE_ACCESS_LABEL[role]}
    </span>
  );
}

function MembersSkeleton() {
  return (
    <div className="grid gap-0">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid gap-4 px-3 py-4 md:grid-cols-[minmax(0,1fr)_142px_34px]">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full bg-white/[0.05]" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-40 bg-white/[0.05]" />
              <Skeleton className="h-3 w-56 bg-white/[0.05]" />
            </div>
          </div>
          <Skeleton className="h-10 rounded-md bg-white/[0.05]" />
          <Skeleton className="size-9 rounded-md bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );
}

function initials(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function avatarTone(value: string) {
  const tones = ['bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-blue-600', 'bg-rose-500'];
  const code = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[code % tones.length];
}
