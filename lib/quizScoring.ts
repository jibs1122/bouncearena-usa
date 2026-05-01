import type { QuizEntry } from '@/lib/quizTrampolines';

export type BudgetId =
  | 'under-500'
  | '500-1000'
  | '1000-1500'
  | '1500-2500'
  | '2500-plus'
  | 'flexible';

export interface QuizAnswers {
  backyardSize: 'small' | 'medium' | 'large' | 'long-narrow' | 'not-sure';
  standards: 'yes' | 'no';
  safetyFeatures: 'essential' | 'nice-to-have' | 'not-important';
  springType: 'traditional' | 'springless' | 'not-sure';
  budget: BudgetId[];
  priorities: Array<'bounce' | 'durability' | 'value' | 'assembly' | 'warranty'>;
}

export interface ScoredEntry extends QuizEntry {
  score: number;
  matchReasonsList: string[];
}

type PriorityId = 'bounce' | 'durability' | 'value' | 'assembly' | 'warranty';

export interface ScoreBreakdown {
  size: number;
  standards: number;
  safety: number;
  springType: number;
  budget: number;
  priorities: number;
  total: number;
  hardExcluded: boolean;
}

export const budgetRanges: Record<BudgetId, [number, number]> = {
  'under-500': [0, 500],
  '500-1000': [500, 1000],
  '1000-1500': [1000, 1500],
  '1500-2500': [1500, 2500],
  '2500-plus': [2500, 999999],
  flexible: [0, 999999],
};

// ─── Individual scoring functions ──────────────────────────────────────────────

function scoreSize(entry: QuizEntry, backyardSize: QuizAnswers['backyardSize']): number {
  if (backyardSize === 'not-sure') return 0;
  if (backyardSize === 'long-narrow') {
    return entry.fitsYard.longNarrow ? 40 : -20;
  }
  const fits =
    backyardSize === 'small'
      ? entry.fitsYard.small
      : backyardSize === 'medium'
        ? entry.fitsYard.medium
        : entry.fitsYard.large;
  return fits ? 30 : -100;
}

function scoreStandards(entry: QuizEntry, standards: QuizAnswers['standards']): number {
  if (standards === 'no') return 0;
  if (entry.meetsUSStandards === true) return 20;
  if (entry.meetsUSStandards === false) return -20;
  return 0;
}

function scoreSafety(entry: QuizEntry, safetyFeatures: QuizAnswers['safetyFeatures']): number {
  if (safetyFeatures === 'essential') return entry.advancedSafety ? 30 : -30;
  if (safetyFeatures === 'nice-to-have') return entry.advancedSafety ? 10 : 0;
  return 0;
}

function scoreSpringType(entry: QuizEntry, springType: QuizAnswers['springType']): number {
  if (springType === 'not-sure') return 0;
  return entry.springType === springType ? 40 : -100;
}

function getBudgetBounds(budgets: BudgetId[]): [number, number] | null {
  if (budgets.length === 0 || budgets.includes('flexible')) return null;
  const ranges = budgets.map((budget) => budgetRanges[budget]);
  return [
    Math.min(...ranges.map(([min]) => min)),
    Math.max(...ranges.map(([, max]) => max)),
  ];
}

function scoreBudget(entry: QuizEntry, budgets: BudgetId[]): number {
  const bounds = getBudgetBounds(budgets);
  if (!bounds) return 0;
  const price = entry.priceFrom;
  if (price === null) return 0;
  const [min, max] = bounds;
  if (price >= min && price <= max) return 25;
  if (price < min) return -20;
  const ratio = price / Math.max(max, 1);
  return ratio > 1.5 ? -100 : -30;
}

function scorePriorities(entry: QuizEntry, priorities: PriorityId[]): number {
  return priorities
    .slice(0, 2)
    .reduce((total, priority) => total + entry.metricScores[priority] * 2, 0);
}

function isHardExcluded(entry: QuizEntry, answers: QuizAnswers): boolean {
  if (scoreSize(entry, answers.backyardSize) <= -100) return true;
  if (scoreSpringType(entry, answers.springType) <= -100) return true;
  if (scoreBudget(entry, answers.budget) <= -100) return true;
  return false;
}

function countSignals(answers: QuizAnswers): number {
  let signals = 0;
  if (answers.backyardSize !== 'not-sure') signals++;
  if (answers.standards === 'yes') signals++;
  if (answers.safetyFeatures === 'essential') signals++;
  if (answers.springType !== 'not-sure') signals++;
  if (!(answers.budget.length === 1 && answers.budget[0] === 'flexible')) signals++;
  if (answers.priorities.length > 0) signals++;
  return signals;
}

export function baseMeritScore(entry: QuizEntry): number {
  return (
    entry.metricScores.bounce +
    entry.metricScores.durability +
    entry.metricScores.value +
    entry.metricScores.assembly +
    entry.metricScores.warranty +
    (entry.advancedSafety ? 3 : 0)
  );
}

export function getScoreBreakdown(entry: QuizEntry, answers: QuizAnswers): ScoreBreakdown {
  const size = scoreSize(entry, answers.backyardSize);
  const standards = scoreStandards(entry, answers.standards);
  const safety = scoreSafety(entry, answers.safetyFeatures);
  const springType = scoreSpringType(entry, answers.springType);
  const budget = scoreBudget(entry, answers.budget);
  const priorities = scorePriorities(entry, answers.priorities as PriorityId[]);
  return {
    size,
    standards,
    safety,
    springType,
    budget,
    priorities,
    total: size + standards + safety + springType + budget + priorities,
    hardExcluded:
      size <= -100 ||
      springType <= -100 ||
      budget <= -100,
  };
}

function getDiverseRecommendations(entries: QuizEntry[], answers: QuizAnswers): ScoredEntry[] {
  const pool = entries
    .filter((e) => !isHardExcluded(e, answers))
    .filter((e) => scoreBudget(e, answers.budget) >= 0)
    .filter((e) => scoreStandards(e, answers.standards) > -50)
    .sort((a, b) => baseMeritScore(b) - baseMeritScore(a) || (a.priceFrom ?? 0) - (b.priceFrom ?? 0));

  const picks: QuizEntry[] = [];
  const seenIds = new Set<string>();
  const seenBrands = new Set<string>();

  function pick(predicate: (e: QuizEntry) => boolean) {
    const match = pool.find((e) => !seenIds.has(e.id) && predicate(e));
    if (!match) return;
    picks.push(match);
    seenIds.add(match.id);
    seenBrands.add(match.brand);
  }

  pick((e) => e.springType === 'springless');
  pick((e) => e.springType === 'traditional' && !seenBrands.has(e.brand));
  pick((e) => !seenBrands.has(e.brand));

  for (const e of pool) {
    if (picks.length >= 3) break;
    if (seenIds.has(e.id)) continue;
    picks.push(e);
    seenIds.add(e.id);
  }

  return picks.slice(0, 3).map((e) => ({
    ...e,
    score: 1,
    matchReasonsList: selectMatchReasons(e, answers),
  }));
}

// ─── Core scoring ─────────────────────────────────────────────────────────────

export function getRecommendations(entries: QuizEntry[], answers: QuizAnswers): ScoredEntry[] {
  if (countSignals(answers) <= 1) {
    return getDiverseRecommendations(entries, answers);
  }

  const passing = entries
    .filter((e) => !isHardExcluded(e, answers))
    .map((e) => {
      const breakdown = getScoreBreakdown(e, answers);
      return { ...e, score: breakdown.total, matchReasonsList: [] as string[] };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score || (a.priceFrom ?? 0) - (b.priceFrom ?? 0));

  const deduped: typeof passing = [];
  const seenBrands = new Set<string>();
  for (const entry of passing) {
    if (seenBrands.has(entry.brand)) continue;
    deduped.push(entry);
    seenBrands.add(entry.brand);
    if (deduped.length >= 3) break;
  }

  return deduped.map((e) => ({
    ...e,
    matchReasonsList: selectMatchReasons(e, answers),
  }));
}

// ─── Match reasons ─────────────────────────────────────────────────────────────

export function selectMatchReasons(entry: QuizEntry, answers: QuizAnswers): string[] {
  const reasons: string[] = [];
  const mr = entry.matchReasons;

  if (answers.springType === 'springless' && mr.springless) reasons.push(mr.springless);
  else if (answers.springType === 'traditional' && mr.traditional) reasons.push(mr.traditional);

  const sizeSnippet =
    answers.backyardSize === 'small'
      ? mr.smallYard
      : answers.backyardSize === 'medium'
        ? mr.mediumYard
        : answers.backyardSize === 'large'
          ? mr.largeYard
          : answers.backyardSize === 'long-narrow'
            ? mr.longNarrowYard
            : undefined;
  if (sizeSnippet) reasons.push(sizeSnippet);

  if (answers.safetyFeatures === 'essential' && mr.safetyEssential) {
    reasons.push(mr.safetyEssential);
  } else if (answers.safetyFeatures === 'nice-to-have' && mr.safetyNiceToHave) {
    reasons.push(mr.safetyNiceToHave);
  }

  if (answers.standards === 'yes' && entry.meetsUSStandards && mr.meetsStandards) {
    reasons.push(mr.meetsStandards);
  }

  const budgetKeyMap: Partial<Record<BudgetId, keyof typeof mr>> = {
    'under-500': 'budget_under_500',
    '500-1000': 'budget_500_1000',
    '1000-1500': 'budget_1000_1500',
    '1500-2500': 'budget_1500_2500',
    '2500-plus': 'budget_2500_plus',
  };
  for (const budget of answers.budget) {
    const budgetKey = budgetKeyMap[budget];
    const budgetSnippet = budgetKey ? mr[budgetKey] : undefined;
    if (budgetSnippet) {
      reasons.push(budgetSnippet);
      break;
    }
  }

  for (const priority of answers.priorities.slice(0, 2)) {
    if (reasons.length >= 4) break;
    if (priority === 'bounce' && mr.bounce) reasons.push(mr.bounce);
    else if (priority === 'durability' && mr.durability) reasons.push(mr.durability);
    else if (priority === 'value' && mr.valueForMoney) reasons.push(mr.valueForMoney);
    else if (priority === 'assembly' && mr.assembly) reasons.push(mr.assembly);
    else if (priority === 'warranty' && mr.warranty) reasons.push(mr.warranty);
  }

  return reasons.slice(0, 4);
}

// ─── Summary text ──────────────────────────────────────────────────────────────

export function buildSummaryText(answers: QuizAnswers): string {
  const budgetLabel: Record<BudgetId, string> = {
    'under-500': 'a budget under $500',
    '500-1000': 'a budget of $500–$1,000',
    '1000-1500': 'a budget of $1,000–$1,500',
    '1500-2500': 'a budget of $1,500–$2,500',
    '2500-plus': 'a budget above $2,500',
    flexible: 'a flexible budget',
  };

  const springLabel: Record<QuizAnswers['springType'], string> = {
    springless: 'a springless setup',
    traditional: 'traditional springs',
    'not-sure': 'either spring system',
  };

  const priorityLabel: Record<PriorityId, string> = {
    bounce: 'bounce quality',
    durability: 'durability',
    value: 'value for money',
    assembly: 'easy assembly',
    warranty: 'warranty and support',
  };

  const priorities =
    answers.priorities.length > 0
      ? answers.priorities
          .slice(0, 2)
          .map((p) => priorityLabel[p as PriorityId])
          .join(' and ')
      : 'overall fit';

  const budgetSummary =
    answers.budget.length === 0 || (answers.budget.length === 1 && answers.budget[0] === 'flexible')
      ? budgetLabel.flexible
      : answers.budget.length === 1
        ? budgetLabel[answers.budget[0]]
        : (() => {
            const bounds = getBudgetBounds(answers.budget);
            if (!bounds) return budgetLabel.flexible;
            const [min, max] = bounds;
            const lower = min === 0 ? 'under $500' : `$${min.toLocaleString('en-US')}`;
            const upper = max >= 999999 ? 'above $2,500' : `$${max.toLocaleString('en-US')}`;
            return `a budget range from ${lower} to ${upper}`;
          })();

  return `Based on your focus on ${priorities}, your preference for ${springLabel[answers.springType]}, and ${budgetSummary}, these are the strongest matches for your family.`;
}

// ─── URL serialization ──────────────────────────────────────────────────────────

export function encodeAnswers(answers: QuizAnswers): string {
  const params = new URLSearchParams();
  params.set('backyardSize', answers.backyardSize);
  params.set('standards', answers.standards);
  params.set('safetyFeatures', answers.safetyFeatures);
  params.set('springType', answers.springType);
  params.set('budget', answers.budget.join(','));
  params.set('priorities', answers.priorities.join(','));
  return params.toString();
}

export function parseAnswers(searchParams: URLSearchParams): QuizAnswers | null {
  const backyardSize = searchParams.get('backyardSize');
  const standards = searchParams.get('standards');
  const safetyFeatures = searchParams.get('safetyFeatures');
  const springType = searchParams.get('springType');
  const budget = (searchParams.get('budget') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is BudgetId => Boolean(value) && value in budgetRanges)
    .slice(0, 2);
  const priorities = (searchParams.get('priorities') ?? '')
    .split(',')
    .filter((p): p is PriorityId =>
      ['bounce', 'durability', 'value', 'assembly', 'warranty'].includes(p),
    );

  if (
    (backyardSize !== 'small' &&
      backyardSize !== 'medium' &&
      backyardSize !== 'large' &&
      backyardSize !== 'long-narrow' &&
      backyardSize !== 'not-sure') ||
    (standards !== 'yes' && standards !== 'no') ||
    (safetyFeatures !== 'essential' &&
      safetyFeatures !== 'nice-to-have' &&
      safetyFeatures !== 'not-important') ||
    (springType !== 'traditional' &&
      springType !== 'springless' &&
      springType !== 'not-sure') ||
    budget.length === 0
  ) {
    return null;
  }

  return {
    backyardSize,
    standards,
    safetyFeatures,
    springType,
    budget,
    priorities,
  };
}
