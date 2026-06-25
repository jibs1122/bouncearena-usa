import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ModelImage from "@/components/ui/ModelImage";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import { ACON_DISCOUNT_TIERS, ACON_PROMO_AFFILIATE_URL } from "@/lib/promoCtas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

function getCurrentMonthYear() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export const metadata: Metadata = {
  title: { absolute: "ACON Promo Code 2026 — BOUNCE | Bounce Arena" },
  description:
    "Use ACON promo code BOUNCE for $15 to $150 off eligible ACON orders. Compare ACON round, HD rectangular and ACON X trampolines before you buy.",
  alternates: { canonical: `${SITE_URL}/acon-promo-code/` },
  openGraph: {
    title: "ACON Promo Code 2026 — BOUNCE",
    description:
      "Use ACON promo code BOUNCE for $15 to $150 off eligible ACON orders.",
    url: `${SITE_URL}/acon-promo-code/`,
  },
};

const FEATURED_SECTIONS = [
  {
    title: "ACON Air round trampolines",
    brand: "ACON",
    model: "ACON Air 15ft Round Trampoline with Standard Net and Ladder",
    alt: "ACON Air round trampoline",
    body:
      "The ACON Air round models are the simpler family option if you want a traditional round trampoline. They are the place to start if you do not need a rectangular performance mat.",
    links: [
      { label: "ACON 14ft vs ACON 15ft Round", href: "/compare/acon-14ft-vs-acon-15ft-round/" },
      { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
    ],
  },
  {
    title: "ACON 13 HD and 16 HD",
    brand: "ACON",
    model: "ACON 16 HD Rectangular Trampoline with Net and Ladder",
    alt: "ACON 16 HD trampoline",
    body:
      "The HD rectangular models are the main ACON performance line. They suit buyers who want a firmer, more even rectangular bounce for older kids, teens or tricks.",
    links: [
      { label: "ACON 16 HD vs ACON 13 HD", href: "/compare/acon-16-hd-vs-acon-13-hd/" },
      { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
    ],
  },
  {
    title: "ACON 16 HD Pro",
    brand: "ACON",
    model: "ACON 16 HD PRO Rectangular Trampoline with Net and Ladder",
    alt: "ACON 16 HD Pro trampoline",
    body:
      "The 16 HD Pro is the step-up version of the 16 HD. It is worth comparing if you already know you want an ACON rectangle and are deciding whether the upgrade is worth it.",
    links: [
      { label: "ACON 16 HD vs ACON 16 HD Pro", href: "/compare/acon-16-hd-vs-acon-16-hd-pro/" },
    ],
  },
  {
    title: "ACON X 17ft",
    brand: "ACON",
    model: "ACON X 17ft Rectangular Trampoline with Net and Ladder",
    alt: "ACON X 17ft trampoline",
    body:
      "The ACON X 17ft is the flagship rectangle. It is the largest and most premium ACON model on the site, built for buyers who want maximum jumping area and a high-end performance setup.",
    links: [
      { label: "ACON 16 HD vs ACON X 17ft", href: "/compare/acon-16-hd-vs-acon-x-17ft/" },
      { label: "ACON X vs North Performer / Legend", href: "/compare/acon-x-vs-north-performer-legend/" },
      { label: "ACON X 17ft vs MaxAir Rectangle", href: "/compare/acon-x-17ft-vs-maxair-rectangle/" },
    ],
  },
];

const RELATED_LINKS = [
  { label: "Springfree vs ACON", href: "/compare/springfree-vs-acon/" },
  { label: "ACON vs Vuly", href: "/compare/acon-vs-vuly/" },
  { label: "ACON vs Jumpflex", href: "/compare/acon-vs-jumpflex/" },
  { label: "ACON 16 HD vs ACON X 17ft", href: "/compare/acon-16-hd-vs-acon-x-17ft/" },
  { label: "ACON 16 HD vs ACON 13 HD", href: "/compare/acon-16-hd-vs-acon-13-hd/" },
  { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
  { label: "ACON 14ft vs ACON 15ft Round", href: "/compare/acon-14ft-vs-acon-15ft-round/" },
  { label: "ACON 16 HD vs ACON 16 HD Pro", href: "/compare/acon-16-hd-vs-acon-16-hd-pro/" },
];

export default function AconPromoCodePage() {
  const lastVerified = getCurrentMonthYear();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "ACON Promo Code", item: `${SITE_URL}/acon-promo-code/` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "ACON Promo Code 2026",
    description: metadata.description,
    url: `${SITE_URL}/acon-promo-code/`,
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPageSchema} />

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">ACON Promo Code</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-black sm:text-4xl">
            ACON Promo Code 2026
          </h1>
          <p className="mb-4 text-lg leading-8 text-black/70">
            Use code <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-[#2e9a94]">BOUNCE</code> at ACON for $15 to $150 off, depending on your order total.
          </p>
          <p className="mb-4 leading-7 text-black/65">
            Add products to your cart, enter the code at checkout, and verify the amount has been deducted before you pay.
          </p>
          <p className="mb-6 text-sm font-semibold text-black">Last verified: {lastVerified}</p>
          <AffiliateDisclosure className="mb-8" />

          <section className="mb-10 rounded-2xl border border-[#38b1ab]/20 bg-[#f7fbfa] p-6">
            <h2 className="mb-3 text-xl font-bold text-black">ACON code</h2>
            <p className="mb-4 text-black/70">
              Code: <code className="rounded bg-white px-2 py-1 font-mono font-bold tracking-wider text-[#2e9a94]">BOUNCE</code>
            </p>
            <p className="mb-3 text-sm leading-6 text-black/65">The discount scales with your order total:</p>
            <div className="mb-5 overflow-hidden rounded-xl border border-black/[0.08] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[0.03] text-black">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order total</th>
                    <th className="px-4 py-3 text-right font-semibold">Discount with BOUNCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] text-black/70">
                  {ACON_DISCOUNT_TIERS.map((tier) => (
                    <tr key={tier.threshold}>
                      <td className="px-4 py-3">{tier.threshold}</td>
                      <td className="px-4 py-3 text-right font-medium text-black">{tier.discount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-5 text-sm leading-6 text-black/65">
              Add your ACON trampoline or accessories to cart, enter <code className="rounded bg-white px-1 py-0.5 text-[#2e9a94]">BOUNCE</code> in the promo field at checkout, and check that the discount appears before you pay.
            </p>
            <a
              href={ACON_PROMO_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
            >
              Shop ACON with BOUNCE
            </a>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-black">Which ACON trampoline is best for you?</h2>
            <p className="mb-6 leading-7 text-black/65">
              ACON is a performance-focused trampoline brand. Its US range covers smaller round trampolines, larger Air round models, HD rectangular models and the flagship ACON X.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURED_SECTIONS.map((section) => (
                <section key={section.title} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                  <div className="relative aspect-[4/3] bg-[#f7fbfa]">
                    <ModelImage brand={section.brand} model={section.model} alt={section.alt} sizes="(min-width: 768px) 384px, 100vw" className="p-5" />
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-black">{section.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-black/65">{section.body}</p>
                    <div className="flex flex-wrap gap-2">
                      {section.links.map((link) => (
                        <Link key={link.href} href={link.href} className="rounded-lg border border-black/[0.08] px-2.5 py-1.5 text-xs font-medium text-black/60 hover:border-[#38b1ab]/40 hover:text-black">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
            <h2 className="mb-3 text-xl font-bold text-black">Before you buy</h2>
            <ol className="mb-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-black/65">
              <li>The trampoline fits your yard with enough clearance around it.</li>
              <li>You are choosing the right shape: round for general family use, rectangle for a more performance-focused bounce.</li>
              <li>The <code className="rounded bg-white px-1 py-0.5 text-[#2e9a94]">BOUNCE</code> discount appears in your cart before checkout.</li>
            </ol>
            <Link href="/quiz/" className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]">
              Take the trampoline quiz
            </Link>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="mb-4 text-xl font-bold text-black">Related ACON comparisons</h2>
            <div className="flex flex-wrap gap-3">
              {RELATED_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
