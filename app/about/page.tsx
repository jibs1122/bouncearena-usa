import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "About Bounce Arena",
  description: "About Bounce Arena — independent trampoline reviews and comparisons.",
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <nav className="text-sm text-black/40 mb-6">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-black mb-8">About Bounce Arena</h1>

      <div className="space-y-6 text-black/70 leading-relaxed">
        <p>
          Bounce Arena helps families pick a trampoline they won&apos;t regret in eighteen months.
        </p>

        <p>
          We&apos;re a review and comparison site, focused on three things:
        </p>

        <ol className="list-decimal space-y-4 pl-6">
          <li>
            <strong className="text-black">We pull the specs together in one place.</strong>{" "}
            Sizes, weight limits, spring or springless, warranty terms, and frame materials,
            organised so you can compare them without tabbing between six brand websites.
          </li>
          <li>
            <strong className="text-black">We publish real owner reviews.</strong> Owners
            who&apos;ve lived with the trampoline long enough can speak to the things product pages
            can&apos;t: assembly, build quality after a winter outside, and how it holds up to two
            kids using it daily.
          </li>
          <li>
            <strong className="text-black">We put trampolines side by side.</strong> Choosing a
            trampoline is mostly a comparison problem (bouncier or safer, larger or cheaper,
            leaf-spring or coil). Direct comparisons answer those questions faster than reading
            six separate reviews.
          </li>
        </ol>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-black">How we make money</h2>
          <p>
            Bounce Arena earns commissions when readers click our links and buy. That&apos;s how the
            site is funded.
          </p>
          <p>
            However, we cover brands we don&apos;t earn from, and if a trampoline is worth comparing,
            it&apos;s in the comparisons.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-black">On safety standards</h2>
          <p>
            In the US, the relevant safety benchmarks are <strong>ASTM F381</strong> (above-ground
            trampolines) and <strong>ASTM F2225</strong> (enclosures), aligned with CPSC guidance.
            We reference these where brands publish to them.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-black">Contact</h2>
          <p>
            If you want to flag a correction, ask a question, or get in touch about the site, you
            can reach us at hello [at] bouncearenareviews.com.
          </p>
        </div>

        <p>
          Bounce Arena is owned and operated by Lobo Media Pty Ltd, an independent publisher of
          consumer review sites.
        </p>
      </div>
    </div>
  );
}
