# Handoff Report: Space-Tech Style & RTL Language Layout Strategy

This report details the read-only investigation and recommended strategies for Milestones R2 & R3, focusing on Space-Tech theme modernization, RTL layout compliance, and DOM-XSS mitigation for the local CRM dashboard.

---

## 1. Observation

### 1.1 Project Settings & Discrepancies
- **`PROJECT.md` (Line 29)**: States that lead CRM data should be stored under the key `'leads'`:
  > `Key leads: JSON array of objects [{ name, email, company, purpose, details, timestamp }] stored in localStorage.`
- **`src/modules/service-modal.js` (Line 75, 85)** & **`planner.html` (Line 655, 711)**: Actually use the key `'local_leads'`:
  > `const localLeads = JSON.parse(localStorage.getItem('local_leads') || '[]');`
  > `localStorage.setItem('local_leads', JSON.stringify(localLeads));`

### 1.2 Space-Tech Theme CSS variables
- **`style.css` (Lines 4-17)**: Defines the original color theme:
  ```css
  --bg-color: #08090a;
  --bg-secondary: #0e1013;
  --text-primary: #f0f0f0;
  --text-secondary: #cbd5e1;
  --accent-primary: #2563eb;
  --accent-primary-rgb: 37, 99, 235;
  --accent-secondary: #00f5ff;
  --accent-secondary-rgb: 0, 245, 255;
  --accent-gradient: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  ```
- **Hardcoded Legacy Accent Secondary Colors**: Multiple elements use the hardcoded copper RGB color (`192, 129, 89`):
  - **Line 93**: `radial-gradient(circle at 80% 80%, rgba(192, 129, 89, 0.08) 0%, transparent 40%)`
  - **Line 171**: `.btn-primary:hover { box-shadow: 0 6px 20px rgba(192, 129, 89, 0.4); }`
  - **Lines 454 & 456**: `.btn-cv:hover { background: rgba(192, 129, 89, 0.15); box-shadow: 0 0 20px rgba(192, 129, 89, 0.25); }`
  - **Line 1129**: `.cursor-outline { border: 1px solid rgba(192, 129, 89, 0.5); }`
  - **Line 1899**: `.modal-form input:focus { box-shadow: 0 0 10px rgba(192, 129, 89, 0.15); }`

### 1.3 RTL Direction Settings & Layout Overrides
- **`src/modules/i18n.js` (Lines 34-38)**: Dynamically sets `dir="rtl"` on the document element when Arabic is chosen:
  ```javascript
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
  ```
- **Non-dynamic layout alignments in `style.css`**:
  - **Navbar / Language Dropdown**:
    - `.theme-toggle-btn` (Line 52): `margin-right: 15px;`
    - `.lang-switcher-dropdown` (Lines 284-286): `margin-left: 1.5rem; padding-left: 1.5rem; border-left: 1px solid var(--glass-border);`
    - `.lang-dropdown-menu` (Line 313): `right: 0;`
    - `.lang-dropdown-menu .lang-btn` (Line 347): `text-align: left;`
  - **Timeline Section**:
    - `.timeline-item` (Lines 637-638): `padding-left: 2rem; border-left: 2px solid var(--glass-border);`
    - `.timeline-item::before` (Line 644): `left: -7px;`
  - **Floating Widgets & Controls**:
    - `.floating-controls` (Lines 1475-1476): `right: 30px;` and `align-items: flex-end;`
    - `.ai-assistant` (Line 1532): `right: 50px; transform-origin: bottom right;`
    - `.dj-player` (Line 1226): `right: 20px; transform-origin: bottom right;`
  - **Modals & Forms**:
    - `.modal-close-btn` (Line 1836): `right: 1.5rem;`
    - `.modal-form .form-group` (Line 1868): `text-align: left;`
  - **AI Assistant Chat elements**:
    - `.ai-msg.bot` (Line 1633): `border-bottom-left-radius: 2px;`
    - `.ai-msg.user` (Line 1640): `border-bottom-right-radius: 2px;`
    - `.ai-typing-indicator` (Lines 1650, 1655): `margin-left: 20px; border-bottom-left-radius: 2px;`
  - **Mobile Specifics**:
    - `.services-aside` (Line 2258): `text-align: left;` on mobile.
    - `.preview-overlay` (Line 1011): `right: 12px; left: auto;` on mobile.

### 1.4 Local CRM & DOM-XSS Vulnerability
- **`src/modules/service-modal.js`**: Reads inputs (name, email, service, country, details) and saves them to `localStorage` under `'local_leads'` key without sanitization.
- **`src/modules/cv-download.js`**: Reads inputs (name, email, company, purpose) and saves them under `'local_cv_requests'` key without sanitization.
- **`planner.html` (Lines 693-702)**: Direct injection into `.innerHTML` of the CRM table:
  ```javascript
  tr.innerHTML = `
    <td>${dateStr}</td>
    <td><strong>${entry.name}</strong></td>
    <td><a href="mailto:${entry.email}" ...>${entry.email}</a></td>
    <td>${typeBadge}</td>
    <td>${descField}</td>
    ...
  `;
  ```
  If an attacker inputs `<img src=x onerror=alert(1)>` in the form, it executes upon rendering in the CRM dashboard.

---

## 2. Logic Chain

1. **Space-Tech Variables**: The current `:root` variables must be updated to cobalt blue (`#1A56DB` or `#2563EB`) and deep space gray background (`#0a0b0e`). Incorporating a dedicated `--neon-glow` using cyan (`#00f5ff`) creates the accent light look. Consolidated variables must replace the hardcoded copper color `192, 129, 89` to establish brand consistency.
2. **RTL Support**: Since `i18n.js` toggles `html[dir="rtl"]`, targeting this selector is the most robust and backward-compatible way to apply RTL-specific layout overrides in CSS. Absolute alignments (`left`, `right`, margins, paddings, transform origins, text-alignments, and bubble border-radii) must be flipped explicitly using `html[dir="rtl"]` overrides.
3. **DOM-XSS Mitigation**: To eliminate DOM-XSS, a dual-layer approach is safest:
   - **Storage layer (Sanitization)**: Sanitize data in `service-modal.js` and `cv-download.js` before inserting it into `localStorage` (stripping tags, validating email structures).
   - **Render layer (Escaping)**: Use an `escapeHTML` utility in `planner.html` to escape text before appending it to `innerHTML`, preventing browser parser execution of injected HTML/JS scripts.

---

## 3. Caveats

- **No Automated Tests**: No automated test suites (like Jest or Vitest) are configured in the repository; validation must be verified manually in a browser or by running the production build (`npm run build`).
- **Logical Properties**: Refactoring the entire 2200-line `style.css` to CSS logical properties (`margin-inline-start`, etc.) is another option, but adding clean `html[dir="rtl"]` overrides is safer and prevents regressions.
- **Third-Party Libraries**: Any third-party styles injected by dependencies (e.g., Canvas, Vite-plugin-PWA overlays) might not honor the `html[dir="rtl"]` rules and would need custom scoping if used.

---

## 4. Conclusion & Detailed Strategy

### 4.1 R2: Premium Space-Tech Design Variables Proposal
Insert the following variables into `:root` in `style.css`:

```css
:root {
  /* Colors */
  --bg-color: #0c0d12;                /* Premium deep space metallic gray */
  --bg-secondary: #141722;           /* Space gray panels */
  --text-primary: #f1f5f9;           /* Slate 100 off-white */
  --text-secondary: #94a3b8;         /* Slate 400 muted gray */
  
  --accent-primary: #2563eb;         /* Premium Cobalt Blue */
  --accent-primary-rgb: 37, 99, 235;
  --accent-secondary: #00f5ff;       /* Neon Cyan accent lights */
  --accent-secondary-rgb: 0, 245, 255;
  --accent-gradient: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  
  --glass-bg: rgba(20, 23, 34, 0.65); /* Translucent space gray glass */
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-neon: rgba(0, 245, 255, 0.15); /* Subtle cyan neon panel border */

  /* Neon Accents & Glows */
  --neon-glow: 0 0 15px rgba(0, 245, 255, 0.35), 0 0 5px rgba(0, 245, 255, 0.15);
  --accent-glow: 0 0 15px rgba(var(--accent-primary-rgb), 0.3);
  
  /* Typography & Layout */
  --font-main: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Outfit', system-ui, -apple-system, sans-serif;
  --container-width: 1100px;
  --border-radius: 16px;
  --transition-fast: 0.2s ease;
  --transition-smooth: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

*Replacement Guide for hardcoded colors:*
- Replace all instances of `rgba(192, 129, 89, ...)` with `rgba(var(--accent-secondary-rgb), ...)` or `var(--neon-glow)` (on buttons and input focus states).

---

### 4.2 R3: RTL Layout Overrides Proposal
Append the following override block at the end of `style.css`:

```css
/* ==========================================================================
   RTL (Right-to-Left) Language Layout Support
   ========================================================================== */
html[dir="rtl"] {
  direction: rtl;
  unicode-bidi: embed;
}

/* 1. Header & Dropdown */
html[dir="rtl"] .theme-toggle-btn {
  margin-right: 0;
  margin-left: 15px;
}
html[dir="rtl"] .lang-switcher-dropdown {
  margin-left: 0;
  margin-right: 1.5rem;
  padding-left: 0;
  padding-right: 1.5rem;
  border-left: none;
  border-right: 1px solid var(--glass-border);
}
html[dir="rtl"] .lang-dropdown-menu {
  right: auto;
  left: 0;
}
html[dir="rtl"] .lang-dropdown-menu .lang-btn {
  text-align: right;
}

/* 2. Timeline */
html[dir="rtl"] .timeline-item {
  padding-left: 0;
  padding-right: 2rem;
  border-left: none;
  border-right: 2px solid var(--glass-border);
}
html[dir="rtl"] .timeline-item::before {
  left: auto;
  right: -7px;
}

/* 3. Floating Controls & Widgets */
html[dir="rtl"] .floating-controls {
  right: auto;
  left: 30px;
  align-items: flex-start;
}
html[dir="rtl"] .ai-assistant {
  right: auto;
  left: 50px;
  transform-origin: bottom left;
}
html[dir="rtl"] .dj-player {
  right: auto;
  left: 20px;
  transform-origin: bottom left;
}

/* 4. Modals & Forms */
html[dir="rtl"] .modal-close-btn {
  right: auto;
  left: 1.5rem;
}
html[dir="rtl"] .modal-form .form-group {
  text-align: right;
}

/* 5. AI Chat Bubble Shapes & Typing Indicator */
html[dir="rtl"] .ai-msg.bot {
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 2px;
}
html[dir="rtl"] .ai-msg.user {
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 2px;
}
html[dir="rtl"] .ai-typing-indicator {
  margin-left: 0;
  margin-right: 20px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 2px;
}

/* 6. Mobile Overrides */
@media (max-width: 768px) {
  html[dir="rtl"] .timeline-item {
    padding-right: 1.5rem;
    padding-left: 0;
  }
  html[dir="rtl"] .preview-overlay {
    right: auto;
    left: 12px;
  }
  html[dir="rtl"] .floating-controls {
    left: calc(30px + env(safe-area-inset-left, 0px));
    right: auto;
  }
  html[dir="rtl"] .services-aside {
    text-align: right;
    align-items: flex-end;
  }
}
```

---

### 4.3 Lead CRM DOM-XSS Protection Strategy

#### Step A: Sanitization Helper Function
Add this helper function to both `src/modules/service-modal.js` and `src/modules/cv-download.js`:

```javascript
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip basic HTML tags
    .trim();
};
```

#### Step B: Apply Sanitization before localStorage writes
- **In `src/modules/service-modal.js` (Form submit)**:
  ```javascript
  localLeads.push({
    id: Date.now(),
    name: sanitizeInput(formData.get('name') || ''),
    email: sanitizeInput(formData.get('email') || ''),
    service: sanitizeInput(formData.get('service') || ''),
    country: sanitizeInput(formData.get('country') || ''),
    details: sanitizeInput(formData.get('details') || ''),
    date: new Date().toISOString()
  });
  ```
- **In `src/modules/cv-download.js` (Submit callback)**:
  ```javascript
  localCvRequests.push({
    id: Date.now(),
    name: sanitizeInput(nameVal),
    email: sanitizeInput(emailVal),
    company: sanitizeInput(companyVal),
    purpose: sanitizeInput(purposeVal),
    date: new Date().toISOString()
  });
  ```

#### Step C: Context-Aware Escaping on Render (in `planner.html`)
Declare this HTML escaping utility at the top of the script tag in `planner.html`:

```javascript
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (match) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return map[match];
  });
}
```

And update the table row output inside `loadCrmData()` (lines 693-702):
```javascript
tr.innerHTML = `
  <td>${dateStr}</td>
  <td><strong>${escapeHTML(entry.name)}</strong></td>
  <td><a href="mailto:${escapeHTML(entry.email)}" style="color: var(--accent-cyan); text-decoration: none;">${escapeHTML(entry.email)}</a></td>
  <td>${typeBadge}</td>
  <td>${descField}</td>
  <td>
    <button class="btn btn-danger btn-sm" onclick="deleteEntry('${entry.entryType}', ${entry.id})" style="padding: 2px 6px; font-size: 0.75rem;">Eliminar</button>
  </td>
`;
```
*(Note: `descField` contains pre-formatted HTML badges, but its inner components like `entry.details`, `entry.country`, and `entry.company` must be wrapped in `escapeHTML()` before being combined into `descField` inside the conditionals:)*
```javascript
if (entry.entryType === 'proposal') {
  const badgeClass = `badge-${entry.service}`;
  const serviceNames = { web: 'Web Dev', ai: 'IA Bots', brand: 'Branding', dj: 'DJ Presskit' };
  typeBadge = `<span class="badge ${badgeClass}">${serviceNames[entry.service] || entry.service}</span>`;
  descField = `<strong>Detalles:</strong> ${escapeHTML(entry.details)} <br><small style="color: var(--text-muted);">País: ${escapeHTML(entry.country)}</small>`;
} else {
  typeBadge = `<span class="badge badge-cv">Descarga CV</span>`;
  const purposeNames = { hire: 'Contratar', collab: 'Colaboración', invest: 'Inversión', other: 'Otro' };
  descField = `<strong>Empresa:</strong> ${escapeHTML(entry.company)} <br><small style="color: var(--text-muted);">Propósito: ${purposeNames[entry.purpose] || entry.purpose}</small>`;
}
```

---

## 5. Verification Method

### 5.1 Build Check
Run the production build command in terminal to ensure no compilation issues are introduced:
```powershell
npm run build
```

### 5.2 RTL Layout Verification
1. Launch the development server: `npm run dev` and open the URL.
2. Open the language selector and switch to Arabic (`العربية`).
3. Verify using the browser inspector:
   - The `<html>` element has `dir="rtl"`.
   - The timeline indicators (circles and line) are correctly on the right and text is on the left.
   - The floating controls widget and AI assistant are positioned on the bottom-left of the viewport.
   - Modals and forms are right-aligned.
   - The bot chat bubbles have their minor border radius on the bottom-right and users' on bottom-left.

### 5.3 DOM-XSS Mitigation Verification
1. Submit a lead using the proposal form with the name `<img src=x onerror=alert("XSS")>` and detail `<script>alert("XSS_Detail")</script>`.
2. Open the autonomous planner dashboard (`/planner.html`).
3. Confirm that no alerts are triggered and the elements are displayed literally as text elements: `&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;`.
