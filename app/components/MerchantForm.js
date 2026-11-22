'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { merchantCategories } from '../lib/merchants';

const ACCEPTS = ['Lightning', 'On-Chain'];
const STATUSES = ['onboarding', 'live', 'inactive'];

const empty = {
  name: '',
  category: 'Shops & Markets',
  area: '',
  accepts: ['Lightning'],
  b2b_supplier_of: '',
  btcmap_url: '',
  status: 'onboarding',
  last_verified_payment_date: ''
};

function toForm(m) {
  if (!m) return { ...empty, accepts: [...empty.accepts] };
  const d = (v) => (v ? String(v).slice(0, 10) : '');
  return {
    name: m.name || '',
    category: m.category || 'Shops & Markets',
    area: m.area || '',
    accepts: Array.isArray(m.accepts) && m.accepts.length ? [...m.accepts] : ['Lightning'],
    b2b_supplier_of: m.b2b_supplier_of || '',
    btcmap_url: m.btcmap_url || '',
    status: m.status || 'onboarding',
    last_verified_payment_date: d(m.last_verified_payment_date)
  };
}

export default function MerchantForm({ merchant = null }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(merchant));
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleAccept(a) {
    setForm((f) => ({
      ...f,
      accepts: f.accepts.includes(a) ? f.accepts.filter((x) => x !== a) : [...f.accepts, a]
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Saving…' });
    try {
      const res = await fetch('/api/admin/merchants', {
        method: merchant ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merchant ? { ...form, id: merchant.id } : form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: merchant ? 'Saved.' : 'Merchant added.' });
      if (!merchant) setForm({ ...empty, accepts: [...empty.accepts] });
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Category
        <select value={form.category} onChange={(e) => set('category', e.target.value)}>
          {merchantCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Area<input value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Dunga Beach, Kisumu CBD" /></label>
      <fieldset style={{ border: '1.5px solid #b9cbd6', borderRadius: 9, padding: '8px 13px' }}>
        <legend style={{ fontWeight: 600, fontSize: '0.95rem', padding: '0 6px' }}>Accepts</legend>
        {ACCEPTS.map((a) => (
          <label key={a} style={{ display: 'inline-flex', gap: 6, marginRight: 16, fontWeight: 400 }}>
            <input type="checkbox" checked={form.accepts.includes(a)} onChange={() => toggleAccept(a)} style={{ width: 'auto' }} /> {a}
          </label>
        ))}
      </fieldset>
      <label>B2B supplier for (optional)<input value={form.b2b_supplier_of} onChange={(e) => set('b2b_supplier_of', e.target.value)} placeholder="Which cluster shops they supply" /></label>
      <label>BTCMap URL (optional)<input value={form.btcmap_url} onChange={(e) => set('btcmap_url', e.target.value)} placeholder="https://btcmap.org/…" /></label>
      <label>Status
        <select value={form.status} onChange={(e) => set('status', e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>Last verified payment date<input type="date" value={form.last_verified_payment_date} onChange={(e) => set('last_verified_payment_date', e.target.value)} /></label>
      <div><button className="btn btn-primary" type="submit">{merchant ? 'Save changes' : 'Add merchant'}</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
