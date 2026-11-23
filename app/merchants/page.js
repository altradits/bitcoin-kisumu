import Link from 'next/link';
import MerchantDirectory from '../components/MerchantDirectory';
import { joinSteps, btcmapUrl, merchants as staticMerchants } from '../lib/merchants';
import { isDbConfigured, getPool } from '../lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Merchant Directory | Bitcoin Kisumu',
  description: 'Lake Victoria Bitcoin merchant and B2B directory: fish hubs, eateries, boda stages, tour operators and suppliers where sats work.'
};

async function liveMerchants() {
  // Live cluster when Postgres is configured, static fallback otherwise.
  // Any DB hiccup falls back silently — the public page never breaks.
  if (!isDbConfigured()) return staticMerchants;
  try {
    const { rows } = await getPool().query(
      `SELECT name, category, area, accepts, b2b_supplier_of, status
       FROM merchants WHERE status = 'live' ORDER BY name ASC`
    );
    if (!rows.length) return staticMerchants;
    return rows.map((m) => ({
      name: m.name,
      category: m.category,
      area: m.area || '',
      accepts: m.accepts || [],
      note: m.b2b_supplier_of ? `B2B supplier for ${m.b2b_supplier_of}` : '',
      status: m.status
    }));
  } catch {
    return staticMerchants;
  }
}

export default async function Merchants() {
  const merchants = await liveMerchants();
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Lake Victoria Bitcoin merchant &amp; B2B directory</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Every counter around the lake where sats work: fish hubs, eateries, boda stages,
            tour operators and the B2B suppliers behind them. Real listings only — a shop
            appears here after its first verified customer payment.
          </p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" href="/contact">List my shop</Link>
            <a className="btn btn-dark" href={btcmapUrl} target="_blank" rel="noopener noreferrer">Find us on BTCMap</a>
          </div>
        </div>
      </section>

      <MerchantDirectory merchants={merchants} />

      <section className="section">
        <div className="wrap">
          <h2>How local shops join</h2>
          <ul className="program-list" style={{ maxWidth: '48rem', marginTop: 18 }}>
            {joinSteps.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p style={{ marginTop: 16, maxWidth: '48rem' }}>
            Zero custody, always: your keys stay on your phone, pricing stays in shillings,
            and every B2B match keeps sats circulating between lake businesses instead of
            exiting to fiat.
          </p>
          <p><Link href="/resources/field-kit">Print the counter quick-card →</Link></p>
          <div className="card" style={{ marginTop: 22, borderLeft: '6px solid var(--teal-ink)', maxWidth: '48rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>BTCMap verification standard</h3>
            <p style={{ marginBottom: 0 }}>
              Every merchant promoted to <strong>live</strong> (only after its first verified customer
              Lightning payment) is submitted to{' '}
              <a href={btcmapUrl} target="_blank" rel="noopener noreferrer">BTCMap.org</a>{' '}
              with physical Kisumu/Dunga Beach coordinates and Lightning tags, so visitors and circular-economy
              reviewers can independently verify on-the-ground acceptance.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
