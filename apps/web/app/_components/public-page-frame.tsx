import { cookies } from 'next/headers';

import { FooterSection } from '@/app/(landing)/_components/footer-section';
import { SiteHeader } from '@/app/(landing)/_components/site-header';
import { AUTH_COOKIE_NAMES, getAppLinks } from '@/app/(landing)/_lib/app-links';

type PublicPageFrameProps = {
  children: React.ReactNode;
};

export async function PublicPageFrame({
  children,
}: PublicPageFrameProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const isAuthenticated = AUTH_COOKIE_NAMES.some((name) => cookieStore.has(name));
  const appLinks = getAppLinks();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <SiteHeader appLinks={appLinks} isAuthenticated={isAuthenticated} />
      {children}
      <FooterSection />
    </main>
  );
}
