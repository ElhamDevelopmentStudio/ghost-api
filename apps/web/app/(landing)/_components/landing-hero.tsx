import { ConnectionStage } from '@/app/(landing)/_components/connection-stage';
import { FrontendDashboard } from '@/app/(landing)/_components/frontend-dashboard';
import { HeroPitch } from '@/app/(landing)/_components/hero-pitch';
import { LiveApiActivity } from '@/app/(landing)/_components/live-api-activity';

/**
 * Public hero. The pitch sits above the beaming API theater so the motion
 * system is the main first-viewport focus.
 */
export function LandingHero(): React.JSX.Element {
  return (
    <section className="relative min-h-[1220px] overflow-hidden">
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

      <div className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-center px-[42px] pt-6">
        <HeroPitch />

        <div
          className="relative mt-8 hidden min-h-[700px] w-full max-w-[1220px] grid-cols-[320px_minmax(280px,1fr)_410px] gap-8 lg:grid"
          data-theater
        >
          <ConnectionStage />

          <div className="relative z-10">
            <LiveApiActivity />
          </div>

          <div aria-hidden />

          <div className="relative z-10">
            <FrontendDashboard />
          </div>
        </div>
      </div>

      <div className="from-background absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t to-transparent" />
    </section>
  );
}
