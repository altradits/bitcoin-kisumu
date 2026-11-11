import { events } from '../lib/site';
import RsvpForm from '../components/RsvpForm';

export default function Events() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Events</h1>
        <p style={{ maxWidth: '44rem' }}>Open meetups, hands-on workshops and cohort intakes. RSVP below — we use counts for seating and printouts. Walk-ins welcome when space allows.</p>
        <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
          {events.map((e) => (
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
                </div>
                <div>
                  <h3>RSVP</h3>
                  <RsvpForm eventId={e.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
