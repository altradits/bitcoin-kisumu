'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EARNER_ROLES, ROLE_LABELS, PAYROLL_TIERS } from '../lib/pilot';

const empty = {
  name: '',
  role: 'shop_ambassador',
  lightning_address: '',
  payroll_tier: 1,
  ward_area: '',
  start_date: '',
  consent_date: '',
  phone: ''
};

function toForm(e) {
  if (!e) return { ...empty };
  const d = (v) => (v ? String(v).slice(0, 10) : '');
  return {
    name: e.name || '',
    role: e.role || 'shop_ambassador',
    lightning_address: e.lightning_address || '',
    payroll_tier: e.payroll_tier || 1,
    ward_area: e.ward_area || '',
    start_date: d(e.start_date),
    consent_date: d(e.consent_date),
    phone: e.phone || ''
  };
}

export function EarnerForm({ earner = null, onSaved }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(earner));
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Saving…' });
    try {
      const res = await fetch('/api/admin/earners', {
        method: earner ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(earner ? { ...form, id: earner.id } : form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: earner ? 'Saved.' : 'Earner added.' });
      if (!earner) setForm({ ...empty });
      if (onSaved) onSaved();
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Role
        <select value={form.role} onChange={(e) => set('role', e.target.value)}>
          {EARNER_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </label>
      <label>Lightning address<input value={form.lightning_address} onChange={(e) => set('lightning_address', e.target.value)} placeholder="name@domain" /></label>
      <label>Payroll tier
        <select value={form.payroll_tier} onChange={(e) => set('payroll_tier', Number(e.target.value))}>
          {Object.entries(PAYROLL_TIERS).map(([t, label]) => <option key={t} value={t}>{label}</option>)}
        </select>
      </label>
      <label>Ward / area<input value={form.ward_area} onChange={(e) => set('ward_area', e.target.value)} placeholder="Dunga, Kisumu" /></label>
      <label>Start date<input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} /></label>
      <label>Consent date<input type="date" value={form.consent_date} onChange={(e) => set('consent_date', e.target.value)} /></label>
      <label>Phone (only with consent date)<input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="07…" /></label>
      <div><button className="btn btn-primary" type="submit">{earner ? 'Save changes' : 'Add earner'}</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}

export function DeactivateButton({ id, name, onSaved }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function deactivate() {
    if (!window.confirm(`Deactivate ${name}? Their history stays.`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/earners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: false })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      if (onSaved) onSaved();
      router.refresh();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn btn-dark" type="button" disabled={busy} onClick={deactivate}>
      {busy ? 'Working…' : 'Deactivate'}
    </button>
  );
}
