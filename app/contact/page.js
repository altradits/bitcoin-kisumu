import { site } from '../lib/site';
import ContactForm from '../components/ContactForm';

export const metadata = {
  title: 'Contact | Bitcoin Kisumu',
  description: 'Applications, volunteering, venues, press — one form reaches the whole Bitcoin Kisumu team.'
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="wrap split">
        <div>
          <h1>Contact</h1>
          <p>Applications, volunteering, venues, press — one form reaches the whole team.</p>
          <dl className="kv" style={{ marginTop: 20 }}>
            <dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
            <dt>Network</dt><dd><a href={site.networkUrl}>Leaderboard profile</a></dd>
            <dt>Reply time</dt><dd>A few days (volunteer-run)</dd>
          </dl>
          <div className="card" style={{ marginTop: 20 }}>
            <h3>Cohort 1 applications</h3>
            <p>Choose “Cohort application”, tell us who you are and why you want in. No prior knowledge needed — curiosity is the entry exam.</p>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
