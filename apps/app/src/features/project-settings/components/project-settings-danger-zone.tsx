import { useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  RiAlarmWarningLine,
  RiArchiveLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiFileDamageLine,
  RiRefreshLine,
  RiUploadCloud2Line,
} from '@remixicon/react';

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  cn,
  toast,
} from '@ghostapi/ui';
import type { ProjectDetail } from '@ghostapi/types';

import {
  archiveProject,
  clearProjectActivityLogs,
  deleteProject,
  resetProjectMockData,
  uploadProjectSchema,
} from '@/features/projects/api/projects-api';

type DangerAction = 'replace-schema' | 'reset-mock' | 'clear-logs' | 'archive' | 'delete';

export function ProjectSettingsDangerZone({ project }: { project: ProjectDetail }) {
  const [activeAction, setActiveAction] = useState<DangerAction | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canDelete = project.role === 'OWNER';
  const isArchived = project.status === 'Archived';

  const clearLogsMutation = useMutation({
    mutationFn: () => clearProjectActivityLogs(project.id),
    onSuccess: async ({ deletedCount }) => {
      await invalidateProject(queryClient, project.id);
      setActiveAction(null);
      toast.success(deletedCount === 1 ? '1 log deleted' : `${deletedCount} logs deleted`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not clear logs');
    },
  });

  const resetMockMutation = useMutation({
    mutationFn: () => resetProjectMockData(project.id),
    onSuccess: async ({ deletedResponseCount, resetEndpointCount }) => {
      await invalidateProject(queryClient, project.id);
      setActiveAction(null);
      toast.success('Mock data reset', {
        description: `${deletedResponseCount} saved responses removed, ${resetEndpointCount} endpoints reset.`,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not reset mock data');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProject(project.id, !isArchived),
    onSuccess: async () => {
      await invalidateProject(queryClient, project.id);
      setActiveAction(null);
      toast.success(isArchived ? 'Project restored' : 'Project archived');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update archive status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (confirmation: string) => deleteProject(project.id, confirmation),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveAction(null);
      toast.success('Project deleted');
      navigate('/projects', { replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete project');
    },
  });

  return (
    <section className="rounded-xl border border-white/10 bg-[#070b12] p-5 shadow-2xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        <p className="text-white/56 mt-1 text-sm">
          Irreversible and destructive actions. Please proceed with caution.
        </p>
      </div>

      <div className="space-y-3">
        <DangerRow
          icon={<RiFileDamageLine className="size-8" />}
          title="Replace Schema"
          description="Replace the current OpenAPI schema with a new one."
          checks={[
            'All existing endpoints will be recalculated',
            'Mock server will restart automatically',
          ]}
          actionLabel="Replace Schema"
          onAction={() => setActiveAction('replace-schema')}
        />
        <DangerRow
          icon={<RiRefreshLine className="size-8" />}
          title="Reset Mock Data"
          description="Reset all dynamic mock data, fakers, and custom state to their initial values."
          checks={['This action cannot be undone']}
          actionLabel="Reset Mock Data"
          onAction={() => setActiveAction('reset-mock')}
        />
        <DangerRow
          icon={<RiDeleteBin6Line className="size-8" />}
          title="Clear Logs"
          description="Permanently delete all logs for this project."
          checks={['Logs will be removed from all environments']}
          actionLabel="Clear Logs"
          onAction={() => setActiveAction('clear-logs')}
        />
        <DangerRow
          icon={<RiArchiveLine className="size-8" />}
          title={isArchived ? 'Restore Project' : 'Archive Project'}
          description={
            isArchived
              ? 'Restore this project to the project list and make it editable again.'
              : 'Archive this project and make it read-only for all members.'
          }
          checks={
            isArchived
              ? ['Project will appear in active project views again']
              : ['Project will be hidden from the project list', 'You can unarchive it anytime']
          }
          actionLabel={isArchived ? 'Restore Project' : 'Archive Project'}
          onAction={() => setActiveAction('archive')}
        />

        <div className="rounded-lg border border-red-500/70 bg-[radial-gradient(circle_at_15%_0%,rgba(248,38,62,0.18),transparent_34%),rgba(248,38,62,0.045)] p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[64px_minmax(0,1fr)_160px] lg:items-center">
            <DangerIcon severe>
              <RiAlarmWarningLine className="size-8" />
            </DangerIcon>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">Delete Project</h3>
              <p className="text-white/64 mt-1 text-sm">
                Permanently delete this project and all of its data.
              </p>
              <div className="text-white/72 mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                {[
                  'Schema, environments, and settings',
                  'All mock endpoints and configurations',
                  'Logs and analytics history',
                  'Members and access permissions',
                ].map((item) => (
                  <div key={item} className="flex gap-2">
                    <RiCloseLine className="mt-0.5 size-4 shrink-0 text-red-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-red-300">
                <RiAlarmWarningLine className="size-4" />
                This action is permanent and cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-500 text-white hover:bg-red-400"
              disabled={!canDelete}
              onClick={() => setActiveAction('delete')}
            >
              Delete Project
            </Button>
          </div>
          {!canDelete ? (
            <p className="mt-3 text-right text-xs text-red-200/70">
              Only the project owner can delete this project.
            </p>
          ) : null}
        </div>
      </div>

      <ReplaceSchemaDialog
        project={project}
        open={activeAction === 'replace-schema'}
        onOpenChange={(open) => setActiveAction(open ? 'replace-schema' : null)}
      />
      <ConfirmDangerDialog
        open={activeAction === 'reset-mock'}
        onOpenChange={(open) => setActiveAction(open ? 'reset-mock' : null)}
        title="Reset mock data?"
        description="Saved response bodies and endpoint-level mock overrides will be reset to the project defaults."
        confirmLabel="Reset Mock Data"
        loading={resetMockMutation.isPending}
        onConfirm={() => resetMockMutation.mutate()}
      />
      <ConfirmDangerDialog
        open={activeAction === 'clear-logs'}
        onOpenChange={(open) => setActiveAction(open ? 'clear-logs' : null)}
        title="Clear all logs?"
        description="This deletes every captured request log for this project across all environments."
        confirmLabel="Clear Logs"
        loading={clearLogsMutation.isPending}
        onConfirm={() => clearLogsMutation.mutate()}
      />
      <ConfirmDangerDialog
        open={activeAction === 'archive'}
        onOpenChange={(open) => setActiveAction(open ? 'archive' : null)}
        title={isArchived ? 'Restore this project?' : 'Archive this project?'}
        description={
          isArchived
            ? 'The project will return to active project views and settings will become editable again.'
            : 'The project will leave the active project list and editing will be blocked until it is restored.'
        }
        confirmLabel={isArchived ? 'Restore Project' : 'Archive Project'}
        loading={archiveMutation.isPending}
        onConfirm={() => archiveMutation.mutate()}
      />
      <DeleteProjectDialog
        projectName={project.name}
        open={activeAction === 'delete'}
        onOpenChange={(open) => setActiveAction(open ? 'delete' : null)}
        loading={deleteMutation.isPending}
        onConfirm={(confirmation) => deleteMutation.mutate(confirmation)}
      />
    </section>
  );
}

function DangerRow({
  icon,
  title,
  description,
  checks,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checks: string[];
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="hover:border-white/16 rounded-lg border border-white/10 bg-white/[0.015] p-4 transition-colors sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[64px_minmax(0,1fr)_160px] lg:items-center">
        <DangerIcon>{icon}</DangerIcon>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-white/64 mt-1 text-sm">{description}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {checks.map((check) => (
              <span key={check} className="text-white/68 flex items-center gap-2 text-sm">
                <RiCheckboxCircleLine className="size-4 text-red-400" />
                {check}
              </span>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="border-red-500/80 bg-transparent text-red-300 hover:border-red-400 hover:bg-red-500/10 hover:text-red-100"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function DangerIcon({ children, severe = false }: { children: ReactNode; severe?: boolean }) {
  return (
    <div
      className={cn(
        'flex size-16 items-center justify-center rounded-lg border',
        severe
          ? 'border-red-400/18 bg-red-500/14 text-red-300'
          : 'border-red-400/12 bg-red-500/12 text-red-400',
      )}
    >
      {children}
    </div>
  );
}

function ReplaceSchemaDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [overrideDuplicates, setOverrideDuplicates] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      uploadProjectSchema({
        projectId: project.id,
        content,
        overrideDuplicateEndpoints: overrideDuplicates,
      }),
    onSuccess: async (result) => {
      await invalidateProject(queryClient, project.id);
      onOpenChange(false);
      setContent('');
      setFileName('');
      setOverrideDuplicates(false);
      toast.success(
        `Schema v${result.version}: ${result.addedEndpointCount} added, ${result.updatedEndpointCount} updated, ${result.skippedDuplicateCount} duplicates kept`,
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Schema upload failed');
    },
  });

  async function selectFile(file: File) {
    setFileName(file.name);
    setContent(await file.text());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/12 bg-[#090d14] text-white" size="lg">
        <DialogHeader>
          <DialogTitle>Replace Schema</DialogTitle>
          <DialogDescription>
            Upload a new OpenAPI document. Duplicate method/path pairs are handled by the override
            setting below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml,text/x-yaml"
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void selectFile(file);
              event.currentTarget.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-white/16 flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-white/[0.025] px-6 py-8 text-center transition-colors hover:border-red-300/60"
          >
            <RiUploadCloud2Line className="size-10 text-red-300" />
            <span className="mt-3 text-sm font-medium text-white">
              {fileName || 'Choose OpenAPI schema'}
            </span>
            <span className="text-white/42 mt-1 text-xs">JSON or YAML, up to 2 MB</span>
          </button>

          <label className="bg-black/18 flex items-start gap-3 rounded-lg border border-white/10 p-4">
            <Checkbox
              checked={overrideDuplicates}
              onChange={(event) => setOverrideDuplicates(event.currentTarget.checked)}
            />
            <span>
              <span className="block text-sm font-medium text-white">
                Override duplicate endpoints
              </span>
              <span className="text-white/48 mt-1 block text-xs leading-5">
                Off keeps current endpoints when method and path already exist. On replaces matching
                endpoint schemas with this upload.
              </span>
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!content}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Replace Schema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDangerDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-red-500/30 bg-[#090d14] text-white" size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProjectDialog({
  projectName,
  open,
  onOpenChange,
  loading,
  onConfirm,
}: {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onConfirm: (confirmation: string) => void;
}) {
  const [confirmation, setConfirmation] = useState('');
  const matches = confirmation === projectName;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setConfirmation('');
      }}
    >
      <DialogContent className="border-red-500/40 bg-[#090d14] text-white" size="sm">
        <DialogHeader>
          <DialogTitle>Delete project permanently?</DialogTitle>
          <DialogDescription>
            Type <span className="font-mono text-red-200">{projectName}</span> to confirm. This
            removes the project, schema versions, endpoints, logs, members, and invitations.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={projectName}
          autoComplete="off"
          className="border-white/12 bg-white/[0.04] text-white"
        />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!matches}
            loading={loading}
            onClick={() => onConfirm(confirmation)}
          >
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function invalidateProject(queryClient: QueryClient, projectId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['projects'] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'endpoints'] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'activity'] }),
  ]);
}
