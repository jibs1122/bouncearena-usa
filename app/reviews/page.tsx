import type { Metadata } from "next";
import Link from "next/link";
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
        name: review.model,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10">
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

        <div className="space-y-6">
          {REVIEW_CARDS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group block rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-[#38b1ab]/40 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#38b1ab] uppercase tracking-wider mb-1">
                    {r.brand}
                  </p>
                  <h2 className="text-xl font-bold text-black mb-1 group-hover:text-[#38b1ab] transition-colors">
                    {r.model}
                  </h2>
                  <p className="text-sm text-black/40 mb-3">
                    Review by {r.author} · {r.owned} ownership
                  </p>
                  <p className="text-sm text-black/65 leading-relaxed mb-4">
                    {r.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-black/[0.04] text-black/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-medium text-[#38b1ab] group-hover:underline shrink-0 mt-1">
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
