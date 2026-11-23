import Link from 'next/link';

export const metadata = {
  title: 'Programs | Bitcoin Kisumu',
  description: 'Five tracks from free classes to livelihoods: cohorts, meetups, workshops, merchant track and educator training.'
};

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
    body: 'For shops and stalls that want to accept Bitcoin: pricing, Lightning receive, record-keeping, volatility basics. Anchored by the Dunga Beach pilot cluster — 10–15 interconnected merchants and B2B suppliers, listed in our merchant directory once live.',
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
        <p style={{ maxWidth: '44rem' }}>Five tracks, one bridge: free My First Bitcoin education → productive Lake Victoria livelihoods → post-grant financial autonomy. Classes fill the pipeline, the circular-economy playbook turns graduates into earners, and pillar revenue keeps every class free.</p>
        <div style={{ display: 'grid', gap: 18, marginTop: 28 }}>
          {PROGRAMS.map((p) => (
            <article key={p.title} className="card">
              <h2 style={{ fontSize: '1.4rem' }}>{p.title}</h2>
              <p style={{ color: 'var(--teal-ink)', fontWeight: 700, fontSize: '0.92rem' }}>{p.meta}</p>
              <p>{p.body}</p>
              <Link className="btn btn-dark" href={p.cta[1]}>{p.cta[0]}</Link>
            </article>
          ))}
        </div>
        <div className="card" style={{ marginTop: 28, borderLeft: '6px solid var(--teal)' }}>
          <h2 style={{ fontSize: '1.4rem' }}>From free classes to livelihoods</h2>
          <p style={{ maxWidth: '44rem' }}>Graduation is the middle, not the end. Our playbook lays out the revenue pillars, payroll standard and treasury policy that carry learners into paid lake-economy work — tracked openly, quarter by quarter. Our Diploma cohorts adapt the open-source <a href="https://github.com/MyFirstBitcoin/mfb-curriculum">MyFirstBitcoin/mfb-curriculum</a> (8h+ modular course), and code-curious graduates level up at <Link href="/events">BitDevs Kisumu</Link> evenings.</p>
          <div className="hero-actions">
            <Link className="btn btn-dark" href="/guide">The playbook</Link>
            <Link className="btn btn-dark" href="/merchants">Merchant directory</Link>
            <Link className="btn btn-dark" href="/treasury">Treasury &amp; audit</Link>
            <Link className="btn btn-dark" href="/stories">Stories</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
