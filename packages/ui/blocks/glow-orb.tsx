'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '@ghostapi/ui/lib/utils';

type GlowOrbProps = React.ComponentProps<'div'> & {
  /** Pixel size of the inner glassy bubble. Halo rings extend outside. */
  size?: number;
};

/**
 * Mystic, glassy orb. Drop the GhostAPI mark (or any 2D content) inside as
 * children — the bubble centers it.
 *
 *   <GlowOrb><Image src="/logo/logo-sm.png" ... /></GlowOrb>
 *
 * Build:
 *   1. three concentric halo blobs pulsing on offset timings — the
 *      "subspace glow" the orb sits inside
 *   2. a translucent glass sphere with backdrop-blur so whatever sits
 *      behind it (particles, beams) blurs through
 *   3. a top specular highlight + bottom inner shadow → the eye reads it
 *      as a wet crystal ball
 *   4. an inner radial twilight wash that pulls toward the center, so the
 *      logo appears suspended *inside* the sphere
 */
export function GlowOrb({
  size = 128,
  className,
  children,
  ...props
}: GlowOrbProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'pointer-events-none relative flex items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Far halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.4, 1], opacity: [0.18, 0.06, 0.18] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-primary/45 absolute -inset-24 rounded-full blur-3xl"
      />
      {/* Mid halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.12, 0.3] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="bg-primary/55 absolute -inset-16 rounded-full blur-2xl"
      />
      {/* Near halo */}
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.22, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        className="bg-primary/70 absolute -inset-12 rounded-full blur-xl"
      />

      {/* Glass sphere */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 50px rgba(124,77,255,0.55), 0 0 100px rgba(124,77,255,0.35), inset 0 -18px 30px rgba(0,0,0,0.55), inset 0 12px 24px rgba(255,255,255,0.06)',
            '0 0 70px rgba(124,77,255,0.85), 0 0 140px rgba(124,77,255,0.5), inset 0 -18px 30px rgba(0,0,0,0.55), inset 0 12px 24px rgba(255,255,255,0.1)',
            '0 0 50px rgba(124,77,255,0.55), 0 0 100px rgba(124,77,255,0.35), inset 0 -18px 30px rgba(0,0,0,0.55), inset 0 12px 24px rgba(255,255,255,0.06)',
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: size, height: size }}
        className="border-primary/35 relative flex items-center justify-center overflow-hidden rounded-full border backdrop-blur-md"
      >
        {/* Twilight base — dark glass tint with subtle primary radial pull. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(124,77,255,0.28) 0%, rgba(20,18,40,0.85) 55%, rgba(8,7,18,0.92) 100%)',
          }}
        />

        {/* Top specular — the bright "wet glass" cap. */}
        <span
          aria-hidden
          className="absolute left-[15%] right-[15%] top-[6%] h-[28%] rounded-[50%] opacity-80 blur-md"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), transparent)',
          }}
        />

        {/* Sharper highlight pip — gives the sphere a real "glass" sparkle. */}
        <span
          aria-hidden
          className="absolute left-[28%] top-[12%] h-[6%] w-[10%] rounded-full bg-white/70 blur-[2px]"
        />

        {/* Slow rotating sheen — internal refraction. */}
        <motion.span
          aria-hidden
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 overflow-hidden rounded-full"
        >
          <span className="absolute left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </motion.span>

        {/* Bottom inner shadow — anchors the sphere; reads as gravity. */}
        <span
          aria-hidden
          className="absolute inset-x-[10%] bottom-0 h-[28%] rounded-[50%] opacity-70 blur-md"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
          }}
        />

        {/* Edge fresnel — rim of brighter primary so the sphere edge glows. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              'inset 0 0 22px rgba(167,139,255,0.32), inset 0 0 6px rgba(255,255,255,0.18)',
          }}
        />

        {/* Logo / content slot — pulses its own primary aura. */}
        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 0 14px rgba(124,77,255,0.7))',
              'drop-shadow(0 0 28px rgba(124,77,255,1))',
              'drop-shadow(0 0 14px rgba(124,77,255,0.7))',
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
