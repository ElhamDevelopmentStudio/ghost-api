import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiArrowRightSLine,
  RiBookOpenLine,
  RiCheckboxCircleLine,
  RiCodeBoxLine,
  RiDeleteBin6Line,
  RiDownload2Line,
  RiFileCopyLine,
  RiFileList3Line,
  RiGlobalLine,
  RiHardDrive3Line,
  RiKey2Line,
  RiAddLine,
  RiRefreshLine,
  RiSave3Line,
  RiSettings3Line,
  RiShieldCheckLine,
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
  ProjectDetail,
  ProjectEnvironment,
  ProjectEnvironmentName,
  ProjectMockDefaults,
  ProjectSchemaDetail,
  ProjectSchemaVersion,
} from '@ghostapi/types';

import {
  getProjectSchema,
  deleteProjectEnvironment,
  listProjectEndpoints,
  updateProject,
  updateProjectMockDefaults,
  uploadProjectSchema,
  upsertProjectEnvironments,
} from '@/features/projects/api/projects-api';
import { ProjectIcon } from '@/features/projects/components/project-icon';
import { ProjectSettingsMockBehavior } from './project-settings-mock-behavior';
import { ProjectSettingsSchema } from './project-settings-schema';
import { ProjectSettingsMembers } from './project-settings-members';

const SETTINGS_TABS = [
  { label: 'General', value: 'general', enabled: true },
  { label: 'Environments', value: 'environments', enabled: true },
  { label: 'Mock Behavior', value: 'mock-behavior', enabled: true },
  { label: 'Schema', value: 'schema', enabled: true },
  { label: 'Members', value: 'members', enabled: true },
  { label: 'Danger Zone', value: 'danger-zone', enabled: false },
] as const;

const PROJECT_ICONS = [
  'shopping-cart',
  'database',
  'globe',
  'shield',
  'key',
  'analytics',
  'truck',
  'users',
] as const;

const ENVIRONMENT_NAMES: ProjectEnvironmentName[] = ['Development', 'Staging', 'Production'];
const ENVIRONMENT_ICONS = [
  { value: 'globe', icon: RiGlobalLine },
  { value: 'code', icon: RiCodeBoxLine },
  { value: 'server', icon: RiHardDrive3Line },
  { value: 'key', icon: RiKey2Line },
  { value: 'shield', icon: RiShieldCheckLine },
] as const;

export function ProjectSettingsGeneral({ project }: { project: ProjectDetail }) {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab =
    rawTab === 'environments' ||
    rawTab === 'mock-behavior' ||
    rawTab === 'schema' ||
    rawTab === 'members'
      ? rawTab
      : 'general';

  return (
    <div className="pb-12">
      <div className="mb-8">
        <div>
          <p className="text-white/42 text-xs uppercase tracking-[0.18em]">Project Settings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white">
            Project Settings
          </h1>
          <p className="text-white/52 mt-2 text-sm">
            Identity, schema source, environments, and project-wide mock defaults.
          </p>
        </div>
        <SettingsTabs activeTab={activeTab} />
      </div>

      {activeTab === 'environments' ? (
        <ProjectSettingsEnvironments project={project} />
      ) : activeTab === 'mock-behavior' ? (
        <ProjectSettingsMockBehavior project={project} />
      ) : activeTab === 'schema' ? (
        <ProjectSettingsSchema project={project} />
      ) : activeTab === 'members' ? (
        <ProjectSettingsMembers project={project} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
          <ProjectInformationPanel project={project} />
          <CurrentSchemaPanel project={project} />
          <MockDefaultsPanel project={project} />
          <EnvironmentsPanel project={project} />
        </div>
      )}
    </div>
  );
}

function SettingsTabs({
  activeTab,
}: {
  activeTab: 'general' | 'environments' | 'mock-behavior' | 'schema' | 'members';
}) {
  return (
    <div className="mt-8 flex max-w-full gap-8 overflow-x-auto border-b border-white/10">
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        const className = cn(
          'relative h-12 shrink-0 text-sm transition-colors',
          isActive
            ? 'text-white'
            : tab.enabled
              ? 'text-white/70 hover:text-white'
              : 'text-white/36',
          !tab.enabled && 'cursor-not-allowed',
          isActive &&
            'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-500',
        );

        if (!tab.enabled) {
          return (
            <button key={tab.value} type="button" disabled className={className}>
              {tab.label}
            </button>
          );
        }

        return (
          <Link
            key={tab.value}
            to={tab.value === 'general' ? '.' : `.?tab=${tab.value}`}
            className={className}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function ProjectInformationPanel({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [slug, setSlug] = useState(project.slug);
  const [description, setDescription] = useState(project.description ?? '');
  const [icon, setIcon] = useState(project.icon);

  useEffect(() => {
    setName(project.name);
    setSlug(project.slug);
    setDescription(project.description ?? '');
    setIcon(project.icon);
  }, [project]);

  const mutation = useMutation({
    mutationFn: () =>
      updateProject(project.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        icon,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects', project.id] }),
      ]);
      toast.success('Project information saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save project');
    },
  });

  const isDirty =
    name !== project.name ||
    slug !== project.slug ||
    description !== (project.description ?? '') ||
    icon !== project.icon;
  const canSave = name.trim().length > 0 && slug.trim().length > 0 && isDirty;

  return (
    <SettingsPanel
      title="Project Information"
      eyebrow="Identity"
      icon={<RiSettings3Line className="size-4" />}
    >
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="settings-label">Project Name</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
          </label>

          <label className="grid gap-2">
            <span className="settings-label">Project Slug</span>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
              maxLength={64}
              aria-invalid={!/^[a-z0-9][a-z0-9-]*$/.test(slug)}
            />
            <span className="text-white/42 text-xs">Used in project URLs.</span>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="settings-label">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={4}
            className="border-input bg-input text-foreground placeholder:text-muted hover:bg-input/90 focus:border-ring focus:ring-ring/25 w-full resize-none rounded-md border px-3 py-3 text-sm outline-none transition focus:ring-2"
          />
          <span className="text-white/42 text-right text-xs">{description.length}/500</span>
        </label>

        <div className="grid gap-3">
          <span className="settings-label">Project Icon</span>
          <div className="flex flex-wrap items-center gap-4">
            <ProjectIcon icon={icon} className="size-16 rounded-xl" />
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Use ${option} icon`}
                  onClick={() => setIcon(option)}
                  className={cn(
                    'rounded-lg p-1.5 ring-1 transition-colors',
                    icon === option
                      ? 'bg-purple-500/14 ring-purple-300/60'
                      : 'hover:ring-white/24 bg-white/[0.025] ring-white/10 hover:bg-white/[0.04]',
                  )}
                >
                  <ProjectIcon icon={option} index={index} className="size-9 rounded-md" />
                </button>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Remove project icon"
                className="border-white/10 bg-white/[0.035] text-white"
                onClick={() => setIcon(null)}
              >
                <RiDeleteBin6Line className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
          <Button
            type="button"
            variant="secondary"
            className="border-white/10 bg-white/[0.035] text-white"
            disabled={!isDirty || mutation.isPending}
            onClick={() => {
              setName(project.name);
              setSlug(project.slug);
              setDescription(project.description ?? '');
              setIcon(project.icon);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <RiSave3Line className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsPanel>
  );
}

function CurrentSchemaPanel({ project }: { project: ProjectDetail }) {
  const [selectedSchema, setSelectedSchema] = useState<ProjectSchemaVersion | null>(null);
  const endpointsQuery = useQuery({
    queryKey: ['projects', project.id, 'endpoints'],
    queryFn: () => listProjectEndpoints(project.id),
  });
  const currentSchema = project.schemas[0] ?? null;
  const tagCount = new Set((endpointsQuery.data ?? []).map((endpoint) => endpoint.group)).size;

  return (
    <SettingsPanel
      title="Current Schema"
      eyebrow="Source"
      icon={<RiFileList3Line className="size-4" />}
    >
      {currentSchema ? (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/10">
                <RiCodeBoxLine className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {currentSchema.title ?? `Schema v${currentSchema.version}`}
                </p>
                <p className="text-white/46 mt-1 text-xs">
                  v{currentSchema.version} · {formatBytes(currentSchema.sizeBytes)} · uploaded{' '}
                  {formatRelativeDate(currentSchema.uploadedAt)}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
              Active
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 border-y border-white/10 sm:grid-cols-4">
            <SchemaStat label="Endpoints" value={project.endpointCount} />
            <SchemaStat label="Tags" value={endpointsQuery.isLoading ? '...' : tagCount} />
            <SchemaStat label="Versions" value={project.schemas.length} />
            <SchemaStat label="OpenAPI" value={currentSchema.schemaVersion ?? 'n/a'} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <SchemaUploadDialog project={project} />
            <Button
              type="button"
              variant="secondary"
              className="border-white/10 bg-white/[0.035] text-white"
              onClick={() => setSelectedSchema(currentSchema)}
            >
              <RiBookOpenLine className="size-4" />
              View Schema
            </Button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Schema History</h3>
              <span className="text-white/42 text-xs">{project.schemas.length} versions</span>
            </div>
            <div className="divide-y divide-white/10">
              {project.schemas.map((schema) => (
                <button
                  key={schema.id}
                  type="button"
                  onClick={() => setSelectedSchema(schema)}
                  className="flex w-full items-center justify-between gap-4 rounded-md px-0 py-3 text-left transition-colors hover:bg-white/[0.025] sm:px-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">
                      {schema.title ?? `Schema v${schema.version}`}
                    </span>
                    <span className="text-white/42 text-xs">
                      {schema.endpointCount} endpoints · {formatRelativeDate(schema.uploadedAt)}
                    </span>
                  </span>
                  <RiArrowRightSLine className="text-white/42 size-4 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-white/14 bg-black/12 rounded-lg border border-dashed p-6 text-center">
          <RiUploadCloud2Line className="text-white/42 mx-auto size-9" />
          <p className="mt-3 text-sm font-medium text-white">No schema uploaded</p>
          <p className="text-white/48 mt-1 text-sm">
            Upload OpenAPI JSON or YAML to mount endpoints.
          </p>
          <div className="mt-5">
            <SchemaUploadDialog project={project} />
          </div>
        </div>
      )}

      <SchemaViewerDialog
        projectId={project.id}
        schema={selectedSchema}
        onOpenChange={(open) => {
          if (!open) setSelectedSchema(null);
        }}
      />
    </SettingsPanel>
  );
}

function SchemaUploadDialog({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects', project.id] }),
        queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] }),
      ]);
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        <RiRefreshLine className="size-4" />
        Replace Schema
      </Button>
      <DialogContent className="border-white/12 bg-[#090d14] text-white" size="lg">
        <DialogHeader>
          <DialogTitle className="text-white">Replace Schema</DialogTitle>
          <DialogDescription className="text-white/52">
            Uploading a new version merges endpoints into this project.
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
            className="border-white/16 flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-white/[0.025] px-6 py-8 text-center transition-colors hover:border-purple-300/60"
          >
            <RiUploadCloud2Line className="size-10 text-purple-300" />
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
                Off keeps current endpoint definitions when method and path already exist. On
                replaces matching endpoint schemas with the uploaded version.
              </span>
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="border-white/10 bg-white/[0.035] text-white"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!content}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Upload Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SchemaViewerDialog({
  projectId,
  schema,
  onOpenChange,
}: {
  projectId: string;
  schema: ProjectSchemaVersion | null;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ['projects', projectId, 'schemas', schema?.id],
    queryFn: () => getProjectSchema({ projectId, schemaId: schema?.id ?? '' }),
    enabled: Boolean(schema),
  });
  const content = query.data ? schemaContentText(query.data) : '';

  function downloadSchema(detail: ProjectSchemaDetail) {
    const blob = new Blob([schemaContentText(detail)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `schema-v${detail.version}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={Boolean(schema)} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/12 bg-[#090d14] text-white" size="xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {schema?.title ?? `Schema v${schema?.version ?? ''}`}
          </DialogTitle>
          <DialogDescription className="text-white/52">
            Uploaded {schema ? formatRelativeDate(schema.uploadedAt) : ''}
          </DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <Skeleton className="h-[420px] rounded-lg bg-white/[0.05]" />
        ) : query.isError ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            Could not load schema content.
          </div>
        ) : (
          <pre className="bg-black/32 text-white/78 max-h-[56vh] overflow-auto rounded-lg border border-white/10 p-4 text-xs leading-6">
            {content}
          </pre>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="border-white/10 bg-white/[0.035] text-white"
            disabled={!query.data}
            onClick={() => {
              if (!query.data) return;
              void navigator.clipboard.writeText(content);
              toast.success('Schema copied');
            }}
          >
            <RiFileCopyLine className="size-4" />
            Copy
          </Button>
          <Button
            type="button"
            disabled={!query.data}
            onClick={() => {
              if (query.data) downloadSchema(query.data);
            }}
          >
            <RiDownload2Line className="size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnvironmentsPanel({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [baseUrls, setBaseUrls] = useState<Record<ProjectEnvironmentName, string>>(() =>
    environmentState(project),
  );

  useEffect(() => setBaseUrls(environmentState(project)), [project]);

  const mutation = useMutation({
    mutationFn: () =>
      upsertProjectEnvironments(project.id, {
        environments: ENVIRONMENT_NAMES.map((name) => ({
          name,
          baseUrl: baseUrls[name].trim(),
        })),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
      toast.success('Environments saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save environments');
    },
  });

  const isDirty = ENVIRONMENT_NAMES.some(
    (name) => baseUrls[name] !== environmentState(project)[name],
  );

  return (
    <SettingsPanel
      title="Environments"
      eyebrow="Base URLs"
      icon={<RiGlobalLine className="size-4" />}
    >
      <div className="space-y-3">
        {ENVIRONMENT_NAMES.map((name) => (
          <label
            key={name}
            className="grid gap-2 border-t border-white/10 py-4 first:border-t-0 first:pt-0 sm:grid-cols-[136px_1fr]"
          >
            <span>
              <span className="block text-sm font-medium text-white">{name}</span>
              <span className="text-white/42 text-xs">Environment</span>
            </span>
            <Input
              value={baseUrls[name]}
              onChange={(event) =>
                setBaseUrls((current) => ({ ...current, [name]: event.target.value }))
              }
              placeholder="https://api.example.com"
            />
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          disabled={!isDirty}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Manage Environments
        </Button>
      </div>
    </SettingsPanel>
  );
}

type EnvironmentDraft = {
  id?: string;
  name: string;
  baseUrl: string;
  description: string;
  color: string;
  icon: string;
  status: 'ACTIVE' | 'INACTIVE';
  variables: Record<string, string>;
  headers: Record<string, string>;
  authConfig: Record<string, unknown>;
  corsConfig: Record<string, unknown>;
};

function ProjectSettingsEnvironments({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(project.environments[0]?.id ?? 'new');
  const selectedEnvironment =
    project.environments.find((environment) => environment.id === selectedId) ??
    project.environments[0] ??
    null;
  const [draft, setDraft] = useState<EnvironmentDraft>(() =>
    selectedEnvironment ? environmentDraft(selectedEnvironment) : newEnvironmentDraft(),
  );
  const [section, setSection] = useState<'general' | 'variables' | 'headers' | 'auth' | 'cors'>(
    'general',
  );

  useEffect(() => {
    const next =
      project.environments.find((environment) => environment.id === selectedId) ??
      project.environments[0] ??
      null;
    setDraft(next ? environmentDraft(next) : newEnvironmentDraft());
  }, [project.environments, selectedId]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertProjectEnvironments(project.id, {
        environments: [
          {
            ...draft,
            description: draft.description.trim() || null,
          },
        ],
      }),
    onSuccess: async (result) => {
      const saved =
        result.environments.find((environment) => environment.name === draft.name) ??
        result.environments[0];
      if (saved) setSelectedId(saved.id);
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
      toast.success('Environment saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save environment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!draft.id) throw new Error('Save the environment before deleting it');
      return deleteProjectEnvironment({ projectId: project.id, environmentId: draft.id });
    },
    onSuccess: async () => {
      const fallback = project.environments.find((environment) => environment.id !== draft.id);
      setSelectedId(fallback?.id ?? 'new');
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
      toast.success('Environment deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete environment');
    },
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[470px_1fr]">
      <section className="rounded-xl border border-white/10 bg-[#0a0f18]/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Environments</h2>
            <p className="text-white/52 mt-2 max-w-[300px] text-sm">
              Manage isolated API stages and request configuration.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setSelectedId('new');
              setDraft(newEnvironmentDraft());
              setSection('general');
            }}
          >
            <RiAddLine className="size-4" />
            New Environment
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {project.environments.map((environment) => (
            <button
              key={environment.id}
              type="button"
              onClick={() => {
                setSelectedId(environment.id);
                setSection('general');
              }}
              className={cn(
                'flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left transition-colors',
                selectedId === environment.id
                  ? 'border-purple-400/70 bg-purple-500/10'
                  : 'border-white/10 bg-white/[0.018] hover:bg-white/[0.035]',
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: environment.color }}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">
                      {environment.name}
                    </span>
                    {environment.status === 'ACTIVE' ? (
                      <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                        Active
                      </span>
                    ) : null}
                  </span>
                  <span className="text-white/48 mt-1 block truncate text-sm">
                    {environment.baseUrl || 'No base URL'}
                  </span>
                </span>
              </span>
              <RiArrowRightSLine className="size-4 shrink-0 text-white/50" />
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.018] p-5">
          <p className="text-sm font-medium text-white">Tip</p>
          <p className="text-white/52 mt-2 text-sm leading-6">
            Use environments to keep local, staging, and production headers or variables separate.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0a0f18]/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: draft.color }} />
              <h2 className="truncate text-lg font-semibold text-white">
                {draft.name || 'New Environment'}
              </h2>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                {draft.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white/52 mt-3 text-sm">Environment configuration and settings.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="border-white/10 bg-white/[0.035] text-white"
              loading={deleteMutation.isPending}
              disabled={!draft.id || project.environments.length <= 1}
              onClick={() => {
                if (window.confirm(`Delete ${draft.name}? This cannot be undone.`)) {
                  deleteMutation.mutate();
                }
              }}
            >
              <RiDeleteBin6Line className="size-4" />
            </Button>
            <Button
              type="button"
              loading={saveMutation.isPending}
              disabled={!draft.name.trim()}
              onClick={() => saveMutation.mutate()}
            >
              Save
            </Button>
          </div>
        </div>

        <EnvironmentSubTabs active={section} onChange={setSection} />

        <div className="mt-7">
          {section === 'general' ? (
            <EnvironmentGeneralForm draft={draft} onChange={setDraft} />
          ) : null}
          {section === 'variables' ? (
            <KeyValueEditor
              title="Variables"
              values={draft.variables}
              keyPlaceholder="API_HOST"
              valuePlaceholder="https://example.com"
              onChange={(variables) => setDraft((current) => ({ ...current, variables }))}
            />
          ) : null}
          {section === 'headers' ? (
            <KeyValueEditor
              title="Headers"
              values={draft.headers}
              keyPlaceholder="Authorization"
              valuePlaceholder="Bearer token"
              onChange={(headers) => setDraft((current) => ({ ...current, headers }))}
            />
          ) : null}
          {section === 'auth' ? <EnvironmentAuthForm draft={draft} onChange={setDraft} /> : null}
          {section === 'cors' ? <EnvironmentCorsForm draft={draft} onChange={setDraft} /> : null}
        </div>
      </section>
    </div>
  );
}

function EnvironmentSubTabs({
  active,
  onChange,
}: {
  active: 'general' | 'variables' | 'headers' | 'auth' | 'cors';
  onChange: (value: 'general' | 'variables' | 'headers' | 'auth' | 'cors') => void;
}) {
  const tabs = ['general', 'variables', 'headers', 'auth', 'cors'] as const;
  return (
    <div className="mt-8 flex gap-8 border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'relative h-11 text-sm capitalize transition-colors',
            active === tab
              ? 'text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-500'
              : 'text-white/62 hover:text-white',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function EnvironmentGeneralForm({
  draft,
  onChange,
}: {
  draft: EnvironmentDraft;
  onChange: (draft: EnvironmentDraft | ((current: EnvironmentDraft) => EnvironmentDraft)) => void;
}) {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="settings-label">Name</span>
          <Input
            value={draft.name}
            onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
            maxLength={80}
          />
        </label>
        <label className="grid gap-2">
          <span className="settings-label">Status</span>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              onChange((current) => ({ ...current, status: value as 'ACTIVE' | 'INACTIVE' }))
            }
          >
            <SelectTrigger className="w-full border-white/10 bg-white/[0.04] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#111722] text-white">
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="settings-label">Base URL</span>
        <Input
          value={draft.baseUrl}
          onChange={(event) => onChange((current) => ({ ...current, baseUrl: event.target.value }))}
          placeholder="https://api.example.com"
        />
      </label>

      <label className="grid gap-2">
        <span className="settings-label">Description</span>
        <textarea
          value={draft.description}
          onChange={(event) =>
            onChange((current) => ({ ...current, description: event.target.value }))
          }
          rows={4}
          maxLength={200}
          className="border-input bg-input text-foreground placeholder:text-muted hover:bg-input/90 focus:border-ring focus:ring-ring/25 w-full resize-none rounded-md border px-3 py-3 text-sm outline-none transition focus:ring-2"
        />
        <span className="text-white/42 text-right text-xs">{draft.description.length}/200</span>
      </label>

      <div className="grid gap-4 md:grid-cols-[88px_1fr]">
        <label className="grid gap-2">
          <span className="settings-label">Color</span>
          <input
            type="color"
            value={draft.color}
            onChange={(event) => onChange((current) => ({ ...current, color: event.target.value }))}
            className="h-11 w-full cursor-pointer rounded-md border border-white/10 bg-white/[0.04] p-1"
          />
        </label>
        <div className="grid gap-2">
          <span className="settings-label">Icon</span>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
            {ENVIRONMENT_ICONS.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange((current) => ({ ...current, icon: value }))}
                className={cn(
                  'grid h-11 place-items-center rounded-md border transition-colors',
                  draft.icon === value
                    ? 'border-purple-400 bg-purple-500/15 text-white'
                    : 'text-white/72 border-white/10 bg-white/[0.025] hover:bg-white/[0.045]',
                )}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyValueEditor({
  title,
  values,
  keyPlaceholder,
  valuePlaceholder,
  onChange,
}: {
  title: string;
  values: Record<string, string>;
  keyPlaceholder: string;
  valuePlaceholder: string;
  onChange: (values: Record<string, string>) => void;
}) {
  const rows: Array<[string, string]> = Object.entries(values);
  const visibleRows: Array<[string, string]> = rows.length ? rows : [['', '']];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <Button
          type="button"
          variant="secondary"
          className="border-white/10 bg-white/[0.035] text-white"
          onClick={() => onChange({ ...values, '': '' })}
        >
          <RiAddLine className="size-4" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {visibleRows.map(([key, value], index) => (
          <div key={`${key}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_42px]">
            <Input
              value={key}
              placeholder={keyPlaceholder}
              onChange={(event) => {
                const next = Object.entries(values);
                next[index] = [event.target.value, value];
                onChange(Object.fromEntries(next.filter(([itemKey]) => itemKey.trim())));
              }}
            />
            <Input
              value={value}
              placeholder={valuePlaceholder}
              onChange={(event) => {
                const next = Object.entries(values);
                next[index] = [key, event.target.value];
                onChange(Object.fromEntries(next.filter(([itemKey]) => itemKey.trim())));
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="border-white/10 bg-white/[0.035] text-white"
              onClick={() => {
                const next = { ...values };
                delete next[key];
                onChange(next);
              }}
            >
              <RiDeleteBin6Line className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnvironmentAuthForm({
  draft,
  onChange,
}: {
  draft: EnvironmentDraft;
  onChange: (draft: EnvironmentDraft | ((current: EnvironmentDraft) => EnvironmentDraft)) => void;
}) {
  const authType = String(draft.authConfig.type ?? 'none');
  return (
    <div className="grid gap-5">
      <label className="grid gap-2">
        <span className="settings-label">Auth Type</span>
        <Select
          value={authType}
          onValueChange={(value) =>
            onChange((current) => ({
              ...current,
              authConfig: { ...current.authConfig, type: value },
            }))
          }
        >
          <SelectTrigger className="w-full border-white/10 bg-white/[0.04] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/12 bg-[#111722] text-white">
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="bearer">Bearer token</SelectItem>
            <SelectItem value="api-key">API key</SelectItem>
          </SelectContent>
        </Select>
      </label>
      {authType !== 'none' ? (
        <label className="grid gap-2">
          <span className="settings-label">{authType === 'api-key' ? 'API Key' : 'Token'}</span>
          <Input
            value={String(draft.authConfig.value ?? '')}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                authConfig: { ...current.authConfig, value: event.target.value },
              }))
            }
          />
        </label>
      ) : null}
    </div>
  );
}

function EnvironmentCorsForm({
  draft,
  onChange,
}: {
  draft: EnvironmentDraft;
  onChange: (draft: EnvironmentDraft | ((current: EnvironmentDraft) => EnvironmentDraft)) => void;
}) {
  return (
    <div className="grid gap-5">
      <label className="flex items-start gap-3">
        <Checkbox
          checked={draft.corsConfig.enabled === true}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              corsConfig: { ...current.corsConfig, enabled: event.currentTarget.checked },
            }))
          }
        />
        <span>
          <span className="block text-sm font-medium text-white">Enable CORS overrides</span>
          <span className="text-white/48 mt-1 block text-sm">
            Applied to requests served from this environment.
          </span>
        </span>
      </label>
      <label className="grid gap-2">
        <span className="settings-label">Allowed Origins</span>
        <Input
          value={String(draft.corsConfig.origins ?? '')}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              corsConfig: { ...current.corsConfig, origins: event.target.value },
            }))
          }
          placeholder="https://app.example.com, http://localhost:3000"
        />
      </label>
    </div>
  );
}

function MockDefaultsPanel({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [defaults, setDefaults] = useState<ProjectMockDefaults>(project.mockDefaults);

  useEffect(() => setDefaults(project.mockDefaults), [project.mockDefaults]);

  const mutation = useMutation({
    mutationFn: () => updateProjectMockDefaults(project.id, defaults),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects', project.id] }),
        queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] }),
      ]);
      toast.success('Mock defaults applied to endpoints');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save mock defaults');
    },
  });

  const isDirty = JSON.stringify(defaults) !== JSON.stringify(project.mockDefaults);

  return (
    <SettingsPanel
      title="Mock Behavior Defaults"
      eyebrow="Runtime"
      icon={<RiCheckboxCircleLine className="size-4" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="settings-label">Default Latency</span>
          <Input
            type="number"
            min={0}
            max={60000}
            value={defaults.latencyMs}
            onChange={(event) =>
              setDefaults((current) => ({
                ...current,
                latencyMs: clampInt(event.target.value, 0, 60000),
              }))
            }
          />
        </label>
        <label className="grid gap-2">
          <span className="settings-label">Default Error Rate</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={Math.round(defaults.errorChance * 100)}
            onChange={(event) =>
              setDefaults((current) => ({
                ...current,
                errorChance: clampInt(event.target.value, 0, 100) / 100,
              }))
            }
          />
        </label>
        <label className="grid gap-2">
          <span className="settings-label">Default Response Mode</span>
          <Select
            value={defaults.statusCode === null ? 'schema' : String(defaults.statusCode)}
            onValueChange={(value) =>
              setDefaults((current) => ({
                ...current,
                statusCode: value === 'schema' ? null : Number(value),
                responseMode:
                  value === 'schema'
                    ? 'smart'
                    : value === '400'
                      ? 'client-error'
                      : value === '500'
                        ? 'server-error'
                        : 'success',
              }))
            }
          >
            <SelectTrigger className="w-full border-white/10 bg-white/[0.04] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#111722] text-white">
              <SelectItem value="schema">Schema success</SelectItem>
              <SelectItem value="200">Force 200</SelectItem>
              <SelectItem value="400">Force 400</SelectItem>
              <SelectItem value="500">Force 500</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="settings-label">Default Auth Mode</span>
          <Select
            value={defaults.authRequired ? 'required' : 'open'}
            onValueChange={(value) =>
              setDefaults((current) => ({ ...current, authRequired: value === 'required' }))
            }
          >
            <SelectTrigger className="w-full border-white/10 bg-white/[0.04] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#111722] text-white">
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="required">Bearer required</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button asChild variant="secondary" className="border-white/10 bg-white/[0.035] text-white">
          <Link to={`/projects/${project.id}/playground`}>Open Playground</Link>
        </Button>
        <Button
          type="button"
          disabled={!isDirty}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Save Defaults
        </Button>
      </div>
    </SettingsPanel>
  );
}

function SettingsPanel({
  eyebrow,
  title,
  icon,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-white/10 bg-[#0a0f18]/70 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]',
        className,
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-white/[0.055] text-cyan-200">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-normal text-white">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function SchemaStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-white/10 px-4 py-4 sm:border-l sm:first:border-l-0">
      <p className="settings-label">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function environmentState(project: ProjectDetail): Record<ProjectEnvironmentName, string> {
  return Object.fromEntries(
    ENVIRONMENT_NAMES.map((name) => [
      name,
      project.environments.find((environment) => environment.name === name)?.baseUrl ?? '',
    ]),
  ) as Record<ProjectEnvironmentName, string>;
}

function environmentDraft(environment: ProjectEnvironment): EnvironmentDraft {
  return {
    id: environment.id,
    name: environment.name,
    baseUrl: environment.baseUrl,
    description: environment.description ?? '',
    color: environment.color || '#22c55e',
    icon: environment.icon || 'globe',
    status: environment.status,
    variables: environment.variables,
    headers: environment.headers,
    authConfig: environment.authConfig,
    corsConfig: environment.corsConfig,
  };
}

function newEnvironmentDraft(): EnvironmentDraft {
  return {
    name: 'New Environment',
    baseUrl: '',
    description: '',
    color: '#8b5cf6',
    icon: 'globe',
    status: 'ACTIVE',
    variables: {},
    headers: {},
    authConfig: { type: 'none' },
    corsConfig: { enabled: false },
  };
}

function schemaContentText(detail: ProjectSchemaDetail) {
  const content = detail.content as { raw?: unknown };
  if (typeof content.raw === 'string') return content.raw;
  return JSON.stringify(detail.content, null, 2);
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatBytes(value: number | null) {
  if (value === null) return 'size n/a';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function clampInt(value: string, min: number, max: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}
