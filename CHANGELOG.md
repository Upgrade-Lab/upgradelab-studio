# Changelog

## 0.2.0
- Product site around the viewer: landing page, shared header and footer, History API router with a Vercel rewrite, `/docs`, `/about`, `/privacy`, `/terms`, a 404 page, favicon, Open Graph image, robots.txt and sitemap.xml.
- The viewer moved to `/app` and accepts `/app?report=<file>` and `/app?compare=<a>,<b>` for bundled reports only; unknown names are rejected.
- New `/invariants` page: every invariant id in the bundled reports, a plain-language explanation, and which broken migrations the recorded reports show it failing (derived from the report data). The same explanation now appears in each invariant row of the viewer.
- New `/migrations` page: the correct vault migration and five deliberately broken ones, with the defect in one sentence.
- Content-Security-Policy unchanged (`connect-src 'self'`); no network feature added.

## 0.1.1
- Reports whose headline verdict contradicts their invariant results are now rejected. Re-paired with the published 0.1.1 release of its core (`compat.json` and the vendor stamp record the version and commit). Recorded real-run samples keep the version that recorded them.

## 0.1.0 (unreleased)
- Viewer for UpgradeLab report v1: single report and side-by-side comparison, invariants with evidence, operation timeline, checkpoint state, execution categories, limits.
- Vendored runner 0.1.0 schema and seven recorded reports (corrected, five broken variants, one real testnet run) with a version stamp; precompiled validator; compatibility tests.
