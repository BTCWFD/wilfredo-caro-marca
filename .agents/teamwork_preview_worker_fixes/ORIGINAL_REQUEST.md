## 2026-06-11T23:07:58Z

Your working directory is: c:\Users\USER\Wilfredo-Caro-Marca\.agents\teamwork_preview_worker_fixes
Please implement the following code corrections and tooling updates to resolve the bugs identified during the browser audit:

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. Fix srvForm ReferenceError and missing closeServiceModal call:
   - In `src/modules/web3.js`, remove the entire form submit event listener block for `srvForm` (lines 70-111).
   - In `src/modules/service-modal.js`, append this form submit event listener block to the end of the file. It will now have direct access to `srvForm` and `closeServiceModal` in its module scope.
   
2. Remove invalid/corrupt import in `main.js`:
   - In `main.js`, remove the line `import './src/modules/pwa:-47.js';` (line 35).

3. Avoid hardcoding sandbox keys in payments.js:
   - In `src/modules/payments.js` (around line 15), replace the hardcoded Wompi sandbox key with `import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9xoKdePzhSGeZaVvwAXmRkdDPGq'`.

4. Dynamically adapt Three.js background colors based on active theme:
   - In `src/modules/three-bg.js`, implement a dynamic update loop that updates the points material and line material color depending on whether the `data-theme` attribute on the HTML element is set to `light`.
   - You can use a `MutationObserver` on `document.documentElement` observing the `data-theme` attribute, or check the theme and update the material colors when the theme changes.
   - Use color `0x196f3d` for light mode and `0x1e8449` for dark mode to ensure optimal legibility.

5. Theme-dependent project tags styling:
   - In `style.css`, define `--tag-bg` and `--tag-border` CSS custom properties inside both `:root` and `[data-theme="light"]` selectors.
   - Replace the hardcoded `background: rgba(30, 132, 73, 0.1)` and `border: 1px solid rgba(30, 132, 73, 0.2)` in `.project-tags span` with `var(--tag-bg)` and `var(--tag-border)`.

6. Create standard ESLint configuration file in Mobile PoC:
   - Create a `.eslintrc.json` file inside `Mobile-App-PoC/` with standard Vite React configuration, so that `npm run lint` completes without configuration errors.
   - Example configuration:
     ```json
     {
       "env": { "browser": true, "es2020": true },
       "extends": [
         "eslint:recommended",
         "plugin:react/recommended",
         "plugin:react/jsx-runtime",
         "plugin:react-hooks/recommended"
       ],
       "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
       "settings": { "react": { "version": "18.2" } },
       "plugins": ["react-refresh"],
       "rules": {
         "react-refresh/only-export-components": [
           "warn",
           { "allowConstantExport": true }
         ],
         "react/prop-types": "off"
       }
     }
     ```

7. Enable light mode theme support for Mobile PoC:
   - In `Mobile-App-PoC/src/index.css`, add a `@media (prefers-color-scheme: light)` block to support light mode values for the variables (`--bg-color: #fafafa;`, `--text-color: #050505;`, `--glass-bg: rgba(0, 0, 0, 0.03);`, `--glass-border: rgba(0, 0, 0, 0.08);`, `--glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);`).
   - In `Mobile-App-PoC/src/components/SwipeToDeploy.css`, update `.swipe-text`'s color to use `var(--text-color)` and `opacity: 0.6` to ensure it is readable in both light and dark backgrounds.

8. Verify the fixes:
   - Run the build commands `npm run build` in the root workspace and `npm run build` in the `Mobile-App-PoC` directory to make sure compilation succeeds.
   - Run `npm run lint` in `Mobile-App-PoC` to verify ESLint executes clean without warnings/errors.
   - Document the commands used and results in your handoff report.
