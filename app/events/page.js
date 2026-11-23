import { events } from '../lib/site';
import { store } from '../lib/store';
import RsvpForm from '../components/RsvpForm';

export const revalidate = 60;

export const metadata = {
  title: 'Events & RSVP | Bitcoin Kisumu',
  description: 'Open meetups, hands-on workshops and cohort intakes in Kisumu. RSVP for seating and printouts.'
};

export default async function Events() {
  let counts = null;
  try {
    const rsvps = await store.readList('rsvps.json');
    counts = {};
    for (const r of rsvps) counts[r.eventId] = (counts[r.eventId] || 0) + 1;
  } catch {
    counts = null;
  }

  return (
    <section className="section">
      <div className="wrap">
        <h1>Events</h1>
        <p style={{ maxWidth: '44rem' }}>Open meetups, hands-on workshops and cohort intakes. RSVP below — we use counts for seating and printouts. Walk-ins welcome when space allows.</p>
        <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
          {events.map((e) => {
            const taken = counts ? counts[e.id] || 0 : null;
            const left = taken === null ? null : e.capacity - taken;
            return (
              <article key={e.id} className="card">
                <div className="split">
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>{e.title}</h2>
                    <dl className="kv" style={{ fontSize: '0.95rem', marginBottom: 12 }}>
                      <dt>When</dt><dd>{e.date}</dd>
                      <dt>Where</dt><dd>{e.venue}</dd>
                      <dt>Seats</dt><dd>{e.capacity}</dd>
                    </dl>
                    <p>{e.blurb}</p>
                    {left !== null && (
                      <p style={{ fontWeight: 700, color: left > 0 ? 'var(--teal-ink)' : '#b3261e' }}>
                        {left > 0 ? `${left} of ${e.capacity} seats remaining` : 'Full — walk-ins when space allows'}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3>RSVP</h3>
                    <RsvpForm eventId={e.id} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
