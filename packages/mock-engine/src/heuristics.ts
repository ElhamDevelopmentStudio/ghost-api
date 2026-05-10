import { Faker, en, base } from '@faker-js/faker';
import type { FieldSchema } from '@ghostapi/types';

/**
 * Field-name heuristics. The order in this list matters — earlier matches win.
 * Adding a new heuristic? Put it ABOVE more generic ones (e.g. `name` should
 * lose to `firstName`, so put firstName first).
 */
type Heuristic = { match: RegExp; produce: (faker: Faker) => unknown };

const HEURISTICS: Heuristic[] = [
  { match: /^id$|_id$|Id$/, produce: (f) => f.string.uuid() },
  { match: /uuid/i, produce: (f) => f.string.uuid() },
  { match: /email/i, produce: (f) => f.internet.email() },
  { match: /firstName|first_name/i, produce: (f) => f.person.firstName() },
  { match: /lastName|last_name/i, produce: (f) => f.person.lastName() },
  { match: /fullName|full_name|^name$/i, produce: (f) => f.person.fullName() },
  { match: /username|userName|user_name|handle/i, produce: (f) => f.internet.username() },
  { match: /avatar|imageUrl|image_url|photoUrl|photo_url/i, produce: (f) => f.image.avatar() },
  { match: /phone/i, produce: (f) => f.phone.number() },
  { match: /price|amount|cost|total/i, produce: (f) => Number(f.commerce.price()) },
  { match: /url|website|link/i, produce: (f) => f.internet.url() },
  { match: /city/i, produce: (f) => f.location.city() },
  { match: /country/i, produce: (f) => f.location.country() },
  { match: /address|street/i, produce: (f) => f.location.streetAddress() },
  { match: /zip|postal/i, produce: (f) => f.location.zipCode() },
  { match: /title|headline/i, produce: (f) => f.lorem.sentence({ min: 3, max: 6 }) },
  { match: /description|summary|bio/i, produce: (f) => f.lorem.paragraph() },
  {
    match: /createdAt|created_at|updatedAt|updated_at|date|timestamp/i,
    produce: (f) => f.date.recent().toISOString(),
  },
];

const FORMAT_PRODUCERS: Record<string, (faker: Faker) => unknown> = {
  uuid: (f) => f.string.uuid(),
  email: (f) => f.internet.email(),
  hostname: (f) => f.internet.domainName(),
  ipv4: (f) => f.internet.ipv4(),
  ipv6: (f) => f.internet.ipv6(),
  uri: (f) => f.internet.url(),
  url: (f) => f.internet.url(),
  'date-time': (f) => f.date.recent().toISOString(),
  date: (f) => f.date.recent().toISOString().slice(0, 10),
  byte: (f) => Buffer.from(f.lorem.word()).toString('base64'),
};

export function chooseByFieldName(name: string, faker: Faker): unknown | undefined {
  for (const h of HEURISTICS) {
    if (h.match.test(name)) return h.produce(faker);
  }
  return undefined;
}

export function chooseByFormat(schema: FieldSchema, faker: Faker): unknown | undefined {
  if (!schema.format) return undefined;
  const producer = FORMAT_PRODUCERS[schema.format];
  return producer ? producer(faker) : undefined;
}

export function makeFaker(seed?: number | string): Faker {
  const faker = new Faker({ locale: [en, base] });
  if (seed !== undefined) {
    const numericSeed = typeof seed === 'number' ? seed : hash(seed);
    faker.seed(numericSeed);
  }
  return faker;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
