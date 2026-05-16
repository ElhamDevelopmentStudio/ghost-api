'use client';

import { useState } from 'react';
import { RiCheckLine } from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

import { type AppLinks } from '@/app/(landing)/_lib/app-links';
import { type BillingCycle, PRICING_PLANS } from '@/app/(landing)/_components/constants';

type PricingPageClientProps = {
  appLinks: AppLinks;
};

const PLAN_NOTES: Record<(typeof PRICING_PLANS)[number]['name'], string> = {
  Free: 'For solo testing and early prototypes.',
  Pro: 'For developers keeping multiple product surfaces moving.',
  Team: 'For shared projects, invites, and higher traffic.',
  Enterprise: 'For private limits, procurement, and support needs.',
};

export function PricingPageClient({ appLinks }: PricingPageClientProps): React.JSX.Element {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  return (
    <div>
      <div
        className="border-border bg-card/50 inline-flex overflow-hidden rounded-lg border p-1 text-sm"
        role="tablist"
        aria-label="Billing cycle"
      >
        {(['monthly', 'yearly'] as const).map((cycle) => (
          <button
            key={cycle}
            type="button"
            role="tab"
            aria-selected={billingCycle === cycle}
            className={cn(
              'rounded-md px-4 py-2 transition-colors',
              billingCycle === cycle
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setBillingCycle(cycle)}
          >
            {cycle === 'monthly' ? 'Monthly' : 'Yearly, save 20%'}
          </button>
        ))}
      </div>

      <div className="border-border mt-8 divide-y border-y">
        {PRICING_PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const description = billingCycle === 'yearly' ? plan.yearlyDescription : plan.description;
          const href =
            plan.name === 'Enterprise'
              ? 'mailto:sales@ghostapi.dev?subject=GhostAPI%20Enterprise'
              : appLinks.register;

          return (
            <article
              key={plan.name}
              className={cn(
                'grid gap-6 py-8 lg:grid-cols-[220px_1fr_180px]',
                plan.highlighted && 'bg-primary/5 -mx-6 px-6',
              )}
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                  {plan.highlighted ? (
                    <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-2.5 py-1 text-xs">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {PLAN_NOTES[plan.name]}
                </p>
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-white">{price}</span>
                  {plan.suffix ? (
                    <span className="text-muted-foreground pb-1 text-sm">{plan.suffix}</span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-3 text-sm">{description}</p>
                <ul className="text-muted-foreground mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <RiCheckLine className="text-success mt-0.5 size-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start lg:justify-end">
                <Button asChild variant={plan.highlighted ? 'primary' : 'secondary'} size="sm">
                  <a href={href}>{plan.cta}</a>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
