import type { Metadata } from 'next';

import { DefinitionList, PageHero, PublicSection } from '@/app/_components/public-page-ui';
import { PublicPageFrame } from '@/app/_components/public-page-frame';

export const metadata: Metadata = {
  title: 'Contact | GhostAPI',
  description: 'Contact GhostAPI for product questions, support, security, and sales.',
};

const CONTACTS = [
  ['Product and support', 'hello@ghostapi.dev'],
  ['Sales and enterprise', 'sales@ghostapi.dev'],
  ['Security reports', 'security@ghostapi.dev'],
  ['Legal', 'legal@ghostapi.dev'],
] as const;

const BEFORE_CONTACTING = [
  [
    'Bug reports',
    'Include the route, project action, browser/server console error, and the smallest reproduction you can share.',
  ],
  [
    'Schema issues',
    'Include the OpenAPI version, the affected path/method, and whether duplicate override was enabled.',
  ],
  [
    'Email delivery',
    'Include sender domain, recipient provider, and whether the message landed in inbox, promotions, or spam.',
  ],
] as const;

export default function ContactPage(): React.JSX.Element {
  return (
    <PublicPageFrame>
      <PageHero
        eyebrow="Contact"
        title="Get the right GhostAPI help faster."
        body="Use the contact path that matches the problem. Clear route names, schema details, and reproduction steps make support much faster."
        primary={{ label: 'Email support', href: 'mailto:hello@ghostapi.dev' }}
        secondary={{ label: 'Read troubleshooting', href: '/troubleshooting' }}
      />

      <PublicSection
        eyebrow="Mailboxes"
        title="Where to send it"
        body="These are direct contact routes for the common public-site needs."
      >
        <DefinitionList items={CONTACTS} />
      </PublicSection>

      <PublicSection
        eyebrow="Context"
        title="What to include"
        body="Good context prevents back-and-forth and keeps debugging scoped."
      >
        <DefinitionList items={BEFORE_CONTACTING} />
      </PublicSection>
    </PublicPageFrame>
  );
}
