import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

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
          Bounce Arena is an independent trampoline review and comparison site. Our goal is to cut through marketing noise and give you accurate,
          spec-verified information to make a confident buying decision.
        </p>

        <p>
          Every trampoline specification on this site — dimensions, weight limits, safety
          certifications — is sourced directly from official brand documentation, not marketing
          copy. We reference <strong>ASTM F381</strong> and <strong>ASTM F2225</strong> as
          the US safety benchmarks, consistent with CPSC guidelines.
        </p>

        <p>
          All prices are sourced from official brand websites. We flag where pricing could not be independently verified.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/brands/"
            className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] hover:bg-[#2e9a94] text-white font-semibold px-7 py-3 transition-colors"
          >
            Browse trampoline brands
          </Link>
          <Link
            href="/compare/"
            className="inline-flex items-center justify-center rounded-xl border border-black/15 hover:border-black/30 text-black font-medium px-7 py-3 transition-colors"
          >
            Compare brands
          </Link>
        </div>
      </div>
    </div>
  );
}
