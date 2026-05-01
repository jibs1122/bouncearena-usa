import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllBrands, getBrand } from "@/lib/products";
import { getBrandShopUrl } from "@/lib/brandLogos";
import { getApprovedComparisons } from "@/lib/comparisons";
import { BRAND_INTROS } from "@/lib/brandIntros";
import ComparisonTable from "@/components/ui/ComparisonTable";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import JsonLd from "@/components/seo/JsonLd";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import { formatUsd } from "@/lib/price";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};

  const priceStr = brand.fromPriceUsd
    ? ` from ${formatUsd(brand.fromPriceUsd)}`
    : "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";
  return {
    title: `${brand.name} Trampolines Review 2026 — US Specs & Prices`,
    description: `In-depth review of ${brand.name} trampolines${priceStr}. Sizes in feet/inches, weight limits in lb, ASTM safety certification status, and warranty details for the US market.`,
    alternates: { canonical: `${siteUrl}/brands/${slug}/` },
    openGraph: {
      title: `${brand.name} Trampolines — US Review & Specs`,
      description: `Full spec breakdown of all ${brand.name} trampoline models available in the US. Pricing, ASTM compliance, and warranty data.`,
      url: `${siteUrl}/brands/${slug}/`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${siteUrl}/brands/` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${siteUrl}/brands/${slug}/` },
    ],
  };

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
        availability: "https://schema.org/InStock",
        url: p.sourceUrls[0] ?? undefined,
      },
      ...(p.meetsUsStandard
        ? { additionalProperty: [{ "@type": "PropertyValue", name: "ASTM Certified", value: "Yes" }] }
        : {}),
    }));

  const hasAffiliate = brand.products.some((p) => p.sourceUrls.length > 0);
  const astmCount = brand.products.filter((p) => p.meetsUsStandard === true).length;
  const minPrice = brand.fromPriceUsd;

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
            <div className="flex aspect-square w-28 items-center justify-center rounded-2xl border border-black/[0.05] bg-[#f7fbfa] p-3 flex-shrink-0 sm:w-32">
              <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-3.5">
                <BrandLogoAvatar name={brand.name} size={92} fillContainer />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                {brand.name} Trampolines
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
                  <span className="px-3 py-1 bg-black/[0.04] text-black/60 rounded-full">
                    ✅ ASTM certified models available
                  </span>
                )}
              </div>
            </div>

            {getBrandShopUrl(brand.name, brand.sourceUrl) && (
              <a
                href={getBrandShopUrl(brand.name, brand.sourceUrl)!}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="flex-shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl bg-[#38b1ab] text-white font-semibold hover:bg-[#2e9a94] transition-colors text-sm"
              >
                Shop {brand.name} →
              </a>
            )}
          </div>

          {hasAffiliate && <AffiliateDisclosure className="mb-8" />}

          {/* Brand intro */}
          {BRAND_INTROS[brand.name] && (
            <p className="text-black/70 leading-relaxed mb-10 max-w-3xl">
              {BRAND_INTROS[brand.name]}
            </p>
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
