'use client';

import { useState } from 'react';

const INTEREST_LABELS = {
  tour: 'Lake Victoria Immersion / Study Tour',
  guild: 'Hire the Digital Export Guild',
  workshop: 'Sponsor a Corporate / NGO Workshop',
  merch: 'The Catch merch / Lake CapEx partnership',
  ecosystem: 'Ecosystem Merch Partnership (Official Stock / Licensed Local Print)',
  art: 'Commission / Submit Lake Victoria Bitcoin Art'
};

export default function InquiryForm() {
  const [form, setForm] = useState({ name: '', email: '', interest: 'tour', message: '', website: '' });
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Sending…' });
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus({ kind: 'ok', msg: 'Asante! We reply within a few days.' });
      setForm({ name: '', email: '', interest: 'tour', message: '', website: '' });
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Email<input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
      <label>I am interested in
        <select value={form.interest} onChange={(e) => set('interest', e.target.value)}>
          {Object.entries(INTEREST_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </label>
      <label>Message<textarea required rows={6} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Dates, group size, what you need…" /></label>
      <label className="hp-field" aria-hidden="true">Website (leave blank)<input value={form.website} onChange={(e) => set('website', e.target.value)} autoComplete="off" tabIndex={-1} /></label>
      <div><button className="btn btn-primary" type="submit" disabled={status?.kind === 'sending'}>Send inquiry</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
