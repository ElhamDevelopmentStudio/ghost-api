import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'License | GhostAPI',
  description: 'GhostAPI license and usage overview for the public site, product, and repository.',
};

const LICENSE_ROWS = [
  [
    'Public site content',
    'GhostAPI brand, copy, design, and public website content are reserved unless a separate written license says otherwise.',
  ],
  [
    'Product access',
    'Use of hosted or local GhostAPI product features is governed by the applicable product terms and project permissions.',
  ],
  [
    'Repository code',
    'No top-level LICENSE file is currently present in this repository. Treat source code as all rights reserved unless the repository adds an explicit license file.',
  ],
  [
    'Third-party packages',
    'Dependencies retain their own licenses. Review package metadata before redistributing bundled output.',
  ],
  [
    'Questions',
    'For licensing questions, contact legal@ghostapi.dev with the intended use and redistribution context.',
  ],
] as const;

export default function LicensePage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Legal"
        title="License"
        body="This page explains how to interpret GhostAPI website, product, repository, and dependency licensing at a high level."
        primary={{ label: 'Contact legal', href: 'mailto:legal@ghostapi.dev?subject=License' }}
        secondary={{ label: 'Terms', href: '/terms-of-service' }}
      />

      <PublicSection
        eyebrow="Scope"
        title="License notes"
        body="Licensing should be explicit. When in doubt, ask before redistributing source, brand assets, or product content."
      >
        <DefinitionList items={LICENSE_ROWS} />
      </PublicSection>
    </PublicPageFrame>
  );
}
