import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { Product, Brand, GroundType, SafetyNetAvailability } from "./types";
import { parseWarrantyYears } from "./warranty";

// Keep the CSV path statically scoped so Next/Vercel can trace it into production.
const CSV_PATH = path.join(process.cwd(), "data", "products-us.csv");
const EXCLUDED_BRANDS = new Set(["JumpSport"]);

type ProductCache = {
  version: number;
  products: Product[];
};

function parseNum(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function parseBool(val: string): boolean | null {
  if (!val || val.trim() === "") return null;
  const v = val.trim().toLowerCase();
  if (v === "yes" || v === "true" || v === "1") return true;
  if (v === "no" || v === "false" || v === "0") return false;
  return null;
}

function parseUrls(val: string): string[] {
  if (!val || val.trim() === "") return [];
  return val
    .split(/\s*[|,]\s*|\n/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http"));
}

function parseGroundType(val: string): GroundType {
  const normalized = (val ?? "").trim().toLowerCase();
  if (!normalized) return "above-ground";
  if (normalized.includes("both")) return "both";
  if (normalized.includes("in") && normalized.includes("ground")) return "in-ground";
  if (normalized.includes("above") && normalized.includes("ground")) return "above-ground";
  if (normalized.includes("inground")) return "in-ground";
  if (normalized.includes("aboveground")) return "above-ground";
  return "above-ground";
}

function parseSafetyNetAvailability(val: string): SafetyNetAvailability {
  const normalized = (val ?? "").trim().toLowerCase();
  if (!normalized) return "unknown";
  if (normalized === "yes" || normalized === "true" || normalized === "included") return "yes";
  if (normalized === "no" || normalized === "false" || normalized === "none") return "no";
  if (normalized === "optional" || normalized === "either" || normalized.includes("optional")) {
    return "optional";
  }
  return "unknown";
}

function parsePriceFields(row: Record<string, string>) {
  const priceBasis = (row["price_basis"] ?? "").trim();
  const legacyExact = parseNum(row["exact_size_price_usd"]);
  const legacyModelFrom = parseNum(row["model_from_price_usd"]);
  const unifiedPrice = parseNum(row["price_usd"]);

  if (legacyExact !== null || legacyModelFrom !== null) {
    return {
      exactSizePriceUsd: legacyExact,
      modelFromPriceUsd: legacyModelFrom,
      priceBasis,
    };
  }

  if (unifiedPrice === null) {
    return {
      exactSizePriceUsd: null,
      modelFromPriceUsd: null,
      priceBasis,
    };
  }

  const basis = priceBasis.toLowerCase();
  const isExactSizePrice = basis.includes("exact");

  return {
    exactSizePriceUsd: isExactSizePrice ? unifiedPrice : null,
    modelFromPriceUsd: isExactSizePrice ? null : unifiedPrice,
    priceBasis,
  };
}

export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function productSlug(brand: string, model: string, size: string): string {
  return `${brandSlug(brand)}-${brandSlug(model)}-${brandSlug(size)}`;
}

function rowToProduct(row: Record<string, string>): Product {
  const priceFields = parsePriceFields(row);

  return {
    brand: (row["Brand"] ?? "").trim(),
    model: (row["model"] ?? row["Model"] ?? "").trim(),
    size: (row["size"] ?? row["Size"] ?? "").trim(),
    shape: (row["shape"] ?? row["Shape"] ?? "").trim(),
    groundType: parseGroundType(row["ground_type"] ?? ""),
    safetyNet: parseSafetyNetAvailability(row["safety_net"] ?? ""),
    maxDiameterIn: parseNum(row["max_diameter_in"]),
    overallLengthIn: parseNum(row["overall_length_in"]),
    overallWidthIn: parseNum(row["overall_width_in"]),
    matFrameHeightIn: parseNum(row["mat_frame_height_in"]),
    safetyNetHeightIn: parseNum(row["safety_net_height_in"]),
    totalHeightIn: parseNum(row["total_height_in"]),
    frameTubeDiameterIn: parseNum(row["frame_tube_diameter_in"]),
    springSystem: (row["spring_system"] ?? "").trim(),
    springCount: parseNum(row["spring_count"]),
    springLengthIn: parseNum(row["spring_length_in"]),
    maxSingleUserWeightLb: parseNum(row["max_single_user_weight_lb"]),
    combinedTotalWeightRatingLb: parseNum(row["combined_total_weight_rating_lb"]),
    staticWeightRatingLb: parseNum(row["static_weight_rating_lb"]),
    countryMadeIn: (row["country_made_in"] ?? "").trim(),
    frameMaterial: (row["frame_material"] ?? "").trim(),
    matMaterial: (row["mat_material"] ?? "").trim(),
    netMaterial: (row["net_material"] ?? "").trim(),
    paddingMaterial: (row["padding_material"] ?? "").trim(),
    warrantyFrameYears: parseWarrantyYears(row["warranty_frame_years"] ?? row["warranty years frame"]),
    warrantyMatYears: parseWarrantyYears(row["warranty_mat_years"] ?? row["warranty years mat"]),
    warrantySpringsYears: parseWarrantyYears(row["warranty_springs_years"] ?? row["warranty years springs"]),
    warrantyNetYears: parseWarrantyYears(row["warranty_net_years"] ?? row["warranty years net"]),
    warrantyPadsYears: parseWarrantyYears(row["warranty_pads_years"] ?? row["warranty years pads"]),
    warrantyPartsYears: parseWarrantyYears(row["warranty_parts_years"] ?? row["warranty years parts"]),
    meetsUsStandard: parseBool(row["meets_us_standard"]),
    usStandardDetails: (row["us_standard_details"] ?? "").trim(),
    otherStandards: (row["other_standards"] ?? "").trim(),
    exactSizePriceUsd: priceFields.exactSizePriceUsd,
    modelFromPriceUsd: priceFields.modelFromPriceUsd,
    priceBasis: priceFields.priceBasis,
    sourceUrls: parseUrls(row["source_urls"]),
    notes: (row["notes"] ?? "").trim(),
    slug: productSlug(
      row["Brand"] ?? "",
      row["model"] ?? row["Model"] ?? "",
      row["size"] ?? row["Size"] ?? ""
    ),
  };
}

let _cache: ProductCache | null = null;

function getProductsFileVersion(): number {
  if (!fs.existsSync(CSV_PATH)) return 0;
  return fs.statSync(CSV_PATH).mtimeMs;
}

export function getProductsDataVersion(): number {
  return getProductsFileVersion();
}

export function getAllProducts(): Product[] {
  if (!fs.existsSync(CSV_PATH)) {
    return [];
  }

  const version = getProductsFileVersion();
  if (_cache && _cache.version === version) {
    return _cache.products;
  }

  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const { data, errors } = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    const msg = errors.map((e) => `Row ${e.row}: ${e.message}`).join("; ");
    throw new Error(`CSV parse errors in products-us.csv: ${msg}`);
  }

  const products = data
    .filter((row) => row["Brand"]?.trim())
    .map(rowToProduct);

  // Silently drop rows missing required fields
  const validProducts = products.filter(
    (p) => p.brand && p.model && !EXCLUDED_BRANDS.has(p.brand)
  );
  _cache = {
    version,
    products: validProducts,
  };
  return validProducts;
}

export function getAllBrands(): Brand[] {
  const products = getAllProducts();
  const map = new Map<string, Brand>();

  for (const p of products) {
    const slug = brandSlug(p.brand);
    if (!map.has(slug)) {
      map.set(slug, {
        name: p.brand,
        slug,
        products: [],
        fromPriceUsd: null,
        sourceUrl: null,
      });
    }
    const brand = map.get(slug)!;
    brand.products.push(p);

    const price = p.exactSizePriceUsd ?? p.modelFromPriceUsd;
    if (price !== null && (brand.fromPriceUsd === null || price < brand.fromPriceUsd)) {
      brand.fromPriceUsd = price;
    }

    if (!brand.sourceUrl && p.sourceUrls.length > 0) {
      brand.sourceUrl = p.sourceUrls[0];
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getBrand(slug: string): Brand | undefined {
  return getAllBrands().find((b) => b.slug === slug);
}

export function getTopBrandPairs(count = 6): Array<[Brand, Brand]> {
  const brands = getAllBrands()
    .sort((a, b) => b.products.length - a.products.length)
    .slice(0, 6);

  const pairs: Array<[Brand, Brand]> = [];
  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      pairs.push([brands[i], brands[j]]);
    }
  }

  return pairs
    .sort(
      (a, b) =>
        b[0].products.length + b[1].products.length - (a[0].products.length + a[1].products.length)
    )
    .slice(0, count);
}
