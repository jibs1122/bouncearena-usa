import fs from "fs";
import path from "path";
import Papa from "papaparse";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CSV_PATH = path.join(PROJECT_ROOT, "data", "products-us.csv");
const SOURCE_DIR = process.env.MODEL_IMAGE_SOURCE_DIR
  ?? "/Users/scott/Projects/Image scraper/output/final";
const TARGET_DIR = path.join(PROJECT_ROOT, "public", "model-images");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "lib", "model-images.generated.json");
const REPORT_PATH = path.join(PROJECT_ROOT, "docs", "model-images-report.md");

const MANUAL_SOURCE_FILES = {
  "alleyoop-10-17-rectangle-trampoline-with-enclosure":
    "alleyoop-10-17-rectangle-trampoline-with-enclosure.jpg",
  "sportspower-bounce-pro-15-x-17ft-steelflex-pro-oval-trampoline":
    "sportspower-bounce-pro-15-x-17ft-steelflex-pro-oval-trampoline.jpg",
  "upper-bounce-upper-bounce-12-x-12-ft-square-trampoline-set-with-premium-top-ring-enclosure-system":
    "upper-bounce-upper-bounce-12-x-12-ft-square-trampoline-set-with-premium-top-ring-enclosure-system.jpg",
  "upper-bounce-upper-bounce-16-x-16-ft-square-trampoline-set-with-premium-top-ring-enclosure-system":
    "upper-bounce-upper-bounce-16-x-16-ft-square-trampoline-set-with-premium-top-ring-enclosure-system.jpg",
  "upper-bounce-upper-bounce-8-x-14-ft-gymnastics-style-rectangular-trampoline-set":
    "upper-bounce-upper-bounce-8-x-14-ft-gymnastics-style-rectangular-trampoline-set.jpg",
  "upper-bounce-upper-bounce-9-x-15-ft-gymnastics-style-rectangular-trampoline-set":
    "upper-bounce-upper-bounce-9-x-15-ft-gymnastics-style-rectangular-trampoline-set.jpg",
  "upper-bounce-upper-bounce-mega-10-x-17-ft-gymnastics-style-rectangular-trampoline-set":
    "upper-bounce-upper-bounce-mega-10-x-17-ft-gymnastics-style-rectangular-trampoline-set.jpg",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function modelId(brand, model) {
  return `${slugify(brand)}-${slugify(model)}`;
}

function canonicalizeForLookup(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00d7/g, "x")
    .replace(/\u2122/g, "tm")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/(?<=\d)\s*[x-]\s*(?=\d)/g, "")
    .replace(/(?<=\d)'(?=[a-z0-9])/gi, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readProducts() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const { data, errors } = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.map((error) => `Row ${error.row}: ${error.message}`).join("; "));
  }

  return data.filter((row) => row.Brand?.trim() && row.model?.trim());
}

function buildModelMap(rows) {
  const models = new Map();

  for (const row of rows) {
    const id = modelId(row.Brand, row.model);
    if (!models.has(id)) {
      models.set(id, {
        id,
        brand: row.Brand.trim(),
        model: row.model.trim(),
      });
    }
  }

  return models;
}

function buildSourceIndex() {
  const files = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const byCanonical = new Map();
  for (const filename of files) {
    const stem = path.parse(filename).name;
    byCanonical.set(canonicalizeForLookup(stem), filename);
  }

  return { files, byCanonical };
}

function findSourceFile(model, byCanonical) {
  const manual = MANUAL_SOURCE_FILES[model.id];
  if (manual) {
    return manual;
  }

  const lookupKey = canonicalizeForLookup(`${model.brand}-${model.model}`);
  return byCanonical.get(lookupKey) ?? null;
}

function writeManifest(manifest) {
  ensureDir(path.dirname(MANIFEST_PATH));
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function writeReport({
  sourceFileCount,
  catalogModelCount,
  importedCount,
  missingModels,
}) {
  ensureDir(path.dirname(REPORT_PATH));

  const coverage = catalogModelCount === 0
    ? "0.0"
    : ((importedCount / catalogModelCount) * 100).toFixed(1);

  const missingSection = missingModels.length === 0
    ? "- None\n"
    : missingModels
        .map((model) => `- \`${model.id}\` — ${model.brand} / ${model.model}`)
        .join("\n");

  const content = `# Model Images Import Report

## Summary
- Source directory: \`${SOURCE_DIR}\`
- Source image files found: ${sourceFileCount}
- Distinct catalog models in \`data/products-us.csv\`: ${catalogModelCount}
- Imported model images: ${importedCount}
- Catalog coverage: ${coverage}%
- Public asset directory: \`public/model-images/\`
- Generated manifest: \`lib/model-images.generated.json\`

## Missing Exact Images
${missingSection}

## Naming Strategy
- Imported assets are keyed by model id, not per-size product slug.
- File pattern: \`/model-images/<brand-slug>-<model-slug>.<ext>\`
- This matches the app's existing grouped-by-model surfaces better than per-variant naming.

## Recommended Integration Order
1. Quiz results: add the model image to \`app/results/ResultsClient.tsx\` result cards. This is the highest-value placement because the user is already evaluating 1 to 3 recommended models.
2. Models browser: add a compact thumbnail column or media tile to \`app/models/BrowseClient.tsx\` so the browse grid becomes more scan-friendly without requiring detail expansion.
3. Compare browser: add the same thumbnail treatment to \`app/compare/CompareClient.tsx\` for consistency with the models browser.
4. Brand pages: add a lightweight featured-model strip above the spec table instead of forcing images into the wide comparison table itself.

## Modern Web App Guidance
- Use \`next/image\` with fixed aspect-ratio wrappers so card heights stay stable and CLS stays low.
- Prefer lazy loading by default. Only set \`priority\` for one above-the-fold image on a page.
- Pass a realistic \`sizes\` prop so mobile does not download desktop-sized assets.
- Keep model images out of dense data tables. Use them in card/list surfaces where recognition helps decision-making.
- Treat the generated manifest as the source of truth so missing images fail gracefully instead of producing broken URLs.
- If this library grows or you regenerate often, keep the canonical import script and manifest rather than hand-managing filenames in components.
`;

  fs.writeFileSync(REPORT_PATH, content);
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

  const rows = readProducts();
  const models = buildModelMap(rows);
  const { files, byCanonical } = buildSourceIndex();

  ensureDir(TARGET_DIR);

  const existingFiles = fs.readdirSync(TARGET_DIR);
  for (const filename of existingFiles) {
    fs.rmSync(path.join(TARGET_DIR, filename), { force: true });
  }

  const manifest = {};
  const missingModels = [];

  for (const model of models.values()) {
    const sourceFilename = findSourceFile(model, byCanonical);

    if (!sourceFilename) {
      missingModels.push(model);
      continue;
    }

    const ext = path.extname(sourceFilename).toLowerCase();
    const targetFilename = `${model.id}${ext}`;
    const sourcePath = path.join(SOURCE_DIR, sourceFilename);
    const targetPath = path.join(TARGET_DIR, targetFilename);

    fs.copyFileSync(sourcePath, targetPath);
    manifest[model.id] = {
      src: `/model-images/${targetFilename}`,
      sourceFile: sourceFilename,
    };
  }

  writeManifest(manifest);
  writeReport({
    sourceFileCount: files.length,
    catalogModelCount: models.size,
    importedCount: Object.keys(manifest).length,
    missingModels,
  });

  console.log(`Imported ${Object.keys(manifest).length} model images into ${TARGET_DIR}`);
  console.log(`Missing exact images for ${missingModels.length} catalog models`);
}

main();
