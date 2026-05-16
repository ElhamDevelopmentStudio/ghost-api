import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'Privacy Policy | GhostAPI',
  description:
    'GhostAPI privacy policy overview for account data, project metadata, uploaded schemas, request logs, and email invitations.',
};

const PRIVACY_ROWS = [
  [
    'Account data',
    'We use account information to authenticate users, secure sessions, send verification messages, and manage project membership.',
  ],
  [
    'Project data',
    'Project names, descriptions, environments, settings, members, and schema metadata are used to run the workspace experience.',
  ],
  [
    'Uploaded schemas',
    'Uploaded OpenAPI documents are parsed into normalized endpoints so GhostAPI can mount mock routes and generate responses.',
  ],
  [
    'Request logs',
    'Mock runtime logs may include request paths, headers, bodies, response data, status, duration, and endpoint match details for debugging.',
  ],
  [
    'Invitations',
    'Invitation emails use the recipient address, inviter identity, project name, role, and expiration metadata to deliver project access.',
  ],
  [
    'Retention',
    'Project owners can configure activity log retention where the product exposes that setting.',
  ],
] as const;

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        body="This page explains the data GhostAPI needs to operate mock API projects, team invitations, request logs, and account access."
        primary={{
          label: 'Contact legal',
          href: 'mailto:legal@ghostapi.dev?subject=Privacy%20Policy',
        }}
        secondary={{ label: 'Terms', href: '/terms-of-service' }}
      />

      <PublicSection
        eyebrow="Data use"
        title="What GhostAPI handles"
        body="GhostAPI exists to process API contracts and mock traffic, so schema and request data are part of the core product workflow."
      >
        <DefinitionList items={PRIVACY_ROWS} />
      </PublicSection>
    </PublicPageFrame>
  );
}
