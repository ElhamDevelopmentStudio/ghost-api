'use client';

import { motion } from 'framer-motion';

import { cn } from '@ghostapi/ui';

import { DASHBOARD_ORDERS, type DashboardOrderStatus } from './constants';

const ORDER_STATUS_STYLES: Record<DashboardOrderStatus, string> = {
  Paid: 'text-success bg-success/15',
  Pending: 'text-warning bg-warning/15',
  Failed: 'text-destructive bg-destructive/15',
};

export function DashboardOrdersSection(): React.JSX.Element {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Recent Orders</h3>
        <span className="text-primary hover:text-primary-hover cursor-pointer text-[10px] transition-colors">
          View all
        </span>
      </div>
      <div className="space-y-2">
        {DASHBOARD_ORDERS.map((order, index) => (
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
              className={cn(
                'w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-medium',
                ORDER_STATUS_STYLES[order.status],
              )}
            >
              {order.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
