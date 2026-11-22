import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';
import { checkRateLimit, tooManyRequests } from '@/app/lib/rateLimit';

function bad(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req) {
  const limit = checkRateLimit(req, 'contact');
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  let body;
  try {
    body = await req.json();
  } catch {
    return bad('Invalid JSON.');
  }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const topic = String(body.topic || '').trim() || 'Other';
  const message = String(body.message || '').trim();
  if (name.length < 2) return bad('Please give your name.');
  if (name.length > 100) return bad('Name too long (100 chars max).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return bad('Please give a valid email.');
  if (topic.length > 60) return bad('Topic too long (60 chars max).');
  if (message.length < 10) return bad('Message needs at least 10 characters.');
  if (message.length > 5000) return bad('Message too long (5000 chars max).');

  const row = await store.appendTo('contact.json', { name, email, topic, message });
  return NextResponse.json({ ok: true, id: row.id });
}
