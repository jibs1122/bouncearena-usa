import type { ComparePromo } from "@/components/ui/ComparePromoCta";
import { isAconBrand, isVulyBrand, isZupapaBrand } from "@/lib/vuly";

export const VULY_PROMO_AFFILIATE_URL = "https://www.vulyplay.com/aff/100/";
export const ACON_PROMO_AFFILIATE_URL = "https://us.acon24.com?sca_ref=11261719.jjbGKHHa7yLAnuwn";
export const ZUPAPA_PROMO_AFFILIATE_URL = "https://www.zupapa.us/discount/BOUNCE?ref=bltzjtnf";

export const ACON_DISCOUNT_TIERS = [
  { threshold: "Spend $200 or more", discount: "$15 off" },
  { threshold: "Spend $400 or more", discount: "$25 off" },
  { threshold: "Spend $1,000 or more", discount: "$50 off" },
  { threshold: "Spend $2,000 or more", discount: "$90 off" },
  { threshold: "Spend $3,000 or more", discount: "$120 off" },
  { threshold: "Spend $4,000 or more", discount: "$150 off" },
];

export function getPromoCtaForBrand(brandName: string): ComparePromo | null {
  if (isVulyBrand(brandName)) {
    return {
      brand: "Vuly",
      code: "BOUNCE15",
      description: "Use code BOUNCE15 for a discount on any Vuly trampoline.",
      href: VULY_PROMO_AFFILIATE_URL,
    };
  }

  if (isAconBrand(brandName)) {
    return {
      brand: "ACON",
      code: "BOUNCE",
      description: "Use code BOUNCE for up to $150 off at ACON.",
      href: ACON_PROMO_AFFILIATE_URL,
    };
  }

  if (isZupapaBrand(brandName)) {
    return {
      brand: "Zupapa",
      code: "BOUNCE",
      actionLabel: "Activate 10% off",
      description: "Use code BOUNCE for 10% off at Zupapa.",
      href: ZUPAPA_PROMO_AFFILIATE_URL,
    };
  }

  return null;
}

export function buildPromoCtasForBrands(brandNames: string[]): ComparePromo[] {
  const promos: ComparePromo[] = [];
  const seenBrands = new Set<string>();

  for (const brandName of brandNames) {
    const promo = getPromoCtaForBrand(brandName);
    if (!promo) continue;

    const key = promo.brand.toLowerCase();
    if (seenBrands.has(key)) continue;

    seenBrands.add(key);
    promos.push(promo);
  }

  return promos;
}

export function buildPromoCtasFromLabels(labels: string[]): ComparePromo[] {
  const normalized = labels.join(" ").toLowerCase();
  const brandNames: string[] = [];

  if (normalized.includes("vuly")) brandNames.push("Vuly");
  if (normalized.includes("acon")) brandNames.push("ACON");
  if (normalized.includes("zupapa")) brandNames.push("Zupapa");

  return buildPromoCtasForBrands(brandNames);
}
