import { RiArrowRightLine, RiCheckboxCircleLine, RiExternalLinkLine } from '@remixicon/react';

import { Button } from '@ghostapi/ui';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  primary?: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
};

export function PageHero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
}: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),radial-gradient(circle_at_18%_0%,rgba(126,58,242,0.16),transparent_30%)] bg-[length:64px_64px,64px_64px,auto]" />
      <div className="relative max-w-4xl">
        <p className="text-primary font-mono text-xs uppercase tracking-[0.24em]">{eyebrow}</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8">{body}</p>
        {primary || secondary ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {primary ? (
              <Button asChild>
                <a href={primary.href}>
                  {primary.label}
                  <RiArrowRightLine className="size-4" />
                </a>
              </Button>
            ) : null}
            {secondary ? (
              <Button asChild variant="secondary" className="border-border bg-card/80 text-white">
                <a href={secondary.href}>
                  {secondary.label}
                  <RiExternalLinkLine className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PublicSection({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border/40 mx-auto max-w-7xl border-t px-6 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <p className="text-primary font-mono text-xs uppercase tracking-[0.2em]">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h2>
          {body ? <p className="text-muted-foreground mt-4 text-sm leading-7">{body}</p> : null}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function DefinitionList({
  items,
}: {
  items: readonly (readonly [string, string])[];
}): React.JSX.Element {
  return (
    <dl className="divide-border border-border divide-y border-y">
      {items.map(([term, description]) => (
        <div key={term} className="grid gap-3 py-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <dt className="text-base font-semibold text-white">{term}</dt>
          <dd className="text-muted-foreground max-w-3xl text-sm leading-7">{description}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProofList({ items }: { items: readonly string[] }): React.JSX.Element {
  return (
    <ul className="divide-border border-border divide-y border-y">
      {items.map((item) => (
        <li key={item} className="text-muted-foreground flex gap-3 py-4 text-sm leading-7">
          <RiCheckboxCircleLine className="text-primary mt-1 size-4 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CodeStrip({ title, code }: { title: string; code: string }): React.JSX.Element {
  return (
    <div className="border-border border-y">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <pre className="text-muted-foreground overflow-x-auto pb-5 text-sm leading-7">
        <code>{code}</code>
      </pre>
    </div>
  );
}
