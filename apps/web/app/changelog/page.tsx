import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';
import { getAppLinks } from '@/app/(landing)/_lib/app-links';

export const metadata: Metadata = {
  title: 'Changelog | GhostAPI',
  description:
    'Track GhostAPI product updates across mock runtime, playground, project settings, team invitations, and public documentation.',
};

const RELEASES = [
  [
    'Project settings',
    'General, environment, mock, schema, members, and danger zone settings are now organized as project-scoped controls with functional save, replace, invite, and destructive confirmation flows.',
  ],
  [
    'Members and invitations',
    'Project owners can invite existing users or invite new people to both GhostAPI and the project, with role-based access applied when the invitation is accepted.',
  ],
  [
    'Playground hardening',
    'Request sending now handles shared headers, duplicate header precedence, multiple request media types, non-JSON bodies, generated cURL, and detailed request/response inspection.',
  ],
  [
    'Mock runtime and logs',
    'Mounted project routes capture request metadata, endpoint matches, response details, retention settings, and runtime cache refreshes for active projects.',
  ],
  [
    'Public documentation',
    'Docs now use the public site header, command search, persistent section navigation, examples, and a structured reference path for builders.',
  ],
] as const;

const NEXT_UP = [
  [
    'More schema tooling',
    'Better diff views, validation explanations, and safer schema replacement previews before applying endpoint changes.',
  ],
  [
    'Richer mock behavior',
    'More response presets, scenario switching, and endpoint-level behavior controls for frontend edge cases.',
  ],
  [
    'Team workflows',
    'Clearer permission surfaces, invite auditing, and project activity around schema and mock changes.',
  ],
] as const;

export default function ChangelogPage(): React.JSX.Element {
  const appLinks = getAppLinks();

  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Changelog"
        title="What changed in GhostAPI."
        body="A concise record of product work that matters to teams using GhostAPI as their mock backend during frontend development."
        primary={{ label: 'Try the latest', href: appLinks.register }}
        secondary={{ label: 'Read docs', href: '/docs' }}
      />

      <PublicSection
        eyebrow="Latest"
        title="Current product updates"
        body="These entries track meaningful workflow changes rather than tiny internal implementation details."
      >
        <DefinitionList items={RELEASES} />
      </PublicSection>

      <PublicSection
        eyebrow="Roadmap"
        title="Next improvements"
        body="The next work should deepen the current REST/OpenAPI product instead of expanding into unrelated protocols."
      >
        <DefinitionList items={NEXT_UP} />
      </PublicSection>
    </PublicPageFrame>
  );
}
