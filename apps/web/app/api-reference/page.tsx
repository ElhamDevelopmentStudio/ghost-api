import type { Metadata } from 'next';

import {
  CodeStrip,
  DefinitionList,
  PageHero,
  PublicSection,
} from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';
import { publicEnv } from '@/app/env';

export const metadata: Metadata = {
  title: 'API Reference | GhostAPI',
  description:
    'GhostAPI API reference entry point for backend routes, OpenAPI JSON, Scalar docs, mock runtime routes, and authenticated project APIs.',
};

const REFERENCE_LINKS = [
  [
    'Interactive API docs',
    'Use the backend Scalar route for exact request and response contracts.',
  ],
  ['OpenAPI JSON', 'Download the backend OpenAPI document for generated clients or inspection.'],
  ['Mock runtime', 'Generated mock endpoints live under /mock/{projectId}/{path}.'],
  [
    'Authenticated project APIs',
    'Project, schema, settings, member, and log routes require an authenticated GhostAPI session.',
  ],
] as const;

const ROUTE_FAMILIES = [
  [
    'Auth',
    'Register, login, refresh, logout, CSRF, password reset, verification, and invitation acceptance.',
  ],
  ['Projects', 'Create, read, update, delete, configure, and list project-owned resources.'],
  ['Schemas', 'Upload, validate, replace, version, and inspect OpenAPI schemas.'],
  ['Members', 'Invite users, preview recipients, accept invitations, and manage project roles.'],
  [
    'Mock runtime',
    'Serve generated routes, saved responses, generated responses, request logs, and runtime behavior.',
  ],
] as const;

export default function ApiReferencePage(): React.JSX.Element {
  const apiDocsUrl = new URL('/docs', publicEnv.NEXT_PUBLIC_API_URL).toString();
  const openApiUrl = new URL('/openapi.json', publicEnv.NEXT_PUBLIC_API_URL).toString();

  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Reference"
        title="Exact backend contracts live in the API reference."
        body="This page explains where to find the source-of-truth contracts and how the public mock runtime URL shape maps to generated project endpoints."
        primary={{ label: 'Open API docs', href: apiDocsUrl }}
        secondary={{ label: 'OpenAPI JSON', href: openApiUrl }}
      />

      <PublicSection
        eyebrow="Entry points"
        title="Reference surfaces"
        body="Use the interactive backend reference for exact schemas. Use this page for orientation."
      >
        <DefinitionList items={REFERENCE_LINKS} />
      </PublicSection>

      <PublicSection
        eyebrow="Route map"
        title="Backend families"
        body="The application API is grouped by product capability rather than raw database tables."
      >
        <DefinitionList items={ROUTE_FAMILIES} />
      </PublicSection>

      <PublicSection
        eyebrow="Example"
        title="Mock runtime URL"
        body="Project mock routes are normal HTTP URLs and can be called by frontend code or cURL."
      >
        <CodeStrip
          title="Mock route"
          code={`curl "http://localhost:3001/mock/{projectId}/users/42" \\
  -H "authorization: Bearer dev-token"`}
        />
      </PublicSection>
    </PublicPageFrame>
  );
}
