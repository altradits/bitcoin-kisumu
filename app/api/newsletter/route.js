import { NextResponse } from 'next/server';
import { store, StorageUnavailable } from '@/app/lib/store';
import { checkRateLimit, tooManyRequests } from '@/app/lib/rateLimit';

export async function POST(req) {
  const limit = await checkRateLimit(req, 'newsletter');
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  if (String(body.website || '').trim() !== '') {
    return NextResponse.json({ ok: true }); // honeypot: pretend success, store nothing
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please give a valid email.' }, { status: 400 });
  }
  const existing = await store.readList('newsletter.json');
  if (existing.some((r) => String(r.email || '').toLowerCase() === email)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  try {
    const row = await store.appendTo('newsletter.json', { email });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    if (err instanceof StorageUnavailable) return NextResponse.json({ error: err.message }, { status: 503 });
    throw err;
  }
}
