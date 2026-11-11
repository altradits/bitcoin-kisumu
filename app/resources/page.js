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
      ['Our executive summary', '/executive-summary'],
      ['Our programs', '/programs']
    ]
  }
];

export default function Resources() {
  return (
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
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Safety note</h3>
          <p>Nobody from Bitcoin Kisumu will ever ask for your seed words or offer to double your bitcoin. Anyone who does is a scammer — including accounts that copy our logo.</p>
        </div>
      </div>
    </section>
  );
}
