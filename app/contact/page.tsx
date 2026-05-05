import type { Metadata } from 'next';
import Link from 'next/link';
import EmailContact from '@/components/ui/EmailContact';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bouncearenareviews.com';

export const metadata: Metadata = {
  title: 'Contact Bounce Arena',
  description: 'Get in touch with Bounce Arena about trampoline reviews, comparisons, and site questions.',
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <nav className="mb-6 text-sm text-black/40">
        <Link href="/" className="transition-colors hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">Contact</span>
      </nav>

      <h1 className="mb-4 text-3xl font-bold text-black">Contact Bounce Arena</h1>
      <div className="space-y-6 leading-relaxed text-black/70">
        <p>
          For general questions, corrections, review enquiries, or partnership requests, reach us
          at the address below.
        </p>

        <EmailContact />
      </div>
    </div>
  );
}
