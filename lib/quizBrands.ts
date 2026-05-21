export interface QuizBrandData {
  slug: string;
  springType: 'traditional' | 'springless' | 'mixed';
  metricScores: {
    bounce: number;
    durability: number;
    value: number;
    assembly: number;
    warranty: number;
  };
  matchReasons: {
    springless?: string;
    traditional?: string;
    smallYard?: string;
    mediumYard?: string;
    largeYard?: string;
    longNarrowYard?: string;
    meetsStandards?: string;
    bounce?: string;
    durability?: string;
    valueForMoney?: string;
    assembly?: string;
    warranty?: string;
    budget_under_500?: string;
    budget_500_1000?: string;
    budget_1000_1500?: string;
    budget_1500_2500?: string;
    budget_2500_plus?: string;
  };
}

export const QUIZ_BRAND_DATA: QuizBrandData[] = [
  {
    slug: 'acon',
    springType: 'traditional',
    metricScores: { bounce: 9, durability: 9, value: 7, assembly: 6, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Premium pricing but durable build justifies the spend',
      warranty: '10-year frame and 5-year mat with shorter spring terms',
      bounce: 'HD and X models deliver strong responsive bounce',
      durability: 'Galvanized powder-coated steel and UV-treated mats',
    },
  },
  {
    slug: 'agame',
    springType: 'traditional',
    metricScores: { bounce: 5, durability: 5, value: 6, assembly: 6, warranty: 4 },
    matchReasons: {
      valueForMoney: 'Cheap for Academy shoppers but warranty is short',
      warranty: '1 to 3 years on frame depending on the model',
      durability: 'Galvanized steel frame at mass-market build spec',
    },
  },
  {
    slug: 'akrobat',
    springType: 'traditional',
    metricScores: { bounce: 9, durability: 9, value: 6, assembly: 6, warranty: 9 },
    matchReasons: {
      valueForMoney: 'Premium performance brand backed by lifetime frame warranty',
      warranty: 'Lifetime frame and 10 years on springs',
      bounce: 'Claims 30 percent more rebound than standard',
      durability: 'Slovenian heavy-gauge steel and inground options',
    },
  },
  {
    slug: 'alleyoop',
    springType: 'traditional',
    metricScores: { bounce: 9, durability: 9, value: 6, assembly: 6, warranty: 9 },
    matchReasons: {
      valueForMoney: 'Premium price but lifetime frame and DoubleBounce add value',
      warranty: 'Lifetime frame and 10 years on mat and springs',
      bounce: 'Patented DoubleBounce softens the impact stage',
      durability: '2mm steel walls and UV-resistant Permatron mat',
    },
  },
  {
    slug: 'avyna',
    springType: 'traditional',
    metricScores: { bounce: 8, durability: 9, value: 6, assembly: 5, warranty: 9 },
    matchReasons: {
      valueForMoney: 'Premium Dutch build with lifetime frame easing the cost',
      warranty: 'Lifetime frame and 10 years on springs but 3 on mat',
      bounce: 'Strong above-ground bounce with high weight capacity',
      durability: '11-gauge steel and 1100lb-plus tested capacity',
    },
  },
  {
    slug: 'bcan',
    springType: 'mixed',
    metricScores: { bounce: 6, durability: 6, value: 7, assembly: 7, warranty: 5 },
    matchReasons: {
      valueForMoney: 'Affordable indoor rebounders for home cardio',
      bounce: 'Bungee and spring models aimed at fitness use',
      durability: 'Foldable alloy steel frame for indoor wear only',
    },
  },
  {
    slug: 'beast',
    springType: 'traditional',
    metricScores: { bounce: 9, durability: 8, value: 7, assembly: 6, warranty: 6 },
    matchReasons: {
      valueForMoney: 'K9 reasonably priced for performance rectangle category',
      warranty: '5 years overall but part-by-part split unclear',
      bounce: '9.5-inch piano wire springs deliver strong rebound',
      durability: 'Heavy galvanized steel frame on flagship K9 rectangle',
    },
  },
  {
    slug: 'capital-play',
    springType: 'traditional',
    metricScores: { bounce: 8, durability: 9, value: 6, assembly: 4, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Premium in-ground kit but installation is significant',
      warranty: '10-year frame and 5 years on mat and springs',
      bounce: 'Commercial-grade springs and vented jump mat',
      durability: 'Heavy galvanized steel and bowl retaining wall',
    },
  },
  {
    slug: 'crazy-ape',
    springType: 'mixed',
    metricScores: { bounce: 10, durability: 10, value: 4, assembly: 5, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Luxury custom Canadian builds expensive even at entry',
      warranty: '10 years on springs and 5 on frame mat and net',
      bounce: 'Commercial-grade Canadian build with serious rebound',
      durability: 'Made-to-order Canadian construction with full customization',
    },
  },
  {
    slug: 'jump-yeti',
    springType: 'traditional',
    metricScores: { bounce: 6, durability: 6, value: 6, assembly: 6, warranty: 4 },
    matchReasons: {
      valueForMoney: 'Budget pricing but minimal warranty support',
      warranty: '1 year on all parts including frame',
      durability: 'Galvanized steel frame in lightweight construction',
    },
  },
  {
    slug: 'jumpflex',
    springType: 'traditional',
    metricScores: { bounce: 8, durability: 8, value: 8, assembly: 7, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Strong value at the mid-premium price point',
      warranty: 'HERO 10-year frame and 5 years on mat and springs',
      bounce: '7.1-inch springs deliver solid family bounce',
      durability: 'High-tensile steel frame and 550lb total capacity',
    },
  },
  {
    slug: 'jumpking',
    springType: 'mixed',
    metricScores: { bounce: 5, durability: 5, value: 5, assembly: 6, warranty: 3 },
    matchReasons: {
      valueForMoney: 'Decent prices undermined by very short warranty',
      warranty: '1-year frame and only 90 days on springs and net',
      bounce: 'Standard short springs offer basic family bounce',
      durability: 'Galvanized steel but warranty signals shorter lifespan',
    },
  },
  {
    slug: 'jumpzylla',
    springType: 'traditional',
    metricScores: { bounce: 6, durability: 6, value: 7, assembly: 6, warranty: 5 },
    matchReasons: {
      valueForMoney: 'Budget Amazon brand with above-average warranty terms',
      warranty: '2 years on frame mat springs and net',
      durability: 'Galvanized steel frame and weight capacity to 450lb',
    },
  },
  {
    slug: 'little-tikes',
    springType: 'traditional',
    metricScores: { bounce: 5, durability: 5, value: 6, assembly: 7, warranty: 4 },
    matchReasons: {
      valueForMoney: 'Cheap toddler trampolines with familiar brand recognition',
      warranty: '1 year frame and 3 months on mat springs and net',
      bounce: 'Built for toddlers not real bounce performance',
      durability: 'Lightweight build aimed at light toddler users only',
    },
  },
  {
    slug: 'maxair',
    springType: 'traditional',
    metricScores: { bounce: 10, durability: 9, value: 3, assembly: 4, warranty: 5 },
    matchReasons: {
      valueForMoney: 'Aimed at pros and parks not residential budgets',
      warranty: '5-year frame but only 1 year on the trampoline bed',
      bounce: 'Two-String Fly Bed used by Olympic athletes',
      durability: 'USA-made steel frame and in-ground or pro builds',
    },
  },
  {
    slug: 'north',
    springType: 'traditional',
    metricScores: { bounce: 9, durability: 9, value: 6, assembly: 5, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Premium in-ground build distributed via Capital Play USA',
      warranty: '10-year frame and 5 years on mat and springs',
      bounce: 'Long stretch springs deliver deep low-impact bounce',
      durability: 'Swedish engineering with heavy galvanized steel frame',
    },
  },
  {
    slug: 'orcc',
    springType: 'traditional',
    metricScores: { bounce: 6, durability: 6, value: 7, assembly: 6, warranty: 4 },
    matchReasons: {
      valueForMoney: 'Cheap Amazon brand with weak warranty support',
      warranty: '2-year frame and 1 year on mat and springs',
      durability: 'Hot-dip galvanized frame with W-shaped wind-stake legs',
    },
  },
  {
    slug: 'skywalker',
    springType: 'mixed',
    metricScores: { bounce: 6, durability: 6, value: 8, assembly: 7, warranty: 6 },
    matchReasons: {
      valueForMoney: 'Strong mass-market value and very widely available',
      warranty: 'Standard 3-year frame with longer terms on Premium and Epic',
      bounce: 'Mid-range bounce varies by Classic Signature or Epic series',
      durability: 'Quality varies meaningfully across the four series tiers',
    },
  },
  {
    slug: 'sportspower-bounce-pro',
    springType: 'traditional',
    metricScores: { bounce: 6, durability: 6, value: 7, assembly: 6, warranty: 6 },
    matchReasons: {
      valueForMoney: 'Mass-market pricing through Walmart and Costco',
      warranty: '7-year frame and 3 years on mat and 1 on net',
      durability: 'Steelflex Pro galvanized frame at mid-tier build quality',
    },
  },
  {
    slug: 'springfree',
    springType: 'springless',
    metricScores: { bounce: 7, durability: 9, value: 6, assembly: 5, warranty: 10 },
    matchReasons: {
      springless: 'Springless rod design eliminates spring and frame impact zones',
      valueForMoney: 'Premium pricing offset by industry-leading 10-year coverage',
      warranty: '10 years on every component since September 2017',
      bounce: 'Rod-based bounce feels firmer than premium coil brands',
      durability: 'Composite rods and SoftEdge mat built to last',
    },
  },
  {
    slug: 'texas-trampolines',
    springType: 'traditional',
    metricScores: { bounce: 7, durability: 8, value: 5, assembly: 7, warranty: 8 },
    matchReasons: {
      valueForMoney: 'Heavy USA build but enclosure and accessories cost extra',
      warranty: 'Lifetime frame but other parts less clearly covered',
      bounce: 'Old-school heavy-frame design with traditional bounce',
      durability: 'Heavy galvanized pipe made in Texas since 1986',
    },
  },
  {
    slug: 'upper-bounce',
    springType: 'traditional',
    metricScores: { bounce: 5, durability: 5, value: 5, assembly: 6, warranty: 2 },
    matchReasons: {
      valueForMoney: 'Cheap upfront but warranty windows are extremely short',
      warranty: 'Only 6 months on the complete trampoline set',
      durability: 'Budget galvanized steel and replacement parts widely available',
    },
  },
  {
    slug: 'vuly',
    springType: 'mixed',
    metricScores: { bounce: 9, durability: 9, value: 7, assembly: 7, warranty: 7 },
    matchReasons: {
      springless: 'Leaf Spring on Thunder removes the coil spring impact zone',
      valueForMoney: 'Premium Australian build with strong feature-for-price ratio',
      warranty: 'Thunder 10-year frame and 5-year mat but Leaf Springs 1 year',
      bounce: 'Leaf Spring delivers a unique deep bounce on Thunder',
      durability: 'Galvanized frame and UV-treated mats with strong owner reviews',
    },
  },
  {
    slug: 'west-coast-jump',
    springType: 'traditional',
    metricScores: { bounce: 8, durability: 8, value: 6, assembly: 6, warranty: 7 },
    matchReasons: {
      valueForMoney: 'Premium for USA-made and a net costs extra',
      warranty: '5 years on every part - simple and clear',
      bounce: '8.5-inch springs and 500lb capacity for big bounce',
      durability: '13-gauge USA steel handcrafted in Arizona',
    },
  },
  {
    slug: 'zero-gravity',
    springType: 'traditional',
    metricScores: { bounce: 7, durability: 7, value: 4, assembly: 6, warranty: 3 },
    matchReasons: {
      valueForMoney: 'Premium pricing undermined by unusually weak warranty',
      warranty: '1 year on frame and springs and zero on mat and net',
      bounce: 'USA TenCate Permatron mat and 8.5-inch springs',
      durability: 'Double hot-dipped galvanized steel frame construction',
    },
  },
  {
    slug: 'zupapa',
    springType: 'traditional',
    metricScores: { bounce: 7, durability: 7, value: 8, assembly: 7, warranty: 6 },
    matchReasons: {
      valueForMoney: 'Strong value with high listed weight capacities',
      warranty: '10 years on frame but only 2 on other parts',
      bounce: 'Heavy-frame rounds with high total weight ratings',
      durability: 'Galvanized steel frame and weight ratings to 1800lb',
    },
  },
];
