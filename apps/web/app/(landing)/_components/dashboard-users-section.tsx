'use client';

import { motion } from 'framer-motion';
import { RiAddLine } from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

import { DASHBOARD_USERS, type DashboardUserStatus } from './constants';

const USER_STATUS_STYLES: Record<DashboardUserStatus, string> = {
  Active: 'text-success bg-success/15 border-success/20',
  Inactive: 'text-muted-foreground bg-muted/10 border-muted/30',
};

export function DashboardUsersSection(): React.JSX.Element {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Users</h3>
        <Button size="sm" className="h-6 gap-1 px-2 text-[10px]">
          <RiAddLine />
          New User
        </Button>
      </div>
      <div className="space-y-2.5">
        {DASHBOARD_USERS.map((user, index) => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="from-primary to-chart-6 shadow-primary/20 flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white shadow-lg">
                {getInitials(user.name)}
              </div>
              <div>
                <div className="text-foreground text-xs font-medium">{user.name}</div>
                <div className="text-muted-foreground text-[10px]">{user.email}</div>
              </div>
            </div>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                USER_STATUS_STYLES[user.status],
              )}
            >
              {user.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}
