import type { QuizBrandData } from '@/lib/quizBrands';

type PartialMetricScores = Partial<QuizBrandData['metricScores']>;
type PartialMatchReasons = Partial<QuizBrandData['matchReasons']>;

export interface QuizModelData {
  brandSlug: string;
  model: string;
  springType?: 'traditional' | 'springless';
  advancedSafety?: boolean;
  metricScores?: PartialMetricScores;
  matchReasons?: PartialMatchReasons;
}

export const QUIZ_MODEL_DATA: QuizModelData[] = [
  {
    brandSlug: 'vuly',
    model: 'Ultra 2',
    springType: 'traditional',
    advancedSafety: true,
    metricScores: { bounce: 8, durability: 8, value: 8, assembly: 7, warranty: 8 },
    matchReasons: {
      traditional: 'Traditional coil spring setup with a controlled family bounce feel',
      budget_under_500: 'Entry Ultra 2 pricing makes it one of the more affordable large-format Vuly models',
      valueForMoney: 'One of the stronger value plays in the Vuly range if you want the brand without the premium price tier',
    },
  },
  {
    brandSlug: 'vuly',
    model: 'Ultra 2 Pro',
    springType: 'traditional',
    advancedSafety: true,
    metricScores: { bounce: 8, durability: 9, value: 7, assembly: 7, warranty: 9 },
    matchReasons: {
      traditional: 'Traditional coil springs paired with upgraded frame and accessory support',
      durability: 'Upgraded frame and premium pad package make this one of the tougher coil-spring Vuly models',
      warranty: 'Stronger warranty position than the entry Ultra range',
    },
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder 2',
    springType: 'springless',
    advancedSafety: true,
    metricScores: { bounce: 8, durability: 9, value: 6, assembly: 6, warranty: 8 },
    matchReasons: {
      springless: 'Uses Vuly’s leaf-spring setup with no exposed coil springs around the jumping area',
      safetyEssential: 'Leaf springs and the enclosed jump zone make Thunder 2 the safer-feeling Vuly option for younger families',
      safetyNiceToHave: 'Leaf springs remove exposed coils and reduce the usual spring-area pinch points',
    },
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder 2 Pro',
    springType: 'springless',
    advancedSafety: true,
    metricScores: { bounce: 9, durability: 9, value: 5, assembly: 6, warranty: 9 },
    matchReasons: {
      springless: 'Leaf-spring system keeps the edge free of exposed coils while still delivering a strong rebound',
      safetyEssential: 'This is the Vuly model line most aligned with buyers prioritizing advanced safety features',
      bounce: 'Thunder 2 Pro combines Vuly’s leaf-spring setup with a more performance-oriented bounce than most family trampolines',
    },
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder Pro',
    springType: 'springless',
    advancedSafety: true,
    metricScores: { bounce: 9, durability: 9, value: 4, assembly: 6, warranty: 9 },
    matchReasons: {
      springless: 'Premium Vuly leaf-spring model for buyers who want a springless-style setup without moving to another brand',
      durability: 'Built and priced as one of the highest-end Vuly outdoor trampolines',
      warranty: 'Premium-tier Vuly positioning with stronger long-term support expectations',
    },
  },
];
