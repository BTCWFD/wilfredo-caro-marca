## 2026-07-03T10:36:46Z

You are the implementation worker for the portafolio brand optimization project.
Your workspace is c:\Users\USER\Wilfredo-Caro-Marca.
Your metadata folder is c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_implement_1.
Your task is to implement the following requirements precisely:

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

1. Add Metadata Translation Keys to src/translations.js:
   In c:\Users\USER\Wilfredo-Caro-Marca\src\translations.js, add 'meta_title' and 'meta_description' keys to each of the 7 language blocks:
   - en:
     "meta_title": "Wilfredo Caro — AI Multi-Agent Systems Architect | Agent Orchestration & Web3",
     "meta_description": "Wilfredo Caro — AI Multi-Agent Systems Architect. I orchestrate AI agent swarms and deploy them to production with observability, governance, and mobile control. CEO @ VirtuadsAi · CTO @ Orbit."
   - es:
     "meta_title": "Wilfredo Caro — Arquitecto de Sistemas Multi-Agente | Orquestación de Agentes y Web3",
     "meta_description": "Wilfredo Caro — arquitecto de sistemas de múltiples agentes. Orquesto enjambres de agentes IA y los llevo a producción con observabilidad, gobernanza y control móvil. CEO @ VirtuadsAi · CTO @ Orbit."
   - ja:
     "meta_title": "ウィルフレド・カロ — AIマルチエージェント系统アーキテクト | エージェントオーケストレーション & Web3",
     "meta_description": "ウィルフレド・カロ — AIマルチエージェントシステムアーキテクト。AIエージェントの群れを組織し、監視、ガバナンス、モバイルコントロールを備えた本番環境に展開します。CEO @ VirtuadsAi · CTO @ Orbit."
   - zh:
     "meta_title": "Wilfredo Caro — AI多智能体系统架构师 | 智能体协同与Web3",
     "meta_description": "Wilfredo Caro — AI多智能体系统架构师。我负责协调AI智能体集群，并将它们部署到具有可观测性、治理和移动控制功能的生产环境中。VirtuadsAi创始人兼CEO · Orbit联合创始人兼CTO。"
   - ko:
     "meta_title": "Wilfredo Caro — AI 멀티 에이전트 시스템 아키텍트 | 에이전트 오케스트레이션 & Web3",
     "meta_description": "Wilfredo Caro — AI 멀티 에이전트 시스템 아키텍트. AI 에이전트 스웜을 조율하고 관찰 가능성, 거버넌스 및 모바일 제어 기능을 갖춘 프로덕션 환경에 배포합니다. CEO @ VirtuadsAi · CTO @ Orbit."
   - ru:
     "meta_title": "Вильфредо Каро — Архитектор многоагентных систем ИИ | Оркестрация агентов и Web3",
     "meta_description": "Вильфредо Каро — архитектор многоагентных систем ИИ. Я оркеструю рои агентов ИИ и развертываю их в рабочей среде с возможностью наблюдения, управления и мобильного контроля. CEO @ VirtuadsAi · CTO @ Orbit."
   - ar:
     "meta_title": "ويلفريدو كارو — مهندس أنظمة الذكاء الاصطناعي متعددة العملاء | تنسيق العملاء والويب 3",
     "meta_description": "ويلفريدو كارو — مهندس أنظمة ذكاء اصطناعي متعددة العملاء. أقوم بتنسيق مجموعات عملاء الذكاء الاصطناعي ونشرها في الإنتاج من خلال المراقبة والحوكمة والتحكم المحمول. الرئيس التنفيذي لشركة VirtuadsAi · المدير التقني لشركة Orbit."

2. Sync translations.json (root):
   Update c:\Users\USER\Wilfredo-Caro-Marca\translations.json to synchronize it with all 7 languages from src/translations.js (including en, es, ja, zh, ko, ru, ar) so that the LinkedIn Python scripts run correctly.

3. Implement Premium Space-Tech Design Variables & Hardcoded Colors Clean Up in style.css:
   - In c:\Users\USER\Wilfredo-Caro-Marca\style.css, replace the current :root variables with the premium space-tech design variables:
     --bg-color: #0c0d12;
     --bg-secondary: #141722;
     --text-primary: #f1f5f9;
     --text-secondary: #94a3b8;
     --accent-primary: #2563eb;
     --accent-primary-rgb: 37, 99, 235;
     --accent-secondary: #00f5ff;
     --accent-secondary-rgb: 0, 245, 255;
     --accent-gradient: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
     --glass-bg: rgba(20, 23, 34, 0.65);
     --glass-border: rgba(255, 255, 255, 0.08);
     --glass-border-neon: rgba(0, 245, 255, 0.15);
     --neon-glow: 0 0 15px rgba(0, 245, 255, 0.35), 0 0 5px rgba(0, 245, 255, 0.15);
     --accent-glow: 0 0 15px rgba(var(--accent-primary-rgb), 0.3);
   - Replace any hardcoded occurrences of `rgba(192, 129, 89, ...)` in style.css with `rgba(var(--accent-secondary-rgb), ...)` or equivalent variables (specifically check lines 93, 171, 454, 456, 1129, 1899).

4. Implement Dynamic RTL Overrides Block in style.css:
   - Append the layout overrides block at the end of style.css under the selector `html[dir="rtl"]`. This block must override alignment, floating position, margin, padding, direction, and border radii for navbar, language switcher dropdown, timeline items, close buttons, chat widgets, message bubble shapes, and mobile layout.

5. Update SEO Meta Tags in index.html:
   - Replace the current SEO section in c:\Users\USER\Wilfredo-Caro-Marca\index.html (approx lines 26 to 44) with:
     - Updated title & description.
     - Link alternate hreflang tags for default (x-default) and all 7 languages (en, es, ja, zh, ko, ru, ar) using `?lang=...` URLs.
     - Open Graph locales for default and alternate languages.
     - Twitter / X cards tags with `name` attribute instead of `property`, including creator/site handles `@wilfredo_caro`.

6. Implement Dynamic Header SEO Translation in src/modules/i18n.js:
   - Update `updateLanguage` function in c:\Users\USER\Wilfredo-Caro-Marca\src\modules\i18n.js to also dynamically translate the page header tags (`document.title`, `meta[name="description"]`, `meta[property="og:title"]`, etc.) based on translations dictionary strings (using `window.translations[lang]['meta_title']` and `window.translations[lang]['meta_description']`).

7. Update robots.txt & sitemap.xml in public/:
   - Update c:\Users\USER\Wilfredo-Caro-Marca\public\robots.txt to block aggressive AI scrapers (like GPTBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, CCBot, Google-Extended, Anthropic-AI, OAI-SearchBot, FacebookBot, CohereBot, Amazonbot, Applebot-Extended) and explicitly disallow private directories and planner.html (`Disallow: /planner.html`).
   - Update c:\Users\USER\Wilfredo-Caro-Marca\public\sitemap.xml to be a multilingual sitemap containing `<xhtml:link>` elements mapping all 7 language query-parameter variants (?lang=...) for search engine crawlers.

8. Implement Local leads Input Sanitization in Forms:
   - In c:\Users\USER\Wilfredo-Caro-Marca\src\modules\service-modal.js and c:\Users\USER\Wilfredo-Caro-Marca\src\modules\cv-download.js, add a `sanitizeInput` helper function that strips basic HTML tags and trims whitespace. Apply this function to all fields (name, email, company, purpose, service, country, details) before pushing them to the localStorage leads arrays (`local_leads` and `local_cv_requests`).

9. Implement Complete Patched/Enhanced planner.html:
   - Overwrite c:\Users\USER\Wilfredo-Caro-Marca\planner.html with the complete patched code draft provided in Explorer 3's handoff report. This includes the clean-up of the CSS query selector name syntax error (input[name="niche"]:checked), DOM-XSS escaping inside `loadCrmData`, Midjourney prompt builder parameters, and the dynamic interactive SVG node graph simulator.

10. Verify build & execution:
    - Run `npm run build` in the workspace root to confirm everything compiles clean without warnings/errors.
    - Run verification tests to make sure there are no syntax errors or failures.

Deliver your handoff report to c:\Users\USER\Wilfredo-Caro-Marca\.agents\worker_brand_implement_1\handoff.md and message the orchestrator (f6a9052f-9ddc-4caa-b3c2-527b2e5e3072) when done.
