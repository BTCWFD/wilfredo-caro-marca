## 2026-07-03T13:30:20Z

You are a teamwork_preview_worker. Your working directory is c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_implement_ps6.
Your task is to implement Milestones 1, 2, 3, and 4 in the repository.

Here are the detailed instructions:

1. **Milestone 1: Strategic Guide**:
   Create a markdown file at the root of the workspace called `optimizacion_habilidades.md` in Spanish. Cover:
   - IA Governance: Observability and real-time telemetria for agent swarms (Antigravity Monitor), loop prevention, and PII logs redaction.
   - PQC Cybersecurity: Migration to hybrid algorithms. ML-KEM (Kyber-768) for safe key encapsulation in node communication and ML-DSA (Dilithium-65) for digital signatures and authorizations.
   - Web3/IA Commercial: Autonomous agent economy (VirtuadsAi), low gas optimization, fan-engagement tokenization (Ovación), and local payment integration guidelines in Colombia: Wompi/Nequi, Bold, Wenia (USDC/COP), and Bre-B (interoperable transfers).
   - DJ & Presskit EPK: electronic music as a metaphor for low-latency systems orchestration, tech rider specs (CDJ-3000, DJM-V10), and interactives (SoundCloud/Mixcloud integration, Web Audio API, hi-res press photos downloads).

2. **Milestone 2: PS6 Console Aesthetic**:
   - Update `style.css` and the CSS/HTML elements in `index.html` and `planner.html` to integrate the PS6 Console Aesthetic:
     - Pure obsidian black background (change `--bg-color` or `#0c0d12` to `#020203` or `#000`).
     - Brushed chrome borders/accents using linear metallic gradients.
     - Dynamic neon LED strip glows that pulse/flow between deep cobalt blue, icy cyan, and magenta flashes (define a CSS animation `@keyframes` for LED pulses on specific layout components like header or cards).
     - Glassmorphism: enhance backdrop blur (e.g. `blur(20px)` or `blur(24px)`) and slightly reduce panel opacities for a heavy frosted dark console glass feel.
     - Micro-animations: card hover expansion (e.g., scale or lift by 4-5px instead of raw 10px jump) and card tilt or neon sweep.

3. **Milestone 3: Swarm Simulator in planner.html**:
   - Update the Swarm Simulator logic inside `planner.html`. Expand the simulation step logs array to display real-time cryptographic operations:
     - Kyber-768/ML-KEM ephemeral key generation and shared secret decapsulation.
     - Dilithium-65/ML-DSA digital signature creation on marketing tasks and signature validation (resulting in VALID state).
   - Update the SVG visualizer animations:
     - Show glowing pulses or moving dots along connection paths from the supervisor node to agent nodes representing ML-KEM exchange (e.g. cyan dots) and ML-DSA signatures (e.g. magenta flashes).

4. **Milestone 4: Translations & Build Verification**:
   - Add the 6 missing translation keys to `src/translations.js` for all 7 languages (`en`, `es`, `ja`, `zh`, `ko`, `ru`, `ar`):
     - `nav_orchestration`
     - `orch_title`
     - `orch_lead`
     - `orch_monitor_pitch`
     - `orch_orbit_pitch`
     - `orch_cta`
   - Test using `python scratch/verify_translations.py` to ensure all keys match perfectly.
   - Run `npm run build` and verify that the build succeeds without error.
   - Write a detailed `handoff.md` file in your working directory summarizing the files modified and build/test verification results.
