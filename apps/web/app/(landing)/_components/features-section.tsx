import { Card, CardContent } from '@ghostapi/ui';

import { FEATURES } from './constants';
import { SectionEyebrow } from './section-eyebrow';

export function FeaturesSection(): React.JSX.Element {
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
              <Card
                key={feature.title}
                className="border-border/50 bg-surface/55 py-0 shadow-2xl shadow-black/20 backdrop-blur-sm"
              >
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
