import { team } from '../lib/site';

export default function Team() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Team</h1>
        <p style={{ maxWidth: '44rem' }}>Volunteer-led. Each profile below mirrors our Education Network Leaderboard entry (10 pts per member). Photos land in <code>public/team/</code> as they come in.</p>
        <div className="split" style={{ marginTop: 28 }}>
          {team.map((m) => (
            <article key={m.name} className="card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 72, height: 72, flexShrink: 0, borderRadius: '50%',
                    background: 'linear-gradient(160deg, #f7931a, #0a3d62)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Georgia, serif'
                  }}
                >
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{m.name}</h2>
                  <p style={{ color: 'var(--teal)', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{m.role}</p>
                </div>
              </div>
              {m.bio ? <p style={{ marginTop: 14 }}>{m.bio}</p> : null}
              {m.links && m.links.length > 0 && (
                <p style={{ fontSize: '0.92rem' }}>
                  {m.links.map((l, i) => (
                    <span key={l.label}>{i > 0 && ' · '}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></span>
                  ))}
                </p>
              )}
            </article>
          ))}
        </div>
        <div className="card light-card" style={{ marginTop: 20 }}>
          <h3>Join the team</h3>
          <p>We need organisers, photographers, a comms volunteer and two more educators. Graduates of cohort 1 get first priority for educator training.</p>
          <p><a className="btn btn-dark" href="/contact">Volunteer</a></p>
        </div>
      </div>
    </section>
  );
}
