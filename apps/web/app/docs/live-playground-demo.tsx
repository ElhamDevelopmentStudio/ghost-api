'use client';

import { useMemo, useState } from 'react';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiPulseLine,
} from '@remixicon/react';

import { Button, MethodBadge, type HttpMethod } from '@ghostapi/ui';

type Fixture = {
  id: string;
  method: HttpMethod;
  path: string;
  label: string;
  body?: string;
};

const FIXTURES: readonly Fixture[] = [
  { id: 'list', method: 'GET', path: '/users', label: 'List users' },
  { id: 'get', method: 'GET', path: '/users/1', label: 'Get user by id' },
  {
    id: 'create',
    method: 'POST',
    path: '/users',
    label: 'Create user',
    body: '{\n  "name": "Hedy Lamarr",\n  "email": "hedy@example.com",\n  "role": "editor"\n}',
  },
  { id: 'delete', method: 'DELETE', path: '/users/1', label: 'Delete user' },
];

type ResponseSnapshot = {
  status: number;
  statusText: string;
  durationMs: number;
  body: string;
  contentType: string | null;
};

type LivePlaygroundDemoProps = {
  apiUrl: string;
};

export function LivePlaygroundDemo({ apiUrl }: LivePlaygroundDemoProps): React.JSX.Element {
  const [fixtureId, setFixtureId] = useState<string>(FIXTURES[1]!.id);
  const [latencyMs, setLatencyMs] = useState(200);
  const [errorChance, setErrorChance] = useState(0);
  const [authRequired, setAuthRequired] = useState(false);
  const [sendAuthHeader, setSendAuthHeader] = useState(true);
  const [body, setBody] = useState<string>(FIXTURES[1]!.body ?? '');
  const [response, setResponse] = useState<ResponseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fixture = useMemo(
    () => FIXTURES.find((f) => f.id === fixtureId) ?? FIXTURES[0]!,
    [fixtureId],
  );

  const supportsBody = fixture.method === 'POST';

  const requestPath = `/mock/demo${fixture.path}`;
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (latencyMs > 0) params.set('_latency', String(latencyMs));
    if (errorChance > 0) params.set('_error', (errorChance / 100).toFixed(2));
    if (authRequired) params.set('_auth', '1');
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [latencyMs, errorChance, authRequired]);

  function selectFixture(next: Fixture) {
    setFixtureId(next.id);
    setBody(next.body ?? '');
    setResponse(null);
    setError(null);
  }

  async function send() {
    setIsSending(true);
    setError(null);
    const url = `${apiUrl.replace(/\/$/, '')}${requestPath}${queryString}`;
    const headers: Record<string, string> = {};
    if (supportsBody) headers['Content-Type'] = 'application/json';
    if (sendAuthHeader) headers['Authorization'] = 'Bearer demo';

    const init: RequestInit = { method: fixture.method, headers };
    if (supportsBody && body.trim().length > 0) {
      init.body = body;
    }

    const started = performance.now();
    try {
      const res = await fetch(url, init);
      const contentType = res.headers.get('content-type');
      const text = await res.text();
      const pretty = formatBody(text, contentType);
      setResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - started),
        body: pretty,
        contentType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="border-border bg-card/40 mb-8 overflow-hidden rounded-lg border">
      <div className="border-border bg-background/60 flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <RiPulseLine className="text-primary size-4" />
          <span className="text-sm font-semibold text-white">Try it live</span>
          <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
            mock.demo
          </span>
        </div>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[11px]">
          <span className="bg-success size-1.5 rounded-full" />
          real network call
        </span>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <p className="text-muted-foreground mb-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              Endpoint
            </p>
            <div className="flex flex-wrap gap-2">
              {FIXTURES.map((f) => {
                const active = f.id === fixtureId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => selectFixture(f)}
                    className={
                      'border-border hover:border-foreground/30 inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ' +
                      (active ? 'bg-muted/60 text-white' : 'text-muted-foreground')
                    }
                  >
                    <MethodBadge method={f.method} size="sm" />
                    <span className="font-mono">{f.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
              Behavior
            </p>
            <SliderRow
              label="Latency"
              value={latencyMs}
              min={0}
              max={2000}
              step={50}
              unit="ms"
              onChange={setLatencyMs}
            />
            <SliderRow
              label="Error rate"
              value={errorChance}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={setErrorChance}
            />
            <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
              <span className="text-muted-foreground text-xs">Require auth</span>
              <div className="flex items-center gap-2">
                <Toggle label="off" active={!authRequired} onClick={() => setAuthRequired(false)} />
                <Toggle label="on" active={authRequired} onClick={() => setAuthRequired(true)} />
                {authRequired ? (
                  <label className="text-muted-foreground ml-2 inline-flex items-center gap-1.5 font-mono text-[11px]">
                    <input
                      type="checkbox"
                      checked={sendAuthHeader}
                      onChange={(e) => setSendAuthHeader(e.target.checked)}
                      className="accent-primary size-3"
                    />
                    send <code className="text-white">Bearer demo</code>
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          {supportsBody ? (
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                Request body
              </p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                rows={6}
                className="border-border focus:border-primary block w-full resize-y rounded-md border bg-black/40 p-3 font-mono text-xs leading-6 text-white outline-none"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="border-border bg-background/60 rounded-md border p-3">
            <p className="text-muted-foreground mb-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              Request
            </p>
            <div className="flex items-start gap-2 font-mono text-xs">
              <MethodBadge method={fixture.method} size="sm" />
              <code className="min-w-0 break-all text-white">{requestPath}</code>
              {queryString ? (
                <code className="text-primary min-w-0 break-all">{queryString}</code>
              ) : null}
            </div>
          </div>

          <Button onClick={send} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send request
                <RiArrowRightLine className="size-4" />
              </>
            )}
          </Button>

          <ResponsePanel response={response} error={error} method={fixture.method} />
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
    <div className="grid grid-cols-[110px_minmax(0,1fr)_64px] items-center gap-3">
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

function ResponsePanel({
  response,
  error,
  method,
}: {
  response: ResponseSnapshot | null;
  error: string | null;
  method: HttpMethod;
}) {
  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 rounded-md border p-3">
        <p className="text-destructive flex items-center gap-2 text-xs font-semibold">
          <RiCloseLine className="size-4" />
          Network error
        </p>
        <p className="text-muted-foreground mt-1 font-mono text-xs">{error}</p>
        <p className="text-muted-foreground mt-2 text-xs leading-5">
          If you&apos;re running locally, make sure the docs origin is in <code>CORS_ORIGINS</code>.
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="border-border text-muted-foreground rounded-md border border-dashed p-6 text-center text-xs">
        Press <span className="text-white">Send request</span> to fire a real call against the demo
        runtime.
      </div>
    );
  }

  const ok = response.status >= 200 && response.status < 300;
  const statusColor = ok
    ? 'text-success'
    : response.status >= 500
      ? 'text-destructive'
      : 'text-warning';

  return (
    <div className="border-border bg-background/60 overflow-hidden rounded-md border">
      <div className="border-border flex items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          {ok ? (
            <RiCheckLine className="text-success size-3.5" />
          ) : (
            <RiCloseLine className="text-destructive size-3.5" />
          )}
          <MethodBadge method={method} size="sm" />
          <span className={`font-mono font-semibold ${statusColor}`}>
            {response.status} {response.statusText}
          </span>
        </div>
        <span className="text-muted-foreground font-mono text-[11px]">
          {response.durationMs} ms
        </span>
      </div>
      <pre className="text-muted-foreground max-h-72 overflow-auto p-3 font-mono text-xs leading-6">
        <code>{response.body || '(no body)'}</code>
      </pre>
    </div>
  );
}

function formatBody(text: string, contentType: string | null): string {
  if (!text) return '';
  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }
  return text;
}
