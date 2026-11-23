import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { isDbConfigured, getPool, fmtPgDate } from '../../lib/db';
import AdminGate from '../../components/AdminGate';
import InflowForm from '../../components/InflowForm';

export const metadata = {
  title: 'Inflows | Admin | Bitcoin Kisumu',
  description: 'Admin grants and earned-revenue ledger.',
  robots: { index: false }
};

export default async function Inflows() {
  const session = getAdminSession((await headers()).get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  if (!isDbConfigured()) {
    return (
      <section className="section">
        <div className="wrap">
          <p><Link href="/admin">← Admin</Link></p>
          <h1>Inflows</h1>
          <div className="card" style={{ maxWidth: '36rem', borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Database not connected yet</h2>
            <p>Set <code>DATABASE_URL</code> and run <code>npm run db:migrate</code> — see the README.</p>
          </div>
        </div>
      </section>
    );
  }

  const { rows: inflows } = await getPool().query(
    `SELECT id, inflow_date, category, origin, bucket, sats_amount,
            kes_equivalent, source_note, payment_reference, recorded_by
     FROM inflows ORDER BY inflow_date DESC, created_at DESC`
  );

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Inflows</h1>
        <p style={{ maxWidth: '44rem' }}>
          Every grant and earned shilling/sat, by bucket. Source notes never
          carry donor or buyer PII.
        </p>
        <h2 style={{ marginTop: 28 }}>Record inflow</h2>
        <InflowForm />
        <h2 style={{ marginTop: 28 }}>Ledger ({inflows.length})</h2>
        {inflows.length === 0 ? (
          <p className="form-note">No inflows recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="points">
              <thead><tr><th>Date</th><th>Category</th><th>Origin</th><th>Bucket</th><th>Sats</th><th>KES</th><th>Source</th></tr></thead>
              <tbody>
                {inflows.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtPgDate(r.inflow_date)}</td>
                    <td>{r.category}</td>
                    <td>{r.origin}</td>
                    <td>{r.bucket}</td>
                    <td>{Number(r.sats_amount).toLocaleString('en-US')}</td>
                    <td>{r.kes_equivalent}</td>
                    <td>{r.source_note}</td>
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
