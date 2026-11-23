import { NextResponse } from 'next/server';
import { events } from '@/app/lib/site';
import { store } from '@/app/lib/store';

export async function GET() {
  let rsvps = [];
  try {
    rsvps = await store.readList('rsvps.json');
  } catch {
    rsvps = [];
  }
  const withCounts = events.map((e) => ({
    ...e,
    reserved: rsvps.filter((r) => r.eventId === e.id).length
  }));
  return NextResponse.json({ events: withCounts });
}
