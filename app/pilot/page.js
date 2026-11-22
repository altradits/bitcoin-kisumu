import Link from 'next/link';
import pilot from '../../content/pilot.json';

export const metadata = {
  title: 'Pilot numbers | Bitcoin Kisumu',
  description: 'The five weekly numbers of the 90-day pilot: active shops, first payments, people still holding after 30 days, sats in from outside Kisumu, and sats paid out.'
};

export default function PilotPage() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>{pilot.title}</h1>
        <p style={{ maxWidth: '44rem' }}>
          The <Link href="/guide">Guide</Link> promises five numbers every week during the 90-day pilot.
          This page publishes them per week. {pilot.source} Last updated {pilot.updated}.
        </p>

        <table className="points" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Week</th>
              {pilot.metrics.map((m) => <th key={m.key}>{m.label}</th>)}
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {pilot.weeks.map((w) => (
              <tr key={w.week}>
                <td>{w.week}</td>
                {pilot.metrics.map((m) => <td key={m.key}>{w[m.key]}</td>)}
                <td>{w.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="form-note" style={{ marginTop: 18 }}>
          Numbers come from <code>content/pilot.json</code>. Editing that file and redeploying updates this page.
          What we count and why: <Link href="/guide">the Guide</Link>.
        </p>
      </div>
    </section>
  );
}
