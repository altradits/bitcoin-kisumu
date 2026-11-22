// Public forms test: concurrent bursts lose zero rows, honeypot fills are
// silently dropped, and Vercel-without-Redis fails loud (503) instead of
// pretending. File backend in a sandbox data dir.
//
// Usage: npm run test:forms
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { register } from 'node:module';

process.chdir(mkdtempSync(path.join(tmpdir(), 'bk-forms-')));
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.VERCEL;

register('./test-shim-loader.mjs', import.meta.url);
const contact = await import(new URL('../app/api/contact/route.js', import.meta.url).href);
const newsletter = await import(new URL('../app/api/newsletter/route.js', import.meta.url).href);
const rsvp = await import(new URL('../app/api/rsvp/route.js', import.meta.url).href);
const { store } = await import(new URL('../app/lib/store.js', import.meta.url).href);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const req = (url, body, ip) => ({
  url,
  headers: { get: (k) => (String(k).toLowerCase() === 'x-forwarded-for' ? ip : null) },
  json: async () => body
});

// 20-way concurrent bursts: every row must land.
const contactBurst = await Promise.all(
  Array.from({ length: 20 }, (_, i) =>
    contact.POST(
      req('http://t/api/contact', {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        topic: 'Other',
        message: 'Hello, this message is long enough.'
      }, `10.3.0.${i + 1}`)
    )
  )
);
check(contactBurst.every((r) => r.status === 200), 'all 20 contact POSTs must 200');
check((await store.readList('contact.json')).length === 20, 'all 20 contact rows must persist');

const newsBurst = await Promise.all(
  Array.from({ length: 20 }, (_, i) =>
    newsletter.POST(req('http://t/api/newsletter', { email: `news${i}@example.com` }, `10.3.1.${i + 1}`))
  )
);
check(newsBurst.every((r) => r.status === 200), 'all 20 newsletter POSTs must 200');
check((await store.readList('newsletter.json')).length === 20, 'all 20 newsletter rows must persist');

// Honeypot: success-shaped replies, zero rows stored.
const hpContact = await contact.POST(
  req('http://t/api/contact', { name: 'Bot', email: 'bot@x.com', message: 'spam spam spam', website: 'http://evil' }, '10.3.9.1')
);
check(hpContact.status === 200, 'honeypot contact must fake success');
const hpNews = await newsletter.POST(req('http://t/api/newsletter', { email: 'bot@x.com', website: 'x' }, '10.3.9.2'));
check(hpNews.status === 200, 'honeypot newsletter must fake success');
const hpRsvp = await rsvp.POST(
  req('http://t/api/rsvp', { eventId: 'meetup-001', name: 'Bot', contact: 'bot@x.com', website: 'x' }, '10.3.9.3')
);
const hpBody = await hpRsvp.json();
check(hpRsvp.status === 200 && hpBody.duplicate === true, 'honeypot rsvp must fake duplicate');
check((await store.readList('contact.json')).length === 20, 'honeypot must store no contact rows');
check((await store.readList('newsletter.json')).length === 20, 'honeypot must store no newsletter rows');
check((await store.readList('rsvps.json')).length === 0, 'honeypot must store no rsvp rows');

// Vercel without Redis: loud 503, never silent loss.
process.env.VERCEL = '1';
const v1 = await contact.POST(
  req('http://t/api/contact', { name: 'Vercel User', email: 'v@x.com', message: 'long enough message here' }, '10.3.9.9')
);
check(v1.status === 503, `Vercel-no-Redis contact must 503, got ${v1.status}`);
const v2 = await newsletter.POST(req('http://t/api/newsletter', { email: 'v@x.com' }, '10.3.9.10'));
check(v2.status === 503, `Vercel-no-Redis newsletter must 503, got ${v2.status}`);
const v3 = await rsvp.POST(
  req('http://t/api/rsvp', { eventId: 'meetup-001', name: 'Vercel User', contact: 'v@x.com' }, '10.3.9.11')
);
check(v3.status === 503, `Vercel-no-Redis rsvp must 503, got ${v3.status}`);
delete process.env.VERCEL;

if (failures.length) {
  console.error(`PUBLIC FORMS TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Public forms test passed: 40/40 rows kept, honeypots dropped, Vercel guard 503s.');
