# 🚀 Plan de actualización de marca — Wilfredo Caro (2026)

> Generado por un equipo de subagentes (auditoría del sitio + inventario de proyectos +
> estrategia de marca/web/redes). Objetivo: que **wilfredocaro.com** y las redes
> cuenten la historia *actual* — orquestación de enjambres de agentes IA + Web3 + mobile —
> con los proyectos nuevos construidos en Antigravity y VS Code con Claude.

---

## 🎯 Idea madre (posicionamiento)
> **"Orquesto enjambres de agentes IA y los llevo a producción con gobernanza y mando móvil."**
> Une IA + Web3 + mobile-first + deep tech bajo una sola idea, anclada en código que **ya existe**.

**Nuevo titular:** *AI Multi-Agent Systems Architect · Orquestador de enjambres IA + Web3*
(degradando "Fullstack & Blockchain Architect" a credencial en la bio, no a titular).

---

## 🩺 Auditoría — resumen
Base técnica sólida (Vite, trilingüe EN/ES/JA, Netlify, SEO/JSON-LD, PWA, chatbot Gemini),
pero **el sitio cuenta la historia vieja**:
1. **Posicionamiento aplanado** — el activo estrella (Antigravity Monitor) está enterrado como "Anti-Observer"; no aparece en SEO/OG ni en el system prompt del chatbot (su propio clon IA no lo conoce).
2. **i18n roto** — 18 claves `srv_*/nav_services/cv_success_*` faltan en `translations.js` → Services y CV en *Spanglish* en EN/JA; case-studies y blog hardcodeados en español.
3. **Proyectos hardcodeados** — 7 tarjetas a mano (cada una toca 3 sitios), y ~10 proyectos nuevos reales sin reflejar.

### Fortalezas
- Activo diferenciador real y maduro: **Antigravity Monitor** (+ antgr-observer) — "Datadog para enjambres de agentes IA", first-mover, con `INFORME_PRODUCTO` y tesis GTM.
- Portfolio amplio y verificable (BTCWFD, push reciente): Orbit, Ovacion, NEXUS-AGENT, Speack3, **PROYECT-ICC "Fútbol en la Luna"**, etc.
- Credibilidad en hero (CEO VirtuadsAi, CTO Orbit, Ex-Brave, Labitconf/Talent Land) y presencia cross-red.

### Gaps bloqueantes
- 🔴 **`antigravity-monitor` es repo PRIVADO** → cualquier enlace de marca da 404. Hacerlo público o crear demo antes de difundir.
- 🔴 **i18n** (las 18 claves).
- 🟠 Métricas de case-studies (85%/+40%/100%) eran *scaffold* → validar o retirar (riesgo reputacional).
- 🟠 Bug: `main.js` incluido dos veces. Placeholders sin resolver (`VITE_GA_ID`, Bold, Turnstile).

---

## 🗺️ Plan de acción por fases

### FASE 0 — Veracidad (bloqueante, esta semana, antes de tocar la web)
- Hacer **público** `antigravity-monitor` (o `antigravity-monitor-demo`). Es el buque insignia.
- Borrar `NESUS-AGENT` (duplicado vacío); añadir description + README a `virtuadsai-core` y `mole-intelligent-energy`.
- Validar/retirar las métricas de case-studies.
- Definir el enlace canónico de cada proyecto (repo público vs. demo).

### FASE 1 — Quick wins (alto impacto, bajo esfuerzo)
- Cerrar el gap **i18n** (18 claves `srv_*/nav_services/cv_success_*` en EN/ES/JA).
- Actualizar `title`, OG, Twitter (index.html) al nuevo titular.
- JSON-LD: `jobTitle` (+ AI Multi-Agent Systems Architect), `knowsAbout` (Multi-Agent Systems, Agent Observability, AI Agent Orchestration), `sameAs` (+ BeatLink), `meta author`; arreglar Discord genérico.
- Eliminar la **segunda inclusión de `main.js`**.
- Resolver placeholders (`VITE_GA_ID`, Bold, Turnstile).

### FASE 2 — Narrativa unificada (copy EN/ES/JA)
- Reescribir `hero_*` y `about_*` con la idea madre (y sincronizar el fallback del HTML).
- Internacionalizar case-studies y blog (claves + `data-i18n`).
- Actualizar el **system prompt del chatbot** con Antigravity Monitor, Ovacion, Orbit, BeatLink + tesis; añadir validación de longitud y rate-limit.

### FASE 3 — Refactor data-driven de proyectos
- `src/data/projects.js` (array: id, section, href, media, nameKey, descKey, tags, featured).
- `src/modules/render-projects.js` que genere las tarjetas con `data-i18n` (ejecutar antes de `updateLanguage()`).
- Reduce añadir un proyecto de **3 sitios → 1**.

### FASE 4 — Proyectos nuevos + sección "AI Agent Orchestration"
- Nueva sección destacada **#ai-orchestration** con 2 tarjetas grandes: **Antigravity Monitor** + **Orbit** + CTA a repo/demo.
- Renovar #projects: **3 destacados** (Antigravity Monitor [absorbe Anti-Observer], Orbit/ORBIT-APP, Ovacion) + cinturón (VirtuadsAi, NEXUS-AGENT, Speack3).
- **Cinturón "Labs / Creative"** (experimentos, sin protagonizar): **PROYECT-ICC "Fútbol en la Luna"** ⚽🌙, Speack3, mole-intelligent-energy, android_developer_toolbox, tecnico-de-selulares.
- `public/projects/` con capturas/MP4/WebM por proyecto (para el Monitor: demo del árbol/vista 3D). `loading=lazy` + width/height (anti-CLS).

### FASE 5 — Activación en redes (sprint de 3 semanas, repetible)
- **Sem 1 — Antigravity Monitor (Tier 1):** carrusel LinkedIn "Datadog para enjambres de agentes IA" + hilo X build-in-public + clip demo + Release/pin en GitHub.
- **Sem 2 — Ovacion (Tier 2 Web3):** post-relato "fan value tokenizado" + hilo X + BeatLink (ángulo local CO).
- **Sem 3 — Orbit (Tier 2 mobile) + recap:** demo vertical "control de misión en tu bolsillo" + recap cerrando el arco IA→Web3→mobile.
- **Relleno X continuo** + 1 tuit "labs" (aquí entra **ICC "Fútbol en la Luna"** como pieza creativa ligera).
- Actualizar **LinkedIn headline+About, X bio, GitHub bio** con el titular antes de empujar tráfico.

### FASE 6 — Build, verificación y deploy
- `npm run dev` (verificar render + EN/ES/JA en Services/case-studies/blog/tarjetas), `build && preview`.
- Checklist: cero 404 en enlaces, Lighthouse (perf/SEO/a11y), todo traduce.
- Branch `feat/portfolio-agent-orchestration` + PR → Deploy Preview de Netlify → merge a master.
- Re-scrapear OG (debugger FB/X), actualizar `lastmod` en sitemap.

---

## 💡 Lluvia de ideas
- **"Diario del Monitor"**: serie semanal de post-mortems de agentes que fallan en silencio (bucles, RESOURCE_EXHAUSTED) → contenido recurrente + first-mover.
- **"Habla con mi clon IA"**: clip del chatbot del sitio respondiendo sobre Antigravity/Ovacion (el producto como marketing).
- **Open-core como comunidad**: README + topics (`ai-agents`, `llmops`, `observability`, `antigravity`) + Releases; estrellas del repo como métrica norte.
- **Demo Monitor↔Orbit**: "el Monitor detecta que un agente descarrila → intervienes desde el móvil con Orbit" (tesis mobile-first en 30s).
- **Puente BeatLink↔Ovacion**: "del ticketing de eventos al fan value on-chain" (ángulo sports-tech CO).
- **Landing one-pager** de Antigravity Monitor con el pitch + tesis del INFORME_PRODUCTO + CTA waitlist.
- **hreflang + URLs por idioma** (SSG/prerender) → captar orgánico ES/JA (hoy el SEO multilingüe es nulo).
- **Pillar "builder in public"**: mostrar el stack real (Claude/Antigravity en VS Code) y los labs como prueba de amplitud.
- **ICC "Fútbol en la Luna"** ⚽🌙 como pieza de **creatividad/juego**: gancho ligero y memorable que humaniza la marca (reel corto / WebGL demo) y conecta con el ángulo deportivo de Ovacion.
- **Variante de titular B2B/inversión**: "Building the observability & governance layer for AI agent swarms".

---

## ✅ Pasos inmediatos (esta semana)
1. **HOY** — Hacer público `antigravity-monitor` (o mirror demo). Bloqueante #1.
2. **HOY** — Borrar `NESUS-AGENT`; description+README a `virtuadsai-core` y `mole-intelligent-energy`.
3. Cerrar el **i18n** (18 claves en EN/ES/JA).
4. Quick wins en `index.html` (title/OG/meta, JSON-LD, quitar `main.js` duplicado, placeholders).
5. Validar/retirar métricas de case-studies.
6. Actualizar el **system prompt del chatbot** con el relato actual.
7. Actualizar **LinkedIn/X/GitHub bio** con el nuevo titular.
8. Abrir branch `feat/portfolio-agent-orchestration` + Deploy Preview.

---
_Documento generado para guiar la actualización. Incluye PROYECT-ICC "Fútbol en la Luna" en el cinturón Labs/Creative y como pieza de redes._
