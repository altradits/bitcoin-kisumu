import './globals.css';
import Header from './components/Header';
import { site } from './lib/site';

export const metadata = {
  title: 'Bitcoin Kisumu — Free Bitcoin Education in Kisumu, Kenya',
  description: 'Bitcoin Kisumu brings free, open-source Bitcoin education to Kisumu and Lake Victoria. Meetups, cohorts, workshops and educator training.',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  const socials = site.socials.filter((s) => s.href);
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <h3>Bitcoin Kisumu</h3>
                <p>{site.tagline}</p>
                <p>
                  <a href={site.networkUrl}>Education Network profile</a>
                  {' • '}
                  <a href="/executive-summary">Executive summary</a>
                </p>
              </div>
              <div>
                <h3>Visit</h3>
                <ul>
                  <li><a href="/programs">Programs</a></li>
                  <li><a href="/events">Events &amp; RSVP</a></li>
                  <li><a href="/team">Team</a></li>
                  <li><a href="/donate">Donate</a></li>
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
