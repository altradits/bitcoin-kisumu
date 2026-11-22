import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../lib/adminAuth';

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
  if (session.status !== 'ok') {
    return (
      <section className="section">
        <div className="wrap">
          <h1>Admin</h1>
          <div className="card" style={{ maxWidth: '36rem' }}>
            {session.status === 'forbidden' ? (
              <p><strong>{session.login}</strong> is signed in but not a Bitcoin Kisumu admin.</p>
            ) : (
              <p>Restricted area. Sign in with an allowlisted GitHub account.</p>
            )}
            {!authConfigured() && (
              <p className="form-note">Admin sign-in is not configured on this deployment yet.</p>
            )}
            <p style={{ marginTop: 12 }}><Link className="btn btn-dark" href="/api/admin/login">Sign in with GitHub</Link></p>
          </div>
        </div>
      </section>
    );
  }
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
        <p style={{ marginTop: 20 }}><a href="/api/admin/logout">Sign out</a></p>
      </div>
    </section>
  );
}
