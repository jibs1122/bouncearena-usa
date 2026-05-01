'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getBrandLogoUrl } from '@/lib/brandLogos';

export default function BrandLogoAvatar({
  name,
  size = 64,
  fillContainer = false,
}: {
  name: string;
  size?: number;
  fillContainer?: boolean;
}) {
  const logoUrl = getBrandLogoUrl(name);
  const [failed, setFailed] = useState(false);
  const isAGame = name.trim().toLowerCase() === "agame";

  if (logoUrl && !failed) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={fillContainer ? size * 2 : size}
        height={fillContainer ? size * 2 : size}
        className="h-full w-full object-contain"
        style={fillContainer ? undefined : { maxWidth: size, maxHeight: size }}
        onError={() => setFailed(true)}
        unoptimized={logoUrl?.startsWith('http')}
      />
    );
  }

  return (
    <span
      className="flex h-full w-full items-center justify-center font-bold text-[#38b1ab]"
      style={{ fontSize: isAGame ? size * 0.28 : size * 0.5 }}
    >
      {isAGame ? "AGame" : name[0]}
    </span>
  );
}
