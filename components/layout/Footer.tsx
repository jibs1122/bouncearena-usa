import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/brands/', label: 'All Brands' },
  { href: '/models/', label: 'Browse Models' },
  { href: '/compare/', label: 'Comparisons' },
  { href: '/quiz/', label: 'Trampoline Quiz' },
  { href: '/about/', label: 'About' },
  { href: '/privacy/', label: 'Privacy Policy' },
  { href: '/terms/', label: 'Terms of Use' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-white mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <nav className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-black/50 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-xs text-black/30 leading-relaxed">
          <strong className="text-black/40">Affiliate Disclosure:</strong> Bounce Arena participates in
          affiliate marketing. Some links on this site are affiliate links — we may earn a commission if you
          click through and make a purchase, at no extra cost to you.
        </p>

        <p className="mt-3 text-center text-xs text-black/30">
          © Bounce Arena {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
