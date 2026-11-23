'use client';

import { useEffect, useState } from 'react';

export default function RsvpForm({ eventId }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch(`/api/rsvp?eventId=${encodeURIComponent(eventId)}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(null));
  }, [eventId]);

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Saving…' });
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, name, contact, website })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.duplicate) {
        setStatus({ kind: 'ok', msg: 'You already reserved a seat with this contact.' });
        if (typeof data.count === 'number') setCount(data.count);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus({ kind: 'ok', msg: `Asante ${data.rsvp.name}! Seat reserved.` });
      setCount(data.count);
      setName('');
      setContact('');
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </label>
      <label>
        Phone or email
        <input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="07… or you@example.com" />
      </label>
      <label className="hp-field" aria-hidden="true">Website (leave blank)<input value={website} onChange={(e) => setWebsite(e.target.value)} autoComplete="off" tabIndex={-1} /></label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="submit" disabled={status?.kind === 'sending'}>Reserve seat</button>
        {count !== null && <span className="form-note">{count} reserved so far</span>}
      </div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
