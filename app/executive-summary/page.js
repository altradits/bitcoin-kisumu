import Link from 'next/link';

export const metadata = {
  title: 'Executive Summary | Bitcoin Kisumu',
  description: 'The problem, solution, programs and year-one goals of Bitcoin Kisumu in one page.'
};

export default function ExecutiveSummary() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Executive Summary</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '44rem' }}><strong>Free, open-source Bitcoin education for Kisumu, Kenya.</strong> This page mirrors our Leaderboard executive summary (100 pts).</p>

        <h2>Problem</h2>
        <p>Kisumu&apos;s households and micro-businesses pay some of the world&apos;s highest remittance and payment fees, settle slowly, and save in currencies that lose value. Useful Bitcoin knowledge is locked behind English-only internet content, trading scams, and Nairobi-centric events that never reach the lake region.</p>

        <h2>Solution</h2>
        <p>A local, in-person education community teaching the My First Bitcoin open-source curriculum: the Bitcoin Diploma for students, wallet-and-Lightning workshops for traders, merchant onboarding for shops, and educator training so the work compounds. Graduates feed five Lake Victoria revenue pillars so free classes lead to paid livelihoods — see our <Link href="/guide">playbook</Link>.</p>

        <h2>Programs</h2>
        <ol>
          <li><strong>Cohorts</strong> — 8–10 week Bitcoin Diploma groups, free, certified graduation.</li>
          <li><strong>Meetups</strong> — monthly open gatherings: talks, demos, Q&amp;A.</li>
          <li><strong>Workshops</strong> — first wallet, Lightning, security &amp; self-custody.</li>
          <li><strong>Merchant track</strong> — a 10–15 merchant Dunga Beach pilot cluster with B2B suppliers, listed in our <Link href="/merchants">public directory</Link>.</li>
          <li><strong>Educator pipeline</strong> — 4 local educators trained in year one.</li>
        </ol>

        <h2>Operating model</h2>
        <p>Volunteer-led, donation-funded, transparent. Funds go to venue, printouts, educator transport, and subsidised phones/data for students who need them. Community funds sit in a 3-bucket multi-sig treasury with quarterly public audits — see <Link href="/treasury">treasury &amp; impact audit</Link>.</p>

        <h2>Sustainability path</h2>
        <p>Education → livelihoods → autonomy. The 90-day Dunga Beach pilot targets an earned-revenue ratio ≥25% (earned sats ÷ OpEx); pillar income scales that toward 80–100% by month 12, so grants become a top-up, not the lifeline.</p>

        <h2>Year-one goals</h2>
        <table className="points">
          <thead><tr><th>Metric</th><th>Target</th></tr></thead>
          <tbody>
            <tr><td>Students graduated (3 cohorts)</td><td>50+</td></tr>
            <tr><td>Educators trained</td><td>4</td></tr>
            <tr><td>Merchant cluster launched</td><td>10–15 (Dunga Beach pilot)</td></tr>
            <tr><td>Earned-revenue ratio at Day 90</td><td>≥25%</td></tr>
            <tr><td>Meetups / workshops</td><td>12 / 6</td></tr>
            <tr><td>Education Network tier</td><td>Tier 3+ (500+ pts)</td></tr>
          </tbody>
        </table>

        <h2 style={{ marginTop: 24 }}>Team &amp; ask</h2>
        <p>Stanley (community lead), Ivy (education), plus volunteer educators and organisers — see <Link href="/team">team</Link>. We seek venue partners, printing sponsors, used phones, and Lightning donations to keep every class free — see <Link href="/donate">donate</Link>.</p>
        <p className="form-note">Independent community in the My First Bitcoin Education Network: network.myfirstbitcoin.org/community/bitcoin-kisumu</p>
      </div>
    </section>
  );
}
