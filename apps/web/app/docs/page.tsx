import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { FooterSection } from '@/app/(landing)/_components/footer-section';
import { SiteHeader } from '@/app/(landing)/_components/site-header';
import { AUTH_COOKIE_NAMES, getAppLinks } from '@/app/(landing)/_lib/app-links';
import { publicEnv } from '@/app/env';
import { DocsExperience } from './docs-experience';

export const metadata: Metadata = {
  title: 'GhostAPI Docs',
  description:
    'Complete GhostAPI documentation for OpenAPI imports, mock APIs, playground requests, logs, project settings, members, and backend operations.',
};

export default async function DocsPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const isAuthenticated = AUTH_COOKIE_NAMES.some((name) => cookieStore.has(name));
  const appLinks = getAppLinks();
  const apiDocsUrl = new URL('/docs', publicEnv.NEXT_PUBLIC_API_URL).toString();
  const openApiUrl = new URL('/openapi.json', publicEnv.NEXT_PUBLIC_API_URL).toString();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <SiteHeader appLinks={appLinks} isAuthenticated={isAuthenticated} />
      <DocsExperience
        appLinks={appLinks}
        apiDocsUrl={apiDocsUrl}
        openApiUrl={openApiUrl}
        isAuthenticated={isAuthenticated}
      />
      <FooterSection />
    </main>
  );
}
