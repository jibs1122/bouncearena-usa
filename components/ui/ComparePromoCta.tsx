"use client";

import { useState } from "react";

export type ComparePromo = {
  brand: string;
  code?: string;
  displayValue?: string;
  description: string;
  href: string | null;
  copyable?: boolean;
  actionLabel?: string;
};

function copyFallback(code: string) {
  const el = document.createElement("textarea");
  el.value = code;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export default function ComparePromoCta({ promos }: { promos: ComparePromo[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      copyFallback(code);
    }

    setCopiedCode(code);
    window.setTimeout(() => {
      setCopiedCode((current) => (current === code ? null : current));
    }, 1800);
  }

  if (promos.length === 0) return null;

  const brandNames = Array.from(new Set(promos.map((promo) => promo.brand)));
  const hasCopyableCode = promos.some((promo) => promo.code && promo.copyable !== false);
  const hasLinkActivatedOffer = promos.some((promo) => promo.copyable === false);
  const eyebrow =
    promos.length === 1
      ? hasLinkActivatedOffer && !hasCopyableCode
        ? "Discount link available"
        : "Promo code available"
      : "Promo codes available";

  return (
    <section className="mb-8 rounded-2xl border border-[#ea580c]/30 bg-[#fff7ed] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="lg:flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-bold text-black">
            Save on {brandNames.join(" and ")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
            {promos.length === 1
              ? promos[0].description
              : promos.map((promo) => promo.description).join(" ")}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-wrap gap-3 lg:justify-end">
          {promos.map((promo) => {
            const code = promo.code;
            const displayValue = promo.displayValue ?? code;
            const canCopy = Boolean(code && promo.copyable !== false);
            const isLinkOnly = Boolean(promo.href && !displayValue);
            const copied = canCopy && copiedCode === code;

            return (
              <div
                key={`${promo.brand}-${displayValue ?? promo.href ?? promo.description}`}
                className="flex items-center gap-4 rounded-xl border border-[#ea580c]/30 bg-white px-4 py-3"
              >
                {displayValue && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
                      {promo.brand}
                    </span>
                    <span className="sr-only"> </span>
                    <span className="font-mono text-base font-bold tracking-widest text-[#9a3412]">
                      {displayValue}
                    </span>
                  </div>
                )}
                {isLinkOnly && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
                      {promo.brand}
                    </span>
                  </div>
                )}

                <div className="flex flex-shrink-0 items-center gap-2">
                  {canCopy && code && (
                    <button
                      type="button"
                      onClick={() => copyCode(code)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        copied
                          ? "bg-[#16a34a] text-white"
                          : "bg-[#ea580c] text-white hover:bg-[#c2410c]"
                      }`}
                      aria-label={`Copy ${promo.brand} promo code ${code}`}
                    >
                      {copied ? "Copied" : "Copy code"}
                    </button>
                  )}
                  {canCopy && promo.href ? <span className="sr-only"> </span> : null}
                  {promo.href && (
                    <a
                      href={promo.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className={
                        isLinkOnly
                          ? "rounded-lg bg-[#ea580c] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c2410c]"
                          : "rounded-lg border border-[#ea580c]/30 px-3 py-2 text-xs font-bold text-[#9a3412] transition-colors hover:border-[#ea580c]/60"
                      }
                      aria-label={
                        code
                          ? `Shop ${promo.brand} with promo code ${code}`
                          : `Shop ${promo.brand} with this discount`
                      }
                    >
                      {promo.actionLabel ?? "Shop"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
