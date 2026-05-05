'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBox, { type SearchItem } from '@/components/SearchBox';

const NAV_LINKS = [
  { href: '/quiz/', label: 'QUIZ' },
  { href: '/brands/', label: 'BRANDS' },
  { href: '/models/', label: 'MODELS' },
  { href: '/compare/', label: 'COMPARE' },
  { href: '/reviews/', label: 'REVIEWS' },
  { href: '/blog/', label: 'BLOG' },
  ...(process.env.NODE_ENV !== 'production' ? [{ href: '/admin/', label: 'ADMIN' }] : []),
];

export default function Header({ searchItems = [] }: { searchItems?: SearchItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black/[0.08]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-3">
        <div className="flex items-center gap-3 lg:grid lg:grid-cols-[auto_minmax(13rem,22rem)_auto]">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/BOUNCE-ARENA-LOGO.webp" alt="Bounce Arena" width={320} height={104} className="h-16 w-auto sm:h-[4.5rem]" />
          </Link>

          {/* Search — desktop only */}
          <div className="hidden lg:flex lg:justify-center">
            <SearchBox items={searchItems} />
          </div>

          {/* Nav + mobile toggle */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0 lg:justify-self-end">
            <nav className="hidden items-center gap-0.5 text-sm font-medium sm:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-2 text-black/60 hover:text-black transition-colors">
                  {label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-black/65 transition-colors hover:bg-black/5 hover:text-black sm:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
                ) : (
                  <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="mt-3 rounded-2xl border border-black/8 bg-white p-2 shadow-[0_18px_36px_-28px_rgba(0,0,0,0.35)] sm:hidden">
            <div className="px-2 pb-2">
              <SearchBox items={searchItems} mobile />
            </div>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-black/65 hover:bg-black/[0.03] hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
