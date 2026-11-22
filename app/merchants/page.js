import Link from 'next/link';
import MerchantDirectory from '../components/MerchantDirectory';
import { joinSteps, btcmapUrl } from '../lib/merchants';

export const metadata = {
  title: 'Merchant Directory | Bitcoin Kisumu',
  description: 'Lake Victoria Bitcoin merchant and B2B directory: fish hubs, eateries, boda stages, tour operators and suppliers where sats work.'
};

export default function Merchants() {
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

      <MerchantDirectory />

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
        </div>
      </section>
    </>
  );
}
