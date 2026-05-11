import { ConnectionStage } from '@/app/(landing)/_components/connection-stage';
import { FrontendDashboard } from '@/app/(landing)/_components/frontend-dashboard';
import { HeroPitch } from '@/app/(landing)/_components/hero-pitch';
import { HeroTerminal } from '@/app/(landing)/_components/hero-terminal';
import { LiveApiActivity } from '@/app/(landing)/_components/live-api-activity';

/**
 * Public hero.
 *
 * ≥ 1280px: pitch + terminal on the left, animation theater on the right.
 * < 1280px: theater hides so the copy stays readable.
 */
export function LandingHero(): React.JSX.Element {
  return (
    <section className="relative min-h-screen">
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
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(124,77,255,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--background) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[2000px] px-6 pt-20">
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center xl:flex-row xl:items-start xl:justify-between xl:gap-20">
          <div className="z-20 flex w-full max-w-[400px] flex-col xl:w-[400px] xl:shrink-0">
            <HeroPitch />
            <HeroTerminal />
          </div>

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

      <div className="from-background absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t to-transparent" />
    </section>
  );
}
