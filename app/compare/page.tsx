import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { getApprovedComparisons } from "@/lib/comparisons";
import {
  getApprovedModelComparisons,
  type ModelComparisonArticle,
} from "@/lib/modelComparisons";
import { brandSlug, getAllProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import ComparisonHubClient, {
  type HubBrand,
  type HubBrandComparison,
  type HubBrandRef,
  type HubModelComparison,
} from "./ComparisonHubClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

const FEATURED_BRAND_ORDER = [
  "Springfree",
  "ACON",
  "Vuly",
  "Jumpflex",
  "Skywalker",
  "Zupapa",
  "AlleyOOP",
  "Akrobat",
  "Avyna",
  "North",
  "JUMPZYLLA",
];

export const metadata: Metadata = {
  title: "Trampoline Head-to-Head Comparisons 2026",
  description:
    "Find side-by-side trampoline brand and model comparisons, including Springfree vs ACON, Vuly vs Skywalker, Jumpflex vs Springfree, and more.",
  alternates: { canonical: `${SITE_URL}/compare/` },
  openGraph: {
    title: "Trampoline Head-to-Head Comparisons 2026",
    description:
      "Find side-by-side trampoline brand and model comparisons, including Springfree vs ACON, Vuly vs Skywalker, Jumpflex vs Springfree, and more.",
    url: `${SITE_URL}/compare/`,
  },
};

function makeBrandRef(name: string): HubBrandRef {
  return {
    name,
    slug: brandSlug(name),
  };
}

function addBrandStat(
  stats: Map<string, HubBrand>,
  brand: HubBrandRef,
  key: "brandComparisonCount" | "modelComparisonCount",
) {
  const current = stats.get(brand.slug) ?? {
    name: brand.name,
    slug: brand.slug,
    brandComparisonCount: 0,
    modelComparisonCount: 0,
    totalCount: 0,
  };

  current[key] += 1;
  current.totalCount = current.brandComparisonCount + current.modelComparisonCount;
  stats.set(brand.slug, current);
}

function getModelComparisonBrands(
  article: ModelComparisonArticle,
  productsBySourceRow: Map<number, Product>,
  knownBrands: HubBrandRef[],
): HubBrandRef[] {
  const brands = new Map<string, HubBrandRef>();

  for (const side of article.sides) {
    for (const rowIndex of side.rowIndices) {
      const product = productsBySourceRow.get(rowIndex);
      if (!product) continue;
      const brand = makeBrandRef(product.brand);
      brands.set(brand.slug, brand);
    }
  }

  if (brands.size === 0) {
    const labelText = ` ${article.labels.join(" ")} ${article.title} `.toLowerCase();
    for (const brand of knownBrands) {
      const needle = ` ${brand.name.toLowerCase()} `;
      if (labelText.includes(needle)) {
        brands.set(brand.slug, brand);
      }
    }
  }

  return Array.from(brands.values());
}

function buildHubData() {
  const approvedComparisons = getApprovedComparisons();
  const approvedModelComparisons = getApprovedModelComparisons();
  const productsBySourceRow = new Map(
    getAllProducts().map((product) => [product.sourceRowIndex, product]),
  );
  const knownBrandRefs = new Map<string, HubBrandRef>();
  const stats = new Map<string, HubBrand>();

  const brandComparisons: HubBrandComparison[] = approvedComparisons.map((comparison) => {
    const brandA = {
      name: comparison.brandA.name,
      slug: comparison.brandA.slug,
    };
    const brandB = {
      name: comparison.brandB.name,
      slug: comparison.brandB.slug,
    };

    knownBrandRefs.set(brandA.slug, brandA);
    knownBrandRefs.set(brandB.slug, brandB);
    addBrandStat(stats, brandA, "brandComparisonCount");
    addBrandStat(stats, brandB, "brandComparisonCount");

    return {
      slug: comparison.slug,
      href: comparison.href,
      title: comparison.title,
      labelA: comparison.labelA,
      labelB: comparison.labelB,
      intro: comparison.metaDescription ?? comparison.intro,
      brands: [brandA, brandB],
    };
  });

  for (const featuredBrand of FEATURED_BRAND_ORDER) {
    const brand = makeBrandRef(featuredBrand);
    knownBrandRefs.set(brand.slug, knownBrandRefs.get(brand.slug) ?? brand);
  }

  const modelComparisons: HubModelComparison[] = approvedModelComparisons.map((comparison) => {
    const brands = getModelComparisonBrands(
      comparison,
      productsBySourceRow,
      Array.from(knownBrandRefs.values()),
    );

    for (const brand of brands) {
      knownBrandRefs.set(brand.slug, brand);
      addBrandStat(stats, brand, "modelComparisonCount");
    }

    return {
      slug: comparison.slug,
      href: `/compare/${comparison.slug}/`,
      title: comparison.title,
      description: comparison.metaDescription,
      labels: comparison.labels,
      brands,
    };
  });

  const featuredOrder = new Map(
    FEATURED_BRAND_ORDER.map((name, index) => [brandSlug(name), index]),
  );
  const featuredBrands = Array.from(stats.values())
    .filter((brand) => featuredOrder.has(brand.slug))
    .sort((a, b) => {
      const aOrder = featuredOrder.get(a.slug) ?? Number.POSITIVE_INFINITY;
      const bOrder = featuredOrder.get(b.slug) ?? Number.POSITIVE_INFINITY;
      return aOrder - bOrder || b.totalCount - a.totalCount || a.name.localeCompare(b.name);
    });

  return {
    brands: featuredBrands,
    brandComparisons,
    modelComparisons,
  };
}

export default function CompareHubPage() {
  const { brands, brandComparisons, modelComparisons } = buildHubData();
  const allComparisonItems = [
    ...brandComparisons.map((comparison) => ({
      href: comparison.href,
      title: comparison.title,
    })),
    ...modelComparisons.map((comparison) => ({
      href: comparison.href,
      title: comparison.title,
    })),
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare/` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trampoline Head-to-Head Comparisons",
    url: `${SITE_URL}/compare/`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: allComparisonItems.map((comparison, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${comparison.href}`,
        name: comparison.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemListSchema} />
      <ComparisonHubClient
        brands={brands}
        brandComparisons={brandComparisons}
        modelComparisons={modelComparisons}
      />
    </>
  );
}
