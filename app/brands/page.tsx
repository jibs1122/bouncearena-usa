import type { Metadata } from "next";
import { getAllBrands } from "@/lib/products";
import BrandCard from "@/components/ui/BrandCard";
import JsonLd from "@/components/seo/JsonLd";
import Link from "next/link";
import { getApprovedComparisons } from "@/lib/comparisons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "All Trampoline Brands — Compare Brands 2026",
  description:
    "Browse major trampoline brands — Springfree, Acon, Vuly, Skywalker, JumpKing, and more. Filter by price, size (ft/in), and ASTM safety certification.",
  alternates: { canonical: `${SITE_URL}/brands/` },
  openGraph: {
    title: "All Trampoline Brands — Compare Brands 2026",
    description:
      "Browse major trampoline brands — Springfree, Acon, Vuly, Skywalker, JumpKing, and more. Filter by price, size, and ASTM safety certification.",
    url: `${SITE_URL}/brands/`,
  },
};

export default function BrandsPage() {
  const brands = getAllBrands();
  const comparisons = getApprovedComparisons(6);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands/` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trampoline Brands",
    url: `${SITE_URL}/brands/`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: brands.map((brand, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/brands/${brand.slug}/`,
        name: brand.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Brands</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
          Trampoline Brands
        </h1>
        <p className="text-black/60 max-w-2xl mb-8">
          {brands.length} brands independently reviewed and compared.
          All dimensions in feet and inches.
        </p>

        {brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {brands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-8 text-center text-black/50 mb-12">
            <p className="font-semibold mb-2">Product data not yet loaded</p>
            <p className="text-sm">Place <code>products-us.csv</code> in the <code>data/</code> directory and rebuild.</p>
          </div>
        )}

        {comparisons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Popular Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comparisons.map((comparison) => (
                <Link
                  key={comparison.slug}
                  href={comparison.href}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white border border-black/[0.08] hover:border-[#38b1ab]/40 hover:shadow-sm transition-all font-semibold text-black"
                >
                  <span>{comparison.labelA}</span>
                  <span className="text-black/30 text-sm font-normal">vs</span>
                  <span>{comparison.labelB}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
