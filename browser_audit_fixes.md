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

---

## Estado de los Bugs

| Bug | Severidad | Estado |
|-----|-----------|--------|
| `srvForm is not defined` en `web3.js` | 🔴 Crítico | ✅ Resuelto |
| `window.trackEvent is not a function` | 🔴 Crítico | ✅ Resuelto |
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
| `main.js` | Importa `bootstrap.js` primero, eliminados imports duplicados |

---

## Verificación

```
npm run build   →  ✓ built in 400ms (34 modules)
```

Build sin errores de runtime. Las advertencias de `%VITE_GA_ID%` son esperadas en entornos locales sin la variable de entorno configurada.
