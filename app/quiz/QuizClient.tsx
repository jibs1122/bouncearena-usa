'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import QuizQuestion from '@/components/QuizQuestion';
import { buildQuestions } from '@/lib/quiz';
import { encodeAnswers, type QuizAnswers } from '@/lib/quizScoring';

type PartialQuizAnswers = Partial<QuizAnswers>;

const SKIP_DEFAULTS: Record<string, string | string[]> = {
  safetyFeatures: 'nice-to-have',
  springType: 'not-sure',
  backyardSize: 'not-sure',
  standards: 'no',
  budget: ['flexible'],
  priorities: [],
};

function isCompleteAnswers(answers: PartialQuizAnswers): answers is QuizAnswers {
  return Boolean(
    answers.backyardSize &&
      answers.standards &&
      answers.safetyFeatures &&
      answers.springType &&
      Array.isArray(answers.budget) &&
      answers.budget.length > 0 &&
      Array.isArray(answers.priorities),
  );
}

export default function QuizClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<PartialQuizAnswers>({ priorities: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const quizContentRef = useRef<HTMLElement | null>(null);
  const hasMountedQuestionRef = useRef(false);

  const handlePreviewPrioritiesChange = useCallback((_vals: string[]) => {
    // No Vuly bias logic needed — kept for API compatibility with QuizQuestion
  }, []);

  const questions = useMemo(() => buildQuestions(), []);
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (!hasMountedQuestionRef.current) {
      hasMountedQuestionRef.current = true;
      return;
    }

    quizContentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [currentIndex]);

  function selectedValues(questionId: string): string[] {
    if (questionId === 'priorities') return answers.priorities ?? [];
    if (questionId === 'budget') return answers.budget ?? [];
    const value = answers[questionId as keyof PartialQuizAnswers];
    return typeof value === 'string' ? [value] : [];
  }

  function goBack() {
    if (currentIndex === 0) return;
    setDirection('back');
    setCurrentIndex((current) => Math.max(0, current - 1));
  }

  function submitAndNavigate(nextAnswers: QuizAnswers) {
    router.push(`/results/?${encodeAnswers(nextAnswers)}`);
  }

  function handleAnswer(value: string | string[]) {
    const questionId = currentQuestion.id;
    const nextAnswers: PartialQuizAnswers = { ...answers };

    if (questionId === 'priorities') {
      nextAnswers.priorities = value as Array<'bounce' | 'durability' | 'value' | 'assembly' | 'warranty'>;
    } else if (questionId === 'budget') {
      nextAnswers.budget = value as QuizAnswers['budget'];
    } else {
      (nextAnswers as Record<string, unknown>)[questionId] = value;
    }

    setAnswers(nextAnswers);

    if (questionId === 'priorities') {
      if (!isCompleteAnswers(nextAnswers)) return;
      submitAndNavigate(nextAnswers);
      return;
    }

    setDirection('forward');
    setCurrentIndex((current) => Math.min(questions.length - 1, current + 1));
  }

  function handleSkip() {
    const questionId = currentQuestion.id;
    const skipValue = SKIP_DEFAULTS[questionId] ?? 'not-sure';
    const nextAnswers: PartialQuizAnswers = { ...answers };

    if (questionId === 'priorities') {
      nextAnswers.priorities = [];
    } else if (questionId === 'budget') {
      nextAnswers.budget = ['flexible'];
    } else {
      (nextAnswers as Record<string, unknown>)[questionId] = skipValue;
    }

    setAnswers(nextAnswers);

    if (questionId === 'priorities') {
      if (!isCompleteAnswers(nextAnswers)) return;
      submitAndNavigate(nextAnswers);
      return;
    }

    setDirection('forward');
    setCurrentIndex((current) => Math.min(questions.length - 1, current + 1));
  }

  return (
    <section
      ref={quizContentRef}
      className="scroll-mt-20 mx-auto w-full max-w-3xl px-5 py-8 sm:px-8"
    >
      {currentIndex === 0 && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Trampoline quiz — find the right option for your family
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
            Answer 6 quick questions and we&apos;ll match you with the best trampoline for your
            family — based on your safety priorities, spring preference, backyard size, and budget.
          </p>
        </div>
      )}

      <div className="mb-5 flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar value={progress} />
        </div>
        <div className="text-xs font-medium text-black/35 tabular-nums whitespace-nowrap">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {currentIndex === 0 && (
        <p className="mb-4 text-xs text-black/30">
          This quiz contains affiliate links and we may earn a commission on purchases.
        </p>
      )}

      <div
        key={currentQuestion.id}
        className={direction === 'back' ? 'question-enter-back' : 'question-enter-forward'}
      >
        <QuizQuestion
          question={currentQuestion}
          stepNumber={currentIndex + 1}
          selected={selectedValues(currentQuestion.id)}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onSelectionChange={
            currentQuestion.id === 'priorities'
              ? handlePreviewPrioritiesChange
              : undefined
          }
          continueLabel={currentQuestion.id === 'priorities' ? 'See my results →' : 'Continue →'}
        />
      </div>

      {currentQuestion.id === 'priorities' && (
        <p className="mt-6 text-xs text-black/30">
          We earn a commission when you buy through some links. It doesn&apos;t change which
          trampoline we recommend.
        </p>
      )}

      <div className="mt-4 border-t border-black/[0.06] pt-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="text-sm font-medium transition-colors disabled:opacity-0 text-black/40 hover:text-black"
          >
            ← Back
          </button>
          <p className="text-xs text-black/25">
            {currentQuestion.type === 'multi' ? 'Choose up to two and continue' : 'Tap an answer to continue'}
          </p>
        </div>
      </div>
    </section>
  );
}
