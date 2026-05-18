import { BRAND_SHOP_URLS } from "@/lib/brandLogos";

const ACON_AFFILIATE_PARAM = "sca_ref";
const ACON_AFFILIATE_REF = "11261719.jjbGKHHa7yLAnuwn";

type ProductLinkLike = {
  brand: string;
  sourceUrls: string[];
  exactSizePriceUsd?: number | null;
  modelFromPriceUsd?: number | null;
};

function isAconUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  return hostname === "acon24.com" || hostname.endsWith(".acon24.com");
}

export function withAffiliateTracking(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (isAconUrl(parsed)) {
      parsed.searchParams.set(ACON_AFFILIATE_PARAM, ACON_AFFILIATE_REF);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getBrandFallbackUrl(brandName: string): string | null {
  return withAffiliateTracking(BRAND_SHOP_URLS[brandName] ?? null);
}

export function getPreferredBrandUrl(brandName: string, csvFallback: string | null): string | null {
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
