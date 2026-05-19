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
    intro: `Both Springfree and Vuly market themselves on engineering, and both sit at the top of the price range. Springfree removes springs entirely, using fiberglass rods beneath the mat. Vuly's lineup spans both traditional coil-spring trampolines and its springless Thunder line, which uses Leaf Springs — flat steel springs positioned at the frame base rather than horizontal coils between mat and frame. Springfree typically prices higher and offers a longer warranty across all parts, but Vuly has a wider accessory ecosystem and stronger model variety. The most direct comparison is between Springfree and Vuly's Thunder, which is where the springless-vs-springless decision actually lives.`,
  },
  {
    slug: 'acon-vs-vuly',
    labelA: 'ACON',
    labelB: 'Vuly',
    dataBrandA: 'ACON',
    dataBrandB: 'Vuly',
    intro: `ACON and Vuly are two of the most recognized premium brands outside the US mass market, and both price above $1,500. ACON uses a traditional coil spring system tuned for performance bouncing. Vuly's range covers both traditional coil-spring trampolines and its springless Thunder line, which uses Leaf Springs for a different bounce profile. The decision usually comes down to what you want the trampoline for — serious bouncing and gymnastics-style use, or a refined family setup with matching accessories — and on the Vuly side, whether you want a coil or springless design.`,
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
    intro: `Both Vuly and Jumpflex are premium brands with non-US engineering origins and strong followings among parents researching beyond the mass-market options. Vuly's range includes both traditional coil-spring designs and its springless Thunder line, which uses Leaf Springs. Jumpflex uses traditional coil springs across its full range with high listed weight capacities. Vuly typically prices higher; Jumpflex typically lists longer warranty terms and higher weight ratings. If you're weighing Vuly's Thunder against a Jumpflex HERO, you're comparing fundamentally different bounce systems — that's where the choice gets interesting.`,
  },
  {
    slug: 'vuly-vs-alleyoop',
    labelA: 'Vuly',
    labelB: 'AlleyOOP',
    dataBrandA: 'Vuly',
    dataBrandB: 'AlleyOOP',
    intro: `Vuly and AlleyOOP are both premium brands with proprietary engineering, but they target slightly different buyers. Vuly's range covers both traditional coil-spring designs and its signature springless Thunder line, which uses Leaf Springs (flat steel springs positioned at the frame base) for a different bounce profile. AlleyOOP uses traditional coil springs but adds patented options like DoubleBounce, a two-mat system that reduces landing impact by roughly 50%, and PowerBounce, an additional row of springs to fine-tune bounce. AlleyOOP typically backs its frames with a lifetime warranty; Vuly's coverage is shorter but the accessory ecosystem and model range are wider. The decision often comes down to which Vuly model you're considering — Thunder competes most directly with AlleyOOP at the top of the range.`,
  },
  {
    slug: 'jumpflex-vs-alleyoop',
    labelA: 'Jumpflex',
    labelB: 'AlleyOOP',
    dataBrandA: 'Jumpflex',
    dataBrandB: 'AlleyOOP',
    intro: `Jumpflex and AlleyOOP are both premium spring trampolines but reach that tier with different priorities. Jumpflex uses a DualRing frame with high-tensile 1.7" steel and lists a 550 lb total weight rating, with curved net poles to reduce pole-strike risk. AlleyOOP uses cold-rolled steel frames and offers patented DoubleBounce two-mat technology and adjustable PowerBounce springs. AlleyOOP typically prices higher with a lifetime frame warranty; Jumpflex offers a 10-year frame warranty with a lifetime upgrade available on HERO and MEGA models. If your priority is multi-jumper safety and customization, AlleyOOP wins. If you want a higher listed weight capacity at a lower starting price, Jumpflex makes the case.`,
  },
  {
    slug: 'springfree-vs-avyna',
    labelA: 'Springfree',
    labelB: 'Avyna',
    dataBrandA: 'Springfree',
    dataBrandB: 'Avyna',
    intro: `Springfree and Avyna are both engineered premium brands, but they reach the top tier through different mechanical systems. Springfree removes springs entirely, using flexible fiberglass rods beneath the mat. Avyna uses a traditional galvanized spring system paired with its Air X-TREME mat, which is designed with a 70% open structure for less air resistance and a smoother bounce. Avyna also leads the US in-ground category, where Springfree doesn't compete directly. Both offer long warranties — Avyna's lifetime frame coverage exceeds Springfree's 10-year terms. The decision usually comes down to whether you want a springless above-ground system, or a flush in-ground install that blends into the yard.`,
  },
  {
    slug: 'avyna-vs-acon',
    labelA: 'Avyna',
    labelB: 'ACON',
    dataBrandA: 'Avyna',
    dataBrandB: 'ACON',
    intro: `Avyna and ACON are both performance-focused premium brands using traditional coil springs, but they differ on what surrounds those springs. Avyna's Pro-Line trampolines use the Air X-TREME perforated mat — engineered for 70% more airflow than standard mats — and feature 11- to 14-gauge galvanized steel frames with weight capacities listed up to 1,750 lb. ACON uses its Performance Springs with mats tuned for high rebound, and is primarily above-ground. Avyna offers a lifetime frame warranty plus 10 years on springs; ACON covers the frame and mat well but only 1 year on enclosure components. If you're cross-shopping these, you're weighing Dutch in-ground engineering against Finnish above-ground performance.`,
  },
  {
    slug: 'avyna-vs-alleyoop',
    labelA: 'Avyna',
    labelB: 'AlleyOOP',
    dataBrandA: 'Avyna',
    dataBrandB: 'AlleyOOP',
    intro: `Avyna and AlleyOOP are both safety-positioned premium brands, but they target different yard configurations. AlleyOOP focuses on above-ground installations with its DoubleBounce two-mat system and adjustable PowerBounce springs, both engineered to reduce kickback when multiple jumpers are on the mat. Avyna's strongest line is in-ground, with the Air X-TREME mat and a flush profile that integrates into the landscape. Both offer lifetime frame warranties. The choice usually comes down to install type: AlleyOOP if you want an above-ground trampoline with industry-leading multi-jumper safety; Avyna if you want a clean in-ground look with European engineering and a higher listed weight rating.`,
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
    intro: `Skywalker is a volume leader in mass-market retail at $400 to $900. ACON is a Finnish premium brand priced from roughly $1,500 upward. The price gap is real, and so are the differences across mat material, frame gauge, and warranty length. If you're cross-shopping these two, you're deciding between a known mid-tier option and a step up that costs three to four times as much.`,
  },
  {
    slug: 'skywalker-vs-vuly',
    labelA: 'Skywalker',
    labelB: 'Vuly',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Vuly',
    intro: `Skywalker dominates mid-tier retail at $400 to $900. Vuly competes in the premium tier at typically two to three times the price, with a range that includes both traditional coil-spring trampolines and its springless Thunder line (which uses Leaf Springs). Most parents reach this comparison after deciding whether a $500 trampoline meets their needs or whether they want to spend more for a longer warranty, a different build standard, and the option of a springless system.`,
  },
  {
    slug: 'zupapa-vs-jumpflex',
    labelA: 'Zupapa',
    labelB: 'Jumpflex',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Jumpflex',
    intro: `Zupapa and Jumpflex are both online-led brands that compete on strong spec sheets, but they target different price points. Zupapa sits in the $400 to $900 range with 10-year warranties on most parts. Jumpflex prices from roughly $700 to $1,500+, with a heavier DualRing frame, a 550 lb total weight rating, and a 10-year frame warranty with a lifetime upgrade available on HERO and MEGA models. Most parents land on this comparison when deciding whether to stretch the budget for the Jumpflex build, or stay with Zupapa's lower entry point and competitive warranty terms.`,
  },
  {
    slug: 'skywalker-vs-jumpflex',
    labelA: 'Skywalker',
    labelB: 'Jumpflex',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Jumpflex',
    intro: `Skywalker and Jumpflex sit in adjacent price tiers and the cross-shop is common. Skywalker is the US mass-market leader at $400 to $900, with broad retail availability and its patented no-gap enclosure system. Jumpflex sits one tier higher at roughly $700 to $1,500+, competing on a DualRing frame, curved net poles, and a 550 lb total weight rating. Skywalker offers shorter warranty terms across most components; Jumpflex covers the frame for 10 years with a lifetime upgrade option. The decision usually comes down to whether the upgrade math works for your family — Skywalker is easier to find locally; Jumpflex is built for a longer lifespan.`,
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
    slug: 'zupapa-vs-vuly',
    labelA: 'Zupapa',
    labelB: 'Vuly',
    dataBrandA: 'Zupapa',
    dataBrandB: 'Vuly',
    intro: `Zupapa and Vuly sit in different price tiers, but parents do cross-shop them when weighing the upgrade math. Zupapa is an Amazon-led mid-tier brand priced $400 to $700, with 10-year warranties on most parts. Vuly competes in the premium tier with a range that spans both traditional coil-spring trampolines and its springless Thunder line (which uses Leaf Springs), typically at two to three times Zupapa's price. The decision usually comes down to whether you want strong specs at value pricing, or proprietary engineering with a wider accessory ecosystem at premium pricing.`,
  },
  {
    slug: 'zupapa-vs-alleyoop',
    labelA: 'Zupapa',
    labelB: 'AlleyOOP',
    dataBrandA: 'Zupapa',
    dataBrandB: 'AlleyOOP',
    intro: `Zupapa and AlleyOOP target different buyers but the comparison comes up when parents are weighing whether the upgrade is worth it. Zupapa is an Amazon-direct mid-tier brand priced $400 to $700, competing on long warranties and high listed weight ratings. AlleyOOP is a US premium brand by JumpSport priced from around $1,500, with a lifetime frame warranty, patented DoubleBounce two-mat option, and over 50 safety patents accumulated over 25+ years in the category. If you're cross-shopping these, the question is whether the extra $1,000+ for AlleyOOP's safety engineering and longer expected lifespan is justified for your situation.`,
  },
  {
    slug: 'skywalker-vs-alleyoop',
    labelA: 'Skywalker',
    labelB: 'AlleyOOP',
    dataBrandA: 'Skywalker',
    dataBrandB: 'AlleyOOP',
    intro: `Skywalker and AlleyOOP sit at opposite ends of the US trampoline market, but parents researching beyond the mass-market option often end up comparing them. Skywalker dominates retail at $400 to $900, with a patented no-gap enclosure system and broad availability at Walmart, Target, and Costco. AlleyOOP is a US-engineered premium brand from JumpSport priced from roughly $1,500, with patented DoubleBounce two-mat technology, optional PowerBounce adjustable springs, and a lifetime frame warranty. The decision usually comes down to whether the safety engineering and longevity justify three to four times the price.`,
  },
  {
    slug: 'skywalker-vs-zupapa',
    labelA: 'Skywalker',
    labelB: 'Zupapa',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Zupapa',
    intro: `If you're shopping Amazon or Walmart in the $400 to $900 range, this is the comparison you're probably already making. Skywalker has broader retail distribution and stronger brand recognition. Zupapa typically lists longer warranties and higher weight ratings at similar price points. The two are the most cross-shopped pair in the mid-tier.`,
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
    intro: `Both Zupapa and JumpKing compete in the mid-tier, but they reach different buyers. Zupapa skews Amazon-direct with longer listed warranty terms and higher listed weight ratings. JumpKing has broader traditional retail presence and stronger brand recognition. The choice often comes down to whether you trust the Amazon-direct brand with more generous specs or the established name with shorter warranty terms.`,
  },
  {
    slug: 'orcc-vs-zupapa',
    labelA: 'ORCC',
    labelB: 'Zupapa',
    dataBrandA: 'ORCC',
    dataBrandB: 'Zupapa',
    intro: `Both ORCC and Zupapa are Amazon-led brands, but they sit at different price points. ORCC competes in the $200 to $400 budget tier. Zupapa typically prices $400 to $700 with longer warranty terms and higher listed weight ratings. Most parents arrive here weighing whether the extra $150 to $200 is worth it.`,
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
    slug: 'jumpzylla-vs-skywalker',
    labelA: 'JUMPZYLLA',
    labelB: 'Skywalker',
    dataBrandA: 'JUMPZYLLA',
    dataBrandB: 'Skywalker',
    intro: `JUMPZYLLA and Skywalker compete on the same shelf for the same buyer: parents looking at trampolines under $900. JUMPZYLLA is a newer Amazon-led brand founded in 2020, priced $200 to $400, with curved enclosure poles, listed weight capacities of 330 to 450 lb, and a 2-year warranty. Skywalker is the established US mass-market leader at $400 to $900, with broader retail distribution, longer warranty coverage, and the patented no-gap enclosure. Both target families buying their first trampoline, but they differ on price, brand recognition, and expected lifespan before parts need replacing.`,
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
    slug: 'upper-bounce-vs-zupapa',
    labelA: 'Upper Bounce',
    labelB: 'Zupapa',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'Zupapa',
    intro: `Upper Bounce and Zupapa are both Amazon-led brands, but they sit at different points within the mid-tier. Upper Bounce is best known for its replacement parts business and its budget complete units, typically priced lower with shorter warranty terms. Zupapa competes on long warranties — 10 years on most parts — and higher listed weight ratings at slightly higher prices. If you're shopping the lower end of Amazon's trampoline category, you're choosing between Upper Bounce's lower entry price and parts availability, or Zupapa's longer warranty coverage and higher listed specs.`,
  },
  {
    slug: 'upper-bounce-vs-jumpzylla',
    labelA: 'Upper Bounce',
    labelB: 'JUMPZYLLA',
    dataBrandA: 'Upper Bounce',
    dataBrandB: 'JUMPZYLLA',
    intro: `Upper Bounce and JUMPZYLLA both compete in the Amazon budget tier under $400 and overlap heavily on price, target buyer, and accessory inclusion. Upper Bounce is the older brand with strong replacement parts availability — a meaningful factor since budget trampolines often need parts within 2-3 years. JUMPZYLLA is newer (founded 2020), with curved enclosure poles and listed weight ratings up to 450 lb. The choice usually comes down to current Amazon pricing the day you shop, plus whether you value Upper Bounce's parts ecosystem or JUMPZYLLA's higher listed capacity.`,
  },
  {
    slug: 'jumpking-vs-jumpflex',
    labelA: 'JumpKing',
    labelB: 'Jumpflex',
    dataBrandA: 'JumpKing',
    dataBrandB: 'Jumpflex',
    intro: `JumpKing and Jumpflex don't sit in the exact same price tier, but parents cross-shop them when deciding between a known legacy brand and a newer premium-leaning option. JumpKing is a long-established US mid-tier brand with broad retail presence and stronger availability of rectangular models, which appeals to gymnastics-focused families. Jumpflex prices higher with a DualRing frame, 550 lb total weight rating, curved net poles, and a 10-year frame warranty with a lifetime upgrade available. The decision usually comes down to whether you want a rectangle from a legacy brand at a lower price, or a heavier-spec round from a newer premium-tier option.`,
  },
  {
    slug: 'akrobat-vs-springfree',
    labelA: 'Akrobat',
    labelB: 'Springfree',
    dataBrandA: 'Akrobat',
    dataBrandB: 'Springfree',
    intro: `Akrobat and Springfree are both engineered premium brands competing on safety and bounce quality, but they take opposite mechanical approaches. Akrobat is a Slovenian brand using traditional springs paired with its AkroVent Sport+ perforated mat (engineered for a 70% open structure for less air resistance) and the AkroSpring Pro suspension system. Springfree removes springs entirely, using flexible fiberglass rods beneath the mat. Both price from roughly $1,500 upward, and both market heavily on safety. Akrobat's flat-to-the-ground in-ground line is a key differentiator — Springfree is primarily above-ground. The decision usually comes down to whether you want a springless above-ground design or a flush in-ground installation.`,
  },
  {
    slug: 'akrobat-vs-acon',
    labelA: 'Akrobat',
    labelB: 'ACON',
    dataBrandA: 'Akrobat',
    dataBrandB: 'ACON',
    intro: `Akrobat and ACON are both European premium brands using traditional coil springs, and both target performance-oriented jumpers. Akrobat (Slovenia) leads with the AkroVent perforated mat — engineered for 70% airflow — and the AkroSpring Pro suspension system, with its strongest line in flat-to-ground in-ground installations. ACON (Finland) uses its Performance Springs paired with mats tuned for high rebound, and is primarily above-ground. Both offer 10+ year warranties on key components. The decision usually comes down to whether you want above-ground performance with a strong accessory range (ACON), or flat-to-ground in-ground engineering with a sleeker aesthetic (Akrobat).`,
  },
  {
    slug: 'avyna-vs-akrobat',
    labelA: 'Avyna',
    labelB: 'Akrobat',
    dataBrandA: 'Avyna',
    dataBrandB: 'Akrobat',
    intro: `Avyna and Akrobat are the two strongest in-ground premium brands available in the US, and most parents researching flush-to-ground trampolines end up choosing between them. Avyna (Netherlands) uses its Air X-TREME mat with 70% airflow, paired with 11- to 14-gauge galvanized steel frames and a lifetime frame warranty. Akrobat (Slovenia) uses the AkroVent perforated mat and AkroSpring Pro suspension, with a similar performance profile and flat-to-ground installation. Avyna is more widely distributed in the US (Walmart, Amazon, trampolines.com) and offers a deeper above-ground line. Akrobat is the more focused in-ground specialist. If in-ground is your priority, this is the comparison that matters.`,
  },
  {
    slug: 'skywalker-vs-sportspower',
    labelA: 'Skywalker',
    labelB: 'Sportspower',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Skywalker and Sportspower (sold under the Bounce Pro label) are both US mass-market brands sold heavily through Walmart and Costco. Sportspower typically prices at or slightly below Skywalker with shorter warranty terms. Both are sized and priced to be the first trampoline most families buy.`,
  },
  {
    slug: 'skywalker-vs-bounce-pro',
    labelA: 'Skywalker',
    labelB: 'Bounce Pro',
    dataBrandA: 'Skywalker',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `Bounce Pro (Sportspower's brand label at Walmart) and Skywalker are direct mass-market competitors at the same retailers. Bounce Pro typically prices lower. Skywalker typically lists longer warranty terms. If you're shopping at Walmart or Costco, you're probably choosing between these two.`,
  },
  {
    slug: 'jumpking-vs-bounce-pro',
    labelA: 'JumpKing',
    labelB: 'Bounce Pro',
    dataBrandA: 'JumpKing',
    dataBrandB: 'Sportspower / Bounce Pro',
    intro: `JumpKing is a mid-tier legacy brand. Bounce Pro sits one tier below in the budget mass-market segment. Pricing and warranty terms differ accordingly. The choice usually comes down to whether you want the entry-level option or the step up.`,
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
