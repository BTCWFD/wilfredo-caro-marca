# Informe de Auditoría Activa de Marca: Proyecto de Portafolio Profesional de Wilfredo Caro
**Minuta y Evaluación de la Junta Directiva Multidisciplinaria**

---

## 1. Introducción y Propósito de la Auditoría
Este documento consolida la auditoría técnica y estratégica del portafolio de marca personal de **Wilfredo Caro**. El análisis simula una sesión de comité multidisciplinario en la que los líderes de cada área (CEO, CTO, BDM, UX/UI, LEGAL, SENIOR Developer, DevOps y Mobile) discuten de manera exhaustiva el estado actual del proyecto, identificando vulnerabilidades críticas, problemas de rendimiento, inconsistencias visuales y oportunidades de escalabilidad.

---

## 2. Intervenciones de la Junta Directiva

### 2.1. CEO (Dirección Estratégica)
*   **Perspectiva:** La propuesta de valor de la marca es sumamente sólida y diferenciadora. Consiste en un portafolio personal premium enfocado en Web3 e Inteligencia Artificial, consolidando la experiencia real de Wilfredo Caro como CEO de *VirtuadsAi* y CTO de *Orbit*.
*   **Aciertos:** La implementación de un "Clon de IA" en formato de asistente virtual 24/7 demuestra la viabilidad técnica y conceptual del producto que comercializa, sirviendo como una prueba de concepto en vivo de sus capacidades tecnológicas.
*   **Decisión:** Mantener la dirección estratégica "deep-tech" del portafolio y priorizar la resolución inmediata de las fricciones de usuario y seguridad para no deteriorar el valor de la marca personal premium.

---

### 2.2. CTO (Arquitectura y Escalabilidad)
*   **Perspectiva:** "El código base en el root presenta un grave problema de acoplamiento que compromete la mantenibilidad y la escalabilidad a mediano plazo."
*   **Hallazgo Técnico:**
    *   **Archivo:** `main.js` (Ruta raíz: `c:\Users\USER\Wilfredo-Caro-Marca\main.js`).
    *   **Evidencia:** El archivo `main.js` es un monolito gigante de **1331 líneas** que asume más de 12 responsabilidades distintas, tales como:
        1.  Registro y ciclo de vida de la PWA.
        2.  Inicialización de analíticas (Google Analytics).
        3.  Alternador de tema visual (oscuro/claro).
        4.  Lógica de precios dinámicos regionalizados.
        5.  Modales de solicitud de servicio y de descargas de CV.
        6.  Configuración de internacionalización (i18n) e idiomas.
        7.  Efectos de cursor magnético personalizado.
        8.  Renderizado del fondo 3D (Three.js Network) con animaciones.
        9.  Controlador de audio (reproductor de sets DJ Deep Tech).
        10. Gestión de leads y consumo de serverless functions.
        11. Integración con pasarelas de pago (Wompi, Bold, Wenia).
        12. Ajuste de viewport móvil ante teclado virtual.
*   **Recomendación:** Refactorizar de inmediato este archivo monolítico mediante módulos ES6 separados (ej. `js/theme.js`, `js/three-bg.js`, `js/payments.js`, `js/pwa.js`, etc.) y utilizar un bundler (Vite) para empaquetarlos ordenadamente.

---

### 2.3. BDM (Desarrollo de Negocio y Monetización)
*   **Perspectiva:** "El modelo de monetización y cobro dinámico regional es excelente, pero el flujo técnico actual está incompleto y expone credenciales de prueba en producción."
*   **Hallazgos Técnicos:**
    1.  **Precio Regionalizado:** La geolocalización funciona mediante una llamada local a `/api/geo` implementada en Netlify Edge Functions (`netlify/edge-functions/geo.js`), alternando entre pesos colombianos (COP) y dólares (USD).
    2.  **Credenciales de Sandbox en Wompi:**
        *   **Archivo:** `main.js` (Línea 1291).
        *   **Código:**
            ```javascript
            // Sandbox Public Key. Replace with Production Key for real payments.
            publicKey: 'pub_test_Q5yDA9xoKdePzhSGeZaVvwAXmRkdDPGq',
            ```
        *   **Riesgo:** El uso de una llave de pruebas (`pub_test_...`) en producción impide procesar transacciones reales de clientes colombianos.
    3.  **Mockup de Criptomonedas:**
        *   **Archivo:** `main.js` (Líneas 1319-1330).
        *   **Código:**
            ```javascript
            document.querySelectorAll('.pay-wenia-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                trackEvent('open_crypto_checkout');
                if (window.ethereum) {
                   // Simple fallback to connect wallet if desired, but here we just alert
                   alert('La integración Web3 para pagos en Wenia / USDC está en configuración. Contáctame por Calendly.');
                } else {
                   alert('Por favor instala MetaMask o una billetera Web3 para pagos Cripto (Wenia).');
                }
              });
            });
            ```
        *   **Riesgo:** Genera una mala experiencia de usuario y frustración para clientes Web3 al toparse con un modal de alerta incompleto (`alert`).
*   **Recomendación:** Reemplazar la llave pública de pruebas por una variable de entorno de producción y completar la integración de Web3 Wallet Connect / Wenia para habilitar pagos en USDC reales.

---

### 2.4. UX/UI (Experiencia e Interfaz de Usuario)
*   **Perspectiva:** "Se detectaron múltiples fallos de interacción (glitches) en elementos clave que empañan la estética premium y minimalista del portafolio."
*   **Hallazgos Técnicos:**
    1.  **Conflicto de Tiempos en Preloader:**
        *   **Archivo:** `main.js` (Líneas 476-479) y `style.css` (Línea 1099).
        *   **Código (`main.js`):**
            ```javascript
            preloader.style.opacity = '0';
            setTimeout(() => {
              preloader.style.display = 'none';
            }, prefersReducedMotion ? 0 : 400);
            ```
        *   **Código (`style.css`):**
            ```css
            #preloader {
              /* ... */
              transition: opacity 0.8s ease-in-out, visibility 0.8s;
            }
            ```
        *   **Error:** El JavaScript oculta el preloader por completo (`display: none`) a los 400ms, pero la transición CSS de opacidad dura 800ms. Esto corta abruptamente la animación de desvanecimiento a la mitad. Asimismo, la animación de la barra de progreso (`.loader-progress` en `style.css` línea 1142) está configurada con `animation: progress 2.5s ease-out forwards;`, mientras que el evento real `load` en JS ocurre a los ~700ms, desincronizándose por completo del estado real de carga.
    2.  **Cursor Personalizado Desplazado e Inoperante:**
        *   **Archivo:** `style.css` (Líneas 1079 y 1985-1989) e `index.html` (Líneas 105-106).
        *   **Código (`style.css` selector roto):**
            ```css
            a:hover ~ .cursor-outline, button:hover ~ .cursor-outline { ... }
            ```
        *   **Código (`style.css` clase de hover):**
            ```css
            .cursor-hover {
              transform: scale(1.5);
              background-color: rgba(30, 132, 73, 0.2);
              border-color: var(--accent-primary);
            }
            ```
        *   **Errores:**
            *   El selector CSS general sibling (`~`) no aplica porque en `index.html` los contenedores `<div class="cursor-dot"></div>` y `<div class="cursor-outline"></div>` se ubican al principio del `<body>`, no después de los enlaces (`a`) o botones.
            *   Al aplicar la clase `.cursor-hover` mediante JS, esta define `transform: scale(1.5);`, lo cual sobreescribe por completo el centrado por defecto del cursor (`transform: translate(-50%, -50%);` en `style.css` línea 1070). Esto causa que el cursor outline se desplace bruscamente de su eje central al pasar el ratón sobre un enlace.
    3.  **Problemas de Contraste en Modo Claro:**
        *   **Archivo:** `style.css` (Línea 864) y `main.js` (Línea 573).
        *   **Detalle:** Las etiquetas de proyectos (`.project-tags span`) usan un color de fondo verde muy tenue `rgba(30, 132, 73, 0.1)` y borde verde que en modo claro (`[data-theme="light"]`) disminuyen drásticamente el contraste, dificultando la lectura. Además, el color verde de las partículas 3D en Three.js está hardcodeado en hexadecimal (`0x1e8449`), por lo que no se adapta dinámicamente cuando el usuario cambia a fondo claro (`#fafafa`), perdiendo legibilidad y nitidez.
*   **Recomendación:** Ajustar el delay de `display: none` a 800ms para respetar la transición, cambiar el selector del cursor en CSS o manejar los estilos enteramente desde JS conservando el `translate(-50%, -50%)`, y redefinir las variables de color en CSS para que las partículas de Three.js cambien de color dinámicamente según el tema activo.

---

### 2.5. LEGAL (Privacidad, Seguridad y Cumplimiento)
*   **Perspectiva:** "Se ha detectado una vulnerabilidad crítica de seguridad y malas prácticas de almacenamiento de secretos en entornos locales que deben corregirse inmediatamente."
*   **Hallazgos Técnicos:**
    1.  **Vulnerabilidad Crítica de Cloudflare Turnstile (Protección Bypass):**
        *   **Archivos:** `index.html` (Línea 746), `main.js` (Líneas 1161-1165) y `netlify/functions/unlock.js`.
        *   **Código (`main.js`):**
            ```javascript
            .then(() => fetch('/.netlify/functions/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: nameVal, email: emailVal, company: companyVal, purpose: purposeVal })
            }))
            ```
        *   **Error:** Aunque el widget de Cloudflare Turnstile se dibuja visualmente en el HTML (`index.html`), el token de verificación (`cf-turnstile-response`) **nunca es capturado ni enviado** en el cuerpo del JSON hacia el backend. A su vez, `unlock.js` procesa y retorna los datos de contacto PII sin validar ningún token. La protección anti-bot es una ilusión visual: cualquier atacante o bot puede hacer peticiones directas POST al endpoint `unlock` y raspar la información privada (teléfono, email, CV privado).
    2.  **Secretos de Desarrollo Inseguros en Producción (Fallback):**
        *   **Archivos:** `netlify/functions/unlock.js` (Línea 10) y `netlify/functions/cv.js` (Línea 8).
        *   **Código:**
            ```javascript
            const SECRET = process.env.UNLOCK_SECRET || 'dev-only-insecure-secret-change-me';
            ```
        *   **Riesgo:** Si por alguna razón la variable de entorno `UNLOCK_SECRET` no se configura en el dashboard de Netlify, el sistema utilizará de forma predeterminada una contraseña insegura en texto plano visible en el repositorio.
    3.  **Privacidad de CDNs y Falta de Banner de Cookies:**
        *   **Detalle:** Si bien almacenar los datos de contacto del usuario en `sessionStorage` es una buena práctica de privacidad (evita persistencia innecesaria de PII), el sitio descarga scripts externos (Three.js, Calendly, SoundCloud, Google Analytics) a través de CDNs de terceros. Esto requiere legalmente un banner de aviso de cookies y política de privacidad para cumplir con regulaciones internacionales como GDPR/CCPA.
*   **Recomendación:** Agregar el parámetro `cf-turnstile-response` al cuerpo de la petición POST del formulario y validarlo en el backend de `unlock.js` consultando la API de Turnstile de Cloudflare. Eliminar los fallbacks inseguros en texto plano (`|| 'dev-only...'`), haciendo que la aplicación falle de forma segura si no se encuentran las variables de entorno. Instalar un banner de cookies de consentimiento de terceros.

---

### 2.6. SENIOR Developer (Salud del Proyecto y Tooling)
*   **Perspectiva:** "Por un lado, el motor gráfico 3D en el frontend muestra una excelente optimización, pero el entorno de desarrollo y las tareas de integración en proyectos secundarios están rotos."
*   **Hallazgos Técnicos:**
    1.  **Optimización 3D en el Frontend (Acierto):**
        *   **Archivo:** `main.js` (Líneas 640-660 y 674-681).
        *   **Detalle:** El bucle de renderizado de partículas está óptimamente programado. Utiliza arreglos planos pre-asignados (`Float32Array`) para evitar sobrecarga del recolector de basura (GC). Compara distancias al cuadrado (`dx * dx + dy * dy + dz * dz < thresholdSq`) en vez de calcular raíces cuadradas complejas (`Math.sqrt`), ahorrando ciclos de CPU. Además, pausa el ciclo de animación si el usuario cambia de pestaña utilizando el evento `visibilitychange`.
    2.  **Fallo de Linting en Entorno de Desarrollo de Mobile:**
        *   **Archivo:** `Mobile-App-PoC/package.json` (Líneas 9 y 20-23).
        *   **Código (`package.json`):**
            ```json
            "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
            ```
        *   **Error:** Aunque se listan las dependencias de `eslint` y plugins de React, el subproyecto `Mobile-App-PoC` carece de un archivo de configuración de ESLint (como `.eslintrc.json` o `eslint.config.js`). Esto provoca que al ejecutar `npm run lint` el comando falle por completo, interrumpiendo procesos CI/CD locales.
*   **Recomendación:** Felicitar la optimización del canvas 3D, pero crear inmediatamente un archivo de configuración `.eslintrc.json` estándar en el subdirectorio `Mobile-App-PoC` para restablecer la integridad de las herramientas del desarrollador.

---

### 2.7. DevOps (Infraestructura y Despliegue)
*   **Perspectiva:** "Nuestra infraestructura en Netlify es robusta, pero la configuración de analíticas en producción está rota debido a valores quemados en el código HTML."
*   **Hallazgos Técnicos:**
    1.  **Políticas de Seguridad en Netlify (Acierto):**
        *   **Archivo:** `netlify.toml` (Líneas 16-26).
        *   **Detalle:** Se definen de manera impecable cabeceras de seguridad rigurosas como HSTS (`Strict-Transport-Security`), bloqueo de clickjacking (`X-Frame-Options: DENY`) y una política de seguridad de contenido (`Content-Security-Policy`) muy completa que regula las fuentes de scripts, marcos y conexiones permitidas.
    2.  **ID de Analítica Hardcodeado (Error):**
        *   **Archivo:** `index.html` (Líneas 5, 6 y 11).
        *   **Código:**
            ```html
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            </script>
            ```
        *   **Riesgo:** El ID de Google Analytics 4 está quemado como `G-XXXXXXXXXX`. Esto significa que en producción las interacciones de los usuarios no se están midiendo en la cuenta de Wilfredo Caro, enviándose a un identificador inválido o de plantilla.
*   **Recomendación:** Reemplazar el bloque estático de Google Analytics en `index.html` con variables de inyección en tiempo de compilación (usando Vite o plugins de inyección HTML) para mapear el ID real de GA4 definido en el panel de Netlify.

---

### 2.8. Mobile Developer (Desarrollo y Adaptabilidad Móvil)
*   **Perspectiva:** "La versión móvil en el subproyecto PoC presenta fallos severos de usabilidad táctil, problemas de adaptabilidad al teclado virtual y carece de soporte de temas visuales."
*   **Hallazgos Técnicos:**
    1.  **Fallas en el SwipeToDeploy del PoC Móvil:**
        *   **Archivo:** `Mobile-App-PoC/src/components/SwipeToDeploy.jsx` (Líneas 12-14 y 53-72).
        *   **Código (`SwipeToDeploy.jsx`):**
            ```javascript
            const maxDrag = containerRef.current && thumbRef.current 
              ? containerRef.current.offsetWidth - thumbRef.current.offsetWidth - 10 
              : 200;
            ```
            *   **Límites Rotos en Cambios de Orientación:** La variable `maxDrag` se calcula en tiempo de render, pero no responde a eventos de redimensionado o giro de pantalla. Al pasar de vertical a horizontal (o viceversa), el ancho del contenedor cambia, rompiendo los límites físicos y visuales del deslizador.
            *   **Interferencia de Scroll Nativo y Gestos:** En `touchmove` no se llama a `e.preventDefault()`, lo que causa que al intentar deslizar el botón, la pantalla se desplace verticalmente, interrumpiendo la acción. Asimismo, no se suscribe un manejador para `touchcancel`, por lo que el botón queda trabado en estado de arrastre indefinido si el gesto se interrumpe por gestos del sistema.
    2.  **Oclusión del Teclado en el Chatbot IA (PoC Móvil):**
        *   **Archivo:** `Mobile-App-PoC/src/components/FloatingAssistant.jsx` (Línea 23).
        *   **Error:** A diferencia de la aplicación web principal (que usa `window.visualViewport` para calcular el solapamiento del teclado virtual y reubicar la caja de texto mediante `--kb-offset` en `main.js` líneas 1251-1264), el componente del asistente flotante en la app móvil no realiza ningún ajuste de altura. Al abrirse el teclado del smartphone, la caja de entrada de texto queda oculta debajo de este, impidiendo al usuario ver lo que escribe.
    3.  **Falta de Soporte de Temas Visuales:**
        *   **Archivo:** `Mobile-App-PoC/src/index.css` (o variables equivalentes).
        *   **Detalle:** El PoC móvil no incluye variables CSS de modo claro ni responde a la preferencia del sistema operativo del dispositivo móvil (prefers-color-scheme) para alternar el tema visual, limitando su usabilidad de día.
*   **Recomendación:** Ajustar `SwipeToDeploy.jsx` agregando `e.preventDefault()` en los eventos táctiles, suscribiendo un listener de `touchcancel` e implementando un observador de tamaño o listener de `resize` para recalcular dinámicamente `maxDrag`. Adaptar el comportamiento de la caja de texto del chat con `visualViewport` en el PoC móvil y mapear las variables de color del tema claro.

---

## 3. Próximos Pasos (Plan Priorizado y Consensuado)

El comité ha ordenado las tareas necesarias para subsanar los fallos del portafolio, clasificándolas en tres niveles de prioridad:

### PRIORIDAD ALTA: Seguridad, Analíticas y Bugs Críticos (Ejecución Inmediata)
1.  **Corrección de Vulnerabilidad en Turnstile:**
    *   *Acción:* Modificar `main.js` para extraer el token mediante `turnstile.getResponse()` (o similar) y enviarlo como `'cf-turnstile-response'` en la llamada a `/api/unlock`.
    *   *Acción Backend:* Modificar `netlify/functions/unlock.js` para realizar una petición POST de validación a `https://challenges.cloudflare.com/turnstile/v0/siteverify` con el token recibido y la clave secreta de Turnstile (`process.env.TURNSTILE_SECRET`).
2.  **Eliminación de Secretos Inseguros:**
    *   *Acción:* Eliminar fallbacks de desarrollo en texto plano (`|| 'dev-only-insecure-secret-change-me'`) en `unlock.js` y `cv.js`. La app debe lanzar un error explícito si la variable `UNLOCK_SECRET` no está configurada.
3.  **Inyección Dinámica de Analytics:**
    *   *Acción:* Reemplazar el tag `G-XXXXXXXXXX` en `index.html` por una variable procesada por Vite (ej. `%VITE_GA_ID%`) o inyectada dinámicamente, asegurando que la analítica apunte al ID de producción.
4.  **Corrección de Interacción Táctil en Mobile PoC:**
    *   *Acción:* En `SwipeToDeploy.jsx`, agregar `e.preventDefault()` en el callback de movimiento, suscribir el evento `touchcancel` e implementar la actualización de dimensiones con un listener de `resize` / `orientationchange` para corregir `maxDrag`.

### PRIORIDAD MEDIA: Refactorización, Temas y UX (Siguiente Sprint)
5.  **Refactorización del Monolito `main.js`:**
    *   *Acción:* Dividir las 1331 líneas de código en módulos ES específicos para simplificar el mantenimiento y facilitar la detección de bugs.
6.  **Ajuste del Preloader (CSS/JS Synchronization):**
    *   *Acción:* Aumentar el `setTimeout` que aplica `display: none` en `main.js` a 800ms para permitir que la transición de opacidad de 0.8s en `style.css` termine limpiamente. Ajustar la animación CSS de progreso para sincronizarse con la carga real de la página.
7.  **Arreglo del Cursor Personalizado y Hover:**
    *   *Acción:* Reemplazar la regla CSS `a:hover ~ .cursor-outline` por un manejo dinámico del tamaño del cursor en JavaScript, o bien reposicionar los divs del cursor al final del body para posibilitar el uso de hermanos adyacentes. Asegurar que la clase `.cursor-hover` mantenga el translate (`transform: translate(-50%, -50%) scale(1.5);`).
8.  **Adaptabilidad del Chatbot y Teclado Virtual en Mobile PoC:**
    *   *Acción:* Trasladar la lógica de `visualViewport` del sitio principal a `FloatingAssistant.jsx` de la app móvil para reposicionar dinámicamente la entrada de texto por encima del teclado virtual del smartphone.

### PRIORIDAD BAJA: Cumplimiento y Empaquetado (Mejora Continua)
9.  **Creación de Configuración de ESLint en Mobile PoC:**
    *   *Acción:* Crear el archivo `.eslintrc.json` en `Mobile-App-PoC/` con configuraciones estándar para React para que el script `npm run lint` pase sin errores.
10. **Implementación de Banner de Consentimiento de Cookies:**
    *   *Acción:* Crear un componente visual para notificar y permitir el bloqueo/aceptación de cookies de terceros provenientes de CDNs externos (Three.js, Calendly, SoundCloud, Google Analytics).
11. **Contraste Dinámico de Colores en Modo Claro:**
    *   *Acción:* Modificar el script de Three.js para obtener el color de partículas desde las variables del tema de CSS en lugar de un valor estático, y reajustar los colores de contraste para los `.project-tags span` en modo claro.
12. **Implementación de Temas Claro/Oscuro en Mobile PoC:**
    *   *Acción:* Añadir soporte de modo claro en el subproyecto móvil utilizando variables CSS integradas.
