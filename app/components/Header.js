'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const LINKS = [
  ['/about', 'About'],
  ['/programs', 'Programs'],
  ['/events', 'Events'],
  ['/merchants', 'Merchants'],
  ['/merch', 'Merch'],
  ['/treasury', 'Treasury'],
  ['/donate', 'Donate'],
  ['/sw', 'Kiswahili']
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open ]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="Bitcoin Kisumu mark" width="46" height="46" />
          <span>
            <span className="brand-name">Bitcoin Kisumu</span>
            <br />
            <span className="brand-sub">LAKE VICTORIA • KENYA</span>
          </span>
        </Link>
        <button ref={toggleRef} className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? '✕' : '☰'}
        </button>
        <nav className={`nav${open ? ' open' : ''}`}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
