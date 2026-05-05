'use client';

import { useState } from 'react';

const EMAIL_LOCAL = 'hello';
const EMAIL_DOMAIN = 'bouncearenareviews.com';

function getEmailAddress() {
  return `${EMAIL_LOCAL}@${EMAIL_DOMAIN}`;
}

export default function EmailContact({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const obfuscated = `${EMAIL_LOCAL} [at] ${EMAIL_DOMAIN}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getEmailAddress());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleEmail() {
    window.location.href = `mailto:${getEmailAddress()}`;
  }

  return (
    <div className={className}>
      <p className="font-medium text-black">{obfuscated}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
        >
          {copied ? 'Copied' : 'Copy email'}
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="inline-flex items-center justify-center rounded-xl border border-black/15 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/30"
        >
          Email us
        </button>
      </div>
    </div>
  );
}
