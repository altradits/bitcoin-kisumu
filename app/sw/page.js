import Link from 'next/link';

export const metadata = {
  title: 'Karibu Bitcoin Kisumu | Elimu ya Bitcoin kwa Kiswahili',
  description: 'Elimu ya Bitcoin isiyolipishwa na huria kwa Kisumu na Ziwa Victoria. Madarasa bure, meetups na walimu wenyeji.'
};

const LINKS = [
  ['Matukio na madarasa', '/events', 'Jiunge na meetup au cohort ijayo.'],
  ['Rasilimali na mwongozo wa pochi', '/resources', 'Hatua kwa hatua: sakinisha, hifadhi, pokea, tuma.'],
  ['Maduka yanayokubali Bitcoin', '/merchants', 'Orodha ya maduka ya Kisumu.'],
  ['Bidhaa zetu', '/merch', 'Kila ununuzi hufadhili madarasa bure.'],
  ['Changia', '/donate', 'Sats kidogo hufanya darasa liwe bure.'],
  ['Chapisha karatasi za darasani', '/resources/field-kit', 'Kadi za maneno ya siri na mwongozo wa maduka.'],
  ['Mwongozo wa Kiuchumi', '/sw/guide', 'Mpango kamili: nguzo, mishahara, hazina, majaribio.']
];

export default function Swahili() {
  return (
    <div lang="sw">
      <section className="section">
        <div className="wrap">
          <h1>Karibu Bitcoin Kisumu</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Elimu ya Bitcoin isiyolipishwa na huria kwa Kisumu, Kenya.
            Tunafundisha kwa vitendo — si maneno matupu.
          </p>
          <div className="card" style={{ marginTop: 24, borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Kwa nini Ziwa Victoria?</h2>
            <p>
              Ada za kutuma pesa ni kubwa mno, na akiba inapoteza thamani.
              Tunaamini pesa inapaswa kuwahudumia wavuvi, wafanyabiashara na
              wanafunzi wa ziwani — si kuwatoza. Ndiyo maana madarasa yetu ni
              bure kabisa, kwa Kiswahili na Kiingereza.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Jiunge na darasa bure</h2>
          <p style={{ maxWidth: '44rem' }}>
            Huhitaji kompyuta wala ujuzi wa awali — udadisi unatosha.
            Tunakutana kila mwezi mjini Kisumu, na makundi ya mafunzo huchukua
            wiki nane hadi kumi.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/events">Tazama matukio</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Anza na pochi yako ya kwanza</h2>
          <p style={{ maxWidth: '44rem' }}>
            Sakinisha pochi, andika maneno yako 12 ya siri kwenye karatasi
            (kamwe usipige picha!), pokea sats 100, kisha tuma sats 50 kurudi.
            Mwongozo kamili uko hapa:
          </p>
          <div className="hero-actions">
            <Link className="btn btn-dark" href="/resources">Mwongozo wa pochi</Link>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Viungo muhimu</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {LINKS.map(([label, href, desc]) => (
              <div key={href} className="card">
                <h3 style={{ fontSize: '1.15rem' }}><Link href={href}>{label}</Link></h3>
                <p className="form-note">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card" style={{ borderLeft: '6px solid var(--teal)' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Wazungumzaji wa Kidholuo, tunawatafuta</h2>
            <p>
              Kama Kidholuo ni lugha yako ya kuzaliwa: tunalipa bounty kwa
              kutafsiri ukurasa huu wa mwanzo. Hatukubali tafsiri za mashine —
              tunataka Kidholuo halisi cha wenyeji.
            </p>
            <p className="form-note">
              Native Dholuo speaker? Claim a paid translation bounty for this
              starter page — no machine translation accepted.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/partners">Dai bounty</Link>
            </div>
          </div>
          <p className="form-note" style={{ marginTop: 20 }}>
            Ukurasa huu ni toleo la mwanzo. Ukiona kosa la lugha,{' '}
            <Link href="/contact">tuambie</Link> — tunashukuru.
          </p>
        </div>
      </section>
    </div>
  );
}
