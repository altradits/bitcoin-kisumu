import Link from 'next/link';
import InquiryForm from '../components/InquiryForm';

export const metadata = {
  title: 'Partners — Hire & Visit Kisumu | Bitcoin Kisumu',
  description: 'Book a Bitcoin lake immersion, hire the Kisumu Digital Export Guild, sponsor a workshop, or back lake CapEx. External sats keep classes free.'
};

const PILLARS = [
  {
    title: 'Book a Bitcoin Lake Victoria Immersion',
    body: 'Study tours for visitors: meet the educators, ride the boats, and pay local guides and cluster shops in sats. Tourism income with zero grant applications.'
  },
  {
    title: 'Hire the Kisumu Digital Export Guild',
    body: 'Swahili and Dholuo localization, Nostr and video storytelling, delivered by trained graduates and paid in sats. Outside money, earned.'
  },
  {
    title: 'Sponsor a Paid Corporate / NGO Workshop',
    body: 'Bitcoin training for your team or grantees, priced to cross-subsidize free community cohorts. Your workshop funds the next free class.'
  },
  {
    title: 'Pre-Order “The Catch” Merch / Back Lake CapEx',
    body: 'Merch drops and cold-chain or biogas partnership inquiries. Grant capital becomes assets that earn after grants end.'
  }
];

export default function Partners() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Hire &amp; visit Kisumu</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Donations started us. Earned sats keep us going. Every option below
            brings outside money into the lakeside circular economy.
          </p>
          <div className="split" style={{ marginTop: 24 }}>
            {PILLARS.map((p) => (
              <article key={p.title} className="card">
                <h2 style={{ fontSize: '1.3rem' }}>{p.title}</h2>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 20 }}><Link href="/merch">Browse The Catch collection →</Link></p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Send an inquiry</h2>
          <p style={{ maxWidth: '44rem' }}>Tell us what you have in mind. Stanley or Paul replies within a few days.</p>
          <div style={{ marginTop: 18, maxWidth: '36rem' }}>
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
