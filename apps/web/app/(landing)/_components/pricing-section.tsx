'use client';

import { useState } from 'react';
import { RiCheckLine } from '@remixicon/react';

import { Button, Card, CardContent } from '@ghostapi/ui';

import type { AppLinks } from '@/app/(landing)/_lib/app-links';

import { type BillingCycle, PRICING_PLANS } from './constants';
import { SectionEyebrow } from './section-eyebrow';

type PricingSectionProps = {
  appLinks: AppLinks;
};

export function PricingSection({ appLinks }: PricingSectionProps): React.JSX.Element {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  return (
    <section id="pricing" className="relative z-10 px-6 py-20">
      <div className="bg-surface/20 mx-auto max-w-7xl rounded-xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="font-mono">
            <SectionEyebrow>PRICING</SectionEyebrow>
            <h2 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
          </div>

          <div
            className="border-primary/40 bg-background/70 flex w-fit overflow-hidden rounded-md border p-1 font-mono text-xs"
            role="tablist"
            aria-label="Billing cycle"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingCycle === 'monthly'}
              className={
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground rounded px-5 py-2 transition-colors'
                  : 'text-muted-foreground hover:text-foreground rounded px-5 py-2 transition-colors'
              }
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingCycle === 'yearly'}
              className={
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground rounded px-5 py-2 transition-colors'
                  : 'text-muted-foreground hover:text-foreground rounded px-5 py-2 transition-colors'
              }
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const description =
              billingCycle === 'yearly' ? plan.yearlyDescription : plan.description;

            return (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'border-primary/70 bg-surface/70 shadow-primary/10 py-0 shadow-2xl'
                    : 'border-border/50 bg-surface/55 py-0 shadow-2xl shadow-black/20'
                }
              >
                <CardContent className="p-7">
                  <h3 className="text-foreground font-mono text-sm font-semibold">{plan.name}</h3>
                  <div className="mt-5 flex items-end gap-2 font-mono">
                    <span className="text-foreground text-4xl font-bold">{price}</span>
                    {plan.suffix ? (
                      <span className="text-muted-foreground pb-1 text-sm">{plan.suffix}</span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-5 min-h-12 text-xs leading-6">
                    {description}
                  </p>
                  <ul className="text-muted-foreground mt-8 space-y-3 text-xs">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <RiCheckLine className="text-success mt-0.5 size-3.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-8 w-full font-mono text-xs tracking-[0.08em]"
                    size="sm"
                  >
                    <a
                      href={
                        plan.name === 'Enterprise'
                          ? 'mailto:sales@ghostapi.dev?subject=GhostAPI%20Enterprise'
                          : appLinks.register
                      }
                    >
                      {plan.cta}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
