# Informe de Auditoría de Actualización y Consolidación Técnica
**Fecha de Publicación**: 3 de julio de 2026  
**Auditor Consolidante**: `worker_audit_1`  
**Estado**: Auditoría y Planes de Refactorización Completados  

---

## Introducción y Propósito de la Auditoría
Este informe consolida las auditorías técnicas, estratégicas y de seguridad realizadas sobre el portafolio profesional de **Wilfredo Caro** (directorio raíz `c:\Users\USER\Wilfredo-Caro-Marca`) y su prueba de concepto móvil (`Mobile-App-PoC`). El objetivo es unificar de manera exhaustiva todos los hallazgos de los subagentes especializados, proporcionando diagnósticos precisos a nivel de archivo y línea de código, acompañados de planes de refactorización robustos y listos para su implementación. 

---

## 1. UX/UI y Rendimiento de Animaciones

### 1.1 Inconsistencias de Color (Cobalto/Cian vs. Verde `#1e8449`)
El sistema de diseño visual de la marca establece como base el uso del **Azul Cobalto** (`--accent-primary: #2563eb`) y del **Cian** (`--accent-secondary: #00f5ff`). No obstante, se han detectado múltiples desviaciones que rompen la homogeneidad cromática e impactan la accesibilidad (contraste WCAG):

1. **`src/modules/three-bg.js` (Líneas 39, 49)**: Hardcodea el color de partículas y líneas de conexión a un verde oscuro (`0x1e8449`) en lugar de los colores de la marca. En el modo claro, el contraste de este verde contra el fondo `#fafafa` es inferior a 2.5:1, violando las directrices de legibilidad.
   * *Código afectado:*
     ```javascript
     39:     size: 0.05,
     40:     color: 0x1e8449, // var(--accent-primary)
     ```
     y:
     ```javascript
     49:   const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1e8449, transparent: true, opacity: 0.2 });
     ```
2. **`style.css` (Línea 862)**: Utiliza directamente el valor hex cian `#22d3ee` para la clase `.orch-badge` en lugar de invocar la propiedad CSS personalizada del sistema.
3. **`style.css` (Línea 622)**: Emplea una sombra de texto verde (`rgba(20, 90, 50, 0.3)`) en la clase `.service-price` en vez de usar las sombras basadas en cobalto/cian.
4. **`style.css` (Líneas 1957, 1970)**: Implementa el color verde genérico `#4CAF50` para los iconos de éxito en el estado del reproductor de DJ o transacciones, omitiendo las variables cromáticas personalizadas.
5. **`linkedin_helper.html` (Línea 13)**: Define `--accent` con el color verde `#1e8449` y variables secundarias de cian como `#66fcf1` y `#45f3ff`, creando una disonancia con la paleta principal.

#### Plan de Refactorización (Colores):
* **Paso 1**: Modificar `src/modules/three-bg.js` para extraer dinámicamente el color de acuerdo al tema del sistema operativo o el tema del sitio:
  ```javascript
  const particleColor = window.prefersDark ? 0x00f5ff : 0x2563eb;
  const lineColor = window.prefersDark ? 0x00f5ff : 0x2563eb;
  ```
* **Paso 2**: Reemplazar todos los valores hex/RGBA verdes y cian hardcodeados en `style.css` por variables del sistema:
  ```css
  .orch-badge {
    background-color: var(--accent-secondary);
  }
  .service-price {
    text-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
  }
  ```
* **Paso 3**: Alinear las variables de color en `linkedin_helper.html` (Líneas 11-13) con la identidad de la marca:
  ```css
  --primary: #2563eb;
  --secondary: #00f5ff;
  --accent: #2563eb;
  ```

---

### 1.2 Tipografía y Grosores Faltantes (Faux-Bolding)
* **Archivo**: `index.html` (Línea 68)
* **Fallo**: Se importa la familia tipográfica `Inter` solicitando únicamente los grosores `400;500;600`. Sin embargo, múltiples selectores CSS (como `.lang-dropdown-toggle` en la línea 297, `.service-price` en la línea 618, `.track-name` en la línea 1321 y `.ai-name` en la línea 1593) aplican `font-weight: 700`.
* **Impacto**: El motor de renderizado del navegador realiza un proceso de "negrita sintética" (faux-bolding) para simular el peso 700. Esto produce bordes borrosos, pérdida de legibilidad y degradación del aspecto premium del portafolio.
* *Código afectado:*
  ```html
  68:     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
  ```

#### Plan de Refactorización (Tipografía):
* Reemplazar la línea de importación en `index.html` para incluir el peso `700` de `Inter`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
  ```

---

### 1.3 Rendimiento del Cursor y Ciclo del Preloader

#### A. Cursor Personalizado
* **Archivo**: `src/modules/cursor.js` (Líneas 11-12, 14-17, 21-29)
* **Fallo**: La animación del cursor modifica directamente las propiedades `style.left` y `style.top` dentro de un event listener de `mousemove`. Esto obliga al navegador a recalcular el flujo y el diseño geométrico de la página (layout/reflow) en cada frame, sobrecargando el hilo principal de renderizado. Además, el script inicializa los event listeners de hover buscando elementos interactivos (`a, button`) una única vez en la carga del DOM.
* **Impacto**: Se producen caídas de FPS (lag en la interfaz) durante el scroll y el desplazamiento del mouse. Asimismo, el cursor no responde visualmente (no se expande ni cambia de color) al interactuar con elementos cargados dinámicamente, como los modales de portafolio o el chatbot de IA.

#### B. Preloader de la Aplicación
* **Archivo**: `src/modules/preloader.js` (Líneas 2, 8-13)
* **Fallo**: Escucha únicamente el evento global `load`. Si la carga de la página se ejecuta de forma asíncrona o la red es tan rápida que el script se evalúa cuando el estado del documento ya es `complete`, la callback jamás se ejecutará, bloqueando la pantalla con el preloader indefinidamente. Por otro lado, la transición de opacidad dura 800ms, pero la interacción no se desbloquea de inmediato, ya que `display: none` se ejecuta después de la transición. Además, la animación `.loader-progress` en `style.css` (Línea 1142) dura 2.5s mientras el evento `load` de JS ocurre alrededor de los ~700ms, causando desincronización visual.
* **CSS Inválido**: La propiedad `display: none` se incluye en `@keyframes reveal` (Línea 1186 en `style.css`), lo cual es una instrucción inválida en CSS y es ignorada.

#### Plan de Refactorización (Animaciones):
* **Paso 1 (Cursor)**: Refactorizar `src/modules/cursor.js` para usar la propiedad CSS `transform: translate3d()` (que corre en la GPU y no genera reflows). Además, implementar delegación de eventos en `document.body` para detectar hovers de forma dinámica:
  ```javascript
  // Actualizar movimiento
  cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  cursorOutline.animate({
    transform: `translate3d(${posX}px, ${posY}px, 0)`
  }, { duration: 250, fill: "forwards" });

  // Delegación dinámica
  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .btn')) {
      cursorOutline.classList.add('cursor-hover');
    }
  });
  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .btn')) {
      cursorOutline.classList.remove('cursor-hover');
    }
  });
  ```
* **Paso 2 (Preloader)**: Reescribir la lógica de inicio del preloader para soportar estados asíncronos y evitar bloqueos en el puntero del mouse:
  ```javascript
  const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.pointerEvents = 'none'; // Desbloquear clics de inmediato
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, window.prefersReducedMotion ? 0 : 800);
    }
  };

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }
  ```

---

### 1.4 Mitigación de CLS (Cumulative Layout Shift)
* **Archivo**: `index.html` (Líneas 222, 724, 765)
* **Fallo**: Se insertan etiquetas `<img>` sin definir sus dimensiones geométricas absolutas (`width` y `height`).
* **Impacto**: A medida que los archivos de imagen se descargan, el navegador re-evalúa el espacio que estas ocupan, empujando los bloques de contenido adyacentes de forma repentina. Esto degrada la puntuación de Core Web Vitals (CLS) y produce clics accidentales de usuario.

#### Plan de Refactorización (CLS):
* Definir atributos explícitos de ancho y alto, además de incorporar la carga diferida (`lazy`):
  ```html
  <img src="/assets/wilfredo-portrait.jpg" alt="Wilfredo Caro profile" width="400" height="400" loading="lazy" decoding="async">
  ```

---

## 2. Desarrollo Blockchain y Ciberseguridad DeFi

### 2.1 Integración de Smart Contracts (`src/modules/web3.js`)
El análisis estático y dinámico revela una brecha crítica entre la propuesta de valor y la implementación técnica del portafolio:

1. **Ausencia de Interacción Real**: `src/modules/web3.js` es meramente un simulador de conexión visual de billetera. Carece de carga de ABI (Application Binary Interface), direccionamientos oficiales de contratos y no realiza operaciones de firma de transacciones en la EVM.
2. **Falta de Validación de Red/Chain ID (Líneas 40-67)**: La función solicita las cuentas del proveedor (`window.ethereum`) pero no valida la red activa del usuario. Si el usuario conecta su billetera en una red de prueba (Sepolia, Goerli) o una EVM incompatible (BSC, Avalanche), el sistema lo aprueba como un acceso VIP legítimo, lo cual puede derivar en fallos graves al intentar interactuar con el backend de producción.
3. **Omisión del Evento `chainChanged`**: El módulo implementa el listener para `accountsChanged` pero ignora `chainChanged`, dejando desincronizado el estado interno si el usuario conmuta la red manualmente.
4. **Vulnerabilidad DOM-XSS (Líneas 27-32)**: La dirección del usuario obtenida de `window.ethereum` se concatena directamente en un bloque de marcado HTML y se inserta mediante `innerHTML`:
   ```javascript
   vipPanel.innerHTML = `
     <h3 class="text-gradient" ...>Client VIP Portal</h3>
     <p ...>Connected: <strong>${shortAddr(addr)}</strong></p>
     ...
   `;
   ```
   Aunque la función `shortAddr` recorta el string, si un atacante compromete el proveedor de billetera del navegador para retornar un string modificado (ej: `<img src=x onerror=alert(document.domain)>`), se ejecutará un ataque XSS en el contexto del sitio.

#### Plan de Refactorización (Web3):
* **Paso 1 (Seguridad e Identidad)**: Sustituir el uso de `innerHTML` por asignaciones seguras a través de propiedades `textContent` de elementos creados en memoria.
* **Paso 2 (Validación de Red)**: Añadir aserciones de Chain ID al iniciar la conexión y asociar un event listener para el cambio de red:
  ```javascript
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0x1') { // 0x1 es Ethereum Mainnet
    alert('Por favor, cambia tu red a Ethereum Mainnet en Metamask.');
    return;
  }
  
  window.ethereum.on('chainChanged', (newChainId) => {
    window.location.reload(); // Recarga limpia para actualizar el estado
  });
  ```
* **Paso 3 (Evolución de Arquitectura)**: Reemplazar el Mock por una integración nativa de `ethers.js` o `viem` utilizando un archivo ABI simplificado para firmar un mensaje de autenticación que verifique la propiedad de la llave privada.

---

### 2.2 Pasarelas de Pago (`src/modules/payments.js`)

1. **Llave de Pruebas Hardcodeada (Línea 15)**: Expone la clave pública de sandbox de Wompi directamente en el cliente:
   ```javascript
   publicKey: 'pub_test_Q5yDA9xoKdePzhSGeZaVvwAXmRkdDPGq',
   ```
2. **Manipulación de Precios en el Cliente (Líneas 5, 12)**: El monto a pagar se lee del atributo HTML `data-amount` del botón de clic. Un usuario malintencionado puede alterar este valor en el inspector web (ej: de `1000000` COP a `100` COP) y proceder al pago recibiendo un estado de transacción válido en el frontend por un precio erróneo.
3. **Referencias Inseguras (Línea 6)**: Genera la clave de referencia con `Math.random()`, lo cual es propenso a colisiones y compromete la trazabilidad contable.
4. **Verificación Bypassable (Líneas 17-25)**: El éxito de la transacción se valida exclusivamente en la callback de éxito de javascript en el cliente:
   ```javascript
   checkout.open(function (result) {
     const transaction = result.transaction;
     if (transaction.status === 'APPROVED') {
       alert('¡Pago aprobado con éxito!');
   ```
5. **Redirecciones Abiertas (Líneas 37-39)**: En Bold, abre el enlace directamente desde `data-link` sin validar su dominio de destino, abriendo la puerta a inyecciones de enlaces de phishing.
6. **Mock de Wenia (Líneas 43-54)**: Wenia no cuenta con implementación; se reduce a un `alert` básico que insta a contactar por Calendly.

#### Plan de Refactorización (Pagos):
* **Paso 1**: Migrar la lógica de cálculo y generación a una Netlify Serverless Function (ej: `/api/create-payment-intent`). El cliente debe enviar únicamente el `product_id`. La función backend consultará el precio real de manera segura, generará un identificador de referencia criptográfico y seguro (UUIDv4) y firmará la petición de pago.
* **Paso 2**: Configurar un endpoint de Webhook Wompi en Netlify. La validación del éxito de la transacción se realizará de servidor a servidor (Server-to-Server) validando la firma HMAC que envía Wompi con la llave privada del comercio.
* **Paso 3**: Implementar un filtro de lista blanca (whitelist) para las redirecciones de Bold:
  ```javascript
  const allowedDomain = "https://checkout.bold.co";
  if (link.startsWith(allowedDomain)) {
    window.open(link, '_blank', 'noopener,noreferrer');
  } else {
    console.error("Redirección bloqueada por política de seguridad.");
  }
  ```

---

### 2.3 Criptografía Post-Cuántica (PQC)
Existe una inconsistencia crítica entre las afirmaciones comerciales y promocionales de la marca frente a la arquitectura de software real:
* **Falso Enunciado**: El asistente de IA (`src/modules/ai-assistant.js`) y el simulador de consola de marca (`planner.html`) afirman aplicar algoritmos **ML-KEM (Kyber)** y **ML-DSA (Dilithium)** para asegurar las conexiones del sistema. 
* **Realidad**: No se incluye ninguna biblioteca, SDK o WebAssembly compatible con PQC. Las firmas de tokens utilizan exclusivamente HMAC-SHA256 clásico.

#### Hoja de Ruta para Integración de PQC:

```
[Cliente - Orbit Mobile App]                     [Netlify Backend]
             |                                           |
             | ---- 1. Solicita KEM Public Key --------> |
             | <--- 2. Retorna ML-KEM Public Key ------- |
             |                                           |
             | ---- 3. Envía Encapsulated Key ---------> | (Genera Hybrid Key)
             |                                           |
     [Canal Cifrado AES-GCM con Llave Híbrida (ML-KEM + ECDH)]
```

* **Fase 1: Firmado Post-Cuántico de Sesiones (ML-DSA)**:
  * Incorporar un paquete compatible como `@noble/post-quantum` en las funciones serverless de Netlify.
  * Generar un par de llaves ML-DSA. Almacenar la llave privada en las variables de entorno de Netlify (`ML_DSA_PRIVATE_KEY`).
  * En `unlock.js`, firmar el token emitido con la llave privada ML-DSA en vez de usar SHA256 simétrico.
  * En `cv.js`, validar la firma con la clave pública ML-DSA antes de despachar el archivo del Currículum.
* **Fase 2: Intercambio de Llaves Híbrido (ML-KEM + ECDH)**:
  * Implementar el algoritmo ML-KEM en la conexión de control de la app móvil y en la función Netlify de puerta de enlace.
  * Derivar una clave simétrica compartida combinando ML-KEM con una curva elíptica clásica (X25519) para brindar inmunidad a ataques de interceptación retroactiva por ordenadores cuánticos (Harvest Now, Decrypt Later).

---

### 2.4 Análisis de Seguridad de Funciones Netlify (`unlock.js` y `cv.js`)

#### A. `netlify/functions/unlock.js`
1. **Fallo de Robustez de Variables de Entorno (Líneas 10-15)**:
   Si los secretos `UNLOCK_SECRET` o `TURNSTILE_SECRET` no se configuran, la aplicación emite una advertencia de registro pero no detiene la ejecución. Al momento de generar la firma del token mediante `crypto.createHmac`, el compilador lanza un error fatal de tipado, provocando un fallo en el hilo de ejecución (500 Internal Server Error) que genera un DoS implícito.
2. **CORS Wildcard Inseguro (`'null'`) (Líneas 38-39)**:
   Cuando el origen entrante de la petición no coincide con la lista blanca, la función retorna la cabecera `Access-Control-Allow-Origin: null`. En los navegadores modernos, `'null'` representa un origen legítimo para archivos cargados a nivel local (`file://`) o iframes con directivas de aislamiento rigurosas, lo que facilita el secuestro de datos por parte de scripts hostiles externos.
3. **Deficiencias en Validación de Turnstile (Líneas 74-86)**:
   La petición enviada a Cloudflare no incluye el parámetro `remoteip`. Tampoco se efectúan validaciones sobre los datos devueltos en la respuesta de verificación (se omite validar el `hostname` y la antigüedad del desafío `challenge_ts`), posibilitando que un atacante resuelva el captcha en otro dominio de su propiedad y envíe el token de éxito repetidas veces (Token Replay).

#### B. `netlify/functions/cv.js`
1. **Fuga por Canal Lateral de Tiempo (Líneas 21-23)**:
   El módulo utiliza `crypto.timingSafeEqual` pero compara las longitudes de los buffers de la firma de manera prematura. Si la longitud de la firma provista no coincide con la de la firma calculada, la función retorna false de inmediato. Esto filtra la longitud exacta de la clave secreta calculada a través de discrepancias en microsegundos de respuesta.
   * *Código afectado:*
     ```javascript
     21:   const a = Buffer.from(sig);
     22:   const b = Buffer.from(expected);
     23:   if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
     ```
2. **Ataque DoS por JSON Parsing (Líneas 24-26)**:
   Se procesa la decodificación en base64url del payload directamente mediante `JSON.parse` sin restringir su longitud. El envío de un string masivo bloquea el bucle de eventos (Event Loop) de Node.js al consumir recursos extremos de CPU y RAM.

#### Plan de Refactorización (Serverless Functions):
* **Paso 1 (Manejo de Errores e IP en Turnstile)**:
  Forzar el fallo inmediato en la carga si no están configuradas las variables de entorno clave. Incorporar la IP del cliente y la validación estricta de dominios:
  ```javascript
  if (!SECRET || !TURNSTILE_SECRET) {
    throw new Error("Falta la configuración de UNLOCK_SECRET o TURNSTILE_SECRET.");
  }
  
  // En el handler:
  const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || '';
  formData.append('remoteip', clientIp);
  
  // Validación de retorno:
  if (turnstileResult.hostname !== 'wilfredocaro.com' && turnstileResult.hostname !== 'wilfredo-caro.netlify.app') {
    return { statusCode: 403, body: JSON.stringify({ error: "Hostname inválido" }) };
  }
  ```
* **Paso 2 (Mitigar Canal Lateral de Tiempo y DoS de JSON)**:
  Aplicar un hash SHA-256 a ambas firmas antes de realizar la comparación de longitud segura:
  ```javascript
  const hashA = crypto.createHash('sha256').update(sig).digest();
  const hashB = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(hashA, hashB)) return false;

  // Evitar DoS por payloads masivos
  if (payload.length > 500) return false;
  ```

---

## 3. CTO y Arquitectura de Software

### 3.1 Modularidad e Importaciones con Efectos Secundarios
* **Archivo**: `main.js` (Líneas 5-29)
* **Fallo**: Se cargan 24 módulos locales mediante importaciones que carecen de exportaciones formales. Estos archivos se evalúan directamente y producen mutaciones directas sobre el objeto global `window` o ejecutan búsquedas y asignaciones de selectores en el DOM en tiempo de carga inicial.
* **Impacto**:
  * **Fragilidad en el Orden de Carga**: Módulos como `three-bg.js` o `contact-info.js` dependen de que `bootstrap.js` defina las propiedades globales previamente. Un cambio menor en el orden de las importaciones en `main.js` generará excepciones de tipo `ReferenceError` y detendrá la carga del sitio.
  * **Pérdida de Optimización (Tree-shaking)**: Vite/Rollup no pueden descartar el código no utilizado porque detectan que todos los módulos son "side-effects" directos sobre el contexto global. El peso del bundle final incrementa significativamente.

#### Plan de Refactorización (Modularidad):
* Estructurar cada script en `src/modules/` para exportar funciones explícitas de inicialización y centralizar la ejecución en `main.js`:
  ```javascript
  // src/modules/theme.js
  export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    // Lógica del alternador...
  }
  ```
  ```javascript
  // main.js
  import { initTheme } from './src/modules/theme.js';

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
  });
  ```

---

### 3.2 Registro Duplicado de Service Worker (PWA)
* **Archivos**: `src/modules/bootstrap.js` (Líneas 18-25) y `main.js` (Líneas 31-38)
* **Fallo**: Se registra el Service Worker dos veces mediante lógicas distintas. En `bootstrap.js` se utiliza `registerSW` provisto por `vite-plugin-pwa`, mientras que en `main.js` se escribe un bloque vanilla con `navigator.serviceWorker.register('/sw.js')`.
* **Impacto**: Esta redundancia produce bucles de actualización infinitely de caché, colisiones de red e inconsistencias al servir páginas offline, degradando el rendimiento en móviles.

#### Plan de Refactorización (Service Worker):
* Eliminar el registro manual vanilla de `main.js` (Líneas 31-38) y unificar la gestión del ciclo de vida delegando en `vite-plugin-pwa` configurado en `vite.config.js` mediante la opción `injectRegister: 'auto'`.

---

### 3.3 Conflictos en `package.json` y Side-Effects en `vite.config.js`
1. **Conflicto de Dependencias (`package.json`)**:
   `vite` se actualizó a la versión principal `^8.0.4`, pero `vite-plugin-pwa` se encuentra retenido en la versión `^1.3.0` (diseñada originalmente para Vite 2 y 3). Esto provoca advertencias de incompatibilidad severas y un comportamiento errático en los hooks de compilación del Service Worker.
2. **Efectos Secundarios al Evaluar Configuración (`vite.config.js`)**:
   Las líneas 7-11 ejecutan operaciones de escritura sincrónicas en el sistema de archivos (`fs.writeFileSync('translations.json', ...)`) durante la carga del archivo de configuración. Esto viola la regla de que las configuraciones de herramientas de bundler deben ser funciones puras e independientes de efectos de escritura paralelos.

#### Plan de Refactorización (Build System):
* **Paso 1**: Actualizar `vite-plugin-pwa` a una versión compatible con Vite 8 (mínimo `^0.21.0` o superior).
* **Paso 2**: Remover las operaciones síncronas de lectura/escritura de `vite.config.js` y trasladar la sincronización de archivos de traducción a un script de pre-compilación en Node (`scripts/sync-translations.js`) configurado en los scripts de npm:
  ```json
  "scripts": {
    "build": "node ./scripts/sync-translations.js && vite build"
  }
  ```

---

### 3.4 Deficiencias Técnicas en SEO y Rastreadores

1. **Parámetros de Búsqueda de Idioma**: Se definen las variantes regionales utilizando URLs con la variable query `?lang=es`. La recomendación de los motores de búsqueda dicta el uso de subdirectorios estructurados (como `/es/`) para optimizar el presupuesto de rastreo (Crawl Budget) y mitigar penalizaciones por contenido duplicado.
2. **Meta Tags de Generación Dinámica**: En `src/modules/i18n.js` (Líneas 55-72), la modificación de las etiquetas Open Graph y Twitter Cards se ejecuta en el cliente mediante JS. Las arañas de indexación de plataformas de comunicación (LinkedIn, Slack, X) no ejecutan JS al leer el enlace, por lo cual los previews compartidos siempre se mostrarán con los textos por defecto en inglés cargados en el HTML base.
3. **Robots.txt Incompleto**: `robots.txt` no bloquea `/linkedin_helper.html` (que es una página interna de utilidad técnica) y no contiene directivas para impedir que scrapers modernos de entrenamiento de IA (como `ByteSpider`, `Meta-ExternalAgent`, `Meta-ExternalFetcher`, `YouBot`, `PetalBot`, `Diffbot`) absorban el contenido.
4. **Fechas Estáticas en Sitemap**: `sitemap.xml` hardcodea `<lastmod>2026-07-03</lastmod>` en todos sus nodos, perdiendo la precisión frente a actualizaciones reales de los ficheros del portafolio.

#### Plan de Refactorización (SEO):
* **Paso 1**: Reconfigurar las rutas a un esquema basado en carpetas físicas o virtuales (ej: `/es/index.html`) mediante la propiedad de entrada multi-página de Vite.
* **Paso 2**: Utilizar herramientas como `vite-plugin-prerender` o configurar Netlify Edge Functions para servir los encabezados OG compilados desde el lado del servidor según la ruta solicitada.
* **Paso 3**: Actualizar `robots.txt` añadiendo las directivas de exclusión de scrapers de IA y la ruta de soporte:
  ```text
  User-agent: ByteSpider
  Disallow: /

  User-agent: Meta-ExternalAgent
  Disallow: /

  Disallow: /linkedin_helper.html
  ```

---

### 3.5 Arquitectura de Seguridad (CSP y DOM-XSS)

#### A. Debilidades de Content Security Policy (CSP) en `netlify.toml` (Línea 25)
* **Directiva script-src**: Permite `'unsafe-inline'` y orígenes genéricos de CDN como `https://cdnjs.cloudflare.com`. `'unsafe-inline'` inhabilita la protección primaria de los navegadores contra la inyección de secuencias de comandos. El uso de CDNs masivos permite eludir el CSP cargando scripts vulnerables alojados en dichos dominios.
* **Cabeceras Obsoletas**: Se mantiene `X-XSS-Protection = "1; mode=block"` (Línea 22), lo cual genera vulnerabilidades adicionales de denegación de servicio en motores antiguos de navegación.

#### B. Vulnerabilidades a Ataques DOM-XSS
1. **Integración RSS del Blog de Medium (`src/modules/medium-blog.js` Líneas 30-44)**:
   Se interpolan propiedades devueltas por la API pública `api.rss2json.com` (como `post.link` y `post.title`) directamente dentro de cadenas de texto de marcado y se evalúan mediante `blogGrid.insertAdjacentHTML()`. Si la API de conversión o el feed RSS de Medium sufren un ataque de envenenamiento de datos, el atacante obtendrá control de ejecución bajo el dominio de la web.
2. **Filtro Sanitizador Ineficaz (`service-modal.js` Líneas 51-54, `cv-download.js` Líneas 151-154)**:
   La función utiliza la expresión regular `/<[^>]*>/g` para eliminar etiquetas HTML. Esta lógica es fácilmente evadible enviando estructuras anidadas (ej. `<<script>script>alert(1)</script>`) o inyectando payloads que explotan atributos (como `onload`, `onerror`).
3. **Inserción de Dirección de Billetera VIP**:
   El uso de `.innerHTML` para inyectar la clave del VIP Panel en `src/modules/web3.js` posibilita que un proveedor Web3 hostil inyecte código en la página.

#### Plan de Refactorización (Seguridad):
* **Paso 1 (CSP)**: Eliminar `'unsafe-inline'` e implementar nonces o hashes para scripts en línea. Descargar localmente las dependencias (como `Three.js`) a través de npm e incluirlas en el bundle principal para eliminar la dependencia de `cdnjs`. Desactivar `X-XSS-Protection` asignándolo en `0` en `netlify.toml`.
* **Paso 2 (DOM Seguro)**: Reemplazar el renderizado por inyección de strings de HTML por creación de elementos en memoria usando la API DOM segura:
  ```javascript
  const card = document.createElement('a');
  card.href = post.link; // Propiedad nativa, no evalúa marcado
  card.className = 'blog-card';
  
  const title = document.createElement('h3');
  title.textContent = post.title; // Sanitizado implícitamente por el navegador
  card.appendChild(title);
  blogGrid.appendChild(card);
  ```
* **Paso 3 (Sanitización Profesional)**: Sustituir la función sanitizadora Regex por la biblioteca especializada `DOMPurify` importada en los módulos del cliente.

---

## 4. Estrategia y Consistencia de Marca en Redes Sociales

### 4.1 Brechas de Identidad de Marca
1. **Incongruencia Cromática**: `linkedin_helper.html` expone el tema antiguo verde y cianes desactualizados, distorsionando la percepción de la marca unificada de Wilfredo Caro.
2. **Bajo Enfoque en DeFi**: A pesar de mercadearse como una eminencia técnica en "Web3, PQC y DeFi", los contenidos predefinidos y las plantillas de post en `planner.html` y `linkedin_helper.html` giran excesivamente en torno a conceptos abstractos de IA, descuidando aplicaciones financieras descentralizadas específicas.
3. **Estilos Inline e Inconsistentes**: Las insignias y badges informativos en `planner.html` (Líneas 224-228) contienen colores hardcodeados de manera directa en lugar de alinearse mediante selectores de variables CSS.

#### Plan de Refactorización (Social Media):
* **Paso 1**: Actualizar los colores de `linkedin_helper.html` para unificar el estilo visual con la paleta de Cobalto y Cian.
* **Paso 2**: Reemplazar los textos de plantilla por copias centradas en la intersección de DeFi y Multi-agentes (ej: Automatización de rendimientos con ZK-proofs, arbitraje cuántico-resistente, y liquidaciones descentralizadas seguras).
* **Paso 3**: Cambiar los colores de badges en `planner.html` a variables CSS unificadas:
  ```css
  .badge-web { 
    background: rgba(37, 99, 235, 0.15); 
    color: var(--accent-primary); 
    border: 1px solid rgba(37, 99, 235, 0.3); 
  }
  ```

---

## 5. Auditoría del Mobile PoC React Component

### 5.1 `SwipeToDeploy.jsx`
* **Líneas del archivo**: 14-27, 70-91
* **Bugs Detectados**:
  1. **Error de Contenedor Oculto (Cálculo Fijo)**: El cálculo del desplazamiento máximo del slider (`maxDrag`) se ejecuta una única vez dentro de un `useEffect` durante la fase de montaje. Si el componente se renderiza inicialmente dentro de una vista o pestaña oculta (ej: `display: none` en la navegación móvil), su propiedad `offsetWidth` será `0`. En consecuencia, `maxDrag` se calculará incorrectamente con un valor de `-10`. Cuando la vista se vuelve visible, el usuario encuentra el slider completamente bloqueado e inservible.
  2. **Sobrecarga y Lag por Re-Enlace de Eventos (Event Churn)**: El `useEffect` que gestiona los movimientos del ratón/táctil en el objeto `window` utiliza como dependencias `isDragging`, `currentX` y `maxDrag`. Puesto que `currentX` se actualiza con cada cambio de píxel durante el arrastre, los listeners globales de la ventana se eliminan y se vuelven a añadir decenas de veces por segundo. Esto sobrecarga el hilo principal, causando tirones visuales (jitter) e interrupción del gesto.

#### Código Corregido para `SwipeToDeploy.jsx`:
```jsx
import React, { useState, useEffect, useRef } from 'react';

const SwipeToDeploy = ({ onDeploy }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const containerRef = useRef(null);
  const thumbRef = useRef(null);
  
  // Guardar coordenadas de arrastre sin forzar re-renders constantes
  const dragInfo = useRef({ startX: 0, currentX: 0, maxDrag: 200 });

  const handleDragStart = (e) => {
    if (isDeployed) return;
    
    // Calcular el límite dinámicamente en el inicio del arrastre para evitar el bug de contenedor oculto
    if (containerRef.current && thumbRef.current) {
      const limit = Math.max(0, containerRef.current.offsetWidth - thumbRef.current.offsetWidth - 10);
      dragInfo.current.maxDrag = limit;
    }
    
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    dragInfo.current.startX = clientX - dragInfo.current.currentX;
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || isDeployed) return;
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      let newX = clientX - dragInfo.current.startX;
      
      newX = Math.max(0, Math.min(newX, dragInfo.current.maxDrag));
      dragInfo.current.currentX = newX;
      setCurrentX(newX);
    };

    const handleEnd = () => {
      if (!isDragging || isDeployed) return;
      setIsDragging(false);
      
      // Si completó más del 90% del recorrido, activar despliegue
      if (dragInfo.current.currentX >= dragInfo.current.maxDrag * 0.9) {
        setCurrentX(dragInfo.current.maxDrag);
        dragInfo.current.currentX = dragInfo.current.maxDrag;
        setIsDeployed(true);
        if (onDeploy) onDeploy();
        
        setTimeout(() => {
          setIsDeployed(false);
          setCurrentX(0);
          dragInfo.current.currentX = 0;
        }, 3000);
      } else {
        setCurrentX(0);
        dragInfo.current.currentX = 0;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, isDeployed, onDeploy]);

  return (
    <div 
      className="swipe-container" 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '50px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '25px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div 
        className="swipe-thumb"
        ref={thumbRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: 'absolute',
          left: '5px',
          top: '5px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isDeployed ? 'var(--accent-secondary, #00f5ff)' : 'var(--accent-primary, #2563eb)',
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out, background-color 0.3s',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
        }}
      >
        {isDeployed ? '✓' : '→'}
      </div>
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          pointerEvents: 'none'
        }}
      >
        {isDeployed ? 'DESPLEGADO' : 'DESLIZAR PARA DESPLEGAR'}
      </div>
    </div>
  );
};

export default SwipeToDeploy;
```

---

### 5.2 `FloatingAssistant.jsx`
* **Líneas del archivo**: 1-6 (en CSS), 39-43 (en CSS), lógicas de VisualViewport en JS.
* **Bugs Detectados**:
  1. **Desbordamiento Superior por Altura del Teclado (Occlusion)**: El componente del chat cuenta con una altura estática fija (`height: 400px` y `max-height: calc(100vh - 100px)`). El contenedor se posiciona a `bottom: calc(20px + var(--kb-offset))`. Al enfocarse la entrada de texto y subir el teclado, se le añade un offset de ~300px a la base, empujando la parte superior del chat fuera de la pantalla (oculto por el borde superior del viewport).
  2. **Desperdicio de Espacio del FAB**: El botón flotante (FAB) de `60px` y su brecha de `15px` siguen renderizándose e interactuando bajo el panel de chat abierto, robando valioso espacio visual vertical en dispositivos móviles.

#### Código Corregido para `FloatingAssistant.jsx` (Lógica JS):
```javascript
// Dentro del componente FloatingAssistant
const syncKeyboardOffset = () => {
  cancelAnimationFrame(vvRaf);
  vvRaf = requestAnimationFrame(() => {
    const vv = window.visualViewport;
    const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
    if (containerRef.current) {
      containerRef.current.style.setProperty('--kb-offset', `${overlap}px`);
      containerRef.current.style.setProperty('--vv-height', `${vv.height}px`);
    }
  });
};
```

#### Código Corregido para `FloatingAssistant.css` (Estilos CSS):
```css
.floating-assistant-container {
  position: fixed;
  bottom: calc(20px + var(--kb-offset, 0px));
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* Ocultar el FAB cuando el panel de chat está activo para ahorrar 75px en móvil */
.floating-assistant-container.chat-open .fab-button {
  display: none;
}

.chat-window {
  width: 300px;
  max-width: calc(100vw - 40px);
  height: 400px;
  /* El valor de max-height se acopla dinámicamente al tamaño visual real de la pantalla restante */
  max-height: calc(var(--vv-height, 100vh) - 100px); 
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

---

## 6. Plan de Acción Priorizado / TODOs (Cronograma Técnico)

### Prioridad ALTA (Seguridad e Interfaz Bloqueada)
* [ ] **Eliminar `'unsafe-inline'` y CDNs de la política CSP** en `netlify.toml`. Descargar Three.js localmente en npm.
* [ ] **Corregir `SwipeToDeploy.jsx`** aplicando la re-evaluación dinámica de `maxDrag` en el callback de arrastre para evitar bloqueos del slider.
* [ ] **Sanitizar entradas con DOMPurify** en `service-modal.js` y `cv-download.js`, sustituyendo la expresión regular fácilmente eludible.
* [ ] **Solucionar el DoS y el fail-open en `unlock.js`** arrojando excepciones fatales ante la falta de variables de entorno, y añadir validación estricta de dominios y tiempo a las respuestas de Turnstile.
* [ ] **Modificar el display del preloader** para evitar congelamientos si la página carga de forma asíncrona.
* [ ] **Sanitizar la integración RSS del Blog en `medium-blog.js`** migrando de `insertAdjacentHTML` a la creación de nodos seguros usando propiedades `textContent`.

### Prioridad MEDIA (Arquitectura y SEO)
* [ ] **Desacoplar `main.js`**: Refactorizar a un modelo basado en exportaciones y llamadas de inicio explícitas.
* [ ] **Actualizar dependencias de npm**: Sincronizar las versiones de `vite` y `vite-plugin-pwa` para evitar fallos de compilación en PWA.
* [ ] **Mitigar la fuga de canal lateral de tiempo** en `cv.js` comparando los hashes SHA-256 de las firmas.
* [ ] **Corregir la oclusión del teclado en `FloatingAssistant.jsx`** acoplando la altura máxima al valor `--vv-height` del `VisualViewport`.
* [ ] **Actualizar robots.txt**: Bloquear scrapers modernos de entrenamiento de IA y denegar indexación a `/linkedin_helper.html`.
* [ ] **Alinear los colores en `linkedin_helper.html`** con los tonos de marca azul cobalto y cian.
* [ ] **Agregar dimensiones `width` y `height`** a todas las etiquetas de imagen en `index.html` para reducir a cero el CLS.

### Prioridad BAJA (Detalles y Optimización)
* [ ] **Migrar SEO de localización** de parámetros de consulta (`?lang=es`) a rutas estructuradas de subcarpetas (`/es/`).
* [ ] **Eliminar operaciones síncronas de archivos (`fs.writeFileSync`)** de `vite.config.js` enviando esa tarea a un script npm pre-build.
* [ ] **Incorporar el soporte tipográfico para peso `700` de Inter** en `index.html` para evitar renderizados faux-bolding difusos.
* [ ] **Optimizar el cursor personalizado** moviendo su traslación a `transform: translate3d()` apoyado por delegación de eventos globales.
