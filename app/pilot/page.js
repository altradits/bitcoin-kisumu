import Link from 'next/link';
import { getPilotMetrics } from '../lib/pilotMetrics';
import { ROLE_LABELS } from '../lib/pilot';
import pilotNotes from '../../content/pilot.json';

export const metadata = {
  title: 'Pilot | Bitcoin Kisumu',
  description: 'Week-by-week verified pilot progress: active earners, verified results by role, and weekly notes from the lake.'
};

const FBCE_TIERS = [
  [
    'Tier 1 — Foundational',
    'Complete',
    'Lead Bitcoiners identified (Stanley, Ivy, Paul) and target jurisdiction locked on Dunga Beach & the Kisumu lakefront corridor.'
  ],
  [
    'Tier 2 — Emerging BCE',
    'Complete',
    'Dedicated channels live (@bitcoinkisumu across X, Nostr NIP-05, YouTube, Instagram, TikTok, WhatsApp, GitHub), Blink Lightning rail active, My First Bitcoin curriculum, /sw Kiswahili starter and bilingual field kits published.'
  ],
  [
    'Tier 3 — Active Circular Economy',
    '90-day pilot target',
    '10–15 interconnected Dunga Beach merchants + ≥3 upstream B2B suppliers live on /merchants and pinned on BTCMap.org, ≥70% 30-day active merchant retention, and ≥2.0 local velocity hops.'
  ]
];

const CLOSED_LOOP = [
  [
    '1. Earn & bring sats in',
    'Verified lakeside work (shop onboarding, peer teaching, Swahili/Dholuo storytelling, water-hyacinth clean-ups) plus external inflows from visitors, merch, local art and digital bounties.'
  ],
  [
    '2. Safe non-custodial payout',
    'Settled every Friday straight to earners’ own wallets under our graduated split (85/15 for starters, 70/30 once habits hold) — nobody gambles rent or food money.'
  ],
  [
    '3. Spend in the Dunga cluster',
    'Earners spend sats the same day at neighboring lakeside fish stalls, eateries, mama mbogas, craft weavers and boda-boda riders within walking distance.'
  ],
  [
    '4. B2B supplier restock',
    'Cluster shops pay local upstream suppliers (fish aggregators, solar cold-chain/ice hubs, water-hyacinth biogas kitchens, produce wholesalers) in sats so value hops locally instead of exiting to fiat.'
  ]
];

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
          <h2>FBCE maturity progression</h2>
          <p style={{ maxWidth: '48rem' }}>
            Tracked against the Federation of Bitcoin Circular Economies (FBCE) Tier 1–5 framework.
            Our education runs inside a commercial lakeside loop — never as isolated workshops.
          </p>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {FBCE_TIERS.map(([tier, status, detail]) => (
              <article
                key={tier}
                className="card"
                style={{ borderLeft: status === 'Complete' ? '6px solid var(--teal-ink)' : '6px solid var(--orange)' }}
              >
                <h3 style={{ fontSize: '1.15rem' }}>
                  {tier} <span style={{ color: 'var(--teal-ink)', fontSize: '0.92rem' }}>• {status}</span>
                </h3>
                <p style={{ marginBottom: 0 }}>{detail}</p>
              </article>
            ))}
          </div>

          <h2 style={{ marginTop: 36 }}>Dunga Beach closed-loop flow</h2>
          <p style={{ maxWidth: '48rem' }}>
            How each satoshis hop stays circulating around Lake Victoria rather than dumping back to fiat after one payment:
          </p>
          <ol className="program-list" style={{ marginTop: 16 }}>
            {CLOSED_LOOP.map(([step, desc]) => (
              <li key={step}>
                <strong>{step}</strong> — {desc}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={live ? 'section section-wash' : 'section'}>
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
