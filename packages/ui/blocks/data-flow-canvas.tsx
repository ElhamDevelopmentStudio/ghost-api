'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import type { HttpMethod } from '@ghostapi/ui/components/method-badge';

/** Bezier path from a source side to the canvas center. */
type SourceBeam = {
  /** Bezier `d`. Must terminate at the canvas-center point used by `center`. */
  d: string;
  /** Method this beam carries — drives the stroke gradient. */
  method: HttpMethod;
  /** Main request path; rendered brighter than background hairlines. */
  emphasis?: boolean;
};

/** Bezier path from the canvas center out to a destination side. */
type SinkBeam = {
  d: string;
  emphasis?: boolean;
};

type DataFlowCanvasProps = {
  /** Beams flowing INTO the central node (left → center). */
  sources: SourceBeam[];
  /** Beams flowing OUT of the central node (center → right). */
  sinks: SinkBeam[];
  /** SVG viewBox the paths are authored against. */
  viewBox?: { width: number; height: number };
};

/**
 * Animated SVG canvas with two phases of beams:
 *   - sources: colored by HTTP method, draw from left → center
 *   - sinks:   uniform purple, draw from center → right
 *
 * Each beam shows two layers:
 *   1) a faint always-on trail (so the topology is legible even between draws)
 *   2) a `pathLength` motion that sweeps along the curve at a staggered delay
 *
 * Glowing particles ride a random subset of paths each tick.
 *
 * Method colors come from CSS custom properties (`--method-*`) so changing
 * the design system in one place updates every beam. We resolve them inside
 * a `useEffect` to support SSR — the gradients are populated on the client.
 */
const METHOD_VAR: Record<HttpMethod, string> = {
  GET: '--method-get',
  POST: '--method-post',
  PUT: '--method-put',
  PATCH: '--method-patch',
  DELETE: '--method-delete',
  HEAD: '--method-head',
  OPTIONS: '--method-options',
};

type Particle = {
  id: number;
  pathIndex: number;
  delay: number;
  direction: 'in' | 'out';
};

export function DataFlowCanvas({
  sources,
  sinks,
  viewBox = { width: 520, height: 600 },
}: DataFlowCanvasProps): React.JSX.Element {
  const [colors, setColors] = useState<Record<HttpMethod, string>>(
    () =>
      Object.fromEntries(
        (Object.keys(METHOD_VAR) as HttpMethod[]).map((m) => [m, '#7c4dff']),
      ) as Record<HttpMethod, string>,
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  // Resolve method colors from CSS variables on mount so the gradients reflect
  // the design system rather than hard-coded hex values. Runs once — the
  // design tokens don't change at runtime.
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setColors((current) => {
      const next = { ...current };
      (Object.keys(METHOD_VAR) as HttpMethod[]).forEach((m) => {
        const v = styles.getPropertyValue(METHOD_VAR[m]).trim();
        if (v) next[m] = v;
      });
      return next;
    });
  }, []);

  // Continuously spawn glowing particles on random paths.
  useEffect(() => {
    const id = setInterval(() => {
      const fresh: Particle[] = [];
      for (let i = 0; i < sources.length; i++) {
        if (Math.random() > 0.7) {
          fresh.push({
            id: particleId.current++,
            pathIndex: i,
            delay: Math.random() * 0.3,
            direction: 'in',
          });
        }
      }
      for (let i = 0; i < sinks.length; i++) {
        if (Math.random() > 0.7) {
          fresh.push({
            id: particleId.current++,
            pathIndex: i,
            delay: Math.random() * 0.3,
            direction: 'out',
          });
        }
      }
      setParticles((current) => [...current.slice(-40), ...fresh]);
    }, 800);
    return () => clearInterval(id);
  }, [sources.length, sinks.length]);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <defs>
        <filter id="dfc-line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dfc-particle-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* One gradient per method — used by the source beam strokes. */}
        {(Object.keys(METHOD_VAR) as HttpMethod[]).map((m) => (
          <linearGradient key={m} id={`dfc-grad-${m}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[m]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors[m]} stopOpacity="0.9" />
          </linearGradient>
        ))}

        {/* Uniform purple gradient for sink beams. */}
        <linearGradient id="dfc-grad-out" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {sources.map((beam, index) => (
        <g key={`src-${index}`}>
          {/* Always-on trail — every beam stays visible at rest so the
              topology reads even between pulse sweeps. */}
          <path
            d={beam.d}
            fill="none"
            stroke={colors[beam.method]}
            strokeWidth={beam.emphasis ? '1.9' : '0.7'}
            strokeOpacity={beam.emphasis ? '0.9' : '0.24'}
            strokeLinecap="round"
            filter={beam.emphasis ? 'url(#dfc-line-glow)' : undefined}
          />
          <motion.path
            d={beam.d}
            fill="none"
            stroke={`url(#dfc-grad-${beam.method})`}
            strokeWidth={beam.emphasis ? '2.6' : '1'}
            strokeLinecap="round"
            filter="url(#dfc-line-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: 3.5,
              delay: index * 0.3,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'easeInOut',
            }}
          />
        </g>
      ))}

      {sinks.map((beam, index) => (
        <g key={`sink-${index}`}>
          <path
            d={beam.d}
            fill="none"
            stroke="rgba(139, 92, 246, 0.55)"
            strokeWidth={beam.emphasis ? '1.3' : '0.7'}
            strokeOpacity={beam.emphasis ? '0.45' : '0.24'}
            strokeLinecap="round"
          />
          <motion.path
            d={beam.d}
            fill="none"
            stroke="url(#dfc-grad-out)"
            strokeWidth={beam.emphasis ? '1.8' : '0.9'}
            strokeLinecap="round"
            filter="url(#dfc-line-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: 3.5,
              delay: 1.5 + index * 0.3,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'easeInOut',
            }}
          />
        </g>
      ))}

      {particles.map((p) => {
        const beam = p.direction === 'in' ? sources[p.pathIndex] : sinks[p.pathIndex];
        if (!beam) return null;
        const fill = p.direction === 'in' ? colors[(beam as SourceBeam).method] : '#c4b5fd';
        return (
          <motion.circle
            key={p.id}
            r="2.2"
            fill={fill}
            filter="url(#dfc-particle-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], offsetDistance: ['0%', '100%'] }}
            transition={{ duration: 2.5, delay: p.delay, ease: 'easeInOut' }}
            style={{ offsetPath: `path("${beam.d}")` }}
          />
        );
      })}
    </svg>
  );
}

export type { SourceBeam, SinkBeam, DataFlowCanvasProps };
