# Browser Audit Fixes — Wilfredo Caro Brand App

Fecha: 2026-06-11  
Entornos auditados: `npm run dev` (Vite Dev), `npm run build && npm run preview` (Prod), Mobile PoC React

---

## Resumen de Hallazgos del Browser Subagent (Playwright)

### 🔴 Bug Crítico 1 — `ReferenceError: srvForm is not defined`
- **Archivo afectado**: `src/modules/web3.js` línea 70
- **Causa raíz**: Al separar `main.js` en módulos, el bloque de envío del formulario de cotizaciones (`if (srvForm) { ... }`) quedó en `web3.js` donde la variable `srvForm` no existe en ese scope.
- **Corrección aplicada**: Se movió el bloque completo a `src/modules/service-modal.js` donde `srvForm`, `closeServiceModal`, y todas las referencias necesarias están definidas en el mismo módulo.

### 🔴 Bug Crítico 2 — `TypeError: window.trackEvent is not a function` (cascading)
- **Causa raíz**: En ES Modules, los `import` statements son **hoisted** y se ejecutan antes del código inline del módulo. Esto significa que aunque `window.trackEvent = ...` aparecía antes de los imports en `main.js`, los módulos se evaluaban antes de que esa línea corriera.
- **Corrección aplicada**: Se creó `src/modules/bootstrap.js` que define todas las utilidades globales (`window.trackEvent`, `window.translations`, `window.prefersReducedMotion`, `window.isTouchDevice`) y se importa como el **primer módulo** en `main.js`, garantizando que estén disponibles cuando cualquier otro módulo se inicialice.

### 🟡 Bug Menor — Import inválido `pwa:-47.js`
- **Archivo afectado**: `main.js`
- **Causa raíz**: El script de Python de extracción generó un nombre de archivo inválido para el bloque de PWA.
- **Corrección aplicada**: Se eliminó el import inválido. La lógica de registro del Service Worker se incorporó directamente en `bootstrap.js`.

### 🟡 Declaración Missing — `const quoteTrigger`
- **Archivo afectado**: `src/modules/service-modal.js`
- **Corrección aplicada**: Se añadió la declaración `const quoteTrigger = document.getElementById('quote-trigger')` antes del bloque `if (quoteTrigger)`.

### 🔴 Bug Crítico 3 — `ReferenceError: renderContactInfo is not defined`
- **Archivos afectados**: `src/modules/i18n.js` y `src/modules/cv-download.js`
- **Causa raíz**: `renderContactInfo` se definió localmente como una variable privada de módulo en `src/modules/contact-info.js`, pero se llamó desde otros módulos (`i18n.js` y `cv-download.js`) sin ser exportada/importada.
- **Corrección aplicada**: Se exportó `renderContactInfo` en `contact-info.js` y se importó en `i18n.js` y `cv-download.js`.

---

## Estado de los Bugs

| Bug | Severidad | Estado |
|-----|-----------|--------|
| `srvForm is not defined` en `web3.js` | 🔴 Crítico | ✅ Resuelto |
| `window.trackEvent is not a function` | 🔴 Crítico | ✅ Resuelto |
| `renderContactInfo is not defined` | 🔴 Crítico | ✅ Resuelto |
| Import `pwa:-47.js` inválido | 🟡 Menor | ✅ Resuelto |
| `quoteTrigger` no declarado | 🟡 Menor | ✅ Resuelto |
| Turnstile widget falla en localhost | ℹ️ Esperado | N/A (solo en Netlify) |
| `/api/geo` falla en Vite dev server | ℹ️ Esperado | N/A (solo en Netlify) |

---

## Estado del Mobile PoC

✅ Sin errores de consola  
✅ `FloatingAssistant` abre correctamente  
✅ `SwipeToDeploy` funciona con gestos táctiles  
✅ `visualViewport` offset funciona en canvas resize  

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/modules/web3.js` | Eliminado bloque `srvForm` (lines 70-112) |
| `src/modules/service-modal.js` | Movido bloque `srvForm`, añadido `const quoteTrigger` |
| `src/modules/bootstrap.js` | **[NUEVO]** Define `window.trackEvent`, globals, SW registration |
| `src/modules/contact-info.js` | Exporta la función `renderContactInfo` |
| `src/modules/i18n.js` | Importa `renderContactInfo` desde `contact-info.js` |
| `src/modules/cv-download.js` | Importa `renderContactInfo` desde `contact-info.js` |
| `main.js` | Importa `bootstrap.js` primero, eliminados imports duplicados |

---

## Verificación

Se verificó el build y el comportamiento en tiempo de ejecución en tres entornos locales:
1. **Web App (Vite Dev Server)**: `npm run dev` en puerto `5173`.
2. **Web App (Vite Preview Server)**: `npm run build && npm run preview` en puerto `4173`.
3. **Mobile App PoC (Vite Dev Server)**: `npm run dev` en `Mobile-App-PoC` en puerto `5173`.

### Resultados del Build:
- **Web App (root)**: Compilado exitosamente (`dist/` generado con 34 módulos). Las advertencias de `%VITE_GA_ID%` en `index.html` son normales y se deben a que la variable no está definida localmente.
- **Mobile PoC**: Compilado exitosamente (`Mobile-App-PoC/dist/` generado con 36 módulos).

### Pruebas Automatizadas (Playwright):
La auditoría de navegador se realizó de manera exitosa:
- Se verificaron cambios de idioma (`es`, `ja`, `en`), cambio de tema visual, modals de descarga de CV y solicitud de servicio, chatbot AI en web y móvil, y gesto táctil "Swipe to Deploy" en Mobile PoC.
- Se confirmaron logs limpios de excepciones, `ReferenceError` o `TypeError` tras corregir `renderContactInfo`.
- **Advertencias esperadas/excepciones conocidas**:
  - `TurnstileError: [Cloudflare Turnstile] Error: 400020` (Widget Turnstile requiere host Netlify).
  - `/api/geo` fetch failed (Endpoint de geolocalización no se expone localmente sin CLI Netlify).
  - Warnings de iframe de Calendly/SoundCloud.
- Las capturas de pantalla de la auditoría se almacenaron en `.agents/worker_verification/` (`env1_dev_*.png`, `env2_preview_*.png`, `mobile_poc_*.png`).
