import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please give a valid email.' }, { status: 400 });
  }
  const existing = await store.readList('newsletter.json');
  if (existing.some((r) => String(r.email || '').toLowerCase() === email)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  const row = await store.appendTo('newsletter.json', { email });
  return NextResponse.json({ ok: true, id: row.id });
}
