# SEO & Accessibility Audit Report

This report presents a comprehensive audit of the HTML, sitemap, robots, and i18n configurations for the website. Since this is a read-only investigation, no source files have been modified. Concrete changes are proposed to resolve all identified issues.

---

## 1. Observations

### 1.1 Root `index.html` Issues
1. **Hardcoded Language Attribute**:
   At line 2:
   ```html
   <html lang="en">
   ```
2. **Hardcoded Canonical Tag**:
   At line 29:
   ```html
   <link rel="canonical" href="https://wilfredocaro.com/" />
   ```
3. **Missing `data-i18n` Key on Sections**:
   - At line 333 (Case Studies/Proven Impact):
     ```html
     <h2 class="reveal" data-i18n-html>Proven <span class="text-gradient">Impact</span></h2>
     ```
     This header has `data-i18n-html` but lacks the `data-i18n` attribute.
   - At line 378 (Thought Leadership):
     ```html
     <h2 class="reveal" data-i18n-html>Thought <span class="text-gradient">Leadership</span></h2>
     ```
     This header also lacks `data-i18n`.
4. **Hardcoded Unlocalized Text**:
   - The entire Case Studies section contents (lines 334–371) are hardcoded in Spanish:
     - Line 334: `Resultados medibles y verificables de nuestras integraciones tecnológicas.`
     - Lines 339–340: `<h3>El problema</h3>` and `<p>Las marcas globales no podían anunciarse...</p>`
     - Lines 341–342: `<h3>La solución</h3>` and `<p>Arquitectura de publicidad basada en IA...</p>`
     - Line 345: `reducción de fricción financiera en pautas virtuales`
     - Same structure repeated for Orbit (lines 349–359) and ExEquine (lines 361–371).
   - Thought Leadership description (line 379) is hardcoded in English: `Latest insights from my Medium.`
   - Thought Leadership loading message (line 382) is hardcoded in English: `Loading latest articles...`
   - Pricing labels (lines 441 and 446) are hardcoded: `🌍 Global (USD)` and `🇨🇴 Colombia (COP)`.
   - Wompi/Bold payment buttons (lines 459–461, 473–474, 486–487, 504–505) are hardcoded in Spanish.
5. **Repeated H3 Headers**:
   - Under Case Studies (lines 339, 341, 351, 353, 363, 365), `El problema` and `La solución` are repeated three times exactly.
6. **Modal Accessibility Gaps**:
   - CV Modal (line 785) and Service Modal (line 856) are structured as simple divs without `role="dialog"`, `aria-modal="true"`, or `aria-labelledby`.

### 1.2 `public/app/index.html` (Mobile App PoC) Issues
1. **Lack of Metadata / Canonical / Robots Control**:
   The entire file (lines 1–20) contains only:
   ```html
   <title>Mobile App PoC</title>
   <meta name="description" content="Proof of Concept for Mobile AI Web3 App" />
   ```
   It has no canonical link, no Open Graph/Twitter meta tags, and lacks `<meta name="robots" content="noindex, nofollow" />`, even though it is a client-side app shell not meant for public indexing.

### 1.3 `public/epk/index.html` (DJ Electronic Press Kit) Issues
1. **Missing Description & SEO Metadata**:
   Lacks `<meta name="description" />` tag, canonical tag (`<link rel="canonical" />`), Open Graph tags, and Twitter cards.
2. **SoundCloud Accessibility Violation**:
   At lines 107–109:
   ```html
   <iframe width="100%" height="450" scrolling="no" frameborder="no" allow="autoplay" 
     src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/wfd-crypptoland-tv&color=%231e8449&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true">
   </iframe>
   ```
   The `iframe` lacks a `title` attribute.
3. **Empty/Dashed Promos**:
   Lines 129–131 contain placeholders:
   ```html
   <div class="photo-item">[Press Photo 1]</div>
   <div class="photo-item">[Press Photo 2]</div>
   <div class="photo-item">[Press Photo 3]</div>
   ```

### 1.4 `public/sitemap.xml` Issues
1. **Duplicate English URLs**:
   Lines 7 and 23 define two duplicates for English:
   - Line 7: `<loc>https://wilfredocaro.com/</loc>`
   - Line 23: `<loc>https://wilfredocaro.com/?lang=en</loc>`
2. **Missing Pages**:
   The sitemap has no entry for the public DJ Presskit (`https://wilfredocaro.com/epk/`).

### 1.5 `public/robots.txt` Issues
1. **App Shell Indexing**:
   The file does not block `/app/` or `/app/index.html`, allowing search engines to index the empty app shell.

### 1.6 JavaScript & Localization (`i18n.js` and `payments.js`) Issues
1. **Query Parameters Ignored on Load**:
   In `src/modules/i18n.js` (lines 106–108):
   ```javascript
   // Initialize Language
   const savedLang = localStorage.getItem('preferredLang') || 'en';
   updateLanguage(savedLang);
   ```
   The script does not parse `window.location.search` for `?lang=...`.
2. **Alerts Hardcoded in Spanish**:
   In `src/modules/payments.js` (lines 21, 23, 29, 49, 51):
   - `alert('¡Pago aprobado con éxito!');`
   - `alert('El pago no pudo ser procesado o fue cancelado.');`
   - `alert('Por favor instala MetaMask o una billetera Web3 para pagos Cripto (Wenia).');`
   These alerts ignore the user's active language setting.

---

## 2. Logic Chain

1. **Crawler Ignorance of Translations**:
   - *Observation*: `i18n.js` only checks `localStorage` and falls back to `'en'` on load.
   - *Reasoning*: When search engine bots visit language URLs like `https://wilfredocaro.com/?lang=es`, they do not have pre-existing `localStorage`. The JS initialization falls back to English, so crawlers index the page as English.
   - *Consequence*: The language versions will not rank for non-English keywords.

2. **Canonical Conflict**:
   - *Observation*: The canonical tag is statically hardcoded to `https://wilfredocaro.com/` across all dynamically translated views.
   - *Reasoning*: When a search engine indexes `https://wilfredocaro.com/?lang=es`, the canonical link tells it the authoritative version is `https://wilfredocaro.com/` (which defaults to English).
   - *Consequence*: Search engines will collapse the Spanish, Japanese, Chinese, Arabic, Russian, and Korean pages into the English page, marking them as duplicate content and ignoring the `hreflang` tags.

3. **Hybrid Language Rendering**:
   - *Observation*: Sections like "Proven Impact" and payment elements are hardcoded in Spanish or English and lack `data-i18n` tags.
   - *Reasoning*: Because these elements are not registered in the translation JSON and lack attributes for dynamic updating, they are never replaced when language changes.
   - *Consequence*: A Japanese visitor switching language will see a mix of English, Spanish, and Japanese, which harms user retention and indicates low localization quality.

4. **App PoC indexing**:
   - *Observation*: `public/app/index.html` has no `noindex` tag and `/app/` is not disallowed in `robots.txt`.
   - *Reasoning*: Search engines can discover the app directory via other links or indexing and parse the bare HTML shell.
   - *Consequence*: Google will index a page with title "Mobile App PoC" and an empty layout, degrading the brand search reputation.

5. **Missing EPK Metadata**:
   - *Observation*: `/epk/index.html` is a public asset but lacks standard SEO tags, open graph tags, and does not exist in `sitemap.xml`.
   - *Reasoning*: Bots cannot easily crawl or contextualize the DJ Electronic Press Kit, and social media links to it will render without previews.
   - *Consequence*: Decreased search discovery for music bookings and poor social sharing visuals.

---

## 3. Caveats

- **Network Environment**: The investigation was conducted in CODE_ONLY mode (local read-only analysis). External crawling tools or Live Google Rich Snippets validators were not invoked.
- **Client-side Rendering Limitation**: As a static website, the HTML initially downloaded by crawlers will always contain default values (English). The proposed fixes update SEO headers dynamically on the client, which Googlebot parses, but simpler search bots without full JS rendering might still only index the default English content.

---

## 4. Conclusion

To achieve complete brand SEO alignment, optimal multilingual ranking, and WCAG accessibility compliance, the following changes are proposed:

### Proposal A: Fix JS Initialization and Canonical Tag
Modify `src/modules/i18n.js` to parse URL parameter language values and dynamically update the canonical tag and metadata:

```javascript
// At the bottom of src/modules/i18n.js

// Initialize Language by checking:
// 1. URL search parameter (?lang=es)
// 2. localStorage saved language
// 3. Navigator (browser) language fallback
// 4. Default 'en'
const urlParams = new URLSearchParams(window.location.search);
const queryLang = urlParams.get('lang');
const browserLang = navigator.language ? navigator.language.split('-')[0] : 'en';

const supportedLangs = ['en', 'es', 'ja', 'zh', 'ko', 'ru', 'ar'];
let selectedLang = queryLang || localStorage.getItem('preferredLang') || browserLang || 'en';

if (!supportedLangs.includes(selectedLang)) {
  selectedLang = 'en';
}

updateLanguage(selectedLang);
```

And update `updateLanguage` function to modify canonical dynamically:
```javascript
const updateLanguage = (lang) => {
  // ... existing code ...

  // Update canonical and og:url
  const canonical = document.querySelector('link[rel="canonical"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  const targetUrl = lang === 'en' ? 'https://wilfredocaro.com/' : `https://wilfredocaro.com/?lang=${lang}`;
  
  if (canonical) canonical.setAttribute('href', targetUrl);
  if (ogUrl) ogUrl.setAttribute('content', targetUrl);
  if (twitterUrl) twitterUrl.setAttribute('content', targetUrl);

  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Update dynamic translations for SEO headers
  if (window.translations && window.translations[lang]) {
    const t = window.translations[lang];
    if (t.meta_title) {
      document.title = t.meta_title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', t.meta_title);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', t.meta_title);
    }
    if (t.meta_description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', t.meta_description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', t.meta_description);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', t.meta_description);
    }
  }

  // Render contact info and persist
  localStorage.setItem('preferredLang', lang);
};
```

### Proposal B: Add Missing Translations in `src/translations.js`
Register translations for the missing elements in `src/translations.js`:
- `proven_impact_title`: English: `Proven <span class="text-gradient">Impact</span>`, Spanish: `Impacto <span class="text-gradient">Probado</span>`
- `proven_impact_lead`: English: `Measurable and verifiable results of our technological integrations.`, Spanish: `Resultados medibles y verificables de nuestras integraciones tecnológicas.`
- `case_problem`: English: `The Problem`, Spanish: `El problema`
- `case_solution`: English: `The Solution`, Spanish: `La solución`
- `case_virtuads_problem_desc`: English: `Global brands could not advertise in virtual worlds due to financial friction and lack of transparency.`, Spanish: `Las marcas globales no podían anunciarse en mundos virtuales por la fricción financiera y la falta de transparencia.`
- `case_virtuads_solution_desc`: English: `AI, Web3 and Blockchain advertising architecture that eliminates intermediaries and makes every impression measurable.`, Spanish: `Arquitectura de publicidad basada en IA, Web3 y Blockchain que elimina intermediarios y hace medible cada impresión.`
- `case_virtuads_metric_label`: English: `reduction of financial friction in virtual ads`, Spanish: `reducción de fricción financiera en pautas virtuales`
- (Repeat translations for Orbit and ExEquine case study details)
- `thought_leadership_title`: English: `Thought <span class="text-gradient">Leadership</span>`, Spanish: `Liderazgo de <span class="text-gradient">Opinión</span>`
- `thought_leadership_lead`: English: `Latest insights from my Medium.`, Spanish: `Últimos artículos e ideas publicados en mi Medium.`
- `thought_leadership_loading`: English: `Loading latest articles...`, Spanish: `Cargando últimos artículos...`
- `toggle_label_global`: English: `🌍 Global (USD)`, Spanish: `🌍 Global (USD)`
- `toggle_label_colombia`: English: `🇨🇴 Colombia (COP)`, Spanish: `🇨🇴 Colombia (COP)`
- `pay_wompi`: English: `Pay with Wompi/Nequi`, Spanish: `Pagar con Wompi/Nequi`
- `pay_bold`: English: `Pay with Bold`, Spanish: `Pagar con Bold`
- `pay_wenia`: English: `Pay with Crypto (Wenia)`, Spanish: `Pagar con Cripto (Wenia)`

And apply the corresponding `data-i18n="..."` attributes to elements in `index.html`.

### Proposal C: Enhance Headings Accessibility and Modals
- Add `aria-label` or unique identifiers to the H3 elements for problem/solutions:
  ```html
  <h3 class="case-problem" data-i18n="case_problem" aria-label="El problema de VirtuadsAi">El problema</h3>
  ```
- Make modals screen-reader friendly by adding roles and connections in `index.html`:
  ```html
  <div id="cv-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title">
  ```
  and
  ```html
  <div id="service-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
  ```

### Proposal D: PWA App Shell Privacy
Add the following to `public/app/index.html` head to block indexing:
```html
<meta name="robots" content="noindex, nofollow" />
```
And add `/app/` to `public/robots.txt` under block directives:
```text
Disallow: /app/
Disallow: /app/index.html
```

### Proposal E: Optimize EPK Metadata and WCAG compliance
Update `public/epk/index.html`:
- Add a meta description:
  ```html
  <meta name="description" content="Official Electronic Press Kit (EPK) for Wilfredo Caro — DJ and technologist creating sonic journeys blending Deep Tech and modern Techno." />
  ```
- Add a canonical link:
  ```html
  <link rel="canonical" href="https://wilfredocaro.com/epk/" />
  ```
- Add Open Graph & Twitter Card tags.
- Fix SoundCloud iframe accessibility by adding `title`:
  ```html
  <iframe title="SoundCloud audio player with Wilfredo Caro deep tech mix" ...>
  ```

### Proposal F: Sitemap Clean-up and Additions
Update `public/sitemap.xml`:
- Remove the duplicate English version block (`https://wilfredocaro.com/?lang=en`). Only keep the root `https://wilfredocaro.com/` as English with the alternate tags correctly configured.
- Add the EPK page URL:
  ```xml
  <url>
    <loc>https://wilfredocaro.com/epk/</loc>
    <lastmod>2026-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ```

### Proposal G: Set Up Clean Path-Based Routing (Redirects Configuration)
For production-grade SEO, we recommend moving away from URL parameters like `?lang=es` and mapping clean subdirectory paths to the index script using Netlify redirects.
1. Add redirects config inside `netlify.toml`:
   ```toml
   # Language redirects based on Accept-Language header (User Auto-Route)
   [[redirects]]
     from = "/"
     to = "/?lang=es"
     status = 302
     conditions = {Language = ["es"]}
     force = true

   [[redirects]]
     from = "/"
     to = "/?lang=ja"
     status = 302
     conditions = {Language = ["ja"]}
     force = true

   [[redirects]]
     from = "/"
     to = "/?lang=zh"
     status = 302
     conditions = {Language = ["zh"]}
     force = true

   [[redirects]]
     from = "/"
     to = "/?lang=ko"
     status = 302
     conditions = {Language = ["ko"]}
     force = true

   [[redirects]]
     from = "/"
     to = "/?lang=ru"
     status = 302
     conditions = {Language = ["ru"]}
     force = true

   [[redirects]]
     from = "/"
     to = "/?lang=ar"
     status = 302
     conditions = {Language = ["ar"]}
     force = true

   # Clean path mappings (Rewrites)
   [[redirects]]
     from = "/en/*"
     to = "/index.html"
     status = 200

   [[redirects]]
     from = "/es/*"
     to = "/index.html?lang=es"
     status = 200

   [[redirects]]
     from = "/ja/*"
     to = "/index.html?lang=ja"
     status = 200

   [[redirects]]
     from = "/zh/*"
     to = "/index.html?lang=zh"
     status = 200

   [[redirects]]
     from = "/ko/*"
     to = "/index.html?lang=ko"
     status = 200

   [[redirects]]
     from = "/ru/*"
     to = "/index.html?lang=ru"
     status = 200

   [[redirects]]
     from = "/ar/*"
     to = "/index.html?lang=ar"
     status = 200
   ```

2. Inside `src/modules/i18n.js`, check the pathname to determine the initial language:
   ```javascript
   const path = window.location.pathname;
   const matched = path.match(/^\/(es|ja|zh|ko|ru|ar)\/?$/);
   const pathLang = matched ? matched[1] : null;
   const initialLang = pathLang || queryLang || localStorage.getItem('preferredLang') || browserLang || 'en';
   ```

---

## 5. Verification Method

### 5.1 Project Build Check
After applying these changes, run the Vite build command to verify that build compilation works without asset resolving or template syntax errors:
```powershell
npm run build
```
This command must exit with code 0 and output files to `/dist`.

### 5.2 Local Environment Testing
1. Start the local server:
   ```powershell
   npm run dev
   ```
2. Open `http://localhost:5173/?lang=es` directly in a fresh incognito window.
3. Validate:
   - The document lang attribute is set to `es` (`document.documentElement.lang`).
   - The page renders in Spanish (including the Case Studies and Thought Leadership sections).
   - The canonical link tag points to `https://wilfredocaro.com/?lang=es` (or `/es`).
4. Switch languages via the drop-down menu and verify that headers and pricing update correctly.
5. Inspect the HTML structure using developer tools to verify that modals have correct ARIA roles.
