import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { isDbConfigured, getPool } from '../../lib/db';
import { ROLE_LABELS } from '../../lib/pilot';
import AdminGate from '../../components/AdminGate';
import { ResultForm, VerifyButtons } from '../../components/ResultForm';

export const metadata = {
  title: 'Results | Admin | Bitcoin Kisumu',
  description: 'Admin results log and two-person verification.',
  robots: { index: false }
};

const STATUS_STYLE = {
  submitted: { borderLeft: '6px solid var(--orange)' },
  verified: { borderLeft: '6px solid #2e7d32' },
  rejected: { borderLeft: '6px solid #b3261e' }
};

export default async function Results() {
  const session = getAdminSession(headers().get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  if (!isDbConfigured()) {
    return (
      <section className="section">
        <div className="wrap">
          <p><Link href="/admin">← Admin</Link></p>
          <h1>Results</h1>
          <div className="card" style={{ maxWidth: '36rem', borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Database not connected yet</h2>
            <p>Set <code>DATABASE_URL</code> and run <code>npm run db:migrate</code> — see the README.</p>
          </div>
        </div>
      </section>
    );
  }

  const [{ rows: results }, { rows: earners }] = await Promise.all([
    getPool().query(
      `SELECT r.id, r.earner_id, r.result_type, r.result_date, r.evidence, r.status,
              r.logged_by, r.verified_by, r.verified_at, r.rejection_reason,
              e.name AS earner_name, e.role AS earner_role
       FROM results r JOIN earners e ON e.id = r.earner_id
       ORDER BY r.result_date DESC, r.created_at DESC`
    ),
    getPool().query('SELECT id, name FROM earners WHERE active ORDER BY name ASC')
  ]);

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Results</h1>
        <p style={{ maxWidth: '44rem' }}>
          Log deliverables for active earners. Every result needs a second admin to
          verify or reject it — you can never decide your own log.
        </p>
        <h2 style={{ marginTop: 28 }}>Log a result</h2>
        <ResultForm earners={earners} />
        <h2 style={{ marginTop: 28 }}>Log ({results.length})</h2>
        {results.length === 0 ? (
          <p className="form-note">No results yet. Log the first deliverable above.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {results.map((r) => (
              <article key={r.id} className="card" style={STATUS_STYLE[r.status] || {}}>
                <h3 style={{ fontSize: '1.15rem' }}>{r.result_type}</h3>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>
                  {r.earner_name} • {ROLE_LABELS[r.earner_role] || r.earner_role} • {r.status}
                </p>
                {r.evidence && <p>{r.evidence}</p>}
                <p className="form-note">
                  Logged by {r.logged_by}
                  {r.verified_by ? ` • decided by ${r.verified_by}` : ''}
                  {r.status === 'rejected' && r.rejection_reason ? ` • “${r.rejection_reason}”` : ''}
                </p>
                {r.status === 'submitted' && (
                  <VerifyButtons
                    id={r.id}
                    logger={r.logged_by}
                    canDecide={String(r.logged_by).toLowerCase() !== String(session.login).toLowerCase()}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
