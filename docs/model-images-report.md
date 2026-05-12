# Model Images Import Report

## Summary
- Source directory: `/Users/scott/Projects/Image scraper/output/final`
- Source image files found: 209
- Distinct catalog models in `data/products-us.csv`: 211
- Imported model images: 207
- Catalog coverage: 98.1%
- Public asset directory: `public/model-images/`
- Generated manifest: `lib/model-images.generated.json`

## Missing Exact Images
- `acon-acon-air-6ft-round-trampoline` — ACON / ACON Air 6ft Round Trampoline
- `alleyoop-12-17-oval-trampoline-with-enclosure` — AlleyOOP / 12'×17' Oval Trampoline with Enclosure
- `texas-trampolines-8x8-heavy-duty-trampoline` — Texas Trampolines / 8X8 HEAVY DUTY Trampoline
- `west-coast-jump-4-4-super-trampoline` — West Coast Jump / 4×4 Super Trampoline

## Naming Strategy
- Imported assets are keyed by model id, not per-size product slug.
- File pattern: `/model-images/<brand-slug>-<model-slug>.<ext>`
- This matches the app's existing grouped-by-model surfaces better than per-variant naming.

## Recommended Integration Order
1. Quiz results: add the model image to `app/results/ResultsClient.tsx` result cards. This is the highest-value placement because the user is already evaluating 1 to 3 recommended models.
2. Models browser: add a compact thumbnail column or media tile to `app/models/BrowseClient.tsx` so the browse grid becomes more scan-friendly without requiring detail expansion.
3. Compare browser: add the same thumbnail treatment to `app/compare/CompareClient.tsx` for consistency with the models browser.
4. Brand pages: add a lightweight featured-model strip above the spec table instead of forcing images into the wide comparison table itself.

## Modern Web App Guidance
- Use `next/image` with fixed aspect-ratio wrappers so card heights stay stable and CLS stays low.
- Prefer lazy loading by default. Only set `priority` for one above-the-fold image on a page.
- Pass a realistic `sizes` prop so mobile does not download desktop-sized assets.
- Keep model images out of dense data tables. Use them in card/list surfaces where recognition helps decision-making.
- Treat the generated manifest as the source of truth so missing images fail gracefully instead of producing broken URLs.
- If this library grows or you regenerate often, keep the canonical import script and manifest rather than hand-managing filenames in components.
