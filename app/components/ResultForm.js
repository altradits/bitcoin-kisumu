'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTED_TYPES = [
  'Shop signed up',
  'First customer payment',
  'Learner finished course + first payment',
  'Post or video published',
  'Translation delivered',
  'Community day'
];

export function ResultForm({ earners }) {
  const router = useRouter();
  const [form, setForm] = useState({ earner_id: earners[0]?.id || '', result_type: '', result_date: '', evidence: '' });
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Logging…' });
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: 'Result logged as submitted.' });
      setForm({ earner_id: earners[0]?.id || '', result_type: '', result_date: '', evidence: '' });
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  if (!earners.length) {
    return <p className="form-note">Add an active earner first, then log their results here.</p>;
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Earner
        <select value={form.earner_id} onChange={(e) => set('earner_id', e.target.value)}>
          {earners.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>
      <label>Result type
        <input required list="result-types" value={form.result_type} onChange={(e) => set('result_type', e.target.value)} placeholder="Shop signed up" />
        <datalist id="result-types">
          {SUGGESTED_TYPES.map((t) => <option key={t} value={t} />)}
        </datalist>
      </label>
      <label>Date<input type="date" value={form.result_date} onChange={(e) => set('result_date', e.target.value)} /></label>
      <label>Evidence (link or note)<textarea rows={3} value={form.evidence} onChange={(e) => set('evidence', e.target.value)} placeholder="Photo link, receipt, witness…" /></label>
      <div><button className="btn btn-primary" type="submit">Log result</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}

export function VerifyButtons({ id, canDecide, logger }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(action) {
    let rejection_reason;
    if (action === 'reject') {
      rejection_reason = window.prompt('Rejection reason (required):');
      if (!rejection_reason) return;
    } else if (!window.confirm('Verify this result?')) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, rejection_reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.refresh();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!canDecide) {
    return <p className="form-note">You logged this result — a second admin ({logger} excluded) must verify it.</p>;
  }
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button className="btn btn-primary" type="button" disabled={busy} onClick={() => decide('verify')}>Verify</button>
      <button className="btn btn-dark" type="button" disabled={busy} onClick={() => decide('reject')}>Reject</button>
    </div>
  );
}
