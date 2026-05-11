'use client';

import { motion } from 'framer-motion';

import { TRUSTED_COMPANIES } from './constants';

/** Bottom social-proof row — placeholder logos until design ships real ones. */
export function TrustedBy(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="border-border/40 border-t py-16"
    >
      <div className="mb-10 text-center">
        <span className="text-muted-foreground font-mono text-xs tracking-[0.3em]">
          TRUSTED BY DEVELOPERS AT
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-12 px-6">
        {TRUSTED_COMPANIES.map((company, index) => {
          const Icon = company.icon;
          return (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
              className="text-muted-foreground hover:text-foreground/80 flex items-center gap-2 transition-colors"
            >
              <Icon className="size-5" />
              <span className="text-sm font-medium tracking-wide">{company.name}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
