'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'Cohort application', message: '', website: '' });
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Sending…' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus({ kind: 'ok', msg: 'Received! We reply within a few days.' });
      setForm({ name: '', email: '', topic: 'Cohort application', message: '', website: '' });
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Email<input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
      <label>Topic
        <select value={form.topic} onChange={(e) => set('topic', e.target.value)}>
          <option>Cohort application</option>
          <option>Volunteer</option>
          <option>Venue / partnership</option>
          <option>Merchant onboarding</option>
          <option>Press</option>
          <option>Other</option>
        </select>
      </label>
      <label>Message<textarea required rows={6} value={form.message} onChange={(e) => set('message', e.target.value)} /></label>
      <label className="hp-field" aria-hidden="true">Website (leave blank)<input value={form.website} onChange={(e) => set('website', e.target.value)} autoComplete="off" tabIndex={-1} /></label>
      <div><button className="btn btn-primary" type="submit" disabled={status?.kind === 'sending'}>Send</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
