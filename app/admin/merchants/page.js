import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { isDbConfigured, getPool, fmtPgDate } from '../../lib/db';
import AdminGate from '../../components/AdminGate';
import MerchantForm from '../../components/MerchantForm';

export const metadata = {
  title: 'Merchants | Admin | Bitcoin Kisumu',
  description: 'Admin merchant cluster registry.',
  robots: { index: false }
};

export default async function Merchants() {
  const session = getAdminSession((await headers()).get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  if (!isDbConfigured()) {
    return (
      <section className="section">
        <div className="wrap">
          <p><Link href="/admin">← Admin</Link></p>
          <h1>Merchants</h1>
          <div className="card" style={{ maxWidth: '36rem', borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Database not connected yet</h2>
            <p>Set <code>DATABASE_URL</code> and run <code>npm run db:migrate</code> — see the README.</p>
          </div>
        </div>
      </section>
    );
  }

  const { rows } = await getPool().query(
    'SELECT id, name, category, area, accepts, b2b_supplier_of, btcmap_url, status, last_verified_payment_date FROM merchants ORDER BY status ASC, name ASC'
  );
  const merchants = rows.map((m) => ({
    ...m,
    last_verified_payment_date: fmtPgDate(m.last_verified_payment_date)
  }));

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Merchants</h1>
        <p style={{ maxWidth: '44rem' }}>
          {merchants.filter((m) => m.status === 'live').length} live in the cluster.
          Shops go public on /merchants once they are <strong>live</strong>.
        </p>
        <h2 style={{ marginTop: 28 }}>Add merchant</h2>
        <MerchantForm />
        <h2 style={{ marginTop: 28 }}>Registry</h2>
        {merchants.length === 0 ? (
          <p className="form-note">No merchants yet. Add the Dunga pilot roster above.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {merchants.map((m) => (
              <article key={m.id} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{m.name}</h3>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>
                  {m.category} • {m.status}{m.area ? ` • ${m.area}` : ''}
                </p>
                <p className="form-note">
                  Accepts: {(m.accepts || []).join(' + ') || '—'}
                  {m.last_verified_payment_date ? ` • last payment ${m.last_verified_payment_date}` : ' • no verified payment yet'}
                </p>
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Edit</summary>
                  <div style={{ marginTop: 12 }}>
                    <MerchantForm merchant={m} />
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
