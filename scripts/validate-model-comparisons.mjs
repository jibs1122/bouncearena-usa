import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import Papa from "papaparse";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.join(scriptDir, "..");
const csvPath = path.join(projectDir, "data", "products-us.csv");
const comparisonsDir = path.join(
  projectDir,
  "blog articles",
  "new model comparison articles",
);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitReference(value) {
  const match = String(value).trim().match(/^(.*?)(?:\s+\(([^()]*)\))?$/);
  return {
    identity: normalize(match?.[1] ?? value),
    size: match?.[2] ? normalize(match[2]) : null,
  };
}

function matchesReference(product, reference) {
  const expected = splitReference(reference);
  const brandAndModel = normalize(`${product.Brand} ${product.model}`);
  const modelOnly = normalize(product.model);
  const sizeMatches = expected.size === null || expected.size === normalize(product.size);

  return sizeMatches
    && (expected.identity === brandAndModel || expected.identity === modelOnly);
}

const products = Papa.parse(fs.readFileSync(csvPath, "utf8"), {
  header: true,
  skipEmptyLines: true,
}).data;
const files = fs.readdirSync(comparisonsDir).filter((file) => file.endsWith(".md")).sort();
const errors = [];
let articleCount = 0;
let sideCount = 0;
let referenceCount = 0;

for (const file of files) {
  const parsed = matter(fs.readFileSync(path.join(comparisonsDir, file), "utf8"));
  if ((parsed.data.publish_status ?? "ready") !== "ready") continue;
  articleCount += 1;

  const sides = parsed.data.sides ?? [];
  if (sides.length < 2) errors.push(`${file}: expected at least two comparison sides`);

  for (const side of sides) {
    sideCount += 1;
    const references = side.matched_models ?? [];
    if (references.length === 0) {
      errors.push(`${file}: ${side.label ?? "unlabelled side"} has no matched_models references`);
      continue;
    }

    for (const reference of references) {
      referenceCount += 1;
      const matches = products.filter((product) => matchesReference(product, reference));
      if (matches.length !== 1) {
        errors.push(
          `${file}: ${JSON.stringify(reference)} resolved to ${matches.length} catalogue products`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Model comparison validation failed:");
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log(
  `Model comparison validation passed: ${articleCount} articles, ${sideCount} sides, ${referenceCount} product references`,
);
