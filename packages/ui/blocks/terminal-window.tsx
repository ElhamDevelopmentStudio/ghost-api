'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { cn } from '@ghostapi/ui/lib/utils';

/** A single line printed inside the terminal body. */
export type TerminalLine =
  | { type: 'command'; text: string }
  | { type: 'success'; text: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'status'; text: string };

type TerminalWindowProps = React.ComponentProps<'div'> & {
  /** Lines to reveal sequentially. */
  lines: TerminalLine[];
  /** Delay (ms) between each line reveal. */
  revealMs?: number;
  /** Show the traffic-light title bar. */
  chrome?: boolean;
};

/**
 * Animated mock terminal — traffic-light header, then `lines` revealed one at
 * a time on a fixed interval. Pure presentation; the parent owns the
 * scripted content.
 */
export function TerminalWindow({
  lines,
  revealMs = 400,
  chrome = true,
  className,
  ...props
}: TerminalWindowProps): React.JSX.Element {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    const id = setInterval(() => {
      setVisible((prev) => (prev < lines.length ? prev + 1 : prev));
    }, revealMs);
    return () => clearInterval(id);
  }, [lines, revealMs]);

  return (
    <div
      className={cn('border-border/60 bg-surface/95 overflow-hidden rounded-lg border', className)}
      {...props}
    >
      {chrome && (
        <div className="border-border/60 bg-surface-elevated flex items-center gap-2 border-b px-4 py-2">
          <span className="bg-destructive/80 size-3 rounded-full" />
          <span className="bg-warning/80 size-3 rounded-full" />
          <span className="bg-success/80 size-3 rounded-full" />
        </div>
      )}

      <div className="space-y-2 p-5 font-mono text-sm">
        {lines.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {line.type === 'command' && <span className="text-muted-foreground">{line.text}</span>}
            {line.type === 'success' && (
              <>
                <span className="text-success">✓</span>
                <span className="text-foreground/85">{line.text}</span>
              </>
            )}
            {line.type === 'link' && (
              <>
                <span className="text-success">✓</span>
                <span className="text-foreground/85">{line.label} </span>
                <span className="text-primary">{line.href}</span>
              </>
            )}
            {line.type === 'status' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground">{line.text}</span>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-primary size-2 rounded-full"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
