import Link from 'next/link';
import { headers } from 'next/headers';
import { getAdminSession, authConfigured } from '../../lib/adminAuth';
import { store } from '../../lib/store';
import { events } from '../../lib/site';
import AdminGate from '../../components/AdminGate';

export const metadata = {
  title: 'Inbox | Admin | Bitcoin Kisumu',
  description: 'Admin inbox: contact messages, newsletter sign-ups and event RSVPs.',
  robots: { index: false }
};

function newestFirst(list) {
  return [...list].sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}

function Empty({ what }) {
  return <p className="form-note">No {what} yet. Submissions from the live forms land here.</p>;
}

export default async function Inbox() {
  const session = getAdminSession(headers().get('cookie'));
  if (session.status !== 'ok') return <AdminGate session={session} configured={authConfigured()} />;

  const [contact, newsletter, rsvps] = await Promise.all([
    store.readList('contact.json'),
    store.readList('newsletter.json'),
    store.readList('rsvps.json')
  ]);

  return (
    <section className="section">
      <div className="wrap">
        <p><Link href="/admin">← Admin</Link></p>
        <h1>Inbox</h1>
        <p style={{ maxWidth: '44rem' }}>Every submission from the live forms, newest first. Visible to allowlisted admins only.</p>

        <h2 style={{ marginTop: 28 }}>Contact messages ({contact.length})</h2>
        {newestFirst(contact).length === 0 ? <Empty what="contact messages" /> : (
          <div style={{ display: 'grid', gap: 14 }}>
            {newestFirst(contact).map((m) => (
              <article key={m.id} className="card">
                <h3 style={{ fontSize: '1.1rem' }}>{m.name} <span className="form-note">• {m.email} • {m.topic}</span></h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                <p className="form-note">{m.at}</p>
              </article>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 28 }}>Newsletter sign-ups ({newsletter.length})</h2>
        {newestFirst(newsletter).length === 0 ? <Empty what="sign-ups" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="points">
              <thead><tr><th>Email</th><th>Signed up</th></tr></thead>
              <tbody>
                {newestFirst(newsletter).map((n) => (
                  <tr key={n.id}><td>{n.email}</td><td>{n.at}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ marginTop: 28 }}>Event RSVPs ({rsvps.length})</h2>
        {events.map((e) => {
          const forEvent = newestFirst(rsvps.filter((r) => r.eventId === e.id));
          return (
            <div key={e.id} className="card" style={{ marginTop: 14 }}>
              <h3 style={{ fontSize: '1.15rem' }}>{e.title}</h3>
              <p className="form-note">{forEvent.length} / {e.capacity} seats reserved</p>
              {forEvent.length === 0 ? <Empty what="RSVPs for this event" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="points">
                    <thead><tr><th>Name</th><th>Contact</th><th>Reserved</th></tr></thead>
                    <tbody>
                      {forEvent.map((r) => (
                        <tr key={r.id}><td>{r.name}</td><td>{r.contact}</td><td>{r.at}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
