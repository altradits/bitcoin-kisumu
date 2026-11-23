'use client';

import { useEffect } from 'react';
import { site } from './lib/site';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Deliberately not rendered: stack traces stay out of the UI.
    void error;
  }, [error]);

  const whatsapp = site.socials.find((s) => s.label === 'WhatsApp')?.href;

  return (
    <section className="section">
      <div className="wrap">
        <h1>Something went sideways</h1>
        <p style={{ maxWidth: '44rem' }}>
          Sorry about that — please try again. If it keeps happening, reach us
          directly and a human will help.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={() => reset()}>
            Try again
          </button>
          <a className="btn btn-dark" href={`mailto:${site.email}`}>Email us</a>
          {whatsapp && <a className="btn btn-dark" href={whatsapp}>WhatsApp</a>}
        </div>
      </div>
    </section>
  );
}
