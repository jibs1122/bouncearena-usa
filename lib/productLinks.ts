import { BRAND_SHOP_URLS } from "@/lib/brandLogos";

type ProductLinkLike = {
  brand: string;
  sourceUrls: string[];
  exactSizePriceUsd?: number | null;
  modelFromPriceUsd?: number | null;
};

export function getBrandFallbackUrl(brandName: string): string | null {
  return BRAND_SHOP_URLS[brandName] ?? null;
}

export function getPreferredBrandUrl(brandName: string, csvFallback: string | null): string | null {
  return csvFallback ?? getBrandFallbackUrl(brandName);
}

export function getPreferredProductUrl(product: ProductLinkLike): string | null {
  return product.sourceUrls[0] ?? getBrandFallbackUrl(product.brand);
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

  if (bestLinkedProduct?.sourceUrls[0]) return bestLinkedProduct.sourceUrls[0];

  const firstSourceUrl = products.flatMap((product) => product.sourceUrls)[0] ?? null;
  return firstSourceUrl ?? getBrandFallbackUrl(brandName);
}

const HOST_LABELS: Record<string, string> = {
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
