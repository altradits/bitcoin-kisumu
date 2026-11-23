import Link from 'next/link';
import { site } from '../lib/site';
import BlinkDonate from '../components/BlinkDonate';
import CopyButton from '../components/CopyButton';

export const metadata = {
  title: 'Donate | Bitcoin Kisumu',
  description: 'Keep every Bitcoin Kisumu class free: donate over Lightning. Small, steady sats beat one big gift.'
};

export default function Donate() {
  const ln = site.lightningAddress;
  const geyser = site.geyserUrl;
  const nostr = site.socials.find((s) => s.label === 'Nostr')?.href;
  const x = site.socials.find((s) => s.label === 'X')?.href;
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
                <p><code className="addr">{ln}</code> <CopyButton text={ln} label="Copy" /></p>
                <p><a className="btn btn-primary" href={`lightning:${ln}`}>Open in my wallet</a></p>
                <p style={{ marginTop: 12 }}>
                  <a href={`lightning:${ln}`} aria-label={`Pay ${ln} with my wallet`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/qr/lightning-donate.svg" alt={`Lightning QR code for ${ln}`} width="200" height="200" style={{ borderRadius: 12, background: '#fff' }} />
                  </a>
                </p>
                <p className="form-note">Scan with Blink, Phoenix or Wallet of Satoshi.</p>
                <BlinkDonate username={ln.split('@')[0]} />
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
              <li>Pilot payments in sats to local earners (see the <Link href="/guide">Guide</Link>)</li>
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
                <p><strong>Geyser campaign launching soon.</strong></p>
                <p className="form-note">
                  {nostr && x ? (
                    <>Follow the launch on <a href={nostr}>Nostr</a> or <a href={x}>X</a> — or support directly via Lightning above.</>
                  ) : (
                    <>Geyser campaign launching soon — support directly via Lightning above.</>
                  )}
                </p>
              </>
            )}
            <h3 style={{ marginTop: 20 }}>Non-sat support</h3>
            <ul>
              <li>Venue partner in Kisumu CBD</li>
              <li>Printing sponsor</li>
              <li>Used smartphones for students</li>
              <li>Volunteer time — see <Link href="/team">team</Link></li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 20 }}>Visiting Kisumu or hiring remotely? <Link href="/partners">Partner with us →</Link> · <Link href="/merch">Shop the collection →</Link></p>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Transparency</h3>
          <p>Every sat sits in our public 3-bucket treasury (35/45/20), tracked on a 6-KPI scorecard with quarterly audit reports. Proof of work unlocks everything.</p>
          <p><a className="btn btn-dark" href="/treasury">Open the treasury &amp; audit</a></p>
        </div>
      </div>
    </section>
  );
}
