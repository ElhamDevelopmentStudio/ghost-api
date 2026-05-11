'use client';

import { motion } from 'framer-motion';

import { DashboardOrdersSection } from './dashboard-orders-section';
import { DashboardRevenueSection } from './dashboard-revenue-section';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardUsersSection } from './dashboard-users-section';

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
        className="bg-surface/95 border-border/40 w-[410px] overflow-hidden rounded-xl border shadow-2xl shadow-black/50 backdrop-blur-sm"
      >
        <div className="flex">
          <DashboardSidebar />

          <div className="flex-1 space-y-5 p-4">
            <DashboardUsersSection />
            <DashboardOrdersSection />
            <DashboardRevenueSection />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
