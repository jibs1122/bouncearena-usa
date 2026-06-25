import { getAllProducts } from "@/lib/products";
import { getModelImage, getModelImageId } from "@/lib/modelImages";
import { formatBrandModelName } from "@/lib/displayText";

type BlogModelImage = {
  src: string;
  alt: string;
  brand: string;
  model: string;
};

type Candidate = {
  brand: string;
  model: string;
  tokens: Set<string>;
  brandTokens: Set<string>;
  image: NonNullable<ReturnType<typeof getModelImage>>;
};

const STOP_WORDS = new Set([
  "a",
  "and",
  "above",
  "best",
  "enclosure",
  "for",
  "ground",
  "in",
  "model",
  "models",
  "net",
  "premium",
  "safety",
  "standard",
  "the",
  "trampoline",
  "trampolines",
  "with",
]);

function normalizeToken(token: string): string {
  if (token === "rectangular") return "rectangle";
  if (token === "inground") return "in-ground";
  return token;
}

function tokenize(value: string): Set<string> {
  const normalized = value
    .normalize("NFKD")
    .replace(/[’']/g, "ft")
    .replace(/×/g, "x")
    .replace(/™/g, "tm")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase();
  const tokens = new Set<string>();
  const rawTokens = normalized.match(/[a-z0-9]+/g) ?? [];

  for (const rawToken of rawTokens) {
    const token = normalizeToken(rawToken);
    if (!token || STOP_WORDS.has(token)) continue;

    tokens.add(token);

    const feetMatch = token.match(/^(\d+)ft$/);
    if (feetMatch) tokens.add(feetMatch[1]);

    const dimensionMatch = token.match(/^(\d+)x(\d+)(?:ft)?$/);
    if (dimensionMatch) {
      tokens.add(dimensionMatch[1]);
      tokens.add(dimensionMatch[2]);
      tokens.add(`${dimensionMatch[1]}x${dimensionMatch[2]}`);
    }
  }

  return tokens;
}

function cleanHeading(title: string): string {
  return title.replace(/^\s*\d+\.\s+/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function getCandidates(): Candidate[] {
  const grouped = new Map<string, { brand: string; model: string; text: string[] }>();

  for (const product of getAllProducts()) {
    const id = getModelImageId(product.brand, product.model);
    const image = getModelImage(product.brand, product.model);
    if (!image) continue;

    if (!grouped.has(id)) {
      grouped.set(id, {
        brand: product.brand,
        model: product.model,
        text: [product.brand, product.model],
      });
    }

    grouped.get(id)!.text.push(product.size, product.shape, product.springSystem);
  }

  return Array.from(grouped.values()).map((candidate) => {
    const image = getModelImage(candidate.brand, candidate.model);
    return {
      brand: candidate.brand,
      model: candidate.model,
      tokens: tokenize(candidate.text.join(" ")),
      brandTokens: tokenize(candidate.brand),
      image: image!,
    };
  });
}

let candidateCache: Candidate[] | null = null;
let brandTokenCache: Set<string> | null = null;

function getCachedCandidates(): Candidate[] {
  candidateCache ??= getCandidates();
  return candidateCache;
}

function getBrandTokens(): Set<string> {
  if (brandTokenCache) return brandTokenCache;

  brandTokenCache = new Set<string>();
  for (const candidate of getCachedCandidates()) {
    for (const token of candidate.brandTokens) {
      brandTokenCache.add(token);
    }
  }

  return brandTokenCache;
}

function scoreCandidate(headingTokens: Set<string>, candidate: Candidate): number {
  let overlap = 0;
  for (const token of headingTokens) {
    if (candidate.tokens.has(token)) overlap += 1;
  }

  if (overlap < 2) return 0;

  const headingBrandTokens = Array.from(headingTokens).filter((token) =>
    getBrandTokens().has(token),
  );
  if (
    headingBrandTokens.length > 0 &&
    !headingBrandTokens.some((token) => candidate.brandTokens.has(token))
  ) {
    return 0;
  }

  return overlap / headingTokens.size + overlap * 0.08;
}

export function resolveBlogModelImage(title: string): BlogModelImage | null {
  const heading = cleanHeading(title);
  const headingTokens = tokenize(heading);
  if (headingTokens.size === 0) return null;

  const best = getCachedCandidates()
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(headingTokens, candidate),
    }))
    .filter((item) => item.score >= 0.45)
    .sort((a, b) => b.score - a.score)[0];

  if (!best) return null;

  return {
    src: best.candidate.image.src,
    alt: formatBrandModelName(best.candidate.brand, best.candidate.model),
    brand: best.candidate.brand,
    model: best.candidate.model,
  };
}
