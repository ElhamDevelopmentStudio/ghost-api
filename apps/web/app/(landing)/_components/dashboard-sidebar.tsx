'use client';

import { motion } from 'framer-motion';
import { BarChart3, Menu, Settings, ShoppingCart, Users } from 'lucide-react';

export function DashboardSidebar(): React.JSX.Element {
  return (
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
  );
}
