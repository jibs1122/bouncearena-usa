# H2H Comparison Image Plan

## Target Route
- `app/compare/[pair]/page.tsx`

## Goal
- Add model imagery to comparison pages in a way that improves recognition and scanning without making the spec table heavier or harder to read.

## Recommended Rollout
1. Add a "Representative Models" section directly under the intro copy and above the quiz CTA.
2. Show one featured model card for each brand in the pair.
3. Use the same image source contract already used on quiz and brand pages:
   - `lib/modelImages.ts`
   - `components/ui/ModelImage.tsx`
4. Keep the full `ComparisonTable` text-first.

## Why This Structure
- The current comparison page is already split into hero, intro, quiz CTA, table, and related links.
- Images belong in the explanatory/top-of-page layer, not in the wide spec matrix.
- One card per brand keeps the page balanced and avoids turning the route into a product-grid page.

## Selection Logic
- Group `brandA.products` and `brandB.products` by model.
- Prefer models that have imported images in `model-images.generated.json`.
- Rank candidates in this order:
  1. Lowest priced imaged model in the current brand lineup.
  2. If comparing springless vs springless brands, prefer a springless model if available.
  3. If one brand has both rectangular and round families, prefer the one most aligned with the comparison intro copy.
- Fall back to brand logo if a model image is missing.

## UI Shape
- Two equal cards on desktop, stacked on mobile.
- Each card should include:
  - Model image
  - Brand name
  - Model name
  - Price or price range
  - Size summary
  - Spring system summary
  - Shop CTA

## Implementation Notes
- Add a small helper near `app/compare/[pair]/page.tsx` or in a shared lib to build a featured model summary from grouped products.
- Reuse the pricing formatting already used elsewhere via `formatUsd`.
- Reuse `getPreferredModelUrl` for outbound model CTAs.
- Use `next/image` through `components/ui/ModelImage.tsx`.
- Use fixed aspect-ratio containers to prevent layout shift.

## What Not To Do
- Do not inject images into every column header of `ComparisonTable`.
- Do not show every size variant as a separate image card.
- Do not block the page on perfect 100% image coverage; missing images should degrade to logo or omitted card media.

## Suggested Sequence
1. Add the featured-model builder helper.
2. Render the two representative cards under the intro.
3. Validate layout on mobile and desktop.
4. Only after that, consider optional image thumbnails in related-comparison or brand-link sections.
