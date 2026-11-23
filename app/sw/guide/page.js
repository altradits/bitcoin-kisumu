import Link from 'next/link';

export const metadata = {
  title: 'Mwongozo wa Uchumi wa Ziwa Victoria | Bitcoin Kisumu',
  description: 'Jinsi elimu ya Bitcoin isiyolipishwa inavyogeuka kuwa ajira za Ziwa Victoria: nguzo tano, malipo salama, hazina ya wazi na majaribio ya siku 90.'
};

const PILLARS = [
  [
    'Uhifadhi wa Samaki kwa Sola',
    'Sehemu za kuhifadhi samaki kwa nishati ya jua kwenye vituo vya samaki ili wavuvi wauze wakiwa wabichi badala ya kuharakisha. Vituo hivi vinalipa kwa sats na kuimarisha kundi la maduka.'
  ],
  [
    'Gugu-maji kuwa Biogesi',
    'Kuvuna gugu linaloziba ziwa na kuligeuza biogesi na mbolea. Kazi ya usafi wa ziwa inalipa badala ya kutegemea michango ya mara moja.'
  ],
  [
    'Utalii wa Kiikolojia na Bidhaa za Kisumu',
    'Ziara za ziwani, kazi za mikono na bidhaa za Bitcoin Kisumu kwa wageni — wanalipa kwa sats. Sats za wageni ni mapato safi kabisa kutoka nje.'
  ],
  [
    'Kutuma Pesa Mipakani na Diaspora',
    'Kufundisha familia zinazopokea kutoka Uganda, Tanzania na diaspora kupokea kwa Lightning badala ya njia ghali zinazokata makato makubwa.'
  ],
  [
    'Kikundi cha Kazi za Kidijitali',
    'Wahitimu wanauza uandishi, tafsiri, usanifu na kodi kwa wanunuzi wa nje, wakalipwa kwa sats. Kiswahili na Kidholuo ndiyo faida yetu kubwa.'
  ]
];

const PAYROLL = [
  ['Daraja 1 — Mwanzo (85/15)', 'Weka 15% kwa sats, toa 85% kwa M-Pesa mara moja. Kwa wanaoanza kujifunza kujitunzia — usicheze kamari na kodi ya nyumba.'],
  ['Daraja 2 — Imara (70/30)', 'Weka 30% kwa sats baada ya mwezi wa kuthibitisha tabia salama za kuhifadhi na njia za matumizi.'],
  ['Daraja 3 — Biashara kwa Biashara (B2B)', 'Maduka na wauzaji huhifadhi akiba ya kazi kwa sats ili kulipana wao kwa wao, wakitoa ziada pekee kwenda nje.']
];

const PILOT = [
  ['Kabla ya siku 1', [
    'Panga chungu kimoja cha pesa na kiasi kwa kila kazi. Usiahidi zaidi ya kilichopo.',
    'Thibitisha eneo: kundi lenye watu wengi kando ya ziwa — Dunga Beach na ukanda wa Kisumu.',
    'Kusanya kundi: maduka 10–15 yanayofanya biashara pamoja na wauzaji wao wa jumla.'
  ]],
  ['Siku 1 hadi 30', [
    'Lipa kila Ijumaa, kwa matokeo yaliyothibitishwa pekee, kwa Daraja 1 (85/15).',
    'Siku ya kwanza ya soko: pata asubuhi, tumia kwa maduka ya kundi jioni hiyohiyo.',
    'Chapisha taarifa fupi kila wiki yenye namba halisi.'
  ]],
  ['Siku 31 hadi 90', [
    'Peleka wanaofaulu Daraja 2 (70/30); jozi za B2B zianze kuhifadhi sats (Daraja 3).',
    'Endelea na kinachofanya kazi, acha kisichofanya.',
    'Siku ya 90, chapisha namba zote wazi. Ripoti hiyo ndiyo itakayoshinda duru ijayo.'
  ]]
];

export default function SwahiliGuide() {
  return (
    <div lang="sw">
      <section className="section">
        <div className="wrap">
          <h1>Mwongozo wa Uchumi Endelevu wa Ziwa Victoria</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Jinsi tunavyogeuza elimu ya Bitcoin isiyolipishwa kuwa ajira za Ziwa
            Victoria — na jinsi kazi yenyewe itakavyojilipa baada ya ufadhili.
            Tunauchapisha wazi ili mtuweze kutuwajibisha.
          </p>
          <p><Link href="/guide">Read the full playbook in English →</Link></p>
          <div className="card" style={{ marginTop: 24, borderLeft: '6px solid var(--orange)' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Kanuni Moja</h2>
            <p>Sats zaidi ziingie Kisumu kutoka nje kuliko zinazotoka. Michango hutupatia mwanzo. Mapato ndiyo hutuweka hai.</p>
          </div>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Nguzo 5 za Mapato na Ajira za Ziwa Victoria</h2>
          <p style={{ maxWidth: '48rem' }}>Elimu hujaza bomba; nguzo hizi huwageuza wahitimu kuwa wafanyabiashara, na michango kuwa nyongeza badala ya tegemeo.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {PILLARS.map(([name, what]) => (
              <article key={name} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{name}</h3>
                <p>{what}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="wrap">
          <h2>Mpango Salama wa Malipo</h2>
          <p>Wanaopata hupanda madaraja kadiri tabia zao salama zinavyothibitika. Daraja, si mtu, ndilo liamualo mgao.</p>
          <p><Link href="/resources#calculator">Jaribu kikokotoo mwenyewe →</Link></p>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {PAYROLL.map(([tier, rule]) => (
              <div key={tier}>
                <h3 style={{ fontSize: '1.1rem' }}>{tier}</h3>
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Hazina ya Vikapu 3 na Sheria za Usalama</h2>
          <p style={{ maxWidth: '48rem' }}>
            Kila sat inakaa kwenye mojawapo ya vikapu vitatu — Uendeshaji na
            Elimu (35%), Mtaji wa Ziwa na Majaribio (45%), Akiba ya BTC na
            Uzingatiaji (20%) — chini ya multi-sig 2-of-3, hakuna ufunguo mmoja
            unaoweza kusogeza pesa.
          </p>
          <ul className="program-list" style={{ maxWidth: '48rem' }}>
            <li>Anzia na kiasi kidogo: kujitunzia mwenyewe, maneno ya siri yameandikwa, malipo moja halisi pamoja.</li>
            <li>Hatushiki pesa za mtu yeyote. Tunalipa moja kwa moja kwenye pochi yako mwenyewe.</li>
            <li>Sheria ya Kenya kuhusu Watoa Huduma za Mali Mtandaoni (VASP 2025) pamoja na Kanuni za 2026 zinasimamia biashara za uhifadhi na ubadilishaji. Sisi tunabaki upande usio wa uhifadhi: elimu, kujitunzia mwenyewe na malipo kwenye pochi za watu.</li>
          </ul>
          <p style={{ marginTop: 16 }}><Link href="/treasury">Tazama hazina ya wazi na ukaguzi →</Link></p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>Majaribio ya Siku 90 — Kundi la Dunga Beach</h2>
          <p style={{ maxWidth: '48rem' }}>Si maduka matano yaliyotawanyika — kundi moja lenye watu wengi kando ya ziwa, ambapo maduka 10–15 na wauzaji wao wa jumla hufanya biashara kila siku.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
            {PILOT.map(([phase, steps]) => (
              <article key={phase} className="card">
                <h3 style={{ fontSize: '1.15rem' }}>{phase}</h3>
                <ul className="program-list">{steps.map((s) => <li key={s}>{s}</li>)}</ul>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 16 }}><Link href="/pilot">Fuatilia majaribio wiki kwa wiki →</Link></p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Unataka kusaidia?</h2>
          <p style={{ maxWidth: '44rem' }}>Fadhili majaribio, ajiri msanii wa Kiswahili, orodhesha duka lako, au tembelea ukalipe dukani.</p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" href="/donate">Changia majaribio</Link>
            <Link className="btn btn-dark" href="/merchants">Orodha ya maduka</Link>
            <Link className="btn btn-dark" href="/contact">Wasiliana nasi</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
