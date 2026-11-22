import { site } from '../lib/site';

export default function Donate() {
  const ln = site.lightningAddress;
  const geyser = site.geyserUrl;
  return (
    <section className="section">
      <div className="wrap">
        <h1>Donate</h1>
        <p style={{ maxWidth: '44rem' }}>Every class is free because donors cover venue, printouts, educator transport and data subsidies. Small, steady sats beat one big gift.</p>
        <div className="split" style={{ marginTop: 28 }}>
          <div className="card light-card">
            <h2 style={{ fontSize: '1.35rem' }}>Lightning</h2>
            {ln ? (
              <>
                <p>Send to our Lightning address:</p>
                <p><code className="addr">{ln}</code></p>
                <p><a className="btn btn-primary" href={`lightning:${ln}`}>Open in my wallet</a></p>
              </>
            ) : (
              <>
                <p><strong>Lightning address launching soon.</strong></p>
                <p className="form-note">Maintainer: set <code>lightningAddress</code> in <code>app/lib/site.js</code> (and <code>content/donate.md</code>), then add it to the Leaderboard profile for 10 pts.</p>
              </>
            )}
            <h3 style={{ marginTop: 20 }}>How funds are used</h3>
            <ul>
              <li>Venue hire &amp; chairs</li>
              <li>Printed handouts &amp; certificates</li>
              <li>Educator transport</li>
              <li>Phones / data subsidies for students</li>
              <li>Pilot payments in sats to local earners (see the <a href="/guide">Guide</a>)</li>
            </ul>
          </div>
          <div className="card light-card">
            <h2 style={{ fontSize: '1.35rem' }}>Fundraise with us</h2>
            {geyser ? (
              <>
                <p>Support or share our campaign:</p>
                <p><a className="btn btn-primary" href={geyser}>Open Geyser project</a></p>
              </>
            ) : (
              <>
                <p><strong>Geyser project launching soon.</strong></p>
                <p className="form-note">Maintainer: set <code>geyserUrl</code> in <code>app/lib/site.js</code>, then add it to the Leaderboard for 10 pts.</p>
              </>
            )}
            <h3 style={{ marginTop: 20 }}>Non-sat support</h3>
            <ul>
              <li>Venue partner in Kisumu CBD</li>
              <li>Printing sponsor</li>
              <li>Used smartphones for students</li>
              <li>Volunteer time — see <a href="/team">team</a></li>
            </ul>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Transparency</h3>
          <p>Quarterly reports land here and on the Leaderboard: amounts received, spent, students graduated, events held. Proof of work unlocks everything.</p>
        </div>
      </div>
    </section>
  );
}
