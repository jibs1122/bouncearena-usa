import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import ComparisonTable from "@/components/ui/ComparisonTable";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import JsonLd from "@/components/seo/JsonLd";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import ModelImage from "@/components/ui/ModelImage";
import {
  getApprovedComparison,
  getApprovedComparisons,
} from "@/lib/comparisons";
import { formatUsd } from "@/lib/price";
import { buildCompareTakeaways } from "@/lib/compareTakeaways";
import { getPreferredProductUrl } from "@/lib/productLinks";
import { hasModelImage } from "@/lib/modelImages";
import { isAffiliateBrand } from "@/lib/vuly";

type Props = { params: Promise<{ pair: string }> };

type FeaturedModel = {
  brand: string;
  model: string;
  priceFrom: number | null;
  priceTo: number | null;
  sizes: string[];
  springSystem: string;
  sourceUrl: string | null;
  hasImage: boolean;
};

function splitIntroIntoParagraphs(intro: string): string[] {
  const sentences = intro.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g);

  if (!sentences) {
    return [intro];
  }

  const cleanedSentences = sentences.map((sentence) => sentence.trim()).filter(Boolean);
  const paragraphs: string[] = [];

  for (let index = 0; index < cleanedSentences.length; index += 2) {
    paragraphs.push(cleanedSentences.slice(index, index + 2).join(" "));
  }

  return paragraphs;
}

function buildFeaturedModel(products: Product[]): FeaturedModel | null {
  const grouped = new Map<string, Product[]>();

  for (const product of products) {
    const key = `${product.brand}|||${product.model}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(product);
  }

  const candidates = Array.from(grouped.entries()).map(([key, variants]) => {
    const [brand, model] = key.split("|||");
    const pricedVariants = [...variants]
      .filter((variant) => (variant.exactSizePriceUsd ?? variant.modelFromPriceUsd) !== null)
      .sort((a, b) => {
        const aPrice = a.exactSizePriceUsd ?? a.modelFromPriceUsd ?? Number.NEGATIVE_INFINITY;
        const bPrice = b.exactSizePriceUsd ?? b.modelFromPriceUsd ?? Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    const representativeVariant = pricedVariants[0] ?? variants[0];
    const prices = variants
      .map((variant) => variant.exactSizePriceUsd ?? variant.modelFromPriceUsd)
      .filter((price): price is number => price !== null);

    return {
      brand,
      model,
      priceFrom: prices.length > 0 ? Math.min(...prices) : null,
      priceTo: prices.length > 0 ? Math.max(...prices) : null,
      sizes: Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean))),
      springSystem: variants[0]?.springSystem ?? "",
      sourceUrl: representativeVariant ? getPreferredProductUrl(representativeVariant) : null,
      hasImage: hasModelImage(brand, model),
      rankingPrice: representativeVariant?.exactSizePriceUsd
        ?? representativeVariant?.modelFromPriceUsd
        ?? Number.NEGATIVE_INFINITY,
    };
  });

  const bestWithImage = [...candidates]
    .filter((candidate) => candidate.hasImage)
    .sort((a, b) => b.rankingPrice - a.rankingPrice)[0];

  if (bestWithImage) {
    return bestWithImage;
  }

  const bestCandidate = [...candidates].sort((a, b) => b.rankingPrice - a.rankingPrice)[0];
  return bestCandidate ?? null;
}

export async function generateStaticParams() {
  return getApprovedComparisons().map((comparison) => ({ pair: comparison.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const comparison = getApprovedComparison(pair);
  if (!comparison) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
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
  const introParagraphs = splitIntroIntoParagraphs(comparison.intro);
  const featuredModelA = buildFeaturedModel(brandA.products);
  const featuredModelB = buildFeaturedModel(brandB.products);
  const showAffiliateDisclosure = [featuredModelA, featuredModelB].some(
    (model) => model?.sourceUrl && isAffiliateBrand(model.brand),
  );
  const allProducts = [...brandA.products, ...brandB.products];
  const keyTakeaways = buildCompareTakeaways(brandA, brandB);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${comparison.title} — Trampoline Comparison`,
    description: comparison.intro,
    url: `${siteUrl}${comparison.href}`,
    author: { "@type": "Organization", name: "Bounce Arena", url: siteUrl },
    publisher: { "@type": "Organization", name: "Bounce Arena", url: siteUrl },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleSchema} />

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
          <div className="mb-6 flex items-center gap-4 sm:flex-wrap sm:gap-6">
            <Link
              href={`/brands/${brandA.slug}/`}
              className="group flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-48 sm:w-48 sm:flex-none"
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                <BrandLogoAvatar name={brandA.name} size={104} fillContainer />
              </div>
            </Link>
            <Link
              href={`/brands/${brandB.slug}/`}
              className="group flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-48 sm:w-48 sm:flex-none"
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                <BrandLogoAvatar name={brandB.name} size={104} fillContainer />
              </div>
            </Link>
          </div>
          <div className="mb-4 max-w-3xl space-y-4 text-black/60">
            {introParagraphs.map((paragraph, index) => (
              <p key={`${comparison.slug}-intro-${index}`} className="leading-7">
                {paragraph}
              </p>
            ))}
          </div>
          {showAffiliateDisclosure ? <AffiliateDisclosure className="mb-8" /> : null}

          {featuredModelA && featuredModelB && (
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-black">Featured Models</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[featuredModelA, featuredModelB].map((model, index) => {
                  const cardContent = (
                    <>
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-black/[0.06] bg-[#f7fbfa]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,177,171,0.14),_transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {model.hasImage ? (
                          <ModelImage
                            brand={model.brand}
                            model={model.model}
                            alt={`${model.brand} ${model.model}`}
                            sizes="(min-width: 1024px) 44vw, 100vw"
                            priority={index === 0}
                            className="p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-6">
                            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-5">
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-4">
                                <BrandLogoAvatar name={model.brand} size={132} fillContainer />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#38b1ab]">
                            {model.brand}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold leading-snug text-black">
                            {model.model}
                          </h3>
                        </div>

                        <p className="text-sm leading-6 text-black/50">
                          {model.springSystem || "Spring system not listed"}
                          {model.sizes.length > 0 && ` · ${model.sizes.join(", ")}`}
                        </p>

                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-black">
                            {model.priceFrom !== null
                              ? model.priceTo !== null && model.priceTo !== model.priceFrom
                                ? `${formatUsd(model.priceFrom)}–${formatUsd(model.priceTo)}`
                                : `From ${formatUsd(model.priceFrom)}`
                              : "Price varies"}
                          </div>
                          {model.sourceUrl && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#38b1ab] transition-all duration-200 group-hover:gap-1.5 group-hover:text-[#2e9a94]">
                              View
                              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                →
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );

                  return model.sourceUrl ? (
                    <a
                      key={`${comparison.slug}-${model.brand}-${model.model}`}
                      href={model.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      aria-label={`Open ${model.brand} ${model.model} in a new tab`}
                      className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#38b1ab]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38b1ab]/35 focus-visible:ring-offset-2 active:translate-y-0"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <article
                      key={`${comparison.slug}-${model.brand}-${model.model}`}
                      className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm"
                    >
                      {cardContent}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

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
            {keyTakeaways.length > 0 && (
              <div className="mb-5 rounded-2xl border border-black/[0.08] bg-black/[0.015] p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Key takeaways
                </p>
                <ul className="space-y-2 text-sm leading-6 text-black/65">
                  {keyTakeaways.map((takeaway) => (
                    <li key={takeaway} className="flex gap-2">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38b1ab]" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
