import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiArrowRightSLine,
  RiBookOpenLine,
  RiCheckboxCircleFill,
  RiDownload2Line,
  RiFileCopyLine,
  RiFileList3Line,
  RiInformationLine,
  RiMore2Fill,
  RiRefreshLine,
  RiShieldKeyholeLine,
  RiUploadCloud2Line,
} from '@remixicon/react';
import { parseDocument, stringify } from 'yaml';

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  cn,
  toast,
} from '@ghostapi/ui';
import type { ProjectDetail, ProjectSchemaDetail, ProjectSchemaVersion } from '@ghostapi/types';

import {
  getProjectSchema,
  listProjectEndpoints,
  uploadProjectSchema,
} from '@/features/projects/api/projects-api';

type OpenApiDocument = Record<string, unknown> & {
  info?: { title?: unknown; description?: unknown; version?: unknown };
  openapi?: unknown;
  swagger?: unknown;
  servers?: Array<{ url?: unknown; description?: unknown }>;
  components?: { schemas?: Record<string, unknown>; securitySchemes?: Record<string, unknown> };
  tags?: Array<{ name?: unknown }>;
};

type ParsedSchema = {
  document: OpenApiDocument | null;
  raw: string;
  format: 'json' | 'yaml';
};

export function ProjectSettingsSchema({ project }: { project: ProjectDetail }) {
  const currentSchema = project.schemas[0] ?? null;
  const [selectedSchema, setSelectedSchema] = useState<ProjectSchemaVersion | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const endpointsQuery = useQuery({
    queryKey: ['projects', project.id, 'endpoints'],
    queryFn: () => listProjectEndpoints(project.id),
  });
  const currentQuery = useQuery({
    queryKey: ['projects', project.id, 'schemas', currentSchema?.id],
    queryFn: () => getProjectSchema({ projectId: project.id, schemaId: currentSchema?.id ?? '' }),
    enabled: Boolean(currentSchema),
  });
  const parsed = useMemo(
    () => (currentQuery.data ? parseSchemaDetail(currentQuery.data) : null),
    [currentQuery.data],
  );
  const schemaInfo = useMemo(
    () => schemaFacts(project, parsed?.document ?? null, endpointsQuery.data ?? []),
    [project, parsed?.document, endpointsQuery.data],
  );

  if (!currentSchema) {
    return (
      <section className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-8 text-center">
        <RiUploadCloud2Line className="mx-auto size-10 text-purple-300" />
        <h2 className="mt-4 text-xl font-semibold text-white">No schema uploaded</h2>
        <p className="text-white/52 mx-auto mt-2 max-w-md text-sm leading-6">
          Upload an OpenAPI JSON or YAML document to mount endpoints, generate responses, and power
          the mock server.
        </p>
        <div className="mt-6">
          <SchemaUploadDialog project={project} />
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
      <div className="space-y-6">
        <section className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6">
          <SchemaPanelHeader
            title="Current Schema"
            description="This schema is currently powering your mock APIs."
          />
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="ring-emerald-300/16 grid size-12 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-200 ring-1">
                  <RiFileList3Line className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-white">
                      {currentSchema.title ?? `schema-v${currentSchema.version}.json`}
                    </p>
                    <span className="rounded-md border border-purple-300/20 bg-purple-400/10 px-2 py-0.5 text-xs text-purple-200">
                      v{currentSchema.version}
                    </span>
                    <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-white/48 mt-1 text-sm">
                    OpenAPI {schemaInfo.openapiVersion} · {formatBytes(currentSchema.sizeBytes)} ·
                    Uploaded {formatRelativeDate(currentSchema.uploadedAt)}
                  </p>
                </div>
              </div>
              <SchemaActionsMenu
                schema={currentSchema}
                projectId={project.id}
                onView={() => setSelectedSchema(currentSchema)}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 divide-white/10 border-y border-white/10 sm:grid-cols-5 sm:divide-x">
              <SchemaStat label="Endpoints" value={project.endpointCount} />
              <SchemaStat label="Tags" value={schemaInfo.tagCount} />
              <SchemaStat label="Schemas" value={schemaInfo.componentSchemaCount} />
              <SchemaStat label="Security Schemes" value={schemaInfo.securitySchemeCount} />
              <SchemaStat label="Servers" value={schemaInfo.servers.length} />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="border-y border-white/10 py-6">
          <div className="flex items-start justify-between gap-4">
            <SchemaPanelHeader
              title="Schema History"
              description="View and manage previous schema versions."
            />
            {project.schemas.length > 4 ? (
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                className="text-purple-300 hover:text-purple-200"
                onClick={() => setShowAllHistory((current) => !current)}
              >
                {showAllHistory ? 'Show less' : 'View all'}
              </Button>
            ) : null}
          </div>
          <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {(showAllHistory ? project.schemas : project.schemas.slice(0, 4)).map(
              (schema, index) => (
                <div
                  key={schema.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 sm:grid-cols-[minmax(0,1fr)_120px_150px_auto]"
                >
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-white">
                        v{schema.version}
                      </span>
                      {index === 0 ? (
                        <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
                          Active
                        </span>
                      ) : null}
                    </span>
                    <span className="text-white/42 mt-1 block truncate text-xs">
                      {schema.title ?? 'Untitled schema'} · {schema.endpointCount} endpoints
                    </span>
                  </button>
                  <span className="text-white/54 hidden text-sm sm:block">
                    {formatRelativeDate(schema.uploadedAt)}
                  </span>
                  <span className="text-white/42 hidden text-sm sm:block">by project owner</span>
                  <SchemaActionsMenu
                    schema={schema}
                    projectId={project.id}
                    onView={() => setSelectedSchema(schema)}
                  />
                </div>
              ),
            )}
          </div>
        </section>

        <section className="border-y border-white/10 py-6">
          <SchemaPanelHeader
            title="Schema Validation"
            description="Validate your OpenAPI schema for potential issues."
          />
          <div className="mt-5 flex items-center justify-between gap-4 border-y border-white/10 py-5">
            <div className="flex items-center gap-3">
              {currentQuery.isError ? (
                <span className="bg-red-400/12 grid size-8 place-items-center rounded-full text-red-200">
                  !
                </span>
              ) : (
                <RiCheckboxCircleFill className="size-8 text-emerald-300" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {currentQuery.isError ? 'Schema could not be validated' : 'Schema is valid'}
                </p>
                <p className="text-white/48 mt-1 text-sm">
                  {currentQuery.isError
                    ? 'The stored schema content could not be loaded.'
                    : 'No validation errors found.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="border-white/10 bg-white/[0.035] text-white"
              loading={currentQuery.isFetching}
              onClick={() => void currentQuery.refetch()}
            >
              <RiRefreshLine className="size-4" />
              Re-validate
            </Button>
          </div>
        </section>

        <div className="bg-[#0a0f18]/72 text-white/64 flex gap-3 rounded-xl border border-white/10 p-5 text-sm">
          <RiInformationLine className="mt-0.5 size-4 shrink-0 text-cyan-200" />
          <p>
            Replacing the schema will restart the mock server and apply new endpoint definitions.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6">
          <SchemaPanelHeader
            title="Schema Information"
            description="Details about your OpenAPI schema."
          />
          {currentQuery.isLoading ? (
            <Skeleton className="mt-5 h-[360px] rounded-lg bg-white/[0.05]" />
          ) : (
            <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
              <InfoRow label="Title" value={schemaInfo.title} />
              <InfoRow label="Description" value={schemaInfo.description} multiline />
              <InfoRow label="Version" value={schemaInfo.infoVersion} />
              <InfoRow label="OpenAPI Version" value={schemaInfo.openapiVersion} />
              <InfoRow label="Servers" value={schemaInfo.servers.length} href="#schema-servers" />
              <InfoRow
                label="Security Schemes"
                value={schemaInfo.securitySchemeCount}
                href="#schema-security"
              />
              <InfoRow label="Schema Size" value={formatBytes(currentSchema.sizeBytes)} />
              <InfoRow label="Last Updated" value={formatRelativeDate(currentSchema.uploadedAt)} />
              <InfoRow label="Uploaded By" value="Project owner" />
            </div>
          )}
        </section>

        <section
          id="schema-servers"
          className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <SchemaPanelHeader
              title="Schema Servers"
              description="Servers defined in your OpenAPI schema."
            />
            <ServerDialog
              project={project}
              currentSchema={currentSchema}
              currentDetail={currentQuery.data ?? null}
            />
          </div>
          <SchemaServers
            project={project}
            schema={currentSchema}
            detail={currentQuery.data ?? null}
            servers={schemaInfo.servers}
          />
        </section>

        <section
          id="schema-security"
          className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6"
        >
          <SchemaPanelHeader
            title="Security Schemes"
            description="Auth definitions discovered in the schema."
          />
          <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
            {schemaInfo.securitySchemes.length ? (
              schemaInfo.securitySchemes.map((scheme) => (
                <div
                  key={scheme.name}
                  className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 first:border-t-0"
                >
                  <span className="flex items-center gap-3">
                    <RiShieldKeyholeLine className="size-4 text-cyan-200" />
                    <span>
                      <span className="block text-sm font-medium text-white">{scheme.name}</span>
                      <span className="text-white/42 text-xs">{scheme.type}</span>
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-white/48 px-4 py-5 text-sm">
                No security schemes are defined.
              </div>
            )}
          </div>
        </section>
      </div>

      <SchemaViewerDialog
        projectId={project.id}
        schema={selectedSchema}
        onOpenChange={(open) => {
          if (!open) setSelectedSchema(null);
        }}
      />
    </div>
  );
}

function SchemaPanelHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-normal text-white">{title}</h2>
      {description ? <p className="text-white/54 mt-1 text-sm">{description}</p> : null}
    </div>
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
        <RiUploadCloud2Line className="size-4" />
        Replace Schema
      </Button>
      <DialogContent className="border-white/12 bg-[#090d14] text-white" size="lg">
        <DialogHeader>
          <DialogTitle>Replace Schema</DialogTitle>
          <DialogDescription>
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
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
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

  return (
    <Dialog open={Boolean(schema)} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/12 bg-[#090d14] text-white" size="xl">
        <DialogHeader>
          <DialogTitle>{schema?.title ?? `Schema v${schema?.version ?? ''}`}</DialogTitle>
          <DialogDescription>
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

function SchemaActionsMenu({
  schema,
  projectId,
  onView,
}: {
  schema: ProjectSchemaVersion;
  projectId: string;
  onView: () => void;
}) {
  const queryClient = useQueryClient();
  const schemaQuery = useQuery({
    queryKey: ['projects', projectId, 'schemas', schema.id],
    queryFn: () => getProjectSchema({ projectId, schemaId: schema.id }),
    enabled: false,
  });

  async function copySchema() {
    const result = await queryClient.fetchQuery({
      queryKey: ['projects', projectId, 'schemas', schema.id],
      queryFn: () => getProjectSchema({ projectId, schemaId: schema.id }),
    });
    await navigator.clipboard.writeText(schemaContentText(result));
    toast.success('Schema copied');
  }

  async function download() {
    const result = await queryClient.fetchQuery({
      queryKey: ['projects', projectId, 'schemas', schema.id],
      queryFn: () => getProjectSchema({ projectId, schemaId: schema.id }),
    });
    downloadSchema(result);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="tertiary"
          size="icon"
          aria-label={`Open actions for schema v${schema.version}`}
        >
          <RiMore2Fill className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-white/10 bg-[#111722] text-white">
        <DropdownMenuItem onClick={onView}>
          <RiBookOpenLine className="size-4" />
          View schema
        </DropdownMenuItem>
        <DropdownMenuItem disabled={schemaQuery.isFetching} onClick={() => void copySchema()}>
          <RiFileCopyLine className="size-4" />
          Copy raw
        </DropdownMenuItem>
        <DropdownMenuItem disabled={schemaQuery.isFetching} onClick={() => void download()}>
          <RiDownload2Line className="size-4" />
          Download
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ServerDialog({
  project,
  currentSchema,
  currentDetail,
}: {
  project: ProjectDetail;
  currentSchema: ProjectSchemaVersion;
  currentDetail: ProjectSchemaDetail | null;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      if (!currentDetail) throw new Error('Schema content is still loading.');
      const parsed = parseSchemaDetail(currentDetail);
      if (!parsed.document) throw new Error('Could not read the current OpenAPI document.');
      const next: OpenApiDocument = {
        ...parsed.document,
        servers: [
          ...(parsed.document.servers ?? []),
          { url: url.trim(), description: description.trim() || undefined },
        ],
      };
      return uploadProjectSchema({
        projectId: project.id,
        content: serializeOpenApiDocument(next, parsed.format),
        overrideDuplicateEndpoints: true,
      });
    },
    onSuccess: async (result) => {
      await invalidateSchemaQueries(queryClient, project.id, currentSchema.id);
      setOpen(false);
      setUrl('');
      setDescription('');
      toast.success(`Server added in schema v${result.version}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not add server');
    },
  });

  const canSave = isValidServerUrl(url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        className="border-purple-400/50 text-purple-200 hover:bg-purple-400/10"
        onClick={() => setOpen(true)}
      >
        <RiAddLine className="size-4" />
        Add Server
      </Button>
      <DialogContent className="border-white/12 bg-[#090d14] text-white">
        <DialogHeader>
          <DialogTitle>Add Schema Server</DialogTitle>
          <DialogDescription>
            This creates a new schema version with the server added to the OpenAPI document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="settings-label">Server URL</span>
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://api.example.com"
            />
          </label>
          <label className="grid gap-2">
            <span className="settings-label">Description</span>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Production"
            />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Add Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SchemaServers({
  project,
  schema,
  detail,
  servers,
}: {
  project: ProjectDetail;
  schema: ProjectSchemaVersion;
  detail: ProjectSchemaDetail | null;
  servers: Array<{ url: string; description: string | null }>;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: { index: number; action: 'default' | 'remove' }) => {
      if (!detail) throw new Error('Schema content is still loading.');
      const parsed = parseSchemaDetail(detail);
      if (!parsed.document) throw new Error('Could not read the current OpenAPI document.');
      const currentServers = [...(parsed.document.servers ?? [])];
      if (!currentServers[input.index]) throw new Error('Server no longer exists.');

      if (input.action === 'remove') {
        currentServers.splice(input.index, 1);
      } else {
        const [server] = currentServers.splice(input.index, 1);
        if (!server) throw new Error('Server no longer exists.');
        currentServers.unshift(server);
      }

      return uploadProjectSchema({
        projectId: project.id,
        content: serializeOpenApiDocument(
          { ...parsed.document, servers: currentServers },
          parsed.format,
        ),
        overrideDuplicateEndpoints: true,
      });
    },
    onSuccess: async (result) => {
      await invalidateSchemaQueries(queryClient, project.id, schema.id);
      toast.success(`Schema server saved in v${result.version}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update schema server');
    },
  });

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
      {servers.length ? (
        servers.map((server, index) => (
          <div
            key={`${server.url}-${index}`}
            className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 first:border-t-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  index === 0 ? 'bg-emerald-400' : 'bg-white/36',
                )}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-white">{server.url}</span>
                {server.description ? (
                  <span className="text-white/42 block truncate text-xs">{server.description}</span>
                ) : null}
              </span>
              {index === 0 ? (
                <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
                  Default
                </span>
              ) : null}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="tertiary"
                  size="icon"
                  aria-label="Open server actions"
                >
                  <RiMore2Fill className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-white/10 bg-[#111722] text-white">
                <DropdownMenuItem
                  disabled={index === 0 || mutation.isPending}
                  onClick={() => mutation.mutate({ index, action: 'default' })}
                >
                  Make default
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ index, action: 'remove' })}
                >
                  Remove server
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))
      ) : (
        <div className="text-white/48 px-4 py-5 text-sm">No servers are defined.</div>
      )}
    </div>
  );
}

function SchemaStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-white/46 mt-1 text-xs">{label}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  multiline,
}: {
  label: string;
  value: string | number;
  href?: string;
  multiline?: boolean;
}) {
  const content = (
    <>
      <span className="text-white/58 text-sm">{label}</span>
      <span
        className={cn(
          'min-w-0 text-sm text-white',
          multiline ? 'max-w-[440px] text-left leading-5' : 'truncate font-medium',
        )}
      >
        {value || 'n/a'}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="grid grid-cols-[138px_minmax(0,1fr)_20px] items-center gap-4 py-4 transition-colors hover:bg-white/[0.025]"
      >
        {content}
        <RiArrowRightSLine className="text-white/42 size-4 justify-self-end" />
      </a>
    );
  }

  return (
    <div
      className={cn('grid grid-cols-[138px_minmax(0,1fr)] gap-4 py-4', multiline && 'items-start')}
    >
      {content}
    </div>
  );
}

function schemaFacts(
  project: ProjectDetail,
  document: OpenApiDocument | null,
  endpoints: Array<{ group: string }>,
) {
  const servers = (document?.servers ?? [])
    .map((server) => ({
      url: typeof server.url === 'string' ? server.url : '',
      description: typeof server.description === 'string' ? server.description : null,
    }))
    .filter((server) => server.url);
  const securitySchemes = Object.entries(document?.components?.securitySchemes ?? {}).map(
    ([name, value]) => ({
      name,
      type: isRecord(value) && typeof value.type === 'string' ? value.type : 'unknown',
    }),
  );
  const tagNames = new Set([
    ...(document?.tags ?? [])
      .map((tag) => (typeof tag.name === 'string' ? tag.name : null))
      .filter((name): name is string => Boolean(name)),
    ...endpoints.map((endpoint) => endpoint.group).filter(Boolean),
  ]);
  const currentSchema = project.schemas[0] ?? null;

  return {
    title:
      (typeof document?.info?.title === 'string' && document.info.title) ||
      currentSchema?.title ||
      project.name,
    description:
      (typeof document?.info?.description === 'string' && document.info.description) ||
      project.description ||
      'No description',
    infoVersion:
      (typeof document?.info?.version === 'string' && document.info.version) ||
      (currentSchema ? `v${currentSchema.version}` : 'n/a'),
    openapiVersion:
      (typeof document?.openapi === 'string' && document.openapi) ||
      (typeof document?.swagger === 'string' && document.swagger) ||
      currentSchema?.schemaVersion ||
      'n/a',
    servers,
    securitySchemes,
    securitySchemeCount: securitySchemes.length,
    componentSchemaCount: Object.keys(document?.components?.schemas ?? {}).length,
    tagCount: tagNames.size,
  };
}

function parseSchemaDetail(detail: ProjectSchemaDetail): ParsedSchema {
  const raw = schemaContentText(detail);
  const format = raw.trimStart().startsWith('{') ? 'json' : 'yaml';
  try {
    const document = parseDocument(raw).toJS() as unknown;
    return { raw, format, document: isRecord(document) ? (document as OpenApiDocument) : null };
  } catch {
    return { raw, format, document: null };
  }
}

function serializeOpenApiDocument(document: OpenApiDocument, format: ParsedSchema['format']) {
  if (format === 'json') return JSON.stringify(document, null, 2);
  return stringify(document);
}

function schemaContentText(detail: ProjectSchemaDetail) {
  const content = detail.content as { raw?: unknown };
  if (typeof content.raw === 'string') return content.raw;
  return JSON.stringify(detail.content, null, 2);
}

function downloadSchema(detail: ProjectSchemaDetail) {
  const raw = schemaContentText(detail);
  const extension = raw.trimStart().startsWith('{') ? 'json' : 'yaml';
  const blob = new Blob([raw], { type: extension === 'json' ? 'application/json' : 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `schema-v${detail.version}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function invalidateSchemaQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  schemaId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['projects'] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'endpoints'] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'schemas', schemaId] }),
  ]);
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

function isValidServerUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\/\S+/i.test(trimmed) || /^\/\S*/.test(trimmed);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
