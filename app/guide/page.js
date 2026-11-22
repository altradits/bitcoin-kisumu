import Link from 'next/link';

export const metadata = {
  title: 'Guide | Bitcoin Kisumu',
  description: 'How Bitcoin Kisumu pays locals in bitcoin, teaches them to accept, hold and use it, and stays sustainable.'
};

const LESSONS = [
  {
    name: 'Afribit, Kibera (Nairobi)',
    did: 'Pays youth who collect waste in bitcoin, teaches coding and bitcoin, and brought shops and vegetable sellers on board. Grant funded, with about $10,000 put into the community.',
    learn: 'Price swings can wipe out the gains of people with little money. Plan for that from day one.',
    links: [
      ['Kenyans.co.ke', 'https://www.kenyans.co.ke/news/109497-how-kibera-mama-mbogas-and-garbage-collectors-get-paid-bitcoin-services'],
      ['AP', 'https://www.aol.com/bitcoin-introduced-africas-largest-slum-081253188.html']
    ]
  },
  {
    name: 'Bitcoin Ekasi (South Africa)',
    did: 'Pays its staff fully in bitcoin and gets local shops to accept it. Funded by donations, a $25,000 HRF grant and merchandise profits. About 500 to 600 regular users.',
    learn: 'Donations are a fine start, but a project should not depend on them forever. People need ways to earn, spend and save.',
    links: [
      ['Bitcoin Magazine', 'https://bitcoinmagazine.com/culture/bitcoin-ekasi-township-one-year-later'],
      ['Mariblock', 'https://www.mariblock.com/bitcoin-ekasi-wants-to-create-a-bitcoin-circular-economy-in-south-africa']
    ]
  }
];

const ROLES = [
  ['Shop ambassadors', 'Each shop signed up on a Lightning till, plus a bonus for its first real customer payment.', 'More counters in Kisumu that take sats.'],
  ['Peer teachers', 'Each learner who finishes a basic course and makes a first payment.', 'People who can actually use bitcoin, not just talk about it.'],
  ['Storytellers', 'A small amount per Swahili or Dholuo post or video. They keep their own zaps on Stacker News or Nostr.', 'Local voices, and sats coming in from outside.'],
  ['Translators', 'Paid bounties from wallets and education projects that need Swahili.', 'Money from outside Kisumu.'],
  ['Community days', 'Clean-ups or market days, paid in sats that people spend at bitcoin shops the same day.', 'Closes the loop: earn, spend, the shop earns.']
];

const MONEY = [
  ['1. To start', 'Crowdfunding on Geyser, Bitcoin donors and grants. Check each grant: some only fund developer training.'],
  ['2. To last', 'Money earned from outside: visitors paying at local shops, writing and translation paid from abroad, workshops paid for by organisations with free seats for locals, and merchandise sold online for sats.'],
  ['3. Later', 'Local shops chip in a little once bitcoin brings them customers.']
];

const RULES = [
  'Each earner chooses their split, for example keep 10 to 20% in sats and cash the rest out to M-Pesa at once. Nobody gambles their rent.',
  'Teach holding with small amounts first: self-custody, recovery words written down, one real payment together.',
  'We never hold anyone’s money. Pay straight to their own wallet.',
  'Call it a stipend or a task payment, not a salary, at first. Keep a record of every payment for KRA.',
  'Kenya’s Virtual Asset Service Providers Act 2025 regulates businesses offering virtual asset services, not private use. Ask a Kenyan lawyer before payouts grow.'
];

const PILOT = [
  ['Before day 1', [
    'Fix one pot of money and the amount per task. Never promise more than the pot holds.',
    'Set up a Lightning address for Bitcoin Kisumu and a Geyser page for the pilot.',
    'Recruit 5 earners: 2 shop ambassadors, 2 peer teachers, 1 storyteller.',
    'Each earner sets up their own wallet and writes down their recovery words.'
  ]],
  ['Days 1 to 30', [
    'Pay every Friday, for verified results only.',
    'First community day: earn in the morning, spend at local shops the same day.',
    'Publish a short weekly update with real numbers.'
  ]],
  ['Days 31 to 90', [
    'Keep what works, drop what does not.',
    'Line up one source of outside income: a paid workshop, a translation bounty or visitor payments.',
    'On day 90, publish the full numbers openly. That report wins the next round.'
  ]]
];

const METRICS = [
  'Shops active (at least one payment in the last 30 days)',
  'Learners who made their first payment',
  'People still holding or spending after 30 days',
  'Sats that came in from outside Kisumu',
  'Sats paid out'
];

export default function Guide() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Our guide</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            How we plan to pay people in Kisumu in bitcoin, help them learn to accept, hold and use it, and keep it going.
            We share it openly so you can hold us to it.
          </p>
          <div className="card" style={{ marginTop: 24, borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.3rem' }}>The one rule</h2>
            <p>It only lasts if more sats come into Kisumu from outside than leave it. Donations get us started. Earned income keeps us going.</p>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>What others learned</h2>
          <div className="split" style={{ marginTop: 18 }}>
            {LESSONS.map((l) => (
              <article key={l.name} className="card">
                <h3>{l.name}</h3>
                <p>{l.did}</p>
                <p><strong>Lesson:</strong> {l.learn}</p>
                <p style={{ fontSize: '0.9rem' }}>
                  Sources: {l.links.map(([t, h], i) => (
                    <span key={h}>{i > 0 && ', '}<a href={h} target="_blank" rel="noopener noreferrer">{t}</a></span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Paid roles: we pay for results, not hours</h2>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {ROLES.map(([role, paid, spreads]) => (
              <article key={role} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{role}</h3>
                <p><strong>Paid for:</strong> {paid}</p>
                <p style={{ color: 'var(--teal)', fontWeight: 700 }}>{spreads}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>Where the money comes from</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {MONEY.map(([k, v]) => (
              <div key={k}>
                <h3 style={{ fontSize: '1.1rem' }}>{k}</h3>
                <p>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Rules that protect the people we pay</h2>
          <ul className="program-list" style={{ maxWidth: '48rem' }}>
            {RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <p style={{ fontSize: '0.9rem' }}>
            The Act: <a href="https://new.kenyalaw.org/akn/ke/act/2025/20" target="_blank" rel="noopener noreferrer">Kenya Law</a>.
            A plain guide: <a href="https://bitcoinmagazine.com/legal/kenyas-new-vasp-law-a-no-bs-legal-guide-for-bitcoin-and-crypto-builders" target="_blank" rel="noopener noreferrer">Bitcoin Magazine</a>.
          </p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>The 90-day pilot</h2>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {PILOT.map(([phase, steps]) => (
              <article key={phase} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{phase}</h3>
                <ul className="program-list">{steps.map((s) => <li key={s}>{s}</li>)}</ul>
              </article>
            ))}
          </div>
          <h3 style={{ marginTop: 28 }}>What we count, every week</h3>
          <ul className="program-list">{METRICS.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Want to help?</h2>
          <p style={{ maxWidth: '44rem' }}>Fund the pilot, hire a Kisumu storyteller or translator, or visit and pay at our shops.</p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" href="/donate">Support the pilot</Link>
            <Link className="btn btn-dark" href="/contact">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
