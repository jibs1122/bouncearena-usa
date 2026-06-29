import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ModelImage from "@/components/ui/ModelImage";
import AffiliateDisclosure from "@/components/ui/AffiliateDisclosure";
import { ZUPAPA_PROMO_AFFILIATE_URL } from "@/lib/promoCtas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

function getCurrentMonthYear() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export const metadata: Metadata = {
  title: { absolute: "Zupapa Promo Code 2026 - 10% Off | Bounce Arena" },
  description:
    "Use Zupapa promo code BOUNCE for 10% off any purchase. Compare Zupapa round, rectangular and kids trampolines before you buy.",
  alternates: { canonical: `${SITE_URL}/zupapa-promo-code/` },
  openGraph: {
    title: "Zupapa Promo Code 2026 - 10% Off",
    description:
      "Use Zupapa promo code BOUNCE for 10% off any purchase.",
    url: `${SITE_URL}/zupapa-promo-code/`,
  },
};

const MODEL_CARDS = [
  {
    title: "Zupapa upgraded round trampolines",
    model: "1500LBS Upgraded Trampoline 10-16FT",
    alt: "Zupapa upgraded round trampoline",
    body:
      "The upgraded round range is the main place to start for a value family trampoline. It covers common backyard sizes from 10ft to 16ft.",
    links: [
      { label: "Zupapa vs Jumpflex", href: "/compare/zupapa-vs-jumpflex/" },
      { label: "Zupapa vs Springfree", href: "/compare/zupapa-vs-springfree/" },
    ],
  },
  {
    title: "Zupapa double-frame rounds",
    model: "1800LBS Double Frames Trampoline",
    alt: "Zupapa double-frame round trampoline",
    body:
      "The double-frame round models are worth a look if you want a stronger-feeling round trampoline without moving to a rectangular performance setup.",
    links: [
      { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
      { label: "Zupapa vs Vuly", href: "/compare/zupapa-vs-vuly/" },
    ],
  },
  {
    title: "Zupapa rectangular trampolines",
    model: "Zupapa 1800LBS/2500LBS Rectangular Trampoline",
    alt: "Zupapa rectangular trampoline",
    body:
      "The rectangular Zupapa line gives older kids and bigger yards a longer mat shape, while staying in a more value-focused price tier than premium performance rectangles.",
    links: [
      { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
      { label: "Upper Bounce vs Zupapa", href: "/compare/upper-bounce-vs-zupapa/" },
    ],
  },
  {
    title: "Zupapa kids trampolines",
    model: "220LBS 6FT Rectangle Kids Trampoline",
    alt: "Zupapa kids rectangle trampoline",
    body:
      "The smaller kids rectangle is the compact option if you are shopping for a younger child or a tighter outdoor space.",
    links: [
      { label: "Skywalker vs Zupapa", href: "/compare/skywalker-vs-zupapa/" },
      { label: "Jumpzylla vs Zupapa", href: "/compare/jumpzylla-vs-zupapa/" },
    ],
  },
];

const RELATED_LINKS = [
  { label: "Zupapa vs Jumpflex", href: "/compare/zupapa-vs-jumpflex/" },
  { label: "Zupapa vs Springfree", href: "/compare/zupapa-vs-springfree/" },
  { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
  { label: "Zupapa vs Vuly", href: "/compare/zupapa-vs-vuly/" },
  { label: "Skywalker vs Zupapa", href: "/compare/skywalker-vs-zupapa/" },
  { label: "Zupapa vs JumpKing", href: "/compare/zupapa-vs-jumpking/" },
  { label: "ORCC vs Zupapa", href: "/compare/orcc-vs-zupapa/" },
  { label: "Upper Bounce vs Zupapa", href: "/compare/upper-bounce-vs-zupapa/" },
];

export default function ZupapaPromoCodePage() {
  const lastVerified = getCurrentMonthYear();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Zupapa Promo Code", item: `${SITE_URL}/zupapa-promo-code/` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zupapa Promo Code 2026",
    description: metadata.description,
    url: `${SITE_URL}/zupapa-promo-code/`,
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPageSchema} />

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Zupapa Promo Code</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-black sm:text-4xl">
            Zupapa Promo Code 2026
          </h1>
          <p className="mb-4 text-lg leading-8 text-black/70">
            Use code <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-[#2e9a94]">BOUNCE</code> at Zupapa for 10% off any purchase.
          </p>
          <p className="mb-4 leading-7 text-black/65">
            Click through to Zupapa, add products to your cart, enter the code at checkout, and verify the discount has been applied before you pay.
          </p>
          <p className="mb-6 text-sm font-semibold text-black">Last verified: {lastVerified}</p>
          <AffiliateDisclosure className="mb-8" />

          <section className="mb-10 rounded-2xl border border-[#38b1ab]/20 bg-[#f7fbfa] p-6">
            <h2 className="mb-3 text-xl font-bold text-black">Zupapa code</h2>
            <p className="mb-4 text-black/70">
              Code: <code className="rounded bg-white px-2 py-1 font-mono font-bold tracking-wider text-[#2e9a94]">BOUNCE</code>
            </p>
            <p className="mb-5 text-sm leading-6 text-black/65">
              Use the Zupapa discount link, enter <code className="rounded bg-white px-1 py-0.5 text-[#2e9a94]">BOUNCE</code> in the promo field at checkout, and check that 10% off appears before you pay.
            </p>
            <a
              href={ZUPAPA_PROMO_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
            >
              Shop Zupapa with BOUNCE
            </a>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-black">Which Zupapa trampoline is best for you?</h2>
            <p className="mb-6 leading-7 text-black/65">
              Zupapa focuses on value-priced backyard trampolines, including round family models, larger double-frame rounds, rectangular trampolines and smaller kids options.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {MODEL_CARDS.map((card) => (
                <section key={card.title} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                  <div className="relative aspect-[4/3] bg-[#f7fbfa]">
                    <ModelImage brand="Zupapa" model={card.model} alt={card.alt} sizes="(min-width: 768px) 384px, 100vw" className="p-5" />
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
              <li>The size and shape suit who will use it most often.</li>
              <li>The 10% discount appears in your cart before checkout.</li>
            </ol>
            <Link href="/quiz/" className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]">
              Take the trampoline quiz
            </Link>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
            <h2 className="mb-4 text-xl font-bold text-black">Related Zupapa comparisons</h2>
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
