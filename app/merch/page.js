import Link from 'next/link';
import { originals, priceLine, MADE_TO_ORDER } from '../lib/merch';

export const metadata = {
  title: 'Merch | Bitcoin Kisumu',
  description: 'The Catch originals, Lake Victoria Bitcoin art, and official ecosystem merch. Every purchase funds free Bitcoin classes in Kisumu.'
};

const ART_FORMS = [
  'paintings',
  'wood & soapstone carvings',
  'Luo beadwork',
  'papyrus & water-hyacinth woven crafts',
  'kitenge & textile pieces'
];

export default function Merch() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Merch that funds free classes</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Three pillars, one rule: every shilling of community margin goes
            back into free Bitcoin education around the lake.
          </p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Bitcoin Kisumu Originals — “The Catch” Lake Victoria Collection</h2>
          <p style={{ maxWidth: '48rem' }}>{MADE_TO_ORDER}. Designed with the lake, produced by local Kisumu artisans.</p>
          <div className="split" style={{ marginTop: 18 }}>
            {originals.map((item) => (
              <article key={item.name} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.art}
                  alt={item.artAlt}
                  style={{
                    width: '100%', height: 'auto', display: 'block', borderRadius: 12,
                    background: item.dark ? '#0a1931' : '#ffffff',
                    border: '1px solid var(--line)', padding: 16
                  }}
                />
                <h3 style={{ fontSize: '1.2rem', marginTop: 14 }}>{item.name}</h3>
                <p>{item.detail}</p>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700 }}>{priceLine(item)}</p>
                <p><Link className="btn btn-dark" href="/partners">Pre-order</Link></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Lake Victoria Local Bitcoin Art &amp; Crafts</h2>
          <p style={{ maxWidth: '48rem' }}>
            Our <strong>Kisumu Artists Collective</strong> — handmade local art featuring
            original Bitcoin symbolism, so local artists earn directly in sats and bring
            authentic Lake Victoria creativity to the global Bitcoin space.
          </p>
          <ul className="program-list" style={{ maxWidth: '48rem', marginTop: 18 }}>
            {ART_FORMS.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <div className="card" style={{ marginTop: 20, borderLeft: '6px solid var(--orange)' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Artist-first, always</h3>
            <p>
              The artist is paid directly to their own self-custodied Lightning wallet;
              a transparent community margin funds free classes. Full artist credit
              on every piece.
            </p>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: '1.15rem' }}>First Kisumu artist editions onboarding now</h3>
            <p>No invented gallery here — the first real editions land as artists join. Local artists can apply and collectors can commission a piece.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/partners">Commission / apply</Link>
              <Link className="btn btn-dark" href="/contact">Talk to us</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Bitcoin Ecosystem Education Merch</h2>
          <p style={{ maxWidth: '48rem' }}>
            We teach with real Bitcoin inventions and open-source tools — wallets,
            hardware signers, Lightning rails, curricula. Ecosystem merch reaches
            Kisumu through two strictly copyright-compliant paths:
          </p>
          <div className="split" style={{ marginTop: 18 }}>
            <article className="card">
              <h3 style={{ fontSize: '1.15rem' }}>Official Partner Stock</h3>
              <p>Ordered directly from the producing Bitcoin organization (wholesale, community-rate batch, or authorized local stock) and sold in Kisumu for sats alongside hands-on product education.</p>
            </article>
            <article className="card">
              <h3 style={{ fontSize: '1.15rem' }}>Licensed Local Kisumu Production</h3>
              <p>Printed or crafted locally by Kisumu artisans <strong>only after explicit written permission</strong>, strictly following the producer&apos;s copyright, trademark, and brand guidelines.</p>
            </article>
          </div>
          <div className="card" style={{ marginTop: 20, borderLeft: '6px solid #b3261e' }}>
            <h3 style={{ fontSize: '1.15rem' }}>IP, Copyright &amp; Artist-Credit Rule</h3>
            <p>
              We use public-domain Bitcoin (₿) markings openly, and we never print or craft
              any organization&apos;s proprietary trademark/mark without explicit written copyright
              permission. Every ecosystem item is tagged <code>Official Producer Stock</code> or{' '}
              <code>Licensed Local Print — Written Permission</code>, and every artwork credits
              its Kisumu artist.
            </p>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: '1.15rem' }}>Partner applications open</h3>
            <p>First authorized ecosystem drops will be listed here. Zero unauthorized third-party logos — ever.</p>
            <p><Link className="btn btn-primary" href="/partners">Become a merch partner</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
