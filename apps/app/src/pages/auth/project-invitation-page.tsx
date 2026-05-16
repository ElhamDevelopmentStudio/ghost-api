import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RiArrowRightLine, RiMailLine, RiShieldUserLine, RiTeamLine } from '@remixicon/react';

import { Button, Skeleton, toast } from '@ghostapi/ui';

import { Logo } from '@/components/logo';
import { useAuth } from '@/features/auth';
import { acceptProjectInvitation, getProjectInvitation } from '@/features/auth/api/auth-api';

export function ProjectInvitationPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const invitationQuery = useQuery({
    queryKey: ['auth', 'project-invitation', token],
    queryFn: () => getProjectInvitation(token),
    enabled: token.length > 0,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptProjectInvitation(token),
    onSuccess: (response) => {
      toast.success('Project invitation accepted');
      navigate(`/projects/${response.projectId}`, { replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not accept invitation');
    },
  });

  const invitation = invitationQuery.data?.invitation;
  const registerSearch = invitation
    ? new URLSearchParams({ invitation: token, email: invitation.invitedEmail }).toString()
    : '';

  return (
    <main className="bg-auth-canvas text-foreground relative min-h-screen overflow-hidden px-5 py-8">
      <div className="bg-auth-aura pointer-events-none absolute inset-0" />
      <div className="bg-auth-dot-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col">
        <Logo to="/login" imageClassName="h-14" />

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="border-border-subtle w-full max-w-2xl rounded-2xl border bg-black/30 p-8 shadow-xl shadow-black/30 backdrop-blur-xl sm:p-10">
            {invitationQuery.isLoading || isLoading ? (
              <InvitationSkeleton />
            ) : invitationQuery.isError || !invitation ? (
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-red-200">
                  Invitation unavailable
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white">
                  This invitation is expired or invalid.
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  Ask the project owner to send a fresh invitation from project settings.
                </p>
                <Button asChild className="mt-8">
                  <Link to="/login">Go to sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex size-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  <RiTeamLine className="size-7" />
                </div>
                <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Project invitation
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Join {invitation.inviterName ?? 'your teammate'} on {invitation.projectName}
                </h1>
                <p className="text-white/58 mt-4 text-base leading-7">
                  You were invited as {roleLabel(invitation.role)}. Accepting gives{' '}
                  {invitation.invitedEmail} access to this project while keeping a normal GhostAPI
                  account for your own projects.
                </p>

                <div className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
                  <InviteFact icon={<RiMailLine className="size-4" />} label="Invited email">
                    {invitation.invitedEmail}
                  </InviteFact>
                  <InviteFact icon={<RiShieldUserLine className="size-4" />} label="Role">
                    {roleLabel(invitation.role)}
                  </InviteFact>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {isAuthenticated ? (
                    <Button
                      type="button"
                      className="h-12"
                      disabled={user?.email !== invitation.invitedEmail || acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate()}
                    >
                      {acceptMutation.isPending ? 'Accepting…' : 'Accept invitation'}
                      <RiArrowRightLine className="size-4" />
                    </Button>
                  ) : invitation.recipientExists ? (
                    <>
                      <Button asChild className="h-12">
                        <Link
                          to="/login"
                          state={{
                            from: { pathname: `/invite/${token}` },
                            invitation: { token, email: invitation.invitedEmail },
                          }}
                        >
                          Sign in to accept
                          <RiArrowRightLine className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary" className="h-12">
                        <Link to={`/register?${registerSearch}`}>Set up account</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="h-12">
                      <Link to={`/register?${registerSearch}`}>
                        Create account and join
                        <RiArrowRightLine className="size-4" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="secondary" className="h-12">
                    <Link to="/projects">Not now</Link>
                  </Button>
                </div>

                {isAuthenticated && user?.email !== invitation.invitedEmail ? (
                  <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                    You are signed in as {user?.email}. Sign out and use {invitation.invitedEmail}{' '}
                    to accept this invitation.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function InviteFact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05] text-cyan-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-white/38 text-xs uppercase tracking-[0.16em]">{label}</p>
        <p className="truncate text-sm font-medium text-white">{children}</p>
      </div>
    </div>
  );
}

function InvitationSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="size-14 rounded-2xl bg-white/[0.05]" />
      <Skeleton className="h-4 w-44 bg-white/[0.05]" />
      <Skeleton className="h-10 w-4/5 bg-white/[0.05]" />
      <Skeleton className="h-20 w-full rounded-xl bg-white/[0.05]" />
      <Skeleton className="h-12 w-44 rounded-lg bg-white/[0.05]" />
    </div>
  );
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
