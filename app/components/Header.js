'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/programs', 'Programs'],
  ['/events', 'Events'],
  ['/team', 'Team'],
  ['/donate', 'Donate'],
  ['/resources', 'Resources'],
  ['/contact', 'Contact']
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
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
