'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ApiLogRow, type ApiLogEntry } from '@ghostapi/ui';

/** Static script of requests that "happen" on the landing page. */
export const LANDING_API_LOG: ApiLogEntry[] = [
  {
    id: '1',
    method: 'GET',
    endpoint: '/users',
    status: 'OK',
    statusCode: 200,
    responseTime: '482ms',
    size: '1.2 KB',
    timestamp: '10:24:31:250',
  },
  {
    id: '2',
    method: 'POST',
    endpoint: '/users/login',
    status: 'OK',
    statusCode: 200,
    responseTime: '321ms',
    size: '1.1 KB',
    timestamp: '10:24:31:987',
  },
  {
    id: '3',
    method: 'GET',
    endpoint: '/products?limit=10',
    status: 'OK',
    statusCode: 200,
    responseTime: '196ms',
    size: '2.4 KB',
    timestamp: '10:24:32:521',
  },
  {
    id: '4',
    method: 'PUT',
    endpoint: '/users/123',
    status: 'OK',
    statusCode: 200,
    responseTime: '612ms',
    size: '1.3 KB',
    timestamp: '10:24:33:102',
  },
  {
    id: '5',
    method: 'POST',
    endpoint: '/orders',
    status: 'Created',
    statusCode: 201,
    responseTime: '842ms',
    size: '1.8 KB',
    timestamp: '10:24:33:659',
  },
  {
    id: '6',
    method: 'GET',
    endpoint: '/orders/987',
    status: 'OK',
    statusCode: 200,
    responseTime: '278ms',
    size: '2.1 KB',
    timestamp: '10:24:34:221',
  },
  {
    id: '7',
    method: 'DELETE',
    endpoint: '/users/456',
    status: 'Not Found',
    statusCode: 404,
    responseTime: '128ms',
    size: '240 B',
    timestamp: '10:24:34:820',
  },
  {
    id: '8',
    method: 'POST',
    endpoint: '/uploads',
    status: 'Unauthorized',
    statusCode: 401,
    responseTime: '315ms',
    size: '512 B',
    timestamp: '10:24:35:443',
  },
];

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
