# Project: Brand Optimization and PS6 Aesthetic Integration

## Architecture
- **Main Portfolio (`index.html`, `style.css`, `main.js`)**: The public-facing site displaying Wilfredo's background, expertise, projects, and services. Uses Vite for bundling.
- **Planning Dashboard (`planner.html`)**: Interactive tool containing the Swarm Simulator, budget controls, and CRM integration.
- **Multilingual Support (`translations.json`, `src/modules/i18n.js`)**: Handles translation loading and rendering across 7 languages (en, es, ja, zh, ko, ru, ar).
- **Static Assets & PWA Config (`public/`, `vite.config.js`)**: Handles background Three.js assets and service worker caching.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Strategic Multidisciplinary Guide | Create `optimizacion_habilidades.md` covering IA Governance, PQC, Web3/IA, and DJ Presskit. | None | DONE |
| 2 | PS6 Console Aesthetic | Deep obsidian black, brushed chrome, neon glow/LED, and glassmorphic micro-animations. | None | DONE |
| 3 | PQC Swarm Simulator | Update simulator in `planner.html` with real-time visual logs for ML-DSA and ML-KEM. | M2 | DONE |
| 4 | Translation & Build Integrity | Preserve translation files, run unit/verification tests, and execute successful build. | M1, M2, M3 | DONE |

## Interface Contracts
- **Swarm Simulator Logs**: Log messages should clearly display visual cues for `[ML-KEM]` encryption and `[ML-DSA]` signatures between nodes.
- **Translation Keys**: Keys mapped in `translations.json` must align with `data-i18n` attributes in HTML.

## Code Layout
- `index.html` — Main website.
- `planner.html` — Planning dashboard & swarm simulator.
- `style.css` — Core styles for main website.
- `translations.json` — Translation strings for all 7 languages.
- `src/` — Modules and schema logic.
