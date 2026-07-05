import { getAllProducts, getProductsDataVersion } from '@/lib/products';
import { QUIZ_BRAND_DATA, type QuizBrandData } from '@/lib/quizBrands';
import { getPreferredModelUrl } from '@/lib/productLinks';
import { QUIZ_MODEL_DATA } from '@/lib/quizModelData';
import type { GroundType, SafetyNetAvailability } from '@/lib/types';

export interface QuizEntry {
  id: string;           // brand-slug + model-slug
  brand: string;
  model: string;
  joeyRating: boolean;
  groundType: GroundType;
  safetyNet: SafetyNetAvailability;
  springType: 'traditional' | 'springless';
  meetsUSStandards: boolean | null;
  priceFrom: number | null;
  priceTo: number | null;
  fitsYard: { small: boolean; medium: boolean; large: boolean; longNarrow: boolean };
  metricScores: { bounce: number; durability: number; value: number; assembly: number; warranty: number };
  matchReasons: QuizBrandData['matchReasons'];
  sourceUrl: string | null;  // best shop / product URL for this model
  availableSizesIn: number[]; // max diameter or length in inches for each size variant
  availableSizeLabels: string[];
  shape: string;
  springSystem: string;
  springCountRange: [number, number] | null;
  springLengthRange: [number, number] | null;
  maxSingleUserWeightLb: number | null;
  combinedTotalWeightRatingLb: number | null;
  staticWeightRatingLb: number | null;
  frameMaterial: string;
  matMaterial: string;
  warrantyFrameYears: number | null;
  warrantyMatYears: number | null;
  warrantySpringsYears: number | null;
  warrantyNetYears: number | null;
  warrantyPadsYears: number | null;
  warrantyPartsYears: number | null;
  usStandardDetails: string;
}

export interface QuizEntryAdmin extends QuizEntry {
  surfaced: boolean;
  exclusionReasons: string[];
  rawSpringSystem: string;
  minSizeIn: number | null;
  maxSizeIn: number | null;
}

const DEFAULT_METRICS = { bounce: 6, durability: 6, value: 6, assembly: 6, warranty: 6 };
const JOEY_RATED_BRAND_SLUGS = new Set([
  'alleyoop',
  'avyna',
  'akrobat',
  'north',
  'west-coast-jump',
  'crazy-ape',
  'maxair',
  'maxx-air',
  'vuly',
  'springfree',
  'acon',
  'texas-trampolines',
  'beast',
  'jumpflex',
  'berg',
]);

export function modelSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isSpringless(springSystem: string): boolean {
  const s = springSystem.toLowerCase();
  return s.includes('springless') || s.includes('rod') || s.includes('bungee') || s.includes('leaf');
}

function deriveSafetyNetAvailability(products: ReturnType<typeof getAllProducts>): SafetyNetAvailability {
  const values = new Set(products.map((p) => p.safetyNet));
  if (values.has('optional')) return 'optional';
  if (values.has('yes') && values.has('no')) return 'optional';
  if (values.has('yes')) return 'yes';
  if (values.has('no')) return 'no';
  return 'unknown';
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function numberRange(values: Array<number | null>): [number, number] | null {
  const numbers = values.filter((value): value is number => value !== null);
  if (numbers.length === 0) return null;
  return [Math.min(...numbers), Math.max(...numbers)];
}

function maxNumber(values: Array<number | null>): number | null {
  const numbers = values.filter((value): value is number => value !== null);
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

type QuizCache = {
  version: number;
  entries: QuizEntry[];
};

type QuizAdminCache = {
  version: number;
  entries: QuizEntryAdmin[];
};

let _cache: QuizCache | null = null;
let _adminCache: QuizAdminCache | null = null;

function buildQuizEntries(): QuizEntryAdmin[] {
  const version = getProductsDataVersion();
  if (_adminCache && _adminCache.version === version) {
    return _adminCache.entries;
  }

  const products = getAllProducts();
  const staticDataMap = new Map(QUIZ_BRAND_DATA.map((d) => [d.slug, d]));
  const modelDataMap = new Map(
    QUIZ_MODEL_DATA.map((d) => [`${d.brandSlug}|||${modelSlug(d.model)}`, d]),
  );

  // Group by brand + model
  const grouped = new Map<string, typeof products>();
  for (const p of products) {
    const key = `${p.brand}|||${p.model}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  function brandSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const entries: QuizEntryAdmin[] = Array.from(grouped.entries()).map(([key, ps]) => {
    const [brand, model] = key.split('|||');
    const bSlug = brandSlug(brand);
    const static_ = staticDataMap.get(bSlug);
    const model_ = modelDataMap.get(`${bSlug}|||${modelSlug(model)}`);
    const joeyRating = JOEY_RATED_BRAND_SLUGS.has(bSlug);

    const prices = ps.map(p => p.exactSizePriceUsd ?? p.modelFromPriceUsd).filter((p): p is number => p !== null);
    const priceFrom = prices.length ? Math.min(...prices) : null;
    const priceTo = prices.length ? Math.max(...prices) : null;

    const sizesIn = ps.map(p => p.maxDiameterIn ?? p.overallLengthIn ?? p.overallWidthIn).filter((s): s is number => s !== null);
    const maxSizeIn = sizesIn.length ? Math.max(...sizesIn) : null;
    const minSizeIn = sizesIn.length ? Math.min(...sizesIn) : null;
    const availableSizeLabels = uniqueStrings(ps.map((p) => p.size));

    const shape = ps[0].shape ?? '';
    const groundTypes = new Set(ps.map((p) => p.groundType));
    const groundType: GroundType =
      groundTypes.has('both') || (groundTypes.has('above-ground') && groundTypes.has('in-ground'))
        ? 'both'
        : groundTypes.has('in-ground')
          ? 'in-ground'
          : 'above-ground';
    const safetyNet = deriveSafetyNetAvailability(ps);
    const isLongNarrow = shape === 'Rectangle' || shape === 'Oval';

    // Derive yard fit from actual model sizes (in inches; 1ft = 12in)
    const fitsYard = {
      small: minSizeIn !== null && minSizeIn <= 126,        // ≤ 10.5ft smallest variant
      medium: maxSizeIn !== null && maxSizeIn >= 120 && (minSizeIn ?? 999) <= 168, // 10–14ft range
      large: maxSizeIn !== null && maxSizeIn >= 156,         // ≥ 13ft largest variant
      longNarrow: isLongNarrow,
    };

    const springSystems = uniqueStrings(ps.map((p) => p.springSystem));
    const springSystem = springSystems[0] ?? '';
    const derivedSpringless = isSpringless(springSystem);
    const springType: 'springless' | 'traditional' =
      model_?.springType ??
      (derivedSpringless || static_?.springType === 'springless' ? 'springless' : 'traditional');

    const hasPositiveStandard = ps.some((p) => p.meetsUsStandard === true);
    const hasNegativeStandard = ps.some((p) => p.meetsUsStandard === false);
    const meetsUSStandards = hasPositiveStandard ? true : hasNegativeStandard ? false : null;
    const metricScores = static_?.metricScores ?? DEFAULT_METRICS;
    const matchReasons = static_?.matchReasons ?? {};

    const sourceUrl = getPreferredModelUrl(brand, ps);

    const exclusionReasons: string[] = [];
    if (priceFrom !== null && priceFrom < 150) exclusionReasons.push('price-below-150');
    if (maxSizeIn !== null && maxSizeIn < 84) exclusionReasons.push('size-too-small');
    if (sourceUrl === null) exclusionReasons.push('missing-source-url');
    if (model_?.quizExclude) exclusionReasons.push('quiz-excluded-specialty');

    return {
      id: `${bSlug}-${modelSlug(model)}`,
      brand,
      model,
      joeyRating,
      groundType,
      safetyNet,
      springType,
      meetsUSStandards,
      priceFrom,
      priceTo,
      fitsYard,
      metricScores,
      matchReasons,
      sourceUrl,
      availableSizesIn: sizesIn,
      availableSizeLabels,
      shape,
      springSystem,
      springCountRange: numberRange(ps.map((p) => p.springCount)),
      springLengthRange: numberRange(ps.map((p) => p.springLengthIn)),
      maxSingleUserWeightLb: maxNumber(ps.map((p) => p.maxSingleUserWeightLb)),
      combinedTotalWeightRatingLb: maxNumber(ps.map((p) => p.combinedTotalWeightRatingLb)),
      staticWeightRatingLb: maxNumber(ps.map((p) => p.staticWeightRatingLb)),
      frameMaterial: uniqueStrings(ps.map((p) => p.frameMaterial))[0] ?? '',
      matMaterial: uniqueStrings(ps.map((p) => p.matMaterial))[0] ?? '',
      warrantyFrameYears: maxNumber(ps.map((p) => p.warrantyFrameYears)),
      warrantyMatYears: maxNumber(ps.map((p) => p.warrantyMatYears)),
      warrantySpringsYears: maxNumber(ps.map((p) => p.warrantySpringsYears)),
      warrantyNetYears: maxNumber(ps.map((p) => p.warrantyNetYears)),
      warrantyPadsYears: maxNumber(ps.map((p) => p.warrantyPadsYears)),
      warrantyPartsYears: maxNumber(ps.map((p) => p.warrantyPartsYears)),
      usStandardDetails: uniqueStrings(ps.map((p) => p.usStandardDetails))[0] ?? '',
      surfaced: exclusionReasons.length === 0,
      exclusionReasons,
      rawSpringSystem: springSystem,
      minSizeIn,
      maxSizeIn,
    };
  });

  _adminCache = {
    version,
    entries,
  };
  return entries;
}

export function getQuizEntries(): QuizEntry[] {
  const version = getProductsDataVersion();
  if (_cache && _cache.version === version) {
    return _cache.entries;
  }

  const entries = buildQuizEntries().filter((entry) => entry.surfaced);
  _cache = {
    version,
    entries,
  };
  return entries;
}

export function getQuizEntriesForAdmin(): QuizEntryAdmin[] {
  return buildQuizEntries();
}
