'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Scannable QR for a lightning: payload, rendered locally by the vendored
// qrcode-generator (no network, no PII leaves the page).
export function PayQR({ payload }) {
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    let alive = true;
    let tries = 0;
    const tick = () => {
      if (!alive) return;
      if (window.qrcode) {
        try {
          const qr = window.qrcode(0, 'M');
          qr.addData(payload);
          qr.make();
          if (alive) setSvg(qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true }));
        } catch {
          if (alive) setSvg('');
        }
        return;
      }
      if (++tries < 50) setTimeout(tick, 100);
    };
    tick();
    return () => {
      alive = false;
    };
  }, [payload]);

  return (
    <>
      {svg ? (
        <div
          className="qr-code"
          role="img"
          aria-label={`Payment QR code for ${payload}`}
          style={{ maxWidth: 180, background: '#fff', padding: 8, borderRadius: 12 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="form-note">Loading QR…</p>
      )}
      <Script src="/vendor/qrcode/qrcode.js" strategy="afterInteractive" />
    </>
  );
}

export function PayoutForm({ resultId }) {
  const router = useRouter();
  const [form, setForm] = useState({ sats_amount: '', kes_equivalent: '', payment_reference: '', bucket: 'runway', payment_hash: '', payment_preimage: '' });
  const [status, setStatus] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ kind: 'sending', msg: 'Recording…' });
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result_id: resultId,
          sats_amount: Number(form.sats_amount),
          kes_equivalent: form.kes_equivalent === '' ? null : Number(form.kes_equivalent),
          payment_reference: form.payment_reference,
          bucket: form.bucket,
          payment_hash: form.payment_hash,
          payment_preimage: form.payment_preimage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus({ kind: 'ok', msg: 'Settlement recorded.' });
      setForm({ sats_amount: '', kes_equivalent: '', payment_reference: '', bucket: 'runway', payment_hash: '', payment_preimage: '' });
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label>Amount (sats)<input required inputMode="numeric" value={form.sats_amount} onChange={(e) => set('sats_amount', e.target.value)} placeholder="21000" /></label>
      <label>KES equivalent (KRA valuation)<input required inputMode="decimal" value={form.kes_equivalent} onChange={(e) => set('kes_equivalent', e.target.value)} placeholder="3500.00" /></label>
      <label>Payment reference (hash / preimage / receipt)<input required value={form.payment_reference} onChange={(e) => set('payment_reference', e.target.value)} /></label>
      <label>Payment hash, optional (64 hex)<input value={form.payment_hash} onChange={(e) => set('payment_hash', e.target.value)} placeholder="Lightning payment hash" /></label>
      <label>Preimage, optional (64 hex)<input value={form.payment_preimage} onChange={(e) => set('payment_preimage', e.target.value)} placeholder="Revealed preimage — verified on save" /></label>
      <label>Bucket
        <select value={form.bucket} onChange={(e) => set('bucket', e.target.value)}>
          <option value="runway">Bucket 1 — Operating Runway</option>
          <option value="pilot_capex">Bucket 2 — Productive Lake CapEx</option>
        </select>
      </label>
      <div><button className="btn btn-primary" type="submit">Record settlement</button></div>
      {status && (
        <div role="status" className={status.kind === 'ok' ? 'form-ok' : status.kind === 'err' ? 'form-err' : 'form-note'}>{status.msg}</div>
      )}
    </form>
  );
}
