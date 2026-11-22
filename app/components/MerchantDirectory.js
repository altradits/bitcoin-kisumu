'use client';

import Link from 'next/link';
import { useState } from 'react';
import { merchantCategories, merchants } from '../lib/merchants';

export default function MerchantDirectory() {
  const [filter, setFilter] = useState('All');
  const visible = filter === 'All' ? merchants : merchants.filter((m) => m.category === filter);

  return (
    <section className="section section-wash">
      <div className="wrap">
        <h2>Browse by category</h2>
        <div className="hero-actions" style={{ marginTop: 12 }}>
          {['All', ...merchantCategories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={`btn ${filter === c ? 'btn-primary' : 'btn-ghost'}`}
              style={filter === c ? {} : { color: 'var(--navy)', borderColor: 'var(--navy)' }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {visible.map((m) => (
            <article key={m.name} className="card">
              <h3 style={{ fontSize: '1.15rem' }}>{m.name}</h3>
              <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>
                {m.category} • {m.area} • {m.status === 'live' ? 'Accepting now' : 'Onboarding'}
              </p>
              <p>{m.note}</p>
              <p className="form-note">Accepts: {m.accepts.join(' + ')}</p>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="card" style={{ borderLeft: '6px solid var(--orange)' }}>
              <h3 style={{ fontSize: '1.15rem' }}>No merchants listed yet in this category</h3>
              <p>
                The directory opens with the Dunga Beach pilot cluster — 10–15 interconnected
                merchants and suppliers onboarding now. Your shop could be first.
              </p>
              <p><Link className="btn btn-dark" href="/contact">Start onboarding</Link></p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
