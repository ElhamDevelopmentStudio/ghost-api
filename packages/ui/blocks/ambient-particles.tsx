'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type AmbientParticlesProps = {
  /** How many drifting particles to render. */
  count?: number;
  /** Inset region (percent) where particles are placed. */
  region?: { top: number; bottom: number; left: number; right: number };
};

/**
 * Drifting glow specks scattered across the parent. Pure decoration: lives
 * underneath the main content so it sets the "subspace data" atmosphere
 * around the orb / theater. The parent must be `position: relative` (or
 * `position: absolute` itself); this block fills it with `inset-0`.
 *
 * Positions/durations are randomized once (`useMemo`) so the layout is
 * stable across re-renders within a session.
 */
export function AmbientParticles({
  count = 40,
  region = { top: 5, bottom: 95, left: 10, right: 90 },
}: AmbientParticlesProps): React.JSX.Element {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 1,
        left: region.left + Math.random() * (region.right - region.left),
        top: region.top + Math.random() * (region.bottom - region.top),
        alpha: 0.3 + Math.random() * 0.5,
        drift: Math.random() * 20 + 20,
        jitter: Math.random() * 12 - 6,
        duration: 3 + Math.random() * 3,
        delay: Math.random() * 4,
      })),
    [count, region.top, region.bottom, region.left, region.right],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: `rgba(124, 77, 255, ${p.alpha})`,
          }}
          animate={{
            y: [0, -p.drift, 0],
            x: [0, p.jitter, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [0.5, 1.3, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
