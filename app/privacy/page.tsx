import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
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

      <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>

      <div className="prose prose-sm max-w-none text-black/70 space-y-8">
        <p className="text-black/50 text-sm">Last updated: May 2026</p>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">1. Who We Are</h2>
          <p>
            Bounce Arena (<strong>www.bouncearenareviews.com</strong>) provides independent
            trampoline reviews and comparisons. For privacy enquiries, use our{" "}
            <Link href="/contact/" className="text-[#38b1ab] hover:underline">contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">2. Information We Collect</h2>
          <p className="font-medium text-black/80 mt-3 mb-1">Information you give us</p>
          <p>
            This site does not require registration. If you contact us, we collect your name
            and email address solely to respond to your enquiry.
          </p>
          <p className="font-medium text-black/80 mt-4 mb-1">Information collected automatically</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Server logs:</strong> IP address, browser type, pages visited, referral URL,
              and timestamp. Retained up to 30 days by our hosting provider (Vercel) for
              security and debugging.
            </li>
            <li>
              <strong>Analytics (Google Analytics 4):</strong> Aggregate traffic patterns — pages
              visited, session duration, country of origin. We use Google Consent Mode v2 with
              analytics storage set to denied by default. GA4 operates in anonymous/modelable
              mode: no cookies are set, no user identifiers are collected.
            </li>
            <li>
              <strong>Geo-routing cookie (<code>ba_country</code>):</strong> A two-letter country
              code derived from your IP to serve region-appropriate content. Expires after 30 days,
              marked <code>HttpOnly</code> and <code>Secure</code>, not shared with third parties.
              This cookie is strictly necessary for routing and is exempt from consent requirements
              under ePrivacy Directive Article&nbsp;5(3).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">3. Cookies</h2>
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="w-full text-sm">
              <thead className="bg-black/5">
                <tr>
                  <th className="text-left p-3 font-semibold text-black">Name</th>
                  <th className="text-left p-3 font-semibold text-black">Purpose</th>
                  <th className="text-left p-3 font-semibold text-black">Duration</th>
                  <th className="text-left p-3 font-semibold text-black">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                <tr>
                  <td className="p-3 font-mono text-xs">ba_country</td>
                  <td className="p-3">Geo-routing — region-appropriate content</td>
                  <td className="p-3 whitespace-nowrap">30 days</td>
                  <td className="p-3">Strictly necessary</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">_ga, _ga_*</td>
                  <td className="p-3">Google Analytics — anonymous/modelable traffic analysis only (Consent Mode denied; no user identifiers set)</td>
                  <td className="p-3 whitespace-nowrap">Not set</td>
                  <td className="p-3">Analytics (cookieless mode)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Google Analytics runs in cookieless mode — no GA cookies are set on your device.
            You can disable analytics entirely by using a browser extension such as the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer nofollow" className="text-[#38b1ab] hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>{" "}
            or by blocking third-party scripts in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">4. Affiliate Links &amp; Third Parties</h2>
          <p>
            Some links are affiliate links to retailers (e.g. Springfree, Acon, Vuly, Zupapa). When you
            click one, the retailer may set their own cookies per their privacy policy. We receive
            only aggregated commission reports — no personal data. All affiliate links carry{" "}
            <code>rel=&quot;nofollow sponsored&quot;</code> and a visible disclosure banner,
            per FTC guidelines (16 CFR Part 255).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">5. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To deliver and improve the site and its content</li>
            <li>To understand aggregate usage patterns (anonymous analytics, no personal data)</li>
            <li>To respond to contact enquiries</li>
            <li>To serve region-appropriate content (geo-routing)</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell, rent, or share personal data with third parties
            for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">6. Legal Basis for Processing (GDPR)</h2>
          <p>For visitors in the European Economic Area, our legal bases are:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Legitimate interests</strong> (Art. 6(1)(f)): server logs, security
              monitoring, and anonymous analytics (no personal data collected via Consent Mode).
            </li>
            <li>
              <strong>Strictly necessary / exempt</strong>: the geo-routing cookie falls under
              ePrivacy Directive Art. 5(3).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">7. Your Rights</h2>
          <p className="font-medium text-black/80 mb-1">GDPR rights (EEA residents)</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access, rectification, and erasure of your personal data</li>
            <li>Restriction of processing and data portability</li>
            <li>Object to processing based on legitimate interests</li>
            <li>Withdraw consent at any time (does not affect prior processing)</li>
            <li>Lodge a complaint with your national supervisory authority</li>
          </ul>
          <p className="font-medium text-black/80 mt-4 mb-1">CCPA rights (California residents)</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Know what personal information we collect and how it is used</li>
            <li>Request deletion of personal information we hold</li>
            <li>Opt out of sale of personal information (we do not sell personal data)</li>
            <li>Non-discrimination for exercising your rights</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us via our{" "}
            <Link href="/contact/" className="text-[#38b1ab] hover:underline">contact page</Link>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">8. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Server log data: up to 30 days (hosting provider policy)</li>
            <li>Google Analytics data: up to 14 months (GA default retention setting)</li>
            <li>Contact form submissions: up to 24 months, then deleted</li>
            <li>Geo-routing cookie: 30 days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">9. Data Security</h2>
          <p>
            The site is served exclusively over HTTPS with HSTS enabled. We apply HTTP security
            headers including Content-Security-Policy and X-Frame-Options. We do not store
            payment card details or sensitive personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">10. Children&rsquo;s Privacy</h2>
          <p>
            This site is not directed at children under 13. We do not knowingly collect
            personal information from children. Contact us if you believe a child has submitted
            data and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">11. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The &ldquo;Last updated&rdquo; date
            at the top reflects any changes. Continued use after an update constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">12. Contact</h2>
          <p>
            For privacy questions or to exercise your rights, contact us via our{" "}
            <Link href="/contact/" className="text-[#38b1ab] hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
