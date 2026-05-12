import Image from 'next/image';

import { Button, Card, CardContent } from '@ghostapi/ui';

import type { AppLinks } from '@/app/(landing)/_lib/app-links';

type FinalCtaSectionProps = {
  appLinks: AppLinks;
  isAuthenticated: boolean;
};

export function FinalCtaSection({
  appLinks,
  isAuthenticated,
}: FinalCtaSectionProps): React.JSX.Element {
  const primaryHref = isAuthenticated ? appLinks.dashboard : appLinks.register;
  const primaryLabel = isAuthenticated ? 'OPEN DASHBOARD' : 'GET STARTED FREE';

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
      <Card className="border-primary/50 bg-surface/55 shadow-primary/10 relative overflow-hidden py-0 shadow-2xl">
        <CardContent className="px-8 py-8 md:px-12">
          <div
            aria-hidden
            className="bg-landing-final-cta-aura absolute inset-y-0 right-0 w-1/2 opacity-80"
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
            <Button asChild size="lg" className="w-fit font-mono tracking-[0.08em]">
              <a href={primaryHref}>
                <span aria-hidden>{'>_'}</span>
                {primaryLabel}
              </a>
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
        </CardContent>
      </Card>
    </section>
  );
}
