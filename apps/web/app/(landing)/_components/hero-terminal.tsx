'use client';

import { motion } from 'framer-motion';

import { TerminalWindow, type TerminalLine } from '@ghostapi/ui';

const LINES: TerminalLine[] = [
  { type: 'command', text: '$ ghostapi start' },
  { type: 'success', text: 'Parsing openapi.yaml' },
  { type: 'success', text: 'Generating endpoints' },
  { type: 'success', text: 'Starting mock server' },
  { type: 'link', label: 'Live at', href: 'http://localhost:4321' },
  { type: 'status', text: 'Ready to receive requests' },
];

/** Hero-side wrapper around `TerminalWindow` that just owns mount-in motion. */
export function HeroTerminal(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mt-8 w-full max-w-md"
    >
      <TerminalWindow lines={LINES} />
    </motion.div>
  );
}
