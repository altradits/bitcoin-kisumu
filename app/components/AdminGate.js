import Link from 'next/link';

// Shared sign-in gate for every /admin page. Rendered server-side only,
// so gated content never reaches the browser unauthenticated.
export default function AdminGate({ session, configured }) {
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
          {!configured && (
            <p className="form-note">Admin sign-in is not configured on this deployment yet.</p>
          )}
          <p style={{ marginTop: 12 }}><Link className="btn btn-dark" href="/api/admin/login">Sign in with GitHub</Link></p>
        </div>
      </div>
    </section>
  );
}
