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
      className="border-border/20 from-primary/5 relative z-10 border-y bg-gradient-to-b via-transparent to-transparent px-6 py-20"
    >
      <div className="mx-auto max-w-[1840px]">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="font-mono">
            <SectionEyebrow>HOW IT WORKS</SectionEyebrow>
            <h2 className="text-foreground max-w-[520px] text-3xl font-bold leading-tight md:text-4xl">
              From schema to simulation in 3 simple steps
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

        <div className="grid items-start gap-8 lg:grid-cols-3">
          <StepCard
            number="1."
            title="Upload OpenAPI Schema"
            description="Upload your openapi.yaml or JSON file."
            badge={<RiFileCodeLine className="size-4" />}
          >
            <pre className="border-border/40 bg-background/80 text-success overflow-hidden rounded-md border p-5 text-[11px] leading-5">
              {HOW_IT_WORKS_SCHEMA}
            </pre>
          </StepCard>

          <StepCard
            number="2."
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
            number="3."
            title="Start & Integrate"
            description="Get your mock API base URL and start building."
            badge={<RiRocketLine className="size-4" />}
          >
            <div className="border-primary/20 bg-primary/10 rounded-md border p-5">
              <h4 className="text-foreground font-mono text-sm font-semibold">
                Your Mock API is live!
              </h4>
              <div className="mt-5 space-y-4">
                <CopyField label="Base URL" value="https://api.ghostapi.dev/v1" />
                <CopyField label="API Key" value="••••••••••••••••••••" />
              </div>
            </div>
          </StepCard>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  title,
  description,
  badge,
  children,
}: {
  number: string;
  title: string;
  description: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Card className="border-border/50 bg-surface/45 relative py-0 shadow-2xl shadow-black/20">
      <div className="bg-primary text-primary-foreground shadow-primary/30 absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full shadow-lg">
        {badge}
      </div>
      <CardContent className="p-6">
        <div className="mb-6 mt-7 font-mono">
          <h3 className="text-foreground text-sm font-semibold">
            {number} {title}
          </h3>
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
