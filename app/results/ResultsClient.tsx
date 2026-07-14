'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BrandLogoAvatar from '@/components/ui/BrandLogoAvatar';
import ModelImage from '@/components/ui/ModelImage';
import {
  getBudgetBounds,
  getRecommendations,
  parseAnswers,
  type BudgetId,
  type QuizAnswers,
  type ScoredEntry,
} from '@/lib/quizScoring';
import type { QuizEntry } from '@/lib/quizTrampolines';
import { formatUsd } from '@/lib/price';
import { hasModelImage } from '@/lib/modelImages';
import { isAffiliateBrand } from '@/lib/vuly';
import { formatBrandModelName, modelNameWithoutBrandPrefix } from '@/lib/displayText';
import { getShopDestinationLabel, isAmazonUrl } from '@/lib/productLinks';

type RecapItem = {
  label: string;
  value: string;
};

const backyardSizeLabels: Record<QuizAnswers['backyardSize'], string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  'long-narrow': 'Long and narrow',
  'not-sure': 'Not sure',
};

const groundTypeLabels: Record<QuizAnswers['groundTypePreference'], string> = {
  'above-ground': 'Above-ground',
  'in-ground': 'In-ground',
};

const shapeLabels: Record<QuizAnswers['shapePreference'], string> = {
  round: 'Round / circle',
  rectangle: 'Rectangle',
  'not-sure': 'No preference',
};

const jumperAgeLabels: Record<QuizAnswers['jumperAges'][number], string> = {
  'under-6': 'Under 6',
  '6-12': '6 to 12',
  '13-17': 'Teens',
  '18plus': 'Adults',
};

const budgetLabels: Record<BudgetId, string> = {
  'under-500': 'Under $500',
  '500-1000': '$500-$1,000',
  '1000-1500': '$1,000-$1,500',
  '1500-2500': '$1,500-$2,500',
  '2500-plus': '$2,500+',
  flexible: 'Flexible / not sure',
};

const springTypeLabels: Record<QuizAnswers['springType'], string> = {
  traditional: 'Traditional springs',
  springless: 'Springless',
  'not-sure': 'Not sure',
};

const safetyNetPreferenceLabels: Record<QuizAnswers['safetyNetPreference'], string> = {
  yes: 'Yes',
  no: 'No',
  'no-preference': 'No preference',
};

const standardsLabels: Record<QuizAnswers['standards'], string> = {
  yes: 'Yes',
  no: 'No',
};

const priorityLabels: Record<QuizAnswers['priorities'][number], string> = {
  bounce: 'Best bounce quality',
  durability: 'Durability / longevity',
  value: 'Value for money',
  assembly: 'Easy assembly',
  warranty: 'Warranty & support',
};

function formatList(values: string[], fallback = 'Not specified'): string {
  return values.length > 0 ? values.join(', ') : fallback;
}

function buildAnswerRecap(answers: QuizAnswers): RecapItem[] {
  return [
    { label: 'Backyard size', value: backyardSizeLabels[answers.backyardSize] },
    {
      label: 'Jumpers',
      value: formatList(answers.jumperAges.map((age) => jumperAgeLabels[age])),
    },
    { label: 'Installation', value: groundTypeLabels[answers.groundTypePreference] },
    { label: 'Shape', value: shapeLabels[answers.shapePreference] },
    {
      label: 'Budget',
      value: formatList(answers.budget.map((budget) => budgetLabels[budget])),
    },
    { label: 'Spring system', value: springTypeLabels[answers.springType] },
    { label: 'Safety net', value: safetyNetPreferenceLabels[answers.safetyNetPreference] },
    { label: 'ASTM certification', value: standardsLabels[answers.standards] },
    {
      label: 'Priorities',
      value: formatList(answers.priorities.map((priority) => priorityLabels[priority]), 'No strong preference'),
    },
  ];
}

function AnswerRecap({ answers }: { answers: QuizAnswers }) {
  const recapItems = buildAnswerRecap(answers);

  return (
    <div className="mt-5 rounded-2xl border border-black/[0.08] bg-black/[0.015] p-4">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {recapItems.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-black/60">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38b1ab]" />
            <span>
              <span className="font-semibold text-black/70">{item.label}:</span>{' '}
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function budgetNote(priceFrom: number | null, budgets: BudgetId[]): string | null {
  if (priceFrom === null) return null;
  // "$2,500+" is open-ended from the user's point of view, so any price at or
  // above $2,500 matches their stated budget even past the internal ranking cap.
  if (budgets.includes('2500-plus') && priceFrom >= 2500) return null;
  const bounds = getBudgetBounds(budgets);
  if (!bounds) return null;
  const [, max] = bounds;
  if (priceFrom > max) return `Starting price is above your stated budget — worth checking current pricing`;
  return null;
}

function ResultCard({
  rec,
  rank,
  answers,
}: {
  rec: ScoredEntry;
  rank: number;
  answers: QuizAnswers;
}) {
  const isTop = rank === 1;
  const reasons = rec.matchReasonsList;
  const href = rec.sourceUrl;
  const note = budgetNote(rec.priceFrom, answers.budget);
  const showModelImage = hasModelImage(rec.brand, rec.model);

  return (
    <article
      className={`rounded-3xl border bg-white overflow-hidden ${
        isTop
          ? 'border-2 border-[#38b1ab]'
          : 'border border-black/[0.08]'
      }`}
      style={{
        boxShadow: isTop
          ? '0 6px 32px rgba(56,177,171,0.13)'
          : '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Media */}
        <div
          className={`flex w-full flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#38b1ab]/10 to-[#38b1ab]/20 p-3 sm:p-4 ${
            isTop ? 'sm:w-52' : 'sm:w-44'
          }`}
        >
          {showModelImage ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-3 sm:aspect-auto sm:h-full">
              <div className="relative h-full w-full">
                <ModelImage
                  brand={rec.brand}
                  model={rec.model}
                  alt={formatBrandModelName(rec.brand, rec.model)}
                  sizes={isTop ? '(min-width: 640px) 208px, 100vw' : '(min-width: 640px) 176px, 100vw'}
                  priority={isTop}
                />
              </div>
            </div>
          ) : (
            <div className="flex aspect-square w-full max-w-[148px] items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-4">
              <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-white p-3">
                <BrandLogoAvatar
                  name={rec.brand}
                  size={isTop ? 120 : 96}
                  fillContainer
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isTop ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}>
          {isTop && (
            <div className="mb-3">
              <span className="inline-block bg-[#38b1ab] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Your top match
              </span>
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wide text-[#38b1ab] mb-1">{rec.brand}</p>
          <h2
            className={`font-bold text-black leading-tight ${
              isTop ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {modelNameWithoutBrandPrefix(rec.brand, rec.model)}
          </h2>
          <p className="text-xs text-black/40 mt-1">
            {rec.springType === 'springless' ? 'Springless' : 'Traditional spring'}
            {rec.priceFrom !== null && (
              rec.priceTo !== null && rec.priceTo !== rec.priceFrom
                ? ` · ${formatUsd(rec.priceFrom)}–${formatUsd(rec.priceTo)}`
                : ` · From ${formatUsd(rec.priceFrom)}`
            )}
            {rec.availableSizesIn.length > 0 && ` · ${rec.availableSizesIn.length} size${rec.availableSizesIn.length !== 1 ? 's' : ''}`}
          </p>

          {note && (
            <p className={`text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${isTop ? 'mt-4' : 'mt-3'}`}>
              ⚠ {note}
            </p>
          )}

          {reasons.length > 0 && (
            <ul className={`space-y-1.5 ${note ? 'mt-2' : isTop ? 'mt-4' : 'mt-3'}`}>
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-black/60 leading-snug">
                  <span className="text-[#38b1ab] mt-0.5 flex-shrink-0">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}

          <div className={isTop ? 'mt-5' : 'mt-4'}>
            {href && (
              <>
                <a
                  href={href}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 bg-[#38b1ab] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2e9a94] transition-colors active:scale-95"
                >
                  Check current price at {getShopDestinationLabel(href, rec.brand)} →
                </a>
                <p className="mt-1.5 text-xs text-black/30">Opens product page in a new tab</p>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Inner content (needs useSearchParams) ────────────────────────────────────

function ResultsContent({ entries }: { entries: QuizEntry[] }) {
  const searchParams = useSearchParams();
  const answers = useMemo(() => parseAnswers(searchParams), [searchParams]);
  const recommendations = useMemo(
    () => (answers ? getRecommendations(entries, answers) : []),
    [entries, answers],
  );
  const showAffiliateDisclosure = recommendations.some((rec) => isAffiliateBrand(rec.brand) && rec.sourceUrl);
  const affiliateRecommendationUrls = recommendations
    .filter((rec) => isAffiliateBrand(rec.brand) && rec.sourceUrl)
    .map((rec) => rec.sourceUrl);
  const affiliateDisclosureText = affiliateRecommendationUrls.length > 0
    && affiliateRecommendationUrls.every((url) => isAmazonUrl(url))
    ? 'As an Amazon Associate we earn from qualifying purchases.'
    : 'These results may contain affiliate links. If you buy through them, we may earn a commission at no extra cost to you. As an Amazon Associate we earn from qualifying purchases.';

  if (!answers) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="max-w-md rounded-3xl border border-black/[0.08] p-8 text-center">
          <h1 className="text-2xl font-bold text-black">Quiz answers are missing</h1>
          <p className="mt-3 text-black/50 leading-7">
            Head back and complete the quiz so we can find your best matches.
          </p>
          <Link
            href="/quiz/"
            className="mt-6 inline-flex rounded-xl bg-[#38b1ab] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2e9a94] transition-colors"
          >
            Retake the quiz
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#38b1ab]/10 px-3.5 py-1.5 mb-4">
          <span className="text-[#38b1ab] text-sm font-semibold">Quiz complete ✓</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
          {recommendations.length === 1 ? 'Your Trampoline Match' : 'Your Trampoline Matches'}
        </h1>
        {recommendations.length > 0 && (
          <>
            <p className="mt-3 max-w-xl text-base leading-7 text-black/50">
              Based on your preferences listed below, these are the strongest matches for your family.
            </p>
            {showAffiliateDisclosure && (
              <p className="mt-2 max-w-xl text-xs leading-6 text-black/40">
                {affiliateDisclosureText}
              </p>
            )}
            <AnswerRecap answers={answers} />
          </>
        )}
      </div>

      {recommendations.length === 0 && (
        <div className="rounded-3xl border border-black/[0.08] p-8 text-center">
          <p className="text-black/50 leading-7">
            No trampolines matched your exact criteria. Try adjusting your budget or spring
            preference.
          </p>
          <Link
            href="/quiz/"
            className="mt-5 inline-flex rounded-xl bg-[#38b1ab] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2e9a94] transition-colors"
          >
            Retake the quiz
          </Link>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          {recommendations.map((rec, i) => (
            <ResultCard key={rec.id} rec={rec} rank={i + 1} answers={answers} />
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-12 border-t border-black/[0.06] pt-6 space-y-5">
          <div className="text-center">
            <Link
              href="/quiz/"
              className="text-sm text-black/30 underline underline-offset-4 hover:text-black/60 transition-colors"
            >
              ← Retake the quiz
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Public export (Suspense boundary) ───────────────────────────────────────

export default function ResultsClient({ entries }: { entries: QuizEntry[] }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-black/40">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your results...
          </div>
        </div>
      }
    >
      <ResultsContent entries={entries} />
    </Suspense>
  );
}
