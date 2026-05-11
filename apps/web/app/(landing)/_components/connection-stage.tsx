'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import {
  AmbientParticles,
  DataFlowCanvas,
  GlowOrb,
  type SinkBeam,
  type SourceBeam,
} from '@ghostapi/ui';

import { LANDING_API_LOG } from './constants';

type Anchor = { x: number; y: number };

/** Radius of the glowing ghost node in pixels (matches the `size` passed to `GlowOrb` below). */
const ORB_SIZE = 110;
const ORB_RADIUS = ORB_SIZE / 2;
const BEAM_OFFSETS = [-34, -22, -11, 0, 11, 22, 34] as const;

/**
 * Project (fromX, fromY) onto the orb's perimeter — beams should *meet* the
 * sphere, not pierce through it. Returns the point on the orb's circle that
 * lies between the center and the source.
 */
function orbEdge(fromX: number, fromY: number, cx: number, cy: number): Anchor {
  const dx = fromX - cx;
  const dy = fromY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: cx + (dx / dist) * ORB_RADIUS,
    y: cy + (dy / dist) * ORB_RADIUS,
  };
}

/**
 * Full-bleed center theater. Stacks (back → front):
 *   1. ambient particles
 *   2. data-flow beams — sources are measured from the live cards
 *      (`[data-api-log-row]`), sinks are *generated* by mirroring the
 *      source spacing onto the dashboard's left edge so both sides of the
 *      orb read symmetrically
 *   3. glowing orb at the geometric center of the canvas
 *
 * The sink container element is identified by `[data-frontend-dashboard]`
 * — we use its rect for X (left edge) and vertical centering.
 */
export function ConnectionStage(): React.JSX.Element {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [sourceAnchors, setSourceAnchors] = useState<Anchor[]>([]);
  const [sinkAnchors, setSinkAnchors] = useState<Anchor[]>([]);

  const measure = useCallback((host: HTMLElement) => {
    const hostRect = host.getBoundingClientRect();
    const theater = host.closest<HTMLElement>('[data-theater]');
    if (!theater) return;

    const sources: Anchor[] = Array.from(
      theater.querySelectorAll<HTMLElement>('[data-api-log-row]'),
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.right - hostRect.left,
        y: rect.top + rect.height / 2 - hostRect.top,
      };
    });

    // Sinks: same count + same vertical *gaps* as sources, centered on the
    // dashboard. The dashboard provides X (left edge) and vertical anchor.
    const dashboard = theater.querySelector<HTMLElement>('[data-frontend-dashboard]');
    let sinks: Anchor[] = [];
    if (dashboard && sources.length > 0) {
      const dashRect = dashboard.getBoundingClientRect();
      const sinkX = dashRect.left - hostRect.left;
      const sourceYs = sources.map((s) => s.y);
      const sourceSpanCenter = (Math.min(...sourceYs) + Math.max(...sourceYs)) / 2;
      const dashCenterY = dashRect.top + dashRect.height / 2 - hostRect.top;
      // Translate each source Y by the offset between the two centers.
      const offset = dashCenterY - sourceSpanCenter;
      sinks = sources.map((s) => ({ x: sinkX, y: s.y + offset }));
    }

    setSize({ w: hostRect.width, h: hostRect.height });
    setSourceAnchors(sources);
    setSinkAnchors(sinks);
  }, []);

  useEffect(() => {
    if (!container) return;
    const run = () => measure(container);
    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);
    window.addEventListener('resize', run);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [container, measure]);

  const sourceEdgeX =
    sourceAnchors.length > 0 ? Math.max(...sourceAnchors.map((source) => source.x)) : 0;
  const sinkEdgeX =
    sinkAnchors.length > 0 ? Math.min(...sinkAnchors.map((sink) => sink.x)) : size.w;
  const orbX = sourceEdgeX > 0 && sinkEdgeX < size.w ? (sourceEdgeX + sinkEdgeX) / 2 : size.w / 2;
  const orbY = size.h / 2 + 18;

  const sources: SourceBeam[] = sourceAnchors.flatMap((a, i) => {
    const method = LANDING_API_LOG[i]?.method ?? 'GET';
    return BEAM_OFFSETS.map((offset, offsetIndex) => {
      const start = { x: a.x, y: a.y + offset };
      const e = orbEdge(start.x, start.y, orbX, orbY);
      const c1x = start.x + (orbX - start.x) * (offsetIndex === 3 ? 0.48 : 0.42);
      const c1y = start.y - offset * 0.12;
      const c2x = e.x - (orbX - start.x) * 0.08;
      const c2y = e.y + offset * 0.08;
      return {
        method,
        emphasis: offset === 0,
        d: `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${e.x} ${e.y}`,
      };
    });
  });

  const sinks: SinkBeam[] = sinkAnchors.flatMap((a) =>
    BEAM_OFFSETS.map((offset) => {
      const end = { x: a.x, y: a.y + offset * 0.7 };
      const e = orbEdge(end.x, end.y, orbX, orbY);
      const c1x = e.x + (end.x - orbX) * 0.08;
      const c1y = e.y + offset * 0.08;
      const c2x = end.x - (end.x - orbX) * 0.55;
      const c2y = end.y - offset * 0.1;
      return {
        emphasis: offset === 0,
        d: `M ${e.x} ${e.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`,
      };
    }),
  );

  return (
    <div ref={setContainer} className="pointer-events-none absolute inset-0 overflow-visible">
      <AmbientParticles count={120} region={{ top: 10, bottom: 82, left: 18, right: 72 }} />

      {size.w > 0 && (
        <DataFlowCanvas
          sources={sources}
          sinks={sinks}
          viewBox={{ width: size.w, height: size.h }}
        />
      )}

      {size.w > 0 && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: orbX, top: orbY }}
        >
          <GlowOrb size={110}>
            <Image
              src="/logo/logo-sm.png"
              alt="GhostAPI"
              width={124}
              height={124}
              priority
              unoptimized
            />
          </GlowOrb>
        </div>
      )}
    </div>
  );
}
