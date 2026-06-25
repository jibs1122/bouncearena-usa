import { isAconBrand, isVulyBrand, isZupapaBrand } from "@/lib/vuly";

export type InternalLink = {
  label: string;
  href: string;
};

export const PROMO_PAGE_BY_BRAND: Record<string, InternalLink> = {
  ACON: { label: "ACON promo code", href: "/acon-promo-code/" },
  Vuly: { label: "Vuly promo code", href: "/vuly-promo-code/" },
  Zupapa: { label: "Zupapa promo code", href: "/zupapa-promo-code/" },
};

export const BRAND_POPULAR_LINKS: Record<string, InternalLink[]> = {
  Vuly: [
    { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
    { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
    { label: "Vuly Ultra 2 Pro vs Thunder 2", href: "/compare/vuly-ultra-2-pro-vs-thunder-2/" },
    { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
    { label: "Vuly Ultra 2 Pro vs Jumpflex HERO", href: "/compare/vuly-ultra-2-pro-vs-jumpflex-hero/" },
    { label: "Vuly Thunder 2 Pro vs ACON 16 HD", href: "/compare/vuly-thunder-2-pro-vs-acon-16-hd/" },
    PROMO_PAGE_BY_BRAND.Vuly,
  ],
  ACON: [
    { label: "ACON 16 HD vs ACON X 17ft", href: "/compare/acon-16-hd-vs-acon-x-17ft/" },
    { label: "ACON 16 HD vs ACON 13 HD", href: "/compare/acon-16-hd-vs-acon-13-hd/" },
    { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
    { label: "ACON 14ft vs ACON 15ft Round", href: "/compare/acon-14ft-vs-acon-15ft-round/" },
    { label: "ACON 16 HD vs ACON 16 HD Pro", href: "/compare/acon-16-hd-vs-acon-16-hd-pro/" },
    { label: "ACON vs Vuly", href: "/compare/acon-vs-vuly/" },
    { label: "ACON vs Springfree", href: "/compare/springfree-vs-acon/" },
    PROMO_PAGE_BY_BRAND.ACON,
  ],
  Zupapa: [
    { label: "Zupapa vs Jumpflex", href: "/compare/zupapa-vs-jumpflex/" },
    { label: "Zupapa vs Springfree", href: "/compare/zupapa-vs-springfree/" },
    { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
    { label: "Zupapa vs Vuly", href: "/compare/zupapa-vs-vuly/" },
    { label: "Zupapa vs AlleyOOP", href: "/compare/zupapa-vs-alleyoop/" },
    { label: "Skywalker vs Zupapa", href: "/compare/skywalker-vs-zupapa/" },
    { label: "Zupapa vs JumpKing", href: "/compare/zupapa-vs-jumpking/" },
    { label: "ORCC vs Zupapa", href: "/compare/orcc-vs-zupapa/" },
    PROMO_PAGE_BY_BRAND.Zupapa,
  ],
};

const MODEL_LINK_RULES: Array<{
  brand: string;
  needles: string[];
  links: InternalLink[];
}> = [
  {
    brand: "Vuly",
    needles: ["ultra 2 pro"],
    links: [
      { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
      { label: "Vuly Ultra 2 Pro vs Thunder 2", href: "/compare/vuly-ultra-2-pro-vs-thunder-2/" },
      { label: "Vuly Ultra 2 Pro vs Jumpflex HERO", href: "/compare/vuly-ultra-2-pro-vs-jumpflex-hero/" },
    ],
  },
  {
    brand: "Vuly",
    needles: ["ultra 2"],
    links: [
      { label: "Vuly Ultra 2 vs Ultra 2 Pro", href: "/compare/vuly-ultra-2-vs-ultra-2-pro/" },
      { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
    ],
  },
  {
    brand: "Vuly",
    needles: ["thunder 2 pro"],
    links: [
      { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
      { label: "Vuly Thunder 2 Pro vs Springfree Jumbo Square", href: "/compare/vuly-thunder-2-pro-vs-springfree-jumbo-square/" },
      { label: "Vuly Thunder 2 Pro vs ACON 16 HD", href: "/compare/vuly-thunder-2-pro-vs-acon-16-hd/" },
    ],
  },
  {
    brand: "Vuly",
    needles: ["thunder 2"],
    links: [
      { label: "Vuly Thunder 2 vs Thunder 2 Pro", href: "/compare/vuly-thunder-2-vs-thunder-2-pro/" },
      { label: "Vuly Ultra 2 Pro vs Thunder 2", href: "/compare/vuly-ultra-2-pro-vs-thunder-2/" },
      { label: "Vuly Ultra 2 vs Thunder 2", href: "/compare/vuly-ultra-2-vs-thunder-2/" },
    ],
  },
  {
    brand: "ACON",
    needles: ["16 hd pro"],
    links: [
      { label: "ACON 16 HD vs ACON 16 HD Pro", href: "/compare/acon-16-hd-vs-acon-16-hd-pro/" },
    ],
  },
  {
    brand: "ACON",
    needles: ["16 hd"],
    links: [
      { label: "ACON 16 HD vs ACON X 17ft", href: "/compare/acon-16-hd-vs-acon-x-17ft/" },
      { label: "ACON 16 HD vs ACON 13 HD", href: "/compare/acon-16-hd-vs-acon-13-hd/" },
      { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
      { label: "ACON 16 HD vs ACON 16 HD Pro", href: "/compare/acon-16-hd-vs-acon-16-hd-pro/" },
    ],
  },
  {
    brand: "ACON",
    needles: ["13 hd"],
    links: [
      { label: "ACON 16 HD vs ACON 13 HD", href: "/compare/acon-16-hd-vs-acon-13-hd/" },
    ],
  },
  {
    brand: "ACON",
    needles: ["15ft", "15 ft"],
    links: [
      { label: "ACON 14ft vs ACON 15ft Round", href: "/compare/acon-14ft-vs-acon-15ft-round/" },
      { label: "ACON 16 HD vs ACON 15ft Round", href: "/compare/acon-16-hd-vs-acon-15ft-round/" },
    ],
  },
  {
    brand: "ACON",
    needles: ["x 17ft", "x 17 ft"],
    links: [
      { label: "ACON 16 HD vs ACON X 17ft", href: "/compare/acon-16-hd-vs-acon-x-17ft/" },
      { label: "ACON X vs North Performer / Legend", href: "/compare/acon-x-vs-north-performer-legend/" },
      { label: "ACON X 17ft vs MaxAir Rectangle", href: "/compare/acon-x-17ft-vs-maxair-rectangle/" },
    ],
  },
  {
    brand: "Zupapa",
    needles: ["upgraded", "10-16ft", "10 16ft"],
    links: [
      { label: "Zupapa vs Jumpflex", href: "/compare/zupapa-vs-jumpflex/" },
      { label: "Zupapa vs Springfree", href: "/compare/zupapa-vs-springfree/" },
      { label: "Zupapa vs Vuly", href: "/compare/zupapa-vs-vuly/" },
    ],
  },
  {
    brand: "Zupapa",
    needles: ["double frames", "1800lbs"],
    links: [
      { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
      { label: "Zupapa vs Vuly", href: "/compare/zupapa-vs-vuly/" },
      { label: "Skywalker vs Zupapa", href: "/compare/skywalker-vs-zupapa/" },
    ],
  },
  {
    brand: "Zupapa",
    needles: ["rectangular", "2500lbs"],
    links: [
      { label: "Zupapa vs ACON", href: "/compare/zupapa-vs-acon/" },
      { label: "Upper Bounce vs Zupapa", href: "/compare/upper-bounce-vs-zupapa/" },
      { label: "Zupapa vs Jumpflex", href: "/compare/zupapa-vs-jumpflex/" },
    ],
  },
  {
    brand: "Zupapa",
    needles: ["kids", "6ft rectangle"],
    links: [
      { label: "Skywalker vs Zupapa", href: "/compare/skywalker-vs-zupapa/" },
      { label: "Jumpzylla vs Zupapa", href: "/compare/jumpzylla-vs-zupapa/" },
      { label: "ORCC vs Zupapa", href: "/compare/orcc-vs-zupapa/" },
    ],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function dedupeLinks(links: InternalLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function getPopularLinksForBrand(brandName: string): InternalLink[] {
  return BRAND_POPULAR_LINKS[brandName] ?? [];
}

export function getPromoPageForBrand(brandName: string): InternalLink | null {
  if (isAconBrand(brandName)) return PROMO_PAGE_BY_BRAND.ACON;
  if (isVulyBrand(brandName)) return PROMO_PAGE_BY_BRAND.Vuly;
  if (isZupapaBrand(brandName)) return PROMO_PAGE_BY_BRAND.Zupapa;
  return null;
}

export function getModelComparisonLinks(brandName: string, modelName: string): InternalLink[] {
  const normalizedModel = normalize(modelName);
  const matches = MODEL_LINK_RULES
    .filter((rule) => rule.brand === brandName)
    .filter((rule) => rule.needles.some((needle) => normalizedModel.includes(normalize(needle))))
    .flatMap((rule) => rule.links);

  return dedupeLinks(matches).slice(0, 4);
}
