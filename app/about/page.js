import Link from 'next/link';

export const metadata = {
  title: 'About | Bitcoin Kisumu',
  description: 'Strictly Bitcoin-only, non-custodial education and Lake Victoria financial-freedom circular economy in Kisumu, Kenya.'
};

const CHARTER = [
  'Strictly Bitcoin-only — zero altcoins, zero tokens, zero trading hype or investment promises.',
  'Non-custodial by design — we never hold members’, learners’ or merchants’ funds; every wallet stays in the user’s own hands.',
  'Privacy & no-surveillance — zero national ID collection (Kenya Data Protection Act 2019), zero PII in our public metrics API (/api/metrics), and offline paper seed-backup sheets.',
  'Local-language access — free classes and guides in English and Kiswahili (/sw, /resources/field-kit), plus a paid native-speaker Dholuo localization track.'
];

export default function About() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>About Bitcoin Kisumu</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            We bring free, open-source Bitcoin education and a sustainable circular economy to Kisumu
            and the Lake Victoria region — an independent community in the My First Bitcoin Education Network.
          </p>
          <div className="split" style={{ marginTop: 28 }}>
            <div>
              <h2>Why we started</h2>
              <p>Financial exclusion is still normal around the lake: high fees, slow settlement, account-freeze fragility and savings that melt to inflation. Bitcoin, learned properly, is a practical, censorship-resistant alternative — and nobody was teaching it here in an open, beginner-friendly way.</p>
              <h2>Where we operate</h2>
              <p>Kisumu, Kenya&apos;s lakeside city — anchored on our Dunga Beach cluster and serving students, women fish traders (<em>mama samaki</em>), artisanal fishermen, boda riders, craft weavers and small businesses across Kisumu County.</p>
              <h2>How we educate</h2>
              <p>In-person first, the My First Bitcoin way. Cohorts work through open-source material with trained educators, hands-on wallet setup and Lightning practice. Fundamentals only: money, Bitcoin, security, privacy and self-custody.</p>
            </div>
            <div>
              <h2>What we run</h2>
              <ul className="program-list">
                <li><strong>Monthly meetups</strong> — open community gatherings &amp; live wallet demos</li>
                <li><strong>Beginner wallet workshops</strong> — first wallet, paper backup &amp; Lightning round-trip</li>
                <li><strong>Bitcoin Diploma cohorts</strong> — 8–10 week free My First Bitcoin classes</li>
                <li><strong>Dunga Beach merchant cluster</strong> — 10–15 interconnected shops + B2B suppliers</li>
                <li><strong>Educator training</strong> — graduates teach the next cohort</li>
              </ul>
              <h2 style={{ marginTop: 24 }}>Now &amp; next</h2>
              <p>
                <strong>Live now:</strong> open-source site, <Link href="/guide">Lake Victoria playbook</Link>,{' '}
                <Link href="/treasury">public treasury &amp; ratified year-one budget</Link>,{' '}
                <Link href="/pilot">90-day pilot tracker</Link>, <Link href="/sw">Kiswahili starter</Link>,{' '}
                <Link href="/merch">local merch &amp; art</Link>, and <Link href="/verify">browser verifier</Link>.{' '}
                <strong>Next:</strong> activate our Dunga Beach 10–15 merchant cluster, graduate cohort 1, pin live shops on BTCMap and publish our Day-90 public audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>Bitcoin-only &amp; financial freedom charter</h2>
          <p style={{ maxWidth: '48rem' }}>
            Financial sovereignty is a basic human dignity for unbanked communities. Every class, tool and payout we run follows four non-negotiable rules:
          </p>
          <ul className="program-list" style={{ marginTop: 18, maxWidth: '48rem' }}>
            {CHARTER.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <div className="split">
            <article className="card" style={{ borderLeft: '6px solid var(--orange)' }}>
              <h2>Lake Victoria women &amp; unbanked inclusion</h2>
              <p>
                Around Lake Victoria, women fish traders (<em>mama samaki</em>), market vendors and lakeside
                craft weavers carry household livelihoods while facing the steepest barriers to formal
                banking and credit.
              </p>
              <p style={{ marginBottom: 0 }}>
                Co-led by Education Coordinator Ivy, our cohorts, bilingual field kits and graduated
                85/15 safe payroll rules are built specifically so women traders, youth and unbanked
                fisherfolk can save and transact in Bitcoin without ever risking daily rent or food money.
              </p>
            </article>
            <article className="card" style={{ borderLeft: '6px solid var(--teal-ink)' }}>
              <h2>Verify our work openly</h2>
              <p>
                Every sat received, every verified result and every live shop count publishes transparently
                without exposing personal data.
              </p>
              <div className="hero-actions" style={{ marginTop: 12 }}>
                <Link className="btn btn-primary" href="/pilot">90-day pilot tracker</Link>
                <Link className="btn btn-dark" href="/treasury">Public treasury</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
