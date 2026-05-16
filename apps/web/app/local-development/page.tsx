import type { Metadata } from 'next';

import {
  CodeStrip,
  DefinitionList,
  PageHero,
  PublicSection,
} from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'Local Development | GhostAPI',
  description:
    'Run GhostAPI locally with pnpm, Docker Compose, Prisma, the public web app, protected app, and Hono server.',
};

const PORTS = [
  ['Public web', 'Next.js marketing and documentation site on port 3000.'],
  ['Protected app', 'React/Vite authenticated workspace on port 3002.'],
  ['Server', 'Hono API, auth, project APIs, docs, and mock runtime on port 3001.'],
  ['Storybook', 'Shared UI package documentation and component checks on port 6006.'],
] as const;

const CHECKS = [
  ['Format', 'pnpm format:check'],
  ['Lint', 'pnpm lint'],
  ['Types', 'pnpm typecheck'],
  ['Tests', 'pnpm test'],
  ['Build', 'pnpm build'],
] as const;

export default function LocalDevelopmentPage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Development"
        title="Run the full GhostAPI workspace locally."
        body="GhostAPI is a pnpm/Turborepo workspace with a public Next.js site, protected app, Hono server, Prisma database layer, Redis, shared packages, and UI components."
        primary={{ label: 'Read docs', href: '/docs#development' }}
        secondary={{ label: 'Troubleshooting', href: '/troubleshooting' }}
      />

      <PublicSection
        eyebrow="Setup"
        title="Start from a clean checkout"
        body="These commands assume Docker is available for PostgreSQL and Redis."
      >
        <CodeStrip
          title="Local setup"
          code={`pnpm install
docker compose up -d
pnpm --filter @ghostapi/server prisma:generate
pnpm --filter @ghostapi/server prisma:migrate
pnpm dev`}
        />
      </PublicSection>

      <PublicSection
        eyebrow="Ports"
        title="Services"
        body="Each app owns a distinct local port so public, protected, and API work can run together."
      >
        <DefinitionList items={PORTS} />
      </PublicSection>

      <PublicSection
        eyebrow="Verification"
        title="Checks before shipping"
        body="Use the smallest targeted check first, then run broader checks when the change touches shared behavior."
      >
        <DefinitionList items={CHECKS} />
      </PublicSection>
    </PublicPageFrame>
  );
}
