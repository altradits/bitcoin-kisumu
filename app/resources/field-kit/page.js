import PrintButton from '../../components/PrintButton';

export const metadata = {
  title: 'Field Kit — Printable Classroom Sheets | Bitcoin Kisumu',
  description: 'Print-ready bilingual seed-word backup card and Dunga Beach merchant counter card. Made for offline Kisumu classrooms.'
};

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

function WordGrid({ from, to }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
      {range(from, to).map((n) => (
        <div
          key={n}
          style={{
            border: '1.5px solid #44586b', borderRadius: 8, minHeight: 44,
            padding: '6px 10px', fontSize: '0.9rem', color: '#44586b'
          }}
        >
          {n}.
        </div>
      ))}
    </div>
  );
}

const MERCHANT_STEPS = [
  'Enter the KES amount — the till shows the sats total.',
  'Show the QR — the customer scans and pays from any Lightning wallet.',
  'Wait for the green check — only hand over goods after confirmation.',
  'Record it in the daily book — date, KES, sats, done.'
];

export default function FieldKit() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Kisumu classroom &amp; field kit</h1>
          <p style={{ maxWidth: '44rem' }}>
            Two handouts for offline Kisumu: a seed-word backup card and a
            merchant counter card. Print double-sided on A4 and cut.
          </p>
          <div className="hero-actions">
            <PrintButton />
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>1. Paper seed-word backup card (English + Kiswahili)</h2>
          <div className="card" style={{ marginTop: 18, breakInside: 'avoid' }}>
            <p style={{ fontWeight: 700 }}>Wallet name: ____________________&nbsp;&nbsp;&nbsp;Date: ____________</p>
            <WordGrid from={1} to={12} />
            <h3 style={{ fontSize: '1.05rem', marginTop: 18 }}>Words 13–24 (optional, for 24-word wallets)</h3>
            <WordGrid from={13} to={24} />
            <div style={{ marginTop: 18, borderLeft: '6px solid #b3261e', paddingLeft: 14 }}>
              <p style={{ fontWeight: 800, margin: 0 }}>
                Write on paper only — never screenshot, never share. Bitcoin
                Kisumu will never ask for these words.
              </p>
              <p style={{ fontWeight: 800, margin: '8px 0 0' }}>
                Andika kwenye karatasi pekee — usipige picha, usimpe mtu
                yeyote. Bitcoin Kisumu hawatawahi kuomba maneno haya.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>2. Dunga Beach merchant counter quick-card</h2>
          <div className="card" style={{ marginTop: 18, breakInside: 'avoid' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Accept Lightning in 4 steps</h3>
            <ol>
              {MERCHANT_STEPS.map((s) => <li key={s} style={{ marginBottom: 8 }}>{s}</li>)}
            </ol>
            <p style={{ fontWeight: 800 }}>
              10% off for customers who pay in Lightning sats!
            </p>
            <p className="form-note">
              Self-custody reminder: your keys stay on your phone, pricing stays
              in shillings, and nobody from Bitcoin Kisumu will ever ask for
              your backup words.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
