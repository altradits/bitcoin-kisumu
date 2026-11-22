import { NextResponse } from 'next/server';
import { store, StorageUnavailable } from '@/app/lib/store';
import { checkRateLimit, tooManyRequests } from '@/app/lib/rateLimit';
import { events } from '@/app/lib/site';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const all = await store.readList('rsvps.json');
  const list = eventId ? all.filter((r) => r.eventId === eventId) : all;
  return NextResponse.json({ count: list.length });
}

export async function POST(req) {
  const limit = await checkRateLimit(req, 'rsvp');
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
  if (String(body.website || '').trim() !== '') {
    // Honeypot: pretend the seat is taken, store nothing.
    const all = await store.readList('rsvps.json');
    return NextResponse.json({ ok: true, duplicate: true, count: all.filter((r) => r.eventId === eventId).length });
  }
  const event = events.find((e) => e.id === eventId);
  if (!event) return NextResponse.json({ error: 'Unknown event.' }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: 'Please give your name.' }, { status: 400 });
  if (name.length > 100) return NextResponse.json({ error: 'Name too long (100 chars max).' }, { status: 400 });
  if (contact.length < 3) return NextResponse.json({ error: 'Please give a phone or email.' }, { status: 400 });
  if (contact.length > 254) return NextResponse.json({ error: 'Contact too long (254 chars max).' }, { status: 400 });

  // Atomic: capacity + duplicate-contact enforced inside the store, so
  // overlapping requests can never overbook or double-claim a seat.
  let res;
  try {
    res = await store.appendRsvp(eventId, { name, contact }, event.capacity || 100);
  } catch (err) {
    if (err instanceof StorageUnavailable) return NextResponse.json({ error: err.message }, { status: 503 });
    throw err;
  }
  if (res.outcome === 'duplicate') {
    return NextResponse.json(
      { error: 'You already reserved a seat with this contact.', duplicate: true, count: res.count },
      { status: 409 }
    );
  }
  if (res.outcome === 'full') {
    return NextResponse.json(
      { error: 'This event is full — contact us to join the waitlist.', count: res.count },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, rsvp: res.row, count: res.count }, { status: 201 });
}
