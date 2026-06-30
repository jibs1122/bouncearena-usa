import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Product } from "@/lib/types";
import ComparisonTable from "@/components/ui/ComparisonTable";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import ComparePromoCta from "@/components/ui/ComparePromoCta";
import JsonLd from "@/components/seo/JsonLd";
import BrandLogoAvatar from "@/components/ui/BrandLogoAvatar";
import ModelImage from "@/components/ui/ModelImage";
import {
  getApprovedComparison,
  getApprovedComparisons,
} from "@/lib/comparisons";
import {
  getApprovedModelComparison,
  getApprovedModelComparisons,
  type ModelComparisonArticle,
} from "@/lib/modelComparisons";
import { brandSlug, getAllProducts } from "@/lib/products";
import { formatUsd } from "@/lib/price";
import { buildCompareTakeaways } from "@/lib/compareTakeaways";
import {
  getAmazonModelUrl,
  getPreferredProductUrl,
  getShopCtaLabel,
  isAmazonUrl,
} from "@/lib/productLinks";
import { getModelImage, hasModelImage } from "@/lib/modelImages";
import { isAffiliateBrand } from "@/lib/vuly";
import { buildPromoCtasForBrands, buildPromoCtasFromLabels } from "@/lib/promoCtas";
import { formatBrandModelName, modelNameWithoutBrandPrefix } from "@/lib/displayText";
import { getModelComparisonLinks, getPromoPageForBrand } from "@/lib/internalLinks";

type Props = { params: Promise<{ pair: string }> };

type FeaturedModel = {
  brand: string;
  model: string;
  priceFrom: number | null;
  priceTo: number | null;
  sizes: string[];
  springSystem: string;
  sourceUrl: string | null;
  amazonUrl: string | null;
  hasImage: boolean;
};

type ModelComparisonCard = {
  label: string;
  product: Product;
  sourceUrl: string;
};

type ModelComparisonBrand = {
  name: string;
  slug: string;
};

type RelatedReadingLink = {
  href: string;
  label: string;
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

function featuredModelImageClass(brand: string): string {
  const baseClass = "transition-transform duration-500 ease-out group-hover:scale-[1.04]";
  const normalizedBrand = brand.trim().toLowerCase();
  if (normalizedBrand === "jumpzylla") return `p-10 sm:p-12 lg:p-14 ${baseClass}`;
  if (normalizedBrand === "orcc") return `p-5 sm:p-6 ${baseClass}`;
  return `p-5 ${baseClass}`;
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
      springSystem: variants.find((variant) => variant.springSystem.trim())?.springSystem ?? "",
      sourceUrl: representativeVariant ? getPreferredProductUrl(representativeVariant) : null,
      amazonUrl: getAmazonModelUrl(brand, variants),
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

function buildModelComparisonCards(article: ModelComparisonArticle): ModelComparisonCard[] {
  if (article.sides.length < 2) return [];

  const productsBySourceRow = new Map(
    getAllProducts().map((product) => [product.sourceRowIndex, product]),
  );

  const cards = article.sides.map((side) => {
    const candidates = side.rowIndices
      .map((rowIndex) => productsBySourceRow.get(rowIndex))
      .filter((product): product is Product => Boolean(product))
      .filter((product) => product.sourceUrls.length > 0)
      .filter((product) => hasModelImage(product.brand, product.model))
      .sort((a, b) => {
        const aPrice = a.exactSizePriceUsd ?? a.modelFromPriceUsd ?? Number.NEGATIVE_INFINITY;
        const bPrice = b.exactSizePriceUsd ?? b.modelFromPriceUsd ?? Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    const product = candidates[0];
    const sourceUrl = product ? getPreferredProductUrl(product) : null;

    return product && sourceUrl ? { label: side.label, product, sourceUrl } : null;
  });

  if (cards.some((card) => card === null)) return [];

  return cards.filter((card): card is ModelComparisonCard => card !== null);
}

function getProductsBySourceRow(): Map<number, Product> {
  return new Map(getAllProducts().map((product) => [product.sourceRowIndex, product]));
}

function getModelComparisonProducts(
  article: ModelComparisonArticle,
  productsBySourceRow = getProductsBySourceRow(),
): Product[] {
  const products = new Map<number, Product>();

  for (const side of article.sides) {
    for (const rowIndex of side.rowIndices) {
      const product = productsBySourceRow.get(rowIndex);
      if (product) {
        products.set(product.sourceRowIndex, product);
      }
    }
  }

  return Array.from(products.values());
}

function getModelComparisonBrands(
  article: ModelComparisonArticle,
  productsBySourceRow = getProductsBySourceRow(),
): ModelComparisonBrand[] {
  const brands = new Map<string, ModelComparisonBrand>();

  for (const product of getModelComparisonProducts(article, productsBySourceRow)) {
    const slug = brandSlug(product.brand);
    if (!brands.has(slug)) {
      brands.set(slug, { name: product.brand, slug });
    }
  }

  return Array.from(brands.values());
}

function buildModelComparisonRelatedLinks(article: ModelComparisonArticle): RelatedReadingLink[] {
  const productsBySourceRow = getProductsBySourceRow();
  const articleBrands = getModelComparisonBrands(article, productsBySourceRow);
  const articleBrandSlugs = new Set(articleBrands.map((brand) => brand.slug));
  const links: RelatedReadingLink[] = [];
  const seenHrefs = new Set<string>();
  const addLink = (href: string, label: string) => {
    if (seenHrefs.has(href)) return;
    seenHrefs.add(href);
    links.push({ href, label });
  };

  for (const brand of articleBrands) {
    addLink(`/brands/${brand.slug}/`, `${brand.name} brand page`);
    const promoPage = getPromoPageForBrand(brand.name);
    if (promoPage) addLink(promoPage.href, promoPage.label);
  }

  for (const product of getModelComparisonProducts(article, productsBySourceRow)) {
    getModelComparisonLinks(product.brand, product.model).forEach((link) =>
      {
        if (link.href !== `/compare/${article.slug}/`) addLink(link.href, link.label);
      },
    );
  }

  getApprovedComparisons()
    .filter(
      (comparison) =>
        articleBrandSlugs.has(comparison.brandA.slug) ||
        articleBrandSlugs.has(comparison.brandB.slug),
    )
    .slice(0, 4)
    .forEach((comparison) => addLink(comparison.href, comparison.title));

  getApprovedModelComparisons()
    .filter((comparison) => comparison.slug !== article.slug)
    .filter((comparison) =>
      getModelComparisonBrands(comparison, productsBySourceRow).some((brand) =>
        articleBrandSlugs.has(brand.slug),
      ),
    )
    .slice(0, 4)
    .forEach((comparison) => addLink(`/compare/${comparison.slug}/`, comparison.title));

  if (links.length === 0) {
    addLink("/compare/", "All comparisons");
    addLink("/models/", "Trampoline models");
  }

  return links;
}

function stripManagedModelSections(markdown: string): string {
  return markdown
    .replace(/\n+## Data notes[\s\S]*?(?=\n+## |$)/g, "")
    .replace(/\n+## Related reading[\s\S]*?(?=\n+## |$)/gi, "")
    .replace(/\n+\*\*Affiliate disclosure:\*\*.*(?:\n|$)/gi, "\n")
    .replace(/\n+## Not sure which trampoline fits best\?[\s\S]*?(?=\n+## |$)/gi, "");
}

function prepareModelComparisonContent(markdown: string, hasPromos: boolean): string {
  const cleaned = stripManagedModelSections(markdown).trim();
  const sharedBlocks = [
    "<AffiliateDisclosureSlot />",
    hasPromos ? "<ComparePromoCtaSlot />" : null,
    "<ModelCardsSlot />",
  ].filter(Boolean).join("\n\n");
  const withIntroBlocks = cleaned.includes("\n## Quick verdict")
    ? cleaned.replace(/\n+## Quick verdict/, `\n\n${sharedBlocks}\n\n## Quick verdict`)
    : `${cleaned}\n\n${sharedBlocks}`;

  return `${withIntroBlocks.trim()}\n\n<QuizCtaSlot />\n\n<RelatedReadingSlot />`;
}

export async function generateStaticParams() {
  return [
    ...getApprovedComparisons().map((comparison) => ({ pair: comparison.slug })),
    ...getApprovedModelComparisons().map((comparison) => ({ pair: comparison.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const comparison = getApprovedComparison(pair);
  if (!comparison) {
    const modelComparison = getApprovedModelComparison(pair);
    if (!modelComparison) return {};

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
    return {
      title: modelComparison.metaTitle,
      description: modelComparison.metaDescription,
      alternates: { canonical: `${siteUrl}/compare/${modelComparison.slug}/` },
      openGraph: {
        title: modelComparison.title,
        description: modelComparison.metaDescription,
        url: `${siteUrl}/compare/${modelComparison.slug}/`,
      },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
  const description = comparison.metaDescription ?? comparison.intro;
  return {
    title: `${comparison.title} — Trampoline Comparison 2026`,
    description,
    alternates: { canonical: `${siteUrl}${comparison.href}` },
    openGraph: {
      title: `${comparison.title} Trampolines`,
      description,
      url: `${siteUrl}${comparison.href}`,
    },
  };
}

function ModelComparisonPage({ article }: { article: ModelComparisonArticle }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
  const promoCtas = buildPromoCtasFromLabels(article.labels);
  const modelCards = buildModelComparisonCards(article);
  const relatedReadingLinks = buildModelComparisonRelatedLinks(article);
  const content = prepareModelComparisonContent(article.content, promoCtas.length > 0);
  const affiliateModelUrls = modelCards
    .filter(({ product }) => isAffiliateBrand(product.brand))
    .map(({ sourceUrl }) => sourceUrl);
  const affiliateDisclosureVariant = affiliateModelUrls.length > 0
    && affiliateModelUrls.every((url) => isAmazonUrl(url))
    && promoCtas.length === 0
    ? "amazon"
    : "general";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${siteUrl}/compare/` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${siteUrl}/compare/${article.slug}/` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    url: `${siteUrl}/compare/${article.slug}/`,
    author: { "@type": "Organization", name: "Bounce Arena", url: siteUrl },
    publisher: { "@type": "Organization", name: "Bounce Arena", url: siteUrl },
  };

  const itemListSchema = modelCards.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${article.title} compared models`,
        itemListElement: modelCards.map(({ product }, index) => {
          const image = getModelImage(product.brand, product.model);

          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: formatBrandModelName(product.brand, product.model),
              brand: { "@type": "Brand", name: product.brand },
              image: image ? `${siteUrl}${image.src}` : undefined,
              offers:
                (product.exactSizePriceUsd ?? product.modelFromPriceUsd) !== null
                  ? {
                      "@type": "Offer",
                      priceCurrency: "USD",
                      price: product.exactSizePriceUsd ?? product.modelFromPriceUsd,
                      url: getPreferredProductUrl(product) ?? undefined,
                    }
                  : undefined,
            },
          };
        }),
      }
    : null;

  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="mb-6 text-3xl font-bold leading-tight text-black sm:text-4xl" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="mb-4 mt-10 text-2xl font-bold text-black" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="mb-3 mt-7 text-lg font-bold text-black" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-5 text-[17px] leading-8 text-black/75" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-[17px] leading-8 text-black/75" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className="text-[#38b1ab] underline decoration-[#38b1ab]/40 underline-offset-4" {...props} />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-semibold text-black" {...props} />
    ),
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="mb-8 overflow-x-auto rounded-xl border border-black/[0.08] shadow-sm">
        <table className="min-w-max border-separate border-spacing-0 text-sm" {...props} />
      </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-[#38b1ab] text-white" {...props} />
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th className="border-b border-black/[0.08] px-4 py-3 text-left font-semibold" {...props} />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td className="border-b border-black/[0.05] px-4 py-2.5 align-top text-black/80" {...props} />
    ),
    AffiliateDisclosureSlot: () => (
      <AffiliateDisclosure className="mb-8" variant={affiliateDisclosureVariant} />
    ),
    ComparePromoCtaSlot: () => <ComparePromoCta promos={promoCtas} />,
    ModelCardsSlot: () => {
      if (modelCards.length < 2) return null;

      return (
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {modelCards.map(({ label, product, sourceUrl }, index) => (
              <a
                key={`${article.slug}-${product.sourceRowIndex}`}
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                aria-label={`Open ${formatBrandModelName(product.brand, label)} in a new tab`}
                className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#38b1ab]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38b1ab]/35 focus-visible:ring-offset-2 active:translate-y-0"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-black/[0.06] bg-[#f7fbfa]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,177,171,0.14),_transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <ModelImage
                    brand={product.brand}
                    model={product.model}
                    alt={formatBrandModelName(product.brand, product.model)}
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    priority={index === 0}
                    className={featuredModelImageClass(product.brand)}
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#38b1ab]">
                      {product.brand}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold leading-snug text-black">
                      {modelNameWithoutBrandPrefix(product.brand, label)}
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-black/50">
                    {[product.shape, product.size, product.springSystem].filter(Boolean).join(" · ")}
                  </p>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#38b1ab] transition-all duration-200 group-hover:gap-1.5 group-hover:text-[#2e9a94]">
                    {getShopCtaLabel(sourceUrl, product.brand)}
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      );
    },
    QuizCtaSlot: () => (
      <section className="mb-8 mt-8 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
        <h2 className="mb-2 text-lg font-bold text-black">Not sure which trampoline fits best?</h2>
        <p className="mb-4 max-w-2xl text-sm leading-6 text-black/60">
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
    ),
    RelatedReadingSlot: () => (
      <section className="mt-12 rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
        <h2 className="mb-4 text-lg font-bold text-black">Related Reading</h2>
        <div className="flex flex-wrap gap-3">
          {relatedReadingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleSchema} />
      {itemListSchema ? <JsonLd data={itemListSchema} /> : null}

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare/" className="transition-colors hover:text-black">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-black">{article.title}</span>
        </nav>

        <div className="max-w-3xl">
          <MDXRemote
            source={content}
            components={components}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </article>
    </>
  );
}

export default async function ComparePairPage({ params }: Props) {
  const { pair } = await params;
  const comparison = getApprovedComparison(pair);
  if (!comparison) {
    const modelComparison = getApprovedModelComparison(pair);
    if (!modelComparison) notFound();
    return <ModelComparisonPage article={modelComparison} />;
  }

  const { brandA, brandB } = comparison;
  const introParagraphs =
    comparison.introParagraphs && comparison.introParagraphs.length > 0
      ? comparison.introParagraphs
      : splitIntroIntoParagraphs(comparison.intro);
  const featuredModelA = buildFeaturedModel(brandA.products);
  const featuredModelB = buildFeaturedModel(brandB.products);
  const featuredModels = [featuredModelA, featuredModelB].filter(
    (model): model is FeaturedModel => model !== null,
  );
  const promoCtas = buildPromoCtasForBrands([brandA.name, brandB.name]);
  const showAffiliateDisclosure = comparison.forceAffiliateDisclosure || [featuredModelA, featuredModelB].some(
    (model) => model?.sourceUrl && isAffiliateBrand(model.brand),
  );
  const affiliateFeaturedUrls = featuredModels
    .filter((model) => isAffiliateBrand(model.brand))
    .map((model) => model.sourceUrl)
    .filter((url): url is string => url !== null);
  const affiliateDisclosureVariant = affiliateFeaturedUrls.length > 0
    && affiliateFeaturedUrls.every((url) => isAmazonUrl(url))
    && promoCtas.length === 0
    ? "amazon"
    : "general";
  const allProducts = [...brandA.products, ...brandB.products];
  const hasFullSpecData = comparison.brandAHasData && comparison.brandBHasData;
  const keyTakeaways =
    comparison.keyTakeaways && comparison.keyTakeaways.length > 0
      ? comparison.keyTakeaways
      : hasFullSpecData
        ? buildCompareTakeaways(brandA, brandB)
        : [];
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
  const promoPageLinks = [brandA.name, brandB.name]
    .map(getPromoPageForBrand)
    .filter((link): link is NonNullable<typeof link> => link !== null);

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
            {comparison.brandAHasData ? (
              <Link
                href={`/brands/${brandA.slug}/`}
                className="group flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-48 sm:w-48 sm:flex-none"
              >
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                  <BrandLogoAvatar name={brandA.name} size={104} fillContainer />
                </div>
              </Link>
            ) : (
              <div className="flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 sm:h-48 sm:w-48 sm:flex-none">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                  <BrandLogoAvatar name={brandA.name} size={104} fillContainer />
                </div>
              </div>
            )}
            {comparison.brandBHasData ? (
              <Link
                href={`/brands/${brandB.slug}/`}
                className="group flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 transition-all hover:border-[#38b1ab]/40 hover:shadow-sm sm:h-48 sm:w-48 sm:flex-none"
              >
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                  <BrandLogoAvatar name={brandB.name} size={104} fillContainer />
                </div>
              </Link>
            ) : (
              <div className="flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f7fbfa] p-3 sm:h-48 sm:w-48 sm:flex-none">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 sm:p-4">
                  <BrandLogoAvatar name={brandB.name} size={104} fillContainer />
                </div>
              </div>
            )}
          </div>
          <div className="mb-4 max-w-3xl space-y-4 text-black/60">
            {introParagraphs.map((paragraph, index) => (
              <p key={`${comparison.slug}-intro-${index}`} className="leading-7">
                {paragraph}
              </p>
            ))}
          </div>
          {showAffiliateDisclosure ? (
            <AffiliateDisclosure className="mb-8" variant={affiliateDisclosureVariant} />
          ) : null}

          <ComparePromoCta promos={promoCtas} />

          {featuredModels.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-black">Featured Models</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featuredModels.map((model, index) => {
                  return (
                    <article
                      key={`${comparison.slug}-${model.brand}-${model.model}`}
                      className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#38b1ab]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-black/[0.06] bg-[#f7fbfa]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,177,171,0.14),_transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {model.hasImage ? (
                          <ModelImage
                            brand={model.brand}
                            model={model.model}
                            alt={formatBrandModelName(model.brand, model.model)}
                            sizes="(min-width: 1024px) 44vw, 100vw"
                            priority={index === 0}
                            className={featuredModelImageClass(model.brand)}
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
                            {modelNameWithoutBrandPrefix(model.brand, model.model)}
                          </h3>
                        </div>

                        {(model.springSystem || model.sizes.length > 0) && (
                          <p className="text-sm leading-6 text-black/50">
                            {[model.springSystem, model.sizes.join(", ")].filter(Boolean).join(" · ")}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-black">
                            {model.priceFrom !== null
                              ? model.priceTo !== null && model.priceTo !== model.priceFrom
                                ? `${formatUsd(model.priceFrom)}–${formatUsd(model.priceTo)}`
                                : `From ${formatUsd(model.priceFrom)}`
                              : "Price varies"}
                          </div>
                          {(model.sourceUrl || model.amazonUrl) && (
                            <div className="flex flex-wrap gap-2">
                              {model.sourceUrl && (
                                <a
                                  href={model.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow sponsored"
                                  className="inline-flex items-center rounded-lg bg-[#38b1ab] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2e9a94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38b1ab]/35 focus-visible:ring-offset-2"
                                >
                                  {getShopCtaLabel(model.sourceUrl, model.brand)}
                                  <span className="ml-1">→</span>
                                </a>
                              )}
                              {model.amazonUrl && model.amazonUrl !== model.sourceUrl && (
                                <a
                                  href={model.amazonUrl}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow sponsored"
                                  className="inline-flex items-center rounded-lg border border-[#38b1ab]/30 bg-white px-3 py-2 text-xs font-semibold text-[#238985] transition-colors hover:border-[#38b1ab]/60 hover:bg-[#38b1ab]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38b1ab]/35 focus-visible:ring-offset-2"
                                >
                                  View on Amazon
                                  <span className="ml-1">→</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
          )}

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
            {hasFullSpecData ? <ComparisonTable products={allProducts} /> : null}
            {!hasFullSpecData && comparison.sharedSpecs && comparison.sharedSpecs.length > 0 && (
              <div className="mt-3 rounded-xl border border-black/[0.08] bg-[#f7f8f8] px-4 py-4">
                <p className="mb-3 text-sm font-medium text-black/50">Shared across all models</p>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                  {comparison.sharedSpecs.map((spec) => (
                    <div key={`${spec.label}-${spec.value}`}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
                        {spec.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-black/80">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
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

          <section className="mt-8 rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="text-lg font-bold text-black mb-4">Related Reading</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {comparison.brandAHasData && (
                <Link
                  href={`/brands/${brandA.slug}/`}
                  className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
                >
                  {brandA.name} brand page
                </Link>
              )}
              {comparison.brandBHasData && (
                <Link
                  href={`/brands/${brandB.slug}/`}
                  className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
                >
                  {brandB.name} brand page
                </Link>
              )}
              {promoPageLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm px-3 py-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:border-[#38b1ab]/40 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
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
