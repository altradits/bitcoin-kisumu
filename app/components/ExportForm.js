'use client';

import { useState } from 'react';
import { EARNER_ROLES, ROLE_LABELS } from '../lib/pilot';

export default function ExportForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [role, setRole] = useState('');

  function download(type) {
    const params = new URLSearchParams({ type });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (role) params.set('role', role);
    window.location.assign(`/api/admin/export?${params.toString()}`);
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem' }}>CSV exports</h2>
      <p>KRA records and grant audits. Verified results only.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        <label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label>Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            {EARNER_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </label>
      </div>
      <div className="hero-actions">
        <button className="btn btn-dark" type="button" onClick={() => download('results')}>Verified results CSV</button>
        <button className="btn btn-dark" type="button" onClick={() => download('weekly')}>Weekly summary CSV</button>
        <button className="btn btn-dark" type="button" onClick={() => download('payouts')}>Payouts CSV (KRA)</button>
      </div>
    </div>
  );
}
