import { ConnectionStage } from '@/components/landing/connection-stage';
import { FrontendDashboard } from '@/components/landing/frontend-dashboard';
import { HeroPitch } from '@/components/landing/hero-pitch';
import { HeroTerminal } from '@/components/landing/hero-terminal';
import { LiveApiActivity } from '@/components/landing/live-api-activity';
import { SiteHeader } from '@/components/landing/site-header';
import { TrustedBy } from '@/components/landing/trusted-by';

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
            <div
              className="relative hidden h-[760px] flex-1 xl:block"
              data-theater
            >
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
    </main>
  );
}
