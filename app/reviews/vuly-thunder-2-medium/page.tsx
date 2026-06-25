import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Vuly Thunder 2 Medium Review — Jess",
  description:
    "Jess reviews the Vuly Thunder 2 Medium after four months of near-daily use. Covers the leaf-spring bounce, assembly tips, accessories, and durability through Brisbane storms.",
  alternates: { canonical: `${siteUrl}/reviews/vuly-thunder-2-medium/` },
  openGraph: {
    title: "Vuly Thunder 2 Medium Trampoline — Owner Review",
    description:
      "Jess reviews the Vuly Thunder 2 Medium after four months of near-daily use. Covers the leaf-spring bounce, assembly tips, accessories, and durability through Brisbane storms.",
    url: `${siteUrl}/reviews/vuly-thunder-2-medium/`,
    type: "article",
    images: [{ url: `${siteUrl}/vuly-thunder-2-review-preview.png`, width: 1280, height: 720 }],
  },
};

export default function VulyThunder2MediumReview() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${siteUrl}/reviews/` },
      { "@type": "ListItem", position: 3, name: "Vuly Thunder 2 Medium Review", item: `${siteUrl}/reviews/vuly-thunder-2-medium/` },
    ],
  };

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: "Vuly Thunder 2 Medium — Owner Review",
    author: { "@type": "Person", name: "Jess" },
    itemReviewed: {
      "@type": "Product",
      name: "Vuly Thunder 2 Medium Trampoline",
      brand: { "@type": "Brand", name: "Vuly" },
    },
    reviewBody:
      "Jess has owned the Vuly Thunder 2 Medium for just over four months with two young boys. She would buy it again and recommends it for young families who spend time outdoors.",
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
          <span className="text-black">Vuly Thunder 2 Medium</span>
        </nav>

        {/* Header */}
        <p className="text-xs font-semibold text-[#38b1ab] uppercase tracking-wider mb-2">Vuly</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
          Vuly Thunder 2 Trampoline — Owner Review
        </h1>
        <p className="text-black/50 text-sm mb-8">
          Review by <span className="font-medium text-black/70">Jess</span> · 4 months ownership
        </p>

        {/* Video */}
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video bg-black/[0.04]">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/erGgwAxLSIA"
            title="Vuly Thunder 2 Medium — Video Review by Jess"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Article body */}
        <div className="space-y-8 text-black/75 leading-relaxed">

          <p>
            Jess has owned the Vuly Thunder 2 in medium for just over four months. Based in
            Brisbane with two young boys (five and one and a half), she chose the Thunder 2 for
            the combination of the safety net and the springless leaf-spring setup.
          </p>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Accessories</h2>
            <p>
              Jess opted for two accessories: the shade cover and the basketball hoop.
            </p>
            <p className="mt-3">
              The shade cover protects the boys from the sun during long afternoons outside. As
              a side benefit, it also keeps almost all leaves out — only the smallest ones get
              through down the sides.
            </p>
            <p className="mt-3">
              The basketball hoop was easy to mount and came with a ball and pump. She installed
              it inside the trampoline.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Ladder and moving</h2>
            <p>
              The Thunder 2 did not come with a ladder. The footholds sit slightly higher than
              Jess would like for her younger son, so they use a small step to help him climb
              in. She predicts he will not need the step by age seven or eight — for now it
              provides a bit of extra support.
            </p>
            <p className="mt-3">
              Moving the trampoline requires two adults. It is a sturdy build, and although
              weight is not necessarily a negative, repositioning it solo is impractical.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Safety</h2>
            <p className="mb-3">
              Several features stood out for Jess:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                { label: "Net connects directly to the mat", detail: "No gaps, no holes for small fingers." },
                { label: "Poles flex outwards when hit", detail: "So there is nothing rigid to bang into." },
                { label: "No exposed springs", detail: "The leaf-spring system was a major draw given the ages of her children." },
                { label: "Flap-close entry", detail: "No zippers to fail." },
              ].map(({ label, detail }) => (
                <li key={label} className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span><strong className="font-semibold text-black/80">{label}</strong> — {detail}</span>
                </li>
              ))}
            </ul>
            <p>
              The one safety-related concern Jess raises is the entry. Because there are no
              specific footholds for getting onto the mat, adults are forced to stand briefly
              inside the net when entering. This has only been an issue for Jess and her husband
              — her five-year-old has nailed the entry and uses the trampoline independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Bounce and performance</h2>
            <p>
              The bounce noticeably differs between the centre and the outer edge of the mat.
              For young children, Jess describes it as both controlled and stable — they can
              have fun without being launched too high. With the shade cover installed, the
              maximum jump height is restricted, which is worth flagging for tall adults who
              plan to use it.
            </p>
            <p className="mt-3">
              After four months of near-daily use, there has been no squeaking or extra movement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Assembly</h2>
            <p>
              Assembly took Jess and her husband just over two hours. It was not complicated but
              required patience.
            </p>
            <p className="mt-3">
              The hardest stage was tensioning the mat onto the leaf springs. Jess recommends
              approaching this differently from the instructions — number or divide the springs
              up differently before pulling tension, otherwise alignment becomes a problem. The
              tool included in the box is essential; she says the job would have been impossible
              without it.
            </p>
            <p className="mt-3">
              They worked in the heat of the day and watched YouTube videos beforehand. The
              printed instructions were clear; the tensioning stage is what tests patience and
              arms. Two pieces of advice from Jess: start earlier in the day to leave room for
              breaks, and do not attempt the build the night before a birthday party or
              Christmas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Build quality and durability</h2>
            <p>
              The trampoline lives outside year-round in Brisbane sun. After four months —
              winter through spring and now into summer — there has been no issue with the
              powder coating, the fabric, or the noise level. The unit has held up through
              several Brisbane storms, including heavy hailstones, with no damage.
            </p>
            <p className="mt-3">
              The poles show no movement or flex despite constant use, and the net is in the
              same condition. The trampoline still looks close to new, which Jess considers
              exactly what should be expected at this stage of ownership.
            </p>
          </section>

          <section className="rounded-2xl bg-[#38b1ab]/[0.06] border border-[#38b1ab]/20 p-6">
            <h2 className="text-lg font-bold text-black mb-2">Verdict</h2>
            <p>
              Jess would buy the Vuly Thunder 2 again. She recommends it for young families who
              spend time outdoors. The two limitations to weigh before buying: limited backyard
              space, and the difficulty of moving it frequently — two adults required.
            </p>
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
                href="/reviews/vuly-ultra-2-pro-xl/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Vuly Ultra 2 Pro Trampoline Review
              </Link>
              <Link
                href="/brands/vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Vuly brand page
              </Link>
              <Link
                href="/compare/skywalker-vs-vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Skywalker vs Vuly
              </Link>
              <Link
                href="/compare/vuly-vs-jumpflex/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Vuly vs Jumpflex
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
