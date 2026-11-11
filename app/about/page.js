export default function About() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>About Bitcoin Kisumu</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
          We bring free, open-source Bitcoin education to Kisumu and the Lake Victoria region —
          an independent community in the My First Bitcoin Education Network.
        </p>
        <div className="split" style={{ marginTop: 28 }}>
          <div>
            <h2>Why we started</h2>
            <p>Financial exclusion is still normal around the lake: high fees, slow settlement, savings that melt to inflation. Bitcoin, learned properly, is a practical alternative — and nobody was teaching it here in an open, beginner-friendly way.</p>
            <h2>Where we operate</h2>
            <p>Kisumu, Kenya&apos;s lakeside city — serving students, traders, fishermen, boda riders and small businesses across Kisumu County and wider western Kenya.</p>
            <h2>How we educate</h2>
            <p>In-person first, the My First Bitcoin way. Cohorts work through open-source material with trained educators, hands-on wallet setup and Lightning practice. No hype, no trading promises — fundamentals: money, Bitcoin, security, self-custody.</p>
          </div>
          <div>
            <h2>What we run</h2>
            <ul className="program-list">
              <li><strong>Monthly meetups</strong> — open BitDevs-style gatherings</li>
              <li><strong>Beginner wallet workshops</strong> — first wallet + backup</li>
              <li><strong>School &amp; campus outreach</strong></li>
              <li><strong>Merchant onboarding</strong> — shops that accept Bitcoin</li>
              <li><strong>Educator training</strong> — graduates teach the next cohort</li>
            </ul>
            <h2 style={{ marginTop: 24 }}>Who we reach</h2>
            <p>Curious beginners first — youth, students, market traders, community groups — especially people who never had a bank account that worked for them.</p>
            <h2>Now &amp; next</h2>
            <p>Now: completing our Network profile, publishing this site, recruiting cohort 1 and two more educators. Next: graduate cohort 1, run a youth holiday program, onboard five merchants, publish our first transparency report.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
