'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Brand } from '@/lib/types';
import { getBrandLogoUrl } from '@/lib/brandLogos';
import BrandLogoAvatar from '@/components/ui/BrandLogoAvatar';
import { formatUsd } from '@/lib/price';

export default function BrandCard({ brand }: { brand: Brand }) {
  const logoUrl = getBrandLogoUrl(brand.name);
  const [failed, setFailed] = useState(false);
  const hasLogo = Boolean(logoUrl && !failed);

  return (
    <Link
      href={`/brands/${brand.slug}/`}
      className="group flex flex-col gap-4 rounded-xl border border-black/[0.08] bg-white p-5 hover:border-[#38b1ab]/40 hover:shadow-sm transition-all"
    >
      <div className="flex min-h-36 items-center rounded-2xl border border-black/[0.05] bg-[#f7fbfa] p-4 sm:min-h-40">
        {hasLogo ? (
          <div className="flex aspect-square w-32 flex-shrink-0 items-center justify-center rounded-xl bg-white p-4 sm:w-36">
            <BrandLogoAvatar name={brand.name} size={112} fillContainer />
          </div>
        ) : (
          <div className="flex aspect-square w-32 flex-shrink-0 items-center justify-center rounded-xl bg-white sm:w-36">
            <span className="font-bold text-3xl leading-none text-[#38b1ab]">
              {brand.name[0]}
            </span>
          </div>
        )}
      </div>

      <div>
        {hasLogo ? <span className="sr-only">{brand.name}</span> : null}
        <p className="text-sm text-black/40 mt-0.5">
          {brand.products.length} model{brand.products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {brand.fromPriceUsd !== null && (
        <p className="text-sm font-semibold text-black/70">
          From{' '}
          <span className="text-[#38b1ab] text-base">
            {formatUsd(brand.fromPriceUsd)}
          </span>
        </p>
      )}

      <span className="text-xs font-medium text-[#38b1ab] group-hover:underline mt-auto">
        View brand →
      </span>
    </Link>
  );
}
