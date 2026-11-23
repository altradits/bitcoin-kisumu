import Link from 'next/link';

export const metadata = {
  title: 'Page not found | Bitcoin Kisumu',
  description: 'That link splashed out. Find your way back to Bitcoin Kisumu.'
};

const LINKS = [
  ['Home', '/'],
  ['Events', '/events'],
  ['Merchant directory', '/merchants'],
  ['Donate', '/donate'],
  ['Kiswahili', '/sw']
];

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>That link splashed out</h1>
        <p style={{ maxWidth: '44rem' }}>
          The page you wanted is not here — but the lake is full of other
          places to go. Pick one:
        </p>
        <div className="hero-actions">
          {LINKS.map(([label, href]) => (
            <Link key={href} className="btn btn-dark" href={href}>{label}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
