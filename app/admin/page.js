import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../lib/adminAuth';
import AdminGate from '../components/AdminGate';
import ExportForm from '../components/ExportForm';

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
  return (
    <section className="section">
      <div className="wrap">
        <h1>Admin</h1>
        <p>Karibu, <strong>{session.login}</strong>. Modules below open as they ship.</p>
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
