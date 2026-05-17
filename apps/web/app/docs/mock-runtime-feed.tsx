'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RiPauseLine, RiPlayLine, RiPulseLine } from '@remixicon/react';

import { ApiLogRow, type ApiLogEntry } from '@ghostapi/ui';
import type { HttpMethod } from '@ghostapi/ui';

const POOL: ReadonlyArray<{ method: HttpMethod; endpoint: string; size: string }> = [
  { method: 'GET', endpoint: '/users', size: '1.2kb' },
  { method: 'GET', endpoint: '/users/42', size: '412b' },
  { method: 'POST', endpoint: '/users', size: '286b' },
  { method: 'DELETE', endpoint: '/users/14', size: '0b' },
  { method: 'GET', endpoint: '/orders/ord_a1b2', size: '987b' },
  { method: 'POST', endpoint: '/orders', size: '512b' },
  { method: 'GET', endpoint: '/auth/session', size: '218b' },
  { method: 'PATCH', endpoint: '/users/42', size: '198b' },
];

const MAX_ROWS = 6;
const TICK_MS = 1300;
const HIGHLIGHT_MS = 700;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function successStatusFor(method: HttpMethod): { code: number; text: string } {
  if (method === 'POST') return { code: 201, text: 'Created' };
  if (method === 'DELETE') return { code: 204, text: 'No Content' };
  return { code: 200, text: 'OK' };
}

function decideStatus(
  method: HttpMethod,
  errorChance: number,
  authRequired: boolean,
): { code: number; text: string } {
  if (authRequired && Math.random() < 0.3) {
    return { code: 401, text: 'Unauthorized' };
  }
  if (errorChance > 0 && Math.random() < errorChance / 100) {
    return { code: 500, text: 'Server Error' };
  }
  return successStatusFor(method);
}

function jitter(latencyMs: number): number {
  const span = Math.max(20, Math.round(latencyMs * 0.18));
  return Math.max(2, latencyMs + Math.round((Math.random() - 0.5) * span * 2));
}

function timestamp(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function MockRuntimeFeed(): React.JSX.Element {
  const [latencyMs, setLatencyMs] = useState(220);
  const [errorChance, setErrorChance] = useState(8);
  const [authRequired, setAuthRequired] = useState(false);
  const [entries, setEntries] = useState<ApiLogEntry[]>([]);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  // Keep refs so the interval reads the latest values without re-creating itself.
  const latencyRef = useRef(latencyMs);
  const errorRef = useRef(errorChance);
  const authRef = useRef(authRequired);
  latencyRef.current = latencyMs;
  errorRef.current = errorChance;
  authRef.current = authRequired;

  useEffect(() => {
    if (!isRunning) return;
    let clearHighlight: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      const route = pick(POOL);
      const decided = decideStatus(route.method, errorRef.current, authRef.current);
      const responseMs = jitter(latencyRef.current);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const entry: ApiLogEntry = {
        id,
        method: route.method,
        endpoint: route.endpoint,
        status: decided.text,
        statusCode: decided.code,
        responseTime: `${responseMs}ms`,
        size: decided.code >= 400 ? '142b' : route.size,
        timestamp: timestamp(new Date()),
      };

      setEntries((prev) => [entry, ...prev].slice(0, MAX_ROWS));
      setHighlighted(id);
      if (clearHighlight) clearTimeout(clearHighlight);
      clearHighlight = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      if (clearHighlight) clearTimeout(clearHighlight);
    };
  }, [isRunning]);

  const errorCount = useMemo(() => entries.filter((e) => e.statusCode >= 500).length, [entries]);
  const authCount = useMemo(() => entries.filter((e) => e.statusCode === 401).length, [entries]);

  return (
    <div className="border-border bg-card/40 mb-8 overflow-hidden rounded-lg border">
      <div className="border-border bg-background/60 flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <RiPulseLine className="text-primary size-4" />
          <span className="text-sm font-semibold text-white">Runtime, behaving</span>
          <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
            synthetic feed
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsRunning((r) => !r)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-[11px] transition"
        >
          {isRunning ? (
            <>
              <RiPauseLine className="size-3.5" /> Pause
            </>
          ) : (
            <>
              <RiPlayLine className="size-3.5" /> Resume
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
            Project defaults
          </p>
          <SliderRow
            label="Latency"
            value={latencyMs}
            min={0}
            max={1200}
            step={20}
            unit="ms"
            onChange={setLatencyMs}
          />
          <SliderRow
            label="Error rate"
            value={errorChance}
            min={0}
            max={50}
            step={1}
            unit="%"
            onChange={setErrorChance}
          />
          <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
            <span className="text-muted-foreground text-xs">Auth required</span>
            <div className="flex items-center gap-2">
              <Toggle label="off" active={!authRequired} onClick={() => setAuthRequired(false)} />
              <Toggle label="on" active={authRequired} onClick={() => setAuthRequired(true)} />
            </div>
          </div>

          <div className="border-border mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
            <Stat label="rows" value={String(entries.length)} />
            <Stat label="5xx" value={String(errorCount)} tone={errorCount > 0 ? 'error' : 'idle'} />
            <Stat label="401" value={String(authCount)} tone={authCount > 0 ? 'warning' : 'idle'} />
          </div>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="border-border text-muted-foreground rounded-md border border-dashed p-6 text-center text-xs">
              Waiting for the first request…
            </div>
          ) : (
            entries.map((entry) => (
              <ApiLogRow key={entry.id} entry={entry} highlighted={entry.id === highlighted} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)_56px] items-center gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-primary h-1 w-full cursor-pointer"
      />
      <span className="text-right font-mono text-xs text-white">
        {value}
        <span className="text-muted-foreground ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'border-border rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition ' +
        (active
          ? 'bg-primary/15 border-primary/40 text-primary'
          : 'text-muted-foreground hover:text-white')
      }
    >
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  tone = 'idle',
}: {
  label: string;
  value: string;
  tone?: 'idle' | 'error' | 'warning';
}) {
  const color =
    tone === 'error' ? 'text-destructive' : tone === 'warning' ? 'text-warning' : 'text-foreground';
  return (
    <div>
      <div className={`font-mono text-base font-semibold ${color}`}>{value}</div>
      <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
