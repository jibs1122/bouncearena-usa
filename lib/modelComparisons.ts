import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
};

function getModelComparisonFiles(): string[] {
  if (!fs.existsSync(MODEL_COMPARISON_DIR)) return [];

  return fs
    .readdirSync(MODEL_COMPARISON_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function normalizeLabel(label: string): string {
  return label.trim();
}

function parseModelComparison(filename: string): ModelComparisonArticle | null {
  const fullPath = path.join(MODEL_COMPARISON_DIR, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as FrontmatterData;

  if (!data.slug || !data.title) return null;
  if (data.publish_status === "blocked_missing_data") return null;

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
      };
    })
    .filter((side): side is ModelComparisonSide => side !== null);

  return {
    comparisonId: data.comparison_id ?? 0,
    title: data.title,
    slug: data.slug,
    publishStatus: data.publish_status ?? "ready",
    metaTitle: data.seo?.meta_title ?? `${data.title} — Trampoline Comparison 2026`,
    metaDescription: data.seo?.meta_description ?? data.title,
    content: parsed.content.replace(/<br>/g, "<br />").trim(),
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
