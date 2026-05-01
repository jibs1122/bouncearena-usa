import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedComparisons } from "@/lib/comparisons";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

export const metadata: Metadata = {
  title: "Trampoline Head-to-Head Comparisons 2026 | Bounce Arena",
  description:
    "Side-by-side trampoline comparisons — Springfree vs ACON, Vuly vs Skywalker, and more. Independent specs and analysis for every major US brand matchup.",
  alternates: { canonical: `${SITE_URL}/compare/` },
  openGraph: {
    title: "Trampoline Head-to-Head Comparisons 2026",
    description:
      "Side-by-side trampoline comparisons — Springfree vs ACON, Vuly vs Skywalker, and more. Independent specs and analysis for every major US brand matchup.",
    url: `${SITE_URL}/compare/`,
  },
};

const COMPARISON_GROUPS = [
  {
    label: "Premium",
    description: "Top-tier brands competing on engineering, safety, and long-term value.",
    slugs: [
      "springfree-vs-acon",
      "springfree-vs-vuly",
      "acon-vs-vuly",
      "springfree-vs-jumpflex",
      "acon-vs-jumpflex",
      "vuly-vs-jumpflex",
      "alleyoop-vs-springfree",
      "alleyoop-vs-acon",
      "jumpsport-vs-springfree",
      "jumpsport-vs-acon",
    ],
  },
  {
    label: "Premium vs Mid-Range",
    description: "Is the upgrade worth it? These comparisons help you decide.",
    slugs: [
      "skywalker-vs-springfree",
      "skywalker-vs-acon",
      "skywalker-vs-vuly",
      "skywalker-vs-jumpsport",
      "zupapa-vs-springfree",
      "zupapa-vs-acon",
    ],
  },
  {
    label: "Mid-Range & Budget",
    description: "The most cross-shopped brands in US retail and on Amazon.",
    slugs: [
      "skywalker-vs-zupapa",
      "skywalker-vs-jumpking",
      "skywalker-vs-sportspower",
      "skywalker-vs-bounce-pro",
      "orcc-vs-zupapa",
      "orcc-vs-jumpzylla",
      "orcc-vs-skywalker",
      "jumpzylla-vs-zupapa",
      "upper-bounce-vs-skywalker",
      "jumpking-vs-bounce-pro",
      "zupapa-vs-jumpking",
    ],
  },
  {
    label: "Kids & Mini",
    description: "Smaller trampolines for younger kids and indoor use.",
    slugs: [
      "bcan-vs-orcc",
      "little-tikes-vs-skywalker",
      "little-tikes-vs-jumpzylla",
      "bcan-vs-little-tikes",
    ],
  },
];

export default function CompareHubPage() {
  const allComparisons = getApprovedComparisons();
  const bySlug = new Map(allComparisons.map((c) => [c.slug, c]));

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
      itemListElement: allComparisons.map((comparison, index) => ({
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

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <nav className="text-sm text-black/40 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Compare</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
          Head-to-Head Comparisons
        </h1>
        <p className="text-black/60 mb-12 max-w-2xl">
          In-depth side-by-side breakdowns of the top US trampoline brands. Independent specs, honest analysis, no fluff.
        </p>

        <div className="space-y-14">
          {COMPARISON_GROUPS.map((group) => {
            const cards = group.slugs
              .map((s) => bySlug.get(s))
              .filter(Boolean) as NonNullable<ReturnType<typeof bySlug.get>>[];

            if (cards.length === 0) return null;

            return (
              <section key={group.label}>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-black">{group.label}</h2>
                  <p className="text-sm text-black/50 mt-1">{group.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((c) => (
                    <Link
                      key={c.slug}
                      href={c.href}
                      className="group flex flex-col gap-3 p-5 rounded-xl bg-white border border-black/[0.08] hover:border-[#38b1ab]/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 font-semibold text-black text-sm">
                        <span>{c.labelA}</span>
                        <span className="text-black/25 text-xs font-normal shrink-0">vs</span>
                        <span>{c.labelB}</span>
                      </div>
                      <p className="text-xs text-black/50 leading-relaxed line-clamp-2">
                        {c.intro}
                      </p>
                      <span className="text-xs font-medium text-[#38b1ab] group-hover:underline mt-auto">
                        Read comparison →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
