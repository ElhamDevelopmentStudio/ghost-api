'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ApiLogRow } from '@ghostapi/ui';

import { LANDING_API_LOG } from './constants';

/**
 * Left-side animated panel that streams `LANDING_API_LOG` requests. Each
 * tick (1.5s) one row gets the "highlighted" state for 600ms to make the
 * feed feel alive. Composes `ApiLogRow` from the design system so every
 * landing-specific concern stays in this file.
 */
export function LiveApiActivity(): React.JSX.Element {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      const next = LANDING_API_LOG[Math.floor(Math.random() * LANDING_API_LOG.length)];
      if (!next) return;
      setHighlighted(next.id);
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => setHighlighted(null), 600);
    }, 1500);
    return () => {
      clearInterval(interval);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative max-w-[320px]"
    >
      <div className="mb-4 flex items-center gap-2">
        <motion.span
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-success shadow-success/50 size-2 rounded-full shadow-lg"
        />
        <span className="text-muted-foreground font-mono text-xs tracking-[0.2em]">
          LIVE API ACTIVITY
        </span>
      </div>

      <div className="space-y-2">
        {LANDING_API_LOG.map((entry, index) => (
          <motion.div
            key={entry.id}
            data-api-log-row
            data-method={entry.method}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
          >
            <ApiLogRow entry={entry} highlighted={highlighted === entry.id} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
