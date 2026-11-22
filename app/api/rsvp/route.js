import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';
import { checkRateLimit, tooManyRequests } from '@/app/lib/rateLimit';
import { events } from '@/app/lib/site';

const ids = new Set(events.map((e) => e.id));

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const all = await store.readList('rsvps.json');
  const list = eventId ? all.filter((r) => r.eventId === eventId) : all;
  return NextResponse.json({ count: list.length });
}

export async function POST(req) {
  const limit = checkRateLimit(req, 'rsvp');
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const eventId = String(body.eventId || '').trim();
  const name = String(body.name || '').trim();
  const contact = String(body.contact || '').trim();
  if (!ids.has(eventId)) return NextResponse.json({ error: 'Unknown event.' }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: 'Please give your name.' }, { status: 400 });
  if (name.length > 100) return NextResponse.json({ error: 'Name too long (100 chars max).' }, { status: 400 });
  if (contact.length < 3) return NextResponse.json({ error: 'Please give a phone or email.' }, { status: 400 });
  if (contact.length > 254) return NextResponse.json({ error: 'Contact too long (254 chars max).' }, { status: 400 });

  const event = events.find((e) => e.id === eventId);
  const all = await store.readList('rsvps.json');
  const forEvent = all.filter((r) => r.eventId === eventId);
  if (forEvent.length >= (event.capacity || 100)) {
    return NextResponse.json({ error: 'This event is full — contact us to join the waitlist.' }, { status: 409 });
  }
  if (forEvent.some((r) => String(r.contact || '').toLowerCase() === contact.toLowerCase())) {
    return NextResponse.json({ ok: true, duplicate: true, count: forEvent.length });
  }
  const rsvp = await store.appendTo('rsvps.json', { eventId, name, contact });
  return NextResponse.json({ ok: true, rsvp, count: forEvent.length + 1 });
}
