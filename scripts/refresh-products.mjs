import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1CLjH67Sf9o2diBMUwiG9zmkhs47N90GmL4LxQ6TYsZk/gviz/tq?tqx=out:csv&sheet=USA';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'data', 'products-us.csv');

async function main() {
  console.log(`Fetching CSV from Google Sheets…`);
  console.log(`URL: ${SHEETS_URL}`);

  let res;
  try {
    res = await fetch(SHEETS_URL);
  } catch (err) {
    console.error('Network error fetching CSV:', err.message);
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText} — fetch failed`);
    process.exit(1);
  }

  const csv = await res.text();

  if (!csv || csv.trim().length === 0) {
    console.error('Received empty CSV — aborting (existing file untouched)');
    process.exit(1);
  }

  try {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, csv, 'utf8');
  } catch (err) {
    console.error('Failed to write CSV:', err.message);
    process.exit(1);
  }

  const lineCount = csv.split('\n').filter(Boolean).length;
  console.log(`✓ Saved ${lineCount} lines to ${OUT_PATH}`);
}

main();
