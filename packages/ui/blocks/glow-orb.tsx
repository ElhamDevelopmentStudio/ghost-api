'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '@ghostapi/ui/lib/utils';

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
      {/* Far halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.32, 1], opacity: [0.42, 0.18, 0.42] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-primary/70 absolute -inset-20 rounded-full blur-3xl"
      />
      {/* Mid halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.18, 1], opacity: [0.58, 0.28, 0.58] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="bg-primary/80 absolute -inset-12 rounded-full blur-2xl"
      />
      {/* Near halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.1, 1], opacity: [0.85, 0.48, 0.85] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        className="bg-primary absolute -inset-6 rounded-full blur-xl"
      />

      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 10px rgba(255,255,255,0.8)) drop-shadow(0 0 22px rgba(124,77,255,1)) drop-shadow(0 0 48px rgba(124,77,255,0.95))',
            'drop-shadow(0 0 14px rgba(255,255,255,0.95)) drop-shadow(0 0 32px rgba(124,77,255,1)) drop-shadow(0 0 70px rgba(124,77,255,1))',
            'drop-shadow(0 0 10px rgba(255,255,255,0.8)) drop-shadow(0 0 22px rgba(124,77,255,1)) drop-shadow(0 0 48px rgba(124,77,255,0.95))',
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: size, height: size }}
        className="relative z-10 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
