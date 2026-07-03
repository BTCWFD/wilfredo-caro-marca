## 2026-07-03T11:28:13Z

You are the teamwork_preview_worker.
Your working directory is: c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_seo_implement
Your role: SEO & Brand Implementation Specialist
Your task is to implement the technical and content optimizations for Wilfredo Caro's portfolio website and generate the brand SEO report.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Technical Implementation Requirements

1. **Root index.html**:
   - Add `id="schema-ld"` to the script tag (around line 80).
   - Fix the H2 header for Case Studies (line 333) and Thought Leadership (line 378) by adding the correct `data-i18n` key to translations (e.g. `data-i18n="proven_impact_title"` and `data-i18n="thought_leadership_title"`).
   - Resolve repeated H3 headings (like "El problema" / "La solución") by ensuring they are unique or mapped to distinct keys.
   - Improve modal accessibility for `#cv-modal` and `#service-modal` by adding `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linking to their titles.
   - Add `title` attribute to the SoundCloud iframe.
   - Ensure the body and structural copy elements of the Case Studies, Thought Leadership, and pricing components use `data-i18n` tags instead of hardcoded text, allowing full translation.

2. **Translations Object (src/translations.js)**:
   - Add missing translation keys and values in all 7 languages (en, es, ja, zh, ko, ru, ar) for:
     - Case Studies / Proven Impact descriptions (Challenge, Solution, Metrics for VirtuadsAi, Orbit, ExEquine).
     - Thought Leadership description and loading status.
     - Pricing option selectors and labels.
     - Wompi, Bold, and Wenia (crypto) payment buttons.
     - Any alerts/messages shown to users (e.g. in payments.js).

3. **Dynamic JSON-LD & Canonical Injection (src/modules/schema.js & src/modules/i18n.js)**:
   - Create `src/modules/schema.js` exporting a dictionary containing valid localized Schema.org JSON-LD definitions of type `Person`, `CEO` (for VirtuadsAi), and `Specialist` (for Web3/Solidity/DeFi/Agent Observability) for all 7 languages.
   - Update `src/modules/i18n.js` to:
     - Import `schemas` from `./schema.js`.
     - Parse `?lang=...` query parameters on initial page load (with fallback checks on localStorage, browser navigator language, and default 'en').
     - Dynamically update the canonical URL, og:url, and twitter:url in the document header depending on the active language.
     - Dynamically swap the script tag `textContent` for `id="schema-ld"` with the selected language's stringified JSON-LD schema.

4. **App Shell Privacy (public/app/index.html & public/robots.txt)**:
   - Add `<meta name="robots" content="noindex, nofollow" />` to the head of `public/app/index.html`.
   - Add blocking rules for `/app/` and `/app/index.html` to `public/robots.txt`.

5. **EPK Metadata (public/epk/index.html)**:
   - Add `<meta name="description" />` tag, canonical tag (`<link rel="canonical" href="https://wilfredocaro.com/epk/" />`), and standard Open Graph/Twitter Card tags.

6. **Sitemap clean-up (public/sitemap.xml)**:
   - Remove duplicate English URLs (remove the entry for `?lang=en` and keep the root `https://wilfredocaro.com/` as English).
   - Add the EPK page URL: `https://wilfredocaro.com/epk/`.

7. **Netlify Redirects (netlify.toml)**:
   - Map browser Accept-Language headers to auto-route users to query params (es, ja, zh, ko, ru, ar) and add path-based rewrites (e.g. `/es/*` to `/index.html?lang=es`, etc.) for production clean URLs.

### Documentation Requirements

Generate a consolidated report `seo_brand_plan.md` in the root of the project. It must cover:
1. **Keyword Map**: Detailed table of transactional and informational keywords for Web3, Solidity, DeFi, and Agent Observability.
2. **Copywriting Guidelines**: Structural guidelines for optimizing portfolio copy (Challenge-Solution-Result layout, alt text rules, header structure).
3. **Channel Optimization Templates**: LinkedIn headline and bio template, Medium publication/tagging guide, and GitHub repository/README optimization checklist (focusing on Antigravity Monitor).
4. **Interlinking Strategy**: Map out the interlinking rules and path diagrams between Portfolio, GitHub, Medium, and LinkedIn.
5. **B2B PR & Authority Strategy**: A press release template, distribution plan, and 5 distinct editorial press hooks linked to macroeconomic tech trends.
6. **Technical Implementation Summary**: Document the exact files modified and the implementation of dynamic canonical/JSON-LD schemas.

### Verification Criteria

- Compile the project with `npm run build` using `run_command` and verify that the build succeeds with no syntax errors.
- Confirm that the generated `dist/index.html` and other assets include the implemented tags and logic.
- Output your results to a handoff report at `c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_seo_implement\handoff.md` and notify the orchestrator.
