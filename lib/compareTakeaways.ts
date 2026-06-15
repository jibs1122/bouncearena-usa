import { formatUsd } from "@/lib/price";
import type { Brand, Product } from "@/lib/types";
import { isAconBrand } from "@/lib/vuly";
import { formatWarrantyYears } from "@/lib/warranty";

type SpringSystemKind = "coil" | "leaf" | "springless" | "other";

type BrandTakeawaySummary = {
  name: string;
  prices: number[];
  springSystems: Set<SpringSystemKind>;
  shapes: Set<string>;
  maxFootprintIn: number | null;
  maxFootprintShape: string | null;
  maxFootprintSecondDimIn: number | null;
  maxSingleUserWeightLb: number | null;
  maxCombinedWeightLb: number | null;
  frameWarrantyYears: number | null;
  matWarrantyYears: number | null;
  springsWarrantyYears: number | null;
  netWarrantyYears: number | null;
  astmKnownCount: number;
  astmYesCount: number;
};

function productPrice(product: Product): number | null {
  return product.exactSizePriceUsd ?? product.modelFromPriceUsd ?? null;
}

function maxNumber(values: Array<number | null>): number | null {
  const usable = values.filter((value): value is number => value !== null);
  return usable.length > 0 ? Math.max(...usable) : null;
}

function classifySpringSystem(system: string): SpringSystemKind | null {
  const normalized = system.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("leaf")) return "leaf";
  if (
    normalized.includes("springless") ||
    normalized.includes("rod") ||
    normalized.includes("bungee") ||
    normalized.includes("elastic")
  ) {
    return "springless";
  }
  if (normalized.includes("spring") || normalized.includes("coil")) return "coil";
  return "other";
}

function normalizeShape(shape: string): string | null {
  const normalized = shape.trim().toLowerCase();
  if (!normalized || normalized === "custom") return null;
  if (normalized === "rectangular") return "rectangle";
  return normalized;
}

function productFootprintIn(product: Product): number | null {
  const dimensions = [
    product.maxDiameterIn,
    product.overallLengthIn,
    product.overallWidthIn,
  ].filter((value): value is number => value !== null);

  return dimensions.length > 0 ? Math.max(...dimensions) : null;
}

type FootprintDetails = { maxIn: number; shape: string; secondDimIn: number | null };

function productFootprintDetails(product: Product): FootprintDetails | null {
  const max = productFootprintIn(product);
  if (max === null) return null;
  const shape = product.shape?.trim().toLowerCase() ?? "round";
  let secondDimIn: number | null = null;
  if (shape === "rectangle" || shape === "oval") {
    const dims = [product.overallLengthIn, product.overallWidthIn].filter(
      (d): d is number => d !== null,
    );
    if (dims.length === 2) secondDimIn = Math.min(...dims);
  }
  return { maxIn: max, shape, secondDimIn };
}

function summarizeBrand(brand: Brand): BrandTakeawaySummary {
  const prices = brand.products
    .map(productPrice)
    .filter((price): price is number => price !== null);
  const springSystems = new Set(
    brand.products
      .map((product) => classifySpringSystem(product.springSystem))
      .filter((system): system is SpringSystemKind => system !== null),
  );
  const shapes = new Set(
    brand.products
      .map((product) => normalizeShape(product.shape))
      .filter((shape): shape is string => shape !== null),
  );
  const astmKnown = brand.products.filter((product) => product.meetsUsStandard !== null);

  const footprintDetails = brand.products
    .map(productFootprintDetails)
    .filter((d): d is FootprintDetails => d !== null)
    .reduce<FootprintDetails | null>(
      (best, curr) => (best === null || curr.maxIn > best.maxIn ? curr : best),
      null,
    );

  return {
    name: brand.name,
    prices,
    springSystems,
    shapes,
    maxFootprintIn: footprintDetails?.maxIn ?? null,
    maxFootprintShape: footprintDetails?.shape ?? null,
    maxFootprintSecondDimIn: footprintDetails?.secondDimIn ?? null,
    maxSingleUserWeightLb: isAconBrand(brand.name)
      ? null
      : maxNumber(brand.products.map((product) => product.maxSingleUserWeightLb)),
    maxCombinedWeightLb: maxNumber(
      brand.products.map((product) => product.combinedTotalWeightRatingLb),
    ),
    frameWarrantyYears: maxNumber(brand.products.map((product) => product.warrantyFrameYears)),
    matWarrantyYears: maxNumber(brand.products.map((product) => product.warrantyMatYears)),
    springsWarrantyYears: maxNumber(brand.products.map((product) => product.warrantySpringsYears)),
    netWarrantyYears: maxNumber(brand.products.map((product) => product.warrantyNetYears)),
    astmKnownCount: astmKnown.length,
    astmYesCount: astmKnown.filter((product) => product.meetsUsStandard === true).length,
  };
}

function formatFeet(inches: number): string {
  const feet = inches / 12;
  return Number.isInteger(feet) ? `${feet} ft` : `${Number(feet.toFixed(1))} ft`;
}

function formatSpringSystems(summary: BrandTakeawaySummary): string {
  const labels: Record<SpringSystemKind, string> = {
    coil: "traditional spring",
    leaf: "leaf-spring",
    springless: "springless",
    other: "other spring",
  };
  const systems = [...summary.springSystems].map((system) => labels[system]).sort();
  if (systems.length === 1) return `${summary.name} uses ${systems[0]} models`;
  return `${summary.name} spans ${systems.join(" and ")} models`;
}

function setsDiffer<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return true;
  return [...a].some((value) => !b.has(value));
}

function buildSpringSystemTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.springSystems.size === 0 || b.springSystems.size === 0) return null;
  if (!setsDiffer(a.springSystems, b.springSystems)) return null;
  return `The two brands differ on spring type — ${formatSpringSystems(a)}, while ${formatSpringSystems(b)}.`;
}

function buildPriceTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.prices.length === 0 || b.prices.length === 0) return null;
  const aMin = Math.min(...a.prices);
  const bMin = Math.min(...b.prices);
  const aMax = Math.max(...a.prices);
  const bMax = Math.max(...b.prices);
  const lower = aMin <= bMin ? a : b;
  const higher = lower === a ? b : a;
  const lowerMin = Math.min(...lower.prices);
  const higherMin = Math.min(...higher.prices);
  const entryGap = higherMin - lowerMin;
  const entryGapIsMaterial = entryGap >= 200 || higherMin / Math.max(lowerMin, 1) >= 1.25;

  if (entryGapIsMaterial) {
    return `${lower.name} starts significantly cheaper — ${formatUsd(lowerMin)} vs ${formatUsd(higherMin)}.`;
  }

  const topEndGap = Math.abs(aMax - bMax);
  if (topEndGap >= 700 || Math.max(aMax, bMax) / Math.max(Math.min(aMax, bMax), 1) >= 1.5) {
    const higherTop = aMax > bMax ? a : b;
    const lowerTop = higherTop === a ? b : a;
    return `${higherTop.name} reaches a higher top-end price (${formatUsd(Math.max(aMax, bMax))} vs ${formatUsd(Math.min(aMax, bMax))}); compare exact models if budget is a factor.`;
  }

  return null;
}

function buildWarrantyTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.frameWarrantyYears === null || b.frameWarrantyYears === null) return null;
  if (a.frameWarrantyYears === b.frameWarrantyYears) return null;

  const better = a.frameWarrantyYears > b.frameWarrantyYears ? a : b;
  const other = better === a ? b : a;
  const betterYears = better.frameWarrantyYears!;
  const otherYears = other.frameWarrantyYears!;
  const material =
    !Number.isFinite(betterYears) ||
    !Number.isFinite(otherYears) ||
    betterYears - otherYears >= 2 ||
    betterYears / Math.max(otherYears, 1) >= 1.5;

  if (!material) return null;

  return `${better.name} carries the stronger frame warranty — ${formatWarrantyYears(betterYears)} vs ${formatWarrantyYears(otherYears)}.`;
}

function buildComponentWarrantyTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  const components: Array<[keyof Pick<BrandTakeawaySummary, "matWarrantyYears" | "springsWarrantyYears" | "netWarrantyYears">, string]> = [
    ["matWarrantyYears", "mat"],
    ["springsWarrantyYears", "springs"],
    ["netWarrantyYears", "net"],
  ];

  const aWins: string[] = [];
  const bWins: string[] = [];

  for (const [key, label] of components) {
    const aYears = a[key];
    const bYears = b[key];
    if (aYears === null || bYears === null || aYears === bYears) continue;
    if (aYears > bYears) aWins.push(label);
    else bWins.push(label);
  }

  if (aWins.length < 2 && bWins.length < 2) return null;
  const better = aWins.length > bWins.length ? a : b;
  const winList = better === a ? aWins : bWins;
  const componentStr =
    winList.length === 1
      ? winList[0]
      : winList.slice(0, -1).join(", ") + " and " + winList[winList.length - 1];
  return `${better.name} pulls ahead on warranty, with stronger coverage on the ${componentStr}.`;
}

function buildWeightTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.maxSingleUserWeightLb !== null && b.maxSingleUserWeightLb !== null) {
    if (a.maxSingleUserWeightLb === b.maxSingleUserWeightLb) return null;
    const higher = a.maxSingleUserWeightLb > b.maxSingleUserWeightLb ? a : b;
    const lower = higher === a ? b : a;
    const higherWeight = higher.maxSingleUserWeightLb!;
    const lowerWeight = lower.maxSingleUserWeightLb!;
    if (higherWeight - lowerWeight >= 75 || higherWeight / Math.max(lowerWeight, 1) >= 1.25) {
      return `${higher.name} claims a higher single-user weight limit — up to ${higherWeight} lb vs ${lowerWeight} lb.`;
    }
  }

  if (a.maxCombinedWeightLb === null || b.maxCombinedWeightLb === null) return null;
  if (a.maxCombinedWeightLb === b.maxCombinedWeightLb) return null;

  const higher = a.maxCombinedWeightLb > b.maxCombinedWeightLb ? a : b;
  const lower = higher === a ? b : a;
  const higherWeight = higher.maxCombinedWeightLb!;
  const lowerWeight = lower.maxCombinedWeightLb!;

  if (higherWeight - lowerWeight < 150 && higherWeight / Math.max(lowerWeight, 1) < 1.25) return null;
  return `${higher.name} claims a higher combined weight capacity: ${higherWeight} lb vs ${lowerWeight} lb.`;
}

function formatShapeList(shapes: Set<string>): string {
  const labels = [...shapes]
    .sort()
    .map((shape) => {
      if (shape === "rectangle") return "rectangular";
      return shape;
    });
  return labels.join(", ");
}

function buildShapeTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.shapes.size === 0 || b.shapes.size === 0) return null;
  if (!setsDiffer(a.shapes, b.shapes)) return null;

  const shared = new Set([...a.shapes].filter((s) => b.shapes.has(s)));
  const onlyA = new Set([...a.shapes].filter((s) => !b.shapes.has(s)));
  const onlyB = new Set([...b.shapes].filter((s) => !a.shapes.has(s)));

  if (onlyA.size > 0 && onlyB.size === 0 && shared.size > 0) {
    return `Both cover ${formatShapeList(shared)} options; ${a.name} also comes in ${formatShapeList(onlyA)}.`;
  }
  if (onlyB.size > 0 && onlyA.size === 0 && shared.size > 0) {
    return `Both cover ${formatShapeList(shared)} options; ${b.name} also comes in ${formatShapeList(onlyB)}.`;
  }

  return `${a.name} offers ${formatShapeList(a.shapes)} shapes; ${b.name} covers ${formatShapeList(b.shapes)}.`;
}

function describeLargestModel(s: BrandTakeawaySummary): string {
  const max = s.maxFootprintIn!;
  if (s.maxFootprintShape === "rectangle" && s.maxFootprintSecondDimIn !== null) {
    return `${formatFeet(s.maxFootprintSecondDimIn)}×${formatFeet(max)} rectangle`;
  }
  if (s.maxFootprintShape === "square") return `${formatFeet(max)} square`;
  if (s.maxFootprintShape === "oval" && s.maxFootprintSecondDimIn !== null) {
    return `${formatFeet(s.maxFootprintSecondDimIn)}×${formatFeet(max)} oval`;
  }
  if (s.maxFootprintShape === "oval") return `${formatFeet(max)} oval`;
  return formatFeet(max);
}

function buildSizeTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.maxFootprintIn === null || b.maxFootprintIn === null) return null;
  if (a.maxFootprintIn === b.maxFootprintIn) return null;

  const larger = a.maxFootprintIn > b.maxFootprintIn ? a : b;
  const smaller = larger === a ? b : a;

  if (larger.maxFootprintIn! - smaller.maxFootprintIn! < 24) return null;
  return `If you're after a very large trampoline, ${larger.name} goes up to ${describeLargestModel(larger)}; ${smaller.name} tops out at ${describeLargestModel(smaller)}.`;
}

function buildStandardsTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.astmKnownCount === 0 || b.astmKnownCount === 0) return null;
  if (a.astmYesCount === b.astmYesCount) return null;

  const stronger = a.astmYesCount > b.astmYesCount ? a : b;
  const other = stronger === a ? b : a;
  if (stronger.astmYesCount === 0) return null;

  return `${stronger.name} has more ASTM-certified models in this comparison (${stronger.astmYesCount} vs ${other.astmYesCount}).`;
}

export function buildCompareTakeaways(brandA: Brand, brandB: Brand): string[] {
  const a = summarizeBrand(brandA);
  const b = summarizeBrand(brandB);
  const takeaways = [
    buildSpringSystemTakeaway(a, b),
    buildPriceTakeaway(a, b),
    buildWarrantyTakeaway(a, b),
    buildWeightTakeaway(a, b),
    buildShapeTakeaway(a, b),
    buildSizeTakeaway(a, b),
    buildComponentWarrantyTakeaway(a, b),
    buildStandardsTakeaway(a, b),
  ].filter((takeaway): takeaway is string => takeaway !== null);

  if (takeaways.length > 0) return takeaways.slice(0, 5);

  return [
    "The biggest differences are model-specific, so use the table below to compare the exact size, warranty, weight rating, and price rows for the models you are considering.",
  ];
}
