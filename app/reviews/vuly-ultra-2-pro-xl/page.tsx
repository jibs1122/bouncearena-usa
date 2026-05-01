import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

export const metadata: Metadata = {
  title: "Vuly Ultra 2 Pro XL Review — Imogen | Bounce Arena",
  description:
    "Imogen has owned the Vuly Ultra 2 Pro XL for three months. Her full review covers safety, build quality, assembly, accessories, and the one mistake to avoid.",
  alternates: { canonical: `${siteUrl}/reviews/vuly-ultra-2-pro-xl/` },
};

export default function VulyUltra2ProXLReview() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${siteUrl}/reviews/` },
      { "@type": "ListItem", position: 3, name: "Vuly Ultra 2 Pro XL Review", item: `${siteUrl}/reviews/vuly-ultra-2-pro-xl/` },
    ],
  };

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: "Vuly Ultra 2 Pro XL — Owner Review",
    author: { "@type": "Person", name: "Imogen" },
    itemReviewed: {
      "@type": "Product",
      name: "Vuly Ultra 2 Pro XL Trampoline",
      brand: { "@type": "Brand", name: "Vuly" },
    },
    reviewBody:
      "Imogen has owned the Vuly Ultra 2 Pro XL for three months and rates the frame quality 10/10. She considers it one of the best investments her family has made and would buy it again without hesitation.",
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
          <span className="text-black">Vuly Ultra 2 Pro XL</span>
        </nav>

        {/* Header */}
        <p className="text-xs font-semibold text-[#38b1ab] uppercase tracking-wider mb-2">Vuly</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
          Vuly Ultra 2 Pro Trampoline — Owner Review
        </h1>
        <p className="text-black/50 text-sm mb-8">
          Review by <span className="font-medium text-black/70">Imogen</span> · 3 months ownership
        </p>

        {/* Video */}
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video bg-black/[0.04]">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/V6cas8XFsXQ"
            title="Vuly Ultra 2 Pro XL — Video Review by Imogen"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Article body */}
        <div className="prose-styles space-y-8 text-black/75 leading-relaxed">

          <p>
            Imogen has owned the Vuly Ultra 2 Pro in the XL size for three months. She chose
            the largest Ultra 2 Pro because she wanted enough room for her whole family plus
            visiting kids to jump together without feeling cramped. The XL fits her backyard
            with room to spare, but she flags that it is a very large trampoline — anyone with
            a smaller backyard should consider one of the smaller sizes.
          </p>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Daily use</h2>
            <p>
              The trampoline gets used almost every afternoon. Imogen had expected the novelty
              to fade after a few weeks, but her kids now go straight to the trampoline instead
              of reaching for tablets. On hot days they put a sprinkler over it. Whenever other
              children come over, it is the first thing they want to use, and they spend hours
              on it with their friends.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Delivery and assembly</h2>
            <p>
              The trampoline arrived within a week in approximately nine boxes (including
              accessories). The boxes are very heavy — Imogen recommends getting a second person
              to help carry them rather than dragging them, to avoid back injuries.
            </p>
            <p className="mt-3">
              Build time was around six hours, mostly with two people, and her partner helped
              for the final one to two hours. Imogen made one significant mistake: she installed
              the base poles upside down so the drainage holes faced upwards. The instructions
              explicitly say not to do this. Disassembling the clipped base ring was extremely
              difficult — three people pulling could not easily separate the poles — and the
              rework added another one to two hours. She is now concerned about how she would
              dismantle the trampoline if she needs to move house. Her advice: read the
              instructions thoroughly before starting.
            </p>
            <p className="mt-3">
              One additional note from the build: the bottom poles became very hot lying in the
              sun, which made them uncomfortable to handle while connecting. This has not been
              an issue since assembly because those poles sit hidden under the mat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Build quality and durability</h2>
            <p>
              Imogen rates the frame quality 10/10. The black powder-coated frame feels
              noticeably more solid than the cheaper frames she has owned previously. Her kids
              hang off the side poles with no bending or flex. Mat stitching and padding feel
              premium, with the padding thick enough that it does not deform when kids run along
              the rim.
            </p>
            <p className="mt-3">
              Durability has held up under heavy use, including four adults bouncing at once,
              with no tears or wear. The feet have stayed level on the grass through heavy rain
              and hail — her previous trampoline had sunk into the ground.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Safety</h2>
            <p className="mb-3">
              Imogen is an emergency nurse, so safety was her top buying criterion. The Ultra 2
              Pro met every box:
            </p>
            <ul className="space-y-2">
              {[
                { label: "Self-closing door", detail: "No zips to break, jam, or be left undone. Her kids have fallen onto the door multiple times and have never slipped through." },
                { label: "No spring gaps", detail: "The net joins directly to the mat, eliminating any space where fingers or toes could get caught." },
                { label: "Padding fully covers the springs", detail: "The kids run along the outside edge with no risk of contact." },
                { label: "Flexible outer poles", detail: "When kids bounce into the net, the poles absorb impact rather than feel rigid." },
                { label: "Compliance", detail: "Meets Australian trampoline safety standard, which not all trampolines do." },
              ].map(({ label, detail }) => (
                <li key={label} className="flex gap-3">
                  <span className="text-[#38b1ab] mt-0.5 shrink-0">✓</span>
                  <span><strong className="font-semibold text-black/80">{label}</strong> — {detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Bounce</h2>
            <p>
              The dual-layer spring system delivers a consistent bounce across the entire mat —
              no harder edge or softer middle. Imogen can jump hard on one side without
              launching her four-year-old on the other. The alternating high and low coil
              connections produce a soft, controlled bounce for her younger child while still
              feeling powerful for her older one.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Noise and access</h2>
            <p>
              The trampoline is silent in use — none of the springy or clunky sounds her
              cheaper trampoline made. Combined with the self-closing door and the ladder
              accessory, her kids can get on and off completely independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Accessories</h2>
            <p>
              Imogen bought the shade cover, basketball hoop, and ladder. She considers the
              ladder essential because the trampoline sits high off the ground for younger kids.
              The shade cover she also calls a must in summer heat — her previous trampoline
              without one was unusable in peak sun.
            </p>
            <p className="mt-3">
              A specific upgrade in the Ultra 2 Pro: the shade cover and basketball hoop can be
              used together. The hoop has high and low settings and is designed to sit beneath
              the shade cover, with enough clearance for the ball to go through. One criticism:
              the basketball hoop net is held on by a Velcro strap that comes off easily after a
              few shots. The metal hoop alone works fine if the netting is removed.
            </p>
            <p className="mt-3">
              The printed game mat was not a buying factor, but Imogen says her kids have
              invented around a hundred different games using the printed characters. She now
              recommends it as a feature buyers should not overlook.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">Main downside</h2>
            <p>
              The weight. The XL is too heavy for Imogen and her partner to lift and reposition
              for mowing — attempting to drag it tears up the grass. Their workaround is to
              whipper snipper underneath rather than move it. She notes that Vuly has mentioned
              wheels are coming to newer models, which she says she would buy instantly.
            </p>
          </section>

          <section className="rounded-2xl bg-[#38b1ab]/[0.06] border border-[#38b1ab]/20 p-6">
            <h2 className="text-lg font-bold text-black mb-2">Verdict</h2>
            <p>
              Imogen would buy the Vuly Ultra 2 Pro XL again without hesitation. She believes
              it will last her kids' entire childhood and considers it one of the best
              investments her family has made.
            </p>
          </section>

          <section className="rounded-2xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="text-lg font-bold text-black mb-4">Related Reading</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reviews/vuly-thunder-2-medium/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Vuly Thunder 2 Trampoline Review
              </Link>
              <Link
                href="/brands/vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Vuly brand page
              </Link>
              <Link
                href="/compare/springfree-vs-vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Springfree vs Vuly
              </Link>
              <Link
                href="/compare/acon-vs-vuly/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                ACON vs Vuly
              </Link>
              <Link
                href="/quiz/"
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
              >
                Take the quiz
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
