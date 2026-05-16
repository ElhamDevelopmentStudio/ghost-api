import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'Terms of Service | GhostAPI',
  description:
    'GhostAPI terms overview for accounts, projects, uploaded schemas, team access, mock runtime usage, and responsible use.',
};

const TERMS = [
  [
    'Accounts',
    'Users are responsible for maintaining access to their account and for actions performed through authenticated sessions.',
  ],
  [
    'Projects',
    'Project owners control project metadata, schema uploads, settings, invitations, member roles, and destructive project actions.',
  ],
  [
    'Uploaded content',
    'Do not upload schemas, examples, request bodies, or logs that you do not have permission to use in GhostAPI.',
  ],
  [
    'Mock runtime use',
    'The mock runtime is intended for development and testing workflows, not abuse, spam, credential harvesting, or production impersonation.',
  ],
  [
    'Team invitations',
    'Only invite people who should receive access to the project and role selected during invitation.',
  ],
  [
    'Service changes',
    'GhostAPI may evolve product behavior, limits, and public documentation as the project matures.',
  ],
] as const;

export default function TermsOfServicePage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        body="These terms summarize the expectations for using GhostAPI accounts, projects, schemas, mock routes, logs, and team invitations."
        primary={{
          label: 'Contact legal',
          href: 'mailto:legal@ghostapi.dev?subject=Terms%20of%20Service',
        }}
        secondary={{ label: 'Privacy', href: '/privacy-policy' }}
      />

      <PublicSection
        eyebrow="Use"
        title="Product terms"
        body="GhostAPI is a development tool. These terms are written around responsible mock API usage and project ownership."
      >
        <DefinitionList items={TERMS} />
      </PublicSection>
    </PublicPageFrame>
  );
}
