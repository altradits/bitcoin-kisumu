'use client';

import { useState } from 'react';
import { payrollSplit, merchantDiscount } from '../lib/splitMath';

const fmtKes = (n) => `KES ${Number(n).toLocaleString('en-US')}`;
const fmtSats = (n) => (n === null ? '—' : `${Number(n).toLocaleString('en-US')} sats`);

export default function SplitCalculator() {
  const [mode, setMode] = useState('payroll');
  const [stipend, setStipend] = useState('4000');
  const [rate, setRate] = useState('');
  const [shelf, setShelf] = useState('2500');

  const pay = payrollSplit(stipend, rate);
  const deal = merchantDiscount(shelf);

  return (
    <div>
      <div className="hero-actions" role="group" aria-label="Calculator mode">
        <button
          type="button"
          className={`btn ${mode === 'payroll' ? 'btn-primary' : 'btn-dark'}`}
          aria-pressed={mode === 'payroll'}
          onClick={() => setMode('payroll')}
        >
          Earner payroll split
        </button>
        <button
          type="button"
          className={`btn ${mode === 'merchant' ? 'btn-primary' : 'btn-dark'}`}
          aria-pressed={mode === 'merchant'}
          onClick={() => setMode('merchant')}
        >
          Merchant 10% discount
        </button>
      </div>

      {mode === 'payroll' ? (
        <div className="stack" style={{ marginTop: 18 }}>
          <label>Weekly stipend (KES)<input inputMode="numeric" value={stipend} onChange={(e) => setStipend(e.target.value)} /></label>
          <label>Reference rate (KES per BTC, optional)<input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 15000000" /></label>
          <div className="card" aria-live="polite">
            <p><strong>Tier 1 (85/15):</strong> {fmtKes(pay.tier1.kes)} for rent &amp; food + {fmtSats(pay.tier1.sats)} savings</p>
            <p><strong>Tier 2 (70/30):</strong> {fmtKes(pay.tier2.kes)} + {fmtSats(pay.tier2.sats)} savings</p>
            {pay.rate === null && <p className="form-note">Add a reference rate to see estimated sats. No live prices — your number, your math.</p>}
          </div>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 18 }}>
          <label>Shelf price (KES)<input inputMode="numeric" value={shelf} onChange={(e) => setShelf(e.target.value)} /></label>
          <div className="card" aria-live="polite">
            <p><strong>Lightning price: {fmtKes(deal.discounted)}</strong></p>
            <p className="form-note">Customer saves {fmtKes(deal.savings)} by paying in sats.</p>
          </div>
        </div>
      )}
    </div>
  );
}
