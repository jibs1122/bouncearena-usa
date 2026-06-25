"use client";

import { useState } from "react";

interface Promo {
  brand: string;
  code?: string;
  description: string;
  expires?: string;
  affiliateUrl?: string;
  copyable?: boolean;
  actionLabel?: string;
}

export default function PromoCard({ promo }: { promo: Promo }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!promo.code) return;

    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = promo.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-white border border-black/[0.08] hover:border-[#38b1ab]/40 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-black text-lg">{promo.brand}</p>
          <p className="text-sm text-black/50 mt-0.5">{promo.description}</p>
        </div>
        {promo.expires && (
          <span className="text-xs text-black/30 whitespace-nowrap mt-1">
            Exp: {promo.expires}
          </span>
        )}
      </div>

      {(promo.code || promo.copyable !== false) && (
        <div className="flex items-center gap-2">
          {promo.code && (
            <div className="flex-1 bg-black/[0.03] border border-dashed border-black/10 rounded-lg px-4 py-2">
              <span className="font-mono font-bold text-[#38b1ab] tracking-widest text-lg">
                {promo.code}
              </span>
            </div>
          )}
          {promo.code && promo.copyable !== false && (
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-[#38b1ab] text-white hover:bg-[#2e9a94]"
              }`}
              aria-label={`Copy promo code ${promo.code}`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {promo.affiliateUrl && (
        <a
          href={promo.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="text-sm text-center font-medium text-[#38b1ab] hover:text-[#2e9a94] hover:underline"
        >
          {promo.actionLabel ?? `Shop ${promo.brand}`} →
        </a>
      )}
    </div>
  );
}
