'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  ['grant_donation', 'Grant / donation'],
  ['earned_merch', 'Earned — merch'],
  ['earned_art', 'Earned — local art'],
  ['earned_tour', 'Earned — tours'],
  ['earned_workshop', 'Earned — workshops'],
  ['earned_guild', 'Earned — guild exports'],
  ['earned_lake_ops', 'Earned — lake ops (cold chain, biogas)']
];
const ORIGINS = ['external', 'local'];
const BUCKETS = [
  ['runway', 'Bucket 1 — Runway'],
  ['pilot_capex', 'Bucket 2 — Lake CapEx'],
  ['reserve', 'Bucket 3 — Reserve']
];

const empty = {
  inflow_date: '',
  category: 'grant_donation',
  origin: 'external',
  bucket: 'runway',
  sats_amount: '',
  kes_equivalent: '',
  source_note: '',
  payment_reference: ''
};

export default function InflowForm() {
  const router = useRouter();
  const [form, setForm] = useState({ ...empty });
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Recording…' });
    try {
      const res = await fetch('/api/admin/inflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sats_amount: form.sats_amount === '' ? 0 : Number(form.sats_amount),
          kes_equivalent: form.kes_equivalent === '' ? 0 : Number(form.kes_equivalent)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: 'Inflow recorded.' });
      setForm({ ...empty });
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Date<input type="date" value={form.inflow_date} onChange={(e) => set('inflow_date', e.target.value)} /></label>
      <label>Category
        <select value={form.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </label>
      <label>Origin
        <select value={form.origin} onChange={(e) => set('origin', e.target.value)}>
          {ORIGINS.map((o) => <option key={o} value={o}>{o === 'external' ? 'External (outside Kisumu)' : 'Local (recirculated)'}</option>)}
        </select>
      </label>
      <label>Bucket
        <select value={form.bucket} onChange={(e) => set('bucket', e.target.value)}>
          {BUCKETS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </label>
      <label>Amount (sats)<input required inputMode="numeric" value={form.sats_amount} onChange={(e) => set('sats_amount', e.target.value)} placeholder="0" /></label>
      <label>KES equivalent<input inputMode="decimal" value={form.kes_equivalent} onChange={(e) => set('kes_equivalent', e.target.value)} placeholder="0.00" /></label>
      <label>Source note (no donor PII)<input required value={form.source_note} onChange={(e) => set('source_note', e.target.value)} placeholder="Geyser payout, Tee order, Dunga tour…" /></label>
      <label>Payment reference<input value={form.payment_reference} onChange={(e) => set('payment_reference', e.target.value)} placeholder="Lightning hash / receipt / bank ref" /></label>
      <div><button className="btn btn-primary" type="submit">Record inflow</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
