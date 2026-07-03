# Project: Wilfredo Caro Personal Brand & Portafolio Optimization

## Architecture
The application is a single-page web app built with Vite. It has modular JS modules in `src/modules/` and a main stylesheet in `style.css`.
- `main.js`: Main entry point.
- `src/translations.js`: Dictionary containing translation strings for 7 languages (en, es, ja, zh, ko, ru, ar).
- `src/modules/i18n.js`: Handles locale changes, updates elements with `data-i18n`, sets document dir to `rtl` for Arabic, and updates `localStorage`.
- `planner.html`: Autonomous dashboard located at the root of the project.

## Code Layout
- Root: `index.html`, `style.css`, `main.js`, `planner.html`, `translations.json`
- Source files: `src/modules/` for dynamic components.
- Output: `dist/` containing compiled assets.

## Milestones
| # | Name | Scope | Dependencies | Status | Conv ID |
|---|---|---|---|---|---|
| 1 | M1: Web3 Security Audit & SEO Optimization | Add meta tags (canonical, OG, Twitter Cards), robots.txt blocking aggressive AI scrapers, sitemap.xml, check DOM-XSS and add input validation/jailbreak checks. | None | DONE | d45223a1-f536-4b22-9ce5-5b545fcc4cad |
| 2 | M2: Premium Space-Tech Design & Lead CRM | Update CSS variables to space-tech theme (cobalt blue, space gray, neon cian light). Persist contact form leads in localStorage. | M1 | DONE | d45223a1-f536-4b22-9ce5-5b545fcc4cad |
| 3 | M3: 7-Language Support & Dynamic RTL | Validate all 7 languages from translations.js. Sync translations.json. Ensure layout elements adapt correctly under RTL dir="rtl" mode. | M2 | DONE | d45223a1-f536-4b22-9ce5-5b545fcc4cad |
| 4 | M4: Autonomous Content Planner | Implement planner.html containing Leads CRM, LinkedIn Planner with preview, Midjourney Prompts, and Agent Swarm Simulator. | M3 | DONE | d45223a1-f536-4b22-9ce5-5b545fcc4cad |
| 5 | M5: Build, Verification & Testing | Build and run production environment, E2E checks, audit verification. | M4 | DONE | 9b305a8c-3d1d-4405-816c-0761aa466045 |

## Interface Contracts
### `i18n` ↔ `style.css`
- Document dir attribute `dir="rtl"` is dynamically set on the `<html>` element. CSS must apply RTL-specific spacing, flex directions, and text alignment when `[dir="rtl"]` is active.

### `Contact Form` ↔ `localStorage`
- Key `leads`: JSON array of objects `[{ name, email, company, purpose, details, timestamp }]` stored in `localStorage`. `planner.html` reads and manages this same key.
