'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import BrandLogoAvatar from '@/components/ui/BrandLogoAvatar';

export type HubBrandRef = {
  name: string;
  slug: string;
};

export type HubBrand = HubBrandRef & {
  brandComparisonCount: number;
  modelComparisonCount: number;
  totalCount: number;
};

export type HubBrandComparison = {
  slug: string;
  href: string;
  title: string;
  labelA: string;
  labelB: string;
  intro: string;
  brands: [HubBrandRef, HubBrandRef];
};

export type HubModelComparison = {
  slug: string;
  href: string;
  title: string;
  description: string;
  labels: string[];
  brands: HubBrandRef[];
};

type ComparisonHubClientProps = {
  brands: HubBrand[];
  brandComparisons: HubBrandComparison[];
  modelComparisons: HubModelComparison[];
};

const DEFAULT_BRAND_COMPARISON_LIMIT = 12;
const DEFAULT_MODEL_COMPARISON_LIMIT = 12;
const DEFAULT_PINNED_BRAND_SLUGS = new Set(['skybound']);

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchesSearch(text: string, query: string): boolean {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeText(text);
  return terms.every((term) => haystack.includes(term));
}

function matchesSelectedBrands(brands: HubBrandRef[], selectedBrandSlugs: string[]): boolean {
  if (selectedBrandSlugs.length === 0) return true;

  const comparisonSlugs = Array.from(new Set(brands.map((brand) => brand.slug)));
  if (selectedBrandSlugs.length === 1) return comparisonSlugs.includes(selectedBrandSlugs[0]);

  const selectedSet = new Set(selectedBrandSlugs);
  const matchingSelectedCount = comparisonSlugs.filter((slug) => selectedSet.has(slug)).length;
  const hasOnlySelectedBrands = comparisonSlugs.every((slug) => selectedSet.has(slug));

  return hasOnlySelectedBrands && matchingSelectedCount >= 2;
}

function brandNames(brands: HubBrandRef[]): string {
  return brands.map((brand) => brand.name).join(' ');
}

function includesPinnedBrand(comparison: HubBrandComparison): boolean {
  return comparison.brands.some((brand) => DEFAULT_PINNED_BRAND_SLUGS.has(brand.slug));
}

function prioritizeDefaultBrandComparisons(
  comparisons: HubBrandComparison[],
): HubBrandComparison[] {
  return [...comparisons].sort((a, b) => {
    const aPinned = includesPinnedBrand(a);
    const bPinned = includesPinnedBrand(b);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return 0;
  });
}

function formatBrandList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function BrandTile({
  brand,
  active,
  onClick,
}: {
  brand: HubBrand;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex min-h-[8.5rem] flex-col justify-between rounded-xl border p-4 text-left transition-all ${
        active
          ? 'border-[#38b1ab] bg-[#38b1ab]/[0.08] shadow-sm'
          : 'border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-[#38b1ab]/35 hover:shadow-sm'
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-[#f7fbfa] p-2">
          <BrandLogoAvatar name={brand.name} size={52} fillContainer />
        </span>
        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${active ? 'bg-[#38b1ab] text-white' : 'bg-black/[0.04] text-black/45'}`}>
          {active ? 'Selected' : brand.totalCount}
        </span>
      </span>
      <span>
        <span className="block text-sm font-semibold leading-snug text-black">{brand.name}</span>
        <span className="mt-1 block text-xs leading-5 text-black/45">
          {brand.brandComparisonCount} brand comparison
          {brand.brandComparisonCount === 1 ? '' : 's'}
          {brand.modelComparisonCount > 0 ? `, ${brand.modelComparisonCount} model comparison${brand.modelComparisonCount === 1 ? '' : 's'}` : ''}
        </span>
      </span>
    </button>
  );
}

function BrandComparisonCard({ comparison }: { comparison: HubBrandComparison }) {
  return (
    <Link
      href={comparison.href}
      className="group flex min-h-[16rem] flex-col rounded-xl border border-black/[0.08] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#38b1ab]/35 hover:shadow-sm"
    >
      <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {comparison.brands.map((brand) => (
          <div
            key={brand.slug}
            className="flex aspect-square items-center justify-center rounded-xl border border-black/[0.06] bg-[#f7fbfa] p-3"
          >
            <BrandLogoAvatar name={brand.name} size={80} fillContainer />
          </div>
        )).reduce<React.ReactNode[]>((nodes, node, index) => {
          if (index > 0) {
            nodes.push(
              <div
                key="vs"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[11px] font-bold uppercase text-black/35 shadow-sm"
              >
                vs
              </div>,
            );
          }
          nodes.push(node);
          return nodes;
        }, [])}
      </div>

      <div>
        <h3 className="text-base font-semibold leading-snug text-black">{comparison.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/55">{comparison.intro}</p>
      </div>

      <span className="mt-auto pt-5 text-sm font-semibold text-[#38b1ab] transition-colors group-hover:text-[#2e9a94]">
        Read comparison -&gt;
      </span>
    </Link>
  );
}

function ModelComparisonCard({ comparison }: { comparison: HubModelComparison }) {
  return (
    <Link
      href={comparison.href}
      className="group flex min-h-[11.5rem] flex-col rounded-xl border border-black/[0.08] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#38b1ab]/35 hover:shadow-sm"
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {comparison.brands.slice(0, 3).map((brand) => (
          <span
            key={brand.slug}
            className="rounded-full border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#2e9a94]"
          >
            {brand.name}
          </span>
        ))}
      </div>
      <h3 className="text-base font-semibold leading-snug text-black">{comparison.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/55">{comparison.description}</p>
      <span className="mt-auto pt-4 text-sm font-semibold text-[#38b1ab] transition-colors group-hover:text-[#2e9a94]">
        Read model comparison -&gt;
      </span>
    </Link>
  );
}

export default function ComparisonHubClient({
  brands,
  brandComparisons,
  modelComparisons,
}: ComparisonHubClientProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [showAllBrandComparisons, setShowAllBrandComparisons] = useState(false);
  const [showAllModelComparisons, setShowAllModelComparisons] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeBrands = selectedBrands
    .map((slug) => brands.find((brand) => brand.slug === slug))
    .filter((brand): brand is HubBrand => Boolean(brand));
  const selectedBrandLabel = formatBrandList(activeBrands.map((brand) => brand.name));
  const hasActiveFilter = Boolean(selectedBrands.length > 0 || query.trim());

  const filteredBrandComparisons = useMemo(
    () =>
      brandComparisons.filter((comparison) => {
        if (!matchesSelectedBrands(comparison.brands, selectedBrands)) return false;
        return matchesSearch(
          `${comparison.title} ${comparison.labelA} ${comparison.labelB} ${comparison.intro} ${brandNames(comparison.brands)}`,
          query,
        );
      }),
    [brandComparisons, query, selectedBrands],
  );

  const filteredModelComparisons = useMemo(
    () =>
      modelComparisons.filter((comparison) => {
        if (!matchesSelectedBrands(comparison.brands, selectedBrands)) return false;
        return matchesSearch(
          `${comparison.title} ${comparison.description} ${comparison.labels.join(' ')} ${brandNames(comparison.brands)}`,
          query,
        );
      }),
    [modelComparisons, query, selectedBrands],
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    return [
      ...filteredBrandComparisons.map((comparison) => ({
        href: comparison.href,
        title: comparison.title,
        type: 'Brand comparison',
        description: `${comparison.labelA} vs ${comparison.labelB}`,
      })),
      ...filteredModelComparisons.map((comparison) => ({
        href: comparison.href,
        title: comparison.title,
        type: 'Model comparison',
        description: comparison.description,
      })),
    ].slice(0, 6);
  }, [filteredBrandComparisons, filteredModelComparisons, query]);

  const totalFilteredComparisons = filteredBrandComparisons.length + filteredModelComparisons.length;

  const visibleBrandComparisons =
    hasActiveFilter || showAllBrandComparisons
      ? filteredBrandComparisons
      : prioritizeDefaultBrandComparisons(filteredBrandComparisons).slice(0, DEFAULT_BRAND_COMPARISON_LIMIT);
  const visibleModelComparisons =
    hasActiveFilter || showAllModelComparisons
      ? filteredModelComparisons
      : filteredModelComparisons.slice(0, DEFAULT_MODEL_COMPARISON_LIMIT);

  const resetFilters = () => {
    setSelectedBrands([]);
    setQuery('');
    setShowAllBrandComparisons(false);
    setShowAllModelComparisons(false);
  };

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((current) =>
      current.includes(brandSlug)
        ? current.filter((slug) => slug !== brandSlug)
        : [...current, brandSlug],
    );
    setShowAllBrandComparisons(false);
    setShowAllModelComparisons(false);
  };

  const clearBrandFilters = () => {
    setSelectedBrands([]);
    setShowAllBrandComparisons(false);
    setShowAllModelComparisons(false);
  };

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      searchInputRef.current?.focus();
      return;
    }
    document.getElementById('comparison-search-results')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  };

  const brandFilterText =
    activeBrands.length === 1
      ? ` for ${selectedBrandLabel}`
      : activeBrands.length > 1
        ? ` between ${selectedBrandLabel}`
        : '';

  const brandComparisonHeading =
    activeBrands.length === 1
      ? `${selectedBrandLabel} brand comparisons`
      : activeBrands.length > 1
        ? 'Selected brand matchups'
        : 'Popular brand comparisons';

  const modelComparisonHeading =
    activeBrands.length === 1
      ? `${selectedBrandLabel} model comparisons`
      : activeBrands.length > 1
        ? 'Selected model matchups'
        : 'Model comparisons';

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <nav className="mb-6 text-sm text-black/40">
        <Link href="/" className="transition-colors hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black">Compare</span>
      </nav>

      <section className="mb-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#38b1ab]">
            Trampoline comparison hub
          </p>
          <h1 className="text-3xl font-bold leading-tight text-black sm:text-5xl">
            Compare trampoline brands and models
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
            Find the side-by-side comparison you need, then narrow by brand or exact model.
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
          <form role="search" aria-label="Search comparison pages" onSubmit={onSearchSubmit}>
            <label className="mb-2 block text-sm font-semibold text-black" htmlFor="comparison-search">
              Search comparisons
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  ref={searchInputRef}
                  id="comparison-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Type a brand or model, e.g. ACON, Berg, 16 HD, HERO"
                  className="h-14 w-full rounded-xl border border-black/[0.08] bg-black/[0.025] px-4 pl-11 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:border-[#38b1ab]/45 focus:bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-xl bg-[#38b1ab] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94] sm:flex-none"
                >
                  Search
                </button>
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="inline-flex h-14 flex-1 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-5 text-sm font-semibold text-black/55 transition-colors hover:border-[#38b1ab]/35 hover:text-black sm:flex-none"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          {query.trim() ? (
            <div id="comparison-search-results" className="mt-4 rounded-xl border border-[#38b1ab]/25 bg-[#38b1ab]/[0.06] p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-sm font-semibold text-black">
                  {totalFilteredComparisons} result{totalFilteredComparisons === 1 ? '' : 's'} for &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e9a94]">
                  {filteredBrandComparisons.length} brand / {filteredModelComparisons.length} model
                </p>
              </div>

              {searchResults.length > 0 ? (
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.href}
                      href={result.href}
                      className="rounded-lg border border-black/[0.06] bg-white px-4 py-3 transition-colors hover:border-[#38b1ab]/35"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#38b1ab]">
                        {result.type}
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-snug text-black">
                        {result.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-black/45">
                        {result.description}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-black/[0.06] bg-white px-4 py-3 text-sm text-black/50">
                  No matching comparison pages found.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-black">Choose a brand</h2>
            <p className="mt-1 text-sm leading-6 text-black/50">
              One brand shows related pages. Multiple brands show matchups inside the selected set.
            </p>
          </div>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={resetFilters}
              className="w-fit rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-semibold text-black/55 transition-colors hover:border-[#38b1ab]/35 hover:text-black"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            type="button"
            onClick={clearBrandFilters}
            className={`flex min-h-[8.5rem] flex-col justify-between rounded-xl border p-4 text-left transition-all ${
              selectedBrands.length === 0
                ? 'border-[#38b1ab] bg-[#38b1ab]/[0.08] shadow-sm'
                : 'border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-[#38b1ab]/35 hover:shadow-sm'
            }`}
            aria-pressed={selectedBrands.length === 0}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/[0.06] bg-[#f7fbfa] text-lg font-bold text-[#38b1ab]">
              All
            </span>
            <span>
              <span className="block text-sm font-semibold leading-snug text-black">All comparisons</span>
              <span className="mt-1 block text-xs leading-5 text-black/45">
                {brandComparisons.length} brand comparisons, {modelComparisons.length} model comparisons
              </span>
            </span>
          </button>

          {brands.map((brand) => (
            <BrandTile
              key={brand.slug}
              brand={brand}
              active={selectedBrands.includes(brand.slug)}
              onClick={() => toggleBrand(brand.slug)}
            />
          ))}
        </div>

        {activeBrands.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
              Selected
            </span>
            {activeBrands.map((brand) => (
              <button
                key={brand.slug}
                type="button"
                onClick={() => toggleBrand(brand.slug)}
                className="inline-flex items-center gap-2 rounded-full border border-[#38b1ab]/25 bg-[#38b1ab]/[0.08] px-3 py-1.5 text-sm font-semibold text-[#2e9a94] transition-colors hover:border-[#38b1ab]/45 hover:bg-[#38b1ab]/[0.12]"
                aria-label={`Remove ${brand.name} filter`}
              >
                <span>{brand.name}</span>
                <span aria-hidden="true">x</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mb-5 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 text-sm text-black/55">
        Showing{' '}
        <span className="font-semibold text-black">{filteredBrandComparisons.length}</span>
        {' '}brand comparison{filteredBrandComparisons.length === 1 ? '' : 's'} and{' '}
        <span className="font-semibold text-black">{filteredModelComparisons.length}</span>
        {' '}model comparison{filteredModelComparisons.length === 1 ? '' : 's'}
        {brandFilterText}
        {query.trim() ? ` matching "${query.trim()}"` : ''}.
      </div>

      <section className="mb-12">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {brandComparisonHeading}
            </h2>
            <p className="mt-1 text-sm leading-6 text-black/50">
              Side-by-side brand matchups for the trampolines shoppers cross-shop most.
            </p>
          </div>
          {!hasActiveFilter && filteredBrandComparisons.length > DEFAULT_BRAND_COMPARISON_LIMIT ? (
            <button
              type="button"
              onClick={() => setShowAllBrandComparisons((showAll) => !showAll)}
              className="w-fit rounded-xl border border-[#38b1ab]/25 bg-[#38b1ab]/[0.06] px-4 py-2 text-sm font-semibold text-[#2e9a94] transition-colors hover:border-[#38b1ab]/45 hover:bg-[#38b1ab]/[0.1]"
            >
              {showAllBrandComparisons ? 'Show fewer' : `Show all ${filteredBrandComparisons.length}`}
            </button>
          ) : null}
        </div>

        {visibleBrandComparisons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBrandComparisons.map((comparison) => (
              <BrandComparisonCard key={comparison.slug} comparison={comparison} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-white px-5 py-10 text-center text-sm text-black/45">
            No brand comparisons match those filters.
          </div>
        )}
      </section>

      <section className="mb-12 rounded-2xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-black">Not sure where to start?</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-black/60">
              Answer a few questions about yard size, budget, and who will use it. We will point you toward a shortlist.
            </p>
          </div>
          <Link
            href="/quiz/"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
          >
            Take the quiz
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {modelComparisonHeading}
            </h2>
            <p className="mt-1 text-sm leading-6 text-black/50">
              Exact model and size matchups for shoppers choosing between specific trampolines.
            </p>
          </div>
          {!hasActiveFilter && filteredModelComparisons.length > DEFAULT_MODEL_COMPARISON_LIMIT ? (
            <button
              type="button"
              onClick={() => setShowAllModelComparisons((showAll) => !showAll)}
              className="w-fit rounded-xl border border-[#38b1ab]/25 bg-[#38b1ab]/[0.06] px-4 py-2 text-sm font-semibold text-[#2e9a94] transition-colors hover:border-[#38b1ab]/45 hover:bg-[#38b1ab]/[0.1]"
            >
              {showAllModelComparisons ? 'Show fewer' : `Show all ${filteredModelComparisons.length}`}
            </button>
          ) : null}
        </div>

        {visibleModelComparisons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleModelComparisons.map((comparison) => (
              <ModelComparisonCard key={comparison.slug} comparison={comparison} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-white px-5 py-10 text-center text-sm text-black/45">
            No model comparisons match those filters.
          </div>
        )}
      </section>

      <details className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
        <summary className="cursor-pointer text-lg font-bold text-black">
          All comparison links
        </summary>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black/40">Brand comparisons</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {brandComparisons.map((comparison) => (
                <Link
                  key={comparison.slug}
                  href={comparison.href}
                  className="text-sm leading-6 text-black/60 underline decoration-black/10 underline-offset-4 transition-colors hover:text-[#2e9a94]"
                >
                  {comparison.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black/40">Model comparisons</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {modelComparisons.map((comparison) => (
                <Link
                  key={comparison.slug}
                  href={comparison.href}
                  className="text-sm leading-6 text-black/60 underline decoration-black/10 underline-offset-4 transition-colors hover:text-[#2e9a94]"
                >
                  {comparison.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
