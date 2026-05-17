'use client';

import { useState } from 'react';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiHeartPulseLine,
  RiLoader4Line,
} from '@remixicon/react';

import { Button } from '@ghostapi/ui';

type PingResult = {
  status: number;
  statusText: string;
  durationMs: number;
  body: string;
};

type HealthPingProps = {
  apiUrl: string;
};

export function HealthPing({ apiUrl }: HealthPingProps): React.JSX.Element {
  const [result, setResult] = useState<PingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const url = `${apiUrl.replace(/\/$/, '')}/health`;

  async function ping() {
    setIsPinging(true);
    setError(null);
    const started = performance.now();
    try {
      const res = await fetch(url);
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* leave raw text */
      }
      setResult({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - started),
        body: pretty,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setResult(null);
    } finally {
      setIsPinging(false);
    }
  }

  const ok = result ? result.status >= 200 && result.status < 300 : false;

  return (
    <div className="border-border bg-card/40 mb-6 overflow-hidden rounded-lg border">
      <div className="border-border bg-background/60 flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <RiHeartPulseLine className="text-primary size-4" />
          <span className="text-sm font-semibold text-white">Is the backend alive?</span>
        </div>
        <code className="text-muted-foreground truncate font-mono text-[11px]">{url}</code>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
        <Button onClick={ping} disabled={isPinging} className="w-full">
          {isPinging ? (
            <>
              <RiLoader4Line className="size-4 animate-spin" />
              Pinging…
            </>
          ) : (
            <>
              Ping /health
              <RiArrowRightLine className="size-4" />
            </>
          )}
        </Button>

        {error ? (
          <div className="border-destructive/40 bg-destructive/10 rounded-md border p-3">
            <p className="text-destructive flex items-center gap-2 text-xs font-semibold">
              <RiCloseLine className="size-4" />
              No response
            </p>
            <p className="text-muted-foreground mt-1 font-mono text-xs">{error}</p>
          </div>
        ) : result ? (
          <div className="border-border bg-background/60 overflow-hidden rounded-md border">
            <div className="border-border flex items-center justify-between gap-3 border-b px-3 py-2 text-xs">
              <span className="flex items-center gap-2">
                {ok ? (
                  <RiCheckLine className="text-success size-3.5" />
                ) : (
                  <RiCloseLine className="text-destructive size-3.5" />
                )}
                <span
                  className={`font-mono font-semibold ${ok ? 'text-success' : 'text-destructive'}`}
                >
                  {result.status} {result.statusText}
                </span>
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">
                {result.durationMs} ms
              </span>
            </div>
            <pre className="text-muted-foreground max-h-40 overflow-auto p-3 font-mono text-xs leading-6">
              <code>{result.body || '(no body)'}</code>
            </pre>
          </div>
        ) : (
          <div className="border-border text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
            Press <span className="text-white">Ping /health</span> to confirm your backend is
            reachable.
          </div>
        )}
      </div>
    </div>
  );
}
