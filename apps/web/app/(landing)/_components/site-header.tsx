'use client';

import { motion } from 'framer-motion';
import { RiGithubFill, RiStarLine } from '@remixicon/react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@ghostapi/ui';

import type { AppLinks } from '@/app/(landing)/_lib/app-links';

const NAV_ITEMS = [
  { label: 'FEATURES', href: '#features' },
  { label: 'HOW IT WORKS', href: '#how-it-works' },
  { label: 'PRICING', href: '#pricing' },
  { label: 'DOCS', href: '/docs' },
  { label: 'CHANGELOG', href: '#changelog' },
] as const;

type SiteHeaderProps = {
  appLinks: AppLinks;
  isAuthenticated: boolean;
};

/** Top nav for the public landing page. */
export function SiteHeader({ appLinks, isAuthenticated }: SiteHeaderProps): React.JSX.Element {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-50 flex items-center justify-between px-[42px] py-[21px]"
    >
      <Link href="/" className="flex items-center gap-3" aria-label="GhostAPI">
        <Image
          src="/logo/logo-sm.png"
          alt=""
          width={32}
          height={32}
          priority
          unoptimized
          className="size-8"
        />
        <span className="text-lg font-semibold tracking-wider">
          <span className="text-foreground">GHOST</span>
          <span className="text-primary">API</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-foreground hover:text-primary text-xs font-medium tracking-normal transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <RiGithubFill />
            <span>Star on GitHub</span>
            <span className="text-warning ml-1 flex items-center gap-1">
              <RiStarLine className="fill-warning size-3" />
              1.2k
            </span>
          </a>
        </Button>
        {isAuthenticated ? (
          <Button asChild size="sm">
            <a href={appLinks.dashboard}>
              DASHBOARD
              <span aria-hidden>→</span>
            </a>
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="tertiary"
              size="sm"
              className="hidden font-mono sm:inline-flex"
            >
              <a href={appLinks.login}>LOGIN</a>
            </Button>
            <Button asChild size="sm">
              <a href={appLinks.register}>
                SIGN UP
                <span aria-hidden>→</span>
              </a>
            </Button>
          </>
        )}
      </div>
    </motion.header>
  );
}
