/**
 * Quiz simulation harness — runs the real scoring pipeline against real product data.
 * Usage: npx tsx scripts/quiz-sim.ts [personas|sweep|entries]
 */
import { getQuizEntries, getQuizEntriesForAdmin } from '../lib/quizTrampolines';
import {
  getRecommendations,
  getScoreBreakdown,
  type QuizAnswers,
} from '../lib/quizScoring';

const AFFILIATES = new Set(['Vuly', 'ACON', 'Zupapa']);

function normBrand(b: string) {
  return b.toLowerCase();
}
function isAffiliate(brand: string) {
  return ['vuly', 'acon', 'zupapa'].includes(normBrand(brand));
}

// ─── Mode: entries — dump the entry pool ────────────────────────────────────
function dumpEntries() {
  const admin = getQuizEntriesForAdmin();
  const surfaced = admin.filter((e) => e.surfaced);
  console.log(`Total grouped models: ${admin.length}; surfaced in quiz: ${surfaced.length}\n`);

  const excluded = admin.filter((e) => !e.surfaced);
  console.log('EXCLUDED entries:');
  for (const e of excluded) {
    console.log(`  - ${e.brand} ${e.model} [${e.exclusionReasons.join(', ')}] price=${e.priceFrom}`);
  }

  console.log('\nSURFACED entries (brand | model | spring | ground | net | price | shape | fitsYard | merit metrics):');
  const rows = surfaced
    .slice()
    .sort((a, b) => a.brand.localeCompare(b.brand) || (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  for (const e of rows) {
    const fy = e.fitsYard;
    const fit = `${fy.small ? 'S' : '-'}${fy.medium ? 'M' : '-'}${fy.large ? 'L' : '-'}${fy.longNarrow ? 'N' : '-'}`;
    const m = e.metricScores;
    const flag = isAffiliate(e.brand) ? ' ★AFF' : '';
    console.log(
      `  ${e.brand.padEnd(22)} ${e.model.padEnd(42)} ${e.springType.padEnd(11)} ${e.groundType.padEnd(12)} net=${String(e.safetyNet).padEnd(8)} $${String(e.priceFrom).padEnd(6)}-$${String(e.priceTo).padEnd(6)} ${String(e.shape).padEnd(9)} ${fit} b${m.bounce} d${m.durability} v${m.value} a${m.assembly} w${m.warranty} std=${e.meetsUSStandards}${flag}`,
    );
  }
}

// ─── Mode: personas — named persona battery ─────────────────────────────────
interface Persona {
  name: string;
  story: string;
  answers: QuizAnswers;
  expectation: string;
}

const personas: Persona[] = [
  {
    name: 'Budget family, small yard',
    story: 'Parent of two kids (4 & 8), small suburban yard, wants a net, under $500',
    expectation: 'Cheap round 8-10ft models with nets (Skywalker/Zupapa/Bounce Pro tier)',
    answers: {
      backyardSize: 'small', groundTypePreference: 'above-ground', shapePreference: 'round',
      jumperAges: ['under-6', '6-12'], standards: 'yes', safetyNetPreference: 'yes',
      springType: 'not-sure', budget: ['under-500'], priorities: ['value', 'assembly'],
    },
  },
  {
    name: 'Safety-first toddler parent',
    story: 'Toddler only, springless wanted, net required, mid budget, ASTM matters',
    expectation: 'Springfree / Vuly Thunder / springless models with nets',
    answers: {
      backyardSize: 'medium', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['under-6'], standards: 'yes', safetyNetPreference: 'yes',
      springType: 'springless', budget: ['1000-1500', '1500-2500'], priorities: ['durability', 'warranty'],
    },
  },
  {
    name: 'Gymnast teen, performance',
    story: 'Teen gymnast, rectangle, bounce priority, large yard, high budget',
    expectation: 'Performance rectangles: Beast K9, Acon X/HD, Texas Trampolines',
    answers: {
      backyardSize: 'large', groundTypePreference: 'above-ground', shapePreference: 'rectangle',
      jumperAges: ['13-17'], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'traditional', budget: ['1500-2500', '2500-plus'], priorities: ['bounce', 'durability'],
    },
  },
  {
    name: 'In-ground clean look',
    story: 'Wants in-ground, medium yard, flexible budget, no net',
    expectation: 'In-ground specialists: Capital Play, North, Avyna, Acon inground',
    answers: {
      backyardSize: 'medium', groundTypePreference: 'in-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12', '13-17'], standards: 'no', safetyNetPreference: 'no',
      springType: 'not-sure', budget: ['flexible'], priorities: ['durability', 'warranty'],
    },
  },
  {
    name: 'Whole-family jumper',
    story: 'Kids + adults, large yard, wants durability & warranty, $1000-2500',
    expectation: 'High capacity models: Avyna, Acon, Vuly Ultra, Zupapa large',
    answers: {
      backyardSize: 'large', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12', '18plus'], standards: 'yes', safetyNetPreference: 'yes',
      springType: 'traditional', budget: ['1000-1500', '1500-2500'], priorities: ['durability', 'warranty'],
    },
  },
  {
    name: 'Adult fitness jumper',
    story: 'Adults only, bounce quality, no kids, large yard, premium budget',
    expectation: 'Acon, MaxAir-tier bounce brands; springless penalized for bounce',
    answers: {
      backyardSize: 'large', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['18plus'], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'not-sure', budget: ['2500-plus'], priorities: ['bounce'],
    },
  },
  {
    name: 'Value hunter, medium yard',
    story: 'Classic mid-market buyer: 12ft round, net, $500-1000, value focus',
    expectation: 'Zupapa / Skywalker / Jumpflex value picks',
    answers: {
      backyardSize: 'medium', groundTypePreference: 'above-ground', shapePreference: 'round',
      jumperAges: ['6-12'], standards: 'yes', safetyNetPreference: 'yes',
      springType: 'traditional', budget: ['500-1000'], priorities: ['value', 'warranty'],
    },
  },
  {
    name: 'Long narrow yard',
    story: 'Side-yard installation, oval/rect fit, kids, mid budget',
    expectation: 'Oval/rectangle models that fit narrow spaces',
    answers: {
      backyardSize: 'long-narrow', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12', '13-17'], standards: 'no', safetyNetPreference: 'yes',
      springType: 'not-sure', budget: ['500-1000', '1000-1500'], priorities: ['value'],
    },
  },
  {
    name: 'Springless premium, flexible',
    story: 'Wants springless, money no object, warranty priority',
    expectation: 'Springfree flagship, Vuly Thunder Pro',
    answers: {
      backyardSize: 'large', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['under-6', '6-12'], standards: 'yes', safetyNetPreference: 'yes',
      springType: 'springless', budget: ['flexible'], priorities: ['warranty', 'durability'],
    },
  },
  {
    name: 'Skipped everything',
    story: 'User who skips all questions (defaults)',
    expectation: 'Diverse fallback: one springless, mixed brands',
    answers: {
      backyardSize: 'not-sure', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: [], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'not-sure', budget: ['flexible'], priorities: [],
    },
  },
  {
    name: 'Only budget answered',
    story: 'Skips all but sets budget under $500',
    expectation: 'Diverse picks within budget',
    answers: {
      backyardSize: 'not-sure', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: [], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'not-sure', budget: ['under-500'], priorities: [],
    },
  },
  {
    name: 'Easy assembly renter',
    story: 'Wants easy assembly + value, small yard, no strong prefs',
    expectation: 'Skywalker/Zupapa/Jumpflex assembly-friendly models',
    answers: {
      backyardSize: 'small', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12'], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'not-sure', budget: ['flexible'], priorities: ['assembly', 'value'],
    },
  },
  {
    name: 'In-ground springless combo',
    story: 'In-ground AND springless — narrowest possible pool',
    expectation: 'Whatever in-ground springless exists (Acon inground? Springfree?)',
    answers: {
      backyardSize: 'medium', groundTypePreference: 'in-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12'], standards: 'no', safetyNetPreference: 'no-preference',
      springType: 'springless', budget: ['flexible'], priorities: ['durability'],
    },
  },
  {
    name: 'No net wanted, traditional',
    story: 'Old-school: no net, traditional springs, large yard, bounce',
    expectation: 'Texas Trampolines, West Coast Jump, MaxAir style',
    answers: {
      backyardSize: 'large', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['13-17', '18plus'], standards: 'no', safetyNetPreference: 'no',
      springType: 'traditional', budget: ['flexible'], priorities: ['bounce'],
    },
  },
  {
    name: 'Tight budget conflict',
    story: 'Springless + under $500 (springless is usually expensive)',
    expectation: 'Either cheap springless (SkyBound bungee?) or empty state',
    answers: {
      backyardSize: 'medium', groundTypePreference: 'above-ground', shapePreference: 'not-sure',
      jumperAges: ['6-12'], standards: 'no', safetyNetPreference: 'yes',
      springType: 'springless', budget: ['under-500'], priorities: ['value'],
    },
  },
];

function runPersonas() {
  const entries = getQuizEntries();
  for (const p of personas) {
    const recs = getRecommendations(entries, p.answers);
    console.log(`\n═══ ${p.name} ═══`);
    console.log(`   ${p.story}`);
    console.log(`   EXPECTED: ${p.expectation}`);
    if (recs.length === 0) {
      console.log('   ➜ NO RESULTS (empty state shown)');
      continue;
    }
    recs.forEach((r, i) => {
      const bd = getScoreBreakdown(r, p.answers);
      const flag = isAffiliate(r.brand) ? ' ★AFF' : '';
      console.log(
        `   ${i + 1}. ${r.brand} ${r.model}${flag} — $${r.priceFrom}${r.priceTo !== r.priceFrom ? `-${r.priceTo}` : ''} ${r.springType} score=${r.score}`,
      );
      console.log(
        `      [size:${bd.size} ground:${bd.groundType} shape:${bd.shape} ages:${bd.ages} std:${bd.standards} net:${bd.safety} spring:${bd.springType} budget:${bd.budget} prio:${bd.priorities} joey:${bd.joey}]`,
      );
      r.matchReasonsList.forEach((reason) => console.log(`      ✓ ${reason}`));
    });
  }
}

// ─── Mode: sweep — exhaustive answer-space sweep for affiliate surfacing ────
function runSweep(groundFilter?: QuizAnswers['groundTypePreference']) {
  const entries = getQuizEntries();
  const backyards: QuizAnswers['backyardSize'][] = ['small', 'medium', 'large', 'long-narrow', 'not-sure'];
  const grounds: QuizAnswers['groundTypePreference'][] = groundFilter
    ? [groundFilter]
    : ['above-ground', 'in-ground'];
  const shapes: QuizAnswers['shapePreference'][] = ['round', 'rectangle', 'not-sure'];
  const springs: QuizAnswers['springType'][] = ['traditional', 'springless', 'not-sure'];
  const nets: QuizAnswers['safetyNetPreference'][] = ['yes', 'no', 'no-preference'];
  const budgets: QuizAnswers['budget'][] = [
    ['under-500'], ['500-1000'], ['1000-1500'], ['1500-2500'], ['2500-plus'], ['flexible'],
    ['500-1000', '1000-1500'], ['1500-2500', '2500-plus'],
  ];
  const prioritySets: QuizAnswers['priorities'][] = [
    [], ['bounce'], ['value'], ['durability', 'warranty'], ['value', 'assembly'], ['bounce', 'durability'],
  ];
  const ageSets: QuizAnswers['jumperAges'][] = [[], ['under-6'], ['6-12'], ['13-17', '18plus'], ['under-6', '6-12', '13-17', '18plus']];
  const standardsOpts: QuizAnswers['standards'][] = ['yes', 'no'];

  let total = 0;
  let emptyCount = 0;
  const brandTop1 = new Map<string, number>();
  const brandTop3 = new Map<string, number>();
  let anyAffiliateTop3 = 0;
  let affiliateTop1 = 0;
  const emptyExamples: string[] = [];

  for (const backyardSize of backyards)
    for (const groundTypePreference of grounds)
      for (const shapePreference of shapes)
        for (const springType of springs)
          for (const safetyNetPreference of nets)
            for (const budget of budgets)
              for (const priorities of prioritySets)
                for (const jumperAges of ageSets)
                  for (const standards of standardsOpts) {
                    const answers: QuizAnswers = {
                      backyardSize, groundTypePreference, shapePreference, springType,
                      safetyNetPreference, budget, priorities, jumperAges, standards,
                    };
                    const recs = getRecommendations(entries, answers);
                    total++;
                    if (recs.length === 0) {
                      emptyCount++;
                      if (emptyExamples.length < 12) {
                        emptyExamples.push(
                          `${backyardSize}/${groundTypePreference}/${shapePreference}/${springType}/net=${safetyNetPreference}/${budget.join('+')}/std=${standards}`,
                        );
                      }
                      continue;
                    }
                    const top1 = recs[0];
                    brandTop1.set(top1.brand, (brandTop1.get(top1.brand) ?? 0) + 1);
                    let hasAff = false;
                    for (const r of recs) {
                      brandTop3.set(r.brand, (brandTop3.get(r.brand) ?? 0) + 1);
                      if (isAffiliate(r.brand)) hasAff = true;
                    }
                    if (hasAff) anyAffiliateTop3++;
                    if (isAffiliate(top1.brand)) affiliateTop1++;
                  }

  console.log(`Total combos: ${total}`);
  console.log(`Empty results: ${emptyCount} (${((emptyCount / total) * 100).toFixed(1)}%)`);
  console.log(`Combos w/ results: ${total - emptyCount}`);
  console.log(`≥1 affiliate (Vuly/Acon/Zupapa) in top 3: ${anyAffiliateTop3} (${((anyAffiliateTop3 / (total - emptyCount)) * 100).toFixed(1)}% of non-empty)`);
  console.log(`Affiliate is #1: ${affiliateTop1} (${((affiliateTop1 / (total - emptyCount)) * 100).toFixed(1)}% of non-empty)`);

  const sortDesc = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\nTop-1 appearances by brand:');
  for (const [brand, count] of sortDesc(brandTop1)) {
    console.log(`  ${isAffiliate(brand) ? '★' : ' '} ${brand.padEnd(24)} ${count} (${((count / (total - emptyCount)) * 100).toFixed(1)}%)`);
  }
  console.log('\nTop-3 appearances by brand:');
  for (const [brand, count] of sortDesc(brandTop3)) {
    console.log(`  ${isAffiliate(brand) ? '★' : ' '} ${brand.padEnd(24)} ${count} (${((count / (total - emptyCount)) * 100).toFixed(1)}%)`);
  }
  console.log('\nSample empty-result combos:');
  emptyExamples.forEach((e) => console.log(`  - ${e}`));
}

const mode = process.argv[2] ?? 'personas';
if (mode === 'entries') dumpEntries();
else if (mode === 'sweep') runSweep(process.argv[3] as QuizAnswers['groundTypePreference'] | undefined);
else runPersonas();
