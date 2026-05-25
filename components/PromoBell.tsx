'use client';

import { useState } from 'react';
import { trackOutboundClick } from '@/lib/gtag';

const VULY_AFF = 'https://www.vulyplay.com/aff/100/';
const ACON_AFF = 'https://us.acon24.com?sca_ref=11261719.jjbGKHHa7yLAnuwn';

const PROMOS = [
  { brand: 'Vuly', code: 'BOUNCE15', href: VULY_AFF },
  { brand: 'Acon', code: 'BOUNCE', href: ACON_AFF },
];

export default function PromoBell() {
  const [mobileClosed, setMobileClosed] = useState(false);
  const [desktopClosed, setDesktopClosed] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 1800);
    } catch {}
  }

  function CopyCodeButton({ brand, code }: { brand: string; code: string }) {
    const active = copiedCode === code;
    return (
      <button
        type="button"
        onClick={() => copyCode(code)}
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
  }: {
    brand: string;
    href: string;
    location: string;
  }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        onClick={() => trackOutboundClick({ url: href, label: `Shop ${brand}`, location })}
        className="inline-flex text-xs font-semibold text-[#2e9a94] underline decoration-[#38b1ab]/45 underline-offset-4 transition-colors hover:text-[#247f7a] hover:decoration-[#247f7a]"
      >
        Shop {brand}
      </a>
    );
  }

  return (
    <>
      {/* Desktop: fixed right edge */}
      {!desktopClosed && (
        <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
          <div className="relative">
            <div className="rounded-l-2xl border border-r-0 border-black/10 bg-white/[0.96] px-4 py-4 shadow-[0_16px_40px_-22px_rgba(0,0,0,0.45)] backdrop-blur transition-transform hover:-translate-x-1">
              <div className="w-[184px] pr-7">
                <p className="text-sm font-semibold leading-5 text-black">Trampoline promo codes</p>
                <div className="mt-3 space-y-3">
                  {PROMOS.map((promo) => (
                    <div key={promo.brand} className="rounded-2xl bg-black/[0.025] p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-black/55">{promo.brand}</span>
                        <CopyCodeButton brand={promo.brand} code={promo.code} />
                      </div>
                      <div className="mt-2 pl-[3.1rem]">
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
      {!mobileClosed && (
        <div className="fixed inset-x-0 bottom-3 z-30 px-3 lg:hidden">
          <div className="mx-auto max-w-[26rem] rounded-[1.6rem] border border-black/10 bg-white/[0.96] px-4 py-3 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#38b1ab]">Promo codes</span>
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
            <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {PROMOS.map((promo) => (
                <div key={promo.brand} className="min-w-0 rounded-2xl bg-black/[0.025] p-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="truncate text-xs font-semibold text-black/55">{promo.brand}</span>
                    <CopyCodeButton brand={promo.brand} code={promo.code} />
                  </div>
                  <div className="mt-2">
                    <ShopButton
                      brand={promo.brand}
                      href={promo.href}
                      location={`promo_pill_mobile_${promo.brand.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
