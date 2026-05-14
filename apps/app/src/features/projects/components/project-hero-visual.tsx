import type { ReactNode } from 'react';

import { cn } from '@ghostapi/ui';

import ghostSmUrl from '@/features/projects/assets/ghost-sm-clean.svg?url';

type ProjectHeroVisualProps = {
  requestsToday: string;
  errorRate: string;
  averageLatency: string;
};

const connectorPaths = {
  requests: 'M286 124 C362 122 384 48 444 46',
  errors: 'M286 156 C348 156 382 144 444 144',
  latency: 'M286 188 C340 202 371 236 444 236',
};

const sparklinePaths = {
  requests:
    'M2 27 L10 28 L18 22 L26 24 L34 19 L42 21 L50 17 L58 22 L66 18 L74 14 L82 15 L90 11 L98 13 L106 9 L118 6',
  errors:
    'M2 30 L10 29 L18 24 L26 28 L34 18 L42 15 L50 21 L58 14 L66 16 L74 10 L82 13 L90 7 L98 12 L106 5 L118 19',
  latency:
    'M2 25 L10 26 L18 31 L26 30 L34 25 L42 27 L50 22 L58 19 L66 21 L74 14 L82 12 L90 15 L98 13 L106 8 L118 14',
};

const tone = {
  requests: {
    label: 'text-purple-200',
    stroke: 'var(--project-hero-requests)',
    shadow: 'var(--project-hero-requests-shadow)',
    fill: 'var(--project-hero-requests-fill)',
  },
  errors: {
    label: 'text-pink-400',
    stroke: 'var(--project-hero-errors)',
    shadow: 'var(--project-hero-errors-shadow)',
    fill: 'var(--project-hero-errors-fill)',
  },
  latency: {
    label: 'text-amber-400',
    stroke: 'var(--project-hero-latency)',
    shadow: 'var(--project-hero-latency-shadow)',
    fill: 'var(--project-hero-latency-fill)',
  },
} as const;

type MetricTone = keyof typeof tone;

export function ProjectHeroVisual({
  requestsToday,
  errorRate,
  averageLatency,
}: ProjectHeroVisualProps) {
  return (
    <div className="relative min-h-[360px] overflow-hidden">
      <div className="bg-project-hero-aura absolute inset-0" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 760 360"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="project-hero-ghost-glow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.42 0 0 0 0 0.10 0 0 0 0 1 0 0 0 0.92 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="project-hero-line-glow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="project-hero-ghost-fill" x1="210" x2="322" y1="70" y2="228">
            <stop stopColor="var(--project-hero-ghost-fill-start)" />
            <stop offset="0.48" stopColor="var(--project-hero-ghost-fill-mid)" />
            <stop offset="1" stopColor="var(--project-hero-ghost-fill-end)" />
          </linearGradient>
          <linearGradient id="project-hero-ghost-edge" x1="214" x2="318" y1="70" y2="226">
            <stop stopColor="var(--project-hero-ghost-edge-start)" />
            <stop offset="0.44" stopColor="var(--project-hero-ghost-fill-start)" />
            <stop offset="1" stopColor="var(--project-hero-requests-shadow)" />
          </linearGradient>
        </defs>

        <g opacity="0.82">
          <ellipse
            cx="220"
            cy="220"
            rx="210"
            ry="52"
            fill="none"
            stroke="var(--project-hero-orbit-outer)"
            strokeWidth="1.4"
          >
            <animate
              attributeName="cy"
              dur="8.5s"
              repeatCount="indefinite"
              values="220;214;222;220"
            />
            <animate
              attributeName="rx"
              dur="8.5s"
              repeatCount="indefinite"
              values="210;198;214;210"
            />
            <animate attributeName="ry" dur="8.5s" repeatCount="indefinite" values="52;47;55;52" />
          </ellipse>
          <ellipse
            cx="224"
            cy="220"
            rx="155"
            ry="36"
            fill="none"
            stroke="var(--project-hero-orbit-inner)"
            strokeWidth="1.15"
          >
            <animate
              attributeName="cy"
              dur="7.2s"
              repeatCount="indefinite"
              values="220;226;216;220"
            />
            <animate
              attributeName="rx"
              dur="7.2s"
              repeatCount="indefinite"
              values="155;166;148;155"
            />
            <animate attributeName="ry" dur="7.2s" repeatCount="indefinite" values="36;40;33;36" />
          </ellipse>
          <ellipse
            cx="224"
            cy="222"
            rx="78"
            ry="23"
            fill="var(--project-hero-orbit-core)"
            opacity="0.42"
            stroke="var(--project-hero-ghost-fill-mid)"
          >
            <animate
              attributeName="cy"
              dur="5.8s"
              repeatCount="indefinite"
              values="222;216;225;222"
            />
            <animate attributeName="rx" dur="5.8s" repeatCount="indefinite" values="78;68;84;78" />
            <animate attributeName="ry" dur="5.8s" repeatCount="indefinite" values="23;19;25;23" />
          </ellipse>
          <ellipse
            cx="224"
            cy="221"
            rx="115"
            ry="7"
            fill="var(--project-hero-ghost-fill-mid)"
            opacity="0.12"
          >
            <animate
              attributeName="cy"
              dur="6.6s"
              repeatCount="indefinite"
              values="221;225;218;221"
            />
            <animate
              attributeName="rx"
              dur="6.6s"
              repeatCount="indefinite"
              values="115;98;122;115"
            />
          </ellipse>
          <OrbitParticle
            color="var(--project-hero-requests-shadow)"
            delay="0s"
            duration="12s"
            path="M430 220 A210 52 0 1 1 10 220 A210 52 0 1 1 430 220"
          />
          <OrbitParticle
            color="var(--project-hero-requests)"
            delay="-3.4s"
            duration="10.5s"
            path="M379 220 A155 36 0 1 0 69 220 A155 36 0 1 0 379 220"
          />
          <OrbitParticle
            color="var(--project-hero-ghost-fill-mid)"
            delay="-6.2s"
            duration="13.5s"
            path="M302 222 A78 23 0 1 1 146 222 A78 23 0 1 1 302 222"
          />
          <OrbitParticle
            color="var(--project-hero-ghost-fill-start)"
            delay="-8.1s"
            duration="11.5s"
            path="M339 221 A115 7 0 1 0 109 221 A115 7 0 1 0 339 221"
          />
        </g>

        <g filter="url(#project-hero-line-glow)" fill="none" strokeLinecap="round">
          <ConnectorPath path={connectorPaths.requests} stroke={tone.requests.stroke} />
          <ConnectorPath path={connectorPaths.errors} stroke={tone.errors.stroke} />
          <ConnectorPath path={connectorPaths.latency} stroke={tone.latency.stroke} />
          <EndpointDot cx={286} cy={124} color={tone.requests.stroke} />
          <EndpointDot cx={444} cy={46} color={tone.requests.stroke} />
          <EndpointDot cx={286} cy={156} color={tone.errors.stroke} />
          <EndpointDot cx={444} cy={144} color={tone.errors.stroke} />
          <EndpointDot cx={286} cy={188} color={tone.latency.stroke} />
          <EndpointDot cx={444} cy={236} color={tone.latency.stroke} />
        </g>

        <g filter="url(#project-hero-ghost-glow)">
          <image
            href={ghostSmUrl}
            x="18"
            y="-8"
            width="410"
            height="274"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>

      <div className="absolute right-0 top-7 flex w-[330px] max-w-[52%] flex-col gap-9">
        <VisualMetric
          label="REQUESTS TODAY"
          value={requestsToday}
          metricTone="requests"
          sparkline={sparklinePaths.requests}
        />
        <VisualMetric
          label={
            <>
              <span className={tone.errors.label}>ERROR</span>
              <span className="text-white/62"> RATE</span>
            </>
          }
          value={errorRate}
          metricTone="errors"
          sparkline={sparklinePaths.errors}
        />
        <VisualMetric
          label={
            <>
              <span className={tone.latency.label}>AVG.</span>
              <span className="text-white/62"> LATENCY</span>
            </>
          }
          value={averageLatency}
          metricTone="latency"
          sparkline={sparklinePaths.latency}
        />
      </div>
    </div>
  );
}

function ConnectorPath({ path, stroke }: { path: string; stroke: string }) {
  return (
    <>
      <path d={path} stroke={stroke} strokeOpacity="0.18" strokeWidth="6" />
      <path d={path} stroke={stroke} strokeOpacity="0.82" strokeWidth="1.7" />
    </>
  );
}

function EndpointDot({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="8" fill={color} opacity="0.18" />
      <circle cx={cx} cy={cy} r="4" fill={color} />
    </>
  );
}

function OrbitParticle({
  color,
  delay,
  duration,
  path,
}: {
  color: string;
  delay: string;
  duration: string;
  path: string;
}) {
  return (
    <circle r="2.7" fill={color}>
      <animateMotion begin={delay} dur={duration} path={path} repeatCount="indefinite" />
      <animate
        attributeName="opacity"
        dur={duration}
        repeatCount="indefinite"
        values="0.35;1;0.5;0.9;0.35"
      />
    </circle>
  );
}

function VisualMetric({
  label,
  value,
  metricTone,
  sparkline,
}: {
  label: ReactNode;
  value: string;
  metricTone: MetricTone;
  sparkline: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,170px)_120px] items-center gap-5">
      <div className="min-w-0">
        <div
          className={cn(
            'font-mono text-[15px] font-semibold uppercase tracking-[0.22em]',
            metricTone === 'requests' ? tone.requests.label : 'text-white/62',
          )}
        >
          {label}
        </div>
        <div className="mt-2 font-mono text-[38px] font-medium leading-none tracking-normal text-white">
          {value}
        </div>
      </div>
      <Sparkline path={sparkline} metricTone={metricTone} />
    </div>
  );
}

function Sparkline({ path, metricTone }: { path: string; metricTone: MetricTone }) {
  const styles = tone[metricTone];

  return (
    <svg aria-hidden="true" className="h-12 w-[120px] overflow-visible" viewBox="0 0 120 44">
      <path d={`${path} L118 44 L2 44 Z`} fill={styles.fill} />
      <path
        d={path}
        fill="none"
        stroke={styles.shadow}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.22"
        strokeWidth="7"
      />
      <path
        d={path}
        fill="none"
        stroke={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
