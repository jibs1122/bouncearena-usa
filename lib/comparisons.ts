import fs from 'fs';
import path from 'path';
import { getAllBrands, brandSlug } from '@/lib/products';
import type { Brand } from '@/lib/types';
import { cleanDuplicateBrandPrefixes, removeDuplicateReview } from '@/lib/displayText';
import { SKYBOUND_COMPARISON_DEFINITIONS } from '@/lib/skyboundComparePages';

const USA_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1CLjH67Sf9o2diBMUwiG9zmkhs47N90GmL4LxQ6TYsZk/edit?usp=sharing';

export type ComparisonDefinition = {
  slug: string;
  labelA: string;
  labelB: string;
  dataBrandA: string;
  dataBrandB: string;
  metaTitle?: string;
  intro: string;
  introParagraphs?: string[];
  keyTakeaways?: string[];
  specTableKeyTakeaways?: string[];
  keyDifferencesHeading?: string;
  sharedSpecs?: Array<{ label: string; value: string }>;
  metaDescription?: string;
  forceAffiliateDisclosure?: boolean;
  contentLayout?: 'default' | 'skybound-compare-copy';
  source?: 'manual' | 'draft';
};

export type ApprovedComparison = ComparisonDefinition & {
  title: string;
  href: string;
  brandA: Brand;
  brandB: Brand;
  brandAHasData: boolean;
  brandBHasData: boolean;
};

const DRAFT_COMPARISON_DIR = path.join(
  process.cwd(),
  'blog articles',
  'new comparison articles',
);

const BASE_COMPARISON_DEFINITIONS: ComparisonDefinition[] = [
  {
    slug: 'springfree-vs-acon',
    labelA: 'Springfree',
    labelB: 'ACON',
    dataBrandA: 'Springfree',
    dataBrandB: 'ACON',
    intro: `Both are premium, so the real question is springs or no springs.

Springfree removes springs entirely, using flexible rods below a hidden frame, which takes away one way a child can hit hard metal and gives a softer, deeper feel. ACON keeps coil springs and builds rectangular models for a firmer, more even bounce that suits older kids and people doing flips or tricks.

Choose Springfree if a safety-led, springless design is the priority. Choose ACON if you want a stronger, more responsive bounce and the option of a performance rectangle.`,
    metaDescription: 'Springfree vs ACON: springs or no springs. Springfree is the safety-led family pick; ACON is the performance choice with rectangular models.',
  },
  {
    slug: 'springfree-vs-vuly',
    labelA: 'Springfree',
    labelB: 'Vuly',
    dataBrandA: 'Springfree',
    dataBrandB: 'Vuly',
    intro: `Both step away from a plain exposed-coil edge, but in different ways.

Springfree removes springs entirely, using flexible rods below a hidden frame. Vuly offers two systems: traditional coil models and its Thunder leaf-spring models, which move the springs out of the jumping path while keeping a spring-style bounce, plus a wide set of family add-ons.

Choose Springfree if you want the fully springless design and its long single warranty. Choose Vuly if you want a broader range, an accessory ecosystem, and a leaf-spring option that stops short of going fully springless.`,
    metaDescription: 'Springfree vs Vuly: a fully springless design against Vuly\'s coil and leaf-spring range. Springfree is cleaner on safety; Vuly is more flexible.',
  },
  {
    slug: 'acon-vs-vuly',
    labelA: 'ACON',
    labelB: 'Vuly',
    dataBrandA: 'ACON',
    dataBrandB: 'Vuly',
    intro: `This splits on bounce style and shape.

ACON offers both round and rectangular models, with the rectangles built for a firmer, more even bounce that suits older kids and people doing flips or tricks. Vuly is round only, with both coil and Thunder leaf-spring models and a strong set of family add-ons.

Choose ACON if performance bounce or a rectangle is the goal. Choose Vuly if you want a versatile family setup with accessories and the option of a softer leaf-spring bounce.`,
    metaDescription: 'ACON vs Vuly: a performance brand with rectangles against a round-only family brand with coil and leaf-spring models and accessories.',
  },
  {
    slug: 'springfree-vs-jumpflex',
    labelA: 'Springfree',
    labelB: 'Jumpflex',
    dataBrandA: 'Springfree',
    dataBrandB: 'Jumpflex',
    intro: `The decision here is springs or no springs.

Springfree removes springs, running flexible rods below a hidden frame, which takes one kind of hard-metal contact off the table. Jumpflex keeps coil springs and competes on higher weight limits and a 10-year frame warranty.

Choose Springfree if you're set on the springless design and a long single warranty. Choose Jumpflex if you want a stronger spring bounce and a higher weight limit for older or heavier kids.`,
    metaDescription: 'Springfree vs Jumpflex: a springless safety design against a higher-capacity coil brand. Two different reasons to pay above budget.',
  },
  {
    slug: 'acon-vs-jumpflex',
    labelA: 'ACON',
    labelB: 'Jumpflex',
    dataBrandA: 'ACON',
    dataBrandB: 'Jumpflex',
    intro: `Both are coil performance brands, so this is about which leans further toward performance.

ACON builds rectangular models for serious bouncing and publishes no single-user weight limit, recommending about 300 lb, with a 10-year frame warranty and 5-year warranty on the mat and springs. Jumpflex rates its HERO models to 350 lb and competes on value and capacity, with the same 10-year frame warranty and 5-year warranty on the mat and springs.

Choose ACON if you want the stronger performance benchmark and its rectangles. Choose Jumpflex if you want a higher listed weight limit at a more value-led price.`,
    metaDescription: 'ACON vs Jumpflex: two coil performance brands. ACON leans further into performance and rectangles; Jumpflex is the higher-value, higher-capacity pick.',
  },
  {
    slug: 'vuly-vs-jumpflex',
    labelA: 'Vuly',
    labelB: 'Jumpflex',
    dataBrandA: 'Vuly',
    dataBrandB: 'Jumpflex',
    intro: `Both are family brands above the budget tier, but they differ in shape and range.

Vuly is round only, with coil and Thunder leaf-spring models and a strong accessory range. Jumpflex covers round, square, and rectangle and is built around higher weight limits for bigger jumpers.

Choose Vuly if the accessory ecosystem and a leaf-spring option matter most. Choose Jumpflex if you want more shape choice and a higher weight limit for older kids.`,
    metaDescription: 'Vuly vs Jumpflex: a round-only family brand with accessories against a coil brand with more shapes and higher capacity.',
  },
  {
    slug: 'vuly-vs-alleyoop',
    labelA: 'Vuly',
    labelB: 'AlleyOOP',
    dataBrandA: 'Vuly',
    dataBrandB: 'AlleyOOP',
    intro: `The split is range against warranty.

Vuly is round only, with coil and Thunder leaf-spring models, a strong accessory range, and a 10-year frame warranty on its upper models. AlleyOOP keeps coil springs but engineers around them, with its DoubleBounce two-mat option and a lifetime frame warranty.

Choose Vuly if you want more model choice and accessories. Choose AlleyOOP if a lifetime frame warranty and its safety-engineered bounce matter more.`,
    metaDescription: 'Vuly vs AlleyOOP: a wide family range against a safety-engineered brand with a lifetime frame warranty. Range and accessories vs warranty.',
  },
  {
    slug: 'jumpflex-vs-alleyoop',
    labelA: 'Jumpflex',
    labelB: 'AlleyOOP',
    dataBrandA: 'Jumpflex',
    dataBrandB: 'AlleyOOP',
    intro: `This trades a higher weight limit against a longer warranty.

Jumpflex is built around capacity for older kids and heavier use, with up to a 10-year frame warranty and commonly 5-year warranty on the mat and springs. AlleyOOP keeps coil springs in a safety-engineered build, with its DoubleBounce two-mat option and a lifetime frame warranty.

Choose Jumpflex if you want the higher listed weight limit at a lower starting price. Choose AlleyOOP if multi-jumper safety and a lifetime frame warranty are the priority.`,
    metaDescription: 'Jumpflex vs AlleyOOP: a higher weight limit against a lifetime frame warranty and safety engineering. Capacity vs warranty.',
  },
  {
    slug: 'springfree-vs-avyna',
    labelA: 'Springfree',
    labelB: 'Avyna',
    dataBrandA: 'Springfree',
    dataBrandB: 'Avyna',
    intro: `These solve different yard problems.

Springfree is above-ground only and springless, using flexible rods below a hidden frame, with a long 10-year warranty across the frame, mat, net, and rods. Avyna offers both above-ground and in-ground installs on a heavier coil-spring build with a perforated, high-airflow mat and a lifetime frame warranty.

Choose Springfree if you want a safety-led, springless trampoline that sits above-ground. Choose Avyna if you want a flush in-ground setup or a heavier-duty build.`,
    metaDescription: 'Springfree vs Avyna: an above-ground springless design against a heavy, in-ground-capable coil brand. The choice is install type.',
  },
  {
    slug: 'avyna-vs-acon',
    labelA: 'Avyna',
    labelB: 'ACON',
    dataBrandA: 'Avyna',
    dataBrandB: 'ACON',
    intro: `Both run coil springs and both can install above-ground or in-ground, so the real divide is build and warranty.

Avyna uses a heavier frame and a perforated, high-airflow mat, is rated to 350 lb per jumper, and carries a lifetime frame warranty with 10-year warranty on springs. ACON publishes no single-user weight limit and recommends about 300 lb, with a 10-year frame warranty and 5-year warranty on the mat and springs, and its ACON X and HD rectangles lean toward performance and tricks.

Choose Avyna if you want the higher weight rating, a lifetime frame warranty, or an in-ground setup. Choose ACON for the lower entry price and the performance-rectangle edge.`,
    metaDescription: 'Avyna vs ACON: a heavy, in-ground-capable coil brand against an above-ground performance one. Capacity and warranty vs entry price and rectangles.',
  },
  {
    slug: 'avyna-vs-alleyoop',
    labelA: 'Avyna',
    labelB: 'AlleyOOP',
    dataBrandA: 'Avyna',
    dataBrandB: 'AlleyOOP',
    intro: `The divide is install type.

AlleyOOP is above-ground only, rated to 245 lb per jumper, with a safety-engineered build and a lifetime frame warranty. Avyna offers above-ground and in-ground on a heavier build, is rated to 350 lb per jumper, and also carries a lifetime frame warranty.

Choose AlleyOOP if you want an above-ground, safety-engineered trampoline. Choose Avyna if you want a flush in-ground setup or the higher weight rating.`,
    metaDescription: 'Avyna vs AlleyOOP: an in-ground-capable heavy coil brand against an above-ground safety-engineered one. The divide is install type.',
  },
  {
    slug: 'alleyoop-vs-springfree',
    labelA: 'AlleyOOP',
    labelB: 'Springfree',
    dataBrandA: 'AlleyOOP',
    dataBrandB: 'Springfree',
    intro: `Both are premium and safety-led, but they take different paths.

Springfree removes springs entirely, using flexible rods below a hidden frame, with a long 10-year warranty across the frame, mat, net, and rods. AlleyOOP keeps coil springs in a safety-engineered build, adding its DoubleBounce two-mat option and a lifetime frame warranty.

Choose Springfree if a fully springless design is the point. Choose AlleyOOP if you want to keep a spring bounce with strong safety engineering and a lifetime frame warranty.`,
    metaDescription: 'AlleyOOP vs Springfree: both safety-led, but one improves the springs and the other removes them. AlleyOOP keeps the bounce; Springfree goes springless.',
  },
  {
    slug: 'alleyoop-vs-acon',
    labelA: 'AlleyOOP',
    labelB: 'ACON',
    dataBrandA: 'AlleyOOP',
    dataBrandB: 'ACON',
    intro: `This splits on bounce against warranty.

ACON builds rectangular models for serious bouncing and publishes no single-user weight limit, recommending about 300 lb, with a 10-year frame warranty and 5-year warranty on the mat and springs. AlleyOOP keeps coil springs in a safety-engineered build, with its DoubleBounce two-mat option and a lifetime frame warranty.

Choose ACON if performance and a rectangle matter most. Choose AlleyOOP if a lifetime frame warranty and safety-focused design lead your decision.`,
    metaDescription: 'AlleyOOP vs ACON: warranty and safety engineering against bounce and rectangles. AlleyOOP has the lifetime frame warranty; ACON has the performance edge.',
  },
  {
    slug: 'skywalker-vs-springfree',
    labelA: 'Skywalker',
    labelB: 'Springfree',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Springfree',
    intro: `The decision here is springs or no springs, across a wide price gap.

Skywalker uses metal coil springs with padding over the edge, the standard backyard setup. Springfree replaces springs with flexible rods below the mat and tucks the frame out of reach, removing one way a child can hit hard metal, and it costs considerably more.

Choose Skywalker if you want an affordable first backyard trampoline. Choose Springfree if you're set on the springless design and plan to keep it for years.`,
    metaDescription: 'Skywalker vs Springfree: a budget retail trampoline against a premium springless one. The question is whether the upgrade is worth it.',
  },
  {
    slug: 'skywalker-vs-acon',
    labelA: 'Skywalker',
    labelB: 'ACON',
    dataBrandA: 'Skywalker',
    dataBrandB: 'ACON',
    intro: `How hard the trampoline will be used decides this one.

Skywalker is the everyday retail brand built mainly for younger kids, with a standard 3-year frame warranty and 1-year warranty on the mat and springs. ACON is built for harder, longer use: it publishes no single-user weight limit and recommends about 300 lb, with a 10-year frame warranty, 5-year warranty on the mat and springs, and rectangular models for older kids and tricks.

Choose Skywalker for an affordable everyday backyard trampoline. Choose ACON if you want performance bounce and a much longer warranty, and the higher price is worth it.`,
    metaDescription: 'Skywalker vs ACON: an everyday retail brand against a premium performance one. How hard the trampoline will be used decides it.',
    keyTakeaways: [
      'Skywalker is the lower-cost everyday retail option; ACON is the performance pick for harder, longer use.',
      "ACON has the stronger standard warranty position: 10-year frame warranty and 5-year warranty on the mat and springs, versus Skywalker's standard 3-year frame warranty and 1-year warranty on the mat and springs.",
      "Skywalker covers more mass-market family shapes, while ACON's rectangles are the stronger fit for older kids and tricks.",
      "Compare exact models in the table, because Skywalker's Premium line carries different warranty terms from its standard range.",
    ],
  },
  {
    slug: 'skywalker-vs-vuly',
    labelA: 'Skywalker',
    labelB: 'Vuly',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Vuly',
    intro: `Both sell round trampolines, so this is about build durability and warranty.

Skywalker is the simpler retail option, with a standard 3-year frame warranty and 1-year warranty on the mat and springs. Vuly is the more polished setup, with a 10-year frame warranty on its upper models, 5-year warranty on the mat and springs, and a wider accessory range.

Choose Skywalker if the lower price and easy retail availability win. Choose Vuly if you want a more durable build with a much longer warranty.`,
    metaDescription: 'Skywalker vs Vuly: two round brands at different tiers. Skywalker is the cheaper retail default; Vuly is more durable with a longer warranty.',
  },
  {
    slug: 'zupapa-vs-jumpflex',
    labelA: 'Zupapa',
    labelB: 'Jumpflex',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Jumpflex',
    intro: `Jumpflex is the more serious step up for older kids and heavier use.

Zupapa is the entry-level value pick, with a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. Jumpflex is built for older kids and heavier use, with up to a 10-year frame warranty, commonly 5-year warranty on the mat and springs, and a higher weight limit.

Choose Zupapa if you want a strong frame warranty at a lower price. Choose Jumpflex if you're keeping it for years and want the higher weight limit and longer mat and spring cover.`,
    metaDescription: 'Zupapa vs Jumpflex: an entry-level value brand against a sturdier step up for older kids and heavier use.',
  },
  {
    slug: 'skywalker-vs-jumpflex',
    labelA: 'Skywalker',
    labelB: 'Jumpflex',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Jumpflex',
    intro: `The real question is build strength and who will use it.

Skywalker is the lower-cost first trampoline, rated to about 275 lb on its standard rounds, with a 3-year frame warranty. Jumpflex rates its HERO models to 350 lb and carries a 10-year frame warranty, which suits teens, older kids, and heavier use.

Choose Skywalker if it's a first trampoline for younger kids. Choose Jumpflex if you want a longer-term trampoline for bigger jumpers.`,
    metaDescription: 'Skywalker vs Jumpflex: a lower-cost first trampoline against a longer-term pick for bigger jumpers. Build strength and who uses it.',
  },
  {
    slug: 'zupapa-vs-springfree',
    labelA: 'Zupapa',
    labelB: 'Springfree',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Springfree',
    intro: `The decision here is springs or no springs.

Zupapa uses metal coil springs with padding over the edge, the standard backyard setup, with a solid 10-year frame warranty. Springfree removes springs entirely, runs flexible rods below the mat, and hides the frame, taking one kind of hard-metal contact off the table, at a much higher price.

Choose Zupapa if you want a coil trampoline with a strong frame warranty for the money. Choose Springfree if you're set on the springless design and the longest single-warranty cover.`,
    metaDescription: 'Zupapa vs Springfree: a value coil brand against a premium springless one. Springs or no springs, at very different prices.',
  },
  {
    slug: 'zupapa-vs-acon',
    labelA: 'Zupapa',
    labelB: 'ACON',
    dataBrandA: 'Zupapa',
    dataBrandB: 'ACON',
    intro: `This is about tier and use.

Zupapa is the value range, mostly round and built for casual family jumping, with a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. ACON publishes no single-user weight limit and recommends about 300 lb, with a 10-year frame warranty, 5-year warranty on the mat and springs, and rectangular models for a more even bounce.

Choose Zupapa for casual family jumping at a value price. Choose ACON for harder use, performance bounce, and the option of a rectangle.`,
    metaDescription: 'Zupapa vs ACON: a value coil brand against a premium performance one. Casual family jumping vs harder use and rectangles.',
  },
  {
    slug: 'zupapa-vs-vuly',
    labelA: 'Zupapa',
    labelB: 'Vuly',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Vuly',
    intro: `The split is tier and what the money buys.

Zupapa is the value pick, with a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. Vuly is the more polished family setup, with a 10-year frame warranty on its upper models, 5-year warranty on the mat and springs, and a wider accessory range.

Choose Zupapa if you want strong frame cover at a value price. Choose Vuly if you want a more refined setup with broader accessories.`,
    metaDescription: 'Zupapa vs Vuly: a value brand with a strong frame warranty against a more polished family setup with accessories.',
  },
  {
    slug: 'zupapa-vs-alleyoop',
    labelA: 'Zupapa',
    labelB: 'AlleyOOP',
    dataBrandA: 'Zupapa',
    dataBrandB: 'AlleyOOP',
    intro: `A value brand against a premium, safety-led one.

Zupapa competes on long warranties and high listed weight ratings at value pricing, with a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. AlleyOOP is a heavier, safety-engineered build, with its DoubleBounce two-mat option and a lifetime frame warranty, at a much higher price.

Choose Zupapa if value and a strong frame warranty lead. Choose AlleyOOP if its safety engineering and lifetime frame warranty justify the extra spend for your situation.`,
    metaDescription: 'Zupapa vs AlleyOOP: a value brand against a premium safety-engineered one with a lifetime frame warranty. The question is whether the upgrade is worth it.',
  },
  {
    slug: 'skywalker-vs-alleyoop',
    labelA: 'Skywalker',
    labelB: 'AlleyOOP',
    dataBrandA: 'Skywalker',
    dataBrandB: 'AlleyOOP',
    intro: `These sit well apart on build and warranty.

Skywalker is the entry-level retail option, with a standard 3-year frame warranty and 1-year warranty on the mat and springs. AlleyOOP is a heavier, safety-engineered build, with its DoubleBounce two-mat option and a lifetime frame warranty.

Choose Skywalker for availability and an entry-level fit. Choose AlleyOOP if you want a long-term, safety-led trampoline with a lifetime frame warranty.`,
    metaDescription: 'Skywalker vs AlleyOOP: an entry-level retail brand against a safety-engineered premium one with a lifetime frame warranty. Far apart on build and warranty.',
  },
  {
    slug: 'skywalker-vs-zupapa',
    labelA: 'Skywalker',
    labelB: 'Zupapa',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Zupapa',
    intro: `Both are value brands, so this is about warranty and brand familiarity.

Skywalker is the established retail name, with broad parts availability and a standard 3-year frame warranty. Zupapa offers longer cover for the money, with a 10-year frame warranty and 2-year warranty on the mat, springs, and pads.

Either works as a first family trampoline. Choose Skywalker for the familiar brand and easy parts access. Choose Zupapa for the longer frame warranty.`,
    metaDescription: 'Skywalker vs Zupapa: two value brands. Skywalker is the familiar retail name with broad parts support; Zupapa offers longer frame cover.',
  },
  {
    slug: 'skywalker-vs-jumpking',
    labelA: 'Skywalker',
    labelB: 'JumpKing',
    dataBrandA: 'Skywalker',
    dataBrandB: 'JumpKing',
    intro: `Both are mainstream retail spring brands, so warranty is the divide.

Skywalker carries a standard 3-year frame warranty and 1-year warranty on the mat and springs. JumpKing is the older retail name, with a 1-year frame warranty and shorter cover on the mat, springs, and pads, across a familiar range of rounds, ovals, and rectangles.

Choose Skywalker for the stronger standard warranty. Choose JumpKing when its price, size, or availability lines up with what you need.`,
    metaDescription: 'Skywalker vs JumpKing: two mainstream retail spring brands. Skywalker has the stronger standard warranty; JumpKing is the legacy alternative.',
  },
  {
    slug: 'zupapa-vs-jumpking',
    labelA: 'Zupapa',
    labelB: 'JumpKing',
    dataBrandA: 'Zupapa',
    dataBrandB: 'JumpKing',
    intro: `This is spec-value against a legacy retail name.

Zupapa offers a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. JumpKing is the older retail brand, with a 1-year frame warranty and shorter cover on the mat, springs, and pads.

Choose Zupapa for the much longer warranty at the price. Choose JumpKing when its price, size, or availability fits what you need.`,
    metaDescription: 'Zupapa vs JumpKing: spec-value against a legacy retail name. Zupapa has the much longer warranty for the money.',
  },
  {
    slug: 'orcc-vs-zupapa',
    labelA: 'ORCC',
    labelB: 'Zupapa',
    dataBrandA: 'ORCC',
    dataBrandB: 'Zupapa',
    intro: `Both are Amazon-led, but they sit at different price points.

ORCC competes in the budget tier. Zupapa sits a step above, with longer warranty terms and higher listed weight ratings.

Choose ORCC if you want the lowest entry price. Choose Zupapa if the longer warranty and higher weight rating are worth the small step up.`,
    metaDescription: 'ORCC vs Zupapa: an Amazon budget brand against a mid-tier one. Zupapa lists longer warranties and higher weight ratings for a bit more.',
  },
  {
    slug: 'orcc-vs-jumpzylla',
    labelA: 'ORCC',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'ORCC',
    dataBrandB: 'JUMPZYLLA',
    intro: `ORCC and Jumpzylla are both Amazon budget brands in the same price range, and they overlap heavily on specs, warranty, and target buyer.

The real differences tend to be accessory inclusion, the sizes each offers, and the current Amazon price on the day you shop.

Compare the exact size and what's included for each, then let current pricing decide, since neither holds a clear long-term edge over the other.`,
    metaDescription: 'ORCC vs Jumpzylla: two Amazon budget brands that overlap heavily. The choice usually comes down to accessories, sizes, and current pricing.',
  },
  {
    slug: 'orcc-vs-skywalker',
    labelA: 'ORCC',
    labelB: 'Skywalker',
    dataBrandA: 'ORCC',
    dataBrandB: 'Skywalker',
    intro: `This is the lowest tier of outdoor trampolines against the volume mid-tier standard.

ORCC is an Amazon budget brand. Skywalker is the more established mid-tier name, with broader retail availability, stronger recognition, and longer warranty terms.

Choose ORCC for the lowest entry price. Choose Skywalker if you want a more proven brand with easier parts access and a longer warranty.`,
    metaDescription: 'ORCC vs Skywalker: an Amazon budget brand against a mid-tier retail one with broader availability and stronger recognition.',
  },
  {
    slug: 'jumpzylla-vs-zupapa',
    labelA: 'JUMPZYLLA',
    labelB: 'Zupapa',
    dataBrandA: 'JUMPZYLLA',
    dataBrandB: 'Zupapa',
    intro: `Both sit in the Amazon-led value space, so the split is warranty.

Jumpzylla may land lower on price, but it carries only a 1-year warranty across the main parts. Zupapa has a 10-year frame warranty and 2-year warranty on the mat, springs, and pads.

Both suit casual family use. Choose Jumpzylla if the lower price leads. Choose Zupapa when warranty length matters most, since budget trampolines often need parts within a few years.`,
    metaDescription: 'Jumpzylla vs Zupapa: two Amazon value brands. Jumpzylla may price lower; Zupapa carries a much longer frame warranty.',
  },
  {
    slug: 'jumpzylla-vs-skywalker',
    labelA: 'JUMPZYLLA',
    labelB: 'Skywalker',
    dataBrandA: 'JUMPZYLLA',
    dataBrandB: 'Skywalker',
    intro: `Both are budget round trampolines, so this is about warranty, capacity, and availability.

Skywalker is the established retail default, with broad parts access and a standard 3-year frame warranty. Jumpzylla is the lower entry price and lists a higher weight limit, up to 450 lb on its 14 to 16ft models, but carries only a 1-year warranty across the main parts.

Choose Skywalker for the safer retail default and easier parts support. Choose Jumpzylla if a higher listed weight limit at a low price matters more than warranty length.`,
    metaDescription: 'Jumpzylla vs Skywalker: two budget round brands. Jumpzylla lists a higher weight limit; Skywalker has longer parts support and warranty.',
  },
  {
    slug: 'upper-bounce-vs-skywalker',
    labelA: 'Upper Bounce',
    labelB: 'Skywalker',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'Skywalker',
    intro: `Both are mass-market, so this is warranty and range.

Skywalker is the cleaner default, with a standard 3-year frame warranty and 1-year warranty on the mat and springs, and broad parts support. Upper Bounce carries very short warranty terms but competes on shape options, including rectangles and squares, and strong replacement-parts availability.

Choose Skywalker for the longer frame warranty and easy support. Choose Upper Bounce if you want a rectangle or square, or value its parts ecosystem.`,
    metaDescription: 'Upper Bounce vs Skywalker: a budget parts-and-shapes brand against the retail default. Skywalker has the longer frame warranty; Upper Bounce has more shapes.',
  },
  {
    slug: 'upper-bounce-vs-zupapa',
    labelA: 'Upper Bounce',
    labelB: 'Zupapa',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'Zupapa',
    intro: `Both compete below the premium tier, so warranty separates them.

Zupapa has a 10-year frame warranty and 2-year warranty on the mat, springs, and pads. Upper Bounce carries very short warranty terms but offers more shapes, including rectangles and squares, and strong replacement-parts support.

Choose Zupapa for the stronger warranty. Choose Upper Bounce if you want a specific shape or easy access to parts at a budget price.`,
    metaDescription: 'Upper Bounce vs Zupapa: two below-premium brands. Zupapa has the stronger warranty; Upper Bounce is the budget parts-and-shapes option.',
  },
  {
    slug: 'upper-bounce-vs-jumpzylla',
    labelA: 'Upper Bounce',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'JUMPZYLLA',
    intro: `Both compete in the Amazon budget tier and overlap heavily on price and target buyer.

Upper Bounce is the older brand with strong replacement-parts availability, which matters since budget trampolines often need parts within a few years. Jumpzylla is newer, with curved enclosure poles and a higher listed weight capacity.

Choose Upper Bounce if parts availability is a priority. Choose Jumpzylla for the higher listed capacity, and let current pricing settle a close call.`,
    metaDescription: 'Upper Bounce vs Jumpzylla: two Amazon budget brands that overlap heavily. Upper Bounce leads on parts; Jumpzylla lists higher weight capacity.',
  },
  {
    slug: 'jumpking-vs-jumpflex',
    labelA: 'JumpKing',
    labelB: 'Jumpflex',
    dataBrandA: 'JumpKing',
    dataBrandB: 'Jumpflex',
    intro: `This is a legacy retail brand against a clear step up.

JumpKing is the older retail option, with a 1-year frame warranty and shorter cover on the mat, springs, and pads, but a good range of rectangular models. Jumpflex is built for the long term, with up to a 10-year frame warranty and commonly 5-year warranty on the mat and springs.

Choose JumpKing if you want a rectangle from a familiar name at a lower price. Choose Jumpflex if you want a sturdier build that lasts, with a much longer warranty.`,
    metaDescription: 'JumpKing vs Jumpflex: a legacy retail brand against a sturdier long-term family trampoline. A clear step up in build and warranty.',
  },
  {
    slug: 'akrobat-vs-springfree',
    labelA: 'Akrobat',
    labelB: 'Springfree',
    dataBrandA: 'Akrobat',
    dataBrandB: 'Springfree',
    intro: `The decision here is springs or no springs.

Springfree removes springs, running flexible rods below a hidden frame, above-ground only. Akrobat uses high-performance coil springs in rectangular models, available above-ground or flush in-ground, for a firmer bounce suited to older kids and people doing flips or tricks.

Choose Springfree if a safety-led, springless design is the priority. Choose Akrobat for a stronger bounce and the flexibility of an in-ground install.`,
    metaDescription: 'Akrobat vs Springfree: a coil performance brand with in-ground options against an above-ground springless one. Bounce and install vs safety design.',
  },
  {
    slug: 'akrobat-vs-acon',
    labelA: 'Akrobat',
    labelB: 'ACON',
    dataBrandA: 'Akrobat',
    dataBrandB: 'ACON',
    intro: `Both are premium performance spring brands that can be set up above-ground or in-ground, so the real divide is warranty and entry price.

ACON publishes no single-user weight limit and recommends about 300 lb, with a 10-year frame warranty, 5-year warranty on the mat and springs, and 2-year warranty on pads. Akrobat carries a lifetime frame warranty, 12-year warranty on springs, and 5-year warranty on the mat and pads.

Choose ACON for the lower entry price. Choose Akrobat for the stronger warranty across the frame, springs, and pads.`,
    metaDescription: 'Akrobat vs ACON: two premium performance coil brands, above or in-ground. Akrobat has the longer warranty; ACON has the lower entry price.',
  },
  {
    slug: 'avyna-vs-akrobat',
    labelA: 'Avyna',
    labelB: 'Akrobat',
    dataBrandA: 'Avyna',
    dataBrandB: 'Akrobat',
    intro: `Both are premium in-ground performance brands, so capacity and warranty separate them.

Avyna is rated to 350 lb per jumper, with a lifetime frame warranty, 10-year warranty on springs, and 3-year warranty on the mat and pads. Akrobat is rated to 331 lb, with a lifetime frame warranty, 12-year warranty on springs, and 5-year warranty on the mat and pads.

Choose Avyna if the higher weight rating leads. Choose Akrobat for the longer mat, spring, and pad cover.`,
    metaDescription: 'Avyna vs Akrobat: two premium in-ground performance brands. Avyna leans toward capacity; Akrobat toward longer mat, spring, and pad cover.',
  },
  {
    slug: 'skywalker-vs-sportspower',
    labelA: 'Skywalker',
    labelB: 'Sportspower',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Both are mass-market brands sold heavily through Walmart and Costco, so this is a close, budget-tier call.

Skywalker is the more recognized name, with broad availability and longer warranty terms. Sportspower, sold under the Bounce Pro label, typically prices at or below Skywalker with shorter coverage.

Choose Skywalker if the longer warranty and brand familiarity matter. Choose Sportspower if the lower price is the priority and it's in stock where you shop.`,
    metaDescription: 'Skywalker vs Sportspower: two mass-market brands sold through Walmart and Costco. Sportspower is the cheaper option; Skywalker has longer warranty terms.',
  },
  {
    slug: 'skywalker-vs-bounce-pro',
    labelA: 'Skywalker',
    labelB: 'Bounce Pro',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Bounce Pro is Sportspower's brand label at Walmart, so these two compete head-to-head on the same shelves.

Skywalker typically lists longer warranty terms and has broader brand recognition. Bounce Pro usually prices lower.

Choose Bounce Pro if the lowest price is the priority. Choose Skywalker if you'd rather have the longer warranty and the more established name.`,
    metaDescription: 'Skywalker vs Bounce Pro: direct mass-market competitors at Walmart and Costco. Bounce Pro is the cheaper pick; Skywalker has longer warranty terms.',
  },
  {
    slug: 'jumpking-vs-bounce-pro',
    labelA: 'JumpKing',
    labelB: 'Bounce Pro',
    dataBrandA: 'JumpKing',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `JumpKing sits a tier above Bounce Pro, so this is entry-level against a modest step up.

Bounce Pro is the budget mass-market option, sold cheaply through Walmart. JumpKing is the older mid-tier retail name, with more model variety and somewhat longer coverage.

Choose Bounce Pro if the lowest price is the priority. Choose JumpKing if you want a bit more range and warranty for a step up in price.`,
    metaDescription: 'JumpKing vs Bounce Pro: a legacy mid-tier brand against a budget mass-market one. The choice is entry-level or a modest step up.',
  },
  {
    slug: 'bcan-vs-orcc',
    labelA: 'BCAN',
    labelB: 'ORCC',
    dataBrandA: 'BCAN',
    dataBrandB: 'ORCC',
    intro: `Both are Amazon budget brands, but they target different uses.

BCAN is best known for mini and small-diameter trampolines, including indoor models. ORCC produces full-size outdoor trampolines.

Choose BCAN if you want a mini or small trampoline, especially for indoor use. Choose ORCC if you need a full-size outdoor trampoline. The comparison only really matters at the small end of each brand's range.`,
    metaDescription: 'BCAN vs ORCC: two Amazon budget brands for different uses. BCAN is known for mini trampolines; ORCC makes full outdoor sizes.',
  },
  {
    slug: 'little-tikes-vs-skywalker',
    labelA: 'Little Tikes',
    labelB: 'Skywalker',
    dataBrandA: 'Little Tikes',
    dataBrandB: 'Skywalker',
    intro: `These target different ages.

Little Tikes makes small kids' trampolines, typically under 7ft, with low weight limits and toddler-focused designs. Skywalker covers the full residential size range, including a Mini line that competes more directly.

Choose Little Tikes if your kids are toddlers or preschoolers. Choose Skywalker once they're older and you need a full-size trampoline.`,
    metaDescription: 'Little Tikes vs Skywalker: a toddler brand against a full-range retail one. For toddlers, Little Tikes; for older kids, Skywalker\'s full sizes.',
  },
  {
    slug: 'little-tikes-vs-jumpzylla',
    labelA: 'Little Tikes',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'Little Tikes',
    dataBrandB: 'JUMPZYLLA',
    intro: `Both make kids' trampolines, but for different ages.

Little Tikes is the established toddler brand, with low-height designs and low weight limits. Jumpzylla targets older kids, with higher listed weight ratings and outdoor-grade construction.

Choose Little Tikes for toddlers and preschoolers. Choose Jumpzylla for older kids who need a larger, higher-capacity outdoor trampoline.`,
    metaDescription: 'Little Tikes vs Jumpzylla: a toddler brand against one built for older kids. Match the choice to your child\'s age.',
  },
  {
    slug: 'bcan-vs-little-tikes',
    labelA: 'BCAN',
    labelB: 'Little Tikes',
    dataBrandA: 'BCAN',
    dataBrandB: 'Little Tikes',
    intro: `Both make smaller trampolines, but for different ages and settings.

BCAN focuses on indoor mini trampolines and small outdoor models for older kids. Little Tikes focuses on toddlers, with low-height, plastic-frame designs.

Choose Little Tikes for toddlers. Choose BCAN for indoor rebounding or a small trampoline for an older child. Parents of mixed-age kids often end up needing one of each.`,
    metaDescription: 'BCAN vs Little Tikes: mini trampolines for older kids and indoor use against toddler-focused designs. Match to your child\'s age.',
  },
];

function parseFrontmatter(markdown: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: markdown };

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const keyValue = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyValue) continue;
    frontmatter[keyValue[1].trim()] = keyValue[2].trim();
  }

  return {
    frontmatter,
    body: markdown.slice(match[0].length),
  };
}

function collectIntroParagraphs(lines: string[], startIndex: number, endIndex: number): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (let i = startIndex; i < endIndex; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith('**Affiliate disclosure:**')) break;
    if (!line) {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) paragraphs.push(current.join(' '));
  return paragraphs;
}

function collectDraftTakeaways(lines: string[], keyTakeawaysIndex: number): string[] {
  if (keyTakeawaysIndex < 0) return [];

  const takeaways: string[] = [];
  for (let i = keyTakeawaysIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === 'Shared across all models') break;
    if (!line) continue;
    if (!line.startsWith('- ')) {
      if (takeaways.length > 0) break;
      continue;
    }
    takeaways.push(line.slice(2).trim());
  }
  return takeaways;
}

function collectDraftSharedSpecs(lines: string[], sharedIndex: number): Array<{ label: string; value: string }> {
  if (sharedIndex < 0) return [];

  const values = lines
    .slice(sharedIndex + 1)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'));

  const specs: Array<{ label: string; value: string }> = [];
  for (let i = 0; i < values.length - 1; i += 2) {
    specs.push({ label: values[i], value: values[i + 1] });
  }
  return specs;
}

function parseDraftComparison(slug: string, markdown: string): ComparisonDefinition | null {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const lines = body.split('\n');
  const h1Index = lines.findIndex((line) => line.startsWith('# '));
  if (h1Index < 0) return null;

  const h1 = lines[h1Index].replace(/^#\s+/, '').trim();
  const titleParts = h1.split(/\s+vs\s+/i);
  if (titleParts.length !== 2) return null;

  const fullSpecIndex = lines.findIndex((line) => /^##\s+Full Spec Comparison\s*$/i.test(line.trim()));
  const introParagraphs = collectIntroParagraphs(
    lines,
    h1Index + 1,
    fullSpecIndex >= 0 ? fullSpecIndex : lines.length,
  );
  const keyTakeawaysIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'key takeaways');
  const sharedIndex = lines.findIndex((line) => line.trim() === 'Shared across all models');

  return {
    slug,
    labelA: titleParts[0].trim(),
    labelB: titleParts[1].trim(),
    dataBrandA: titleParts[0].trim(),
    dataBrandB: titleParts[1].trim(),
    intro: introParagraphs.join(' '),
    introParagraphs,
    keyTakeaways: collectDraftTakeaways(lines, keyTakeawaysIndex),
    sharedSpecs: collectDraftSharedSpecs(lines, sharedIndex),
    metaDescription: frontmatter['meta-description'],
    forceAffiliateDisclosure: true,
    source: 'draft',
  };
}

function getDraftComparisonDefinitions(): ComparisonDefinition[] {
  if (!fs.existsSync(DRAFT_COMPARISON_DIR)) return [];

  return fs
    .readdirSync(DRAFT_COMPARISON_DIR)
    .filter((file) => file.endsWith('.md'))
    .filter((file) => file !== 'comparison-article-production-plan.md')
    .sort()
    .map((file) => {
      const slug = file.replace(/\.md$/i, '');
      const markdown = fs.readFileSync(path.join(DRAFT_COMPARISON_DIR, file), 'utf8');
      return parseDraftComparison(slug, markdown);
    })
    .filter((definition): definition is ComparisonDefinition => definition !== null);
}

function getComparisonDefinitions(): ComparisonDefinition[] {
  const seen = new Set([
    ...BASE_COMPARISON_DEFINITIONS.map((definition) => definition.slug),
    ...SKYBOUND_COMPARISON_DEFINITIONS.map((definition) => definition.slug),
  ]);
  const drafts = getDraftComparisonDefinitions().filter((definition) => !seen.has(definition.slug));
  return [...BASE_COMPARISON_DEFINITIONS, ...SKYBOUND_COMPARISON_DEFINITIONS, ...drafts];
}

function hydrateComparison(
  definition: ComparisonDefinition,
  brandsBySlug: Map<string, Brand>,
): ApprovedComparison | null {
  const brandA = brandsBySlug.get(brandSlug(definition.dataBrandA)) ?? {
    name: definition.labelA,
    slug: brandSlug(definition.labelA),
    products: [],
    fromPriceUsd: null,
    sourceUrl: null,
  };
  const brandB = brandsBySlug.get(brandSlug(definition.dataBrandB)) ?? {
    name: definition.labelB,
    slug: brandSlug(definition.labelB),
    products: [],
    fromPriceUsd: null,
    sourceUrl: null,
  };

  if (!brandA.name || !brandB.name) {
    return null;
  }

  return {
    ...definition,
    title: removeDuplicateReview(cleanDuplicateBrandPrefixes(`${definition.labelA} vs ${definition.labelB}`)),
    href: `/compare/${definition.slug}/`,
    brandA,
    brandB,
    brandAHasData: brandA.products.length > 0,
    brandBHasData: brandB.products.length > 0,
  };
}

export function getApprovedComparisons(limit?: number): ApprovedComparison[] {
  const brandsBySlug = new Map(getAllBrands().map((brand) => [brand.slug, brand]));
  const comparisons = getComparisonDefinitions()
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
