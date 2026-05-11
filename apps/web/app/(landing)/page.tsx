import { FeaturesSection } from '@/app/(landing)/_components/features-section';
import { FinalCtaSection } from '@/app/(landing)/_components/final-cta-section';
import { FooterSection } from '@/app/(landing)/_components/footer-section';
import { HowItWorksSection } from '@/app/(landing)/_components/how-it-works-section';
import { LandingHero } from '@/app/(landing)/_components/landing-hero';
import { PricingSection } from '@/app/(landing)/_components/pricing-section';
import { SiteHeader } from '@/app/(landing)/_components/site-header';
import { TestimonialsSection } from '@/app/(landing)/_components/testimonials-section';
import { TrustedBy } from '@/app/(landing)/_components/trusted-by';

export default function HomePage(): React.JSX.Element {
  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <SiteHeader />
      <LandingHero />

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
