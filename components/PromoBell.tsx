'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackOutboundClick } from '@/lib/gtag';
import {
  ACON_PROMO_AFFILIATE_URL,
  VULY_PROMO_AFFILIATE_URL,
  ZUPAPA_PROMO_AFFILIATE_URL,
} from '@/lib/promoCtas';

const HIDDEN_PROMO_PATHS = new Set(['/privacy', '/terms', '/contact', '/admin', '/zupapa-promo-code']);
// The mobile bottom pill covers the first answer options on the quiz, so hide it there.
const HIDDEN_MOBILE_PROMO_PATHS = new Set(['/quiz']);

const PROMOS = [
  { brand: 'Vuly', code: 'BOUNCE15', href: VULY_PROMO_AFFILIATE_URL },
  { brand: 'Acon', code: 'BOUNCE', href: ACON_PROMO_AFFILIATE_URL },
  { brand: 'Zupapa', code: 'BOUNCE', href: ZUPAPA_PROMO_AFFILIATE_URL },
];

export default function PromoBell() {
  const pathname = usePathname();
  const [mobileClosed, setMobileClosed] = useState(false);
  const [desktopClosed, setDesktopClosed] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  if (HIDDEN_PROMO_PATHS.has(normalizedPath)) return null;
  const hideMobile = HIDDEN_MOBILE_PROMO_PATHS.has(normalizedPath);

  async function copyCode(brand: string, code: string) {
    const copiedKey = `${brand}:${code}`;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(copiedKey);
      window.setTimeout(() => {
        setCopiedCode((current) => (current === copiedKey ? null : current));
      }, 1800);
    } catch {}
  }

  function CopyCodeButton({ brand, code }: { brand: string; code: string }) {
    const active = copiedCode === `${brand}:${code}`;
    return (
      <button
        type="button"
        onClick={() => copyCode(brand, code)}
        aria-label={`Copy ${brand} promo code ${code}`}
        className={`h-8 min-w-[5.75rem] rounded-full border px-3 text-[11px] font-bold transition-colors ${
          active
            ? 'border-[#38b1ab] bg-[#38b1ab] text-white'
            : 'border-black/10 bg-black/[0.03] text-black/65 hover:border-[#38b1ab]/35 hover:text-[#38b1ab]'
        }`}
      >
        <span className="block text-center">{active ? 'Copied' : code}</span>
      </button>
    );
  }

  function ShopButton({
    brand,
    href,
    location,
    label = `Shop ${brand}`,
  }: {
    brand: string;
    href: string;
    location: string;
    label?: string;
  }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        onClick={() => trackOutboundClick({ url: href, label, location })}
        className="inline-flex whitespace-nowrap text-xs font-semibold text-[#2e9a94] underline decoration-[#38b1ab]/45 underline-offset-4 transition-colors hover:text-[#247f7a] hover:decoration-[#247f7a]"
      >
        {label}
      </a>
    );
  }

  function MobileCopyCodeButton({ brand, code }: { brand: string; code: string }) {
    const active = copiedCode === `${brand}:${code}`;
    return (
      <button
        type="button"
        onClick={() => copyCode(brand, code)}
        aria-label={`Copy ${brand} promo code ${code}`}
        className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-1.5 text-center transition-colors ${
          active
            ? 'border-[#38b1ab] bg-[#38b1ab] text-white'
            : 'border-black/5 bg-black/[0.035] text-black/65 hover:border-[#38b1ab]/35 hover:text-[#38b1ab]'
        }`}
      >
        <span className={`w-full truncate text-[10px] font-semibold leading-3 ${active ? 'text-white/85' : 'text-black/55'}`}>
          {brand}
        </span>
        <span className="w-full truncate text-[11px] font-bold leading-4">{active ? 'Copied' : code}</span>
      </button>
    );
  }

  return (
    <>
      {/* Desktop: fixed right edge */}
      {!desktopClosed && (
        <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
          <div className="relative">
            <div className="rounded-l-2xl border border-r-0 border-black/10 bg-white/[0.96] px-4 py-4 shadow-[0_16px_40px_-22px_rgba(0,0,0,0.45)] backdrop-blur transition-transform hover:-translate-x-1">
              <div className="w-[228px] pr-7">
                <p className="text-sm font-semibold leading-5 text-black">Trampoline promo codes</p>
                <div className="mt-3 space-y-3">
                  {PROMOS.map((promo) => (
                    <div key={promo.brand} className="rounded-2xl bg-black/[0.025] p-2.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-black/55">{promo.brand}</span>
                        <CopyCodeButton brand={promo.brand} code={promo.code} />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <ShopButton
                          brand={promo.brand}
                          href={promo.href}
                          location={`promo_pill_desktop_${promo.brand.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-black/45">Click a code to copy.</p>
                <p className="mt-2 text-[11px] leading-4 text-black/35">
                  We may earn a commission on purchases.
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close promo codes"
              onClick={() => setDesktopClosed(true)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/70"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" /><path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile: fixed bottom pill */}
      {!mobileClosed && !hideMobile && (
        <div
          aria-hidden="true"
          className="h-[6.75rem] lg:hidden"
        />
      )}
      {!mobileClosed && !hideMobile && (
        <div className="fixed inset-x-0 z-30 px-3 lg:hidden" style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="mx-auto max-w-[26rem] rounded-[1.35rem] border border-black/10 bg-white/[0.96] px-3 py-2 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[11px] font-bold uppercase leading-4 tracking-[0.1em] text-[#38b1ab]">
                Promo codes <span className="font-semibold normal-case tracking-normal text-black/45">(click to copy)</span>
              </span>
              <button
                type="button"
                aria-label="Close promo codes"
                onClick={() => setMobileClosed(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/70"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12" /><path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {PROMOS.map((promo) => (
                <MobileCopyCodeButton key={promo.brand} brand={promo.brand} code={promo.code} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
