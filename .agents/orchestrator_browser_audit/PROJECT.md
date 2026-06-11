# Project: Browser Audit and Fixes

## Architecture
- **Web App (Vite + Modular Vanilla JS)**:
  - Entry point: `index.html` referencing `main.js` and `style.css`.
  - Modules: `src/modules/` contains modules for theme, pricing, payments, preloader, cursor, audio player, AI assistant, web3, viewport, cv-download, etc.
- **Mobile PoC (React)**:
  - Located in `Mobile-App-PoC/`.
  - Uses Tailwind/React. Components: `SwipeToDeploy.jsx`, `FloatingAssistant.jsx`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Decompose & Plan | Establish project structure and environment mapping | None | DONE |
| 2 | Exploration (Dev & Preview) | Run browser subagent in npm run dev and npm run preview environments | M1 | DONE |
| 3 | Exploration (Mobile PoC) | Run browser subagent/app tests in Mobile PoC environment | M2 | DONE |
| 4 | Code Correction | Implement fixes for Turnstile, Payments sandbox key, Preloader timings, Cursor hovering, Mobile SwipeToDeploy, and Keyboard offset | M3 | DONE |
| 5 | Regression Testing | Verify all environments using browser subagent | M4 | IN_PROGRESS |
| 6 | Audit Reporting | Write browser_audit_fixes.md and report to Sentinel | M5 | PLANNED |

## Code Layout
- Web App entry points: `index.html`, `main.js`, `style.css`
- Web App modules: `src/modules/`
- Mobile PoC app: `Mobile-App-PoC/`

## Interface Contracts
- `/netlify/functions/unlock.js` ↔ `src/modules/cv-download.js`: Validate Turnstile token using Cloudflare Turnstile API, returning download token.
- `src/translations.js` ↔ `src/modules/i18n.js`: Retrieve string resources for chosen locale.
