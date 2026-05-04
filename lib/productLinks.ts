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
