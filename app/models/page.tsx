import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import JsonLd from "@/components/seo/JsonLd";
import BrowseClient from "./BrowseClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Browse All Trampoline Models — Filter by Price, Size & Brand",
  description:
    "Browse and filter every trampoline model available in the US. Narrow by price, size, brand, ASTM certification, and spring type to find your match.",
  alternates: { canonical: `${SITE_URL}/models/` },
  openGraph: {
    title: "Browse All Trampoline Models — Filter by Price, Size & Brand",
    description:
      "Browse and filter every trampoline model available in the US. Narrow by price, size, brand, ASTM certification, and spring type to find your match.",
    url: `${SITE_URL}/models/`,
  },
};

export default function ModelsPage() {
  const products = getAllProducts();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "All Models", item: `${SITE_URL}/models/` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 lg:px-10">
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">All Models</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
          Browse All Models
        </h1>
        <p className="text-black/60 mb-8 max-w-2xl">
          Filter every trampoline in the catalog by price, size, brand, and ASTM certification. Click any row to see per-size specs.
        </p>
        <p className="-mt-4 mb-8 max-w-2xl text-xs italic leading-relaxed text-black/40">
          This page contains affiliate links and we may earn a commission on purchases.
        </p>
      </div>

      <BrowseClient products={products} />
    </>
  );
}
