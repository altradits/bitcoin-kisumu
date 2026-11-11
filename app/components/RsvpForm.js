'use client';

import { useEffect, useState } from 'react';

export default function RsvpForm({ eventId }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
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
        body: JSON.stringify({ eventId, name, contact })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
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
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="submit">Reserve seat</button>
        {count !== null && <span className="form-note">{count} reserved so far</span>}
      </div>
      {status && (
        <div className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
