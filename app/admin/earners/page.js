import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { isDbConfigured, getPool, fmtPgDate } from '../../lib/db';
import { ROLE_LABELS } from '../../lib/pilot';
import AdminGate from '../../components/AdminGate';
import { EarnerForm, DeactivateButton } from '../../components/EarnerForm';

export const metadata = {
  title: 'Earners | Admin | Bitcoin Kisumu',
  description: 'Admin earner register for the pilot.',
  robots: { index: false }
};

// pg DATE arrives as local-midnight; serialize the true calendar date before
// crossing to the client (ISO strings would shift a day on UTC+ servers).
function plainEarner(e) {
  return { ...e, start_date: fmtPgDate(e.start_date), consent_date: fmtPgDate(e.consent_date) };
}

export default async function Earners() {
  const session = getAdminSession((await headers()).get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  if (!isDbConfigured()) {
    return (
      <section className="section">
        <div className="wrap">
          <p><Link href="/admin">← Admin</Link></p>
          <h1>Earners</h1>
          <div className="card" style={{ maxWidth: '36rem', borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Database not connected yet</h2>
            <p>The earner register needs Postgres. Set <code>DATABASE_URL</code> (Neon on Vercel, Docker locally — see the README) and run <code>npm run db:migrate</code>.</p>
          </div>
        </div>
      </section>
    );
  }

  const { rows } = await getPool().query(
    'SELECT id, name, role, lightning_address, payroll_tier, ward_area, start_date, active, consent_date, phone FROM earners ORDER BY active DESC, name ASC'
  );
  const earners = rows.map(plainEarner);

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Earners</h1>
        <p style={{ maxWidth: '44rem' }}>
          {earners.filter((e) => e.active).length} active pilot earners.
          Deactivating keeps full history — nothing here is ever hard-deleted.
        </p>
        <h2 style={{ marginTop: 28 }}>Add earner</h2>
        <EarnerForm />
        <h2 style={{ marginTop: 28 }}>Register</h2>
        {earners.length === 0 ? (
          <p className="form-note">No earners yet. Add the Dunga pilot roster above.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {earners.map((e) => (
              <article key={e.id} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>
                  {e.name} {!e.active && <span className="form-note">(inactive)</span>}
                </h3>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>
                  {ROLE_LABELS[e.role] || e.role} • Tier {e.payroll_tier}
                  {e.ward_area ? ` • ${e.ward_area}` : ''}
                </p>
                <p className="form-note">
                  {e.lightning_address || 'No Lightning address yet'}
                  {e.phone ? ` • ${e.phone}` : ''}
                </p>
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Edit</summary>
                  <div style={{ marginTop: 12 }}>
                    <EarnerForm earner={e} />
                  </div>
                </details>
                {e.active && (
                  <p style={{ marginTop: 12 }}><DeactivateButton id={e.id} name={e.name} /></p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
