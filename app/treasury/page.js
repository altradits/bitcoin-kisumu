import Link from 'next/link';
import { treasuryBuckets, multisigPolicy, kpis, reports } from '../lib/transparency';

export const metadata = {
  title: 'Treasury & Impact Audit | Bitcoin Kisumu',
  description: 'Public treasury buckets, multi-sig governance, sustainability scorecard and quarterly audit reports. Every sat traceable.'
};

export default function Treasury() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Public treasury &amp; impact audit</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Don&apos;t trust us — verify. Every sat the community holds lives in one of three public
            buckets under multi-sig custody, and every quarter we publish what came in, what went
            out, and what changed around the lake.
          </p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>The 3-bucket treasury</h2>
          <div className="split" style={{ marginTop: 18 }}>
            {treasuryBuckets.map((b) => (
              <article key={b.name} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{b.name}</h3>
                <p>{b.purpose}</p>
                <p><strong>Allocation:</strong> {b.allocation}</p>
                <p className="form-note">{b.custody}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>Multi-sig governance policy</h2>
          <ul className="program-list" style={{ maxWidth: '48rem', marginTop: 18 }}>
            {multisigPolicy.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Sustainability scorecard</h2>
          <p style={{ maxWidth: '48rem' }}>Six numbers, updated weekly for activity and quarterly for audits. Baselines are honest Day-0 readings — including zeros.</p>
          <div style={{ overflowX: 'auto', marginTop: 18 }}>
            <table className="points">
              <thead><tr><th>KPI</th><th>What it means</th><th>Baseline</th><th>Target</th></tr></thead>
              <tbody>
                {kpis.map((k) => (
                  <tr key={k.name}>
                    <td><strong>{k.name}</strong></td>
                    <td>{k.definition}</td>
                    <td>{k.baseline}</td>
                    <td>{k.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Quarterly public audit reports</h2>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {reports.map((r) => (
              <article key={r.quarter} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{r.quarter}</h3>
                <p><strong>Status:</strong> {r.status}</p>
                <ul className="program-list">
                  {r.contains.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link className="btn btn-primary" href="/donate">Fund the buckets</Link>
            <Link className="btn btn-dark" href="/guide">Read the playbook</Link>
            <Link className="btn btn-dark" href="/stories">Impact in their words</Link>
          </div>
        </div>
      </section>
    </>
  );
}
