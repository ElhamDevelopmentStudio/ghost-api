'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '../lib/utils';

type GlowOrbProps = React.ComponentProps<'div'> & {
  /** Pixel size of the inner glassy bubble. Halo rings extend outside. */
  size?: number;
};

export function GlowOrb({
  size = 128,
  className,
  children,
  ...props
}: GlowOrbProps): React.JSX.Element {
  return (
    <div
      className={cn('pointer-events-none relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* All halos share a 6s breathing cycle on a sine-style curve so they
          read as one organism inhaling/exhaling. Slight delay offsets create
          depth without competing rhythms. */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.28, 1], opacity: [0.42, 0.18, 0.42] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
        }}
        className="bg-primary/70 absolute -inset-20 rounded-full blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.16, 1], opacity: [0.55, 0.26, 0.55] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
          delay: 0.45,
        }}
        className="bg-primary/80 absolute -inset-12 rounded-full blur-2xl"
      />
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.82, 0.5, 0.82] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
          delay: 0.9,
        }}
        className="bg-primary absolute -inset-6 rounded-full blur-xl"
      />

      <motion.div
        animate={{
          filter: [
            'var(--filter-glow-orb)',
            'var(--filter-glow-orb-strong)',
            'var(--filter-glow-orb)',
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
          delay: 0.45,
        }}
        style={{ width: size, height: size }}
        className="relative z-10 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
