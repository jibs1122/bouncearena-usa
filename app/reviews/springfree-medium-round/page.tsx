import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Springfree Medium Round Review — Anthea",
  description:
    "Anthea reviews the Springfree Medium Round after 18 months with two young boys. Covers sizing, safety, accessories, daily use, durability, assembly, and whether she would buy it again.",
  alternates: { canonical: `${siteUrl}/reviews/springfree-medium-round/` },
  openGraph: {
    title: "Springfree Medium Round Trampoline — Owner Review",
    description:
      "Anthea reviews the Springfree Medium Round after 18 months with two young boys. Covers sizing, safety, accessories, daily use, durability, assembly, and whether she would buy it again.",
    url: `${siteUrl}/reviews/springfree-medium-round/`,
    type: "article",
    images: [{ url: "https://i.ytimg.com/vi/ADUR7OSCDNc/hqdefault.jpg", width: 480, height: 360 }],
  },
};

export default function SpringfreeMediumRoundReview() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${siteUrl}/reviews/` },
      { "@type": "ListItem", position: 3, name: "Springfree Medium Round Review", item: `${siteUrl}/reviews/springfree-medium-round/` },
    ],
  };

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    datePublished: "2026-03-01",
    name: "Springfree Medium Round — Owner Review",
    author: { "@type": "Person", name: "Anthea" },
    itemReviewed: {
      "@type": "Product",
      name: "Springfree Medium Round Trampoline",
      brand: { "@type": "Brand", name: "Springfree" },
    },
    reviewBody:
      "Anthea has owned the Springfree Medium Round for just over 18 months with two young boys. She would buy it again and recommends considering a larger size if the yard allows.",
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={reviewSchema} />

      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/reviews/" className="hover:text-black transition-colors">Reviews</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Springfree Medium Round</span>
        </nav>

        {/* Header */}
        <p className="text-xs font-semibold text-[#38b1ab] uppercase tracking-wider mb-2">Springfree</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
          Springfree Medium Round Trampoline — Owner Review
        </h1>
        <p className="text-black/50 text-sm mb-8">
          Review by <span className="font-medium text-black/70">Anthea</span> · 18 months ownership
        </p>

        {/* Video */}
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video bg-black/[0.04]">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/ADUR7OSCDNc"
            title="Springfree Medium Round — Video Review by Anthea"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Article body */}
        <div className="space-y-8 text-black/75 leading-relaxed">
          <p>
            Anthea has owned the Springfree Medium Round for just over 18 months. Based in
            Melbourne with two young boys, aged three and six, she chose Springfree primarily
            for the springs-outside safety design after a poor experience with a cheaper brand
            the family previously owned.
          </p>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Sizing</h2>
            <p>
              Anthea bought the medium round to suit a smaller yard, and it has been the right
              call for the space available. With hindsight, she would recommend sizing up if the
              yard allows because a larger trampoline is better for more than two children at
              once and generally feels safer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Accessories</h2>
            <p>
              Anthea opted for two accessories: the step and the FlexrHoop basketball ring.
            </p>
            <p className="mt-3">
              The step has been the standout addition for a household with young children. Her
              youngest was two years old when the trampoline was first installed, and the step
              has allowed him to climb in and out independently and safely from day one.
            </p>
            <p className="mt-3">
              The FlexrHoop has driven a lot of the daily use, particularly when friends are
              over. Anthea recommends it without hesitation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Safety</h2>
            <p className="mb-3">
              Several features stood out for Anthea:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                { label: "Springs outside the jumping area", detail: "The main reason she chose Springfree over other brands." },
                { label: "Step accessory", detail: "Makes entry safe and independent for younger children." },
                { label: "High-quality net", detail: "No rips or tears after 18 months with two rough boys." },
                { label: "Zip entry holds up", detail: "She worried the zip would be a weak point, but it remains in perfect condition and still works smoothly." },
              ].map(({ label, detail }) => (
                <li key={label} className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span><strong className="font-semibold text-black/80">{label}</strong> — {detail}</span>
                </li>
              ))}
            </ul>
            <p>
              The one design change Anthea would make is to replace the bar above the step with
              a second step. Coming down from the step onto the mat occasionally hurts the feet,
              and a two-step entry would be safer for younger children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Bounce and daily use</h2>
            <p>
              The trampoline is used daily, close to an hour most days, even with the eldest at
              school. The boys jump, crash and flip on it, and it has held up well to the
              punishment.
            </p>
            <p className="mt-3">
              Anthea credits the trampoline with keeping the boys outdoors and off tablets,
              while also supporting their physical development.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Build quality and durability</h2>
            <p className="mb-3">
              After 18 months in a Melbourne backyard, the build has held up across the board:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "No rusting on the external frame.",
                "Net in perfect condition with no rips or tears.",
                "Mat in perfect condition, with stitching fully intact.",
                "Zip still operates smoothly.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              The one minor wear point has been the step. Several screws have worked loose over
              time and been lost, although the step still functions and the boys use it without
              issue.
            </p>
            <p className="mt-3">
              Anthea estimates the trampoline is built to last five to ten years. That is a
              meaningful contrast with the family&apos;s previous trampoline, a cheaper large-brand
              model she chose not to name, which had ripped netting and exposed springs within a
              year.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Assembly and moving</h2>
            <p>
              Anthea and her husband do not consider themselves hands-on, so they hired an
              installer rather than self-assembling. The professional install was quick and
              stress-free, and she recommends this approach for anyone in a similar position.
            </p>
            <p className="mt-3">
              The trampoline is very heavy. The family has artificial turf underneath, so they
              have not needed to move it, but Anthea notes that any repositioning to mow the lawn
              would require two adults.
            </p>
            <p className="mt-3">
              She views the weight as a positive overall because the trampoline does not tip or
              shift while the boys are bouncing.
            </p>
          </section>

          <section className="rounded-2xl bg-[#38b1ab]/[0.06] border border-[#38b1ab]/20 p-6">
            <h2 className="text-lg font-bold text-black mb-2">Verdict</h2>
            <p>
              Anthea would buy the Springfree Medium Round again. The combination of the
              springs-outside design, durable mat and net, and step accessory has delivered on
              the family&apos;s main priority: safety.
            </p>
            <p className="mt-3">
              Springfree sits at the higher end of the market on price, but in her view a
              ten-year trampoline is better value than replacing a cheaper unit every year or
              two.
            </p>
            <div className="mt-4">
              <p className="font-semibold text-black/80 mb-2">Two things to weigh before buying:</p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span>If yard space allows, consider sizing up to large.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span>If you are not confident with assembly, budget for a professional installer.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="text-lg font-bold text-black mb-2">Review disclosure</h2>
            <p>
              We paid the reviewer a production fee for their time. The trampoline was already
              owned by the reviewer and the opinions expressed are their own. The brand did not
              approve or edit this review.
            </p>
          </section>

          <section className="rounded-2xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
            <h2 className="text-lg font-bold text-black mb-2">Not sure which trampoline fits best?</h2>
            <p className="text-sm leading-6 text-black/60 mb-4 max-w-2xl">
              Take the quiz and get a tailored trampoline recommendation based on yard size,
              budget, safety priorities, and who will be using it.
            </p>
            <Link
              href="/quiz/"
              className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
            >
              Take the quiz →
            </Link>
          </section>

          <section className="rounded-2xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="text-lg font-bold text-black mb-4">Related Reading</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/brands/springfree/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Springfree brand page
              </Link>
              <Link
                href="/compare/springfree-vs-vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Springfree vs Vuly
              </Link>
              <Link
                href="/compare/springfree-vs-acon/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Springfree vs ACON
              </Link>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-black/[0.08]">
          <Link href="/reviews/" className="text-sm text-[#38b1ab] hover:underline font-medium">
            ← All reviews
          </Link>
        </div>
      </div>
    </>
  );
}
