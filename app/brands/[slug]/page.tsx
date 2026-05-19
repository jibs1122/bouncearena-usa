import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getAllBrands, getBrand } from "@/lib/products";
import { getApprovedComparisons } from "@/lib/comparisons";
import { BRAND_INTROS } from "@/lib/brandIntros";
import ComparisonTable from "@/components/ui/ComparisonTable";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import JsonLd from "@/components/seo/JsonLd";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import ModelImage from "@/components/ui/ModelImage";
import { formatUsd } from "@/lib/price";
import { getPreferredBrandUrl, getPreferredModelUrl, withAffiliateTracking } from "@/lib/productLinks";
import { hasModelImage } from "@/lib/modelImages";
import { isAffiliateBrand } from "@/lib/vuly";

type Props = {
  params: Promise<{ slug: string }>;
};

type FeaturedModel = {
  brand: string;
  model: string;
  priceFrom: number | null;
  priceTo: number | null;
  sizes: string[];
  springSystem: string;
  sourceUrl: string | null;
};

function buildFeaturedModels(products: Product[]): FeaturedModel[] {
  const grouped = new Map<string, Product[]>();

  for (const product of products) {
    const key = `${product.brand}|||${product.model}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(product);
  }

  return Array.from(grouped.entries())
    .map(([key, variants]) => {
      const [brand, model] = key.split("|||");
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
        sourceUrl: getPreferredModelUrl(brand, variants),
      };
    })
    .filter((model) => hasModelImage(model.brand, model.model))
    .sort((a, b) => {
      const aPrice = a.priceTo ?? a.priceFrom ?? Number.NEGATIVE_INFINITY;
      const bPrice = b.priceTo ?? b.priceFrom ?? Number.NEGATIVE_INFINITY;
      return bPrice - aPrice;
    })
    .slice(0, 4);
}

export async function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};

  const brandTitle = brand.name.endsWith("Trampolines")
    ? brand.name
    : `${brand.name} Trampolines`;
  const priceStr = brand.fromPriceUsd
    ? ` from ${formatUsd(brand.fromPriceUsd)}`
    : "";
  const brandDescriptionLabel = brand.name.endsWith("Trampolines")
    ? brand.name
    : `${brand.name} trampolines`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
  return {
    title: `${brandTitle} Review 2026 — Specs & Prices`,
    description: `In-depth review of ${brandDescriptionLabel}${priceStr}. Sizes in feet/inches, weight limits in lb, ASTM safety certification status, and warranty details.`,
    alternates: { canonical: `${siteUrl}/brands/${slug}/` },
    openGraph: {
      title: `${brandTitle} — Review & Specs`,
      description: `Full spec breakdown of ${brand.name} models. Pricing, ASTM compliance, and warranty data.`,
      url: `${siteUrl}/brands/${slug}/`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();
  const brandTitle = brand.name.endsWith("Trampolines")
    ? brand.name
    : `${brand.name} Trampolines`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${siteUrl}/brands/` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${siteUrl}/brands/${slug}/` },
    ],
  };

  const priceValidUntil = `${new Date().getFullYear()}-12-31`;

  const productJsonLds = brand.products
    .filter((p) => p.exactSizePriceUsd || p.modelFromPriceUsd)
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${p.brand} ${p.model}${p.size ? ` ${p.size}` : ""}`,
      brand: { "@type": "Brand", name: p.brand },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: p.exactSizePriceUsd ?? p.modelFromPriceUsd,
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: withAffiliateTracking(p.sourceUrls[0] ?? null) ?? undefined,
      },
      ...(p.meetsUsStandard
        ? { additionalProperty: [{ "@type": "PropertyValue", name: "ASTM Certified", value: "Yes" }] }
        : {}),
    }));

  const hasAffiliate = brand.products.some((p) => p.sourceUrls.length > 0);
  const showAffiliateDisclosure = hasAffiliate && isAffiliateBrand(brand.name);
  const astmCount = brand.products.filter((p) => p.meetsUsStandard === true).length;
  const minPrice = brand.fromPriceUsd;
  const featuredModels = buildFeaturedModels(brand.products);

  // Comparisons that feature this brand
  const relatedComparisons = getApprovedComparisons().filter(
    (c) => c.brandA.slug === slug || c.brandB.slug === slug
  ).slice(0, 4);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {productJsonLds.length > 0 && <JsonLd data={productJsonLds} />}

      <div className="py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-black/40 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/brands/" className="hover:text-black transition-colors">Brands</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{brand.name}</span>
          </nav>

          {/* Brand header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
            <div className="flex aspect-square w-32 items-center justify-center rounded-2xl border border-black/[0.05] bg-[#f7fbfa] p-3 flex-shrink-0 sm:w-[9.75rem]">
              <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-white p-2.5 sm:p-3">
                <BrandLogoAvatar name={brand.name} size={120} fillContainer />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                {brandTitle}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1 bg-[#38b1ab]/10 text-[#38b1ab] rounded-full">
                  {brand.products.length} model{brand.products.length !== 1 ? "s" : ""}
                </span>
                {minPrice !== null && (
                  <span className="px-3 py-1 bg-black/[0.04] text-black/60 rounded-full">
                    From {formatUsd(minPrice)}
                  </span>
                )}
                {astmCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/[0.04] text-black/60 rounded-full">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 text-[#38b1ab]"
                      fill="none"
                    >
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
                      <path
                        d="M6.5 10.2 8.8 12.5 13.6 7.7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ASTM certified models available
                  </span>
                )}
              </div>
            </div>

            {getPreferredBrandUrl(brand.name, brand.sourceUrl) && (
              <a
                href={getPreferredBrandUrl(brand.name, brand.sourceUrl)!}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="flex-shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl bg-[#38b1ab] text-white font-semibold hover:bg-[#2e9a94] transition-colors text-sm"
              >
                Shop {brand.name} →
              </a>
            )}
          </div>

          {showAffiliateDisclosure ? <AffiliateDisclosure className="mb-8" /> : null}

          {/* Brand intro */}
          {BRAND_INTROS[brand.name] && (
            <div className="mb-10 max-w-3xl space-y-3">
              {BRAND_INTROS[brand.name].map((para, i) => (
                <p key={i} className="text-black/70 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          )}

          {featuredModels.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-xl font-bold text-black">Featured Models</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featuredModels.map((model, index) => {
                  const cardContent = (
                    <>
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-black/[0.06] bg-[#f7fbfa]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,177,171,0.14),_transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <ModelImage
                          brand={model.brand}
                          model={model.model}
                          alt={`${model.brand} ${model.model}`}
                          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 100vw"
                          priority={index === 0}
                          className="p-4 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </div>

                      <div className="space-y-3 p-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#38b1ab]">
                            {model.brand}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold leading-snug text-black">
                            {model.model}
                          </h3>
                        </div>

                        <p className="text-xs leading-6 text-black/50">
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
                      key={`${model.brand}-${model.model}`}
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
                      key={`${model.brand}-${model.model}`}
                      className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm"
                    >
                      {cardContent}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Spec table */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-black mb-4">Full Specifications</h2>
            <ComparisonTable products={brand.products} />
          </section>

          {/* Related comparisons */}
          {relatedComparisons.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-black mb-4">
                How {brand.name} Compares
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedComparisons.map((c) => (
                  <Link
                    key={c.slug}
                    href={c.href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-black/[0.08] hover:border-[#38b1ab]/40 hover:shadow-sm transition-all text-sm font-medium text-black"
                  >
                    <span>{c.labelA}</span>
                    <span className="text-black/30 text-xs font-normal">vs</span>
                    <span>{c.labelB}</span>
                    <span className="ml-auto text-[#38b1ab] text-xs">Compare →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ JSON-LD hook */}
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Is ${brand.name} ASTM certified?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text:
                      astmCount > 0
                        ? `${brand.name} has ${astmCount} model${astmCount !== 1 ? "s" : ""} that meet ASTM F381/F2225 safety standards according to official brand documentation.`
                        : `ASTM certification status for ${brand.name} could not be independently verified from official brand documentation. Please check directly with the manufacturer.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `What is the price of ${brand.name} trampolines in the US?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text:
                      minPrice !== null
                        ? `${brand.name} trampolines start from ${formatUsd(minPrice)}. Prices vary by model and size.`
                        : `Pricing for ${brand.name} trampolines was not available at time of last data update. Please check the brand website for current pricing.`,
                  },
                },
              ],
            }}
          />
        </div>
      </div>
    </>
  );
}
