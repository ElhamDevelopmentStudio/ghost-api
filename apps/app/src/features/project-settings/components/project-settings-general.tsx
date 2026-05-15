import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
  RiRefreshLine,
  RiSave3Line,
  RiSettings3Line,
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
  ProjectEnvironmentName,
  ProjectMockDefaults,
  ProjectSchemaDetail,
  ProjectSchemaVersion,
} from '@ghostapi/types';

import {
  getProjectSchema,
  listProjectEndpoints,
  updateProject,
  updateProjectMockDefaults,
  uploadProjectSchema,
  upsertProjectEnvironments,
} from '@/features/projects/api/projects-api';
import { ProjectIcon } from '@/features/projects/components/project-icon';

const SETTINGS_TABS = [
  'General',
  'Environments',
  'Mock Behavior',
  'Schema',
  'Members',
  'Danger Zone',
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

export function ProjectSettingsGeneral({ project }: { project: ProjectDetail }) {
  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-white/42 text-xs uppercase tracking-[0.18em]">Project Settings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white">General</h1>
          <p className="text-white/52 mt-2 text-sm">
            Identity, schema source, environments, and project-wide mock defaults.
          </p>
        </div>
        <SettingsTabs />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
        <ProjectInformationPanel project={project} />
        <CurrentSchemaPanel project={project} />
        <MockDefaultsPanel project={project} />
        <EnvironmentsPanel project={project} />
      </div>
    </div>
  );
}

function SettingsTabs() {
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.025] p-1">
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab === 'General';
        return (
          <button
            key={tab}
            type="button"
            disabled={!isActive}
            className={cn(
              'h-9 shrink-0 rounded-md px-3 text-sm transition-colors',
              isActive
                ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                : 'text-white/36 cursor-not-allowed',
            )}
          >
            {tab}
          </button>
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
