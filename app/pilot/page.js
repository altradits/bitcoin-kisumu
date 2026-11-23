import Link from 'next/link';
import { getPilotMetrics } from '../lib/pilotMetrics';
import { ROLE_LABELS } from '../lib/pilot';
import pilotNotes from '../../content/pilot.json';

export const metadata = {
  title: 'Pilot | Bitcoin Kisumu',
  description: 'Week-by-week verified pilot progress: active earners, verified results by role, and weekly notes from the lake.'
};

export default async function Pilot() {
  const m = await getPilotMetrics();
  const live = m.source === 'live';

  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>90-day pilot tracker</h1>
          <p style={{ maxWidth: '44rem' }}>
            Verified numbers only — every count below comes from results a second
            admin confirmed. Edit <code>content/pilot.json</code> and redeploy to
            publish each week&apos;s note.
          </p>
          {!live ? (
            <div className="card" style={{ marginTop: 24, borderLeft: '6px solid var(--orange)' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Day-0 baseline: counting starts with the pilot</h2>
              <p>Active earners: 0 • Verified results: 0. First readings land once the Dunga Beach cluster opens.</p>
              <p><Link className="btn btn-dark" href="/guide">Read the playbook</Link></p>
            </div>
          ) : (
            <div className="split" style={{ marginTop: 24 }}>
              <div className="card">
                <h2 style={{ fontSize: '1.4rem' }}>Active earners</h2>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{m.activeEarners}</p>
              </div>
              <div className="card">
                <h2 style={{ fontSize: '1.4rem' }}>Verified results</h2>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{m.verifiedResults}</p>
              </div>
              <div className="card">
                <h2 style={{ fontSize: '1.4rem' }}>Sats paid out</h2>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{m.totalSatsPaidOut.toLocaleString('en-US')}</p>
              </div>
              <div className="card">
                <h2 style={{ fontSize: '1.4rem' }}>Sats in</h2>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{m.totalSatsIn.toLocaleString('en-US')}</p>
                <p className="form-note">{m.earnedSatsIn.toLocaleString('en-US')} earned • {m.grantSatsIn.toLocaleString('en-US')} grants</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {live && (
        <section className="section section-wash">
          <div className="wrap">
            <h2>By role</h2>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table className="points">
                <thead><tr><th>Role</th><th>Verified results</th></tr></thead>
                <tbody>
                  {Object.entries(m.byRole).map(([role, n]) => (
                    <tr key={role}><td>{ROLE_LABELS[role] || role}</td><td>{n}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 style={{ marginTop: 28 }}>By week</h2>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table className="points">
                <thead><tr><th>Week of</th><th>Verified results</th></tr></thead>
                <tbody>
                  {m.weekly.map((w) => (
                    <tr key={w.week}><td>{w.week}</td><td>{w.verified}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 style={{ marginTop: 28 }}>Cluster health</h2>
            <p>
              <strong>{m.shopsLive}</strong> shops live • <strong>{m.shopsActive30d}</strong> active in the last 30 days
              {m.shopRetention30d === null ? '' : ` • ${Math.round(m.shopRetention30d * 100)}% retention`}.
            </p>
            <p>
              Earned-revenue ratio: <strong>{m.earnedRevenueRatio === null ? '—' : m.earnedRevenueRatio}</strong>
              {' • '}Net sats inflow: <strong>{m.netSatsInflowRatio === null ? '—' : m.netSatsInflowRatio}</strong>
              {' '}(targets ≥0.25 Day 90 / &gt;1.0).
            </p>
          </div>
        </section>
      )}

      <section className={live ? 'section' : 'section section-wash'}>
        <div className="wrap">
          <h2>Weekly notes</h2>
          {pilotNotes.notes.length === 0 ? (
            <p className="form-note">No weekly notes yet — the first note publishes with week one of the pilot.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
              {pilotNotes.notes.map((n) => (
                <article key={n.week} className="card">
                  <h3 style={{ fontSize: '1.15rem' }}>Week of {n.week}</h3>
                  <p>{n.note}</p>
                </article>
              ))}
            </div>
          )}
          <p style={{ marginTop: 20 }}>
            <Link href="/treasury">Treasury &amp; impact audit →</Link>
            {' • '}
            <Link href="/guide">Playbook →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
