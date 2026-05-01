'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BrandLogoAvatar from '@/components/ui/BrandLogoAvatar';
import {
  buildSummaryText,
  getRecommendations,
  parseAnswers,
  selectMatchReasons,
  type QuizAnswers,
  type ScoredEntry,
} from '@/lib/quizScoring';
import type { QuizEntry } from '@/lib/quizTrampolines';
import { formatUsd } from '@/lib/price';

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  rec,
  answers,
  rank,
}: {
  rec: ScoredEntry;
  answers: QuizAnswers;
  rank: number;
}) {
  const isTop = rank === 1;
  const reasons = selectMatchReasons(rec, answers);
  const href = rec.sourceUrl;

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
        {/* Brand logo */}
        <div
          className={`flex flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#38b1ab]/10 to-[#38b1ab]/20 p-4 ${
            isTop ? 'h-40 sm:h-auto sm:w-52' : 'h-32 sm:h-auto sm:w-44'
          }`}
        >
          <div className="flex aspect-square w-full max-w-[148px] items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-4">
            <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-white p-3">
              <BrandLogoAvatar
                name={rec.brand}
                size={isTop ? 120 : 96}
                fillContainer
              />
            </div>
          </div>
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
            {rec.model}
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

          {reasons.length > 0 && (
            <ul className={`space-y-1.5 ${isTop ? 'mt-4' : 'mt-3'}`}>
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
                  Check current price at {rec.brand} →
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
        <p className="mt-3 text-base leading-7 text-black/50 max-w-xl">
          {buildSummaryText(answers)}
        </p>
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
            <ResultCard key={rec.id} rec={rec} answers={answers} rank={i + 1} />
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
          <p className="text-center text-xs text-black/25">
            We earn a commission when you buy through some links. It doesn&apos;t affect which
            trampoline we recommend.
          </p>
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
