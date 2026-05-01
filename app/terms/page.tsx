import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

export const metadata: Metadata = {
  title: "Terms of Use — Bounce Arena",
  description: "Terms of use for Bounce Arena.",
  alternates: { canonical: `${SITE_URL}/terms/` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <nav className="text-sm text-black/40 mb-6">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black">Terms of Use</span>
      </nav>

      <h1 className="text-3xl font-bold text-black mb-8">Terms of Use</h1>

      <div className="prose prose-sm max-w-none text-black/70 space-y-6">
        <p className="text-black/50 text-sm">Last updated: April 2026</p>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Acceptance</h2>
          <p>
            By using Bounce Arena (<strong>bouncearena.us</strong>), you agree to these terms.
            If you disagree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Informational Use Only</h2>
          <p>
            Content on this site is provided for informational purposes only. Product
            specifications, prices, and safety certifications are sourced from official brand
            documentation and are subject to change without notice. Always verify current
            specifications, pricing, and safety compliance directly with the manufacturer before
            purchasing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Affiliate Disclosure</h2>
          <p>
            Bounce Arena participates in affiliate marketing programs. We may earn a commission
            on qualifying purchases made through links on this site, at no additional cost to you.
            This is disclosed per FTC guidelines (16 CFR Part 255).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Accuracy of Information</h2>
          <p>
            We make every effort to ensure accuracy but cannot guarantee that all information is
            current or error-free. Bounce Arena is not liable for any decisions made based on
            information provided on this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Intellectual Property</h2>
          <p>
            All content on this site, including text and data compilations, is owned by Bounce Arena
            USA unless otherwise noted. You may not reproduce or redistribute content without
            written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the site constitutes acceptance
            of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
