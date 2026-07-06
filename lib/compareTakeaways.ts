import { formatUsd } from "@/lib/price";
import type { Brand, Product } from "@/lib/types";
import { isAconBrand } from "@/lib/vuly";
import { formatWarrantyYears } from "@/lib/warranty";

type SpringSystemKind = "coil" | "leaf" | "springless" | "other";
type NumberRange = { min: number | null; max: number | null; distinctCount: number };

type BrandTakeawaySummary = {
  name: string;
  products: Product[];
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
  warrantyRanges: {
    frameWarrantyYears: NumberRange;
    matWarrantyYears: NumberRange;
    springsWarrantyYears: NumberRange;
    netWarrantyYears: NumberRange;
  };
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

function numberRange(values: Array<number | null>): NumberRange {
  const usable = values.filter((value): value is number => value !== null);
  if (usable.length === 0) return { min: null, max: null, distinctCount: 0 };
  return {
    min: Math.min(...usable),
    max: Math.max(...usable),
    distinctCount: new Set(usable).size,
  };
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
  const frameWarrantyRange = numberRange(brand.products.map((product) => product.warrantyFrameYears));
  const matWarrantyRange = numberRange(brand.products.map((product) => product.warrantyMatYears));
  const springsWarrantyRange = numberRange(
    brand.products.map((product) => product.warrantySpringsYears),
  );
  const netWarrantyRange = numberRange(brand.products.map((product) => product.warrantyNetYears));

  const footprintDetails = brand.products
    .map(productFootprintDetails)
    .filter((d): d is FootprintDetails => d !== null)
    .reduce<FootprintDetails | null>(
      (best, curr) => (best === null || curr.maxIn > best.maxIn ? curr : best),
      null,
    );

  return {
    name: brand.name,
    products: brand.products,
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
    frameWarrantyYears: frameWarrantyRange.max,
    matWarrantyYears: matWarrantyRange.max,
    springsWarrantyYears: springsWarrantyRange.max,
    netWarrantyYears: netWarrantyRange.max,
    warrantyRanges: {
      frameWarrantyYears: frameWarrantyRange,
      matWarrantyYears: matWarrantyRange,
      springsWarrantyYears: springsWarrantyRange,
      netWarrantyYears: netWarrantyRange,
    },
    astmKnownCount: astmKnown.length,
    astmYesCount: astmKnown.filter((product) => product.meetsUsStandard === true).length,
  };
}

function formatFeet(inches: number): string {
  const halfFeet = Math.round((inches / 12) * 2) / 2;
  if (Number.isInteger(halfFeet)) return `${halfFeet} ft`;
  return `${Math.floor(halfFeet)}½ ft`;
}

function describeSpringSystems(summary: BrandTakeawaySummary): string {
  const hasCoil = summary.springSystems.has("coil");
  const hasLeaf = summary.springSystems.has("leaf");
  const hasSpringless = summary.springSystems.has("springless");

  if (summary.name === "Springfree" && hasSpringless && !hasCoil && !hasLeaf) {
    return "Springfree uses flexible rods instead of springs";
  }
  if (summary.name === "Vuly" && hasCoil && hasLeaf) {
    return "Vuly offers both coil and leaf-spring models";
  }
  if (hasCoil && hasLeaf && hasSpringless) {
    return `${summary.name} offers coil, leaf-spring, and springless models`;
  }
  if (hasCoil && hasLeaf) {
    return `${summary.name} offers both coil and leaf-spring models`;
  }
  if (hasCoil && hasSpringless) {
    return `${summary.name} offers both coil and springless models`;
  }
  if (hasLeaf && hasSpringless) {
    return `${summary.name} offers both leaf-spring and springless models`;
  }
  if (hasSpringless) {
    return `${summary.name} uses a springless design`;
  }
  if (hasLeaf) {
    return `${summary.name} uses leaf springs`;
  }
  if (hasCoil) {
    return summary.name === "Jumpflex"
      ? "Jumpflex is coil only"
      : `${summary.name} uses coil springs`;
  }
  return `${summary.name} uses a different spring system`;
}

function setsDiffer<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return true;
  return [...a].some((value) => !b.has(value));
}

function buildSpringSystemTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  if (a.springSystems.size === 0 || b.springSystems.size === 0) return null;
  if (!setsDiffer(a.springSystems, b.springSystems)) return null;
  return `${describeSpringSystems(a)}; ${describeSpringSystems(b)}.`;
}

type ProductPick = { product: Product; price: number };

function shortModelName(product: Product): string {
  const pattern = new RegExp(`^${product.brand}\\s+`, "i");
  return product.model.replace(pattern, "").trim();
}

function isFullSizeProduct(product: Product): boolean {
  const footprint = productFootprintIn(product);
  return footprint !== null && footprint >= 120;
}

function buildComparableFullSizeEntry(summary: BrandTakeawaySummary): ProductPick | null {
  const candidates = summary.products
    .filter(isFullSizeProduct)
    .map((product) => {
      const price = productPrice(product);
      return price === null ? null : { product, price };
    })
    .filter((pick): pick is ProductPick => pick !== null)
    .sort((a, b) => a.price - b.price);

  return candidates[0] ?? null;
}

function buildPriceTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  const aEntry = buildComparableFullSizeEntry(a);
  const bEntry = buildComparableFullSizeEntry(b);
  if (!aEntry || !bEntry) return null;

  const lower = aEntry.price <= bEntry.price ? a : b;
  const higher = lower === a ? b : a;
  const lowerEntry = lower === a ? aEntry : bEntry;
  const higherEntry = higher === a ? aEntry : bEntry;
  const entryGap = higherEntry.price - lowerEntry.price;
  const entryGapIsMaterial =
    entryGap >= 200 || higherEntry.price / Math.max(lowerEntry.price, 1) >= 1.25;

  if (entryGapIsMaterial) {
    return `On comparable full-size models, ${lower.name} starts lower — ${shortModelName(lowerEntry.product)} at ${formatUsd(lowerEntry.price)} vs ${shortModelName(higherEntry.product)} at ${formatUsd(higherEntry.price)}.`;
  }

  if (a.prices.length === 0 || b.prices.length === 0) return null;
  const aMax = Math.max(...a.prices);
  const bMax = Math.max(...b.prices);
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

  if (
    a.warrantyRanges.frameWarrantyYears.distinctCount > 1 ||
    b.warrantyRanges.frameWarrantyYears.distinctCount > 1
  ) {
    return `${better.name}'s top-end frame warranty reaches ${formatWarrantyYears(betterYears)} vs ${formatWarrantyYears(otherYears)}; compare exact models because terms vary by line.`;
  }

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
    if (
      a.warrantyRanges[key].distinctCount > 1 ||
      b.warrantyRanges[key].distinctCount > 1
    ) {
      continue;
    }
    if (aYears > bYears) aWins.push(label);
    else bWins.push(label);
  }

  if (aWins.length < 2 && bWins.length < 2) return null;
  const better = aWins.length > bWins.length ? a : b;
  const winList = better === a ? aWins : bWins;
  const frameWinner =
    a.frameWarrantyYears !== null &&
    b.frameWarrantyYears !== null &&
    a.frameWarrantyYears !== b.frameWarrantyYears
      ? a.frameWarrantyYears > b.frameWarrantyYears
        ? a
        : b
      : null;

  if (frameWinner && frameWinner.name !== better.name) return null;

  const componentStr =
    winList.length === 1
      ? winList[0]
      : winList.slice(0, -1).join(", ") + " and " + winList[winList.length - 1];
  return `${better.name} has stronger component warranty coverage on the ${componentStr}.`;
}

function buildWeightTakeaway(a: BrandTakeawaySummary, b: BrandTakeawaySummary): string | null {
  const aWeightPick = pickMainstreamWeightProduct(a);
  const bWeightPick = pickMainstreamWeightProduct(b);

  if (aWeightPick !== null && bWeightPick !== null) {
    if (aWeightPick.weight === bWeightPick.weight) return null;
    const higher = aWeightPick.weight > bWeightPick.weight ? a : b;
    const lower = higher === a ? b : a;
    const higherPick = higher === a ? aWeightPick : bWeightPick;
    const lowerPick = lower === a ? aWeightPick : bWeightPick;
    const higherWeight = higherPick.weight;
    const lowerWeight = lowerPick.weight;
    if (higherWeight - lowerWeight >= 75 || higherWeight / Math.max(lowerWeight, 1) >= 1.25) {
      return `${higher.name} rates its ${shortModelName(higherPick.product)} to ${higherWeight} lb per jumper; ${lower.name} lists ${lowerWeight} lb on ${shortModelName(lowerPick.product)}.`;
    }
  }

  if (a.maxCombinedWeightLb === null || b.maxCombinedWeightLb === null) return null;
  if (a.maxCombinedWeightLb === b.maxCombinedWeightLb) return null;

  const higher = a.maxCombinedWeightLb > b.maxCombinedWeightLb ? a : b;
  const lower = higher === a ? b : a;
  const higherWeight = higher.maxCombinedWeightLb!;
  const lowerWeight = lower.maxCombinedWeightLb!;

  if (higherWeight - lowerWeight < 150 && higherWeight / Math.max(lowerWeight, 1) < 1.25) return null;
  return `${higher.name} lists a higher combined weight capacity: ${higherWeight} lb vs ${lowerWeight} lb.`;
}

function pickMainstreamWeightProduct(
  summary: BrandTakeawaySummary,
): { product: Product; weight: number } | null {
  const weightedProducts = summary.products
    .filter(isFullSizeProduct)
    .map((product) =>
      product.maxSingleUserWeightLb === null
        ? null
        : { product, weight: product.maxSingleUserWeightLb },
    )
    .filter((pick): pick is { product: Product; weight: number } => pick !== null);

  const mainstreamRounds = weightedProducts.filter(({ product }) => {
    const shape = normalizeShape(product.shape);
    const model = product.model.toLowerCase();
    return (
      shape === "round" &&
      !model.includes("olympic") &&
      !model.includes("premium") &&
      !model.includes("epic")
    );
  });

  const candidates = mainstreamRounds.length > 0 ? mainstreamRounds : weightedProducts;
  return [...candidates].sort((a, b) => b.weight - a.weight)[0] ?? null;
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
  return null;
}

export function buildCompareTakeaways(brandA: Brand, brandB: Brand): string[] {
  const a = summarizeBrand(brandA);
  const b = summarizeBrand(brandB);
  const priceTakeaway = buildPriceTakeaway(a, b);
  const nonPriceTakeaways = [
    buildSpringSystemTakeaway(a, b),
    buildWarrantyTakeaway(a, b),
    buildWeightTakeaway(a, b),
    buildShapeTakeaway(a, b),
    buildSizeTakeaway(a, b),
    buildComponentWarrantyTakeaway(a, b),
    buildStandardsTakeaway(a, b),
  ].filter((takeaway): takeaway is string => takeaway !== null);
  const takeaways = priceTakeaway
    ? [...nonPriceTakeaways.slice(0, 4), priceTakeaway]
    : nonPriceTakeaways.slice(0, 5);

  if (takeaways.length > 0) return takeaways;

  return [
    "The biggest differences are model-specific, so use the table below to compare the exact size, warranty, weight rating, and price rows for the models you are considering.",
  ];
}
