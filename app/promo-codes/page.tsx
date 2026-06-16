import type { Metadata } from "next";
import Link from "next/link";
import PromoCard from "@/components/ui/PromoCard";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Trampoline Promo Codes & Discount Codes 2026",
  description:
    "Find the latest trampoline promo codes and discount codes — Springfree, Acon, Vuly, Skywalker, and more. Click to copy and save on your purchase.",
  alternates: { canonical: `${SITE_URL}/promo-codes/` },
};

const PROMOS: { brand: string; code: string; description: string; expires?: string; affiliateUrl?: string }[] = [
  {
    brand: "Vuly",
    code: "BOUNCE15",
    description: "15% off sitewide on Vuly trampolines.",
    affiliateUrl: "https://www.vulyplay.com/aff/100/",
  },
];

export default function PromoCodesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";
  const promos = PROMOS;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Promo Codes", item: `${siteUrl}/promo-codes/` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-12">
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Promo Codes</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
          Trampoline Promo Codes
        </h1>
        <p className="text-black/60 mb-2 max-w-2xl">
          Current discount codes for trampoline brands. Click &ldquo;Copy&rdquo; to copy
          the code, then paste at checkout on the brand&apos;s website.
        </p>
        <p className="text-sm text-black/50 border border-black/[0.08] bg-black/[0.02] rounded-lg px-4 py-2 mb-6 inline-block">
          Always verify the code is active at checkout. Promo codes may expire or have terms.
        </p>

        <AffiliateDisclosure className="mb-8" />

        {promos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {promos.map((promo) => (
              <PromoCard key={promo.brand} promo={promo} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-8 text-center text-black/50 mb-10">
            <p className="font-semibold mb-2">No promo codes available yet</p>
            <p className="text-sm">
              Place <code>products-us.csv</code> in the <code>data/</code> directory.
              Codes will appear once brand source URLs are loaded.
            </p>
          </div>
        )}

        <section className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6 text-sm text-black/50 leading-relaxed">
          <h2 className="font-bold text-black/70 mb-2">About These Codes</h2>
          <p className="mb-2">
            Promo codes listed here are sourced from brand affiliate programs and direct brand
            partnerships. We earn a commission if you use our links and make a purchase, at no
            extra cost to you.
          </p>
          <p>
            Codes are updated periodically but may become inactive without notice. Always verify the code is active at checkout.
          </p>
        </section>
      </div>
    </>
  );
}
