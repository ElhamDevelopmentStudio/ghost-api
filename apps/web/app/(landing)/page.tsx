import { cookies } from 'next/headers';

import { FeaturesSection } from '@/app/(landing)/_components/features-section';
import { FinalCtaSection } from '@/app/(landing)/_components/final-cta-section';
import { FooterSection } from '@/app/(landing)/_components/footer-section';
import { HowItWorksSection } from '@/app/(landing)/_components/how-it-works-section';
import { LandingHero } from '@/app/(landing)/_components/landing-hero';
import { PricingSection } from '@/app/(landing)/_components/pricing-section';
import { SiteHeader } from '@/app/(landing)/_components/site-header';
import { TestimonialsSection } from '@/app/(landing)/_components/testimonials-section';
import { TrustedBy } from '@/app/(landing)/_components/trusted-by';
import { AUTH_COOKIE_NAMES, getAppLinks } from '@/app/(landing)/_lib/app-links';

export default async function HomePage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const isAuthenticated = AUTH_COOKIE_NAMES.some((name) => cookieStore.has(name));
  const appLinks = getAppLinks();

  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <SiteHeader appLinks={appLinks} isAuthenticated={isAuthenticated} />
      <LandingHero appLinks={appLinks} isAuthenticated={isAuthenticated} />

      <section className="relative z-10 mx-auto max-w-7xl">
        <TrustedBy />
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCtaSection appLinks={appLinks} isAuthenticated={isAuthenticated} />
      <FooterSection />
    </main>
  );
}
