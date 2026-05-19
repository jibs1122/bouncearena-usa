import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Terms of Use",
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

      <h1 className="text-3xl font-bold text-black mb-2">Terms of Use</h1>

      <div className="prose prose-sm max-w-none text-black/70 space-y-8">
        <p className="text-black/50 text-sm">Last updated: May 2026</p>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">1. Acceptance</h2>
          <p>
            By using Bounce Arena (<strong>www.bouncearenareviews.com</strong>), you agree to
            these terms. If you disagree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">2. Informational Use Only</h2>
          <p>
            Content on this site is provided for informational purposes only. Nothing on the
            site constitutes professional safety advice, medical advice, or a recommendation
            to purchase any specific product.
          </p>
          <p className="mt-2">
            Always follow the manufacturer&rsquo;s installation and safety instructions, comply
            with local regulations, and consult relevant safety standards (including ASTM F381
            and ASTM F2225) before purchasing or installing a trampoline.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">3. Accuracy of Information</h2>
          <p>
            We make every reasonable effort to ensure that specifications, prices, and safety
            certifications are accurate at the time of publication. However:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Prices change frequently. Always verify current pricing on the brand&rsquo;s
              official website before purchasing.</li>
            <li>Product specifications and certification status may change without notice.</li>
            <li>We cannot guarantee that all information is complete, current, or error-free.</li>
          </ul>
          <p className="mt-2">
            Bounce Arena makes no warranties, express or implied, regarding the accuracy,
            completeness, or fitness for a particular purpose of any information on the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">4. Affiliate Disclosure</h2>
          <p>
            Bounce Arena participates in affiliate marketing programs. We may earn a commission
            on qualifying purchases made through links on this site, at no additional cost to you.
            Affiliate relationships do not influence our editorial opinions or product rankings.
          </p>
          <p className="mt-2">
            This is disclosed per FTC guidelines (16 CFR Part 255). A disclosure banner is
            shown on every page containing affiliate links. All affiliate links carry{" "}
            <code>rel=&quot;nofollow sponsored&quot;</code>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">5. External Links</h2>
          <p>
            The site contains links to third-party websites including brand sites and retailers.
            These links are provided for convenience only. We do not endorse, control, or take
            responsibility for the content, privacy practices, or availability of any linked site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">6. Intellectual Property</h2>
          <p>
            All original content on this site — including written reviews, comparison data, and
            site design — is owned by Bounce Arena unless otherwise noted. You may not reproduce
            or redistribute content without prior written permission, except for brief quotations
            with attribution for non-commercial purposes.
          </p>
          <p className="mt-2">
            Product names, brand names, and trademarks referenced on the site remain the property
            of their respective owners. Their use here is purely descriptive and does not imply
            endorsement or affiliation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">7. Disclaimer of Warranties</h2>
          <p>
            The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, either express or implied, including but not limited to
            implied warranties of merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Bounce Arena and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of, or inability to use, the site — including personal injury,
            property damage, or financial loss resulting from a purchase made based on information
            from this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">9. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United States. Any disputes shall be
            subject to the exclusive jurisdiction of courts in the United States.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">10. Changes to These Terms</h2>
          <p>
            We may update these terms at any time. The &ldquo;Last updated&rdquo; date at the
            top reflects the most recent revision. Continued use of the site after changes are
            posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-2">11. Contact</h2>
          <p>
            Questions about these terms may be directed to us via our{" "}
            <Link href="/contact/" className="text-[#38b1ab] hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
