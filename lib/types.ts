export type GroundType = 'above-ground' | 'in-ground' | 'both';

export interface Product {
  brand: string;
  model: string;
  size: string;
  shape: string;
  groundType: GroundType;
  maxDiameterIn: number | null;
  overallLengthIn: number | null;
  overallWidthIn: number | null;
  matFrameHeightIn: number | null;
  safetyNetHeightIn: number | null;
  totalHeightIn: number | null;
  frameTubeDiameterIn: number | null;
  springSystem: string;
  springCount: number | null;
  springLengthIn: number | null;
  maxSingleUserWeightLb: number | null;
  combinedTotalWeightRatingLb: number | null;
  staticWeightRatingLb: number | null;
  countryMadeIn: string;
  frameMaterial: string;
  matMaterial: string;
  netMaterial: string;
  paddingMaterial: string;
  warrantyFrameYears: number | null;
  warrantyMatYears: number | null;
  warrantySpringsYears: number | null;
  warrantyNetYears: number | null;
  warrantyPadsYears: number | null;
  warrantyPartsYears: number | null;
  meetsUsStandard: boolean | null;
  usStandardDetails: string;
  otherStandards: string;
  exactSizePriceUsd: number | null;
  modelFromPriceUsd: number | null;
  priceBasis: string;
  sourceUrls: string[];
  notes: string;
  slug: string;
}

export interface Brand {
  name: string;
  slug: string;
  products: Product[];
  fromPriceUsd: number | null;
  sourceUrl: string | null;
}

export interface ComparePair {
  brandA: Brand;
  brandB: Brand;
  slug: string;
}

export interface BestCategory {
  slug: string;
  title: string;
  description: string;
  brands: Brand[];
}
