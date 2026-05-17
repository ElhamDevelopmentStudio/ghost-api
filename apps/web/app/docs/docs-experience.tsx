'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RiArrowRightLine,
  RiBookOpenLine,
  RiBracesLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiFileList3Line,
  RiKeyboardLine,
  RiPlayCircleLine,
  RiRouteLine,
  RiSearchLine,
  RiTerminalBoxLine,
} from '@remixicon/react';

import { Button } from '@ghostapi/ui';

import type { AppLinks } from '@/app/(landing)/_lib/app-links';
import { HealthPing } from './health-ping';
import { LivePlaygroundDemo } from './live-playground-demo';
import { MockRuntimeFeed } from './mock-runtime-feed';
import { QuickstartTerminal } from './quickstart-terminal';

type DocsExperienceProps = {
  appLinks: AppLinks;
  apiBaseUrl: string;
  apiDocsUrl: string;
  openApiUrl: string;
  isAuthenticated: boolean;
};

type DocsTopic = {
  id: string;
  title: string;
  group: 'Start' | 'Build' | 'Operate' | 'Reference';
  summary: string;
  tags: string[];
};

const TOPICS: DocsTopic[] = [
  {
    id: 'quickstart',
    title: 'Quickstart',
    group: 'Start',
    summary: 'Run GhostAPI locally and create your first mock API.',
    tags: ['setup', 'pnpm', 'docker', 'prisma'],
  },
  {
    id: 'concepts',
    title: 'Core concepts',
    group: 'Start',
    summary: 'Understand projects, schemas, endpoints, mocks, and logs.',
    tags: ['project', 'schema', 'endpoint', 'mock', 'log'],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    group: 'Reference',
    summary: 'How OpenAPI turns into normalized endpoints and runtime routes.',
    tags: ['architecture', 'normalized', 'parser', 'runtime'],
  },
  {
    id: 'schemas',
    title: 'Schemas',
    group: 'Build',
    summary: 'Upload, validate, version, and replace OpenAPI schemas.',
    tags: ['openapi', 'schema', 'duplicate', 'version'],
  },
  {
    id: 'playground',
    title: 'Playground',
    group: 'Build',
    summary: 'Send requests, manage shared headers, and inspect responses.',
    tags: ['request', 'headers', 'body', 'curl'],
  },
  {
    id: 'mock-runtime',
    title: 'Mock runtime',
    group: 'Operate',
    summary: 'How /mock routes are matched, delayed, generated, and logged.',
    tags: ['mock', 'runtime', 'latency', 'errors'],
  },
  {
    id: 'settings',
    title: 'Project settings',
    group: 'Operate',
    summary: 'Configure environments, mock behavior, schema, members, and danger actions.',
    tags: ['settings', 'environment', 'members', 'danger'],
  },
  {
    id: 'members',
    title: 'Members and invitations',
    group: 'Operate',
    summary: 'Invite existing users and new users with project-scoped roles.',
    tags: ['members', 'invite', 'role', 'email'],
  },
  {
    id: 'auth',
    title: 'Authentication',
    group: 'Reference',
    summary: 'Sessions, CSRF, verification, reset, and invitation acceptance.',
    tags: ['auth', 'csrf', 'session', 'verification'],
  },
  {
    id: 'api-reference',
    title: 'API reference',
    group: 'Reference',
    summary: 'Where to find exact backend request and response contracts.',
    tags: ['api', 'scalar', 'openapi'],
  },
  {
    id: 'development',
    title: 'Local development',
    group: 'Reference',
    summary: 'Ports, commands, environment variables, and checks.',
    tags: ['dev', 'ports', 'env', 'test'],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    group: 'Reference',
    summary: 'Fix common migration, URL, email, and mock-route issues.',
    tags: ['debug', 'migration', 'email', '404'],
  },
];

const EXAMPLES = {
  setup: {
    label: 'Local setup',
    code: `pnpm install
docker compose up -d
pnpm --filter @ghostapi/server prisma:generate
pnpm --filter @ghostapi/server prisma:migrate
pnpm dev`,
  },
  upload: {
    label: 'Upload schema',
    code: `curl -X POST "http://localhost:3001/projects/{projectId}/schemas" \\
  -H "x-csrf-token: {csrfToken}" \\
  -F "schema=@./api.json" \\
  -F "overrideDuplicates=false"`,
  },
  mock: {
    label: 'Call mock API',
    code: `curl -X POST "http://localhost:3001/mock/{projectId}/auth/login" \\
  -H "content-type: application/json" \\
  -H "authorization: Bearer your_token" \\
  --data '{"email":"user@example.com","password":"secret"}'`,
  },
  invite: {
    label: 'Invite member',
    code: `curl -X POST "http://localhost:3001/projects/{projectId}/members/invitations" \\
  -H "content-type: application/json" \\
  -H "x-csrf-token: {csrfToken}" \\
  --data '{"email":"teammate@example.com","role":"editor"}'`,
  },
} as const;

const ROUTES = [
  ['GET', '/health', 'Backend health check.'],
  ['POST', '/auth/register', 'Create account and send email verification.'],
  ['POST', '/auth/login', 'Create authenticated session.'],
  ['GET', '/projects', 'List visible projects.'],
  ['POST', '/projects', 'Create a project.'],
  ['POST', '/projects/{projectId}/schemas', 'Upload and normalize schema.'],
  ['GET', '/projects/{projectId}/endpoints', 'List generated endpoints.'],
  ['GET', '/projects/{projectId}/activity', 'Read request logs.'],
  ['GET', '/projects/{projectId}/members', 'List members and invites.'],
  ['POST', '/projects/{projectId}/members/invitations', 'Send project invite.'],
  ['ANY', '/mock/{projectId}/{path}', 'Serve mock API traffic.'],
] as const;

const SETTING_TABS = [
  ['General', 'Project identity, icon, active schema summary, and base environment snapshot.'],
  ['Environments', 'Base URLs, reusable variables, shared headers, and CORS-related context.'],
  ['Mock', 'Default latency, error chance, auth simulation, and response strategy.'],
  ['Schema', 'Metadata, version history, validation, servers, and replacement flow.'],
  ['Members', 'Invite preview, role selection, pending invites, and member removal.'],
  ['Danger Zone', 'Replace schema, reset mocks, clear logs, archive, restore, and delete.'],
] as const;

const READ_FIRST = [
  ['Quickstart', 'Run the workspace and create a project.'],
  ['Core concepts', 'Learn the model: project, schema, endpoint, mock, log.'],
  ['Playground', 'Send requests and verify frontend states.'],
] as const;

export function DocsExperience({
  appLinks,
  apiBaseUrl,
  apiDocsUrl,
  openApiUrl,
  isAuthenticated,
}: DocsExperienceProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [commandQuery, setCommandQuery] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [activeExample, setActiveExample] = useState<keyof typeof EXAMPLES>('setup');
  const commandInputRef = useRef<HTMLInputElement>(null);

  const filteredTopics = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return TOPICS;

    return TOPICS.filter((topic) =>
      [topic.title, topic.summary, topic.group, ...topic.tags].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query]);

  const commandResults = useMemo(() => {
    const needle = commandQuery.trim().toLowerCase();
    if (needle.length === 0) return TOPICS;

    return TOPICS.filter((topic) =>
      [topic.title, topic.summary, topic.group, ...topic.tags].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [commandQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen(true);
      }

      if (event.key === 'Escape') {
        setIsCommandOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isCommandOpen) return;
    window.setTimeout(() => commandInputRef.current?.focus(), 0);
  }, [isCommandOpen]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),radial-gradient(circle_at_18%_0%,rgba(126,58,242,0.14),transparent_32%)] bg-[length:64px_64px,64px_64px,auto]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_minmax(320px,1fr)] lg:items-end">
          <div>
            <p className="text-primary font-mono text-xs uppercase tracking-[0.24em]">
              GhostAPI Docs
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Build against a mock backend from an OpenAPI contract.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              A practical guide to importing schemas, running mock endpoints, testing requests,
              configuring projects, inviting teammates, and operating GhostAPI locally.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={isAuthenticated ? appLinks.dashboard : appLinks.register}>
                  {isAuthenticated ? 'Open dashboard' : 'Create project'}
                  <RiArrowRightLine className="size-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" className="border-border bg-card/80 text-white">
                <a href={apiDocsUrl} target="_blank" rel="noreferrer">
                  API reference
                  <RiExternalLinkLine className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="border-border bg-background/70 rounded-xl border p-5 backdrop-blur">
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
              Read this first
            </p>
            <ol className="mt-4 space-y-3">
              {READ_FIRST.map(([title, description], index) => (
                <li key={title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <span className="text-primary font-mono text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <a href={`#${title.toLowerCase().replaceAll(' ', '-')}`} className="group">
                    <span className="group-hover:text-primary block text-sm font-semibold text-white">
                      {title}
                    </span>
                    <span className="text-muted-foreground block text-sm leading-6">
                      {description}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-24 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="relative">
          <div className="lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto lg:py-6 lg:pr-2">
            <div className="border-border border-b pb-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-muted-foreground block font-mono text-[11px] uppercase tracking-[0.18em]">
                  Search docs
                </label>
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(true)}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-[11px] transition"
                  aria-label="Open command search"
                >
                  <RiKeyboardLine className="size-3.5" />
                  <kbd className="border-border rounded border px-1.5 py-0.5">⌘K</kbd>
                </button>
              </div>
              <div className="relative">
                <RiSearchLine className="text-muted-foreground pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="schema, invite, csrf..."
                  className="placeholder:text-muted-foreground/60 border-border focus:border-primary h-10 w-full border-0 border-b bg-transparent pl-7 pr-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <nav className="mt-6 space-y-7">
              {['Start', 'Build', 'Operate', 'Reference'].map((group) => {
                const topics = filteredTopics.filter((topic) => topic.group === group);
                if (topics.length === 0) return null;

                return (
                  <div key={group}>
                    <p className="text-muted-foreground mb-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {topics.map((topic) => (
                        <a
                          key={topic.id}
                          href={`#${topic.id}`}
                          className="text-muted-foreground hover:text-foreground block py-1.5 text-sm transition"
                        >
                          {topic.title}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredTopics.length === 0 ? (
                <p className="text-muted-foreground text-sm leading-6">
                  No matches. Try “schema”, “headers”, “invite”, “mock”, or “migration”.
                </p>
              ) : null}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <Section
            id="quickstart"
            eyebrow="Start"
            title="Quickstart"
            intro="Watch the full setup run end to end below — then run the same five commands on your machine."
          >
            <QuickstartTerminal />
            <OrderedGuide
              steps={[
                ['Install dependencies', 'Run pnpm install from the repository root.'],
                ['Start PostgreSQL and Redis', 'Run docker compose up -d.'],
                [
                  'Prepare Prisma',
                  'Generate Prisma Client, then run migrations so the database has every column used by the server.',
                ],
                [
                  'Start the workspace',
                  'Run pnpm dev. Public web runs on 3000, server on 3001, protected app on 3002.',
                ],
                [
                  'Create the first mock API',
                  'Register, create a project, upload api.json or another OpenAPI 3.x schema, then open Playground.',
                ],
              ]}
            />
            <ExampleConsole
              examples={EXAMPLES}
              activeExample={activeExample}
              onActiveExampleChange={setActiveExample}
            />
          </Section>

          <Section
            id="concepts"
            eyebrow="Model"
            title="Core concepts"
            intro="These terms explain the product faster than a feature list."
          >
            <KeyPoint>
              GhostAPI has one load-bearing mental model: an uploaded schema becomes normalized
              endpoints, and every product surface works from those endpoints.
            </KeyPoint>
            <TermList
              items={[
                [
                  'Project',
                  'The workspace for one mock API. It owns schemas, endpoints, environments, logs, settings, and members.',
                ],
                [
                  'Schema',
                  'An uploaded OpenAPI document. GhostAPI validates it and converts it into a normalized schema.',
                ],
                [
                  'Endpoint',
                  'A normalized method/path operation generated from the schema and mounted under /mock/{projectId}.',
                ],
                [
                  'Saved response',
                  'A response body you edit and persist for a status code and media type.',
                ],
                [
                  'Mock defaults',
                  'Project-wide behavior such as latency, error chance, auth simulation, and response mode.',
                ],
                [
                  'Activity log',
                  'A captured request/response record used to debug frontend traffic.',
                ],
              ]}
            />
          </Section>

          <Section
            id="architecture"
            eyebrow="System"
            title="Architecture"
            intro="OpenAPI-specific logic is isolated at the parser boundary. Everything downstream uses the normalized model."
          >
            <Flow />
            <TermList
              items={[
                ['apps/web', 'Public Next.js site and docs.'],
                [
                  'apps/app',
                  'Protected Vite workspace for projects, playground, logs, and settings.',
                ],
                [
                  'apps/server',
                  'Hono API, auth, Prisma, schema ingestion, Scalar docs, and runtime orchestration.',
                ],
                ['packages/parser', 'OpenAPI validation, dereferencing, and normalization.'],
                ['packages/runtime', 'Dynamic route matching and mock request serving.'],
                ['packages/mock-engine', 'Schema-aware sample response generation.'],
                ['packages/types', 'Shared DTOs, Zod schemas, and NormalizedEndpoint contracts.'],
              ]}
            />
          </Section>

          <Section
            id="schemas"
            eyebrow="Build"
            title="Schemas"
            intro="A schema upload is the source of truth for endpoint generation, response media types, parameters, request bodies, and docs metadata."
          >
            <KeyPoint>
              Duplicate handling is intentionally explicit. Keeping existing endpoints protects
              local mock edits; overriding updates the project to match the new contract.
            </KeyPoint>
            <Paragraphs
              lines={[
                'GhostAPI accepts OpenAPI 3.x JSON or YAML. Uploads are validated before endpoints are persisted.',
                'When replacing a schema, duplicate method/path pairs are detected. With override disabled, existing endpoints remain and only new endpoints are added. With override enabled, matching endpoints are replaced by the new schema.',
                'Schema history keeps the active version inspectable and makes later replacement flows understandable.',
              ]}
            />
            <DecisionTable
              rows={[
                ['No duplicate', 'Add the new endpoint.'],
                [
                  'Duplicate, override off',
                  'Keep current endpoint and discard the duplicate from the upload.',
                ],
                [
                  'Duplicate, override on',
                  'Replace the current endpoint definition with the uploaded one.',
                ],
              ]}
            />
          </Section>

          <Section
            id="playground"
            eyebrow="Build"
            title="Playground"
            intro="Playground is the full-screen request workspace for a project. The widget below is the real thing in miniature — every request fires against the GhostAPI server you'd run in production."
          >
            <LivePlaygroundDemo apiUrl={apiBaseUrl} />
            <KeyPoint>
              What you just did mirrors a real project: pick an endpoint, dial in mock behavior,
              send a request, read the response. The only difference is that real projects come from
              your uploaded OpenAPI schema instead of this seeded fixture.
            </KeyPoint>
            <Paragraphs
              lines={[
                'In a real project, the endpoint list comes from your uploaded schema. Selecting an endpoint hydrates method, URL, params, headers, body, auth, and mock controls.',
                'Shared project headers are inherited by every request. If a local endpoint header has the same key, the shared header wins and the local duplicate is hidden from the request view.',
                'The body editor follows the selected media type, including JSON, text, no-body requests, and multiple schema-declared content types.',
                'After sending, Playground shows status, latency, response headers, response body, saved response body, and copyable cURL.',
              ]}
            />
          </Section>

          <Section
            id="mock-runtime"
            eyebrow="Operate"
            title="Mock runtime"
            intro="Runtime requests hit /mock/{projectId}/{path}. The widget below is a synthetic feed — drag the sliders and watch real status codes, latencies, and 5xx/401 counts respond live."
          >
            <MockRuntimeFeed />
            <KeyPoint>
              The runtime should behave like a backend, but remain configurable enough to force
              loading, error, auth, and empty-state paths in the frontend.
            </KeyPoint>
            <TermList
              items={[
                [
                  'Route matching',
                  'OpenAPI paths become runtime matchers, including path parameters.',
                ],
                [
                  'Response choice',
                  'Saved responses win first; generated schema-aware responses fill gaps.',
                ],
                [
                  'Latency',
                  'Project defaults or endpoint overrides delay responses for loading-state testing.',
                ],
                [
                  'Error chance',
                  'Configurable failure simulation exercises frontend error states.',
                ],
                [
                  'Auth simulation',
                  'Endpoints can require configured headers without implementing business auth.',
                ],
              ]}
            />
          </Section>

          <Section
            id="settings"
            eyebrow="Operate"
            title="Project settings"
            intro="Settings are divided by responsibility so teams know where to change behavior."
          >
            <TermList items={SETTING_TABS} />
          </Section>

          <Section
            id="members"
            eyebrow="Operate"
            title="Members and invitations"
            intro="Project invitations handle people who already have GhostAPI accounts and people who need to create one."
          >
            <Paragraphs
              lines={[
                'Invite preview checks whether the email is already a user, already a member, or already pending.',
                'Existing users receive a project invite and accept after signing in with the invited email.',
                'New users receive a combined platform and project invitation. After creating the account and verifying email, they join the project with the selected role.',
              ]}
            />
            <DecisionTable
              rows={[
                ['Owner', 'Full control, including project deletion.'],
                [
                  'Admin',
                  'Manage settings, schemas, environments, mock behavior, logs, and members.',
                ],
                [
                  'Editor',
                  'Edit schemas, endpoint responses, mock behavior, environments, and logs.',
                ],
                ['Viewer', 'Read-only access to project data, docs, Playground, and logs.'],
              ]}
            />
          </Section>

          <Section
            id="auth"
            eyebrow="Reference"
            title="Authentication"
            intro="The app uses cookie-backed sessions and CSRF protection. Mock API auth is simulated separately per project or endpoint."
          >
            <TermList
              items={[
                ['Sessions', 'Access and refresh cookies identify the signed-in app user.'],
                ['CSRF', 'Mutating browser requests must send x-csrf-token.'],
                ['Verification', 'New accounts verify email before normal sign-in.'],
                ['Password reset', 'Reset tokens expire and avoid account enumeration.'],
                ['Invitations', 'Invite tokens expire and must match the invited email.'],
              ]}
            />
          </Section>

          <Section
            id="api-reference"
            eyebrow="Reference"
            title="Backend API"
            intro="Use this page for product behavior. Use the live Scalar reference for exact schemas."
          >
            <HealthPing apiUrl={apiBaseUrl} />
            <div className="mb-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href={apiDocsUrl} target="_blank" rel="noreferrer">
                  Open Scalar reference
                  <RiExternalLinkLine className="size-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" className="border-border bg-card text-white">
                <a href={openApiUrl} target="_blank" rel="noreferrer">
                  OpenAPI JSON
                  <RiExternalLinkLine className="size-4" />
                </a>
              </Button>
            </div>
            <RouteTable rows={ROUTES} />
          </Section>

          <Section
            id="development"
            eyebrow="Reference"
            title="Local development"
            intro="Use package-scoped commands while building, then run broader checks before handoff."
          >
            <TermList
              items={[
                ['Public site', 'pnpm --filter @ghostapi/web dev on port 3000.'],
                ['Protected app', 'pnpm --filter @ghostapi/app dev on port 3002.'],
                ['Backend', 'pnpm --filter @ghostapi/server dev on port 3001.'],
                ['Prisma', 'pnpm --filter @ghostapi/server prisma:generate and prisma:migrate.'],
                [
                  'Checks',
                  'pnpm lint, pnpm typecheck, pnpm test, pnpm build, and pnpm format:check.',
                ],
              ]}
            />
          </Section>

          <Section
            id="troubleshooting"
            eyebrow="Reference"
            title="Troubleshooting"
            intro="Most failures come from database drift, stale generated clients, wrong URLs, or email configuration."
          >
            <DecisionTable
              rows={[
                [
                  'Prisma P2022 missing column',
                  'Run pending migrations and regenerate Prisma Client.',
                ],
                [
                  'App cannot reach server',
                  'Check VITE_API_URL, NEXT_PUBLIC_API_URL, CORS, cookies, and port 3001.',
                ],
                [
                  'Invite email lands in spam',
                  'Verify SPF, DKIM, DMARC, sender domain alignment, and reputation.',
                ],
                [
                  'Mock route returns 404',
                  'Confirm schema upload succeeded and the endpoint exists under the selected project.',
                ],
                [
                  'Duplicate request headers',
                  'Shared headers override local endpoint headers by case-insensitive name.',
                ],
              ]}
            />
          </Section>
        </article>
      </div>

      <CommandSearch
        isOpen={isCommandOpen}
        query={commandQuery}
        results={commandResults}
        inputRef={commandInputRef}
        onQueryChange={setCommandQuery}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}

function CommandSearch({
  isOpen,
  query,
  results,
  inputRef,
  onQueryChange,
  onClose,
}: {
  isOpen: boolean;
  query: string;
  results: DocsTopic[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 px-4 py-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onMouseDown={onClose}
    >
      <div
        className="border-border bg-background mx-auto max-w-2xl overflow-hidden rounded-xl border shadow-2xl shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <RiSearchLine className="text-muted-foreground size-5" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search docs..."
            className="placeholder:text-muted-foreground h-14 min-w-0 flex-1 bg-transparent text-base text-white outline-none"
          />
          <kbd className="border-border text-muted-foreground rounded border px-2 py-1 font-mono text-xs">
            Esc
          </kbd>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((topic) => (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                onClick={onClose}
                className="hover:bg-muted/60 block rounded-lg px-3 py-3 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-white">{topic.title}</span>
                  <span className="text-primary font-mono text-[11px] uppercase tracking-[0.16em]">
                    {topic.group}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{topic.summary}</p>
              </a>
            ))
          ) : (
            <p className="text-muted-foreground px-3 py-8 text-sm">
              No docs match that search. Try “schema”, “headers”, “invite”, “mock”, or “csrf”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-border scroll-mt-8 border-b py-16 first:pt-0 last:border-b-0"
    >
      <p className="text-primary font-mono text-xs uppercase tracking-[0.22em]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="text-muted-foreground mt-5 max-w-3xl text-lg leading-8">{intro}</p>
      <div className="mt-9">{children}</div>
    </section>
  );
}

function KeyPoint({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-primary mb-7 max-w-3xl border-l pl-4 text-base font-medium leading-7 text-white">
      {children}
    </p>
  );
}

function OrderedGuide({ steps }: { steps: Array<[string, string]> }) {
  return (
    <ol className="divide-border border-border divide-y border-y">
      {steps.map(([title, body], index) => (
        <li key={title} className="grid gap-4 py-5 sm:grid-cols-[72px_minmax(0,1fr)]">
          <span className="text-primary font-mono text-sm">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return (
    <div className="text-muted-foreground max-w-3xl space-y-5 text-base leading-8">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function TermList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <dl className="divide-border border-border divide-y border-y">
      {items.map(([term, description]) => (
        <div key={term} className="grid gap-3 py-5 md:grid-cols-[210px_minmax(0,1fr)]">
          <dt className="text-base font-semibold text-white">{term}</dt>
          <dd className="text-muted-foreground max-w-3xl text-sm leading-7">{description}</dd>
        </div>
      ))}
    </dl>
  );
}

function DecisionTable({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <div className="border-border overflow-hidden border-y">
      {rows.map(([condition, result]) => (
        <div
          key={condition}
          className="border-border grid gap-3 border-b py-5 last:border-b-0 md:grid-cols-[260px_minmax(0,1fr)]"
        >
          <p className="text-base font-semibold text-white">{condition}</p>
          <p className="text-muted-foreground text-sm leading-7">{result}</p>
        </div>
      ))}
    </div>
  );
}

function Flow() {
  const steps = [
    ['OpenAPI upload', RiFileList3Line],
    ['Parser', RiBracesLine],
    ['Normalized schema', RiBookOpenLine],
    ['Mock engine', RiRouteLine],
    ['Runtime', RiPlayCircleLine],
  ] as const;

  return (
    <div className="border-border mb-8 overflow-x-auto border-y py-5">
      <div className="flex min-w-[680px] items-center gap-3">
        {steps.map(([label, Icon], index) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Icon className="text-primary size-5" />
              <span className="whitespace-nowrap text-sm font-medium text-white">{label}</span>
            </div>
            {index < steps.length - 1 ? (
              <RiArrowRightLine className="text-muted-foreground size-4" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExampleConsole({
  examples,
  activeExample,
  onActiveExampleChange,
}: {
  examples: typeof EXAMPLES;
  activeExample: keyof typeof EXAMPLES;
  onActiveExampleChange: (example: keyof typeof EXAMPLES) => void;
}) {
  const entries = Object.entries(examples) as Array<
    [keyof typeof EXAMPLES, { label: string; code: string }]
  >;
  const active = examples[activeExample];

  return (
    <div className="border-border mt-8 border-y">
      <div className="border-border flex flex-wrap gap-x-6 gap-y-2 border-b py-3">
        {entries.map(([key, example]) => (
          <button
            key={key}
            type="button"
            onClick={() => onActiveExampleChange(key)}
            className={cx(
              'font-mono text-xs transition',
              activeExample === key ? 'text-primary' : 'text-muted-foreground hover:text-white',
            )}
          >
            {example.label}
          </button>
        ))}
      </div>
      <CopyCode title={active.label} code={active.code} />
    </div>
  );
}

function RouteTable({ rows }: { rows: typeof ROUTES }) {
  return (
    <div className="border-border border-y">
      {rows.map(([method, path, description]) => (
        <div
          key={`${method}-${path}`}
          className="border-border grid gap-2 border-b py-3 last:border-b-0 md:grid-cols-[70px_300px_minmax(0,1fr)]"
        >
          <span className="font-mono text-xs font-semibold text-cyan-300">{method}</span>
          <code className="break-all font-mono text-sm text-white">{path}</code>
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        </div>
      ))}
    </div>
  );
}

function CopyCode({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    setCopied(true);
    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    };

    try {
      void navigator.clipboard?.writeText(code).catch(fallbackCopy);
    } catch {
      fallbackCopy();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-white">
          <RiTerminalBoxLine className="text-primary size-4 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="text-muted-foreground inline-flex shrink-0 items-center gap-2 text-xs transition hover:text-white"
        >
          <RiFileCopyLine className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-muted-foreground overflow-x-auto pb-5 pt-2 text-sm leading-7">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
