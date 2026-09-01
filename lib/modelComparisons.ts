import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { cleanDuplicateBrandPrefixes, removeDuplicateReview } from "@/lib/displayText";
import type { Product } from "@/lib/types";

const MODEL_COMPARISON_DIR = path.join(
  process.cwd(),
  "blog articles",
  "new model comparison articles",
);

export type ModelComparisonArticle = {
  comparisonId: number;
  title: string;
  slug: string;
  publishStatus: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  labels: string[];
  sides: ModelComparisonSide[];
};

type FrontmatterSide = {
  label?: string;
  row_indices?: number[];
  matched_models?: string[];
};

type FrontmatterData = {
  comparison_id?: number;
  title?: string;
  slug?: string;
  publish_status?: string;
  seo?: {
    meta_title?: string;
    meta_description?: string;
  };
  sides?: FrontmatterSide[];
};

export type ModelComparisonSide = {
  label: string;
  rowIndices: number[];
  matchedModels: string[];
};

function normalizeProductIdentity(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitMatchedModel(value: string): { identity: string; size: string | null } {
  const match = value.trim().match(/^(.*?)(?:\s+\(([^()]*)\))?$/);

  return {
    identity: normalizeProductIdentity(match?.[1] ?? value),
    size: match?.[2] ? normalizeProductIdentity(match[2]) : null,
  };
}

function productMatchesReference(product: Product, reference: string): boolean {
  const expected = splitMatchedModel(reference);
  const brandAndModel = normalizeProductIdentity(`${product.brand} ${product.model}`);
  const modelOnly = normalizeProductIdentity(product.model);
  const sizeMatches = expected.size === null
    || expected.size === normalizeProductIdentity(product.size);

  return sizeMatches
    && (expected.identity === brandAndModel || expected.identity === modelOnly);
}

/**
 * Resolve a comparison side by stable product identity rather than CSV position.
 * `row_indices` are retained only as a compatibility fallback for older articles
 * without `matched_models`; CSV rows can move whenever the catalogue is refreshed.
 */
export function resolveModelComparisonSideProducts(
  side: ModelComparisonSide,
  products: Product[],
): Product[] {
  if (side.matchedModels.length > 0) {
    const resolved = new Map<number, Product>();

    for (const reference of side.matchedModels) {
      const product = products.find((candidate) => productMatchesReference(candidate, reference));
      if (product) resolved.set(product.sourceRowIndex, product);
    }

    return Array.from(resolved.values());
  }

  const productsBySourceRow = new Map(
    products.map((product) => [product.sourceRowIndex, product]),
  );

  return side.rowIndices
    .map((rowIndex) => productsBySourceRow.get(rowIndex))
    .filter((product): product is Product => Boolean(product));
}

export function resolveModelComparisonProducts(
  article: ModelComparisonArticle,
  products: Product[],
): Product[] {
  const resolved = new Map<number, Product>();

  for (const side of article.sides) {
    for (const product of resolveModelComparisonSideProducts(side, products)) {
      resolved.set(product.sourceRowIndex, product);
    }
  }

  return Array.from(resolved.values());
}

function getModelComparisonFiles(): string[] {
  if (!fs.existsSync(MODEL_COMPARISON_DIR)) return [];

  return fs
    .readdirSync(MODEL_COMPARISON_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function normalizeLabel(label: string): string {
  return cleanDuplicateBrandPrefixes(label);
}

function parseModelComparison(filename: string): ModelComparisonArticle | null {
  const fullPath = path.join(MODEL_COMPARISON_DIR, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as FrontmatterData;

  if (!data.slug || !data.title) return null;
  const publishStatus = data.publish_status ?? "ready";
  if (publishStatus !== "ready") return null;

  const labels = (data.sides ?? [])
    .map((side) => side.label)
    .filter((label): label is string => Boolean(label))
    .map(normalizeLabel);
  const sides = (data.sides ?? [])
    .map((side): ModelComparisonSide | null => {
      if (!side.label) return null;

      return {
        label: normalizeLabel(side.label),
        rowIndices: (side.row_indices ?? []).filter((index) => Number.isInteger(index)),
        matchedModels: (side.matched_models ?? []).filter(
          (model): model is string => typeof model === "string" && model.trim().length > 0,
        ),
      };
    })
    .filter((side): side is ModelComparisonSide => side !== null);

  return {
    comparisonId: data.comparison_id ?? 0,
    title: removeDuplicateReview(cleanDuplicateBrandPrefixes(data.title)),
    slug: data.slug,
    publishStatus,
    metaTitle: removeDuplicateReview(
      cleanDuplicateBrandPrefixes(data.seo?.meta_title ?? `${data.title} — Trampoline Comparison 2026`),
    ),
    metaDescription: data.seo?.meta_description ?? data.title,
    content: cleanDuplicateBrandPrefixes(parsed.content.replace(/<br>/g, "<br />")).trim(),
    labels,
    sides,
  };
}

export function getApprovedModelComparisons(): ModelComparisonArticle[] {
  return getModelComparisonFiles()
    .map(parseModelComparison)
    .filter((article): article is ModelComparisonArticle => article !== null);
}

export function getApprovedModelComparison(slug: string): ModelComparisonArticle | undefined {
  return getApprovedModelComparisons().find((article) => article.slug === slug);
}
