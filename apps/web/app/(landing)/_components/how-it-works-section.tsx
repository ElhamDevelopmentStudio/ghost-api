import {
  RiArrowRightLine,
  RiFileCodeLine,
  RiFileCopyLine,
  RiRocketLine,
  RiSettings3Line,
} from '@remixicon/react';
import Link from 'next/link';

import { Button, Card, CardContent } from '@ghostapi/ui';

import { HOW_IT_WORKS_SCHEMA } from './constants';
import { SectionEyebrow } from './section-eyebrow';

export function HowItWorksSection(): React.JSX.Element {
  return (
    <section
      id="how-it-works"
      className="border-border/20 from-primary/5 relative z-10 overflow-hidden border-y bg-gradient-to-b via-transparent to-transparent px-6 py-24"
    >
      <div
        aria-hidden
        className="from-primary/10 pointer-events-none absolute -top-32 right-[10%] h-80 w-80 rounded-full bg-gradient-to-br to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="from-primary/8 pointer-events-none absolute -bottom-24 left-[5%] h-72 w-72 rounded-full bg-gradient-to-tr to-transparent blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="font-mono">
            <SectionEyebrow>HOW IT WORKS</SectionEyebrow>
            <h2 className="text-foreground max-w-[520px] text-3xl font-bold leading-tight md:text-4xl">
              From schema to{' '}
              <span className="from-primary via-primary/90 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                simulation
              </span>{' '}
              in 3 simple steps
            </h2>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-fit font-mono tracking-[0.08em]"
          >
            <Link href="/docs">
              VIEW DOCS
              <RiArrowRightLine className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="via-primary/30 absolute left-0 right-0 top-4 hidden h-px bg-gradient-to-r from-transparent to-transparent lg:block"
          />

          <div className="relative grid items-start gap-8 lg:grid-cols-3">
            <StepCard
              step="01"
              title="Upload OpenAPI Schema"
              description="Upload your openapi.yaml or JSON file."
              badge={<RiFileCodeLine className="size-4" />}
            >
              <pre className="border-border/40 bg-background/80 text-success overflow-hidden rounded-md border p-5 text-[11px] leading-5">
                {HOW_IT_WORKS_SCHEMA}
              </pre>
            </StepCard>

            <StepCard
              step="02"
              title="Configure Behavior"
              description="Control responses, errors, delays, and authentication."
              badge={<RiSettings3Line className="size-4" />}
            >
              <div className="border-border/40 bg-background/80 rounded-md border p-5">
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <label className="text-muted-foreground space-y-2">
                    <span>Response Status</span>
                    <div className="border-border/40 bg-surface text-foreground rounded border px-3 py-2 font-mono">
                      200
                    </div>
                  </label>
                  <label className="text-muted-foreground space-y-2">
                    <span>Delay (ms)</span>
                    <div className="border-border/40 bg-surface text-foreground rounded border px-3 py-2 font-mono">
                      350
                    </div>
                  </label>
                </div>
                <div className="border-border/40 bg-surface text-muted-foreground mt-4 rounded border p-4 font-mono text-[11px] leading-5">
                  <span className="text-primary">{'{'}</span>
                  <br />
                  &nbsp;&nbsp;&quot;id&quot;: &quot;{'{{id}}'}&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;email&quot;: &quot;{'{{email}}'}&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;status&quot;: &quot;active&quot;
                  <br />
                  <span className="text-primary">{'}'}</span>
                </div>
              </div>
            </StepCard>

            <StepCard
              step="03"
              title="Start & Integrate"
              description="Get your mock API base URL and start building."
              badge={<RiRocketLine className="size-4" />}
            >
              <div className="border-primary/20 bg-primary/10 relative overflow-hidden rounded-md border p-5">
                <div
                  aria-hidden
                  className="from-primary/20 pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br to-transparent blur-2xl"
                />
                <div className="relative flex items-center gap-2">
                  <span className="bg-success size-1.5 animate-pulse rounded-full" />
                  <h4 className="text-foreground font-mono text-sm font-semibold">
                    Your Mock API is live!
                  </h4>
                </div>
                <div className="relative mt-5 space-y-4">
                  <CopyField label="Base URL" value="https://api.ghostapi.dev/v1" />
                  <CopyField label="API Key" value="••••••••••••••••••••" />
                </div>
              </div>
            </StepCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  title,
  description,
  badge,
  children,
}: {
  step: string;
  title: string;
  description: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Card className="border-border/50 bg-surface/45 hover:border-primary/40 group relative py-0 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_-12px_rgba(124,77,255,0.4)]">
      <div
        aria-hidden
        className="from-primary/40 via-primary/15 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent"
      />

      <div
        aria-hidden
        className="bg-primary/30 absolute -top-4 left-5 size-8 rounded-full blur-md"
      />
      <div className="from-primary to-primary-hover text-primary-foreground shadow-primary/30 ring-background absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-4 transition-transform duration-300 group-hover:scale-110">
        {badge}
      </div>

      <span className="text-muted-foreground/40 group-hover:text-primary/60 absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] transition-colors">
        STEP {step}
      </span>

      <CardContent className="p-6">
        <div className="mb-6 mt-7 font-mono">
          <h3 className="text-foreground text-sm font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-4 text-xs leading-6">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function CopyField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <div className="text-muted-foreground mb-2 text-[10px]">{label}</div>
      <div className="border-border/40 bg-background/80 text-foreground flex items-center justify-between rounded border px-3 py-2 font-mono text-xs">
        <span className="truncate">{value}</span>
        <RiFileCopyLine className="text-primary ml-3 size-3.5 shrink-0" />
      </div>
    </div>
  );
}
