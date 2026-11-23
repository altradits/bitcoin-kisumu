import Link from 'next/link';

export const metadata = {
  title: 'Guide — Lake Victoria Circular Economy Playbook | Bitcoin Kisumu',
  description: 'How Bitcoin Kisumu turns free Bitcoin education into Lake Victoria livelihoods: revenue pillars, payroll standard, treasury policy and the 90-day pilot.'
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
  },
  {
    name: 'Bitcoin Lake (Guatemala)',
    did: 'Founded in early 2022 in Panajachel on Lake Atitlán, inspired by Bitcoin Beach. Onboarded 60+ merchants — about 90% of them unbanked — plus tuk-tuk drivers and a Bitcoin boat, pairing merchant onboarding with school education.',
    learn: 'A lakeside town like ours can go circular: dense merchant cluster first, then the lake does the marketing. Kisumu has the same ingredients — beach, traders, visitors.',
    links: [
      ['Bitcoin Magazine', 'https://bitcoinmagazine.com/culture/inside-guatemalas-bitcoin-lake'],
      ['Visit guide', 'https://kayakguatemala.com/faqs/bitcoin-lake-atitlan-lago-de-bitcoin/']
    ]
  }
];

const PILLARS = [
  [
    'Fisheries Solar Cold Chain',
    'Solar-powered cold storage at landing beaches so fishermen sell fresh instead of rushed. Cold-chain hubs settle in sats and anchor the merchant cluster.',
    'Fish income currently leaks to middlemen and spoilage. Reliable cold storage keeps value at the beach.'
  ],
  [
    'Water Hyacinth-to-Biogas',
    'Harvest the weed choking the lake and convert it to biogas and fertiliser. Lake cleanup that pays for itself.',
    'Hyacinth removal is already needed labour — we route it through paid lake-economy roles instead of one-off clean-ups.'
  ],
  [
    'Eco-Tourism & Merch',
    'Lakeside tours, crafts and Bitcoin Kisumu merchandise sold to visitors for sats. Tourist sats are the cleanest outside income there is.',
    'Every visitor payment is external sats in with zero grant application attached.'
  ],
  [
    'Cross-Border & Diaspora Remittances',
    'Teach families receiving from Uganda, Tanzania and the diaspora to receive over Lightning instead of high-fee corridors.',
    'Remittance fees around the lake are punishing. Each converted corridor is recurring inflow.'
  ],
  [
    'Digital Export Guild',
    'Trained graduates selling writing, translation, design and coding to buyers abroad, paid in sats. Swahili and Dholuo are the edge.',
    'Remote sats earned abroad and spent in Kisumu are the purest form of the one rule.'
  ]
];

const ROLES = [
  ['Shop ambassadors', 'Each shop signed up on a Lightning till, plus a bonus for its first real customer payment.', 'More counters in Kisumu that take sats.'],
  ['Peer teachers', 'Each learner who finishes a basic course and makes a first payment.', 'People who can actually use bitcoin, not just talk about it.'],
  ['Storytellers', 'A small amount per Swahili or Dholuo post or video. They keep their own zaps on Stacker News or Nostr.', 'Local voices, and sats coming in from outside.'],
  ['Translators', 'Paid bounties from wallets and education projects that need Swahili.', 'Money from outside Kisumu.'],
  ['Community days', 'Clean-ups or market days, paid in sats that people spend at bitcoin shops the same day.', 'Closes the loop: earn, spend, the shop earns.']
];

const PAYROLL = [
  ['Tier 1 — Starter (85/15)', 'Keep 15% in sats, cash 85% out to M-Pesa at once. For first-time earners learning self-custody with small amounts.', 'Nobody gambles their rent while learning.'],
  ['Tier 2 — Steady (70/30)', 'Keep 30% in sats once backup habits and spending routes are proven over a month of Tier 1.', 'Bigger upside only after the safety habits exist.'],
  ['Tier 3 — Merchant B2B retention', 'Merchants and suppliers keep working balances in sats to pay each other, cashing out only surplus.', 'Sats recirculate locally instead of exiting to fiat after one hop.']
];

const MONEY = [
  ['1. To start', 'Crowdfunding on Geyser, Bitcoin donors and grants. Check each grant: some only fund developer training.'],
  ['2. To last', 'Earned income from the five pillars: cold-chain fees, biogas sales, visitor payments, remittance savings kept local, and guild exports — plus workshops paid for by organisations with free seats for locals.'],
  ['3. Later', 'Local shops and B2B suppliers chip in once bitcoin brings them customers — and pillar revenue covers operations without new grants.']
];

const RULES = [
  'Each earner follows the graduated payroll standard: Tier 1 (85/15) first, Tier 2 (70/30) only after a month of proven backup habits. Nobody gambles their rent.',
  'Teach holding with small amounts first: self-custody, recovery words written down, one real payment together.',
  'We never hold anyone’s money. Pay straight to their own wallet.',
  'Call it a stipend or a task payment, not a salary, at first. Keep a record of every payment for KRA.',
  'Kenya’s Virtual Asset Service Providers Act 2025 plus the VASP Regulations 2026 (Legal Notice No. 134, gazetted 22 July 2026; joint CBK/CMA notice 13 November 2026) license custodial and exchange businesses — CBK covers custody, payments and stablecoins, CMA covers exchanges and investment services. We stay on the non-custodial side of that boundary: education, self-custody and stipends to people’s own wallets only.',
  'Formal entity separation: the education community never runs commercial payments activity. If a pillar ever needs licensed activity, it spins out into its own properly licensed entity. Ask a Kenyan lawyer before payouts grow.'
];

const PILOT = [
  ['Before day 1', [
    'Fix one pot of money and the amount per task. Never promise more than the pot holds.',
    'Confirm the pilot landing site: a high-density lakeside cluster around Dunga Beach and the Kisumu corridor.',
    'Set up a Lightning address for Bitcoin Kisumu and a Geyser page for the pilot.',
    'Recruit the cluster: 10–15 interconnected merchants plus their B2B suppliers, with 2 shop ambassadors, 2 peer teachers and 1 storyteller embedded.',
    'Each earner sets up their own wallet and writes down their recovery words.'
  ]],
  ['Days 1 to 30', [
    'Pay every Friday, for verified results only, on the Tier 1 (85/15) payroll standard.',
    'First cluster market day: earn in the morning, spend at cluster shops the same day.',
    'Publish a short weekly update with real numbers.'
  ]],
  ['Days 31 to 90', [
    'Graduate proven earners to Tier 2 (70/30); switch cluster B2B pairs to Tier 3 sats retention.',
    'Keep what works, drop what does not.',
    'Line up one pillar income stream: a paid workshop, a translation bounty or visitor payments.',
    'On day 90, publish the full numbers openly. That report wins the next round.'
  ]]
];

const METRICS = [
  'Earned Revenue Ratio — earned sats ÷ total OpEx (target ≥25% at Day 90)',
  'Net Sats Inflow Ratio — external sats in ÷ sats out (must stay above 1.0)',
  'Circular Velocity — local hops before fiat exit',
  '30-day active merchant retention in the cluster',
  'Active local bitcoin earners and livelihoods supported',
  'Quarterly audit and KRA/VASP compliance status'
];

export default function Guide() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Lake Victoria Sustainable Circular Economy Playbook</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            How we turn free Bitcoin education into Lake Victoria livelihoods — and how the work
            pays for itself after the grants. We share it openly so you can hold us to it.
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
          <h2>The 5 Lake Victoria revenue &amp; employment pillars</h2>
          <p style={{ maxWidth: '48rem' }}>Education fills the pipeline; these pillars turn graduates into earners and donations into a top-up instead of the lifeline. Each pillar is tested in the pilot before it scales.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {PILLARS.map(([name, what, why]) => (
              <article key={name} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{name}</h3>
                <p>{what}</p>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700 }}>{why}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Paid roles: we pay for results, not hours</h2>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {ROLES.map(([role, paid, spreads]) => (
              <article key={role} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{role}</h3>
                <p><strong>Paid for:</strong> {paid}</p>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700 }}>{spreads}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>Graduated Bitcoin payroll standard</h2>
          <p>Earners climb tiers only as their safety habits prove out. The tier, not the person, decides the split.</p>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {PAYROLL.map(([tier, rule, why]) => (
              <div key={tier}>
                <h3 style={{ fontSize: '1.1rem' }}>{tier}</h3>
                <p>{rule}</p>
                <p style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>{why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Where the money comes from — and where it sits</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {MONEY.map(([k, v]) => (
              <div key={k}>
                <h3 style={{ fontSize: '1.1rem' }}>{k}</h3>
                <p>{v}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 20, borderLeft: '6px solid var(--teal)' }}>
            <h3 style={{ fontSize: '1.15rem' }}>3-bucket multi-sig treasury</h3>
            <p>Every sat lives in one of three buckets — Operating Runway &amp; Free Education (35%), Productive Lake CapEx &amp; Circular Pilot (45%), Sovereign BTC Reserve &amp; Compliance (20%) — proposed targets to be ratified at Day 0, under 2-of-3 hardware custody with zero single-key control.</p>
            <p><Link className="btn btn-dark" href="/treasury">See the public treasury &amp; audit</Link></p>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Rules that protect the people we pay</h2>
          <ul className="program-list" style={{ maxWidth: '48rem' }}>
            {RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <p style={{ fontSize: '0.9rem' }}>
            The Act: <a href="https://new.kenyalaw.org/akn/ke/act/2025/20" target="_blank" rel="noopener noreferrer">Kenya Law</a>.
            {' '}The 2026 Regulations (CBK/CMA licensing now in force):{' '}
            <a href="https://techweez.com/2026/11/16/kenya-crypto-firms-license-fines/" target="_blank" rel="noopener noreferrer">Techweez</a>
            {', '}
            <a href="https://nairobilawmonthly.com/crypto-firms-to-obtain-licences-under-cbk-virtual-assets-rules/" target="_blank" rel="noopener noreferrer">Nairobi Law Monthly</a>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>The 90-day pilot: Dunga Beach cluster</h2>
          <p style={{ maxWidth: '48rem' }}>Not five scattered shops — one dense, high-footfall lakeside cluster around Dunga Beach and the Kisumu corridor, where 10–15 interconnected merchants and their B2B suppliers trade with each other daily.</p>
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
          <p style={{ marginTop: 16 }}><Link href="/treasury">Full definitions, baselines and targets on the treasury &amp; impact audit page →</Link></p>
          <p><Link href="/pilot">Track the live pilot week by week →</Link></p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Want to help?</h2>
          <p style={{ maxWidth: '44rem' }}>Fund the pilot, hire a Kisumu storyteller or translator, list your shop in the directory, or visit and pay at our cluster.</p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" href="/donate">Support the pilot</Link>
            <Link className="btn btn-dark" href="/merchants">Merchant directory</Link>
            <Link className="btn btn-dark" href="/merch">Merch</Link>
            <Link className="btn btn-dark" href="/partners">Partner with us</Link>
            <Link className="btn btn-ghost" style={{ color: 'var(--navy)', borderColor: 'var(--navy)' }} href="/contact">Talk to us</Link>
          </div>
          <p style={{ marginTop: 16, maxWidth: '44rem' }}>
            Native Dholuo speaker? Claim a paid bounty to translate our Kiswahili starter page (<Link href="/sw">/sw</Link>) —{' '}
            <Link href="/partners">details here</Link>. No machine translation accepted.
          </p>
        </div>
      </section>
    </>
  );
}
