import { RiDoubleQuotesL } from '@remixicon/react';

import { Card, CardContent } from '@ghostapi/ui';

import { TESTIMONIALS } from './constants';
import { SectionEyebrow } from './section-eyebrow';

export function TestimonialsSection(): React.JSX.Element {
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
          <Card
            key={item.author}
            className="border-border/40 from-surface/80 to-primary/10 relative overflow-hidden bg-gradient-to-br py-0 shadow-2xl shadow-black/20"
          >
            <CardContent className="p-8">
              <RiDoubleQuotesL className="fill-primary text-primary absolute bottom-6 right-6 size-14 opacity-90" />
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
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
