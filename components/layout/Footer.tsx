import Link from 'next/link';

const PRIMARY_LINKS = [
  { href: '/brands/', label: 'All Brands' },
  { href: '/models/', label: 'Browse Models' },
  { href: '/compare/', label: 'Comparisons' },
  { href: '/quiz/', label: 'Trampoline Quiz' },
];

const SECONDARY_LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy/', label: 'Privacy Policy' },
  { href: '/terms/', label: 'Terms of Use' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-white mt-16">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-base font-semibold text-black">Bounce Arena</p>
            <p className="max-w-xl text-sm leading-6 text-black/45">
              Independent trampoline comparisons, owner reviews, and quiz-based recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 text-center sm:w-fit sm:grid-cols-2 sm:gap-x-20 sm:text-left">
            <nav className="flex flex-col gap-3">
              {PRIMARY_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-black/55 transition-colors hover:text-black"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-col gap-3">
              {SECONDARY_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-black/55 transition-colors hover:text-black"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-8 border-t border-black/[0.06] pt-5 text-center text-xs text-black/30 sm:text-left">
          © Bounce Arena {new Date().getFullYear()}
        </p>
        <p className="mt-3 max-w-2xl text-center text-xs leading-5 text-black/35 sm:text-left">
          Bounce Arena participates in affiliate programs and may earn a commission from qualifying purchases. As an Amazon Associate we earn from qualifying purchases.
        </p>
      </div>
    </footer>
  );
}
