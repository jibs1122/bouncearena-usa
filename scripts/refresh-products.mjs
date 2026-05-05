import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const SHEET_ID = '1CLjH67Sf9o2diBMUwiG9zmkhs47N90GmL4LxQ6TYsZk';
const SHEET_NAME = 'USA';
export const SHEETS_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

const REQUIRED_COLUMNS = [
  'Brand',
  'model',
  'size',
  'shape',
  'ground_type',
  'warranty_frame_years',
  'price_usd',
  'source_urls',
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'data', 'products-us.csv');

async function main() {
  console.log(`Fetching workbook from Google Sheets…`);
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

  const workbookBuffer = Buffer.from(await res.arrayBuffer());

  let workbook;
  try {
    workbook = XLSX.read(workbookBuffer, { type: 'buffer' });
  } catch (err) {
    console.error('Failed to parse workbook:', err.message);
    process.exit(1);
  }

  const worksheet = workbook.Sheets[SHEET_NAME];
  if (!worksheet) {
    console.error(
      `Worksheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`
    );
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  });

  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(`Worksheet "${SHEET_NAME}" is empty — aborting (existing file untouched)`);
    process.exit(1);
  }

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !(col in rows[0]));
  if (missingColumns.length > 0) {
    console.error(
      `Worksheet "${SHEET_NAME}" is missing required columns: ${missingColumns.join(', ')}`
    );
    process.exit(1);
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet, {
    FS: ',',
    RS: '\n',
    blankrows: false,
  });

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
  console.log(`✓ Saved ${lineCount} lines from "${SHEET_NAME}" to ${OUT_PATH}`);
}

main();
