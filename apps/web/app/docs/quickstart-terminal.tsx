'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RiRestartLine, RiTerminalBoxLine } from '@remixicon/react';

type Line =
  | { type: 'command'; text: string }
  | { type: 'success'; text: string }
  | { type: 'link'; label: string; href: string };

const LINES: readonly Line[] = [
  { type: 'command', text: '$ pnpm install' },
  { type: 'success', text: 'installed 1487 packages in 32.4s' },
  { type: 'command', text: '$ docker compose up -d' },
  { type: 'success', text: 'ghostapi-postgres up on :5433' },
  { type: 'success', text: 'ghostapi-redis up on :6379' },
  { type: 'command', text: '$ pnpm --filter @ghostapi/server prisma:generate' },
  { type: 'success', text: 'Prisma Client v6.19.3 generated' },
  { type: 'command', text: '$ pnpm --filter @ghostapi/server prisma:migrate' },
  { type: 'success', text: 'applied 12 migrations' },
  { type: 'command', text: '$ pnpm dev' },
  { type: 'link', label: 'public site →', href: 'http://localhost:3000' },
  { type: 'link', label: 'backend →', href: 'http://localhost:3001' },
  { type: 'link', label: 'app workspace →', href: 'http://localhost:3002' },
];

const REVEAL_MS = 550;
const IN_VIEW_THRESHOLD = 0.25;

export function QuickstartTerminal(): React.JSX.Element {
  const [visible, setVisible] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  // `hasStarted` is a one-way latch — once true, re-entering the viewport
  // must NOT auto-resume; only the Replay button does.
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            setIsPlaying(true);
          }
        } else {
          setIsPlaying(false);
        }
      },
      { threshold: IN_VIEW_THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Reveal one line per tick while playing. Stop when finished.
  useEffect(() => {
    if (!isPlaying) return;
    if (visible >= LINES.length) {
      setIsPlaying(false);
      return;
    }
    const id = setTimeout(() => setVisible((v) => v + 1), REVEAL_MS);
    return () => clearTimeout(id);
  }, [isPlaying, visible]);

  function replay() {
    setVisible(0);
    setIsPlaying(true);
  }

  return (
    <div
      ref={containerRef}
      className="border-border bg-card/40 mb-8 overflow-hidden rounded-lg border"
    >
      <div className="border-border bg-background/60 flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <RiTerminalBoxLine className="text-primary size-4" />
          <span className="text-sm font-semibold text-white">Setup, end to end</span>
          <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
            ~3 min on a warm cache
          </span>
        </div>
        <button
          type="button"
          onClick={replay}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-[11px] transition"
        >
          <RiRestartLine className="size-3.5" />
          Replay
        </button>
      </div>

      <div className="p-4">
        <div className="border-border/60 bg-surface/95 overflow-hidden rounded-lg border">
          <div className="border-border/60 bg-surface-elevated flex items-center gap-2 border-b px-4 py-2">
            <span className="bg-destructive/80 size-3 rounded-full" />
            <span className="bg-warning/80 size-3 rounded-full" />
            <span className="bg-success/80 size-3 rounded-full" />
          </div>
          <div className="min-h-[420px] space-y-2 p-5 font-mono text-sm">
            {LINES.slice(0, visible).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                {line.type === 'command' && (
                  <span className="text-muted-foreground">{line.text}</span>
                )}
                {line.type === 'success' && (
                  <>
                    <span className="text-success">✓</span>
                    <span className="text-foreground/85">{line.text}</span>
                  </>
                )}
                {line.type === 'link' && (
                  <>
                    <span className="text-success">✓</span>
                    <span className="text-foreground/85">{line.label} </span>
                    <span className="text-primary">{line.href}</span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
