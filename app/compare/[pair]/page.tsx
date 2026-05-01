import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ComparisonTable from "@/components/ui/ComparisonTable";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import JsonLd from "@/components/seo/JsonLd";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import {
  getApprovedComparison,
  getApprovedComparisons,
} from "@/lib/comparisons";

type Props = { params: Promise<{ pair: string }> };

export async function generateStaticParams() {
  return getApprovedComparisons().map((comparison) => ({ pair: comparison.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const comparison = getApprovedComparison(pair);
  if (!comparison) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";
  return {
    title: `${comparison.title} — Trampoline Comparison 2026`,
    description: comparison.intro,
    alternates: { canonical: `${siteUrl}${comparison.href}` },
    openGraph: {
      title: `${comparison.title} Trampolines`,
      description: comparison.intro,
      url: `${siteUrl}${comparison.href}`,
    },
  };
}

export default async function ComparePairPage({ params }: Props) {
  const { pair } = await params;
  const comparison = getApprovedComparison(pair);
  if (!comparison) notFound();

  const { brandA, brandB } = comparison;
  const allProducts = [...brandA.products, ...brandB.products];
  const hasAffiliate = allProducts.some((p) => p.sourceUrls.length > 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";
  const relatedComparisons = getApprovedComparisons()
    .filter((item) => item.slug !== comparison.slug)
    .filter(
      (item) =>
        item.brandA.slug === brandA.slug ||
        item.brandB.slug === brandA.slug ||
        item.brandA.slug === brandB.slug ||
        item.brandB.slug === brandB.slug,
    )
    .slice(0, 6);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${siteUrl}/compare/` },
      {
        "@type": "ListItem",
        position: 3,
        name: comparison.title,
        item: `${siteUrl}${comparison.href}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <div className="py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="text-sm text-black/40 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/compare/" className="hover:text-black transition-colors">Compare</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{comparison.title}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
            {comparison.title}
          </h1>
          <div className="mb-6 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href={`/brands/${brandA.slug}/`}
              className="group flex h-28 w-28 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-32 sm:w-32"
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                <BrandLogoAvatar name={brandA.name} size={104} fillContainer />
              </div>
            </Link>
            <Link
              href={`/brands/${brandB.slug}/`}
              className="group flex h-28 w-28 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-32 sm:w-32"
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                <BrandLogoAvatar name={brandB.name} size={104} fillContainer />
              </div>
            </Link>
          </div>
          <p className="text-black/60 mb-4 max-w-3xl leading-7">
            {comparison.intro}
          </p>
          <div className="mb-8" />

          {hasAffiliate && <AffiliateDisclosure className="mb-8" />}

          <section className="mb-8 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
            <h2 className="text-lg font-bold text-black mb-2">Not sure which brand fits best?</h2>
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

          <section className="mb-10">
            <h2 className="text-xl font-bold text-black mb-4">Full Spec Comparison</h2>
            <ComparisonTable products={allProducts} />
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="text-lg font-bold text-black mb-4">Related Reading</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <Link
                href={`/brands/${brandA.slug}/`}
                className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
              >
                {brandA.name} brand page
              </Link>
              <Link
                href={`/brands/${brandB.slug}/`}
                className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
              >
                {brandB.name} brand page
              </Link>
            </div>
            {relatedComparisons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {relatedComparisons.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
