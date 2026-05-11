'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type AmbientParticlesProps = {
  /** How many drifting particles to render. */
  count?: number;
  /** Inset region (percent) where particles are placed. */
  region?: { top: number; bottom: number; left: number; right: number };
  /** Stable seed used to keep SSR and client hydration output identical. */
  seed?: number;
};

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Drifting glow specks scattered across the parent. Pure decoration: lives
 * underneath the main content so it sets the "subspace data" atmosphere
 * around the orb / theater. The parent must be `position: relative` (or
 * `position: absolute` itself); this block fills it with `inset-0`.
 *
 * Positions/durations use a seeded generator so the server-rendered markup
 * matches the first client render during hydration.
 */
export function AmbientParticles({
  count = 40,
  region = { top: 5, bottom: 95, left: 10, right: 90 },
  seed = 13_371,
}: AmbientParticlesProps): React.JSX.Element {
  const particles = useMemo(() => {
    const random = createSeededRandom(seed);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: random() * 4 + 1,
      left: region.left + random() * (region.right - region.left),
      top: region.top + random() * (region.bottom - region.top),
      alpha: 0.3 + random() * 0.5,
      drift: random() * 20 + 20,
      jitter: random() * 12 - 6,
      duration: 3 + random() * 3,
      delay: random() * 4,
    }));
  }, [count, region.top, region.bottom, region.left, region.right, seed]);

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
