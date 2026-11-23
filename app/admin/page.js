import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../lib/adminAuth';
import AdminGate from '../components/AdminGate';
import ExportForm from '../components/ExportForm';
import { isDbConfigured, getPool } from '../lib/db';
import { store } from '../lib/store';

async function actionQueue() {
  // Every source degrades independently: the strip shows what it can.
  const queue = { submitted: null, unpaid: null, merchants: null, inbox: null };
  try {
    const [contact, inquiries] = await Promise.all([
      store.readList('contact.json'),
      store.readList('inquiries.json')
    ]);
    queue.inbox = contact.length + inquiries.length;
  } catch {
    queue.inbox = null;
  }
  if (!isDbConfigured()) return queue;
  try {
    const pool = getPool();
    const [s, u, m] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM results WHERE status = 'submitted'"),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM results r
         LEFT JOIN payouts p ON p.result_id = r.id
         WHERE r.status = 'verified' AND p.id IS NULL`
      ),
      pool.query("SELECT COUNT(*)::int AS n FROM merchants WHERE status = 'live'")
    ]);
    queue.submitted = s.rows[0].n;
    queue.unpaid = u.rows[0].n;
    queue.merchants = m.rows[0].n;
  } catch {
    // Leave DB figures blank; the modules show their own setup notices.
  }
  return queue;
}

export const metadata = {
  title: 'Admin | Bitcoin Kisumu',
  description: 'Bitcoin Kisumu admin area. Restricted to allowlisted community admins.',
  robots: { index: false }
};

const MODULES = [
  ['Inbox', 'Contact + newsletter messages + RSVPs', '/admin/inbox'],
  ['Earners', 'Pilot earner register', '/admin/earners'],
  ['Results', 'Results log and verification', '/admin/results'],
  ['Merchants', 'Cluster shop registry', '/admin/merchants'],
  ['Payouts', 'Friday non-custodial settlement', '/admin/payouts'],
  ['Inflows', 'Grants + earned revenue ledger', '/admin/inflows']
];

export default async function Admin() {
  // Server-side gate: the shell HTML never renders without a valid session.
  const session = getAdminSession((await headers()).get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;
  const q = await actionQueue();
  const items = [
    [q.submitted, 'results awaiting verification', '/admin/results'],
    [q.unpaid, 'verified results awaiting payout', '/admin/payouts'],
    [q.merchants, 'live merchants', '/admin/merchants'],
    [q.inbox, 'inbox items (contact + inquiries)', '/admin/inbox']
  ];
  return (
    <section className="section">
      <div className="wrap">
        <h1>Admin</h1>
        <p>Karibu, <strong>{session.login}</strong>. Friday at a glance, then the modules.</p>
        <div className="card" style={{ marginTop: 20, maxWidth: '44rem', borderLeft: '6px solid var(--orange)' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Live action queue</h2>
          <ul>
            {items.map(([n, label, href]) => (
              <li key={href}>
                {n === null ? '—' : <strong>{n}</strong>} {label} — <Link href={href}>open</Link>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'grid', gap: 16, marginTop: 20, maxWidth: '44rem' }}>
          {MODULES.map(([name, desc, href]) => (
            <div key={name} className="card">
              <h2 style={{ fontSize: '1.25rem' }}><Link href={href}>{name}</Link></h2>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, maxWidth: '44rem' }}>
          <ExportForm />
        </div>
        <form method="POST" action="/api/admin/logout" style={{ marginTop: 20 }}>
          <button className="btn btn-dark" type="submit">Sign out</button>
        </form>
      </div>
    </section>
  );
}
