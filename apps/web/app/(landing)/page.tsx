import { ConnectionStage } from '@/app/(landing)/_components/connection-stage';
import { FrontendDashboard } from '@/app/(landing)/_components/frontend-dashboard';
import { HeroPitch } from '@/app/(landing)/_components/hero-pitch';
import { HeroTerminal } from '@/app/(landing)/_components/hero-terminal';
import { LiveApiActivity } from '@/app/(landing)/_components/live-api-activity';
import { SiteHeader } from '@/app/(landing)/_components/site-header';
import { TrustedBy } from '@/app/(landing)/_components/trusted-by';
import { Button } from '@ghostapi/ui';
import {
  Activity,
  ArrowRight,
  Braces,
  Check,
  Copy,
  FileCode2,
  Github,
  MessageCircle,
  Quote,
  RefreshCw,
  Rocket,
  Settings2,
  SlidersHorizontal,
  Twitter,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'OpenAPI -> Mock API',
    description: 'Upload your OpenAPI schema and get a fully working API in seconds.',
    icon: FileCode2,
  },
  {
    title: 'Realistic Responses',
    description: 'Dynamic data, relationships, and custom rules that feel real.',
    icon: Braces,
  },
  {
    title: 'Behavior Controls',
    description: 'Simulate delays, errors, auth, and edge cases with ease.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Live Request Logs',
    description: 'See every request in real-time with headers, query params, and payloads.',
    icon: Activity,
  },
  {
    title: 'Team Workspaces',
    description: 'Collaborate with your team and share mock environments.',
    icon: Users,
  },
  {
    title: 'Environment Sync',
    description: 'Switch between multiple environments in one click.',
    icon: RefreshCw,
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      'GhostAPI saved our team hours of waiting time. Our frontend devs can ship faster without blocking on APIs.',
    author: 'Alex R.',
    role: 'Frontend Lead',
    initials: 'AR',
  },
  {
    quote: 'The behavior controls are a game changer. We can simulate any scenario instantly.',
    author: 'Priya M.',
    role: 'Full Stack Developer',
    initials: 'PM',
  },
  {
    quote: 'Setup took literally 30 seconds. The request logs are incredibly detailed.',
    author: 'Jason T.',
    role: 'Engineering Manager',
    initials: 'JT',
  },
] as const;

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    suffix: '/ month',
    description: 'Perfect for getting started.',
    features: ['1 Project', '2 Environments', '5K Requests / Month', 'Community Support'],
    cta: 'GET STARTED',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    suffix: '/ month',
    description: 'For individual developers.',
    features: [
      'Unlimited Projects',
      '10 Environments',
      '100K Requests / Month',
      'Priority Support',
    ],
    cta: 'START FREE TRIAL',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29',
    suffix: '/ month',
    description: 'For small teams.',
    features: ['Everything in Pro', 'Team Workspaces', '1M Requests / Month', 'Team Support'],
    cta: 'START FREE TRIAL',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    suffix: '',
    description: 'For large organizations.',
    features: ['Everything in Team', 'SSO & SAML', 'Custom Limits', 'Dedicated Support'],
    cta: 'CONTACT SALES',
    highlighted: false,
  },
] as const;

const FOOTER_GROUPS = [
  { title: 'PRODUCT', links: ['Features', 'How It Works', 'Pricing', 'Changelog'] },
  { title: 'RESOURCES', links: ['Docs', 'Guides', 'API Reference', 'Blog'] },
  { title: 'COMPANY', links: ['About', 'Careers', 'Contact'] },
  { title: 'LEGAL', links: ['Privacy Policy', 'Terms of Service', 'License'] },
] as const;

/**
 * Public landing page.
 *
 * **≥ 1280px (xl)**: three-column hero — pitch + terminal on the left, an
 * animation theater on the right with the API activity feed, the glowing
 * orb, and the frontend dashboard mockup.
 *
 * **< 1280px**: theater hides entirely; the pitch + terminal column
 * centers in the viewport. This keeps the page legible on tablets and
 * smaller laptops without trying to cram three columns into a half-width
 * track.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative min-h-screen">
        {/* Grid overlay — barely visible, reads as "developer tooling". */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,77,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,77,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Primary purple wash radiating from the upper-center. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(124,77,255,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Vignette so the edges fade into the background. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, var(--background) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[2000px] px-6 pt-20">
          <div className="flex min-h-[calc(100vh-80px)] flex-col items-center xl:flex-row xl:items-start xl:justify-between xl:gap-20">
            <div className="z-20 flex w-full max-w-[400px] flex-col xl:w-[400px] xl:shrink-0">
              <HeroPitch />
              <HeroTerminal />
            </div>

            {/* Animation theater. The ConnectionStage is full-bleed over this
                block so its SVG can draw lines that visually start at the
                right edge of the API cards and end at the left edge of the
                dashboard — the cards/dashboard themselves render above it
                (z-10) so the lines tuck under them. Hidden below xl. */}
            <div className="relative hidden h-[760px] flex-1 xl:block" data-theater>
              <ConnectionStage />

              <div className="absolute left-0 top-28 z-10">
                <LiveApiActivity />
              </div>

              <div className="absolute right-0 top-28 z-10">
                <FrontendDashboard />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade so the hero blends into the trust row. */}
        <div className="from-background absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t to-transparent" />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl">
        <TrustedBy />
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="text-primary mb-6 flex items-center gap-2 font-mono text-xs tracking-[0.2em]">
      <span aria-hidden>{'>_'}</span>
      {children}
    </div>
  );
}

function FeaturesSection(): React.JSX.Element {
  return (
    <section
      id="features"
      className="border-border/30 relative z-10 mx-auto max-w-7xl border-t px-6 py-20"
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.6fr] lg:items-start">
        <div className="font-mono">
          <SectionEyebrow>FEATURES</SectionEyebrow>
          <h2 className="text-foreground max-w-[420px] text-3xl font-bold leading-tight md:text-4xl">
            Everything you need to simulate real APIs
          </h2>
          <p className="text-muted-foreground mt-6 max-w-[430px] text-sm leading-7">
            GhostAPI gives you the tools to build, test, and iterate without waiting for a backend.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="border-border/50 bg-surface/55 rounded-lg border p-6 shadow-2xl shadow-black/20 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 text-primary ring-primary/20 flex size-12 shrink-0 items-center justify-center rounded-md ring-1">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-mono text-sm font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-6">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection(): React.JSX.Element {
  return (
    <section
      id="how-it-works"
      className="border-border/20 from-primary/5 relative z-10 border-y bg-gradient-to-b via-transparent to-transparent px-6 py-20"
    >
      <div className="mx-auto max-w-7xl">
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
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <StepCard
            number="1."
            title="Upload OpenAPI Schema"
            description="Upload your openapi.yaml or JSON file."
            badge={<FileCode2 className="size-4" />}
          >
            <pre className="border-border/40 bg-background/80 text-success h-48 overflow-hidden rounded-md border p-5 text-[11px] leading-5">
              {`openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: OK`}
            </pre>
          </StepCard>

          <StepCard
            number="2."
            title="Configure Behavior"
            description="Control responses, errors, delays, and authentication."
            badge={<Settings2 className="size-4" />}
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
            badge={<Rocket className="size-4" />}
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
    <article className="border-border/50 bg-surface/45 relative rounded-lg border p-6 shadow-2xl shadow-black/20">
      <div className="bg-primary text-primary-foreground shadow-primary/30 absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full shadow-lg">
        {badge}
      </div>
      <div className="mb-6 mt-7 font-mono">
        <h3 className="text-foreground text-sm font-semibold">
          {number} {title}
        </h3>
        <p className="text-muted-foreground mt-4 text-xs leading-6">{description}</p>
      </div>
      {children}
    </article>
  );
}

function CopyField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <div className="text-muted-foreground mb-2 text-[10px]">{label}</div>
      <div className="border-border/40 bg-background/80 text-foreground flex items-center justify-between rounded border px-3 py-2 font-mono text-xs">
        <span className="truncate">{value}</span>
        <Copy className="text-primary ml-3 size-3.5 shrink-0" />
      </div>
    </div>
  );
}

function TestimonialsSection(): React.JSX.Element {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="font-mono">
        <SectionEyebrow>BUILT FOR DEVELOPERS</SectionEyebrow>
        <h2 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
          Why developers love GhostAPI
        </h2>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <article
            key={item.author}
            className="border-border/40 from-surface/80 to-primary/10 relative overflow-hidden rounded-lg border bg-gradient-to-br p-8 shadow-2xl shadow-black/20"
          >
            <Quote className="fill-primary text-primary absolute bottom-6 right-6 size-14 opacity-90" />
            <p className="text-foreground relative z-10 max-w-[280px] font-mono text-sm leading-7">
              {item.quote}
            </p>
            <div className="relative z-10 mt-8 flex items-center gap-3">
              <div className="from-primary to-chart-6 flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white">
                {item.initials}
              </div>
              <div>
                <div className="text-foreground text-sm font-medium">{item.author}</div>
                <div className="text-muted-foreground text-xs">{item.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingSection(): React.JSX.Element {
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
          <div className="border-primary/40 bg-background/70 flex w-fit overflow-hidden rounded-md border p-1 font-mono text-xs">
            <span className="text-muted-foreground px-5 py-2">Monthly</span>
            <span className="bg-primary text-primary-foreground rounded px-5 py-2">
              Yearly (Save 20%)
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {PRICING.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlighted
                  ? 'border-primary/70 bg-surface/70 shadow-primary/10 rounded-lg border p-7 shadow-2xl'
                  : 'border-border/50 bg-surface/55 rounded-lg border p-7 shadow-2xl shadow-black/20'
              }
            >
              <h3 className="text-foreground font-mono text-sm font-semibold">{plan.name}</h3>
              <div className="mt-5 flex items-end gap-2 font-mono">
                <span className="text-foreground text-4xl font-bold">{plan.price}</span>
                {plan.suffix ? (
                  <span className="text-muted-foreground pb-1 text-sm">{plan.suffix}</span>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-5 text-xs leading-6">{plan.description}</p>
              <ul className="text-muted-foreground mt-8 space-y-3 text-xs">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-3.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full font-mono text-xs tracking-[0.08em]" size="sm">
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection(): React.JSX.Element {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
      <div className="border-primary/50 bg-surface/55 shadow-primary/10 relative overflow-hidden rounded-lg border px-8 py-8 shadow-2xl md:px-12">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 80% 50%, rgba(124,77,255,0.55), transparent 30%), linear-gradient(90deg, transparent, rgba(124,77,255,0.12))',
          }}
        />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="font-mono">
            <h2 className="text-foreground text-2xl font-bold leading-tight md:text-3xl">
              Ready to bring your frontend to life?
            </h2>
            <p className="text-muted-foreground mt-4 text-sm">
              Start simulating APIs in seconds. No credit card required.
            </p>
          </div>
          <Button size="lg" className="w-fit font-mono tracking-[0.08em]">
            <span aria-hidden>{'>_'}</span>
            GET STARTED FREE
          </Button>
        </div>
        <Image
          src="/logo/logo-sm.png"
          alt=""
          width={90}
          height={90}
          unoptimized
          className="absolute bottom-4 right-10 hidden opacity-70 md:block"
        />
      </div>
    </section>
  );
}

function FooterSection(): React.JSX.Element {
  return (
    <footer className="border-border/40 relative z-10 border-t px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="GhostAPI">
            <Image
              src="/logo/logo-sm.png"
              alt=""
              width={32}
              height={32}
              unoptimized
              className="size-8"
            />
            <span className="text-lg font-semibold tracking-wider">
              <span className="text-foreground">GHOST</span>
              <span className="text-primary">API</span>
            </span>
          </Link>
          <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-6">
            The developer-first API simulation platform.
          </p>
          <div className="text-muted-foreground mt-6 flex items-center gap-4">
            <Github className="size-5" />
            <Twitter className="size-5" />
            <MessageCircle className="size-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-muted-foreground mb-4 font-mono text-xs font-semibold tracking-[0.16em]">
                {group.title}
              </h3>
              <ul className="text-muted-foreground space-y-3 text-sm">
                {group.links.map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border/30 text-muted-foreground mx-auto mt-10 max-w-7xl border-t pt-6 text-center text-xs">
        © 2024 GhostAPI. All rights reserved.
      </div>
    </footer>
  );
}
