import { RiGithubFill } from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  githubLabel: string;
  footer: React.ReactNode;
  compact?: boolean;
  className?: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  githubLabel,
  footer,
  compact = false,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'border-border-subtle bg-black/20 shadow-xl shadow-black/30 backdrop-blur-xl',
        'mx-auto w-full rounded-xl border px-8 sm:px-11',
        compact ? 'pb-7 pt-8 sm:pb-7 sm:pt-9' : 'py-10 sm:py-12',
        className,
      )}
    >
      <header className={cn('text-center', compact ? 'mb-5' : 'mb-9')}>
        <h1 className="font-mono text-[28px] font-medium leading-tight text-white">{title}</h1>
        <p className="mt-3 text-[17px] text-zinc-300">{subtitle}</p>
      </header>

      {children}

      <div
        className={cn(
          'grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-zinc-400',
          compact ? 'my-5' : 'my-8',
        )}
      >
        <span className="bg-border-subtle h-px" />
        <span>OR</span>
        <span className="bg-border-subtle h-px" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="border-border-subtle h-[54px] w-full bg-transparent text-base hover:bg-white/5"
        aria-disabled="true"
        title="GitHub authentication is not connected yet."
      >
        <RiGithubFill className="size-5" />
        {githubLabel}
      </Button>

      <div className={cn('text-center text-base text-zinc-400', compact ? 'mt-5' : 'mt-8')}>
        {footer}
      </div>
    </div>
  );
}
