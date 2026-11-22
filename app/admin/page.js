import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../lib/adminAuth';
import AdminGate from '../components/AdminGate';

export const metadata = {
  title: 'Admin | Bitcoin Kisumu',
  description: 'Bitcoin Kisumu admin area. Restricted to allowlisted community admins.',
  robots: { index: false }
};

const MODULES = [
  ['Inbox', 'Contact + newsletter messages', '#15'],
  ['Earners', 'Pilot earner register', '#16'],
  ['Results', 'Results log and verification', '#17']
];

export default function Admin() {
  // Server-side gate: the shell HTML never renders without a valid session.
  const session = getAdminSession(headers().get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;
  return (
    <section className="section">
      <div className="wrap">
        <h1>Admin</h1>
        <p>Karibu, <strong>{session.login}</strong>. Modules below open as they ship.</p>
        <div style={{ display: 'grid', gap: 16, marginTop: 20, maxWidth: '44rem' }}>
          {MODULES.map(([name, desc, issue]) => (
            <div key={name} className="card">
              <h2 style={{ fontSize: '1.25rem' }}>{name}</h2>
              <p>{desc}</p>
              <p className="form-note">Coming soon ({issue}).</p>
            </div>
          ))}
        </div>
        <form method="POST" action="/api/admin/logout" style={{ marginTop: 20 }}>
          <button className="btn btn-dark" type="submit">Sign out</button>
        </form>
      </div>
    </section>
  );
}
