import Link from 'next/link';

const PROGRAMS = [
  {
    title: 'Bitcoin Diploma Cohorts',
    meta: '8–10 weeks • Free • Certified graduation',
    body: 'The full My First Bitcoin curriculum with trained educators: money, Bitcoin, security, Lightning, self-custody. In-person sessions plus study groups. Graduates can join the educator pipeline.',
    cta: ['Apply via contact', '/contact']
  },
  {
    title: 'Monthly Meetups',
    meta: 'First Thursday • 17:30 EAT • Open to all',
    body: 'BitDevs-style evenings: a short talk, a live demo, open Q&A. Beginners welcome, no laptop needed. Bring a curious friend.',
    cta: ['RSVP', '/events']
  },
  {
    title: 'First-Wallet Workshops',
    meta: 'Monthly Saturdays • 10:00 EAT • Hands-on',
    body: 'Install a wallet, write down and verify a backup, send and receive. Leave with something working — and the habits to keep it safe.',
    cta: ['RSVP', '/events']
  },
  {
    title: 'Merchant Track',
    meta: 'For Kisumu shops • Practical',
    body: 'For shops and stalls that want to accept Bitcoin: pricing, Lightning receive, record-keeping, volatility basics. Goal: five live merchants in year one.',
    cta: ['Talk to us', '/contact']
  },
  {
    title: 'Educator Training',
    meta: 'Graduates • Teach the next cohort',
    body: 'Our compounding loop: strong graduates learn to teach — facilitation, curriculum walkthroughs, supervised sessions. Goal: four local educators in year one.',
    cta: ['Talk to us', '/contact']
  }
];

export default function Programs() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Programs</h1>
        <p style={{ maxWidth: '44rem' }}>Five tracks, one rule: every class is free, open-source and practical. Points we earn on the Education Network Leaderboard come from exactly this work — cohorts taught, students graduated, educators trained.</p>
        <div style={{ display: 'grid', gap: 18, marginTop: 28 }}>
          {PROGRAMS.map((p) => (
            <article key={p.title} className="card">
              <h2 style={{ fontSize: '1.4rem' }}>{p.title}</h2>
              <p style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '0.92rem' }}>{p.meta}</p>
              <p>{p.body}</p>
              <Link className="btn btn-dark" href={p.cta[1]}>{p.cta[0]}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
