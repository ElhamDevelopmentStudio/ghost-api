import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  RiCodeLine,
  RiDatabase2Line,
  RiFileTextLine,
  RiHeartLine,
  RiServerLine,
  RiTerminalLine,
  RiEqualizerLine,
  RiFlashlightLine,
} from '@remixicon/react';

import { cn } from '@ghostapi/ui';

import { useAuth } from '@/features/auth';

type AuthMode = 'login' | 'register' | 'recovery';

const FOOTER_LINKS = ['Docs', 'GitHub', 'Status', 'Privacy', 'Terms'] as const;

export function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const mode = getAuthMode(location.pathname);

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="text-foreground relative min-h-screen overflow-x-hidden bg-[#030408]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,77,255,0.18),transparent_22%),radial-gradient(circle_at_82%_6%,rgba(124,77,255,0.08),transparent_18%),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:auto,auto,40px_40px,40px_40px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(124,77,255,0.75)_1px,transparent_1px)] [background-size:18px_18px]" />

      <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[47.25%_52.75%]">
        <section className="border-border-subtle hidden min-h-screen border-r px-16 py-12 lg:flex lg:flex-col xl:px-[76px]">
          <AuthBrand />
          <div className="flex flex-1 flex-col justify-center py-8">
            <SidePanel mode={mode} />
          </div>
        </section>

        <section
          className={cn(
            'flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:items-start lg:px-12',
            mode === 'register' && 'lg:pt-[74px]',
            mode === 'login' && 'lg:pt-[142px]',
            mode === 'recovery' && 'lg:pt-[120px]',
          )}
        >
          <div className="w-full max-w-[590px]">
            <div className="mb-8 lg:hidden">
              <AuthBrand />
            </div>
            <Outlet />
          </div>
        </section>
      </main>

      <footer className="border-border-subtle text-muted-foreground relative flex min-h-[88px] flex-col gap-4 border-t px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-14">
        <span>© 2024 GhostAPI. All rights reserved.</span>
        <nav className="flex flex-wrap gap-8 sm:gap-12">
          {FOOTER_LINKS.map((item) => (
            <a key={item} href="#" className="hover:text-foreground transition">
              {item}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function AuthBrand() {
  return (
    <Link to="/login" className="inline-flex items-center gap-3">
      <img src="/logo/logo-sm.png" alt="" className="size-12" />
      <span className="font-mono text-[32px] font-bold uppercase leading-none tracking-tight text-white">
        GHOST<span className="text-primary">API</span>
      </span>
    </Link>
  );
}

function SidePanel({ mode }: { mode: AuthMode }) {
  const isRegister = mode === 'register';

  return (
    <div className="relative max-w-[620px]">
      <DecorativeMarks variant={mode} />
      <h1 className="font-mono text-[34px] font-medium uppercase leading-[1.42] tracking-[0] text-white xl:text-[38px]">
        {isRegister ? (
          <>
            BUILD FRONTENDS.
            <br />
            NOT <span className="text-primary">ROADBLOCKS._</span>
          </>
        ) : (
          <>
            SHIP FASTER.
            <br />
            TEST SMARTER.
            <br />
            <span className="text-primary">STAY UNBLOCKED._</span>
          </>
        )}
      </h1>

      <p className="mt-7 max-w-[560px] font-mono text-[17px] leading-7 text-zinc-300">
        {isRegister
          ? 'GhostAPI gives you a fully working fake backend from your OpenAPI schema in seconds. Ship faster. Test better. Stay unblocked.'
          : 'GhostAPI turns your OpenAPI schema into a fully working mock backend in seconds. No waiting. No dependencies. Just APIs.'}
      </p>

      <TerminalCommand />
      <FlowDiagram compact={isRegister} />
      {isRegister ? <RegisterFeatureList /> : <LoginFeatureList />}
      {!isRegister ? <Quote /> : null}
    </div>
  );
}

function DecorativeMarks({ variant }: { variant: AuthMode }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <span
        className={cn(
          'text-primary absolute font-mono text-2xl',
          variant === 'register' ? 'right-4 top-0' : 'right-2 top-2',
        )}
      >
        +
      </span>
      <span className="text-primary absolute right-20 top-24 font-mono text-2xl">+</span>
      <span className="text-primary absolute bottom-8 right-8 font-mono text-2xl">+</span>
      <span className="border-primary/70 absolute right-14 top-4 hidden size-28 border border-b-0 md:block" />
    </div>
  );
}

function TerminalCommand() {
  return (
    <div className="border-border-strong mt-8 w-full max-w-[520px] rounded-md border bg-black/35 px-4 py-3 font-mono text-[15px] leading-7 shadow-[0_0_40px_rgba(124,77,255,0.06)]">
      <div>
        <span className="text-emerald-400">$</span>{' '}
        <span className="text-white">ghostapi start </span>
        <span className="text-primary">--schema</span>{' '}
        <span className="text-zinc-300">openapi.yaml</span>
      </div>
      <div>
        <span className="text-emerald-400">✓</span>{' '}
        <span className="text-zinc-300">Mock server running at </span>
        <span className="text-emerald-400">http://localhost:4010</span>
      </div>
    </div>
  );
}

function FlowDiagram({ compact }: { compact: boolean }) {
  const items = compact
    ? [
        { label: 'your schema', icon: RiFileTextLine },
        { label: 'ghostapi', brand: true },
        { label: 'mock API', icon: RiServerLine },
        { label: 'your frontend', icon: RiHeartLine },
      ]
    : [
        { label: 'openapi.yaml', icon: RiFileTextLine },
        { label: 'ghostapi', brand: true },
        { label: 'live mock api', icon: RiServerLine },
        { label: 'your frontend', icon: RiCodeLine },
      ];

  return (
    <div className="mt-8 grid grid-cols-[1fr_34px_1fr_34px_1fr_34px_1fr] items-center">
      {items.map((item, index) => {
        const Icon = 'icon' in item ? item.icon : null;
        return (
          <div key={item.label} className="contents">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-[78px] items-center justify-center">
                {item.brand ? (
                  <img src="/logo/logo-sm.png" alt="" className="size-[66px]" />
                ) : Icon ? (
                  <div className="border-border-strong flex size-[72px] items-center justify-center rounded-[5px] border bg-black/10">
                    <Icon className="size-10 text-zinc-200" strokeWidth={1.5} />
                  </div>
                ) : null}
              </div>
              <span className="font-mono text-[14px] text-zinc-200">{item.label}</span>
            </div>
            {index < items.length - 1 ? (
              <span className="text-center text-4xl text-zinc-300">→</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function LoginFeatureList() {
  const items = [
    ['Realistic mock data', '// auto generated'],
    ['Simulate latency & errors', '// built-in'],
    ['Auth & protected routes', '// easy'],
    ['Built-in playground', '// test instantly'],
    ['Request logs', '// in real time'],
  ] as const;

  return (
    <div className="border-border-strong border-l-primary bg-black/28 mt-8 max-w-[630px] rounded-md border px-5 py-4 font-mono text-[15px]">
      {items.map(([label, hint]) => (
        <div key={label} className="grid grid-cols-[20px_1fr_190px] gap-2 leading-7">
          <span className="text-primary">&gt;</span>
          <span className="text-zinc-100">{label}</span>
          <span className="text-zinc-500">{hint}</span>
        </div>
      ))}
    </div>
  );
}

function RegisterFeatureList() {
  const items = [
    {
      icon: RiFlashlightLine,
      title: 'Instant mock APIs',
      description: 'Generate working endpoints in seconds.',
    },
    {
      icon: RiDatabase2Line,
      title: 'Realistic data',
      description: 'Auto-generated responses that look real.',
    },
    {
      icon: RiEqualizerLine,
      title: 'Full control',
      description: 'Simulate latency, errors, auth and more.',
    },
    {
      icon: RiTerminalLine,
      title: 'Built-in playground',
      description: 'Test your APIs right inside GhostAPI.',
    },
  ] as const;

  return (
    <div className="border-border-subtle mt-8 max-w-[610px] border-t">
      {items.map(({ icon: Icon, title, description }) => (
        <div key={title} className="border-border-subtle flex items-center gap-4 border-b py-3">
          <div className="border-border-subtle text-primary flex size-14 items-center justify-center rounded-md border bg-black/25">
            <Icon className="size-7" />
          </div>
          <div>
            <h2 className="font-mono text-[16px] font-semibold text-white">{title}</h2>
            <p className="mt-1 font-mono text-[14px] text-zinc-400">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Quote() {
  return (
    <div className="border-primary/75 text-primary mx-auto mt-12 w-[460px] border-x py-4 text-center font-mono text-[16px] leading-6">
      “The fastest way to simulate
      <br />
      real APIs for frontend development.”
    </div>
  );
}

function getAuthMode(pathname: string): AuthMode {
  if (pathname.includes('register')) return 'register';
  if (pathname.includes('forgot') || pathname.includes('reset') || pathname.includes('verify')) {
    return 'recovery';
  }
  return 'login';
}
