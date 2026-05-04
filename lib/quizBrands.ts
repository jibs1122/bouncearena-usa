export interface QuizBrandData {
  slug: string;              // matches brandSlug() output
  springType: 'traditional' | 'springless';
  advancedSafety: boolean;   // curved poles, springs outside jumping area, etc.
  fitsYard: {
    small: boolean;      // has models ≤ 10ft
    medium: boolean;     // has models ~12ft
    large: boolean;      // has models 14ft+
    longNarrow: boolean; // has oval/rectangular models
  };
  metricScores: {
    bounce: number;      // 0–10
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
    safetyEssential?: string;
    safetyNiceToHave?: string;
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
    slug: 'springfree',
    springType: 'springless',
    advancedSafety: true,
    fitsYard: { small: true, medium: true, large: true, longNarrow: true },
    metricScores: { bounce: 9, durability: 10, value: 5, assembly: 5, warranty: 10 },
    matchReasons: {
      springless:
        'Uses fiberglass rods with no exposed metal springs — eliminates the most common pinch points',
      safetyEssential:
        'No exposed springs or frame contact zone — Springfree is widely considered the safest consumer trampoline on the market',
      meetsStandards: 'ASTM certified',
      durability:
        '10-year warranty on frame, mat, and net — among the longest in the industry',
      warranty:
        'Industry-leading warranty covers frame, mat, and enclosure for 10 years',
    },
  },
  {
    slug: 'acon',
    springType: 'traditional',
    advancedSafety: false,
    fitsYard: { small: true, medium: true, large: true, longNarrow: true },
    metricScores: { bounce: 8, durability: 8, value: 8, assembly: 8, warranty: 8 },
    matchReasons: {
      traditional: 'Heavy-duty galvanized springs with padded cover',
      smallYard: '8ft and 10ft round models for smaller yards',
      mediumYard: '12ft round is a popular family-size pick',
      largeYard: '14ft and 16ft models for large properties',
      meetsStandards: 'ASTM certified',
      valueForMoney: 'Strong specs at a competitive price point',
      assembly: 'Ships with clear instructions and all hardware included',
    },
  },
  {
    slug: 'jumpflex',
    springType: 'traditional',
    advancedSafety: false,
    fitsYard: { small: true, medium: true, large: true, longNarrow: false },
    metricScores: { bounce: 8, durability: 8, value: 7, assembly: 8, warranty: 8 },
    matchReasons: {
      traditional: 'Extension or piano-wire springs with padded cover',
      smallYard: '8ft Flex model for compact spaces',
      mediumYard: '12ft models in both Flex and Hero ranges',
      largeYard: '14ft and 15ft Hero models for bigger yards',
      meetsStandards: 'ASTM certified',
      warranty: '10-year frame warranty on Hero and Mega models',
    },
  },
  {
    slug: 'vuly',
    springType: 'traditional',
    advancedSafety: true,
    fitsYard: { small: false, medium: true, large: true, longNarrow: false },
    metricScores: { bounce: 9, durability: 9, value: 6, assembly: 7, warranty: 9 },
    matchReasons: {
      traditional: "High-tensile helical springs with padded cover",
      mediumYard: 'Available in multiple sizes from 12ft up',
      largeYard: '14ft and larger sizes available',
      bounce: "Vuly's spring design is tuned for a responsive, controlled bounce",
      durability: 'Powder-coated galvanized steel with multi-year warranties',
    },
  },
  {
    slug: 'skywalker',
    springType: 'traditional',
    advancedSafety: false,
    fitsYard: { small: true, medium: true, large: true, longNarrow: false },
    metricScores: { bounce: 6, durability: 6, value: 9, assembly: 8, warranty: 6 },
    matchReasons: {
      traditional: 'Standard galvanized coil springs with foam-padded cover',
      smallYard: 'Compact sizes from 8ft up for smaller backyards',
      mediumYard: '12ft round available at an entry-level price',
      largeYard: 'Models up to 17ft for large yards',
      valueForMoney: 'One of the most affordable ASTM-certified outdoor trampolines',
      meetsStandards: 'ASTM certified',
      budget_under_500: 'Models available well under $500',
    },
  },
  {
    slug: 'upper-bounce',
    springType: 'traditional',
    advancedSafety: false,
    fitsYard: { small: false, medium: true, large: true, longNarrow: false },
    metricScores: { bounce: 7, durability: 7, value: 8, assembly: 7, warranty: 7 },
    matchReasons: {
      traditional: 'Heavy-duty springs with foam padded cover',
      mediumYard: '10ft–12ft models in a solid mid-range price bracket',
      largeYard: '14ft–17ft models for larger yards',
      meetsStandards: 'ASTM certified',
      valueForMoney: 'Good feature set relative to price in the mid-range category',
      budget_500_1000: 'Well-priced options in the $300–$700 range',
    },
  },
  {
    slug: 'zupapa',
    springType: 'traditional',
    advancedSafety: false,
    fitsYard: { small: true, medium: true, large: true, longNarrow: false },
    metricScores: { bounce: 6, durability: 7, value: 8, assembly: 7, warranty: 6 },
    matchReasons: {
      traditional: 'Galvanized springs with padded surround',
      smallYard: '8ft and 10ft models for tighter spaces',
      mediumYard: '12ft round available',
      largeYard: 'Up to 23ft for very large yards',
      valueForMoney: 'Competitive pricing across the size range',
      budget_under_500: 'Multiple models available under $400',
    },
  },
];
