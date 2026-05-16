import type { Metadata } from 'next';

import {
  CodeStrip,
  DefinitionList,
  PageHero,
  ProofList,
  PublicSection,
} from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';
import { getAppLinks } from '@/app/(landing)/_lib/app-links';

export const metadata: Metadata = {
  title: 'How It Works | GhostAPI',
  description:
    'Learn how GhostAPI turns OpenAPI schemas into mounted mock routes, editable responses, logs, and a browser request playground.',
};

const PIPELINE = [
  [
    '1. Upload the contract',
    'Import OpenAPI 3.x JSON or YAML. GhostAPI validates it, dereferences what it can, and stores the normalized project model instead of leaking raw OpenAPI structures into the runtime.',
  ],
  [
    '2. Mount runnable routes',
    'Each normalized endpoint becomes an HTTP route under /mock/{projectId}. Path params, query params, headers, request bodies, response statuses, and media types stay attached to the endpoint.',
  ],
  [
    '3. Shape behavior',
    'Use settings and endpoint controls to choose environments, shared headers, latency, saved responses, content types, and auth-oriented test cases.',
  ],
  [
    '4. Test from the Playground',
    'Send real requests from the browser, inspect status, headers, body, duration, request metadata, and copy the generated cURL for your own terminal.',
  ],
  [
    '5. Debug from activity',
    'Every request can be traced through logs, so frontend failures are connected to the exact method, path, headers, payload, response, and match result.',
  ],
] as const;

const GUARANTEES = [
  'Schema uploads add new endpoints and preserve existing duplicates unless override is enabled.',
  'The mock runtime uses project environments and shared headers instead of one-off hardcoded routes.',
  'Request body support covers JSON, text, form-like, binary-safe, and multiple media type choices.',
  'Project members receive role-based access, and invited users can join the platform through the invitation flow.',
] as const;

export default function HowItWorksPage(): React.JSX.Element {
  const appLinks = getAppLinks();

  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="How it works"
        title="From schema upload to frontend traffic in one loop."
        body="GhostAPI is built around the same workflow frontend teams already use: import the backend contract, run the routes, test the UI against real HTTP, then adjust mock behavior as the product changes."
        primary={{ label: 'Start a project', href: appLinks.register }}
        secondary={{ label: 'Open docs', href: '/docs' }}
      />

      <PublicSection
        eyebrow="Pipeline"
        title="The runtime path"
        body="The important detail is that the mock server is generated from normalized endpoints, not static fixtures."
      >
        <DefinitionList items={PIPELINE} />
      </PublicSection>

      <PublicSection
        eyebrow="Contract behavior"
        title="What stays reliable"
        body="These rules keep schema updates, mock calls, and team access predictable."
      >
        <ProofList items={GUARANTEES} />
      </PublicSection>

      <PublicSection
        eyebrow="Request flow"
        title="A typical frontend call"
        body="Your application calls the mounted mock URL exactly like it would call a real backend."
      >
        <CodeStrip
          title="Frontend request"
          code={`const response = await fetch(
  "http://localhost:3001/mock/{projectId}/users/42",
  {
    headers: {
      authorization: "Bearer local-dev-token",
      "x-environment": "development"
    }
  }
);

const user = await response.json();`}
        />
      </PublicSection>
    </PublicPageFrame>
  );
}
