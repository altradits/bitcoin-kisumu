import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { isDbConfigured, getPool } from '../../lib/db';
import { ROLE_LABELS, PAYROLL_TIERS } from '../../lib/pilot';
import AdminGate from '../../components/AdminGate';
import { PayQR, PayoutForm } from '../../components/PayoutForm';

export const metadata = {
  title: 'Payouts | Admin | Bitcoin Kisumu',
  description: 'Non-custodial Friday payout console: pay verified results from your own wallet, record the settlement.',
  robots: { index: false }
};

export default async function Payouts() {
  const session = getAdminSession(headers().get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  if (!isDbConfigured()) {
    return (
      <section className="section">
        <div className="wrap">
          <p><Link href="/admin">← Admin</Link></p>
          <h1>Payouts</h1>
          <div className="card" style={{ maxWidth: '36rem', borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Database not connected yet</h2>
            <p>Set <code>DATABASE_URL</code> and run <code>npm run db:migrate</code> — see the README.</p>
          </div>
        </div>
      </section>
    );
  }

  const pool = getPool();
  const [{ rows: unpaid }, { rows: history }] = await Promise.all([
    pool.query(
      `SELECT r.id, r.result_type, r.result_date, r.evidence, r.logged_by, r.verified_by,
              e.id AS earner_id, e.name AS earner_name, e.role AS earner_role,
              e.payroll_tier, e.lightning_address
       FROM results r JOIN earners e ON e.id = r.earner_id
       LEFT JOIN payouts p ON p.result_id = r.id
       WHERE r.status = 'verified' AND p.id IS NULL
       ORDER BY r.result_date ASC`
    ),
    pool.query(
      `SELECT p.sats_amount, p.kes_equivalent, p.bucket, p.paid_by, p.paid_at, p.proof_verified,
              e.name AS earner_name, r.result_type
       FROM payouts p
       JOIN earners e ON e.id = p.earner_id
       JOIN results r ON r.id = p.result_id
       ORDER BY p.paid_at DESC LIMIT 20`
    )
  ]);

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Friday payout console</h1>
        <p style={{ maxWidth: '48rem' }}>
          Non-custodial Friday settlement: pay each verified result <strong>directly from
          your own wallet</strong> (tap the address or scan the QR), then record the
          settlement below. This server never holds keys or sats.
        </p>
        <h2 style={{ marginTop: 28 }}>Ready to pay ({unpaid.length})</h2>
        {unpaid.length === 0 ? (
          <p className="form-note">Nothing awaiting settlement. Verified results land here automatically.</p>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {unpaid.map((r) => (
              <article key={r.id} className="card">
                <h3 style={{ fontSize: '1.2rem' }}>{r.result_type} — {r.earner_name}</h3>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>
                  {ROLE_LABELS[r.earner_role] || r.earner_role} • {PAYROLL_TIERS[r.payroll_tier] || `Tier ${r.payroll_tier}`}
                </p>
                {r.lightning_address ? (
                  <div className="split" style={{ alignItems: 'center' }}>
                    <div>
                      <p><code className="addr">{r.lightning_address}</code></p>
                      <p><a className="btn btn-primary" href={`lightning:${r.lightning_address}`}>Open in my wallet</a></p>
                    </div>
                    <PayQR payload={`lightning:${r.lightning_address}`} />
                  </div>
                ) : (
                  <p className="form-note">No Lightning address on file — arrange payment with the earner directly.</p>
                )}
                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Record settlement</summary>
                  <div style={{ marginTop: 12 }}>
                    <PayoutForm resultId={r.id} />
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
        <h2 style={{ marginTop: 28 }}>Recent settlements</h2>
        {history.length === 0 ? (
          <p className="form-note">No settlements recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="points">
              <thead><tr><th>Earner</th><th>Result</th><th>Sats</th><th>KES</th><th>Bucket</th><th>Paid by</th><th>Proof</th></tr></thead>
              <tbody>
                {history.map((p, i) => (
                  <tr key={i}>
                    <td>{p.earner_name}</td>
                    <td>{p.result_type}</td>
                    <td>{Number(p.sats_amount).toLocaleString('en-US')}</td>
                    <td>{p.kes_equivalent}</td>
                    <td>{p.bucket}</td>
                    <td>{p.paid_by}</td>
                    <td>{p.proof_verified ? '✓ verified' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
