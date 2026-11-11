import Link from 'next/link';
import { site, events } from './lib/site';
import NewsletterForm from './components/NewsletterForm';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Bitcoin education for the <em>lakeside</em>, free for everyone.</h1>
            <p className="lede">
              {site.tagline} We run meetups, beginner workshops and full Bitcoin Diploma
              cohorts in Kisumu — plus educator training so the knowledge stays local.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/events">Join an event</Link>
              <Link className="btn btn-ghost" href="/programs">See programs</Link>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#9fb6c8' }}>
              Independent community in the{' '}
              <a href={site.networkUrl} style={{ color: '#ffd9a0' }}>My First Bitcoin Education Network</a>.
            </p>
          </div>
          <dl className="hero-facts">
            <dt>Where</dt>
            <dd>Kisumu, Kenya — Lake Victoria region</dd>
            <dt>How</dt>
            <dd>In-person first, open-source curriculum, hands-on wallets</dd>
            <dt>Cost</dt>
            <dd>Free. Donation-funded, volunteer-led.</dd>
            <dt>Next step</dt>
            <dd><Link href="/about" style={{ color: '#ffd9a0' }}>Why we started →</Link></dd>
          </dl>
        </div>
        <svg className="waves" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 Q 75 20, 150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40 V60 H0 Z" fill="#ffffff" />
          <path d="M0 48 Q 75 30, 150 48 T 300 48 T 450 48 T 600 48 T 750 48 T 900 48 T 1050 48 T 1200 48" fill="none" stroke="#0799b6" strokeWidth="3" />
        </svg>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>What we do, week to week</h2>
            <p>
              No hype, no trading tips. We teach money, Bitcoin, security and self-custody —
              the fundamentals that let a student, trader or boda rider actually use Bitcoin safely.
            </p>
            <ul className="program-list">
              <li><strong>Monthly meetups</strong> — open talks, demos, Q&amp;A. Bring a friend.</li>
              <li><strong>First-wallet workshops</strong> — leave with a working wallet and backup.</li>
              <li><strong>Bitcoin Diploma cohorts</strong> — 8–10 week course, free, graduation certified.</li>
              <li><strong>Merchant track</strong> — help Kisumu shops accept Bitcoin.</li>
            </ul>
            <p style={{ marginTop: 16 }}><Link className="btn btn-dark" href="/programs">All programs</Link></p>
          </div>
          <div className="card">
            <h3>Upcoming</h3>
            {events.slice(0, 3).map((e) => (
              <p key={e.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <strong>{e.title}</strong><br />
                <span style={{ color: 'var(--muted)', fontSize: '0.93rem' }}>{e.date} — {e.venue}</span>
              </p>
            ))}
            <p><Link href="/events">RSVP to an event →</Link></p>
            <h3 style={{ marginTop: 24 }}>Support free classes</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Venue, printouts, educator transport. Every class stays free because donors cover costs.
            </p>
            <p><Link className="btn btn-primary" href="/donate">Donate</Link></p>
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap split">
          <div>
            <h2>Why Kisumu?</h2>
            <p>
              High fees, slow settlement and savings that melt to inflation are still normal around
              the lake. Bitcoin, learned properly, is a practical alternative — and nobody was
              teaching it here in an open, beginner-friendly way. So we started.
            </p>
            <p><Link href="/about" style={{ color: 'var(--gold)' }}>Our story, method and year-one plan →</Link></p>
          </div>
          <div>
            <h3>Stay in the loop</h3>
            <p style={{ color: '#9fb6c8', fontSize: '0.95rem' }}>One short email per month: dates, cohort intakes, graduate stories.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
