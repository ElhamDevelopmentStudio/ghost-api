import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';
import { getAppLinks } from '@/app/(landing)/_lib/app-links';

import { PricingPageClient } from './pricing-page-client';

export const metadata: Metadata = {
  title: 'Pricing | GhostAPI',
  description:
    'GhostAPI pricing for individual developers, teams, and organizations using contract-driven mock APIs.',
};

const INCLUDED = [
  [
    'Schema-based mocks',
    'All plans use OpenAPI imports, normalized endpoints, and mounted mock routes.',
  ],
  [
    'Playground',
    'Send requests with params, headers, bodies, media types, auth simulation, and cURL output.',
  ],
  [
    'Project settings',
    'Manage environments, mock defaults, schema replacement, members, and cleanup actions.',
  ],
  [
    'No lock-in',
    'Generated mock URLs work with normal HTTP clients, frontend apps, and terminal cURL.',
  ],
] as const;

export default function PricingPage(): React.JSX.Element {
  const appLinks = getAppLinks();

  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Pricing"
        title="Start free, scale when mocks become team infrastructure."
        body="The pricing model is intentionally simple: use GhostAPI for local and team workflows, then upgrade when project count, request volume, and collaboration needs grow."
        primary={{ label: 'Create free account', href: appLinks.register }}
        secondary={{ label: 'Compare features', href: '#plans' }}
      />

      <PublicSection
        eyebrow="Plans"
        title="Choose the workspace size"
        body="Every tier keeps the same contract-driven runtime. Higher tiers expand project, traffic, and collaboration capacity."
      >
        <div id="plans">
          <PricingPageClient appLinks={appLinks} />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Included"
        title="Core product in every plan"
        body="The free tier is meant to be useful, not a screenshot-only demo."
      >
        <DefinitionList items={INCLUDED} />
      </PublicSection>
    </PublicPageFrame>
  );
}
