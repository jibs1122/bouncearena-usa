const BRAND_PREFIXES = [
  "ACON",
  "Springfree",
  "Vuly",
  "Zupapa",
  "Jumpflex",
  "Skywalker",
  "Akrobat",
  "Avyna",
  "North",
  "MaxAir",
  "AlleyOOP",
  "JumpKing",
  "JUMPZYLLA",
  "Upper Bounce",
  "Texas Trampolines",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function removeDuplicateReview(text: string) {
  return text.replace(/\bReview\s+Review\b/gi, "Review");
}

export function cleanDuplicateBrandPrefixes(text: string) {
  let cleaned = text.trim();

  for (const brand of BRAND_PREFIXES) {
    const escaped = escapeRegExp(brand);
    cleaned = cleaned.replace(new RegExp(`\\b(${escaped})\\s+\\1\\b`, "gi"), "$1");
  }

  return removeDuplicateReview(cleaned).replace(/[^\S\r\n]{2,}/g, " ").trim();
}

export function modelNameWithoutBrandPrefix(brand: string, model: string) {
  const escapedBrand = escapeRegExp(brand.trim());
  if (!escapedBrand) return cleanDuplicateBrandPrefixes(model);

  return cleanDuplicateBrandPrefixes(
    model.replace(new RegExp(`^${escapedBrand}\\s+`, "i"), ""),
  );
}

export function formatBrandModelName(brand: string, model: string) {
  const cleanedModel = cleanDuplicateBrandPrefixes(model);
  const escapedBrand = escapeRegExp(brand.trim());

  if (!escapedBrand || new RegExp(`^${escapedBrand}\\b`, "i").test(cleanedModel)) {
    return cleanedModel;
  }

  return `${brand} ${cleanedModel}`.replace(/\s{2,}/g, " ").trim();
}
