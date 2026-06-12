# Comparison Article Production Plan

## Scope

This plan covers the 30 draft comparison articles in:

`/Users/scott/Projects/Bounce Arena USA/bouncearena-us/blog articles/new comparison articles`

The existing live `/compare/` pages are generated from app data, not from these Markdown files. The practical production path is to keep these drafts as editorial source material, then wire each comparison into the existing `/compare/[pair]/` route through `lib/comparisons.ts` and `data/products-us.csv`.

## Existing Compare Page Structure

Use the current `/compare/[pair]/` structure:

1. Breadcrumbs.
2. H1: `{Brand A} vs {Brand B}`.
3. Intro paragraphs from the article draft.
4. Affiliate disclosure when either featured model has an affiliate/source URL and the brand is affiliate-enabled.
5. Featured Models section with one model per brand.
6. Quiz CTA:
   - Heading: `Not sure which brand fits best?`
   - Link: `/quiz/`
   - Button text: `Take the quiz ->`
7. Full Spec Comparison:
   - Key takeaways.
   - Full spec table.
   - `Shared across all models` section, derived from specs that are identical across the compared model rows.
8. Related Reading:
   - Brand A page.
   - Brand B page.
   - Related comparison links involving either brand.

## Source Data

Primary CSV supplied by the user:

`/Users/scott/Downloads/Trampoline Comparison Table 2026 - USA (7).csv`

Current app CSV:

`/Users/scott/Projects/Bounce Arena USA/bouncearena-us/data/products-us.csv`

Both files currently have 265 rows and 41 columns, but the supplied download is newer. Before implementation, diff the two files and replace `data/products-us.csv` if the newer download contains intended updates.

The live spec table currently uses these fields:

- Size
- Shape
- Max diameter
- Overall length
- Overall width
- Total height
- Mat height
- Safety net height
- Spring system
- Spring count
- Spring length
- Max single user
- Combined weight
- Frame material
- Frame tube diameter
- Mat material
- Net material
- Padding material
- Made in
- ASTM certified
- Standard details
- Warranty - frame
- Warranty - mat
- Warranty - springs
- Warranty - net
- Price

The attached CSV also has `mat_diameter_in`, `mat_length_in`, `mat_width_in`, `static_weight_rating_lb`, `other_standards`, `warranty_pads_years`, `warranty_parts_years`, `source_urls`, and notes fields. These are available in the CSV, but not all are currently rendered by `ComparisonTable`.

## Required App Changes

1. Add the new comparison definitions to `lib/comparisons.ts`.
2. Confirm or replace `data/products-us.csv` with the supplied CSV.
3. Add a manual key-takeaway override path if the user-provided takeaways must appear exactly. Today `buildCompareTakeaways()` generates them from product data.
4. Decide whether the user-provided `Shared across all models` copy is editorial text or table behavior:
   - If editorial, add a per-comparison content field and render it above/below the table.
   - If table behavior, keep the current `ComparisonTable` shared-row section.
5. Resolve missing brand data before publishing pairs that include Berg, JumpSport, or Skybound.
6. Run `npm test` and `npm run build` after wiring the new comparisons.

## Data Blockers

- `Berg` is referenced in 8 drafts but is not present in the supplied CSV.
- `JumpSport` is referenced in 3 drafts but is not present in the supplied CSV. The product loader also currently excludes `JumpSport` if rows are added under that exact brand name.
- `Skybound` is referenced in 3 drafts but is not present in the supplied CSV.
- None of the 30 draft slugs are currently wired into `COMPARISON_DEFINITIONS`, so none will be live at `/compare/{slug}/` until added.

## Featured Model Rule

For each brand, use the highest-priced model in the CSV. If a model has multiple size variants, show the model price range and size list. Price source is `price_usd`, interpreted by `price_basis`.

Current CSV-backed featured models:

| Brand | Featured model | Price | Sizes | Shape | Spring system |
|---|---|---:|---|---|---|
| ACON | ACON X 17ft Rectangular Trampoline with Net and Ladder | $3,999 | 17ft | Rectangle | Coil springs (Performance Springs) |
| Akrobat | Primus Challenger 17x10 SE | $4,099 | 17x10ft | Rectangular | AkroSPRING Pro System |
| AlleyOOP | DoubleBounce 14' Trampoline with Enclosure | $2,249 | 14ft | Round | Coil springs |
| Avyna | 15x15' Square Pro-Line MAX Avyna In-Ground Trampoline | $4,195 | 15x15ft | Square | Coil springs |
| Beast | Beast K9 10x17 Performance Rectangle Trampoline with Enclosure | $1,998 | 10x17ft | Rectangle | Coil springs |
| Capital Play | 11ft x 8ft Capital Inground Trampoline | $2,135 | 11x8ft | Rectangle | Coil springs |
| JUMPZYLLA | Jumpzylla 16ft | $699.95 | 16ft | Round | Coil springs |
| Jumpflex | MEGA Trampoline | $1,499-$2,099 | 14ft, 17ft, 19ft | Square | Coil springs |
| JumpKing | JKRC1018V3 - 10' x 18' Rectangular Trampoline with 2 Basketball Hoops | $1,795 | 10x18ft | Rectangle | Coil springs |
| MaxAir | 10' x 20' Super Tramp Trampoline Premium Package Kit | $27,250 | 10x20ft | Rectangle | Coil springs |
| North | Athlete Rectangle 18 ft x 11 ft | $7,490 | 18 ft x 11 ft | Rectangle | Coil springs |
| Skywalker | 15' Premium Square Trampoline with Enclosure Net | $2,400 | 15x15ft | Square | Coil springs |
| Springfree | Jumbo Oval | $3,999 | 12x19ft | Oval | Flexible composite rods (no springs) |
| Texas Trampolines | 15x15 Texas Giant Square Trampoline | $2,449 | 15x15ft | Square | Coil springs |
| Upper Bounce | Upper Bounce 16 x 16 FT Square Trampoline Set with Premium Top-Ring Enclosure System | $2,211.91 | 16x16ft | Square | Coil springs |
| Vuly | Thunder 2 Pro | $1,649 | L, XL | Round | Leaf springs |

Missing featured model data:

| Brand | Status |
|---|---|
| Berg | Missing from supplied CSV |
| JumpSport | Missing from supplied CSV and currently excluded by product loader |
| Skybound | Missing from supplied CSV |

## Rollout Batches

### Batch 1 - CSV-Ready Pairs

These can be implemented once the definitions are added and the supplied CSV is confirmed:

| Article | Featured model A | Featured model B |
|---|---|---|
| `acon-vs-beast` | ACON X 17ft Rectangular | Beast K9 10x17 Performance Rectangle |
| `acon-vs-maxair` | ACON X 17ft Rectangular | 10' x 20' Super Tramp Premium Package Kit |
| `acon-vs-north` | ACON X 17ft Rectangular | Athlete Rectangle 18 ft x 11 ft |
| `acon-vs-texas-trampolines` | ACON X 17ft Rectangular | 15x15 Texas Giant Square |
| `akrobat-vs-capital-play` | Primus Challenger 17x10 SE | 11ft x 8ft Capital Inground |
| `avyna-vs-capital-play` | 15x15 Square Pro-Line MAX Avyna In-Ground | 11ft x 8ft Capital Inground |
| `jumpflex-vs-avyna` | MEGA Trampoline | 15x15 Square Pro-Line MAX Avyna In-Ground |
| `jumpflex-vs-jumpzylla` | MEGA Trampoline | Jumpzylla 16ft |
| `jumpflex-vs-north` | MEGA Trampoline | Athlete Rectangle 18 ft x 11 ft |
| `jumpzylla-vs-acon` | Jumpzylla 16ft | ACON X 17ft Rectangular |
| `north-vs-akrobat` | Athlete Rectangle 18 ft x 11 ft | Primus Challenger 17x10 SE |
| `north-vs-avyna` | Athlete Rectangle 18 ft x 11 ft | 15x15 Square Pro-Line MAX Avyna In-Ground |
| `springfree-vs-jumpking` | Jumbo Oval | JKRC1018V3 - 10' x 18' Rectangular |
| `springfree-vs-north` | Jumbo Oval | Athlete Rectangle 18 ft x 11 ft |
| `upper-bounce-vs-jumpking` | Upper Bounce 16 x 16 FT Square | JKRC1018V3 - 10' x 18' Rectangular |
| `vuly-vs-akrobat` | Thunder 2 Pro | Primus Challenger 17x10 SE |

### Batch 2 - Needs Berg Data

Do not publish these until Berg rows are added to the CSV or another approved source is supplied:

- `acon-vs-berg`
- `akrobat-vs-berg`
- `avyna-vs-berg`
- `berg-vs-capital-play`
- `jumpflex-vs-berg`
- `north-vs-berg`
- `springfree-vs-berg`
- `vuly-vs-berg`

### Batch 3 - Needs JumpSport Or Skybound Data

Do not publish these until the missing brand rows are added to the CSV and loader behavior is confirmed:

- `acon-vs-jumpsport`
- `jumpsport-vs-alleyoop`
- `springfree-vs-jumpsport`
- `skybound-vs-acon`
- `skybound-vs-skywalker`
- `skybound-vs-springfree`

## Per-Article Build Checklist

For each article:

1. Keep the existing title, intro, meta fields, and user-provided key takeaways from the draft.
2. Add or map the comparison into `COMPARISON_DEFINITIONS`.
3. Set `labelA`, `labelB`, `dataBrandA`, and `dataBrandB` to match CSV brand names exactly.
4. Verify the featured models are the highest-priced model groups for each brand.
5. Ensure the quiz CTA renders above the spec table.
6. Ensure affiliate disclosure renders when appropriate.
7. Verify the full spec table includes all rows from both brands.
8. Verify `Shared across all models` is present when the table has identical non-empty fields.
9. Verify related links include both brand pages and up to six related comparisons.
10. Build and inspect at least one desktop and one mobile viewport before publishing the batch.

## Recommended Implementation Order

1. Diff the supplied CSV against `data/products-us.csv`.
2. Implement Batch 1 in `lib/comparisons.ts`.
3. Add manual takeaway/shared-copy support only if exact editorial copy is required on the live pages.
4. Build and test.
5. Source and add missing Berg, JumpSport, and Skybound rows.
6. Implement Batch 2 and Batch 3.
7. Update the compare hub grouping in `app/compare/page.tsx` if these new pages should appear in specific hub sections.
