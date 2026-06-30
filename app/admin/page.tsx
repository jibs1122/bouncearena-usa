import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatUsd } from '@/lib/price';
import { getAllProducts } from '@/lib/products';
import { getAmazonProductUrl, getPreferredProductUrl, getShopDestinationLabel } from '@/lib/productLinks';
import {
  baseMeritScore,
  budgetRanges,
  getRecommendations,
  getScoreBreakdown,
  parseAnswers,
  tieBreakBrandScore,
  type BudgetId,
  type QuizAnswers,
} from '@/lib/quizScoring';
import { getQuizEntriesForAdmin, type QuizEntryAdmin } from '@/lib/quizTrampolines';

export const metadata: Metadata = {
  title: 'Quiz Admin',
  robots: { index: false, follow: false },
};

const DEFAULT_QUERY: Record<string, string> = {
  backyardSize: 'medium',
  groundTypePreference: 'above-ground',
  shapePreference: 'not-sure',
  standards: 'no',
  safetyNetPreference: 'no-preference',
  springType: 'not-sure',
  budget: 'flexible',
  priorities: 'bounce,durability',
};

const ANSWER_PARAM_KEYS = [
  'backyardSize',
  'groundTypePreference',
  'shapePreference',
  'jumperAges',
  'standards',
  'safetyNetPreference',
  'springType',
  'budget',
  'priorities',
] as const;

const FILTER_PARAM_KEYS = [
  'q',
  'brand',
  'quizSpring',
  'surfaced',
  'eligibility',
  'sort',
  'onlyJoey',
] as const;

const PRESETS = [
  {
    label: 'Neutral',
    params: DEFAULT_QUERY,
  },
  {
    label: 'Springless Family',
    params: {
      backyardSize: 'large',
      groundTypePreference: 'above-ground',
      shapePreference: 'round',
      standards: 'no',
      safetyNetPreference: 'yes',
      springType: 'springless',
      budget: '1500-2500',
      priorities: 'durability,warranty',
    },
  },
  {
    label: 'Traditional Value',
    params: {
      backyardSize: 'medium',
      groundTypePreference: 'in-ground',
      shapePreference: 'rectangle',
      standards: 'no',
      safetyNetPreference: 'no-preference',
      springType: 'traditional',
      budget: '500-1000',
      priorities: 'value,assembly',
    },
  },
];

type SearchParams = Record<string, string | string[] | undefined>;
type FilterState = {
  q: string;
  brand: string;
  quizSpring: 'all' | 'springless' | 'traditional';
  surfaced: 'all' | 'surfaced' | 'hidden';
  eligibility: 'all' | 'eligible' | 'hard-excluded' | 'non-positive';
  sort: 'rank' | 'total' | 'merit' | 'price' | 'bounce' | 'durability';
  onlyJoey: boolean;
};
type ExternalUrlFilterState = {
  q: string;
  brand: string;
  host: string;
};

type RowData = {
  entry: QuizEntryAdmin;
  breakdown: ReturnType<typeof getScoreBreakdown>;
  merit: number;
  tieBreak: number;
  overallRank: number;
  eligible: boolean;
};

type ExternalUrlRow = {
  id: string;
  brand: string;
  model: string;
  size: string;
  shape: string;
  rawUrl: string | null;
  usedUrl: string | null;
  secondaryUrl: string | null;
  destination: string;
  host: string;
  secondaryHost: string;
};

function getSingleSearchParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return typeof value === 'string' ? value : '';
}

function getSearchParamValues(searchParams: SearchParams, key: string): string[] {
  const value = searchParams[key];
  if (typeof value === 'string') return value ? value.split(',').filter(Boolean) : [];
  if (Array.isArray(value)) return value.flatMap((part) => part.split(',')).filter(Boolean);
  return [];
}

function buildAnswers(searchParams: SearchParams): QuizAnswers {
  const params = new URLSearchParams(DEFAULT_QUERY);
  for (const key of ANSWER_PARAM_KEYS) {
    const values = getSearchParamValues(searchParams, key);
    if (values.length > 0) params.set(key, values.join(','));
  }
  const answers = parseAnswers(params);
  if (!answers) {
    const fallback = parseAnswers(new URLSearchParams(DEFAULT_QUERY));
    if (!fallback) throw new Error('Default quiz admin answers are invalid.');
    return fallback;
  }
  return answers;
}

function buildFilterState(searchParams: SearchParams): FilterState {
  const q = getSingleSearchParam(searchParams, 'q').trim();
  const brand = getSingleSearchParam(searchParams, 'brand');
  const quizSpring = getSingleSearchParam(searchParams, 'quizSpring');
  const surfaced = getSingleSearchParam(searchParams, 'surfaced');
  const eligibility = getSingleSearchParam(searchParams, 'eligibility');
  const sort = getSingleSearchParam(searchParams, 'sort');

  return {
    q,
    brand,
    quizSpring: quizSpring === 'springless' || quizSpring === 'traditional' ? quizSpring : 'all',
    surfaced: surfaced === 'surfaced' || surfaced === 'hidden' ? surfaced : 'all',
    eligibility:
      eligibility === 'eligible' || eligibility === 'hard-excluded' || eligibility === 'non-positive'
        ? eligibility
        : 'all',
    sort:
      sort === 'total' ||
      sort === 'merit' ||
      sort === 'price' ||
      sort === 'bounce' ||
      sort === 'durability'
        ? sort
        : 'rank',
    onlyJoey: getSingleSearchParam(searchParams, 'onlyJoey') === '1',
  };
}

function buildExternalUrlFilterState(searchParams: SearchParams): ExternalUrlFilterState {
  return {
    q: getSingleSearchParam(searchParams, 'extQ').trim(),
    brand: getSingleSearchParam(searchParams, 'extBrand'),
    host: getSingleSearchParam(searchParams, 'extHost'),
  };
}

function buildHref(params: Record<string, string>) {
  return `/admin/?${new URLSearchParams(params).toString()}`;
}

function buildAnswerQuery(searchParams: SearchParams) {
  const params: Record<string, string> = { ...DEFAULT_QUERY };
  for (const key of ANSWER_PARAM_KEYS) {
    const values = getSearchParamValues(searchParams, key);
    if (values.length > 0) params[key] = values.join(',');
  }
  return params;
}

function buildFilterQuery(filters: FilterState) {
  const params: Record<string, string> = {};
  if (filters.q) params.q = filters.q;
  if (filters.brand) params.brand = filters.brand;
  if (filters.quizSpring !== 'all') params.quizSpring = filters.quizSpring;
  if (filters.surfaced !== 'all') params.surfaced = filters.surfaced;
  if (filters.eligibility !== 'all') params.eligibility = filters.eligibility;
  if (filters.sort !== 'rank') params.sort = filters.sort;
  if (filters.onlyJoey) params.onlyJoey = '1';
  return params;
}

function buildExternalUrlFilterQuery(filters: ExternalUrlFilterState) {
  const params: Record<string, string> = {};
  if (filters.q) params.extQ = filters.q;
  if (filters.brand) params.extBrand = filters.brand;
  if (filters.host) params.extHost = filters.host;
  return params;
}

function formatFeet(inches: number | null) {
  if (inches === null) return '—';
  return `${Math.round((inches / 12) * 10) / 10}ft`;
}

function formatBudgetSelection(budgets: BudgetId[]) {
  if (budgets.length === 0 || (budgets.length === 1 && budgets[0] === 'flexible')) {
    return 'Flexible';
  }

  const ranges = budgets.map((budget) => budgetRanges[budget]);
  const min = Math.min(...ranges.map(([rangeMin]) => rangeMin));
  const max = Math.max(...ranges.map(([, rangeMax]) => rangeMax));

  return `${formatUsd(min)}–${max >= 999999 ? '$2,500+' : formatUsd(max)}`;
}

function formatStandards(value: boolean | null) {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  return '—';
}

function formatPrice(entry: QuizEntryAdmin) {
  if (entry.priceFrom === null) return '—';
  if (entry.priceTo !== null && entry.priceTo !== entry.priceFrom) {
    return `${formatUsd(entry.priceFrom)}–${formatUsd(entry.priceTo)}`;
  }
  return formatUsd(entry.priceFrom);
}

function getUrlHost(url: string | null): string {
  if (!url) return 'No URL';

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Invalid URL';
  }
}

function buildExternalUrlRows(): ExternalUrlRow[] {
  return getAllProducts().map((product) => {
    const rawUrl = product.sourceUrls[0] ?? null;
    const usedUrl = getPreferredProductUrl(product);
    const secondaryUrl = getAmazonProductUrl(product);

    return {
      id: `${product.sourceRowIndex}-${product.brand}-${product.model}-${product.size}`,
      brand: product.brand,
      model: product.model,
      size: product.size,
      shape: product.shape,
      rawUrl,
      usedUrl,
      secondaryUrl,
      destination: getShopDestinationLabel(usedUrl, product.brand),
      host: getUrlHost(usedUrl),
      secondaryHost: getUrlHost(secondaryUrl),
    };
  });
}

function filterExternalUrlRows(rows: ExternalUrlRow[], filters: ExternalUrlFilterState) {
  const query = filters.q.toLowerCase();

  return rows.filter((row) => {
    if (filters.brand && row.brand !== filters.brand) return false;
    if (filters.host && row.host !== filters.host && row.secondaryHost !== filters.host) return false;
    if (!query) return true;

    const haystack = [
      row.brand,
      row.model,
      row.size,
      row.shape,
      row.destination,
      row.host,
      row.secondaryHost,
      row.rawUrl ?? '',
      row.usedUrl ?? '',
      row.secondaryUrl ?? '',
    ].join(' ').toLowerCase();

    return haystack.includes(query);
  });
}

function formatSizeRange(entry: QuizEntryAdmin) {
  return `${formatFeet(entry.minSizeIn)}-${formatFeet(entry.maxSizeIn)}`;
}

function formatYardFit(entry: QuizEntryAdmin) {
  return [
    entry.fitsYard.small ? 'S' : '·',
    entry.fitsYard.medium ? 'M' : '·',
    entry.fitsYard.large ? 'L' : '·',
    entry.fitsYard.longNarrow ? 'N' : '·',
  ].join('');
}

function scoreToneClass(value: number) {
  if (value >= 25) return 'bg-emerald-50 text-emerald-700';
  if (value >= 10) return 'bg-teal-50 text-teal-700';
  if (value > 0) return 'bg-sky-50 text-sky-700';
  if (value === 0) return 'bg-black/[0.04] text-black/45';
  if (value <= -100) return 'bg-red-100 text-red-800';
  return 'bg-rose-50 text-rose-700';
}

function metricToneClass(value: number) {
  if (value >= 9) return 'bg-emerald-50 text-emerald-700';
  if (value >= 7) return 'bg-teal-50 text-teal-700';
  if (value >= 5) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function pillClass(active: boolean, tone: 'neutral' | 'good' | 'warn' = 'neutral') {
  if (!active) return 'bg-black/[0.04] text-black/45';
  if (tone === 'good') return 'bg-emerald-50 text-emerald-700';
  if (tone === 'warn') return 'bg-amber-50 text-amber-700';
  return 'bg-sky-50 text-sky-700';
}

function badgeClass(kind: 'eligible' | 'hard-excluded' | 'non-positive') {
  if (kind === 'eligible') return 'bg-emerald-50 text-emerald-700';
  if (kind === 'hard-excluded') return 'bg-red-100 text-red-800';
  return 'bg-amber-50 text-amber-800';
}

function scoreCell(value: number, mode: 'metric' | 'breakdown' = 'breakdown') {
  const className = mode === 'metric' ? metricToneClass(value) : scoreToneClass(value);
  return (
    <span
      className={`inline-flex min-w-10 justify-center rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums ${className}`}
    >
      {value}
    </span>
  );
}

function sortRows(rows: RowData[], sort: FilterState['sort']) {
  const next = [...rows];
  next.sort((a, b) => {
    if (sort === 'total') {
      return b.breakdown.total - a.breakdown.total || b.tieBreak - a.tieBreak || a.overallRank - b.overallRank;
    }
    if (sort === 'merit') {
      return b.merit - a.merit || b.tieBreak - a.tieBreak || a.overallRank - b.overallRank;
    }
    if (sort === 'price') {
      return (a.entry.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.entry.priceFrom ?? Number.MAX_SAFE_INTEGER) || a.overallRank - b.overallRank;
    }
    if (sort === 'bounce') {
      return b.entry.metricScores.bounce - a.entry.metricScores.bounce || a.overallRank - b.overallRank;
    }
    if (sort === 'durability') {
      return b.entry.metricScores.durability - a.entry.metricScores.durability || a.overallRank - b.overallRank;
    }
    return a.overallRank - b.overallRank;
  });
  return next;
}

function filterRows(rows: RowData[], filters: FilterState) {
  const query = filters.q.toLowerCase();
  return rows.filter(({ entry, breakdown, eligible }) => {
    if (query) {
      const haystack = [entry.brand, entry.model, entry.rawSpringSystem, entry.groundType, entry.springType, entry.safetyNet]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.brand && entry.brand !== filters.brand) return false;
    if (filters.quizSpring !== 'all' && entry.springType !== filters.quizSpring) return false;
    if (filters.surfaced === 'surfaced' && !entry.surfaced) return false;
    if (filters.surfaced === 'hidden' && entry.surfaced) return false;
    if (filters.eligibility === 'eligible' && !eligible) return false;
    if (filters.eligibility === 'hard-excluded' && !breakdown.hardExcluded) return false;
    if (filters.eligibility === 'non-positive' && (breakdown.hardExcluded || breakdown.total > 0)) return false;
    if (filters.onlyJoey && !entry.joeyRating) return false;
    return true;
  });
}

function hiddenInputs(params: Record<string, string>) {
  return Object.entries(params).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const answers = buildAnswers(resolvedSearchParams);
  const filters = buildFilterState(resolvedSearchParams);
  const externalUrlFilters = buildExternalUrlFilterState(resolvedSearchParams);
  const answerQuery = buildAnswerQuery(resolvedSearchParams);
  const filterQuery = buildFilterQuery(filters);
  const externalUrlFilterQuery = buildExternalUrlFilterQuery(externalUrlFilters);
  const entries = getQuizEntriesForAdmin();
  const externalUrlRowsAll = buildExternalUrlRows();

  const rankedRows = entries
    .map((entry) => {
      const breakdown = getScoreBreakdown(entry, answers);
      return {
        entry,
        breakdown,
        merit: baseMeritScore(entry),
        tieBreak: tieBreakBrandScore(entry),
      };
    })
    .sort((a, b) => {
      if (a.entry.surfaced !== b.entry.surfaced) return a.entry.surfaced ? -1 : 1;
      if (a.breakdown.hardExcluded !== b.breakdown.hardExcluded) return a.breakdown.hardExcluded ? 1 : -1;
      return (
        b.breakdown.total - a.breakdown.total ||
        b.tieBreak - a.tieBreak ||
        (a.entry.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.entry.priceFrom ?? Number.MAX_SAFE_INTEGER) ||
        b.merit - a.merit ||
        a.entry.brand.localeCompare(b.entry.brand) ||
        a.entry.model.localeCompare(b.entry.model)
      );
    })
    .map((row, index) => ({
      ...row,
      overallRank: index + 1,
      eligible: !row.breakdown.hardExcluded && row.breakdown.total > 0,
    }));

  const rows = sortRows(filterRows(rankedRows, filters), filters.sort);
  const brands = Array.from(new Set(entries.map((entry) => entry.brand))).sort((a, b) => a.localeCompare(b));
  const externalUrlRows = filterExternalUrlRows(externalUrlRowsAll, externalUrlFilters);
  const externalUrlBrands = Array.from(new Set(externalUrlRowsAll.map((row) => row.brand))).sort((a, b) => a.localeCompare(b));
  const externalUrlHosts = Array.from(
    new Set(externalUrlRowsAll.flatMap((row) => [row.host, row.secondaryHost])),
  ).filter((host) => host !== 'No URL').sort((a, b) => a.localeCompare(b));
  const surfacedCount = rankedRows.filter((row) => row.entry.surfaced).length;
  const springlessCount = rankedRows.filter((row) => row.entry.springType === 'springless').length;
  const joeyRatedCount = rankedRows.filter((row) => row.entry.joeyRating).length;
  const tieBreakCount = rankedRows.filter((row) => row.tieBreak > 0).length;
  const eligibleCount = rankedRows.filter((row) => row.eligible).length;
  const filteredEligibleCount = rows.filter((row) => row.eligible).length;
  const filteredHardExcludedCount = rows.filter((row) => row.breakdown.hardExcluded).length;
  const livePreviewRows = getRecommendations(
    entries.filter((entry) => entry.surfaced),
    answers,
  ).map((entry, index) => ({
    ...entry,
    previewRank: index + 1,
  }));
  const filterResetHref = buildHref(answerQuery);

  return (
    <div className="mx-auto max-w-[1700px] px-5 py-10 sm:px-8">
      <nav className="mb-6 text-sm text-black/40">
        <Link href="/" className="transition-colors hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">Admin</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-black">Quiz Admin</h1>
          <p className="max-w-4xl text-black/60">
            Dense scoring view for every quiz model. Brand metrics come from the all-brand framework,
            safety net preference is scored from the sheet, Joey bonus is still applied, and Vuly/ACON
            only win as a final tie-break.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products-csv/"
            className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
          >
            Products CSV →
          </Link>
          {PRESETS.map((preset) => (
            <Link
              key={preset.label}
              href={buildHref({ ...preset.params, ...filterQuery, ...externalUrlFilterQuery })}
              className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
            >
              {preset.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.04] p-5">
        <h2 className="text-lg font-bold text-black">Current Scoring Rules</h2>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-black/60 md:grid-cols-2 xl:grid-cols-4">
          <p>
            <strong className="text-black/75">Brand metrics:</strong> Bounce, durability, value,
            assembly, and warranty are 1-10 brand-level scores.
          </p>
          <p>
            <strong className="text-black/75">Merit:</strong> Metric total plus Joey bonus.
            Advanced-safety scoring is no longer used.
          </p>
          <p>
            <strong className="text-black/75">Safety net:</strong> Yes/no/no preference is scored from{' '}
            <code className="rounded bg-white px-1 py-0.5">safety_net</code>; optional matches yes or no.
          </p>
          <p>
            <strong className="text-black/75">Tie-break:</strong> Vuly and ACON get a final tie-break
            only after matching score ties.
          </p>
        </div>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Coverage</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {surfacedCount} / {rankedRows.length}
          </p>
          <p className="mt-1 text-sm text-black/50">Surfaced quiz models</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Eligible Now</p>
          <p className="mt-2 text-2xl font-bold text-black">{eligibleCount}</p>
          <p className="mt-1 text-sm text-black/50">Rows with positive total and no hard exclusion</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Springless</p>
          <p className="mt-2 text-2xl font-bold text-black">{springlessCount}</p>
          <p className="mt-1 text-sm text-black/50">Models treated as springless in quiz logic</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Budget</p>
          <p className="mt-2 text-2xl font-bold text-black">{formatBudgetSelection(answers.budget)}</p>
          <p className="mt-1 text-sm text-black/50">Current answer-set budget window</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Joey Rated</p>
          <p className="mt-2 text-2xl font-bold text-black">{joeyRatedCount}</p>
          <p className="mt-1 text-sm text-black/50">Models getting the Joey bonus</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Tie-Break</p>
          <p className="mt-2 text-2xl font-bold text-black">{tieBreakCount}</p>
          <p className="mt-1 text-sm text-black/50">Vuly/ACON models preferred only on ties</p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-2xl border border-black/[0.08] bg-white p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">Scoring Inputs</h2>
              <p className="text-sm text-black/55">
                Edit the quiz selections here and rescore every model against that scenario.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-black/35">Drives the score preview</p>
          </div>

          <form action="/admin" method="get" className="space-y-5">
          {hiddenInputs({ ...filterQuery, ...externalUrlFilterQuery })}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Backyard</span>
                <select
                  name="backyardSize"
                  defaultValue={answers.backyardSize}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="long-narrow">Long and narrow</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Ground type</span>
                <select
                  name="groundTypePreference"
                  defaultValue={answers.groundTypePreference}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="above-ground">Above-ground</option>
                  <option value="in-ground">In-ground</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Shape</span>
                <select
                  name="shapePreference"
                  defaultValue={answers.shapePreference}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="round">Round</option>
                  <option value="rectangle">Rectangular-style</option>
                  <option value="not-sure">No preference</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Spring type</span>
                <select
                  name="springType"
                  defaultValue={answers.springType}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="traditional">Traditional</option>
                  <option value="springless">Springless</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Safety net</span>
                <select
                  name="safetyNetPreference"
                  defaultValue={answers.safetyNetPreference}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="no-preference">No preference</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">ASTM</span>
                <select
                  name="standards"
                  defaultValue={answers.standards}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
                >
                  <option value="yes">Important</option>
                  <option value="no">Not required</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <fieldset className="rounded-2xl bg-[#f6f8f7] p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-black/40">Who is jumping?</legend>
                <div className="mt-3 grid gap-2">
                  {[
                    ['under-6', 'Under 6'],
                    ['6-12', '6 to 12'],
                    ['13-17', 'Teens'],
                    ['18plus', 'Adults'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-black/70">
                      <input
                        type="checkbox"
                        name="jumperAges"
                        value={value}
                        defaultChecked={answers.jumperAges.includes(value as QuizAnswers['jumperAges'][number])}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-2xl bg-[#f6f8f7] p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-black/40">Budget</legend>
                <p className="mt-2 text-xs text-black/45">Choose up to two ranges. Flexible overrides hard budget filtering.</p>
                <div className="mt-3 grid gap-2">
                  {[
                    ['under-500', 'Under $500'],
                    ['500-1000', '$500-$1,000'],
                    ['1000-1500', '$1,000-$1,500'],
                    ['1500-2500', '$1,500-$2,500'],
                    ['2500-plus', '$2,500+'],
                    ['flexible', 'Flexible'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-black/70">
                      <input
                        type="checkbox"
                        name="budget"
                        value={value}
                        defaultChecked={answers.budget.includes(value as BudgetId)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-2xl bg-[#f6f8f7] p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-black/40">Priorities</legend>
                <p className="mt-2 text-xs text-black/45">Choose up to two. These drive the priority score column.</p>
                <div className="mt-3 grid gap-2">
                  {[
                    ['bounce', 'Bounce quality'],
                    ['durability', 'Durability'],
                    ['value', 'Value'],
                    ['assembly', 'Assembly'],
                    ['warranty', 'Warranty'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-black/70">
                      <input
                        type="checkbox"
                        name="priorities"
                        value={value}
                        defaultChecked={answers.priorities.includes(value as QuizAnswers['priorities'][number])}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
              <p className="text-sm text-black/50">
                Active summary: {formatBudgetSelection(answers.budget)} budget, {answers.priorities.join(', ') || 'no priorities'}, {answers.springType} spring preference, {answers.safetyNetPreference} net preference.
              </p>
              <button
                type="submit"
                className="rounded-xl bg-[#38b1ab] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f9893]"
              >
                Apply scoring inputs
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-black">Live Results Preview</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-black/35">Matches /results brand dedupe</p>
          </div>
          <div className="space-y-3">
            {livePreviewRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[44px_minmax(0,1fr)_64px_64px] items-center gap-3 rounded-xl bg-[#f6f8f7] px-3 py-3">
                <div className="text-center text-xs font-semibold text-black/45">#{row.previewRank}</div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-black">
                    {row.brand} <span className="text-black/55">{row.model}</span>
                  </div>
                  <div className="truncate text-xs text-black/45">
                    {row.springType} · {row.priceFrom !== null ? formatUsd(row.priceFrom) : '—'}
                  </div>
                </div>
                <div className="text-right text-xs text-black/45">score {row.score}</div>
                <div className="text-right text-sm font-semibold text-black">{row.matchReasonsList.length}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-black/45">Rightmost value is match-reason count for the preview card.</p>
        </section>
      </div>

      <section className="mb-8 rounded-2xl border border-black/[0.08] bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-black">Filters</h2>
            <p className="text-sm text-black/55">Refine the table without changing the active answer set.</p>
          </div>
          <Link
            href={filterResetHref}
            className="rounded-lg border border-black/[0.08] px-3 py-2 text-sm text-black/65 transition-colors hover:border-black/20 hover:text-black"
          >
            Reset filters
          </Link>
        </div>

        <form action="/admin" method="get" className="space-y-4">
          {hiddenInputs({ ...answerQuery, ...externalUrlFilterQuery })}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Search</span>
              <input
                type="text"
                name="q"
                defaultValue={filters.q}
                placeholder="Brand, model, spring system"
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-[#38b1ab]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Brand</span>
              <select
                name="brand"
                defaultValue={filters.brand}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Quiz Spring</span>
              <select
                name="quizSpring"
                defaultValue={filters.quizSpring}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
              >
                <option value="all">All spring types</option>
                <option value="traditional">Traditional</option>
                <option value="springless">Springless</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Surfaced</span>
              <select
                name="surfaced"
                defaultValue={filters.surfaced}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
              >
                <option value="all">All rows</option>
                <option value="surfaced">Surfaced only</option>
                <option value="hidden">Excluded only</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Eligibility</span>
              <select
                name="eligibility"
                defaultValue={filters.eligibility}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
              >
                <option value="all">All score states</option>
                <option value="eligible">Eligible only</option>
                <option value="hard-excluded">Hard excluded only</option>
                <option value="non-positive">Non-positive total only</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Sort</span>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
              >
                <option value="rank">Ranking</option>
                <option value="total">Total score</option>
                <option value="merit">Base merit</option>
                <option value="bounce">Bounce metric</option>
                <option value="durability">Durability metric</option>
                <option value="price">Lowest price</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-black/[0.08] px-3 py-2.5 text-sm text-black/70">
              <input type="checkbox" name="onlyJoey" value="1" defaultChecked={filters.onlyJoey} />
              Joey only
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#38b1ab] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f9893]"
            >
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-black/[0.08] bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-black">Score Matrix</h2>
            <p className="text-sm text-black/55">
              Showing {rows.length} rows. Eligible: {filteredEligibleCount}. Hard excluded: {filteredHardExcludedCount}.
              Merit includes Joey bonus; TB marks the Vuly/ACON tie-break.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className={`rounded-full px-2.5 py-1 ${badgeClass('eligible')}`}>eligible</span>
            <span className={`rounded-full px-2.5 py-1 ${badgeClass('non-positive')}`}>non-positive</span>
            <span className={`rounded-full px-2.5 py-1 ${badgeClass('hard-excluded')}`}>hard excluded</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[2280px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="text-left text-black/45">
                <th className="sticky left-0 z-30 bg-white px-2 py-2 font-semibold">#</th>
                <th className="sticky left-[44px] z-30 min-w-[110px] bg-white px-2 py-2 font-semibold">Brand</th>
                <th className="sticky left-[154px] z-30 min-w-[250px] bg-white px-2 py-2 font-semibold">Model</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Surf</th>
                <th className="px-2 py-2 font-semibold">Spring</th>
                <th className="px-2 py-2 font-semibold">Net</th>
                <th className="px-2 py-2 font-semibold">Joey</th>
                <th className="px-2 py-2 font-semibold">TB</th>
                <th className="px-2 py-2 font-semibold">ASTM</th>
                <th className="px-2 py-2 font-semibold">Price</th>
                <th className="px-2 py-2 font-semibold">Size</th>
                <th className="px-2 py-2 font-semibold">Fit</th>
                <th className="px-2 py-2 font-semibold">Bnc</th>
                <th className="px-2 py-2 font-semibold">Dur</th>
                <th className="px-2 py-2 font-semibold">Val</th>
                <th className="px-2 py-2 font-semibold">Asm</th>
                <th className="px-2 py-2 font-semibold">War</th>
                <th className="px-2 py-2 font-semibold">Merit</th>
                <th className="px-2 py-2 font-semibold">Size</th>
                <th className="px-2 py-2 font-semibold">Gnd</th>
                <th className="px-2 py-2 font-semibold">Shp</th>
                <th className="px-2 py-2 font-semibold">Age</th>
                <th className="px-2 py-2 font-semibold">Std</th>
                <th className="px-2 py-2 font-semibold">Net</th>
                <th className="px-2 py-2 font-semibold">Spr</th>
                <th className="px-2 py-2 font-semibold">Bgt</th>
                <th className="px-2 py-2 font-semibold">Pri</th>
                <th className="px-2 py-2 font-semibold">J</th>
                <th className="px-2 py-2 font-semibold">Total</th>
                <th className="px-2 py-2 font-semibold">Raw spring system</th>
                <th className="px-2 py-2 font-semibold">Exclusion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const { entry, breakdown, merit, overallRank, eligible } = row;
                const status = breakdown.hardExcluded ? 'hard-excluded' : eligible ? 'eligible' : 'non-positive';

                return (
                  <tr key={entry.id} className="border-t border-black/[0.05] align-middle">
                    <td className="sticky left-0 z-20 bg-white px-2 py-2 text-black/45 shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                      {overallRank}
                    </td>
                    <td className="sticky left-[44px] z-20 bg-white px-2 py-2 font-medium text-black shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                      {entry.brand}
                    </td>
                    <td className="sticky left-[154px] z-20 bg-white px-2 py-2 text-black/75 shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                      <div className="line-clamp-2 min-w-[250px]">{entry.model}</div>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-md px-2 py-1 font-semibold ${badgeClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-md px-2 py-1 font-semibold ${pillClass(entry.surfaced, 'good')}`}>
                        {entry.surfaced ? 'yes' : 'no'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-black/70">{entry.springType}</td>
                    <td className="px-2 py-2 text-black/70">{entry.safetyNet}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-md px-2 py-1 font-semibold ${pillClass(entry.joeyRating, 'warn')}`}>
                        {entry.joeyRating ? 'yes' : 'no'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-md px-2 py-1 font-semibold ${pillClass(row.tieBreak > 0, 'warn')}`}>
                        {row.tieBreak > 0 ? 'yes' : 'no'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-black/70">{formatStandards(entry.meetsUSStandards)}</td>
                    <td className="px-2 py-2 text-black/70">{formatPrice(entry)}</td>
                    <td className="px-2 py-2 text-black/70">{formatSizeRange(entry)}</td>
                    <td className="px-2 py-2 font-mono text-[11px] text-black/55">{formatYardFit(entry)}</td>
                    <td className="px-2 py-2">{scoreCell(entry.metricScores.bounce, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(entry.metricScores.durability, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(entry.metricScores.value, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(entry.metricScores.assembly, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(entry.metricScores.warranty, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(merit, 'metric')}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.size)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.groundType)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.shape)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.ages)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.standards)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.safety)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.springType)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.budget)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.priorities)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.joey)}</td>
                    <td className="px-2 py-2">{scoreCell(breakdown.total)}</td>
                    <td className="px-2 py-2 text-black/55">{entry.rawSpringSystem || '—'}</td>
                    <td className="px-2 py-2 text-black/45">{entry.exclusionReasons.join(', ') || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-black">External Model URLs</h2>
            <p className="text-sm text-black/55">
              Showing {externalUrlRows.length} of {externalUrlRowsAll.length} model rows. Used URL is the resolved outbound destination after site link rules; secondary URL is an additional outbound option when present.
            </p>
          </div>
          <Link
            href={buildHref({ ...answerQuery, ...filterQuery })}
            className="rounded-lg border border-black/[0.08] px-3 py-2 text-sm text-black/65 transition-colors hover:border-black/20 hover:text-black"
          >
            Reset URL filters
          </Link>
        </div>

        <form action="/admin" method="get" className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px_auto]">
          {hiddenInputs({ ...answerQuery, ...filterQuery })}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Search URLs</span>
            <input
              type="text"
              name="extQ"
              defaultValue={externalUrlFilters.q}
              placeholder="Brand, model, host, URL"
              className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-[#38b1ab]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Brand</span>
            <select
              name="extBrand"
              defaultValue={externalUrlFilters.brand}
              className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
            >
              <option value="">All brands</option>
              {externalUrlBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/40">Host</span>
            <select
              name="extHost"
              defaultValue={externalUrlFilters.host}
              className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
            >
              <option value="">All hosts</option>
              {externalUrlHosts.map((host) => (
                <option key={host} value={host}>
                  {host}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="self-end rounded-xl bg-[#38b1ab] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f9893]"
          >
            Filter URLs
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-[1450px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="text-left text-black/45">
                <th className="sticky left-0 z-30 min-w-[120px] bg-white px-2 py-2 font-semibold">Brand</th>
                <th className="sticky left-[120px] z-30 min-w-[260px] bg-white px-2 py-2 font-semibold">Model</th>
                <th className="px-2 py-2 font-semibold">Size</th>
                <th className="px-2 py-2 font-semibold">Shape</th>
                <th className="px-2 py-2 font-semibold">Destination</th>
                <th className="px-2 py-2 font-semibold">Host</th>
                <th className="px-2 py-2 font-semibold">Used URL</th>
                <th className="px-2 py-2 font-semibold">Secondary URL</th>
                <th className="px-2 py-2 font-semibold">CSV source URL</th>
              </tr>
            </thead>
            <tbody>
              {externalUrlRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="sticky left-0 z-20 bg-white px-2 py-2 font-medium text-black shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                    {row.brand}
                  </td>
                  <td className="sticky left-[120px] z-20 bg-white px-2 py-2 text-black/75 shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                    <div className="line-clamp-2 min-w-[260px]">{row.model}</div>
                  </td>
                  <td className="px-2 py-2 text-black/60">{row.size || '—'}</td>
                  <td className="px-2 py-2 text-black/60">{row.shape || '—'}</td>
                  <td className="px-2 py-2 font-medium text-black/70">{row.destination}</td>
                  <td className="px-2 py-2 text-black/55">{row.host}</td>
                  <td className="max-w-[420px] px-2 py-2">
                    {row.usedUrl ? (
                      <a
                        href={row.usedUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="break-all text-[#238985] underline decoration-[#238985]/35 underline-offset-2"
                      >
                        {row.usedUrl}
                      </a>
                    ) : (
                      <span className="text-black/35">—</span>
                    )}
                  </td>
                  <td className="max-w-[420px] px-2 py-2">
                    {row.secondaryUrl ? (
                      <a
                        href={row.secondaryUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="break-all text-[#238985] underline decoration-[#238985]/35 underline-offset-2"
                      >
                        {row.secondaryUrl}
                      </a>
                    ) : (
                      <span className="text-black/35">—</span>
                    )}
                  </td>
                  <td className="max-w-[420px] px-2 py-2">
                    {row.rawUrl ? (
                      <a
                        href={row.rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-black/55 underline decoration-black/20 underline-offset-2"
                      >
                        {row.rawUrl}
                      </a>
                    ) : (
                      <span className="text-black/35">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
