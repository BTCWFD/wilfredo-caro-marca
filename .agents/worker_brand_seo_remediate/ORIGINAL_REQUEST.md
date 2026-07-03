## 2026-07-03T11:36:54Z
You are the teamwork_preview_worker.
Your working directory is: c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_seo_remediate
Your role: SEO & Brand Remediation Specialist
Your task is to implement critical accessibility, security, and schema compliance corrections in the codebase based on Reviewer 1 and Challenger 1's audits.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Remediation Tasks

1. **Content Security Policy Correction (netlify.toml)**:
   - In `netlify.toml` line 25, add `https://w.soundcloud.com` to the `frame-src` directive in the CSP headers (e.g. after `https://www.youtube.com`). This ensures the SoundCloud audio player is not blocked by browsers in production.

2. **Schema.org Conformance Correction (src/modules/schema.js & index.html)**:
   - In `src/modules/schema.js`, modify the `worksFor` arrays for all 7 languages (en, es, ja, zh, ko, ru, ar) to remove the `"jobTitle"` key from inside the nested `Organization` blocks. Schema.org does not allow `jobTitle` on `Organization`. The Person's job titles must be represented only in the root-level `"jobTitle"` array.
   - In `index.html`, update the initial static JSON-LD script (lines 79–122) to exactly match the English `en` schema defined in `src/modules/schema.js` (ensuring consistency in url, description, knowsAbout, and worksFor properties).

3. **HTML Breakout Prevention (src/modules/i18n.js)**:
   - In `src/modules/i18n.js`, ensure that when injecting the stringified JSON-LD schema into `schemaScript.textContent`, any `<` characters are escaped as `\\u003c` to eliminate script breakout/injection risks in static pre-rendered environments:
     ```javascript
     schemaScript.textContent = JSON.stringify(schemas[lang], null, 2).replace(/</g, '\\u003c');
     ```

4. **Modal WCAG 2.1 A/AA Focus Management (src/modules/cv-download.js & src/modules/service-modal.js)**:
   - Implement focus trap, focus placement, focus restoration, and Escape key listeners in both modules:
     - Store the trigger element (`document.activeElement`) when opening the modal.
     - Move keyboard focus programmatically to the first input field (e.g., `#cv-name` or `#srv-name` or the modal container) upon modal opening.
     - Intercept `keydown` events inside the modal to trap focus: pressing `Tab` on the last focusable element in the modal must loop back to the first focusable element, and pressing `Shift + Tab` on the first focusable element must wrap around to the last focusable element.
     - Intercept `keydown` events to close the modal immediately when the `Escape` key is pressed.
     - Restore focus to the saved trigger element when the modal is closed.

5. **Re-build**:
   - Run `npm run build` using `run_command` in the project root to ensure it compiles cleanly with zero warnings or errors.

6. **Update Strategy Report (seo_brand_plan.md)**:
   - Update `seo_brand_plan.md` in the project root to document these technical corrections under the technical implementation summary.

Output your results to a handoff report at `c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_seo_remediate\handoff.md` and notify the orchestrator.
