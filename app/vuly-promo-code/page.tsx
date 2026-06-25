import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ModelImage from "@/components/ui/ModelImage";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import { VULY_PROMO_AFFILIATE_URL } from "@/lib/promoCtas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

function getCurrentMonthYear() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export const metadata: Metadata = {
  title: { absolute: "Vuly Promo Code 2026 — BOUNCE15 | Bounce Arena" },
  description:
    "Use Vuly promo code BOUNCE15 for a discount on Vuly trampolines and play equipment. Compare Vuly Ultra 2, Ultra 2 Pro, Thunder 2 and Thunder 2 Pro before you buy.",
  alternates: { canonical: `${SITE_URL}/vuly-promo-code/` },
  openGraph: {
    title: "Vuly Promo Code 2026 — BOUNCE15",
    description:
      "Use Vuly promo code BOUNCE15 for a discount on Vuly trampolines and play equipment.",
    url: `${SITE_URL}/vuly-promo-code/`,
  },
};

const MODEL_CARDS = [
  {
    title: "Vuly Ultra 2",
    model: "Ultra 2",
    alt: "Vuly Ultra 2 trampoline",
    body:
      "The Ultra 2 is the lower-priced Vuly coil-spring option. It suits families who want a Vuly trampoline without stepping up to the Thunder leaf-spring range.",
    links: [
      { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
      { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
    ],
  },
  {
    title: "Vuly Ultra 2 Pro",
    model: "Ultra 2 Pro",
    alt: "Vuly Ultra 2 Pro trampoline",
    body:
      "The Ultra 2 Pro is the step-up coil-spring model. It keeps the round Vuly layout but adds stronger warranty coverage than the standard Ultra 2.",
    links: [
      { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
      { label: "Vuly Ultra 2 Pro vs Thunder 2", href: "/compare/vuly-ultra-2-pro-vs-thunder-2/" },
    ],
  },
  {
    title: "Vuly Thunder 2",
    model: "Thunder 2",
    alt: "Vuly Thunder 2 trampoline",
    body:
      "The Thunder 2 is Vuly's leaf-spring option. It is the model to look at if you want the Vuly design with the springs moved away from the mat edge.",
    links: [
      { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
      { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
    ],
  },
  {
    title: "Vuly Thunder 2 Pro",
    model: "Thunder 2 Pro",
    alt: "Vuly Thunder 2 Pro trampoline",
    body:
      "The Thunder 2 Pro is the higher-end Vuly option. It is the one to compare if you are choosing between Vuly's safer-feeling leaf-spring design and larger premium trampolines from brands like Springfree or ACON.",
    links: [
      { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
      { label: "Vuly Thunder 2 Pro vs Springfree Jumbo Square", href: "/compare/vuly-thunder-2-pro-vs-springfree-jumbo-square/" },
      { label: "Vuly Thunder 2 Pro vs ACON 16 HD", href: "/compare/vuly-thunder-2-pro-vs-acon-16-hd/" },
    ],
  },
];

const RELATED_LINKS = [
  { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
  { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
  { label: "Vuly Ultra 2 Pro vs Thunder 2", href: "/compare/vuly-ultra-2-pro-vs-thunder-2/" },
  { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
  { label: "Springfree vs Vuly", href: "/compare/springfree-vs-vuly/" },
  { label: "ACON vs Vuly", href: "/compare/acon-vs-vuly/" },
  { label: "Vuly vs Jumpflex", href: "/compare/vuly-vs-jumpflex/" },
];

export default function VulyPromoCodePage() {
  const lastVerified = getCurrentMonthYear();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Vuly Promo Code", item: `${SITE_URL}/vuly-promo-code/` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vuly Promo Code 2026",
    description: metadata.description,
    url: `${SITE_URL}/vuly-promo-code/`,
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPageSchema} />

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Vuly Promo Code</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-black sm:text-4xl">
            Vuly Promo Code 2026
          </h1>
          <p className="mb-4 text-lg leading-8 text-black/70">
            Use code <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-[#2e9a94]">BOUNCE15</code> at Vuly for a discount on your order.
          </p>
          <p className="mb-4 leading-7 text-black/65">
            Add products to your cart, enter the code at checkout, and verify the discount has been applied before you pay.
          </p>
          <p className="mb-6 text-sm font-semibold text-black">Last verified: {lastVerified}</p>
          <AffiliateDisclosure className="mb-8" />

          <section className="mb-10 rounded-2xl border border-[#38b1ab]/20 bg-[#f7fbfa] p-6">
            <h2 className="mb-3 text-xl font-bold text-black">Vuly code</h2>
            <p className="mb-4 text-black/70">
              Code: <code className="rounded bg-white px-2 py-1 font-mono font-bold tracking-wider text-[#2e9a94]">BOUNCE15</code>
            </p>
            <p className="mb-5 text-sm leading-6 text-black/65">
              Use it at checkout before you pay. Add your trampoline or play equipment to cart, enter the code in the promo field, and check that the discount appears in your order summary.
            </p>
            <a
              href={VULY_PROMO_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
            >
              Shop Vuly with BOUNCE15
            </a>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-black">Which Vuly trampoline is best for you?</h2>
            <p className="mb-6 leading-7 text-black/65">
              Vuly&apos;s current US trampoline range focuses on four main models: Ultra 2, Ultra 2 Pro, Thunder 2 and Thunder 2 Pro.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {MODEL_CARDS.map((card) => (
                <section key={card.title} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                  <div className="relative aspect-[4/3] bg-[#f7fbfa]">
                    <ModelImage brand="Vuly" model={card.model} alt={card.alt} sizes="(min-width: 768px) 384px, 100vw" className="p-5" />
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-black">{card.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-black/65">{card.body}</p>
                    <div className="flex flex-wrap gap-2">
                      {card.links.map((link) => (
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
              <li>The size suits the age and weight of the main jumper.</li>
              <li>The discount appears in your cart before checkout.</li>
            </ol>
            <Link href="/quiz/" className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]">
              Take the trampoline quiz
            </Link>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="mb-4 text-xl font-bold text-black">Related Vuly comparisons</h2>
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
