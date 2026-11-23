import { NextResponse } from 'next/server';
import { store, StorageUnavailable } from '@/app/lib/store';
import { checkRateLimit, tooManyRequests } from '@/app/lib/rateLimit';

export const INTERESTS = ['tour', 'guild', 'workshop', 'merch', 'ecosystem', 'art'];

function bad(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req) {
  const limit = await checkRateLimit(req, 'inquiries');
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  let body;
  try {
    body = await req.json();
  } catch {
    return bad('Invalid JSON.');
  }
  if (String(body.website || '').trim() !== '') {
    return NextResponse.json({ ok: true }); // honeypot: pretend success, store nothing
  }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const interest = String(body.interest || '').trim();
  const message = String(body.message || '').trim();
  if (name.length < 2) return bad('Please give your name.');
  if (name.length > 100) return bad('Name too long (100 chars max).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return bad('Please give a valid email.');
  if (!INTERESTS.includes(interest)) return bad('Please pick what you are interested in.');
  if (message.length < 10) return bad('Message needs at least 10 characters.');
  if (message.length > 5000) return bad('Message too long (5000 chars max).');
  try {
    const row = await store.appendTo('inquiries.json', { name, email, interest, message });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    if (err instanceof StorageUnavailable) return NextResponse.json({ error: err.message }, { status: 503 });
    throw err;
  }
}
