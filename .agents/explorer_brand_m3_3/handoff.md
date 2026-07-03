# Handoff Report: planner.html (R4) Draft Implementation

## 1. Observation
In exploring the workspace and files at `c:\Users\USER\Wilfredo-Caro-Marca`, I observed the following:
* **Existing File**: The prototype dashboard at `c:\Users\USER\Wilfredo-Caro-Marca\planner.html` (970 lines long) contains the fundamental UI elements, layout tabs, styles, and basic business logic for the Leads CRM, LinkedIn Planner, Midjourney Prompt Generator, and Agent Swarm Simulator.
* **DOM-XSS Vulnerability (Lines 693-703)**:
  ```javascript
  tr.innerHTML = `
    <td>${dateStr}</td>
    <td><strong>${entry.name}</strong></td>
    <td><a href="mailto:${entry.email}" style="color: var(--accent-cyan); text-decoration: none;">${entry.email}</a></td>
    <td>${typeBadge}</td>
    <td>${descField}</td>
    <td>
      <button class="btn btn-danger btn-sm" onclick="deleteEntry('${entry.entryType}', ${entry.id})" style="padding: 2px 6px; font-size: 0.75rem;">Eliminar</button>
    </td>
  `;
  ```
  The fields `entry.name`, `entry.email`, `entry.details`, `entry.company`, and `entry.purpose` (which are written to `localStorage` from the contact forms in `src/modules/service-modal.js` and `src/modules/cv-download.js`) are directly interpolated into `tr.innerHTML` without sanitization or HTML escaping. An attacker submitting malicious input containing HTML tags or inline scripts (e.g. `<img src=x onerror=alert(1)>`) would trigger script execution under the site's origin when the dashboard is loaded.
* **JavaScript CSS Selector Syntax Error (Line 909)**:
  ```javascript
  const niche = document.querySelector('name=["niche"]:checked')?.value || 'b2b';
  ```
  This line throws a `DOMException` at runtime (`Failed to execute 'querySelector' on 'Document': 'name=["niche"]:checked' is not a valid selector.`) because the square brackets are incorrectly placed. The browser cannot find elements using this selector, which crashes the execution of the Agent Swarm Simulator when the user clicks **"Iniciar Ejecución del Enjambre"**.
* **Global Theme Variables (style.css, Lines 12-27)**:
  The workspace defines a premium, deep-tech/space-tech visual design system with colors:
  * `--bg-color: #08090a` (Deep Space Black)
  * `--bg-secondary: #0e1013` (Space Slate Gray)
  * `--accent-primary: #2563eb` (Cobalt Blue)
  * `--accent-secondary: #00f5ff` (Neon Cyan Light)
  * Font families: `Inter`, `Outfit`, and `Fira Code`.

---

## 2. Logic Chain
1. **Security Compliance**: Since the leads CRM is populated by user inputs from forms (e.g., proposals and CV downloads) saved in `localStorage`, these values are untrusted. To secure the app against DOM-XSS, they must be programmatically sanitized/escaped before being outputted via `innerHTML` or rendered as elements.
2. **Crash Prevention**: To restore functionality to the Agent Swarm Simulator, the invalid selector query at line 909 must be refactored to standard CSS selector syntax: `input[name="niche"]:checked`.
3. **Interactive Visualization Requirements**: The project milestone M4 asks for an interactive visual simulation of Web3 marketing agents working in real-time, showing messages/logs or a graph.
   * By replacing the static console-only layout with a live-rendered SVG network diagram that dynamically changes layout based on the number of active agents and highlights nodes/busses in sync with the log sequence, we can achieve high-fidelity interactivity that matches the "premium Space-Tech design" aesthetic.
4. **Draft Synthesis**: Consolidating these observations and logical requirements leads to the complete, patched, and visually upgraded draft implementation of `planner.html` below.

---

## 3. Caveats
* **Local-First Constraints**: The dashboard relies completely on `localStorage` keys (`local_leads`, `local_cv_requests`, `local_posts`) and local browser execution.
* **Browser Compatibility**: The visual node graph requires SVG support and standard browser CSS transitions, which are universally supported by modern target browsers.

---

## 4. Conclusion & Complete Draft Implementation
The proposed implementation below fixes the CSS query syntax error, introduces an `escapeHTML` helper to completely patch the DOM-XSS vulnerabilities, enhances the AI prompt builder, and implements a real-time, animated SVG Node Graph representing the marketing swarm.

### Proposed Code for `planner.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wilfredo Caro — Brand Control Room & Planner (2026)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-color: #08090a;
      --bg-secondary: #0e1013;
      --bg-tertiary: #15181e;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      
      --accent-cobalt: #2563eb;
      --accent-cyan: #00f5ff;
      --accent-gradient: linear-gradient(135deg, var(--accent-cobalt) 0%, var(--accent-cyan) 100%);
      
      --glass-bg: rgba(255, 255, 255, 0.02);
      --glass-border: rgba(255, 255, 255, 0.08);
      --glass-border-glow: rgba(0, 245, 255, 0.15);
      
      --transition-fast: 0.2s ease;
      --transition-smooth: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg-color);
      color: var(--text-primary);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    
    header {
      background: rgba(8, 9, 10, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1rem 2rem;
    }
    
    .header-container {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 10px var(--accent-cyan);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 5px var(--accent-cyan); }
      50% { box-shadow: 0 0 15px var(--accent-cyan); }
      100% { box-shadow: 0 0 5px var(--accent-cyan); }
    }
    
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    
    .tagline {
      font-size: 0.75rem;
      color: var(--text-muted);
      border-left: 1px solid var(--glass-border);
      padding-left: 0.75rem;
      margin-left: 0.75rem;
      font-family: 'Fira Code', monospace;
    }
    
    nav ul {
      display: flex;
      list-style: none;
      gap: 1rem;
    }
    
    .nav-tab {
      background: none;
      border: 1px solid transparent;
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    
    .nav-tab:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--glass-border);
    }
    
    .nav-tab.active {
      color: #000;
      background: var(--accent-cyan);
      box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);
      border-color: transparent;
    }
    
    main {
      flex: 1;
      max-width: 1300px;
      width: 100%;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    
    .tab-content {
      display: none;
      animation: fadeIn 0.4s ease-out forwards;
    }
    
    .tab-content.active {
      display: block;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Global Card Style */
    .panel-card {
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      margin-bottom: 2rem;
      transition: border-color var(--transition-fast);
    }
    
    .panel-card:hover {
      border-color: var(--glass-border-glow);
    }
    
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 0.5rem;
    }
    
    /* CRM Table Styles */
    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    
    th, td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--glass-border);
    }
    
    th {
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
    
    tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }
    
    .badge {
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-block;
    }
    
    .badge-web { background: rgba(37, 99, 235, 0.15); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.3); }
    .badge-ai { background: rgba(0, 245, 255, 0.15); color: #22d3ee; border: 1px solid rgba(0, 245, 255, 0.3); }
    .badge-brand { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge-dj { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }
    .badge-cv { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    
    /* Buttons */
    .btn {
      background: none;
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: var(--transition-fast);
    }
    
    .btn:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--text-primary);
    }
    
    .btn-accent {
      background: var(--accent-gradient);
      color: #000;
      border-color: transparent;
    }
    
    .btn-accent:hover {
      box-shadow: 0 0 15px rgba(0, 245, 255, 0.4);
      transform: translateY(-1px);
    }
    
    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }
    
    .btn-danger:hover {
      background: #ef4444;
      color: #fff;
      border-color: transparent;
    }
    
    /* Form Elements */
    .form-group {
      margin-bottom: 1.25rem;
    }
    
    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    
    input[type="text"], input[type="email"], select, textarea {
      width: 100%;
      background: var(--bg-tertiary);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 0.75rem;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.9rem;
      transition: var(--transition-fast);
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent-cyan);
      outline: none;
      box-shadow: 0 0 8px rgba(0, 245, 255, 0.15);
    }
    
    /* Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    @media (max-width: 900px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }
    
    /* LinkedIn Preview Simulator */
    .linkedin-card {
      background: #1d2226; /* LinkedIn Dark Mode background */
      border-radius: 10px;
      border: 1px solid #293138;
      padding: 1.25rem;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #e9eaeb;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    
    .linkedin-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .linkedin-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-cobalt);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #fff;
      font-size: 1.25rem;
      border: 2px solid var(--accent-cyan);
    }
    
    .linkedin-meta h4 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
    }
    
    .linkedin-meta p {
      font-size: 0.75rem;
      color: #949699;
      margin-top: 1px;
    }
    
    .linkedin-body {
      font-size: 0.875rem;
      line-height: 1.45;
      white-space: pre-wrap;
      margin-bottom: 1rem;
      color: #e9eaeb;
    }
    
    .linkedin-actions {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #293138;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .linkedin-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #949699;
      font-size: 0.8rem;
      font-weight: 600;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
    }
    
    .linkedin-action-btn:hover {
      background: rgba(255,255,255,0.05);
      color: #fff;
    }

    /* Prompt Generator Grid */
    .prompt-box {
      background: var(--bg-tertiary);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 1rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: var(--accent-cyan);
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 1rem;
      position: relative;
      min-height: 140px;
    }
    
    /* Simulator Live Terminal */
    .terminal-container {
      background: #000;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 1rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #10b981;
      height: 250px;
      overflow-y: auto;
      box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
    }
    
    .terminal-line {
      margin-bottom: 4px;
      line-height: 1.4;
    }
    
    .terminal-line.info { color: #3b82f6; }
    .terminal-line.warn { color: #f59e0b; }
    .terminal-line.success { color: #10b981; }
    
    .sim-slider-val {
      font-family: 'Fira Code', monospace;
      color: var(--accent-cyan);
      font-weight: bold;
    }

    /* Visual Agent Graph styles */
    .visual-graph-container {
      background: #040506;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 1rem;
      position: relative;
      height: 250px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
    }

    /* SVG Glowing styles */
    @keyframes dash {
      to {
        stroke-dashoffset: -20;
      }
    }

    .line-active {
      stroke: var(--accent-cyan) !important;
      stroke-dasharray: 5, 5;
      animation: dash 1s linear infinite;
    }

    .node-group circle {
      transition: fill 0.3s, stroke 0.3s;
    }

    .node-active circle {
      fill: var(--accent-cyan) !important;
      stroke: #fff !important;
    }

    .node-supervisor-active circle {
      fill: var(--accent-cobalt) !important;
      stroke: var(--accent-cyan) !important;
    }

    .node-warn circle {
      fill: #f59e0b !important;
      stroke: #fff !important;
    }

    .node-success circle {
      fill: #10b981 !important;
      stroke: #fff !important;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-container">
      <div class="logo-area">
        <div class="logo-dot"></div>
        <div class="logo-text">WILFREDO CARO</div>
        <div class="tagline">brand_control_room_v2.0.6</div>
      </div>
      <nav>
        <ul>
          <li><button class="nav-tab active" data-tab="crm">📊 Leads CRM</button></li>
          <li><button class="nav-tab" data-tab="social">✍️ Planificador Redes</button></li>
          <li><button class="nav-tab" data-tab="prompts">🌌 Prompts IA</button></li>
          <li><button class="nav-tab" data-tab="simulator">🤖 Simulador Enjambres</button></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <!-- TAB 1: Leads CRM -->
    <section id="tab-crm" class="tab-content active">
      <div class="panel-card">
        <div class="card-title">📊 Gestión de Propuestas y Leads Local-First</div>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          Este panel visualiza los leads y descargas de CV capturados localmente a través de <code>localStorage</code> en el portafolio. Sirve como tu CRM local y privado sin bases de datos externas.
        </p>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <button class="btn btn-accent" id="btn-seed-data">⚡ Sembrar Datos Demo</button>
          <button class="btn btn-danger" id="btn-clear-crm">🗑️ Limpiar Base Local</button>
        </div>

        <div class="table-container">
          <table id="crm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Categoría / Servicio</th>
                <th>Detalles / Empresa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="crm-tbody">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                  No hay registros locales en localStorage. Usa "Sembrar Datos Demo" para probar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 2: Planificador de Redes -->
    <section id="tab-social" class="tab-content">
      <div class="layout-grid">
        <div class="panel-card">
          <div class="card-title">✍️ Escritor de Contenido & Storytelling</div>
          
          <div class="form-group">
            <label for="post-title">Título / Eje Temático del Post</label>
            <input type="text" id="post-title" placeholder="Ej. El Caos de los Agentes de IA en Producción">
          </div>
          
          <div class="form-group">
            <label for="post-body">Cuerpo de la Publicación (LinkedIn / Texto)</label>
            <textarea id="post-body" rows="12" placeholder="Escribe tu copy aquí. Usa espacios amplios, listas y ganchos directos..."></textarea>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-accent" id="btn-save-post">💾 Guardar Localmente</button>
            <button class="btn" id="btn-load-ideas">📂 Cargar Pre-cargados</button>
          </div>
        </div>
        
        <div class="panel-card">
          <div class="card-title">📱 Simulación de Post (LinkedIn Preview)</div>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">
            Previsualización en tiempo real de cómo lucirá tu storytelling técnico para directivos, CTOs y fundadores.
          </p>
          
          <div class="linkedin-card">
            <div class="linkedin-header">
              <div class="linkedin-avatar">WC</div>
              <div class="linkedin-meta">
                <h4>Wilfredo Caro</h4>
                <p>AI Multi-Agent Systems Architect · CEO de VirtuadsAi · CTO de Orbit</p>
                <p>Ahora mismo · 🌐</p>
              </div>
            </div>
            <div class="linkedin-body" id="linkedin-preview-body">El contenido que escribas en el panel de la izquierda se previsualizará aquí de manera interactiva en tiempo real...</div>
            <div class="linkedin-actions">
              <button class="linkedin-action-btn">👍 Reaccionar</button>
              <button class="linkedin-action-btn">💬 Comentar</button>
              <button class="linkedin-action-btn">🔁 Compartir</button>
              <button class="linkedin-action-btn">📤 Enviar</button>
            </div>
          </div>
          
          <div style="margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem;">
            <h4 style="font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem; font-size: 0.95rem;">Borradores Guardados</h4>
            <div id="drafts-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto;">
              <p style="color: var(--text-muted); font-size: 0.8rem;">No hay borradores guardados aún.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: Prompts IA -->
    <section id="tab-prompts" class="tab-content">
      <div class="panel-card">
        <div class="card-title">🌌 Generador de Prompts de IA de Alta Costura</div>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          Selecciona las directrices visuales que quieres proyectar y la IA compilará el prompt estructurado exacto para Midjourney v6 o DALL-E 3.
        </p>
        
        <div class="layout-grid">
          <div>
            <div class="form-group">
              <label for="prompt-style">Estilo / Vibe General</label>
              <select id="prompt-style">
                <option value="cyberpunk">Cyberpunk Elegante (Ejecutivo de alta tecnología)</option>
                <option value="studio">Estudio Minimalista (Suéter premium, fondo limpio, corporativo)</option>
                <option value="workspace">Centro de Comando Futurista (Wilfredo operando pantallas de enjambres)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="prompt-camera">Cámara & Lente</label>
              <select id="prompt-camera">
                <option value="85mm">85mm f/1.8 Prime (Retrato nítido, bokeh profundo)</option>
                <option value="35mm">35mm Hasselblad (Formato medio, textura ultra premium)</option>
                <option value="50mm">50mm Leica Noctilux (Iluminación natural, enfoque selectivo)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="prompt-attire">Vestimenta</label>
              <select id="prompt-attire">
                <option value="suit">Traje Negro de Alta Costura Tech (Elegancia minimalista)</option>
                <option value="turtleneck">Suéter de Lana Merino Charcoal Gray (Aspecto intelectual/CTO)</option>
                <option value="bomber">Chaqueta Bomber Cyber-Tech Mate (Vibe de desarrollo descentralizado)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="prompt-lighting">Acento de Iluminación</label>
              <select id="prompt-lighting">
                <option value="electric">Cian Eléctrico y Azul Cobalto (Glow digital)</option>
                <option value="dark">Claros-Oscuros dramáticos (Cálido corporativo y sombras de estudio)</option>
                <option value="indigo">Neón Índigo y Aqua sutil (Vibra de software de observabilidad)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="prompt-format">Formato de Imagen (Aspect Ratio)</label>
              <select id="prompt-format">
                <option value="16:9">Horizontal (16:9 - Portadas de LinkedIn/Web)</option>
                <option value="1:1">Cuadrado (1:1 - Avatar de Perfil)</option>
                <option value="9:16">Vertical (9:16 - Reels / Stories)</option>
                <option value="4:5">Feed Retrato (4:5 - Ideal para posts)</option>
              </select>
            </div>
            
            <button class="btn btn-accent" id="btn-generate-prompt" style="width: 100%;">🚀 Generar Prompt Estructurado</button>
          </div>
          
          <div>
            <label>Prompt Compilado (Copiar y pegar en Midjourney / DALL-E 3)</label>
            <div class="prompt-box" id="prompt-output-box">Selecciona los parámetros y presiona "Generar Prompt Estructurado"...</div>
            <button class="btn" id="btn-copy-prompt" style="margin-top: 1rem; width: 100%;">📋 Copiar al Portapapeles</button>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: Simulador de Enjambres -->
    <section id="tab-simulator" class="tab-content">
      <div class="layout-grid">
        <div class="panel-card">
          <div class="card-title">🤖 Simulador Interactivo de Enjambres IA (VirtuadsAi)</div>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            Ajusta los deslizadores de campaña para emular el rendimiento y ROI de un enjambre de marketing inteligente operando bajo supervisión del Antigravity Monitor.
          </p>
          
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <label>Presupuesto Mensual API/Ads</label>
              <span class="sim-slider-val" id="val-budget">$500 USD</span>
            </div>
            <input type="range" id="sim-budget" min="100" max="5000" step="100" value="500" style="width: 100%;">
          </div>
          
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <label>Número de Agentes Supervisados</label>
              <span class="sim-slider-val" id="val-agents">5 Agentes</span>
            </div>
            <input type="range" id="sim-agents" min="2" max="10" step="1" value="5" style="width: 100%;">
          </div>
          
          <div class="form-group">
            <label>Nicho de Negocio</label>
            <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem;">
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="niche" value="b2b" checked> B2B Deep Tech / SaaS
              </label>
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="niche" value="ecommerce"> E-commerce Global
              </label>
            </div>
          </div>
          
          <button class="btn btn-accent" id="btn-start-simulation" style="width: 100%;">⚡ Iniciar Ejecución del Enjambre</button>
        </div>
        
        <div class="panel-card" style="display: flex; flex-direction: column;">
          <div class="card-title">💻 Consola de Monitorización y ROI Estimado</div>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-top: 1rem; flex: 1;">
            
            <!-- Dynamic SVG network visualization of Swarm -->
            <div>
              <label>Arquitectura de Swarm en Tiempo Real</label>
              <div class="visual-graph-container" style="margin-top: 0.5rem;">
                <svg id="swarm-svg" width="100%" height="100%" style="overflow: visible;"></svg>
              </div>
            </div>

            <!-- Terminal Output -->
            <div>
              <label>Logs del Monitor Antigravity</label>
              <div class="terminal-container" id="terminal-log" style="margin-top: 0.5rem;">
                <div class="terminal-line info">[SISTEMA] Listo para iniciar simulación. Ajusta las variables del panel izquierdo.</div>
              </div>
            </div>

          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
            <div class="panel-card" style="margin-bottom: 0; padding: 1rem; background: var(--bg-tertiary); text-align: center;">
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">LEADS OBTENIDOS / MES</div>
              <div id="result-leads" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.5rem;">-</div>
            </div>
            <div class="panel-card" style="margin-bottom: 0; padding: 1rem; background: var(--bg-tertiary); text-align: center;">
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">ROI MÁXIMO ESTIMADO</div>
              <div id="result-roi" style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 0.5rem;">-</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <script>
    // Security: Escape user inputs to prevent DOM-XSS
    const escapeHTML = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Tab switching logic
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        
        // Redraw graph if switching to simulator
        if (tab.dataset.tab === 'simulator') {
          setTimeout(() => drawSwarmGraph(parseInt(simAgentsSlider.value)), 50);
        }
      });
    });

    // CRM Local logic
    const crmTbody = document.getElementById('crm-tbody');
    const btnSeed = document.getElementById('btn-seed-data');
    const btnClearCrm = document.getElementById('btn-clear-crm');
    
    const loadCrmData = () => {
      crmTbody.innerHTML = '';
      
      const leads = JSON.parse(localStorage.getItem('local_leads') || '[]');
      const cvs = JSON.parse(localStorage.getItem('local_cv_requests') || '[]');
      
      // Combine and sort by date descending
      const allEntries = [
        ...leads.map(l => ({ ...l, entryType: 'proposal' })),
        ...cvs.map(c => ({ ...c, entryType: 'cv' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (allEntries.length === 0) {
        crmTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
              No hay registros locales en localStorage. Usa "Sembrar Datos Demo" para probar.
            </td>
          </tr>
        `;
        return;
      }
      
      allEntries.forEach(entry => {
        const tr = document.createElement('tr');
        const dateStr = new Date(entry.date).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
        
        let typeBadge = '';
        let descField = '';
        
        if (entry.entryType === 'proposal') {
          const badgeClass = `badge-${escapeHTML(entry.service)}`;
          const serviceNames = { web: 'Web Dev', ai: 'IA Bots', brand: 'Branding', dj: 'DJ Presskit' };
          typeBadge = `<span class="badge ${badgeClass}">${escapeHTML(serviceNames[entry.service] || entry.service)}</span>`;
          descField = `<strong>Detalles:</strong> ${escapeHTML(entry.details)} <br><small style="color: var(--text-muted);">País: ${escapeHTML(entry.country)}</small>`;
        } else {
          typeBadge = `<span class="badge badge-cv">Descarga CV</span>`;
          const purposeNames = { hire: 'Contratar', collab: 'Colaboración', invest: 'Inversión', other: 'Otro' };
          descField = `<strong>Empresa:</strong> ${escapeHTML(entry.company)} <br><small style="color: var(--text-muted);">Propósito: ${escapeHTML(purposeNames[entry.purpose] || entry.purpose)}</small>`;
        }
        
        tr.innerHTML = `
          <td>${dateStr}</td>
          <td><strong>${escapeHTML(entry.name)}</strong></td>
          <td><a href="mailto:${escapeHTML(entry.email)}" style="color: var(--accent-cyan); text-decoration: none;">${escapeHTML(entry.email)}</a></td>
          <td>${typeBadge}</td>
          <td>${descField}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteEntry('${escapeHTML(entry.entryType)}', ${entry.id})" style="padding: 2px 6px; font-size: 0.75rem;">Eliminar</button>
          </td>
        `;
        crmTbody.appendChild(tr);
      });
    };

    window.deleteEntry = (type, id) => {
      if (type === 'proposal') {
        const leads = JSON.parse(localStorage.getItem('local_leads') || '[]');
        const updated = leads.filter(l => l.id !== id);
        localStorage.setItem('local_leads', JSON.stringify(updated));
      } else {
        const cvs = JSON.parse(localStorage.getItem('local_cv_requests') || '[]');
        const updated = cvs.filter(c => c.id !== id);
        localStorage.setItem('local_cv_requests', JSON.stringify(updated));
      }
      loadCrmData();
    };

    btnSeed.addEventListener('click', () => {
      const mockLeads = [
        { id: 1719914400000, name: 'Carolina Gómez', email: 'carolina.gomez@techstart.co', service: 'ai', country: 'CO', details: 'Bot de WhatsApp inteligente para atención al cliente y agendamiento de citas médicas.', date: '2026-07-02T10:30:00.000Z' },
        { id: 1719915400000, name: 'Michael Chen', email: 'mchen@venturecapital.sg', service: 'web', country: 'Global', details: 'Smart-contracts auditables para plataforma DeFi de fan value. Preparación PQC.', date: '2026-07-02T15:45:00.000Z' },
        { id: 1719916400000, name: 'Andrés Mendoza', email: 'a.mendoza@clubsonico.com', service: 'dj', country: 'CO', details: 'Pressekit electrónico e integración de reproductor para el festival de música electrónica local.', date: '2026-07-03T01:10:00.000Z' }
      ];
      const mockCvs = [
        { id: 1719917400000, name: 'Sarah Connor', email: 'sconnor@cyberdyne.io', company: 'Cyberdyne Systems', purpose: 'hire', date: '2026-07-03T03:22:00.000Z' },
        { id: 1719918400000, name: 'Kenji Tanaka', email: 'k.tanaka@tokyoai.co.jp', company: 'Tokyo AI Corp', purpose: 'invest', date: '2026-07-03T04:50:00.000Z' }
      ];
      
      localStorage.setItem('local_leads', JSON.stringify(mockLeads));
      localStorage.setItem('local_cv_requests', JSON.stringify(mockCvs));
      loadCrmData();
    });

    btnClearCrm.addEventListener('click', () => {
      if (confirm('¿Seguro de borrar todas las solicitudes del CRM local?')) {
        localStorage.removeItem('local_leads');
        localStorage.removeItem('local_cv_requests');
        loadCrmData();
      }
    });

    // Tab 2: Planner & Previews
    const postTitle = document.getElementById('post-title');
    const postBody = document.getElementById('post-body');
    const btnSavePost = document.getElementById('btn-save-post');
    const btnLoadIdeas = document.getElementById('btn-load-ideas');
    const linkedinPreview = document.getElementById('linkedin-preview-body');
    const draftsList = document.getElementById('drafts-list');

    const updateLinkedInPreview = () => {
      const rawText = postBody.value.trim() || 'El contenido que escribas en el panel de la izquierda se previsualizará aquí de manera interactiva en tiempo real...';
      let escaped = escapeHTML(rawText);
      
      // Formatting hashtags in LinkedIn Blue
      escaped = escaped.replace(/#(\w+)/g, '<span style="color: #70b5f9; cursor: pointer;">#$1</span>');
      
      // Formatting links in LinkedIn Blue
      escaped = escaped.replace(/((https?:\/\/|www\.)[^\s]+)/g, '<span style="color: #70b5f9; cursor: pointer; text-decoration: underline;">$1</span>');
      
      linkedinPreview.innerHTML = escaped;
    };

    postBody.addEventListener('input', updateLinkedInPreview);

    const loadDrafts = () => {
      draftsList.innerHTML = '';
      const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
      
      if (drafts.length === 0) {
        draftsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem;">No hay borradores guardados aún.</p>';
        return;
      }
      
      drafts.forEach((draft, idx) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
          <div style="cursor: pointer; flex: 1;" onclick="loadDraft(${idx})">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-cyan);">${escapeHTML(draft.title)}</span>
            <br><small style="color: var(--text-muted); font-size: 0.7rem;">${new Date(draft.date).toLocaleDateString()}</small>
          </div>
          <button class="btn btn-danger" onclick="deleteDraft(${idx})" style="padding: 2px 6px; font-size: 0.7rem; border-color: transparent;">🗑️</button>
        `;
        draftsList.appendChild(item);
      });
    };

    window.loadDraft = (idx) => {
      const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
      const draft = drafts[idx];
      if (draft) {
        postTitle.value = draft.title;
        postBody.value = draft.body;
        updateLinkedInPreview();
      }
    };

    window.deleteDraft = (idx) => {
      const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
      drafts.splice(idx, 1);
      localStorage.setItem('local_posts', JSON.stringify(drafts));
      loadDrafts();
    };

    btnSavePost.addEventListener('click', () => {
      const title = postTitle.value.trim();
      const body = postBody.value.trim();
      if (!title || !body) {
        alert('Por favor rellena el título y el cuerpo del post.');
        return;
      }
      
      const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
      drafts.push({ title, body, date: new Date().toISOString() });
      localStorage.setItem('local_posts', JSON.stringify(drafts));
      
      postTitle.value = '';
      postBody.value = '';
      updateLinkedInPreview();
      loadDrafts();
    });

    btnLoadIdeas.addEventListener('click', () => {
      postTitle.value = '💡 El costo oculto del Silent Agent Failure';
      postBody.value = `¿Está tu enjambre de agentes de IA gastando miles de dólares sin que te enteres? 💸
 
La mayoría de las empresas que implementan agentes autónomos sufren de "Silent Agent Failure":
1. El agente entra en bucle infinito de cobro de APIs.
2. Continúa operando con respuestas nulas o repetitivas.
3. El sistema convencional no detecta que el enjambre se descarrió.
 
Para resolver esto, he estado desarrollando el Antigravity Monitor:
"El Datadog para enjambres de agentes". Reconstruye en tiempo real el árbol de llamadas, filtra credenciales sensibles y detecta anomalías al instante. 
 
Y si algo sale mal, Orbit te permite intervenir desde tu smartphone con firmas digitales protegidas por criptografía poscuántica (ML-DSA).
 
¿Estás controlando la seguridad de tus agentes? Conectemos en Calendly: https://calendly.com/wilfredo-caro/swarm-safety #AIAgents #Web3 #Security`;
      updateLinkedInPreview();
    });

    // Tab 3: Prompts IA Generator
    const styleSel = document.getElementById('prompt-style');
    const cameraSel = document.getElementById('prompt-camera');
    const attireSel = document.getElementById('prompt-attire');
    const lightSel = document.getElementById('prompt-lighting');
    const formatSel = document.getElementById('prompt-format');
    const btnGeneratePrompt = document.getElementById('btn-generate-prompt');
    const promptOutput = document.getElementById('prompt-output-box');
    const btnCopy = document.getElementById('btn-copy-prompt');

    btnGeneratePrompt.addEventListener('click', () => {
      const style = styleSel.value;
      const camera = cameraSel.value;
      const attire = attireSel.value;
      const light = lightSel.value;
      const format = formatSel.value;
      
      let baseText = "High-end corporate portrait of Wilfredo Caro, AI Systems Architect.";
      
      if (style === 'cyberpunk') {
        baseText += " Cyberpunk elegance style, sophisticated and minimalist. Cybernetic metropolis background at night, rainy window reflections.";
      } else if (style === 'studio') {
        baseText += " Professional studio portrait. Minimalist aesthetic, clean soft light gray background. Sharp focus, subtle shadows, cinematic contrast. Moody but professional.";
      } else {
        baseText += " Inside his futuristic command center workspace. Sleek dark gray interior with glowing holographic screens showing data visualization of AI agent swarms and quantum cryptographic lattices. Large floor-to-ceiling window overlooking a futuristic clean-tech metropolis. Modern, ultra-premium desk design.";
      }
      
      if (attire === 'suit') {
        baseText += " Dressed in a tailored matte black high-tech suit with subtle LED piping.";
      } else if (attire === 'turtleneck') {
        baseText += " Wearing a sophisticated charcoal gray merino wool turtleneck.";
      } else {
        baseText += " Wearing a premium matte black cyber-tech bomber jacket.";
      }

      if (camera === '85mm') {
        baseText += " Shot on 85mm lens, f/1.8, cinematic lighting, photorealistic, high fashion magazine cover style.";
      } else if (camera === '35mm') {
        baseText += " Shot on 35mm Hasselblad camera, medium format detail, superb clarity, analytical focus.";
      } else {
        baseText += " Shot on 50mm Leica Noctilux, natural light integration, hyper-detailed skin texture, realistic reflection.";
      }

      let lightText = '';
      if (light === 'electric') {
        lightText = " Electric cian and cobalt blue accents, dynamic glowing highlights.";
      } else if (light === 'dark') {
        lightText = " Dark dramatic chiaroscuro lighting, corporate warm tones and professional studio shadows.";
      } else {
        lightText = " Indigo neon and subtle aqua backlight, tech-themed software dashboard ambiance.";
      }
      
      const promptResult = `${baseText}${lightText} --ar ${format} --style raw --v 6.0`;
      promptOutput.textContent = promptResult;
    });

    btnCopy.addEventListener('click', () => {
      const text = promptOutput.textContent;
      if (text.includes('presiona')) return;
      navigator.clipboard.writeText(text).then(() => {
        alert('Prompt copiado al portapapeles.');
      });
    });

    // Tab 4: Swarm Simulator
    const simBudgetSlider = document.getElementById('sim-budget');
    const simAgentsSlider = document.getElementById('sim-agents');
    const valBudget = document.getElementById('val-budget');
    const valAgents = document.getElementById('val-agents');
    const btnStartSim = document.getElementById('btn-start-simulation');
    const terminalLog = document.getElementById('terminal-log');
    
    const resLeads = document.getElementById('result-leads');
    const resRoi = document.getElementById('result-roi');

    simBudgetSlider.addEventListener('input', () => {
      valBudget.textContent = `$${simBudgetSlider.value} USD`;
    });

    simAgentsSlider.addEventListener('input', () => {
      valAgents.textContent = `${simAgentsSlider.value} Agentes`;
      drawSwarmGraph(parseInt(simAgentsSlider.value));
    });

    // SVG Node Swarm Visualizer Graph
    const drawSwarmGraph = (numAgents) => {
      const svg = document.getElementById('swarm-svg');
      if (!svg) return;
      svg.innerHTML = '';
      
      // Glow filters definition
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-cobalt" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      `;
      svg.appendChild(defs);
      
      const width = svg.clientWidth || 400;
      const height = svg.clientHeight || 250;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const supervisor = { x: centerX, y: centerY, label: 'Supervisor (Orbit)', type: 'supervisor' };
      const nodes = [supervisor];
      const count = numAgents - 1;
      const radius = Math.min(width, height) * 0.35;
      
      const agentRoles = [
        'Seguridad Crypt',
        'Copywriter IA',
        'Ad Optimizer',
        'Lead Qualifier',
        'Market Intelligence',
        'Multilingual SEO',
        'Scheduler Agent',
        'Gobernanza/PII',
        'ROI Tracker'
      ];
      
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const role = agentRoles[i % agentRoles.length];
        nodes.push({
          id: i + 1,
          x,
          y,
          label: role,
          type: 'agent'
        });
      }
      
      // Render connection paths
      for (let i = 1; i < nodes.length; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        path.setAttribute('x1', supervisor.x);
        path.setAttribute('y1', supervisor.y);
        path.setAttribute('x2', nodes[i].x);
        path.setAttribute('y2', nodes[i].y);
        path.setAttribute('stroke', '#1e293b');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('id', `link-agent-${nodes[i].id}`);
        svg.appendChild(path);
      }
      
      // Render nodes
      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `node-group ${node.type}`);
        g.setAttribute('id', node.type === 'supervisor' ? 'node-supervisor' : `node-agent-${node.id}`);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', node.type === 'supervisor' ? '12' : '8');
        circle.setAttribute('fill', node.type === 'supervisor' ? '#2563eb' : '#0e1013');
        circle.setAttribute('stroke', node.type === 'supervisor' ? '#00f5ff' : '#64748b');
        circle.setAttribute('stroke-width', '2');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + (node.type === 'supervisor' ? 24 : 18));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#cbd5e1');
        text.setAttribute('font-size', node.type === 'supervisor' ? '10px' : '8px');
        text.setAttribute('font-family', "'Fira Code', monospace");
        text.textContent = node.type === 'supervisor' ? 'Supervisor' : node.label;
        
        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
      });
    };

    window.addEventListener('resize', () => drawSwarmGraph(parseInt(simAgentsSlider.value)));

    let simInterval = null;
    
    btnStartSim.addEventListener('click', () => {
      if (simInterval) clearInterval(simInterval);
      
      // Reset UI elements
      terminalLog.innerHTML = '';
      resLeads.textContent = '-';
      resRoi.textContent = '-';
      
      // Reset Node Graph styling
      document.querySelectorAll('.node-group').forEach(el => {
        el.classList.remove('node-active', 'node-supervisor-active', 'node-warn', 'node-success');
      });
      document.querySelectorAll('line').forEach(el => {
        el.classList.remove('line-active');
      });
      
      const budget = parseFloat(simBudgetSlider.value);
      const agents = parseInt(simAgentsSlider.value);
      
      // FIX: Correct CSS selector for niche input radio
      const nicheInput = document.querySelector('input[name="niche"]:checked');
      const niche = nicheInput ? nicheInput.value : 'b2b';
      
      let step = 0;
      const logs = [
        { text: `[SISTEMA] Inicializando enjambre de ${agents} agentes en VirtuadsAi Core...`, activeNode: 'supervisor', type: 'info' },
        { text: `[SEGURIDAD] Estableciendo canal protegido poscuántico (ML-KEM/Kyber) entre nodos...`, activeNode: 'agent-1', type: 'success' },
        { text: `[CONEXIÓN] Orbit cargado en smartphone. Mando remoto de contingencia listo.`, activeNode: 'supervisor', type: 'info' },
        { text: `[MONITOR] Antigravity Monitor observando variables de ejecución.`, activeNode: 'supervisor', type: 'info' },
        { text: `[AGENTE_ADS] Escaneando palabras clave del nicho de mercado y analizando competidores...`, activeNode: 'agent-3', type: 'info' },
        { text: `[AGENTE_COPY] Generando copys de storytelling en 7 idiomas y variaciones estructurales...`, activeNode: 'agent-2', type: 'info' },
        { text: `[AGENTE_LEADS] Mapeando leads de tomadores de decisiones a través de API cifradas...`, activeNode: 'agent-4', type: 'info' },
        { text: `[SEGURIDAD] PII Redaction activo: 4 credenciales de API bloqueadas en canal de logs.`, activeNode: 'agent-1', type: 'success' },
        { text: `[MONITOR] Advertencia: Agente 3 mostrando latencia de llamada de red. Auto-detención prevenida.`, activeNode: 'agent-3', type: 'warn' },
        { text: `[SISTEMA] Sincronizando flujos y analítica con portal de supervisión...`, activeNode: 'supervisor', type: 'info' },
        { text: `[COMPLETO] Campaña simulada finalizada con éxito. Métricas compiladas.`, activeNode: 'all', type: 'success' }
      ];

      const addTerminalLine = (text, type = 'info') => {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
        terminalLog.appendChild(line);
        terminalLog.scrollTop = terminalLog.scrollHeight;
      };

      btnStartSim.disabled = true;
      btnStartSim.textContent = 'Simulando...';

      simInterval = setInterval(() => {
        if (step < logs.length) {
          const currentLog = logs[step];
          addTerminalLine(currentLog.text, currentLog.type);
          
          // Animate the visual SVG graph
          document.querySelectorAll('.node-group').forEach(el => {
            el.classList.remove('node-active', 'node-supervisor-active', 'node-warn');
          });
          document.querySelectorAll('line').forEach(el => {
            el.classList.remove('line-active');
          });
          
          if (currentLog.activeNode === 'supervisor') {
            const superEl = document.getElementById('node-supervisor');
            if (superEl) superEl.classList.add('node-supervisor-active');
          } else if (currentLog.activeNode === 'all') {
            document.querySelectorAll('.node-group').forEach(el => {
              el.classList.add('node-success');
            });
          } else {
            const nodeEl = document.getElementById(`node-${currentLog.activeNode}`);
            const linkEl = document.getElementById(`link-${currentLog.activeNode}`);
            const superEl = document.getElementById('node-supervisor');
            
            if (nodeEl) {
              if (currentLog.type === 'warn') {
                nodeEl.classList.add('node-warn');
              } else {
                nodeEl.classList.add('node-active');
              }
            }
            if (linkEl) linkEl.classList.add('line-active');
            if (superEl) superEl.classList.add('node-supervisor-active');
          }
          
          step++;
        } else {
          clearInterval(simInterval);
          btnStartSim.disabled = false;
          btnStartSim.textContent = '⚡ Iniciar Ejecución del Enjambre';
          
          // Calculate Estimated Leads & ROI
          const factor = niche === 'b2b' ? 1.4 : 2.1;
          const leadsCalculated = Math.round((budget / 100) * agents * factor);
          const roiCalculated = Math.round(140 + (agents * 12) + (budget / 60));
          
          resLeads.textContent = leadsCalculated.toLocaleString();
          resRoi.textContent = `${roiCalculated}%`;
          
          addTerminalLine(`[ÉXITO] ROI Estimado final: ${roiCalculated}%. Leads esperados: ${leadsCalculated}/mes.`, 'success');
          
          document.querySelectorAll('.node-group').forEach(el => {
            el.classList.remove('node-active', 'node-supervisor-active', 'node-warn');
            el.classList.add('node-success');
          });
        }
      }, 950);
    });

    // Initial load configurations
    loadCrmData();
    loadDrafts();
    drawSwarmGraph(5);
  </script>
</body>
</html>
```

---

## 5. Verification Method
To verify that this implementation is complete, fully functional, and secure:

1. **Verification of DOM-XSS Fix**:
   * Inject a test script payload into the CRM database via DevTools console:
     ```javascript
     localStorage.setItem('local_leads', JSON.stringify([{
       id: 9999, name: '<img src=x onerror=console.log("DOM-XSS-EXPOSED")>', email: 'xss@test.com', service: 'ai', country: 'CO', details: 'Inject test', date: new Date().toISOString()
     }]));
     ```
   * Reload the dashboard. Inspect the CRM page. Verify that the script does not execute and the raw text (`&lt;img src=x onerror=...&gt;`) is displayed harmlessly.
2. **Verification of CSS Selector Fix**:
   * Switch to the **"Simulador Enjambres"** tab.
   * Click **"Iniciar Ejecución del Enjambre"**.
   * Confirm that no Javascript errors/DOMExceptions occur in the Developer Console and that the simulation successfully cycles through all 11 phases.
3. **Verification of SVG Graph Interactivity**:
   * Slide the **"Número de Agentes Supervisados"** slider. Verify that the SVG diagram automatically recalculates and redraws the network nodes (between 2 and 10 agents) dynamically in real-time.
   * Run the simulation and confirm that the connections flash and nodes turn cyan, yellow, and green in lockstep with the generated console messages.
4. **Verification of Build Compatibility**:
   * Run the compilation:
     ```powershell
     npm run build
     ```
   * Confirm that Vite successfully processes all assets and that the output in the `dist` directory remains intact.
