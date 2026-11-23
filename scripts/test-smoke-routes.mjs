// Full-site smoke test over the production build: every prerendered public
// route carries a unique <title>, no TODO leaks into public HTML, and the
// manifest, robots, sitemap and Nostr proof are present and valid.
// Needs `npm run build` first; skips green without .next output.
//
// Usage: npm run test:smoke
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const APP = path.join(process.cwd(), '.next/server/app');
if (!existsSync(APP)) {
  console.log('SKIP test:smoke: no .next build output (run npm run build first).');
  process.exit(0);
}

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

const pages = readdirSync(APP).filter((f) => f.endsWith('.html'));
check(pages.length > 10, `expected 10+ prerendered pages, found ${pages.length}`);
const titles = new Map();
for (const f of pages) {
  const html = readFileSync(path.join(APP, f), 'utf8');
  const m = html.match(/<title>([^<]*)<\/title>/);
  check(Boolean(m && m[1].trim()), `${f} must have a non-empty <title>`);
  if (m) {
    check(!/create next app/i.test(m[1]), `${f} has a generic fallback title`);
    const key = m[1].trim();
    check(!titles.has(key), `duplicate <title> ${JSON.stringify(key)} on ${f} (also ${titles.get(key)})`);
    titles.set(key, f);
  }
  check(!html.includes('TODO'), `${f} leaks a literal TODO into public HTML`);
}

// Manifest / robots / sitemap execute and return sane shapes.
const manifest = await import(new URL('../app/manifest.js', import.meta.url).href);
const man = manifest.default();
for (const [k, v] of [['name', 'Bitcoin Kisumu'], ['short_name', 'BTC Kisumu'], ['theme_color', '#0a1931'], ['background_color', '#ffffff'], ['display', 'standalone']]) {
  check(man[k] === v, `manifest.${k} must be ${v}`);
}
check(Array.isArray(man.icons) && man.icons.length > 0 && man.icons[0].src === '/logo-mark.svg', 'manifest icon wrong');

const robots = await import(new URL('../app/robots.js', import.meta.url).href);
const rob = robots.default();
check(Array.isArray(rob.rules) && rob.rules.length > 0, 'robots needs rules');
check(typeof rob.sitemap === 'string' && rob.sitemap.endsWith('/sitemap.xml'), 'robots needs sitemap URL');

const sitemap = await import(new URL('../app/sitemap.js', import.meta.url).href);
const urls = sitemap.default();
check(Array.isArray(urls) && urls.length >= 15, `sitemap must list 15+ routes, got ${urls.length}`);
for (const want of ['/', '/donate', '/sw', '/verify', '/merchants', '/resources/field-kit']) {
  check(urls.some((u) => u.url === `https://bitcoin-kisumu.vercel.app${want === '/' ? '' : want}`), `sitemap missing ${want}`);
}

// Nostr NIP-05 proof parses with valid 64-hex mappings.
const nostr = JSON.parse(readFileSync(path.join(process.cwd(), 'public/.well-known/nostr.json'), 'utf8'));
for (const name of ['_', 'bitcoinkisumu']) {
  check(/^[0-9a-f]{64}$/.test(nostr.names?.[name] || ''), `nostr.json names.${name} must be 64-hex`);
}

if (failures.length) {
  console.error(`SMOKE TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log(`Smoke test passed: ${pages.length} pages titled + unique, no TODO leaks, manifest/robots/sitemap/nostr valid.`);
