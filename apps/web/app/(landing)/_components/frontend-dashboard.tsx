'use client';

import { motion } from 'framer-motion';
import { BarChart3, Menu, Plus, Settings, ShoppingCart, Users } from 'lucide-react';

import { Button } from '@ghostapi/ui';

const USERS = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { name: 'Jane Cooper', email: 'jane@example.com', status: 'Active' },
  { name: 'Devon Lane', email: 'devon@example.com', status: 'Active' },
  { name: 'Cody Fisher', email: 'cody@example.com', status: 'Inactive' },
] as const;

const ORDERS = [
  { id: '#ORD-987', date: 'May 24, 2024', amount: '$129.00', status: 'Paid' },
  { id: '#ORD-986', date: 'May 24, 2024', amount: '$89.00', status: 'Paid' },
  { id: '#ORD-985', date: 'May 23, 2024', amount: '$199.00', status: 'Pending' },
  { id: '#ORD-984', date: 'May 23, 2024', amount: '$49.00', status: 'Failed' },
] as const;

/** Bar-chart weekdays for the revenue mini-chart axis labels. */
const REVENUE_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * Right-column mock of "the frontend that the mock API is feeding". A static
 * dashboard preview — users list, orders table, revenue chart — that mirrors
 * the data flowing in from the left-side activity panel.
 *
 * Visuals are intentionally close to the v0 reference so the page reads as
 * a single, recognisable composition; all colors come from the design tokens.
 */
export function FrontendDashboard(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative"
    >
      <div className="text-muted-foreground mb-4 text-right font-mono text-xs tracking-[0.15em]">
        YOUR FRONTEND (POWERED BY GHOSTAPI)
      </div>

      <div
        data-frontend-dashboard
        className="bg-surface/95 border-border/40 w-[270px] overflow-hidden rounded-xl border shadow-2xl shadow-black/50 backdrop-blur-sm"
      >
        <div className="flex">
          {/* Mini sidebar */}
          <div className="bg-background/80 border-border/40 flex w-12 flex-col items-center gap-4 border-r py-4">
            <Menu className="text-muted-foreground/70 size-4" />
            <span className="bg-border/60 h-px w-6" />
            <motion.div whileHover={{ scale: 1.1 }} className="bg-primary/20 rounded-lg p-1.5">
              <Users className="text-primary size-4" />
            </motion.div>
            <Settings className="text-muted-foreground/70 hover:text-muted-foreground size-4 cursor-pointer transition-colors" />
            <BarChart3 className="text-muted-foreground/70 hover:text-muted-foreground size-4 cursor-pointer transition-colors" />
            <ShoppingCart className="text-muted-foreground/70 hover:text-muted-foreground size-4 cursor-pointer transition-colors" />
          </div>

          <div className="flex-1 space-y-5 p-4">
            <UsersSection />
            <OrdersSection />
            <RevenueSection />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UsersSection(): React.JSX.Element {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Users</h3>
        <Button size="sm" className="h-6 gap-1 px-2 text-[10px]">
          <Plus />
          New User
        </Button>
      </div>
      <div className="space-y-2.5">
        {USERS.map((user, index) => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="from-primary to-chart-6 shadow-primary/20 flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white shadow-lg">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="text-foreground text-xs font-medium">{user.name}</div>
                <div className="text-muted-foreground text-[10px]">{user.email}</div>
              </div>
            </div>
            <span
              className={
                user.status === 'Active'
                  ? 'text-success bg-success/15 border-success/20 rounded-full border px-2 py-0.5 text-[10px] font-medium'
                  : 'text-muted-foreground bg-muted/10 border-muted/30 rounded-full border px-2 py-0.5 text-[10px] font-medium'
              }
            >
              {user.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OrdersSection(): React.JSX.Element {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Recent Orders</h3>
        <span className="text-primary hover:text-primary-hover cursor-pointer text-[10px] transition-colors">
          View all
        </span>
      </div>
      <div className="space-y-2">
        {ORDERS.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
            className="flex items-center justify-between py-1 text-[11px]"
          >
            <span className="text-foreground w-16 font-mono font-medium">{order.id}</span>
            <span className="text-muted-foreground w-20">{order.date}</span>
            <span className="text-foreground w-14 text-right font-medium">{order.amount}</span>
            <span
              className={
                order.status === 'Paid'
                  ? 'text-success bg-success/15 w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-medium'
                  : order.status === 'Pending'
                    ? 'text-warning bg-warning/15 w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-medium'
                    : 'text-destructive bg-destructive/15 w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-medium'
              }
            >
              {order.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RevenueSection(): React.JSX.Element {
  return (
    <div data-dash-anchor>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Revenue</h3>
        <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
          Last 7 days <span className="text-[8px]">▾</span>
        </span>
      </div>
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
          {REVENUE_DAYS.map((day, i) => (
            <span key={i}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
