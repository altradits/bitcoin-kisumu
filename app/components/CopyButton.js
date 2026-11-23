'use client';

import { useEffect, useRef, useState } from 'react';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function done(ok) {
    setCopied(ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  async function copy() {
    try {
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
        done(true);
        return;
      }
      throw new Error('no clipboard API');
    } catch {
      // Fallback for old browsers / non-secure contexts.
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done(true);
      } catch {
        done(false);
      }
    }
  }

  return (
    <>
      <button className="btn btn-dark" type="button" onClick={copy}>
        {copied ? 'Copied!' : label}
      </button>
      <span role="status" className="sr-only">{copied ? 'Copied to clipboard' : ''}</span>
    </>
  );
}
