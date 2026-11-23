import Link from 'next/link';
import SplitCalculator from '../components/SplitCalculator';

export const metadata = {
  title: 'Resources — First Wallet & Lightning Guide | Bitcoin Kisumu',
  description: 'Install a wallet, back it up on paper, receive 100 sats and send 50 back. Plain-language Lightning guide for Kisumu beginners.'
};

const GROUPS = [
  {
    title: 'Start here (beginners)',
    links: [
      ['My First Bitcoin — Bitcoin Diploma (open source)', 'https://myfirstbitcoin.org/'],
      ['Education Network Leaderboard — our profile', 'https://network.myfirstbitcoin.org/community/bitcoin-kisumu'],
      ['Bitcoin.org — how it works', 'https://bitcoin.org/en/how-it-works']
    ]
  },
  {
    title: 'Wallets & Lightning (practice safely)',
    links: [
      ['Lightning Network explainer', 'https://lightning.network/'],
      ['Mempool — watch the chain live', 'https://mempool.space/']
    ]
  },
  {
    title: 'For educators & organisers',
    links: [
      ['My First Bitcoin resources', 'https://myfirstbitcoin.org/resources/'],
      ['Bitcoin Diploma curriculum source (GitHub)', 'https://github.com/MyFirstBitcoin/mfb-curriculum'],
      ['Our executive summary', '/executive-summary'],
      ['Our programs', '/programs']
    ]
  }
];

const STEPS = [
  {
    title: 'Step 1 — Install a wallet',
    body: 'Pick one wallet below and install it from its official site or app store. Blink is the fastest start. Phoenix is the self-custody path.',
    links: [
      ['Blink (official site)', 'https://www.blink.sv/'],
      ['Phoenix (official site)', 'https://phoenix.acinq.co']
    ]
  },
  {
    title: 'Step 2 — Write down 12 recovery words on paper',
    body: 'Phoenix shows 12 words. Write them on paper with a pen. Never screenshot them. Never send them to anyone. Anyone with these words owns your money.',
    links: [
      ['Phoenix self-custody explained (ACINQ)', 'https://acinq.co/blog/phoenix-splicing-update']
    ]
  },
  {
    title: 'Step 3 — Receive 100 sats',
    body: 'Ask an educator or friend for 100 sats. Open Receive, show your invoice or QR, and watch it arrive. This is practice money. Keep it small.',
    links: [
      ['Find us at a meetup', '/events']
    ]
  },
  {
    title: 'Step 4 — Send 50 sats back',
    body: 'Now send 50 sats back. Paste their invoice or scan their QR. Check the amount twice. Press send. You just used Lightning.',
    links: []
  }
];

const WALLETS = [
  {
    name: 'Blink — fastest beginner start',
    custody: 'Custodial: Blink holds the keys, like mobile money holds your float.',
    body: 'Easy Lightning address, works today in Kisumu, and a Stablesats dollar-balance option for holding value steady. Good training wheels. Graduate to self-custody as you learn.',
    links: [
      ['Official site', 'https://www.blink.sv/'],
      ['Dollar balance (Stablesats)', 'https://www.blink.sv/en/dollar-balance'],
      ['Google Play', 'https://play.google.com/store/apps/details?id=com.galoyapp']
    ]
  },
  {
    name: 'Phoenix — self-custodial Lightning',
    custody: 'Self-custodial: only you hold the keys, backed by your 12 words.',
    body: 'A real Lightning node on your phone that manages its own channel. You hold your coins. ACINQ, the company behind it, never sees your keys.',
    links: [
      ['Official site', 'https://phoenix.acinq.co'],
      ['Self-custody explained (ACINQ)', 'https://acinq.co/blog/phoenix-splicing-update'],
      ['Google Play', 'https://play.google.com/store/apps/details?id=fr.acinq.phoenix.mainnet']
    ]
  },
  {
    name: 'Tando — Lightning-to-M-Pesa spend bridge',
    custody: 'Custodial conversion service: sats pass through Tando and land as shillings.',
    body: 'Pay any M-Pesa till, bill or phone number straight from a Lightning wallet. The merchant gets KES. Useful for living expenses where shops do not take bitcoin yet.',
    links: [
      ['Google Play', 'https://play.google.com/store/apps/details?id=me.tando.tandoapp'],
      ['Claim a Lightning address (bitcoin.co.ke)', 'https://bitcoin.co.ke'],
      ['How it works (Crypto Briefing)', 'https://cryptobriefing.com/bitcoin-lightning-payments-kenya-tando/']
    ]
  },
  {
    name: 'Machankura — bitcoin on feature phones',
    custody: 'Custodial: Machankura holds the keys, like mobile money holds your float.',
    body: 'No smartphone? No data? Dial *483*8333# in Kenya and use Lightning over USSD. Small amounts only — this is access, not savings.',
    links: [
      ['Official site (8333.mobi)', 'https://8333.mobi'],
      ['How it works (CoinDesk)', 'https://www.coindesk.com/tech/2022/12/20/machankuras-bitcoin-wallet-targets-africans-with-old-school-phones-and-no-internet']
    ]
  }
];

const CHECKLIST = [
  'Test small first: 100 sats in, 50 sats out, before anything bigger.',
  'Paper backup done and verified before holding any savings.',
  'Seed words live on paper only — never in photos, chats or email.',
  'Nobody legitimate will ever ask for your words. Refuse every time.',
  'Custodial wallets hold training amounts. Savings graduate to self-custody.'
];

export default function Resources() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Resources</h1>
          <p style={{ maxWidth: '44rem' }}>Open-source first. Everything we teach from is free to reuse — that&apos;s the point of the movement. Bring questions to a meetup and we&apos;ll walk through any of these in person.</p>
          <div style={{ display: 'grid', gap: 18, marginTop: 28 }}>
            {GROUPS.map((g) => (
              <div key={g.title} className="card">
                <h2 style={{ fontSize: '1.35rem' }}>{g.title}</h2>
                <ul>
                  {g.links.map(([label, href]) => (
                    <li key={href + label}><a href={href}>{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>First-Wallet &amp; Lightning Guide</h2>
          <p style={{ maxWidth: '44rem' }}>Four steps. About ten minutes. Bring this page to a meetup and we will do it with you.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {STEPS.map((s) => (
              <article key={s.title} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{s.title}</h3>
                <p>{s.body}</p>
                {s.links.length > 0 && (
                  <p style={{ fontSize: '0.9rem' }}>
                    {s.links.map(([t, h], i) => (
                      <span key={h}>{i > 0 && ' · '}<a href={h}>{t}</a></span>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Wallets for Kisumu, honestly labelled</h2>
          <p style={{ maxWidth: '48rem' }}>Our rule: we teach self-custody. Custodial tools below are training wheels for small amounts — and we never hold your money or keys ourselves.</p>
          <div className="split" style={{ marginTop: 18 }}>
            {WALLETS.map((w) => (
              <article key={w.name} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{w.name}</h3>
                <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>{w.custody}</p>
                <p>{w.body}</p>
                <p style={{ fontSize: '0.9rem' }}>
                  {w.links.map(([t, h], i) => (
                    <span key={h}>{i > 0 && ' · '}<a href={h} target="_blank" rel="noopener noreferrer">{t}</a></span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="calculator">
        <div className="wrap">
          <h2>Try the numbers (works offline)</h2>
          <p style={{ maxWidth: '44rem' }}>Payroll splits and the merchant discount, computed on your phone with no price feeds.</p>
          <div style={{ marginTop: 18, maxWidth: '36rem' }}>
            <SplitCalculator />
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>5-Minute Safety Checklist</h2>
          <p style={{ color: '#9fb6c8' }}>Print this. Tape it where you study. It matches our payroll rules: test small, verify backup, never share.</p>
          <ul className="program-list" style={{ maxWidth: '48rem', marginTop: 18 }}>
            {CHECKLIST.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card">
            <h3>Safety note</h3>
            <p>Nobody from Bitcoin Kisumu will ever ask for your seed words or offer to double your bitcoin. Anyone who does is a scammer — including accounts that copy our logo.</p>
            <p style={{ marginTop: 12 }}><Link className="btn btn-dark" href="/events">Practice at a meetup</Link></p>
            <p><Link href="/verify">Verify a proof yourself →</Link></p>
            <p><Link href="/resources/field-kit">Print the classroom field kit →</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
