import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

export const metadata: Metadata = {
  title: "Privacy Policy — Bounce Arena",
  description: "Privacy policy for Bounce Arena. How we collect, use, and protect your data.",
  alternates: { canonical: `${SITE_URL}/privacy/` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <nav className="text-sm text-black/40 mb-6">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-black mb-8">Privacy Policy</h1>

      <div className="prose prose-sm max-w-none text-black/70 space-y-6">
        <p className="text-black/50 text-sm">Last updated: April 2026</p>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Information We Collect</h2>
          <p>
            Bounce Arena (<strong>bouncearena.us</strong>) is a static informational website.
            We do not require account registration or collect personal information directly.
          </p>
          <p className="mt-2">
            We may collect standard server log data (IP addresses, browser type, pages visited)
            through our hosting provider, and aggregated analytics data through privacy-respecting
            analytics tools. We do not sell or share this data with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Affiliate Links &amp; Third-Party Sites</h2>
          <p>
            Some links on this site are affiliate links to third-party retailers. When you click
            these links, you leave Bounce Arena and are subject to the privacy policy of the
            destination site. We do not control those sites and are not responsible for their
            data practices.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Cookies</h2>
          <p>
            We may use cookies for analytics purposes. These do not contain personally identifiable
            information. You can disable cookies in your browser settings without affecting your
            ability to use this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">Contact</h2>
          <p>
            For privacy questions, contact us at the email address listed on our{" "}
            <Link href="/about/" className="text-[#38b1ab] hover:underline">About page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
