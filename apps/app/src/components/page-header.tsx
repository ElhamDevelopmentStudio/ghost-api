import type { ReactNode } from 'react';

/** Shared page header for top-of-page title + description + action slot. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  visual,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <header className="mb-8 grid min-h-[180px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div>
        {eyebrow ? <div className="text-white/52 mb-4 text-sm">{eyebrow}</div> : null}
        <h1 className="text-[36px] font-semibold leading-tight tracking-[0] text-white md:text-[38px]">
          {title}
        </h1>
        {description ? (
          <p className="text-white/72 mt-3 max-w-[620px] text-lg leading-8">{description}</p>
        ) : null}
        {action ? <div className="mt-6 flex flex-wrap items-center gap-3">{action}</div> : null}
      </div>
      {visual ? <div>{visual}</div> : null}
    </header>
  );
}
