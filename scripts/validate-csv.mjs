import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(scriptDir, "..", "data", "products-us.csv");

const requiredHeaders = [
  "Brand",
  "model",
  "size",
  "shape",
  "max_diameter_in",
  "overall_length_in",
  "overall_width_in",
  "spring_system",
  "max_single_user_weight_lb",
  "meets_us_standard",
  "price_usd",
  "source_urls",
  "notes",
];

const requiredRowFields = ["Brand", "model"];

function fail(messages) {
  for (const message of messages) {
    console.error(message);
  }
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  fail([`CSV file not found: ${csvPath}`]);
}

const raw = fs.readFileSync(csvPath, "utf8");
const parsed = Papa.parse(raw, {
  header: true,
  skipEmptyLines: true,
});

const errors = parsed.errors.map((error) => {
  const row = typeof error.row === "number" ? `Row ${error.row + 2}` : "CSV";
  return `${row}: ${error.message}`;
});

const headers = parsed.meta.fields ?? [];
for (const header of requiredHeaders) {
  if (!headers.includes(header)) {
    errors.push(`Missing required header: ${header}`);
  }
}

parsed.data.forEach((row, index) => {
  const lineNumber = index + 2;

  for (const field of requiredRowFields) {
    if (typeof row[field] !== "string" || row[field].trim() === "") {
      errors.push(`Row ${lineNumber}: missing required field "${field}"`);
    }
  }

  const sourceUrls = typeof row.source_urls === "string" ? row.source_urls.trim() : "";
  if (sourceUrls) {
    const urls = sourceUrls.split(/\s*[|,]\s*|\n/).filter(Boolean);
    for (const url of urls) {
      try {
        const parsedUrl = new URL(url);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          errors.push(`Row ${lineNumber}: source_urls must use http(s): ${url}`);
        }
      } catch {
        errors.push(`Row ${lineNumber}: invalid source_urls value: ${url}`);
      }
    }
  }
});

if (errors.length > 0) {
  fail([`CSV validation failed for ${path.relative(process.cwd(), csvPath)}:`, ...errors]);
}

console.log(`CSV validation passed: ${parsed.data.length} rows`);
