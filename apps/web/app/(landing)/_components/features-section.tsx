import { Card, CardContent } from '@ghostapi/ui';

import { FEATURES } from './constants';
import { SectionEyebrow } from './section-eyebrow';

export function FeaturesSection(): React.JSX.Element {
  return (
    <section
      id="features"
      className="border-border/30 relative z-10 mx-auto max-w-7xl border-t px-6 py-24"
    >
      <div
        aria-hidden
        className="from-primary/10 pointer-events-none absolute -top-12 left-1/2 h-72 w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-3xl"
      />

      <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.6fr] lg:items-start">
        <div className="font-mono">
          <SectionEyebrow>FEATURES</SectionEyebrow>
          <h2 className="text-foreground max-w-[420px] text-3xl font-bold leading-tight md:text-4xl">
            Everything you need to{' '}
            <span className="from-primary via-primary/90 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
              simulate real APIs
            </span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-[430px] text-sm leading-7">
            GhostAPI gives you the tools to build, test, and iterate without waiting for a backend.
          </p>

          <div className="text-muted-foreground/80 mt-10 flex flex-col gap-2 font-mono text-[11px] tracking-[0.08em]">
            <div className="flex items-center gap-2">
              <span className="bg-primary/70 size-1.5 rounded-full" />
              <span>SCHEMA-FIRST</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/70 size-1.5 rounded-full" />
              <span>ZERO BACKEND</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/70 size-1.5 rounded-full" />
              <span>SHIP IN SECONDS</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const id = String(index + 1).padStart(2, '0');
            return (
              <Card
                key={feature.title}
                className="border-border/50 bg-surface/55 hover:border-primary/40 hover:bg-surface/75 group relative overflow-hidden py-0 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-12px_rgba(124,77,255,0.45)]"
              >
                <div
                  aria-hidden
                  className="from-primary/40 via-primary/10 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(124,77,255,0.25) 0%, transparent 70%)',
                  }}
                />
                <CardContent className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div
                        aria-hidden
                        className="from-primary/30 to-primary/0 absolute inset-0 rounded-md bg-gradient-to-br opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <div className="bg-primary/20 text-primary ring-primary/20 group-hover:ring-primary/40 relative flex size-12 items-center justify-center rounded-md ring-1 transition-all duration-300 group-hover:scale-[1.04]">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-foreground font-mono text-sm font-semibold">
                          {feature.title}
                        </h3>
                        <span className="text-muted-foreground/60 group-hover:text-primary/70 font-mono text-[10px] tracking-[0.15em] transition-colors">
                          {id}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-xs leading-6">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
