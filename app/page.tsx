import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllBrands } from "@/lib/products";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import JsonLd from "@/components/seo/JsonLd";
import { formatUsd } from "@/lib/price";
import { REVIEW_CARDS } from "@/lib/reviews";
import { isVulyBrand } from "@/lib/vuly";

export const metadata: Metadata = {
  title: "Best Trampolines 2026 — Reviews & Comparisons | Bounce Arena",
  description:
    "Compare the top trampoline brands — Springfree, Acon, Vuly, Skywalker, and more. Independent reviews covering safety certifications, sizes, and pricing.",
  openGraph: {
    title: "Bounce Arena — Best Trampolines 2026",
    description:
      "Independent trampoline reviews and side-by-side comparisons. ASTM-certified picks for every yard size and budget.",
  },
};

export default function HomePage() {
  const allBrands = getAllBrands();
  const featuredBrandNames = ["AlleyOOP", "Avyna", "Beast", "North", "West Coast Jump", "MaxAir"];
  const brands = featuredBrandNames
    .map((name) => allBrands.find((brand) => brand.name === name))
    .filter((brand): brand is NonNullable<typeof brand> => Boolean(brand));
  const reviews = REVIEW_CARDS.slice(0, 2);
  const showAffiliateDisclosure =
    brands.some((brand) => isVulyBrand(brand.name)) ||
    reviews.some((review) => isVulyBrand(review.brand));

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bounce Arena",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us",
    description: "Independent trampoline reviews and comparisons.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us"}/brands/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-black leading-tight mb-4">
              Find the perfect <span className="text-[#38b1ab]">trampoline</span> for your family
            </h1>
            <p className="text-lg text-black/60 mb-8 max-w-lg mx-auto md:mx-0">
              Unbiased reviews and expert comparisons of the top trampoline brands — Springfree, Acon, Vuly, Skywalker, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/quiz/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#38b1ab] hover:bg-[#2e9a94] text-white font-semibold px-7 py-3.5 transition-colors text-base"
              >
                Take the free quiz →
              </Link>
              <Link
                href="/models/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 hover:border-black/30 text-black font-medium px-7 py-3.5 transition-colors text-base"
              >
                Browse all models
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-sm md:max-w-none">
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/kids-bouncing.jpg"
                alt="Children bouncing happily on a backyard trampoline"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 space-y-16">

        {/* Top brands */}
        {brands.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Top Trampoline Brands</h2>
              <Link href="/brands/" className="text-sm text-[#38b1ab] hover:underline font-medium">
                All brands →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}/`}
                  className="group flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-black/[0.08] bg-white px-3 py-3 hover:border-[#38b1ab]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-black/[0.05] bg-[#f7fbfa] p-2.5">
                    <div className="flex aspect-square w-full max-w-[118px] items-center justify-center rounded-xl bg-white p-2.5">
                      <BrandLogoAvatar name={brand.name} size={98} fillContainer />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-black truncate w-full">{brand.name}</p>
                    {brand.fromPriceUsd !== null && (
                      <p className="text-[10px] text-black/40">From {formatUsd(brand.fromPriceUsd)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-black">Latest Reviews</h2>
              <Link href="/reviews/" className="text-sm font-medium text-[#38b1ab] hover:underline">
                All reviews →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {reviews.map((review) => (
                <Link
                  key={review.href}
                  href={review.href}
                  className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-all hover:border-[#38b1ab]/40 hover:shadow-sm"
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-black/[0.06] bg-black/[0.03]">
                    <Image
                      src={review.videoThumbnailUrl}
                      alt={`${review.model} video preview`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-black shadow-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#38b1ab] text-white">
                        ▶
                      </span>
                      Watch video review
                    </div>
                  </div>
                  <div className="p-6">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#38b1ab]">
                    {review.brand}
                  </p>
                  <h3 className="mb-1 text-xl font-bold text-black transition-colors group-hover:text-[#38b1ab]">
                    {review.model}
                  </h3>
                  <p className="mb-3 text-sm text-black/40">
                    Review by {review.author} · {review.owned} ownership
                  </p>
                  <p className="mb-4 text-sm leading-relaxed text-black/65">
                    {review.excerpt}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-black/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#38b1ab] group-hover:underline">
                    Read review →
                  </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quiz CTA banner */}
        <section>
          <div className="rounded-2xl bg-[#38b1ab]/[0.08] border border-[#38b1ab]/20 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3">
              Not sure which trampoline to buy?
            </h2>
            <p className="text-black/60 mb-6 max-w-md mx-auto">
              Answer a few quick questions and we&apos;ll match you with the best trampoline for
              your family — based on yard size, safety priorities, and budget.
            </p>
            <Link
              href="/quiz/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#38b1ab] hover:bg-[#2e9a94] text-white font-semibold px-8 py-3.5 transition-colors"
            >
              Take the quiz →
            </Link>
          </div>
        </section>

        {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      </div>
    </>
  );
}
