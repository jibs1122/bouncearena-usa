import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  budgetRanges,
  getScoreBreakdown,
  parseAnswers,
  type BudgetId,
  type QuizAnswers,
} from '@/lib/quizScoring';
import { baseMeritScore } from '@/lib/quizScoring';
import { formatUsd } from '@/lib/price';
import { getQuizEntriesForAdmin } from '@/lib/quizTrampolines';

export const metadata: Metadata = {
  title: 'Quiz Admin | Bounce Arena',
  robots: { index: false, follow: false },
};

const DEFAULT_QUERY: Record<string, string> = {
  backyardSize: 'medium',
  groundTypePreference: 'above-ground',
  shapePreference: 'not-sure',
  standards: 'no',
  safetyFeatures: 'not-important',
  springType: 'not-sure',
  budget: 'flexible',
  priorities: 'bounce,durability',
};

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
      safetyFeatures: 'essential',
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
      safetyFeatures: 'not-important',
      springType: 'traditional',
      budget: '500-1000',
      priorities: 'value,assembly',
    },
  },
];

function formatFeet(inches: number | null) {
  if (inches === null) return '—';
  return `${Math.round((inches / 12) * 10) / 10} ft`;
}

function formatYesNo(value: boolean) {
  return value ? 'Yes' : 'No';
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
  return 'unknown';
}

function buildAnswers(searchParams: Record<string, string | string[] | undefined>): QuizAnswers {
  const params = new URLSearchParams(DEFAULT_QUERY);
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') params.set(key, value);
  }
  const answers = parseAnswers(params);
  if (!answers) {
    const fallback = parseAnswers(new URLSearchParams(DEFAULT_QUERY));
    if (!fallback) throw new Error('Default quiz admin answers are invalid.');
    return fallback;
  }
  return answers;
}

function presetHref(params: Record<string, string>) {
  return `/admin/?${new URLSearchParams(params).toString()}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const answers = buildAnswers(resolvedSearchParams);
  const entries = getQuizEntriesForAdmin();

  const rows = entries
    .map((entry) => {
      const breakdown = getScoreBreakdown(entry, answers);
      return {
        entry,
        breakdown,
        merit: baseMeritScore(entry),
      };
    })
    .sort((a, b) => {
      if (a.entry.surfaced !== b.entry.surfaced) return a.entry.surfaced ? -1 : 1;
      if (a.breakdown.hardExcluded !== b.breakdown.hardExcluded) return a.breakdown.hardExcluded ? 1 : -1;
      return b.breakdown.total - a.breakdown.total || b.merit - a.merit || a.entry.brand.localeCompare(b.entry.brand);
    });

  const surfacedCount = rows.filter((row) => row.entry.surfaced).length;
  const springlessCount = rows.filter((row) => row.entry.springType === 'springless').length;
  const joeyRatedCount = rows.filter((row) => row.entry.joeyRating).length;
  const vulyRows = rows.filter((row) => row.entry.brand === 'Vuly');

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <nav className="mb-6 text-sm text-black/40">
        <Link href="/" className="transition-colors hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black">Admin</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-black">Quiz Admin</h1>
      <p className="mb-8 max-w-3xl text-black/60">
        Local-only visibility into how every model is being treated by the quiz pipeline, including
        excluded models, derived flags, and live score breakdowns for the current answer preset.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        {PRESETS.map((preset) => (
          <Link
            key={preset.label}
            href={presetHref(preset.params)}
            className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Coverage</p>
          <p className="mt-2 text-2xl font-bold text-black">{surfacedCount} / {rows.length}</p>
          <p className="mt-1 text-sm text-black/50">Models currently surfaced by the quiz</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Springless</p>
          <p className="mt-2 text-2xl font-bold text-black">{springlessCount}</p>
          <p className="mt-1 text-sm text-black/50">Models treated as springless in quiz logic</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Current Budget</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatBudgetSelection(answers.budget)}
          </p>
          <p className="mt-1 text-sm text-black/50">Score preview uses this answer set</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Joey Rated</p>
          <p className="mt-2 text-2xl font-bold text-black">{joeyRatedCount}</p>
          <p className="mt-1 text-sm text-black/50">Models receiving the backend Joey bonus</p>
        </div>
      </div>

      <section className="mb-10 rounded-2xl border border-black/[0.08] bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-black">Current Answer Set</h2>
        <div className="grid gap-3 text-sm text-black/70 sm:grid-cols-2 lg:grid-cols-3">
          <p><strong className="text-black">Backyard:</strong> {answers.backyardSize}</p>
          <p><strong className="text-black">Ground type:</strong> {answers.groundTypePreference}</p>
          <p><strong className="text-black">Shape:</strong> {answers.shapePreference}</p>
          <p><strong className="text-black">Budget:</strong> {formatBudgetSelection(answers.budget)}</p>
          <p><strong className="text-black">Spring type:</strong> {answers.springType}</p>
          <p><strong className="text-black">Standards:</strong> {answers.standards}</p>
          <p><strong className="text-black">Safety:</strong> {answers.safetyFeatures}</p>
          <p><strong className="text-black">Priorities:</strong> {answers.priorities.join(', ') || 'none'}</p>
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-black/[0.08] bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-black">Vuly Snapshot</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.08] text-left text-black/45">
                <th className="px-3 py-2 font-semibold">Model</th>
                <th className="px-3 py-2 font-semibold">Ground type</th>
                <th className="px-3 py-2 font-semibold">Raw spring system</th>
                <th className="px-3 py-2 font-semibold">Quiz spring type</th>
                <th className="px-3 py-2 font-semibold">Advanced safety</th>
                <th className="px-3 py-2 font-semibold">Joey rating</th>
                <th className="px-3 py-2 font-semibold">Price from</th>
                <th className="px-3 py-2 font-semibold">Total score</th>
              </tr>
            </thead>
            <tbody>
              {vulyRows.map(({ entry, breakdown }) => (
                <tr key={entry.id} className="border-b border-black/[0.05]">
                  <td className="px-3 py-2 font-medium text-black">{entry.model}</td>
                  <td className="px-3 py-2 text-black/70">{entry.groundType}</td>
                  <td className="px-3 py-2 text-black/70">{entry.rawSpringSystem || '—'}</td>
                  <td className="px-3 py-2 text-black/70">{entry.springType}</td>
                  <td className="px-3 py-2 text-black/70">{entry.advancedSafety ? 'yes' : 'no'}</td>
                  <td className="px-3 py-2 text-black/70">{entry.joeyRating ? 'yes' : 'no'}</td>
                  <td className="px-3 py-2 text-black/70">{entry.priceFrom !== null ? formatUsd(entry.priceFrom) : '—'}</td>
                  <td className="px-3 py-2 text-black/70">{breakdown.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.08] bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-black">All Quiz Models</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[1900px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.08] text-left text-black/45">
                <th className="sticky left-0 z-30 min-w-[150px] bg-white px-3 py-2 font-semibold">Brand</th>
                <th className="sticky left-[150px] z-30 min-w-[240px] bg-white px-3 py-2 font-semibold">Model</th>
                <th className="px-3 py-2 font-semibold">Surfaced</th>
                <th className="px-3 py-2 font-semibold">Exclusion</th>
                <th className="px-3 py-2 font-semibold">Raw spring</th>
                <th className="px-3 py-2 font-semibold">Ground type</th>
                <th className="px-3 py-2 font-semibold">Quiz spring</th>
                <th className="px-3 py-2 font-semibold">Adv safety</th>
                <th className="px-3 py-2 font-semibold">Joey</th>
                <th className="px-3 py-2 font-semibold">ASTM</th>
                <th className="px-3 py-2 font-semibold">Price</th>
                <th className="px-3 py-2 font-semibold">Sizes</th>
                <th className="px-3 py-2 font-semibold">Fits yard</th>
                <th className="px-3 py-2 font-semibold">Scores</th>
                <th className="px-3 py-2 font-semibold">Breakdown</th>
                <th className="px-3 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ entry, breakdown, merit }) => (
                <tr key={entry.id} className="border-b border-black/[0.05] align-top">
                  <td className="sticky left-0 z-20 min-w-[150px] bg-white px-3 py-3 font-medium text-black shadow-[1px_0_0_rgba(0,0,0,0.06)]">{entry.brand}</td>
                  <td className="sticky left-[150px] z-20 min-w-[240px] bg-white px-3 py-3 text-black/75 shadow-[1px_0_0_rgba(0,0,0,0.06)]">{entry.model}</td>
                  <td className="px-3 py-3 text-black/75">{entry.surfaced ? 'yes' : 'no'}</td>
                  <td className="px-3 py-3 text-black/55">{entry.exclusionReasons.join(', ') || '—'}</td>
                  <td className="px-3 py-3 text-black/75">{entry.rawSpringSystem || '—'}</td>
                  <td className="px-3 py-3 text-black/75">{entry.groundType}</td>
                  <td className="px-3 py-3 text-black/75">{entry.springType}</td>
                  <td className="px-3 py-3 text-black/75">{entry.advancedSafety ? 'yes' : 'no'}</td>
                  <td className="px-3 py-3 text-black/75">{entry.joeyRating ? 'yes' : 'no'}</td>
                  <td className="px-3 py-3 text-black/75">{formatStandards(entry.meetsUSStandards)}</td>
                  <td className="px-3 py-3 text-black/75">
                    {entry.priceFrom !== null ? formatUsd(entry.priceFrom) : '—'}
                    {entry.priceTo !== null && entry.priceTo !== entry.priceFrom ? `–${formatUsd(entry.priceTo)}` : ''}
                  </td>
                  <td className="px-3 py-3 text-black/75">
                    {formatFeet(entry.minSizeIn)} to {formatFeet(entry.maxSizeIn)}
                  </td>
                  <td className="px-3 py-3 text-black/75">
                    <div className="space-y-1 text-xs leading-5">
                      <div>Small: {formatYesNo(entry.fitsYard.small)}</div>
                      <div>Medium: {formatYesNo(entry.fitsYard.medium)}</div>
                      <div>Large: {formatYesNo(entry.fitsYard.large)}</div>
                      <div>Long/narrow: {formatYesNo(entry.fitsYard.longNarrow)}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-black/75">
                    <div className="space-y-1 text-xs leading-5">
                      <div>Bounce: {entry.metricScores.bounce}</div>
                      <div>Durability: {entry.metricScores.durability}</div>
                      <div>Value: {entry.metricScores.value}</div>
                      <div>Assembly: {entry.metricScores.assembly}</div>
                      <div>Warranty: {entry.metricScores.warranty}</div>
                    </div>
                    <div className="mt-2 text-xs text-black/45">Base merit: {merit}</div>
                  </td>
                  <td className="px-3 py-3 text-black/75">
                    <div className="space-y-1 text-xs leading-5">
                      <div>Size: {breakdown.size}</div>
                      <div>Ground type: {breakdown.groundType}</div>
                      <div>Shape: {breakdown.shape}</div>
                      <div>Standards: {breakdown.standards}</div>
                      <div>Safety: {breakdown.safety}</div>
                      <div>Spring type: {breakdown.springType}</div>
                      <div>Budget: {breakdown.budget}</div>
                      <div>Priorities: {breakdown.priorities}</div>
                      <div>Joey: {breakdown.joey}</div>
                    </div>
                    <div className="mt-2 text-xs text-black/45">
                      {breakdown.hardExcluded ? 'Hard excluded from ranking' : 'Eligible for ranking'}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-black">{breakdown.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
