import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'Troubleshooting | GhostAPI',
  description:
    'Fix common GhostAPI local development, Prisma migration, schema upload, email, and mock route issues.',
};

const ISSUES = [
  [
    'Prisma column does not exist',
    'Run the server migration command after pulling schema changes: pnpm --filter @ghostapi/server prisma:migrate. Regenerate Prisma if the client is stale.',
  ],
  [
    'Mock route returns 404',
    'Confirm the project runtime is live, the request path matches the uploaded schema, and the URL starts with /mock/{projectId}.',
  ],
  [
    'Schema upload created duplicate endpoints',
    'Use the override duplicates option only when the uploaded schema should replace existing endpoint definitions. Leave it off to keep existing duplicates and add only new endpoints.',
  ],
  [
    'Invitation email went to spam',
    'Use a verified sender domain with SPF, DKIM, and DMARC configured. Keep invitation copy concise and avoid misleading sender names.',
  ],
  [
    'Docs or public pages fail after build/dev overlap',
    'Stop the dev server, remove apps/web/.next, and rebuild. Next dev and build should not mutate the same generated output at the same time.',
  ],
] as const;

export default function TroubleshootingPage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Troubleshooting"
        title="Fix the failures that block local mock API work."
        body="Most GhostAPI issues fall into a small set of causes: missing migrations, stale generated clients, incorrect mock URLs, schema replacement choices, or local dev-server cache conflicts."
        primary={{ label: 'Local development', href: '/local-development' }}
        secondary={{ label: 'Open docs', href: '/docs#troubleshooting' }}
      />

      <PublicSection
        eyebrow="Common issues"
        title="Fast diagnosis"
        body="Start with the symptom, then apply the narrowest fix before changing unrelated project state."
      >
        <DefinitionList items={ISSUES} />
      </PublicSection>
    </PublicPageFrame>
  );
}
