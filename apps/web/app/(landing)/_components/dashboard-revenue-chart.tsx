'use client';

import { motion } from 'framer-motion';

import { DASHBOARD_REVENUE_DAYS } from './constants';

export function DashboardRevenueChart(): React.JSX.Element {
  return (
    <div className="relative h-28">
      <div className="text-muted-foreground/70 absolute left-0 top-0 text-[9px]">20k</div>
      <div className="text-muted-foreground/70 absolute left-0 top-1/2 -translate-y-1/2 text-[9px]">
        10k
      </div>
      <div className="text-muted-foreground/70 absolute bottom-4 left-0 text-[9px]">0</div>

      <div className="relative ml-7 h-[calc(100%-20px)]">
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="size-full">
          <defs>
            <linearGradient id="dashboard-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="0" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          <path
            d="M 0 60 Q 15 55, 30 50 T 60 45 T 90 40 T 120 35 T 150 18 T 180 15 T 200 28 L 200 80 L 0 80 Z"
            fill="url(#dashboard-chart-fill)"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            d="M 0 60 Q 15 55, 30 50 T 60 45 T 90 40 T 120 35 T 150 18 T 180 15 T 200 28"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            cx="150"
            cy="18"
            r="4"
            fill="var(--primary)"
            className="drop-shadow-lg"
          />
          <motion.circle
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            cx="150"
            cy="18"
            r="8"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="bg-surface-elevated border-primary/30 absolute right-6 top-0 rounded-lg border px-2.5 py-1.5 shadow-lg"
      >
        <div className="text-foreground text-xs font-semibold">$12,580</div>
        <div className="text-muted-foreground text-[9px]">May 24</div>
      </motion.div>

      <div className="text-muted-foreground/70 absolute bottom-0 left-7 right-0 flex justify-between px-1 text-[9px]">
        {DASHBOARD_REVENUE_DAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
    </div>
  );
}
