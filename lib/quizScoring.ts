import type { QuizEntry } from '@/lib/quizTrampolines';

export type BudgetId =
  | 'under-500'
  | '500-1000'
  | '1000-1500'
  | '1500-2500'
  | '2500-plus'
  | 'flexible';

export type JumperAgeId = 'under-6' | '6-12' | '13-17' | '18plus';
export type ShapePreferenceId = 'round' | 'rectangle' | 'not-sure';
export type GroundTypePreferenceId = 'above-ground' | 'in-ground';
export type SafetyNetPreferenceId = 'yes' | 'no' | 'no-preference';

export interface QuizAnswers {
  backyardSize: 'small' | 'medium' | 'large' | 'long-narrow' | 'not-sure';
  groundTypePreference: GroundTypePreferenceId;
  shapePreference: ShapePreferenceId;
  jumperAges: JumperAgeId[];
  standards: 'yes' | 'no';
  safetyNetPreference: SafetyNetPreferenceId;
  springType: 'traditional' | 'springless' | 'not-sure';
  budget: BudgetId[];
  priorities: Array<'bounce' | 'durability' | 'value' | 'assembly' | 'warranty'>;
}

export interface ScoredEntry extends QuizEntry {
  score: number;
  matchReasonsList: string[];
}

type PriorityId = 'bounce' | 'durability' | 'value' | 'assembly' | 'warranty';
const JOEY_RATING_SCORE_BONUS = 10;
const JOEY_RATING_MERIT_BONUS = 2;
const SPRINGLESS_BOUNCE_PRIORITY_PENALTY = 10;
const TIE_BREAK_BRAND_SLUGS = new Set(['vuly', 'acon']);

export interface ScoreBreakdown {
  size: number;
  groundType: number;
  shape: number;
  ages: number;
  standards: number;
  safety: number;
  springType: number;
  budget: number;
  priorities: number;
  joey: number;
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

const MODEL_FAMILY_TOKENS = [
  'air',
  'flex',
  'hero',
  'mega',
  'ultra',
  'thunder',
  'pro',
  'classic',
  'prime',
  'primus',
  'xcityx',
  'goliath',
  'silverback',
  'apex',
  'alpha',
  'hyper',
];

function mentionsOtherModelFamily(reason: string, model: string): boolean {
  const reasonLower = reason.toLowerCase();
  const modelLower = model.toLowerCase();

  const mentionedFamilies = MODEL_FAMILY_TOKENS.filter((token) =>
    new RegExp(`\\b${token}\\b`, 'i').test(reasonLower),
  );

  return mentionedFamilies.some((token) => !new RegExp(`\\b${token}\\b`, 'i').test(modelLower));
}

function brandSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function tieBreakBrandScore(entry: QuizEntry): number {
  return TIE_BREAK_BRAND_SLUGS.has(brandSlug(entry.brand)) ? 1 : 0;
}

// ─── Individual scoring functions ──────────────────────────────────────────────

function scoreSize(entry: QuizEntry, backyardSize: QuizAnswers['backyardSize']): number {
  if (backyardSize === 'not-sure') {
    if (entry.fitsYard.medium) return 30;
    if (entry.fitsYard.large) return 24;
    return -100;
  }

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

function scoreGroundType(
  entry: QuizEntry,
  groundTypePreference: QuizAnswers['groundTypePreference']
): number {
  if (entry.groundType === 'both') return 25;
  return entry.groundType === groundTypePreference ? 25 : -100;
}

function scoreShape(entry: QuizEntry, shapePreference: QuizAnswers['shapePreference']): number {
  if (shapePreference === 'not-sure') return 0;
  const shape = entry.shape.trim().toLowerCase();
  const isRound = shape === 'round';
  const isRectangleLike = shape === 'rectangle' || shape === 'square' || shape === 'oval';

  if (shapePreference === 'round') return isRound ? 15 : -10;
  return isRectangleLike ? 15 : -10;
}

function scoreJumperAges(entry: QuizEntry, jumperAges: JumperAgeId[]): number {
  if (jumperAges.length === 0 || entry.springType !== 'springless') return 0;
  const hasYoung = jumperAges.includes('under-6') || jumperAges.includes('6-12');
  const hasOlder = jumperAges.includes('13-17') || jumperAges.includes('18plus');
  if (hasYoung && !hasOlder) return 15;
  if (hasYoung && hasOlder) return 0;
  return -15; // older/adults only
}

function scoreStandards(entry: QuizEntry, standards: QuizAnswers['standards']): number {
  if (standards === 'no') return 0;
  if (entry.meetsUSStandards === true) return 20;
  if (entry.meetsUSStandards === false) return -20;
  return 0;
}

function safetyNetMatches(entry: QuizEntry, preference: SafetyNetPreferenceId): boolean {
  if (preference === 'no-preference') return true;
  if (entry.safetyNet === 'optional') return true;
  return entry.safetyNet === preference;
}

function scoreSafetyNet(entry: QuizEntry, preference: SafetyNetPreferenceId): number {
  if (preference === 'no-preference') return 0;
  if (entry.safetyNet === 'unknown') return 0;
  return safetyNetMatches(entry, preference) ? 20 : -100;
}

function scoreSpringType(entry: QuizEntry, springType: QuizAnswers['springType']): number {
  if (springType === 'not-sure') return 0;
  return entry.springType === springType ? 40 : -100;
}

function scoreSafety(entry: QuizEntry, preference: SafetyNetPreferenceId): number {
  return scoreSafetyNet(entry, preference);
}

export function getBudgetBounds(budgets: BudgetId[]): [number, number] | null {
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
  if (price < min) return 0;
  const ratio = price / Math.max(max, 1);
  return ratio > 1.5 ? -100 : -30;
}

function scorePriorities(entry: QuizEntry, priorities: PriorityId[]): number {
  let total = priorities
    .slice(0, 2)
    .reduce((total, priority) => total + entry.metricScores[priority] * 2, 0);

  if (priorities.includes('bounce') && entry.springType === 'springless') {
    total -= SPRINGLESS_BOUNCE_PRIORITY_PENALTY;
  }

  return total;
}

function isHardExcluded(entry: QuizEntry, answers: QuizAnswers): boolean {
  if (scoreSize(entry, answers.backyardSize) <= -100) return true;
  if (scoreGroundType(entry, answers.groundTypePreference) <= -100) return true;
  if (scoreSafetyNet(entry, answers.safetyNetPreference) <= -100) return true;
  if (scoreSpringType(entry, answers.springType) <= -100) return true;
  if (scoreBudget(entry, answers.budget) <= -100) return true;
  return false;
}

function countSignals(answers: QuizAnswers): number {
  let signals = 0;
  if (answers.backyardSize !== 'not-sure') signals++;
  if (answers.shapePreference !== 'not-sure') signals++;
  if (answers.jumperAges.length > 0) signals++;
  if (answers.standards === 'yes') signals++;
  if (answers.safetyNetPreference !== 'no-preference') signals++;
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
    (entry.joeyRating ? JOEY_RATING_MERIT_BONUS : 0)
  );
}

export function getScoreBreakdown(entry: QuizEntry, answers: QuizAnswers): ScoreBreakdown {
  const size = scoreSize(entry, answers.backyardSize);
  const groundType = scoreGroundType(entry, answers.groundTypePreference);
  const shape = scoreShape(entry, answers.shapePreference);
  const ages = scoreJumperAges(entry, answers.jumperAges);
  const standards = scoreStandards(entry, answers.standards);
  const safety = scoreSafety(entry, answers.safetyNetPreference);
  const springType = scoreSpringType(entry, answers.springType);
  const budget = scoreBudget(entry, answers.budget);
  const priorities = scorePriorities(entry, answers.priorities as PriorityId[]);
  const joey = entry.joeyRating ? JOEY_RATING_SCORE_BONUS : 0;
  return {
    size,
    groundType,
    shape,
    ages,
    standards,
    safety,
    springType,
    budget,
    priorities,
    joey,
    total: size + groundType + shape + ages + standards + safety + springType + budget + priorities + joey,
    hardExcluded: isHardExcluded(entry, answers),
  };
}

function getDiverseRecommendations(entries: QuizEntry[], answers: QuizAnswers): ScoredEntry[] {
  const pool = entries
    .filter((e) => !isHardExcluded(e, answers))
    .filter((e) => scoreBudget(e, answers.budget) >= 0)
    .filter((e) => scoreStandards(e, answers.standards) > -50)
    .sort(
      (a, b) =>
        baseMeritScore(b) - baseMeritScore(a) ||
        tieBreakBrandScore(b) - tieBreakBrandScore(a) ||
        (a.priceFrom ?? 0) - (b.priceFrom ?? 0),
    );

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
    score: baseMeritScore(e),
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
    .sort(
      (a, b) =>
        b.score - a.score ||
        tieBreakBrandScore(b) - tieBreakBrandScore(a) ||
        (a.priceFrom ?? 0) - (b.priceFrom ?? 0),
    );

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

  if (answers.groundTypePreference === 'above-ground' && ['above-ground', 'both'].includes(entry.groundType)) {
    reasons.push('Matches your preference for an above-ground trampoline');
  } else if (answers.groundTypePreference === 'in-ground' && ['in-ground', 'both'].includes(entry.groundType)) {
    reasons.push('Matches your preference for an in-ground trampoline');
  }

  if (answers.springType === 'springless' && mr.springless) reasons.push(mr.springless);
  else if (answers.springType === 'traditional' && mr.traditional) reasons.push(mr.traditional);

  if (answers.backyardSize !== 'not-sure') {
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
    if (sizeSnippet && !mentionsOtherModelFamily(sizeSnippet, entry.model)) reasons.push(sizeSnippet);
  }

  if (answers.shapePreference === 'round' && entry.shape.trim().toLowerCase() === 'round') {
    reasons.push('Matches your preference for a round trampoline shape');
  } else if (
    answers.shapePreference === 'rectangle' &&
    ['rectangle', 'square', 'oval'].includes(entry.shape.trim().toLowerCase())
  ) {
    reasons.push('Matches your preference for a rectangular-style trampoline shape');
  }

  if (answers.safetyNetPreference === 'yes' && safetyNetMatches(entry, 'yes')) {
    reasons.push(
      entry.safetyNet === 'optional'
        ? 'Safety net is available as an option'
        : 'Includes a safety net to match your preference',
    );
  } else if (answers.safetyNetPreference === 'no' && safetyNetMatches(entry, 'no')) {
    reasons.push(
      entry.safetyNet === 'optional'
        ? 'Can be configured without a safety net'
        : 'Matches your preference for no safety net',
    );
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

  // Fallback merit reasons when signals are low and card is sparse
  if (reasons.length < 2) {
    if (entry.joeyRating && !reasons.some(r => r.includes('reviewed'))) {
      reasons.push('Rated and reviewed by the Bounce Arena team');
    }
    if (reasons.length < 2 && entry.metricScores.durability >= 8 && !reasons.some(r => r.toLowerCase().includes('durabilit'))) {
      reasons.push('Rates highly for durability and long-term build quality');
    }
    if (reasons.length < 2 && entry.metricScores.bounce >= 8 && !reasons.some(r => r.toLowerCase().includes('bounce'))) {
      reasons.push('Strong bounce quality rating among tested trampolines');
    }
    if (reasons.length < 2 && entry.metricScores.value >= 8 && !reasons.some(r => r.toLowerCase().includes('value') || r.toLowerCase().includes('price'))) {
      reasons.push('Competitive value for money across its size range');
    }
  }

  return reasons.slice(0, 4);
}

// ─── Summary text ──────────────────────────────────────────────────────────────

function describeJumperAges(ages: JumperAgeId[]): string | null {
  if (ages.length === 0) return null;
  const hasToddlers = ages.includes('under-6');
  const hasKids = ages.includes('6-12');
  const hasTeens = ages.includes('13-17');
  const hasAdults = ages.includes('18plus');
  if (hasToddlers && hasKids && hasTeens && hasAdults) return 'all ages';
  if (hasToddlers && hasKids && hasTeens) return 'kids and teens';
  if (hasKids && hasTeens && hasAdults) return 'older kids through adults';
  if (hasToddlers && hasKids) return 'young children';
  if (hasKids && hasTeens) return 'kids and teens';
  if (hasTeens && hasAdults) return 'teens and adults';
  if (hasToddlers) return 'toddlers';
  if (hasKids) return 'school-age kids';
  if (hasTeens) return 'teens';
  if (hasAdults) return 'adults';
  return null;
}

function describeBackyardSize(size: QuizAnswers['backyardSize']): string | null {
  if (size === 'not-sure') return null;
  if (size === 'small') return 'a small yard';
  if (size === 'medium') return 'a medium yard';
  if (size === 'large') return 'a large yard';
  if (size === 'long-narrow') return 'a long, narrow yard';
  return null;
}

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
  const shapeLabel: Record<ShapePreferenceId, string> = {
    round: 'a round shape',
    rectangle: 'a rectangular-style shape',
    'not-sure': 'either shape',
  };
  const groundTypeLabel: Record<GroundTypePreferenceId, string> = {
    'above-ground': 'an above-ground installation',
    'in-ground': 'an in-ground installation',
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

  const yardClause = describeBackyardSize(answers.backyardSize);
  const agesClause = describeJumperAges(answers.jumperAges);

  const installationPhrase = yardClause
    ? `${groundTypeLabel[answers.groundTypePreference]} in ${yardClause}`
    : groundTypeLabel[answers.groundTypePreference];

  const tailClauses = [springLabel[answers.springType], shapeLabel[answers.shapePreference], budgetSummary];
  if (agesClause) tailClauses.push(`${agesClause} jumping`);

  return `Based on your focus on ${priorities}, your preference for ${installationPhrase}, ${tailClauses.join(', ')}, these are the strongest matches for your family.`;
}

// ─── URL serialization ──────────────────────────────────────────────────────────

export function encodeAnswers(answers: QuizAnswers): string {
  const params = new URLSearchParams();
  params.set('backyardSize', answers.backyardSize);
  params.set('groundTypePreference', answers.groundTypePreference);
  params.set('shapePreference', answers.shapePreference);
  params.set('jumperAges', answers.jumperAges.join(','));
  params.set('standards', answers.standards);
  params.set('safetyNetPreference', answers.safetyNetPreference);
  params.set('springType', answers.springType);
  params.set('budget', answers.budget.join(','));
  params.set('priorities', answers.priorities.join(','));
  return params.toString();
}

export function parseAnswers(searchParams: URLSearchParams): QuizAnswers | null {
  const backyardSize = searchParams.get('backyardSize');
  const groundTypePreference =
    (searchParams.get('groundTypePreference') as GroundTypePreferenceId | null) ?? 'above-ground';
  const shapePreference = searchParams.get('shapePreference') ?? 'not-sure';
  const standards = searchParams.get('standards');
  const safetyNetPreference = searchParams.get('safetyNetPreference') ?? 'no-preference';
  const springType = searchParams.get('springType');
  const jumperAges = (searchParams.get('jumperAges') ?? '')
    .split(',')
    .filter((v): v is JumperAgeId =>
      ['under-6', '6-12', '13-17', '18plus'].includes(v),
    );
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
    (groundTypePreference !== 'above-ground' &&
      groundTypePreference !== 'in-ground') ||
    (shapePreference !== 'round' &&
      shapePreference !== 'rectangle' &&
      shapePreference !== 'not-sure') ||
    (standards !== 'yes' && standards !== 'no') ||
    (safetyNetPreference !== 'yes' &&
      safetyNetPreference !== 'no' &&
      safetyNetPreference !== 'no-preference') ||
    (springType !== 'traditional' &&
      springType !== 'springless' &&
      springType !== 'not-sure') ||
    budget.length === 0
  ) {
    return null;
  }

  return {
    backyardSize,
    groundTypePreference,
    shapePreference,
    jumperAges,
    standards,
    safetyNetPreference,
    springType,
    budget,
    priorities,
  };
}
