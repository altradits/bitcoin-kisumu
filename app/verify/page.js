import Link from 'next/link';
import { PreimageTool, DescriptorTool, Bolt11Tool } from '../components/Verifier';

export const metadata = {
  title: 'Verify — Don’t Trust, Verify | Bitcoin Kisumu',
  description: 'Check a Lightning settlement proof, a watch-only multi-sig descriptor, or a BOLT11 invoice right in your browser. No data leaves this page.'
};

export default function Verify() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>Don&apos;t trust, verify</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}>
            Three cryptographic checks that run 100% in your browser — no
            uploads, no API calls, no private keys. Works offline once loaded.
          </p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>1. Lightning settlement preimage proof</h2>
          <p style={{ maxWidth: '44rem' }}>
            A payment hash commits to its preimage. If <code>SHA256(preimage)</code> equals
            the hash, the payee demonstrably claimed the funds. Try the example, then edit
            one hex character to watch it fail.
          </p>
          <div style={{ marginTop: 18, maxWidth: '36rem' }}>
            <PreimageTool />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>2. Watch-only BIP-380 multi-sig descriptor check</h2>
          <p style={{ maxWidth: '44rem' }}>
            Our treasury publishes watch-only descriptors only. Paste one to confirm
            the <code>wsh(sortedmulti(…))</code> shape — anything containing a private
            extended key is rejected with a warning.
          </p>
          <div style={{ marginTop: 18, maxWidth: '36rem' }}>
            <DescriptorTool />
          </div>
          <p style={{ marginTop: 16 }}><Link href="/treasury">Our proof-of-reserve slot →</Link></p>
        </div>
      </section>

      <section className="section section-wash">
        <div className="wrap">
          <h2>3. BOLT11 invoice inspector</h2>
          <p style={{ maxWidth: '44rem' }}>
            Confirms the network prefix (<code>lnbc</code> mainnet, <code>lntb</code> testnet,{' '}
            <code>lnbcrt</code> regtest) and bech32 structure of a Lightning invoice.
          </p>
          <div style={{ marginTop: 18, maxWidth: '36rem' }}>
            <Bolt11Tool />
          </div>
        </div>
      </section>
    </>
  );
}
