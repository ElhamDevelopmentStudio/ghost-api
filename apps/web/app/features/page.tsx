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
  title: 'Features | GhostAPI',
  description:
    'Explore GhostAPI features for OpenAPI imports, mock APIs, request playgrounds, logs, settings, and team collaboration.',
};

const FEATURE_ROWS = [
  [
    'OpenAPI import',
    'Upload OpenAPI 3.x JSON or YAML and turn paths, methods, params, bodies, responses, tags, servers, and security metadata into a normalized project model.',
  ],
  [
    'Runnable mock runtime',
    'Every generated endpoint is mounted under /mock/{projectId}, so your frontend can call real HTTP URLs instead of waiting for backend routes.',
  ],
  [
    'Full request Playground',
    'Browse endpoints, set params, shared headers, media types, request bodies, auth simulation, and inspect response status, headers, body, and cURL.',
  ],
  [
    'Editable responses',
    'Save response bodies per status and content type while keeping generated schema-aware responses as fallback.',
  ],
  [
    'Activity logs',
    'Capture method, path, headers, request body, response body, status, duration, and endpoint match for debugging frontend traffic.',
  ],
  [
    'Project settings',
    'Manage environments, shared headers, mock defaults, schema replacement, members, and destructive actions in one project scope.',
  ],
] as const;

const WORKFLOWS = [
  'Build a frontend before the backend endpoint exists.',
  'Test loading, error, auth, empty, and edge-case states on demand.',
  'Share a stable mock API with teammates through project membership.',
  'Replace an updated schema without losing local mock edits unless override is enabled.',
  'Inspect exactly what the frontend sent when a request fails.',
] as const;

export default function FeaturesPage(): React.JSX.Element {
  const appLinks = getAppLinks();

  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Features"
        title="Everything needed to simulate a real REST backend."
        body="GhostAPI is not a static mock server. It is a contract-driven workspace for generating endpoints, shaping responses, exercising frontend states, and debugging traffic."
        primary={{ label: 'Create project', href: appLinks.register }}
        secondary={{ label: 'Read docs', href: '/docs' }}
      />

      <PublicSection
        eyebrow="Capability map"
        title="Feature surface"
        body="The product is organized around the flow from schema import to frontend testing."
      >
        <DefinitionList items={FEATURE_ROWS} />
      </PublicSection>

      <PublicSection
        eyebrow="Use cases"
        title="What it helps you do"
        body="These are the jobs GhostAPI should make faster for a frontend team."
      >
        <ProofList items={WORKFLOWS} />
      </PublicSection>

      <PublicSection
        eyebrow="Example"
        title="Call a generated mock route"
        body="Generated routes are normal HTTP endpoints under the project runtime."
      >
        <CodeStrip
          title="Mock request"
          code={`curl -X POST "http://localhost:3001/mock/{projectId}/auth/login" \\
  -H "content-type: application/json" \\
  -H "authorization: Bearer your_token" \\
  --data '{"email":"user@example.com"}'`}
        />
      </PublicSection>
    </PublicPageFrame>
  );
}
