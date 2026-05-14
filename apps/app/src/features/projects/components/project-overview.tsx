import { useState } from 'react';
import {
  RiArrowRightUpLine,
  RiFileCopyLine,
  RiFileList3Line,
  RiPulseLine,
  RiRouteLine,
  RiServerLine,
} from '@remixicon/react';
import type {
  HttpMethod,
  ProjectDetail,
  ProjectOverviewBreakdownItem,
  ProjectOverviewTrendPoint,
  ProjectRecentRequest,
} from '@ghostapi/types';

import { Button, MethodBadge, cn } from '@ghostapi/ui';

import { formatProjectRequests } from '@/features/projects/utils/project-formatters';
import { env } from '@/lib/env';

export function ProjectOverview({ project }: { project: ProjectDetail }) {
  const environment = project.environment ?? project.environments[0] ?? null;
  const runtimeUrl = `${env.VITE_API_URL}/mock/${project.id}`;
  const baseUrl = environment?.baseUrl || runtimeUrl;
  const sampleEndpoint = project.overview.sampleEndpoint;
  const testUrl = sampleEndpoint ? `${runtimeUrl}${sampleEndpoint.path}` : null;
  const trafficTotal = project.overview.requestTrend.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="min-h-[calc(100vh-132px)] text-white">
      <OverviewIntro
        project={project}
        baseUrl={baseUrl}
        runtimeUrl={runtimeUrl}
        testUrl={testUrl}
        trafficTotal={trafficTotal}
      />

      <section id="runtime" className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
        <RuntimeConsole
          runtimeUrl={runtimeUrl}
          baseUrl={baseUrl}
          sampleEndpoint={sampleEndpoint}
          schemaVersion={project.schemas[0]?.version ?? null}
        />
        <RouteTopology
          methods={project.overview.routeMethodBreakdown}
          routeCount={project.endpointCount}
        />
      </section>

      <TrafficSection
        trend={project.overview.requestTrend}
        requests={project.overview.recentRequests}
        statusBreakdown={project.overview.statusBreakdown}
      />
    </div>
  );
}

function OverviewIntro({
  project,
  baseUrl,
  runtimeUrl,
  testUrl,
  trafficTotal,
}: {
  project: ProjectDetail;
  baseUrl: string;
  runtimeUrl: string;
  testUrl: string | null;
  trafficTotal: number;
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div
        className="project-overview-grid pointer-events-none absolute -inset-x-16 -inset-y-10 opacity-90 [mask-composite:intersect] [mask-image:linear-gradient(90deg,transparent,black_14%,black_78%,transparent),linear-gradient(180deg,transparent,black_16%,black_72%,transparent)]"
        aria-hidden
      />
      <div className="relative grid gap-8 px-5 py-7 md:px-7 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={project.status} />
            <span className="text-white/38 text-xs uppercase tracking-[0.18em]">
              {project.visibility}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[40px] font-semibold leading-[1.05] tracking-normal text-white">
            {project.name}
          </h1>
          {project.description ? (
            <p className="text-white/56 mt-3 max-w-2xl text-base leading-6">
              {project.description}
            </p>
          ) : null}

          <div className="mt-7 grid max-w-4xl gap-3 md:grid-cols-[160px_160px_minmax(0,1fr)]">
            <Metric label="Routes" value={String(project.endpointCount)} />
            <Metric label="7d traffic" value={formatProjectRequests(trafficTotal)} />
            <Metric label="Runtime" value={runtimeUrlLabel(baseUrl || runtimeUrl)} mono />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-3 xl:justify-end">
          <Button
            asChild
            variant="secondary"
            className="border-white/10 bg-white/[0.035] text-white"
          >
            <a href={`${env.VITE_API_URL}/docs`} target="_blank" rel="noreferrer">
              <RiFileList3Line className="size-4" />
              Docs
            </a>
          </Button>
          {testUrl ? (
            <Button asChild className="bg-brand-action hover:bg-brand-action-hover text-white">
              <a href={testUrl} target="_blank" rel="noreferrer">
                <RiArrowRightUpLine className="size-4" />
                Test Route
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function RuntimeConsole({
  runtimeUrl,
  baseUrl,
  sampleEndpoint,
  schemaVersion,
}: {
  runtimeUrl: string;
  baseUrl: string;
  sampleEndpoint: ProjectDetail['overview']['sampleEndpoint'];
  schemaVersion: number | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyRuntimeUrl() {
    await navigator.clipboard.writeText(runtimeUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="min-w-0">
      <SectionHeader icon={RiServerLine} label="Runtime" title="Mock API is live here" />

      <div className="mt-5 border-y border-white/10 py-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <div className="text-white/36 text-xs uppercase tracking-[0.16em]">Base URL</div>
            <div className="mt-2 break-all font-mono text-[22px] leading-8 text-white">
              {baseUrl}
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-fit border-white/10 bg-white/[0.035] text-white"
            onClick={() => void copyRuntimeUrl()}
          >
            <RiFileCopyLine className="size-4" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <span className="text-white/36 text-xs uppercase tracking-[0.16em]">Try</span>
          {sampleEndpoint ? <MethodBadge method={sampleEndpoint.method as HttpMethod} /> : null}
          <code className="text-white/72 min-w-0 truncate font-mono text-sm">
            {sampleEndpoint?.path ?? '/endpoint'}
          </code>
          {schemaVersion ? (
            <span className="rounded-sm border border-white/10 px-2 py-1 font-mono text-xs text-white/50">
              schema v{schemaVersion}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function RouteTopology({
  methods,
  routeCount,
}: {
  methods: ProjectOverviewBreakdownItem[];
  routeCount: number;
}) {
  const total = Math.max(1, routeCount);
  const sorted = methods.slice().sort((a, b) => b.count - a.count);

  return (
    <section className="min-w-0">
      <SectionHeader icon={RiRouteLine} label="Routes" title={`${routeCount} mounted endpoints`} />

      {sorted.length > 0 ? (
        <div className="mt-5 border-y border-white/10 py-6">
          <div className="relative h-[210px] overflow-hidden">
            <svg viewBox="0 0 420 210" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="routeLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(103,232,249,0.14)" />
                  <stop offset="100%" stopColor="rgba(167,139,250,0.72)" />
                </linearGradient>
              </defs>
              <path
                d="M34 105 C104 32 176 178 246 105 S356 74 392 105"
                fill="none"
                stroke="url(#routeLine)"
                strokeWidth="2"
              />
              {sorted.map((method, index) => {
                const point = topologyPoint(index, sorted.length);
                const radius = 18 + Math.min(34, (method.count / total) * 58);
                return (
                  <g key={method.label}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={radius}
                      fill={methodFill(method.label)}
                      stroke={methodStroke(method.label)}
                      strokeWidth="1.5"
                    />
                    <text
                      x={point.x}
                      y={point.y - 2}
                      textAnchor="middle"
                      className="fill-white font-mono text-[13px] font-semibold"
                    >
                      {method.label}
                    </text>
                    <text
                      x={point.x}
                      y={point.y + 16}
                      textAnchor="middle"
                      className="fill-white/60 font-mono text-[12px]"
                    >
                      {method.count}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {sorted.map((method) => (
              <div key={method.label} className="flex items-center justify-between gap-3 text-sm">
                <span className={cn('font-mono font-semibold', methodTone(method.label))}>
                  {method.label}
                </span>
                <span className="text-white/64 font-mono">
                  {method.count} / {routeCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TrafficSection({
  trend,
  requests,
  statusBreakdown,
}: {
  trend: ProjectOverviewTrendPoint[];
  requests: ProjectRecentRequest[];
  statusBreakdown: ProjectOverviewBreakdownItem[];
}) {
  const total = trend.reduce((sum, point) => sum + point.count, 0);

  return (
    <section id="activity" className="mt-10 border-t border-white/10 pt-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <SectionHeader icon={RiPulseLine} label="Activity" title="Recent mock traffic" />
          {total > 0 ? (
            <TrafficPulse trend={trend} />
          ) : (
            <p className="text-white/48 mt-5 max-w-xl text-sm leading-6">
              No requests have hit this mock API yet. Once a frontend calls it, this area becomes
              the live traffic readout.
            </p>
          )}
        </div>

        <div className="space-y-6">
          {requests.length > 0 ? <LatestHits requests={requests} /> : null}
          {total > 0 ? <StatusRibbon statusBreakdown={statusBreakdown} /> : null}
        </div>
      </div>
    </section>
  );
}

function TrafficPulse({ trend }: { trend: ProjectOverviewTrendPoint[] }) {
  const max = Math.max(1, ...trend.map((point) => point.count));
  const width = 680;
  const height = 150;
  const points = trend.map((point, index) => {
    const x = trend.length <= 1 ? width / 2 : (index / (trend.length - 1)) * width;
    const y = height - 22 - (point.count / max) * 102;
    return { ...point, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

  return (
    <div className="mt-6 overflow-hidden border-y border-white/10 py-5">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full">
        <path d="M 0 128 H 680" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d={path} fill="none" stroke="rgba(103,232,249,0.92)" strokeWidth="2.5" />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r={point.count > 0 ? 7 : 3} fill="rgb(103,232,249)" />
            <text
              x={point.x}
              y={height - 2}
              textAnchor="middle"
              className="fill-white/40 text-[12px]"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function LatestHits({ requests }: { requests: ProjectRecentRequest[] }) {
  return (
    <div>
      <div className="text-white/38 text-xs uppercase tracking-[0.16em]">Latest hits</div>
      <div className="mt-4 space-y-3">
        {requests.slice(0, 5).map((request) => (
          <div
            key={request.id}
            className="grid grid-cols-[54px_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="font-mono text-white">{request.method}</span>
            <span className="text-white/58 truncate font-mono">{request.path}</span>
            <span className={cn('font-mono', statusTextTone(request.status))}>
              {request.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusRibbon({ statusBreakdown }: { statusBreakdown: ProjectOverviewBreakdownItem[] }) {
  const total = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="text-white/38 text-xs uppercase tracking-[0.16em]">Response mix</div>
      <div className="mt-4 flex h-7 overflow-hidden rounded-sm border border-white/10">
        {statusBreakdown.map((item) => (
          <span
            key={item.label}
            className={statusTone(item.label)}
            style={{ width: `${(item.count / total) * 100}%` }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof RiServerLine;
  label: string;
  title: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200/80">
        <Icon className="size-4" />
        {label}
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-normal text-white">{title}</h2>
    </div>
  );
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-white/12 border-l pl-4">
      <div className="text-white/34 text-xs uppercase tracking-[0.16em]">{label}</div>
      <div
        className={cn(
          'mt-2 truncate text-2xl font-semibold text-white',
          mono && 'font-mono text-sm',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ProjectDetail['status'] }) {
  const live = status === 'Live';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium',
        live
          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
          : 'border-amber-400/20 bg-amber-400/10 text-amber-200',
      )}
    >
      <span className={cn('size-1.5 rounded-full', live ? 'bg-emerald-300' : 'bg-amber-300')} />
      {status}
    </span>
  );
}

function topologyPoint(index: number, total: number): { x: number; y: number } {
  const points = [
    { x: 82, y: 86 },
    { x: 176, y: 126 },
    { x: 278, y: 82 },
    { x: 350, y: 132 },
    { x: 222, y: 48 },
    { x: 116, y: 154 },
  ];
  return points[index % Math.max(1, Math.min(points.length, total))] ?? { x: 82, y: 86 };
}

function runtimeUrlLabel(value: string) {
  return value.replace(/^https?:\/\//, '').replace(/\/mock\/.+$/, '/mock/{project}');
}

function methodTone(method: string) {
  if (method === 'GET') return 'text-cyan-200';
  if (method === 'POST') return 'text-emerald-200';
  if (method === 'PUT' || method === 'PATCH') return 'text-amber-200';
  if (method === 'DELETE') return 'text-red-300';
  return 'text-white/76';
}

function methodFill(method: string) {
  if (method === 'GET') return 'rgba(103,232,249,0.16)';
  if (method === 'POST') return 'rgba(110,231,183,0.16)';
  if (method === 'PUT' || method === 'PATCH') return 'rgba(251,191,36,0.16)';
  if (method === 'DELETE') return 'rgba(248,113,113,0.14)';
  return 'rgba(255,255,255,0.08)';
}

function methodStroke(method: string) {
  if (method === 'GET') return 'rgba(103,232,249,0.9)';
  if (method === 'POST') return 'rgba(110,231,183,0.9)';
  if (method === 'PUT' || method === 'PATCH') return 'rgba(251,191,36,0.9)';
  if (method === 'DELETE') return 'rgba(248,113,113,0.85)';
  return 'rgba(255,255,255,0.42)';
}

function statusTone(label: string) {
  if (label === '2xx') return 'bg-emerald-300';
  if (label === '3xx') return 'bg-cyan-300';
  if (label === '4xx') return 'bg-amber-300';
  return 'bg-red-400';
}

function statusTextTone(status: number) {
  if (status >= 200 && status < 300) return 'text-emerald-300';
  if (status >= 300 && status < 400) return 'text-cyan-300';
  if (status >= 400 && status < 500) return 'text-amber-300';
  return 'text-red-300';
}
