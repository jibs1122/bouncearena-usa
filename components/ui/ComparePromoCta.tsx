"use client";

import { useState } from "react";

export type ComparePromo = {
  brand: string;
  code: string;
  description: string;
  href: string | null;
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

  return (
    <section className="mb-8 rounded-2xl border border-[#ea580c]/30 bg-[#fff7ed] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
            Promo code available
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

        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          {promos.map((promo) => {
            const copied = copiedCode === promo.code;

            return (
              <div
                key={`${promo.brand}-${promo.code}`}
                className="inline-flex min-w-[12rem] flex-col gap-3 rounded-xl border border-[#ea580c]/30 bg-white px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
                    {promo.brand}
                  </span>
                  <span className="font-mono text-base font-bold tracking-widest text-[#9a3412]">
                    {promo.code}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyCode(promo.code)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      copied
                        ? "bg-[#16a34a] text-white"
                        : "bg-[#ea580c] text-white hover:bg-[#c2410c]"
                    }`}
                    aria-label={`Copy ${promo.brand} promo code ${promo.code}`}
                  >
                    {copied ? "Copied" : "Copy code"}
                  </button>
                  {promo.href && (
                    <a
                      href={promo.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="rounded-lg border border-[#ea580c]/30 px-3 py-2 text-xs font-bold text-[#9a3412] transition-colors hover:border-[#ea580c]/60"
                      aria-label={`Shop ${promo.brand} with promo code ${promo.code}`}
                    >
                      Shop
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
