# Scope: SEO and Brand Authority Optimization

## Architecture
- Site layout: Vanilla HTML (index.html, public/app/index.html, public/epk/index.html, public/linkedin_helper.html, public/planner.html) built with Vite to `dist/`.
- Dynamic translations: Managed by `src/modules/i18n.js`, reading from `src/translations.js` (which is compiled and auto-synced to `translations.json`).
- Dynamic SEO: Page title and meta descriptions are updated dynamically in `i18n.js` when the language changes.
- Multilingual indexing: Alternates are linked in both sitemap.xml and index.html headers, pointing to `?lang=...` parameters.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | SEO Technical & Metadata Optimization | Audit and optimize HTML tags (H1-H6, titles, descriptions), implement dynamic canonical tags per language, create localized JSON-LD schemas (Person, CEO, Specialist) injected dynamically by language in i18n.js, configure language redirects or canonicals to prevent duplication. | None | PLANNED |
| 2 | Strategy Report & Content Plan | Map Web3/DeFi keywords, optimize portfolio copy semantics, design guides/templates for LinkedIn/Medium/GitHub, interlinking strategy, PR guide and distribution plan with 5 concrete press release hooks, write everything into `seo_brand_plan.md` in root. | None | PLANNED |
| 3 | Verification and Validation | Build the project, verify Hreflang and canonical injection in dist/index.html, validate JSON-LD syntax, run audits. | M1, M2 | PLANNED |

## Interface Contracts
### i18n.js ↔ translations.js
- Translations object in `translations.js` needs to hold structural schemas (JSON-LD) or text fragments for SEO elements.
- `i18n.js` needs to dynamically read and update meta headers, canonical URL, and JSON-LD schema in the DOM.
