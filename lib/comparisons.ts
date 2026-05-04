import { getAllBrands, brandSlug } from '@/lib/products';
import type { Brand } from '@/lib/types';

const USA_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1CLjH67Sf9o2diBMUwiG9zmkhs47N90GmL4LxQ6TYsZk/edit?usp=sharing';

type ComparisonDefinition = {
  slug: string;
  labelA: string;
  labelB: string;
  dataBrandA: string;
  dataBrandB: string;
  intro: string;
};

export type ApprovedComparison = ComparisonDefinition & {
  title: string;
  href: string;
  brandA: Brand;
  brandB: Brand;
};

const COMPARISON_DEFINITIONS: ComparisonDefinition[] = [
  {
    slug: 'springfree-vs-acon',
    labelA: 'Springfree',
    labelB: 'ACON',
    dataBrandA: 'Springfree',
    dataBrandB: 'ACON',
    intro: `If you're choosing between Springfree and ACON, you're already in the premium tier. Both price above $1,500 for full-size models, and both have loyal followings. The main difference is what's under the mat. Springfree uses flexible fiberglass rods instead of springs, while ACON uses a traditional galvanized coil spring system with a deep frame. That mechanical difference shapes everything else: the bounce feel, the warranty terms, the maintenance, and the price.`,
  },
  {
    slug: 'springfree-vs-vuly',
    labelA: 'Springfree',
    labelB: 'Vuly',
    dataBrandA: 'Springfree',
    dataBrandB: 'Vuly',
    intro: `Both Springfree and Vuly market themselves on engineering, and both sit at the top of the price range. Springfree removes springs entirely, using fiberglass rods beneath the mat. Vuly uses its Leaf Spring system, which positions flat steel springs beneath the frame edge rather than horizontally between mat and frame. Springfree typically prices higher and offers a longer warranty, but Vuly has a wider accessory ecosystem and stronger model variety.`,
  },
  {
    slug: 'acon-vs-vuly',
    labelA: 'ACON',
    labelB: 'Vuly',
    dataBrandA: 'ACON',
    dataBrandB: 'Vuly',
    intro: `ACON and Vuly are two of the most recognized premium brands outside the US mass market, and both price above $1,500. ACON uses a traditional coil spring system tuned for performance bouncing. Vuly uses its proprietary Leaf Spring design. The decision usually comes down to what you want the trampoline for: serious bouncing and gymnastics-style use, or a refined family setup with matching accessories.`,
  },
  {
    slug: 'springfree-vs-jumpflex',
    labelA: 'Springfree',
    labelB: 'Jumpflex',
    dataBrandA: 'Springfree',
    dataBrandB: 'Jumpflex',
    intro: `Springfree and Jumpflex are both premium brands, but they reach that tier from different directions. Springfree's case rests on its springless design. Jumpflex sticks with traditional springs and competes on raw spec sheet, with weight ratings often listed at 450+ lb and a 10-year frame warranty. If you're weighing whether to pay more for a springless system or get a higher-capacity sprung trampoline at a similar price, this is the comparison.`,
  },
  {
    slug: 'acon-vs-jumpflex',
    labelA: 'ACON',
    labelB: 'Jumpflex',
    dataBrandA: 'ACON',
    dataBrandB: 'Jumpflex',
    intro: `ACON and Jumpflex are both performance-leaning premium brands using traditional coil springs. They overlap closely on price, warranty length, and listed weight ratings. The differences come down to model availability in the US, accessory range, and the specific spec figures for the size you're considering.`,
  },
  {
    slug: 'vuly-vs-jumpflex',
    labelA: 'Vuly',
    labelB: 'Jumpflex',
    dataBrandA: 'Vuly',
    dataBrandB: 'Jumpflex',
    intro: `Both Vuly and Jumpflex are premium brands with non-US engineering origins and strong followings among parents researching beyond the mass-market options. Vuly uses its Leaf Spring system. Jumpflex uses traditional coil springs with high listed weight capacities. Vuly typically prices higher; Jumpflex typically lists longer warranty terms and higher weight ratings.`,
  },
  {
    slug: 'alleyoop-vs-springfree',
    labelA: 'AlleyOOP',
    labelB: 'Springfree',
    dataBrandA: 'AlleyOOP',
    dataBrandB: 'Springfree',
    intro: `AlleyOOP and Springfree are both safety-positioned premium brands, but they take different mechanical paths. AlleyOOP places its springs above the jumping surface and offers an optional DoubleBounce two-mat system. Springfree uses no springs at all. Both price from around $1,500 upward, both come with long warranties, and both target the same buyer: parents who've decided the mass-market $500 trampoline isn't what they want.`,
  },
  {
    slug: 'alleyoop-vs-acon',
    labelA: 'AlleyOOP',
    labelB: 'ACON',
    dataBrandA: 'AlleyOOP',
    dataBrandB: 'ACON',
    intro: `AlleyOOP and ACON sit in the same premium tier but feel different to bounce on. AlleyOOP uses a springs-above-mat design with an optional DoubleBounce two-mat system, which dampens initial impact. ACON uses a traditional coil spring frame tuned for higher rebound. If your kids are gymnasts or serious bouncers, the spec sheet matters here in a way it doesn't for casual users.`,
  },
  {
    slug: 'skywalker-vs-springfree',
    labelA: 'Skywalker',
    labelB: 'Springfree',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Springfree',
    intro: `This is the comparison most parents end up making at some point: the default mass-market option against the premium springless one. Skywalker sells through Walmart, Target, and Amazon at $400 to $900. Springfree typically prices from $1,500 to $3,000. The pages exist for parents trying to work out whether the upgrade is worth it for their family, their yard, and how long they expect the trampoline to last.`,
  },
  {
    slug: 'skywalker-vs-acon',
    labelA: 'Skywalker',
    labelB: 'ACON',
    dataBrandA: 'Skywalker',
    dataBrandB: 'ACON',
    intro: `Skywalker is a volume leader in mass-market retail at $400 to $900. ACON is a Finnish premium brand priced from roughly $1,500 upward. The price gap is real, and so are the differences across spring count, mat material, frame gauge, and warranty length. If you're cross-shopping these two, you're deciding between a known mid-tier option and a step up that costs three to four times as much.`,
  },
  {
    slug: 'skywalker-vs-vuly',
    labelA: 'Skywalker',
    labelB: 'Vuly',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Vuly',
    intro: `Skywalker dominates mid-tier retail at $400 to $900. Vuly competes in the premium tier with its Leaf Spring system, typically at two to three times the price. Most parents reach this comparison after deciding whether a $500 trampoline meets their needs or whether they want to spend more for a longer warranty and a different build standard.`,
  },
  {
    slug: 'zupapa-vs-springfree',
    labelA: 'Zupapa',
    labelB: 'Springfree',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Springfree',
    intro: `Zupapa is one of the strongest mid-tier brands on Amazon, priced $400 to $700 with 10-year warranty terms across most models. Springfree is the leading springless premium brand, priced from $1,500 upward. The decision usually comes down to whether you want strong specs at value pricing or the springless design at premium pricing.`,
  },
  {
    slug: 'zupapa-vs-acon',
    labelA: 'Zupapa',
    labelB: 'ACON',
    dataBrandA: 'Zupapa',
    dataBrandB: 'ACON',
    intro: `Zupapa and ACON sit in different tiers, but parents do cross-shop them when weighing the upgrade math. Zupapa offers competitive specs and long warranties at Amazon mid-tier pricing. ACON sits firmly in the premium category with a different build standard and price point. If you're trying to decide whether the step up is worth it for your situation, this is the page.`,
  },
  {
    slug: 'skywalker-vs-zupapa',
    labelA: 'Skywalker',
    labelB: 'Zupapa',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Zupapa',
    intro: `If you're shopping Amazon or Walmart in the $400 to $900 range, this is the comparison you're probably already making. Skywalker has broader retail distribution and stronger brand recognition. Zupapa typically lists longer warranties, higher weight ratings, and more springs at similar price points. The two are the most cross-shopped pair in the mid-tier.`,
  },
  {
    slug: 'skywalker-vs-jumpking',
    labelA: 'Skywalker',
    labelB: 'JumpKing',
    dataBrandA: 'Skywalker',
    dataBrandB: 'JumpKing',
    intro: `Both Skywalker and JumpKing are legacy mid-tier brands with broad retail availability and overlapping pricing. JumpKing has historically offered more rectangular models, which appeals to gymnastics-focused families. Skywalker covers a wider range of round-trampoline sizes. Most parents choose between them based on what's in stock locally and the size they need.`,
  },
  {
    slug: 'zupapa-vs-jumpking',
    labelA: 'Zupapa',
    labelB: 'JumpKing',
    dataBrandA: 'Zupapa',
    dataBrandB: 'JumpKing',
    intro: `Both Zupapa and JumpKing compete in the mid-tier, but they reach different buyers. Zupapa skews Amazon-direct with longer listed warranty terms and higher spring counts. JumpKing has broader traditional retail presence and stronger brand recognition. The choice often comes down to whether you trust the Amazon-direct brand with more generous specs or the established name with shorter warranty terms.`,
  },
  {
    slug: 'orcc-vs-zupapa',
    labelA: 'ORCC',
    labelB: 'Zupapa',
    dataBrandA: 'ORCC',
    dataBrandB: 'Zupapa',
    intro: `Both ORCC and Zupapa are Amazon-led brands, but they sit at different price points. ORCC competes in the $200 to $400 budget tier. Zupapa typically prices $400 to $700 with longer warranty terms and higher listed spring counts. Most parents arrive here weighing whether the extra $150 to $200 is worth it.`,
  },
  {
    slug: 'orcc-vs-jumpzylla',
    labelA: 'ORCC',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'ORCC',
    dataBrandB: 'JUMPZYLLA',
    intro: `ORCC and JUMPZYLLA are both Amazon budget brands competing in the $200 to $400 range. They overlap heavily on specs, warranty terms, and target buyer. The differentiation usually comes down to accessory inclusion, available sizes, and current Amazon pricing on the day you're shopping.`,
  },
  {
    slug: 'orcc-vs-skywalker',
    labelA: 'ORCC',
    labelB: 'Skywalker',
    dataBrandA: 'ORCC',
    dataBrandB: 'Skywalker',
    intro: `ORCC is an Amazon budget brand priced $200 to $400. Skywalker is a mass-market brand priced $400 to $900 with broader retail availability and stronger brand recognition. If you're choosing between them, you're deciding between the lowest tier of outdoor trampolines and the volume mid-tier standard.`,
  },
  {
    slug: 'jumpzylla-vs-zupapa',
    labelA: 'JUMPZYLLA',
    labelB: 'Zupapa',
    dataBrandA: 'JUMPZYLLA',
    dataBrandB: 'Zupapa',
    intro: `JUMPZYLLA sits in the Amazon budget tier at $200 to $400. Zupapa sits one tier above at $400 to $700, with longer warranty terms and higher listed weight ratings. The choice usually comes down to whether you stretch the budget for the better spec sheet or stay at the lower entry point.`,
  },
  {
    slug: 'upper-bounce-vs-skywalker',
    labelA: 'Upper Bounce',
    labelB: 'Skywalker',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'Skywalker',
    intro: `Upper Bounce is best known for replacement parts and budget complete units. Skywalker is a volume leader in mid-tier retail. Upper Bounce typically prices below Skywalker with shorter warranty terms. If you're shopping the lower end of the market, this is the practical comparison.`,
  },
  {
    slug: 'skywalker-vs-sportspower',
    labelA: 'Skywalker',
    labelB: 'Sportspower',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Skywalker and Sportspower (sold under the Bounce Pro label) are both US mass-market brands sold heavily through Walmart and Costco. Sportspower typically prices at or slightly below Skywalker with lower listed spring counts and shorter warranty terms. Both are sized and priced to be the first trampoline most families buy.`,
  },
  {
    slug: 'skywalker-vs-bounce-pro',
    labelA: 'Skywalker',
    labelB: 'Bounce Pro',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Bounce Pro (Sportspower's brand label at Walmart) and Skywalker are direct mass-market competitors at the same retailers. Bounce Pro typically prices lower. Skywalker typically lists higher spring counts and longer warranty terms. If you're shopping at Walmart or Costco, you're probably choosing between these two.`,
  },
  {
    slug: 'jumpking-vs-bounce-pro',
    labelA: 'JumpKing',
    labelB: 'Bounce Pro',
    dataBrandA: 'JumpKing',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `JumpKing is a mid-tier legacy brand. Bounce Pro sits one tier below in the budget mass-market segment. Pricing, listed spring counts, and warranty terms differ accordingly. The choice usually comes down to whether you want the entry-level option or the step up.`,
  },
  {
    slug: 'bcan-vs-orcc',
    labelA: 'BCAN',
    labelB: 'ORCC',
    dataBrandA: 'BCAN',
    dataBrandB: 'ORCC',
    intro: `BCAN and ORCC are both Amazon budget brands, but they target different uses. BCAN is best known for mini and small-diameter trampolines. ORCC produces full outdoor sizes. The comparison is most relevant if you're cross-shopping the small-trampoline end of each brand's range.`,
  },
  {
    slug: 'little-tikes-vs-skywalker',
    labelA: 'Little Tikes',
    labelB: 'Skywalker',
    dataBrandA: 'Little Tikes',
    dataBrandB: 'Skywalker',
    intro: `Little Tikes produces small kids trampolines, typically under 7ft, with low listed weight limits and toddler-focused designs. Skywalker covers the full residential size range, including a Mini line that competes more directly. If your kids are toddlers or preschoolers, this is the comparison that matters; for older kids, Skywalker's full-size range is the more relevant set.`,
  },
  {
    slug: 'little-tikes-vs-jumpzylla',
    labelA: 'Little Tikes',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'Little Tikes',
    dataBrandB: 'JUMPZYLLA',
    intro: `Both Little Tikes and JUMPZYLLA produce kids-sized trampolines, but they target different ages. Little Tikes is the established toddler brand with strong retail presence and lower listed weight limits. JUMPZYLLA targets older kids with higher listed weight ratings and outdoor-grade construction.`,
  },
  {
    slug: 'bcan-vs-little-tikes',
    labelA: 'BCAN',
    labelB: 'Little Tikes',
    dataBrandA: 'BCAN',
    dataBrandB: 'Little Tikes',
    intro: `BCAN focuses on indoor mini trampolines and small outdoor models for older kids. Little Tikes focuses on toddler-aged kids with low-height plastic-frame designs. The two rarely overlap directly, but parents of mixed-age kids often cross-shop them when deciding which size to buy first.`,
  },
];

function hydrateComparison(
  definition: ComparisonDefinition,
  brandsBySlug: Map<string, Brand>,
): ApprovedComparison | null {
  const brandA = brandsBySlug.get(brandSlug(definition.dataBrandA));
  const brandB = brandsBySlug.get(brandSlug(definition.dataBrandB));

  if (!brandA || !brandB) {
    return null;
  }

  return {
    ...definition,
    title: `${definition.labelA} vs ${definition.labelB}`,
    href: `/compare/${definition.slug}/`,
    brandA,
    brandB,
  };
}

export function getApprovedComparisons(limit?: number): ApprovedComparison[] {
  const brandsBySlug = new Map(getAllBrands().map((brand) => [brand.slug, brand]));
  const comparisons = COMPARISON_DEFINITIONS
    .map((definition) => hydrateComparison(definition, brandsBySlug))
    .filter((comparison): comparison is ApprovedComparison => comparison !== null);

  return typeof limit === 'number' ? comparisons.slice(0, limit) : comparisons;
}

export function getApprovedComparison(slug: string): ApprovedComparison | undefined {
  return getApprovedComparisons().find((comparison) => comparison.slug === slug);
}

export function getComparisonSourceUrl(): string {
  return USA_SHEET_URL;
}
