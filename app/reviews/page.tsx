import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import { REVIEW_CARDS } from "@/lib/reviews";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Trampoline Reviews — Real Owner Experiences | Bounce Arena",
  description:
    "In-depth trampoline reviews from real owners. Honest assessments of safety, build quality, bounce performance, and long-term durability.",
  alternates: { canonical: `${SITE_URL}/reviews/` },
  openGraph: {
    title: "Trampoline Reviews — Real Owner Experiences",
    description:
      "In-depth trampoline reviews from real owners. Honest assessments of safety, build quality, bounce performance, and long-term durability.",
    url: `${SITE_URL}/reviews/`,
  },
};

export default function ReviewsPage() {
  function reviewTitle(model: string) {
    return /\breview\b/i.test(model) ? model : `${model} Review`;
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${SITE_URL}/reviews/` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trampoline Reviews",
    url: `${SITE_URL}/reviews/`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: REVIEW_CARDS.map((review, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${review.href}`,
        name: reviewTitle(review.model),
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Reviews</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
          Owner Reviews
        </h1>
        <p className="text-black/60 mb-10 max-w-2xl">
          Long-form reviews from real trampoline owners.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {REVIEW_CARDS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-all hover:border-[#38b1ab]/40 hover:shadow-sm"
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-black/[0.06] bg-black/[0.03]">
                <Image
                  src={r.videoThumbnailUrl}
                  alt={`${r.model} video preview`}
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
                  {r.brand}
                </p>
                <h2 className="mb-1 text-xl font-bold text-black transition-colors group-hover:text-[#38b1ab]">
                  {reviewTitle(r.model)}
                </h2>
                <p className="mb-3 text-sm text-black/40">
                  Review by {r.author} · {r.owned} ownership
                </p>
                <p className="mb-4 text-sm leading-relaxed text-black/65">
                  {r.excerpt}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-black/50">
                      {t}
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
      </div>
    </>
  );
}
