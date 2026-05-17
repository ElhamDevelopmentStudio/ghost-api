'use client';

import { useState } from 'react';
import { RiCheckLine, RiSparkling2Line } from '@remixicon/react';

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
    <section id="pricing" className="relative z-10 px-6 py-24">
      <div
        aria-hidden
        className="from-primary/10 pointer-events-none absolute left-1/2 top-12 h-72 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-3xl"
      />

      <div className="bg-surface/20 relative mx-auto max-w-7xl rounded-xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="font-mono">
            <SectionEyebrow>PRICING</SectionEyebrow>
            <h2 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
              Simple,{' '}
              <span className="from-primary via-primary/90 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                transparent
              </span>{' '}
              pricing
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-7">
              Start free. Scale when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div
            className="border-primary/40 bg-background/70 flex w-fit overflow-hidden rounded-md border p-1 font-mono text-xs shadow-lg shadow-black/20 backdrop-blur-sm"
            role="tablist"
            aria-label="Billing cycle"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingCycle === 'monthly'}
              className={
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-primary/30 rounded px-5 py-2 shadow-md transition-all'
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
                  ? 'bg-primary text-primary-foreground shadow-primary/30 rounded px-5 py-2 shadow-md transition-all'
                  : 'text-muted-foreground hover:text-foreground rounded px-5 py-2 transition-colors'
              }
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly · Save 20%
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const description =
              billingCycle === 'yearly' ? plan.yearlyDescription : plan.description;

            return (
              <div key={plan.name} className="relative">
                {plan.highlighted ? (
                  <div
                    aria-hidden
                    className="from-primary/30 via-primary/15 pointer-events-none absolute -inset-px rounded-lg bg-gradient-to-b to-transparent blur-md"
                  />
                ) : null}

                <Card
                  className={
                    plan.highlighted
                      ? 'border-primary/70 bg-surface/80 shadow-primary/20 group relative overflow-hidden py-0 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_60px_-12px_rgba(124,77,255,0.55)]'
                      : 'border-border/50 bg-surface/55 hover:border-primary/30 hover:bg-surface/70 group relative overflow-hidden py-0 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1'
                  }
                >
                  {plan.highlighted ? (
                    <>
                      <div
                        aria-hidden
                        className="from-primary/60 via-primary/30 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent"
                      />
                      <div
                        aria-hidden
                        className="from-primary/15 pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br to-transparent blur-3xl"
                      />
                      <div className="from-primary to-primary-hover text-primary-foreground absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] shadow-lg shadow-black/30">
                        <RiSparkling2Line className="size-3" />
                        POPULAR
                      </div>
                    </>
                  ) : null}

                  <CardContent className="relative p-7">
                    <h3 className="text-foreground font-mono text-sm font-semibold tracking-[0.04em]">
                      {plan.name}
                    </h3>
                    <div className="mt-5 flex items-end gap-2 font-mono">
                      <span
                        className={
                          plan.highlighted
                            ? 'from-foreground to-primary/70 bg-gradient-to-br bg-clip-text text-4xl font-bold text-transparent'
                            : 'text-foreground text-4xl font-bold'
                        }
                      >
                        {price}
                      </span>
                      {plan.suffix ? (
                        <span className="text-muted-foreground pb-1 text-sm">{plan.suffix}</span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-5 min-h-12 text-xs leading-6">
                      {description}
                    </p>

                    <div className="border-border/40 my-6 border-t" />

                    <ul className="text-muted-foreground space-y-3 text-xs">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span
                            className={
                              plan.highlighted
                                ? 'bg-primary/15 ring-primary/30 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ring-1'
                                : 'bg-success/10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full'
                            }
                          >
                            <RiCheckLine
                              className={
                                plan.highlighted ? 'text-primary size-3' : 'text-success size-3'
                              }
                            />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant={plan.highlighted ? 'primary' : 'secondary'}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
