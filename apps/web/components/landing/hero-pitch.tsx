'use client';

import { motion } from 'framer-motion';
import { Check, Play } from 'lucide-react';

import { Button } from '@ghostapi/ui';

const TRUST_BULLETS = ['No credit card', 'Open source', 'Works in seconds'] as const;

/**
 * Left-column copy for the hero: eyebrow, headline (with blinking cursor),
 * subtext, primary + secondary CTAs, and the trust-bullets row. Every
 * surface here uses the monospace token (`font-mono`) for the terminal-
 * inspired feel the design guidelines call for. Spacing is intentionally
 * a "developer console" rhythm — labels above content, narrow leading.
 */
export function HeroPitch(): React.JSX.Element {
  return (
    <div className="relative z-10 font-mono pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-muted-foreground mb-7 flex items-center gap-2 text-[11px] tracking-[0.22em]"
      >
        <span className="text-primary">{'>_'}</span>
        DEVELOPER-FIRST&nbsp;API&nbsp;SIMULATION&nbsp;PLATFORM
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-foreground mb-8 text-[3.25rem] font-bold leading-[1.04] tracking-[-0.03em] lg:text-[3.6rem]"
      >
        <span className="block">Your</span>
        <span className="block">frontend</span>
        <span className="block">finally</span>
        <span className="block">comes</span>
        <span className="relative inline-flex items-baseline">
          <span className="from-primary to-primary-hover bg-gradient-to-r bg-clip-text text-transparent">
            alive
          </span>
          <span className="text-primary">.</span>
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="bg-primary ml-2 inline-block h-[0.85em] w-[3px] -translate-y-[0.05em]"
          />
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-muted-foreground mb-9 max-w-[360px] text-[13px] leading-[1.65]"
      >
        Upload your OpenAPI schema and instantly get a fully functional mock API with realistic
        data, behavior controls, and real-time logs.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10 flex items-center gap-4"
      >
        <Button size="lg" className="shadow-primary/40 tracking-[0.08em] shadow-lg">
          <span aria-hidden className="opacity-80">
            {'>_'}
          </span>
          GET STARTED FREE
        </Button>
        <Button variant="tertiary" size="lg" className="text-muted-foreground gap-3 tracking-[0.08em]">
          <span className="border-border-strong flex size-8 items-center justify-center rounded-full border">
            <Play className="ml-[1px] size-3 fill-current" />
          </span>
          WATCH DEMO
        </Button>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]"
      >
        {TRUST_BULLETS.map((label) => (
          <li key={label} className="flex items-center gap-2">
            <span className="bg-success/15 ring-success/30 flex size-4 items-center justify-center rounded-full ring-1">
              <Check className="text-success size-2.5" strokeWidth={3} />
            </span>
            {label}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
