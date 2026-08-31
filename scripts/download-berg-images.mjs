import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CSV_PATH = path.join(PROJECT_ROOT, "data", "products-us.csv");
const IMAGE_DIR = path.join(PROJECT_ROOT, "public", "model-images");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "lib", "model-images.generated.json");
const REPORT_PATH = path.join(PROJECT_ROOT, "docs", "berg-model-images-report.md");
const CONCURRENCY = 5;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
  + "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function modelId(brand, model) {
  return `${slugify(brand)}-${slugify(model)}`;
}

function parseSourceUrls(value) {
  return String(value ?? "")
    .split(/\s*\|\s*|\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function isOfficialProductPage(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    if (hostname !== "www.berg.com" && hostname !== "berg.com") return false;
    if (!pathname.startsWith("/int_en/")) return false;

    return ![
      "/int_en/trampolines",
      "/int_en/information/",
      "/int_en/trampoline-buying-guide",
      "/int_en/product-registration",
    ].some((excluded) => pathname === excluded || pathname.startsWith(excluded));
  } catch {
    return false;
  }
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
}

function getOpenGraphImage(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const property = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (property !== "og:image" && property !== "og:image:secure_url") continue;
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) return decodeHtmlEntities(content);
  }

  return null;
}

function extensionForContentType(contentType) {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/png") return ".png";
  if (normalized === "image/avif") return ".avif";
  if (normalized === "image/jpeg" || normalized === "image/jpg") return ".jpg";
  return null;
}

async function fetchWithRetry(url, responseType, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: responseType === "html" ? "text/html" : "image/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    }
  }

  throw lastError;
}

function readBergModels() {
  const parsed = Papa.parse(fs.readFileSync(CSV_PATH, "utf8"), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }

  const models = new Map();
  for (const row of parsed.data) {
    if (row.Brand?.trim().toUpperCase() !== "BERG" || !row.model?.trim()) continue;
    const id = modelId(row.Brand, row.model);
    if (models.has(id)) continue;

    models.set(id, {
      id,
      brand: row.Brand.trim(),
      model: row.model.trim(),
      productPages: parseSourceUrls(row.source_urls).filter(isOfficialProductPage),
    });
  }

  return Array.from(models.values());
}

async function downloadModelImage(model) {
  let lastError = new Error("No official BERG product page found in source_urls");

  for (const pageUrl of model.productPages) {
    try {
      const pageResponse = await fetchWithRetry(pageUrl, "html");
      const imageUrl = getOpenGraphImage(await pageResponse.text());
      if (!imageUrl) throw new Error("Missing og:image metadata");

      const imageResponse = await fetchWithRetry(imageUrl, "image");
      const contentType = imageResponse.headers.get("content-type") ?? "";
      const extension = extensionForContentType(contentType);
      if (!extension) throw new Error(`Unsupported image content type: ${contentType || "unknown"}`);

      const filename = `${model.id}${extension}`;
      const finalPath = path.join(IMAGE_DIR, filename);
      const tempPath = `${finalPath}.tmp`;
      fs.writeFileSync(tempPath, Buffer.from(await imageResponse.arrayBuffer()));
      fs.renameSync(tempPath, finalPath);

      return {
        id: model.id,
        model: model.model,
        pageUrl,
        imageUrl,
        filename,
        bytes: fs.statSync(finalPath).size,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`${model.model}: ${lastError.message}`);
}

async function mapWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { status: "fulfilled", value: await worker(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

function writeReport(downloads, failures) {
  const totalBytes = downloads.reduce((sum, download) => sum + download.bytes, 0);
  const lines = [
    "# BERG Model Images Report",
    "",
    "## Summary",
    `- BERG catalog models: ${downloads.length + failures.length}`,
    `- Official product images imported: ${downloads.length}`,
    `- Missing images: ${failures.length}`,
    `- Downloaded size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`,
    "- Source: official BERG product-page `og:image` metadata",
    "",
    "## Imported Images",
    ...downloads.map(
      (download) => `- \`${download.id}\` — [product page](${download.pageUrl}) — \`${download.filename}\``,
    ),
    "",
    "## Missing Images",
    ...(failures.length > 0
      ? failures.map((failure) => `- \`${failure.id}\` — ${failure.message}`)
      : ["- None"]),
    "",
  ];

  fs.writeFileSync(REPORT_PATH, lines.join("\n"));
}

async function main() {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  const models = readBergModels();
  const results = await mapWithConcurrency(models, downloadModelImage, CONCURRENCY);
  const downloads = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  const failures = results
    .map((result, index) => ({ result, model: models[index] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ result, model }) => ({
      id: model.id,
      message: result.reason instanceof Error ? result.reason.message : String(result.reason),
    }));

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  for (const key of Object.keys(manifest)) {
    if (key.startsWith("berg-")) delete manifest[key];
  }
  for (const download of downloads) {
    manifest[download.id] = {
      src: `/model-images/${download.filename}`,
      sourceFile: download.imageUrl,
    };
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  writeReport(downloads, failures);

  console.log(`Imported ${downloads.length}/${models.length} BERG model images.`);
  for (const failure of failures) console.error(`Missing ${failure.id}: ${failure.message}`);
  if (failures.length > 0) process.exitCode = 1;
}

await main();
