import './globals.css';
import Link from 'next/link';
import Header from './components/Header';
import { site } from './lib/site';

const SITE_URL = 'https://bitcoin-kisumu.vercel.app';
const SITE_TITLE = 'Bitcoin Kisumu — Free Bitcoin Education in Kisumu, Kenya';
const SITE_DESCRIPTION = 'Bitcoin Kisumu brings free, open-source Bitcoin education to Kisumu and Lake Victoria. Meetups, cohorts, workshops and educator training.';
const OG_IMAGE = {
  url: '/og/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Bitcoin Kisumu — Learn bitcoin. Earn sats. Spend them locally.'
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Bitcoin Kisumu',
    locale: 'en_KE',
    type: 'website',
    images: [OG_IMAGE]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og/og-default.png']
  }
};

export default function RootLayout({ children }) {
  const socials = site.socials.filter((s) => s.href);
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header />
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <h3>Bitcoin Kisumu</h3>
                <p>{site.tagline}</p>
                <p>
                  <a href={site.networkUrl}>Education Network profile</a>
                  {' • '}
                  <Link href="/executive-summary">Executive summary</Link>
                </p>
              </div>
              <div>
                <h3>Visit</h3>
                <ul>
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/programs">Programs</Link></li>
                  <li><Link href="/events">Events &amp; RSVP</Link></li>
                  <li><Link href="/merchants">Merchants</Link></li>
                  <li><Link href="/merch">Merch</Link></li>
                  <li><Link href="/treasury">Treasury</Link></li>
                  <li><Link href="/donate">Donate</Link></li>
                  <li><Link href="/sw">Kiswahili</Link></li>
                </ul>
              </div>
              <div>
                <h3>Learn more</h3>
                <ul>
                  <li><Link href="/guide">Guide</Link></li>
                  <li><Link href="/pilot">Pilot tracker</Link></li>
                  <li><Link href="/partners">Partners</Link></li>
                  <li><Link href="/resources">Resources</Link></li>
                  <li><Link href="/resources/field-kit">Field kit</Link></li>
                  <li><Link href="/verify">Verify</Link></li>
                  <li><Link href="/stories">Stories</Link></li>
                  <li><Link href="/team">Team</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/executive-summary">Executive summary</Link></li>
                </ul>
              </div>
              <div>
                <h3>Connect</h3>
                <ul>
                  <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                  {socials.map((s) => (
                    <li key={s.label}><a href={s.href}>{s.label}</a></li>
                  ))}
                  {socials.length === 0 && <li>Socials launching soon.</li>}
                </ul>
              </div>
            </div>
            <div className="footer-base">
              <span>© {new Date().getFullYear()} Bitcoin Kisumu. Free &amp; open-source education.</span>
              <span>Independent community in the My First Bitcoin Education Network.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
