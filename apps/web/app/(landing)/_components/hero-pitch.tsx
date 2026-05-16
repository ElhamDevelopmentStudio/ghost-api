'use client';

import { motion } from 'framer-motion';
import { RiPlayLine } from '@remixicon/react';

import { Button } from '@ghostapi/ui';

import type { AppLinks } from '@/app/(landing)/_lib/app-links';

type HeroPitchProps = {
  appLinks: AppLinks;
  isAuthenticated: boolean;
};

/**
 * Centered hero copy. The visual theater below now carries the developer
 * simulation story, so this stays compact and lets the beaming section lead.
 */
export function HeroPitch({ appLinks, isAuthenticated }: HeroPitchProps): React.JSX.Element {
  const primaryHref = isAuthenticated ? appLinks.dashboard : appLinks.register;
  const primaryLabel = isAuthenticated ? 'OPEN DASHBOARD' : 'GET STARTED FREE';

  return (
    <div className="relative z-10 mx-auto flex max-w-[780px] flex-col items-center pt-4 text-center font-mono">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-foreground mb-4 text-[3.4rem] font-bold leading-[1.04] tracking-normal lg:text-[4.35rem]"
      >
        <span>Your frontend finally comes </span>
        <span className="relative inline-flex items-baseline">
          <span className="from-primary to-primary-hover bg-gradient-to-r bg-clip-text text-transparent">
            alive
          </span>
          <span className="text-primary">.</span>
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="bg-primary ml-2 inline-block h-[0.38em] w-[0.38em]"
          />
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-muted-foreground mb-6 max-w-[520px] text-[11px] leading-[1.65] tracking-normal"
      >
        Upload your OpenAPI schema and instantly get a fully functional mock API with realistic
        data, behavior controls, and real-time logs.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center justify-center gap-7"
      >
        <Button
          asChild
          size="lg"
          className="shadow-primary/40 h-14 min-w-[212px] tracking-normal shadow-lg"
        >
          <a href={primaryHref}>
            <span aria-hidden className="opacity-80">
              {'>_'}
            </span>
            {primaryLabel}
          </a>
        </Button>
        <Button
          asChild
          variant="tertiary"
          size="lg"
          className="text-muted-foreground gap-3 tracking-normal"
        >
          <a href="/how-it-works">
            <span className="border-border-strong flex size-8 items-center justify-center rounded-full border">
              <RiPlayLine className="ml-[1px] size-3 fill-current" />
            </span>
            SEE HOW IT WORKS
          </a>
        </Button>
      </motion.div>
    </div>
  );
}
