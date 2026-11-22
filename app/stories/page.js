import Link from 'next/link';
import { stories } from '../lib/stories';

export const metadata = {
  title: 'Stories | Bitcoin Kisumu',
  description: 'Graduates, educators and Lake Victoria earners in their own words. Proof that free Bitcoin education turns into livelihoods.'
};

function Avatar({ name }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 72, height: 72, flexShrink: 0, borderRadius: '50%',
        background: 'linear-gradient(160deg, #f7931a, #0a3d62)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Georgia, serif'
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

export default function Stories() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Stories</h1>
          <p style={{ maxWidth: '44rem' }}>
            Graduates, educators and lake-economy earners in their own words.
            Every story below is real and consented — and each one doubles as
            evidence for the Education Network Leaderboard and our grant reports.
          </p>
          <div className="split" style={{ marginTop: 28 }}>
            {stories.map((s) => (
              <article key={s.name} className="card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Avatar name={s.name} />
                  <div>
                    <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{s.name}</h2>
                    <p style={{ color: 'var(--teal)', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
                      {s.role} • {s.cohort}
                    </p>
                  </div>
                </div>
                <p style={{ marginTop: 14 }}>{s.kind === 'story' ? `“${s.text}”` : s.text}</p>
                <p className="form-note">{s.kind === 'story' ? 'Graduate story' : 'Team profile'}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <div className="card" style={{ borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Graduate stories land after Cohort 1</h2>
            <p style={{ maxWidth: '44rem' }}>
              No fabricated quotes here — the first graduate and earner interviews
              publish once real cohorts complete. Join the next intake or tell us
              your story.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/events">Join Cohort 1</Link>
              <Link className="btn btn-dark" href="/contact">Share your story</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
