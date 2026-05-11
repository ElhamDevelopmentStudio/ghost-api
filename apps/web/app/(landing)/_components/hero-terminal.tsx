'use client';

import { motion } from 'framer-motion';

import { TerminalWindow } from '@ghostapi/ui';

import { HERO_TERMINAL_LINES } from './constants';

/** Hero-side wrapper around `TerminalWindow` that just owns mount-in motion. */
export function HeroTerminal(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mt-9 w-full max-w-[392px]"
    >
      <TerminalWindow lines={HERO_TERMINAL_LINES} chrome={false} />
    </motion.div>
  );
}
