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
import { LANDING_API_LOG } from './live-api-activity';

type Anchor = { x: number; y: number };

/** Radius of the glassy orb in pixels (matches the `size` passed to `GlowOrb` below). */
const ORB_SIZE = 128;
const ORB_RADIUS = ORB_SIZE / 2;

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
    const theater = host.parentElement;
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

  const orbX = size.w / 2;
  const orbY = size.h / 2;

  const sources: SourceBeam[] = sourceAnchors.map((a, i) => {
    const method = LANDING_API_LOG[i]?.method ?? 'GET';
    // Project the source onto the orb's perimeter so beams meet the sphere
    // tangentially instead of stabbing through to the center.
    const e = orbEdge(a.x, a.y, orbX, orbY);
    // Sweep horizontally from the card, then curve along the orb's tangent.
    const c1x = a.x + (orbX - a.x) * 0.5;
    const c1y = a.y;
    const c2x = e.x - (orbX - a.x) * 0.05;
    const c2y = e.y;
    return {
      method,
      d: `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${e.x} ${e.y}`,
    };
  });

  const sinks: SinkBeam[] = sinkAnchors.map((a) => {
    const e = orbEdge(a.x, a.y, orbX, orbY);
    const c1x = e.x + (a.x - orbX) * 0.05;
    const c1y = e.y;
    const c2x = a.x - (a.x - orbX) * 0.5;
    const c2y = a.y;
    return {
      d: `M ${e.x} ${e.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${a.x} ${a.y}`,
    };
  });

  return (
    <div ref={setContainer} className="pointer-events-none absolute inset-0 overflow-visible">
      <AmbientParticles />

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
          <GlowOrb size={128}>
            <Image
              src="/logo/logo-sm.png"
              alt="GhostAPI"
              width={72}
              height={72}
              priority
              unoptimized
            />
          </GlowOrb>
        </div>
      )}
    </div>
  );
}
