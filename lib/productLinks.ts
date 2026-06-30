import { BRAND_SHOP_URLS } from "@/lib/brandLogos";

const ACON_AFFILIATE_PARAM = "sca_ref";
const ACON_AFFILIATE_REF = "11261719.jjbGKHHa7yLAnuwn";
const ZUPAPA_AFFILIATE_PARAM = "ref";
const ZUPAPA_AFFILIATE_REF = "bltzjtnf";
const AMAZON_AFFILIATE_PARAM = "tag";
const AMAZON_AFFILIATE_TAG = "bounce092-20";
const PREFER_BRAND_FALLBACK = new Set(["JUMPZYLLA", "Springfree", "Skywalker", "Jumpflex", "ORCC"]);
const ZUPAPA_AMAZON_STORE_URL =
  "https://www.amazon.com/stores/Zupapa/page/A4397CF9-9F64-4B86-9113-1C34215A1A86";
const ZUPAPA_AMAZON_RECTANGULAR_URL =
  "https://www.amazon.com/Zupapa-Trampoline-Gymnastics-Trampolines-Rectangular/dp/B0D868MDHQ";
const ZUPAPA_AMAZON_ROUND_URL =
  "https://www.amazon.com/Zupapa-Trampoline-Trampolines-Enclosure-Trampolin/dp/B0DFXYMNN9";
const ZUPAPA_AMAZON_SQUARE_14_URL =
  "https://www.amazon.com/Zupapa-Rectangle-Trampoline-Capacity-Assurance/dp/B0GWM28YT4";

type ProductLinkLike = {
  brand: string;
  model?: string;
  size?: string;
  shape?: string;
  sourceUrls: string[];
  exactSizePriceUsd?: number | null;
  modelFromPriceUsd?: number | null;
};

function isAconUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  return hostname === "acon24.com" || hostname.endsWith(".acon24.com");
}

function isZupapaUrl(url: URL): boolean {
  return url.hostname.toLowerCase() === "www.zupapa.us";
}

function isAmazonParsedUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  return hostname === "amazon.com" || hostname === "www.amazon.com";
}

export function withAffiliateTracking(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (isAconUrl(parsed)) {
      parsed.searchParams.set(ACON_AFFILIATE_PARAM, ACON_AFFILIATE_REF);
    }
    if (isZupapaUrl(parsed)) {
      parsed.searchParams.set(ZUPAPA_AFFILIATE_PARAM, ZUPAPA_AFFILIATE_REF);
    }
    if (isAmazonParsedUrl(parsed)) {
      parsed.searchParams.set(AMAZON_AFFILIATE_PARAM, AMAZON_AFFILIATE_TAG);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getBrandFallbackUrl(brandName: string): string | null {
  return withAffiliateTracking(BRAND_SHOP_URLS[brandName] ?? null);
}

function normalizedBrandName(brandName: string): string {
  return brandName.trim().toLowerCase();
}

function normalizedSizeLabel(size: string | undefined): string {
  return (size ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function normalizedShapeLabel(shape: string | undefined): string {
  return (shape ?? "").trim().toLowerCase();
}

function isZupapaBrandName(brandName: string): boolean {
  return normalizedBrandName(brandName) === "zupapa";
}

function getZupapaAmazonProductUrl(product: ProductLinkLike): string | null {
  const shape = normalizedShapeLabel(product.shape);
  const size = normalizedSizeLabel(product.size);

  if (shape === "rectangle" && ["8x14ft", "9x15ft", "10x17ft"].includes(size)) {
    return withAffiliateTracking(ZUPAPA_AMAZON_RECTANGULAR_URL);
  }

  if (shape === "round" && ["12ft", "14ft", "15ft", "16ft"].includes(size)) {
    return withAffiliateTracking(ZUPAPA_AMAZON_ROUND_URL);
  }

  if (shape === "square" && size === "14x14ft") {
    return withAffiliateTracking(ZUPAPA_AMAZON_SQUARE_14_URL);
  }

  return null;
}

export function getAmazonBrandUrl(brandName: string): string | null {
  if (isZupapaBrandName(brandName)) {
    return withAffiliateTracking(ZUPAPA_AMAZON_STORE_URL);
  }

  return null;
}

export function getAmazonProductUrl(product: ProductLinkLike): string | null {
  if (isZupapaBrandName(product.brand)) {
    return getZupapaAmazonProductUrl(product);
  }

  return null;
}

export function getAmazonModelUrl(brandName: string, products: ProductLinkLike[]): string | null {
  if (!isZupapaBrandName(brandName)) return null;

  for (const product of products) {
    const amazonUrl = getAmazonProductUrl(product);
    if (amazonUrl) return amazonUrl;
  }

  return null;
}

export function getPreferredBrandUrl(brandName: string, csvFallback: string | null): string | null {
  if (PREFER_BRAND_FALLBACK.has(brandName)) {
    return getBrandFallbackUrl(brandName) ?? withAffiliateTracking(csvFallback);
  }
  return withAffiliateTracking(csvFallback ?? getBrandFallbackUrl(brandName));
}

export function getPreferredProductUrl(product: ProductLinkLike): string | null {
  return withAffiliateTracking(product.sourceUrls[0] ?? getBrandFallbackUrl(product.brand));
}

export function getPreferredModelUrl(
  brandName: string,
  products: ProductLinkLike[],
): string | null {
  const bestLinkedProduct = [...products]
    .filter((product) => product.sourceUrls.length > 0)
    .sort((a, b) => {
      const aPrice = a.exactSizePriceUsd ?? a.modelFromPriceUsd ?? Number.POSITIVE_INFINITY;
      const bPrice = b.exactSizePriceUsd ?? b.modelFromPriceUsd ?? Number.POSITIVE_INFINITY;
      return aPrice - bPrice;
    })[0];

  if (bestLinkedProduct?.sourceUrls[0]) {
    return withAffiliateTracking(bestLinkedProduct.sourceUrls[0]);
  }

  const firstSourceUrl = products.flatMap((product) => product.sourceUrls)[0] ?? null;
  return withAffiliateTracking(firstSourceUrl ?? getBrandFallbackUrl(brandName));
}

const HOST_LABELS: Record<string, string> = {
  "acon24.com": "ACON",
  "us.acon24.com": "ACON",
  "machrus.com": "Machrus",
  "www.machrus.com": "Machrus",
  "jumpking.com": "JumpKing",
  "www.jumpking.com": "JumpKing",
  "walmart.com": "Walmart",
  "www.walmart.com": "Walmart",
  "amazon.com": "Amazon",
  "www.amazon.com": "Amazon",
  "target.com": "Target",
  "www.target.com": "Target",
  "costco.com": "Costco",
  "www.costco.com": "Costco",
  "trampolines.com": "Trampolines.com",
  "www.trampolines.com": "Trampolines.com",
  "sportspowerltd.net": "Sports Power",
  "www.sportspowerltd.net": "Sports Power",
};

export function isAmazonUrl(url: string | null): boolean {
  if (!url) return false;

  try {
    return isAmazonParsedUrl(new URL(url));
  } catch {
    return false;
  }
}

function titleCaseHostLabel(hostname: string): string {
  const normalized = hostname.replace(/^www\./, "").split(".")[0] ?? "";
  return normalized
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getShopDestinationLabel(
  url: string | null,
  fallbackBrandName: string,
): string {
  if (!url) return fallbackBrandName;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const mapped = HOST_LABELS[hostname];
    if (mapped) return mapped;

    const normalizedBrand = fallbackBrandName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedHost = hostname.replace(/^www\./, "").replace(/[^a-z0-9]/g, "");
    if (normalizedBrand && normalizedHost.includes(normalizedBrand)) {
      return fallbackBrandName;
    }

    return titleCaseHostLabel(hostname);
  } catch {
    return fallbackBrandName;
  }
}

export function getShopCtaLabel(
  url: string | null,
  brandName: string,
  verb = "View",
): string {
  const destination = getShopDestinationLabel(url, brandName);
  if (isAmazonUrl(url)) {
    return `${verb} ${brandName} on ${destination}`;
  }
  return `${verb} at ${destination}`;
}
