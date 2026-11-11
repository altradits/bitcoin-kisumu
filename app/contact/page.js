'use client';

import { useState } from 'react';
import { site } from '../lib/site';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'Cohort application', message: '' });
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: 'Received! We reply within a few days.' });
      setForm({ name: '', email: '', topic: 'Cohort application', message: '' });
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <section className="section">
      <div className="wrap split">
        <div>
          <h1>Contact</h1>
          <p>Applications, volunteering, venues, press — one form reaches the whole team.</p>
          <dl className="kv" style={{ marginTop: 20 }}>
            <dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
            <dt>Network</dt><dd><a href={site.networkUrl}>Leaderboard profile</a></dd>
            <dt>Reply time</dt><dd>A few days (volunteer-run)</dd>
          </dl>
          <div className="card" style={{ marginTop: 20 }}>
            <h3>Cohort 1 applications</h3>
            <p>Choose “Cohort application”, tell us who you are and why you want in. No prior knowledge needed — curiosity is the entry exam.</p>
          </div>
        </div>
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
          <div><button className="btn btn-primary" type="submit">Send</button></div>
          {status && (
            <div className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
          )}
        </form>
      </div>
    </section>
  );
}
