// Test-only module loader: maps next/server to a shim and @/ to repo files,
// so the real route + store run in plain Node against a sandbox data dir.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

export async function resolve(specifier, context, next) {
  if (specifier === 'next/server') {
    return {
      url: pathToFileURL(path.join(ROOT, 'scripts/rsvp-next-shim.mjs')).href,
      shortCircuit: true
    };
  }
  if (specifier.startsWith('@/')) {
    let rel = specifier.slice(2);
    if (!path.extname(rel)) rel += '.js';
    return {
      url: pathToFileURL(path.join(ROOT, rel)).href,
      shortCircuit: true
    };
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !path.extname(specifier)) {
    return next(specifier + '.js', context);
  }
  return next(specifier, context);
}
