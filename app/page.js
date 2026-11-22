import Link from 'next/link';
import { site, events } from './lib/site';
import NewsletterForm from './components/NewsletterForm';

// Homepage copy in Dholuo (issue #11). Machine-assisted first draft:
// a native Dholuo speaker must review before merge (see PR).

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Puonj mar bitcoin ne joka nyanam maonge chudo</h1>
            <p className="lede">
              {site.taglineDholuo} Wanigo baraza, puonj mar jodong&apos; kod dul malong&apos;o mar
              Bitcoin Diploma e Kisumu — kod puonj mar jopuonj mondo ng&apos;ado obed e pinywa.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/events">Donj e baraza</Link>
              <Link className="btn btn-ghost" href="/programs">Yaw program</Link>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#9fb6c8' }}>
              Komuniti mayot e{' '}
              <a href={site.networkUrl} style={{ color: '#ffd9a0' }}>My First Bitcoin Education Network</a>.
            </p>
          </div>
          <dl className="hero-facts">
            <dt>Kanye</dt>
            <dd>Kisumu, Kenya — e nam lolwe</dd>
            <dt>Nade</dt>
            <dd>E dala machon kod wallets ma nyuol e lweny</dd>
            <dt>Chulo</dt>
            <dd>Maonge chulo. Ma chulo gi konywa kod joprom.</dd>
            <dt>Chonjo machon</dt>
            <dd><Link href="/about" style={{ color: '#ffd9a0' }}>Nikech wacako →</Link></dd>
          </dl>
        </div>
        <svg className="waves" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 Q 75 20, 150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40 V60 H0 Z" fill="#ffffff" />
          <path d="M0 48 Q 75 30, 150 48 T 300 48 T 450 48 T 600 48 T 750 48 T 900 48 T 1050 48 T 1200 48" fill="none" stroke="#0799b6" strokeWidth="3" />
        </svg>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>Gima wamito, wiki ka wiki</h2>
            <p>
              Onge gima rach. Wapuonj pesa, Bitcoin, ber marogel kod self-custody — gima miyo
              jo-student, jodala kod jomoda oyue Bitcoin maber.
            </p>
            <ul className="program-list">
              <li><strong>Baraza mar dwezi</strong> — lok ma opoore, demos, Q&amp;A. Ber gi s ang&apos;wen.</li>
              <li><strong>Workshop mar wallet maber</strong> — chop ki wallet ma tiyo kod backup.</li>
              <li><strong>Dul mar Bitcoin Diploma</strong> — somo mar wiki 8–10, maonge chulo, ki certificate.</li>
              <li><strong>Program mar duka</strong> — kony duka e Kisumu mondo gamo Bitcoin.</li>
            </ul>
            <p style={{ marginTop: 16 }}><Link className="btn btn-dark" href="/programs">Program machon</Link></p>
          </div>
          <div className="card">
            <h3>Ma biro</h3>
            {events.slice(0, 3).map((e) => (
              <p key={e.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <strong>{e.title}</strong><br />
                <span style={{ color: 'var(--muted)', fontSize: '0.93rem' }}>{e.date} — {e.venue}</span>
              </p>
            ))}
            <p><Link href="/events">Ndikri e baraza →</Link></p>
            <h3 style={{ marginTop: 24 }}>Chiw kony ne pwonj ma nono</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Yamo, printouts, transport mar jopuonj. Klas duto maonge chulo nikech donors o chulo.
            </p>
            <p><Link className="btn btn-primary" href="/donate">Miy kony</Link></p>
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap split">
          <div>
            <h2>Nikech gimoro Kisumu?</h2>
            <p>
              Chulo madongo kod pesa ma nyuol ma podi bedo e nam podi gin. Bitcoin, ma opuonj maber,
              en yubo maber — kendo onge ma opuonj e kido e yo. Omia wacako.
            </p>
            <p><Link href="/about" style={{ color: 'var(--gold)' }}>Wikitwa, yore kod gano mar higa maber →</Link></p>
          </div>
          <div>
            <h3>Nge mar dwezi</h3>
            <p style={{ color: '#9fb6c8', fontSize: '0.95rem' }}>Email moko mar chiek e dwezi: tarikh, dul ma biro, lok mar jo-maru.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
