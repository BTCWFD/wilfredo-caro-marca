# Wilfredo Caro — Personal Brand Site

Sitio de marca personal (Vite + HTML/CSS/JS vanilla + Three.js), bilingüe EN/ES/JA, desplegado en Netlify.
Dominio canónico: **https://wilfredocaro.com**

## Fuente de verdad (¡importante!)

Los archivos reales que usa el sitio están en la **raíz**, no en `src/`:

| Archivo real (raíz) | Rol |
|---------------------|-----|
| `index.html` | Markup. Importa `/main.js` y `/style.css` |
| `main.js` | Toda la lógica. Importa `./src/translations.js` |
| `style.css` | Estilos |
| `src/translations.js` | Diccionario i18n (EN/ES/JA) que consume la web |
| `netlify/functions/chat.js` | Función serverless del chatbot (usa **Gemini**) |

> Los antiguos `src/main.js`, `src/style.css` y `src/counter.js` de la plantilla Vite
> fueron eliminados por ser huérfanos. No los recrees.

`translations.json` (raíz) es independiente: lo usan los scripts de Python de LinkedIn,
no la web.

## Comandos

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera /dist
npm run preview  # previsualiza el build
```

## Variables de entorno (Netlify → Site settings → Environment variables)

Necesarias para la protección real del contacto y el CV (funciones `unlock`/`cv`):

| Variable | Para qué |
|----------|----------|
| `UNLOCK_SECRET` | Cadena aleatoria larga para firmar los tokens (HMAC). **Imprescindible** para que la protección sea segura. |
| `CONTACT_EMAIL` | Email revelado tras un lead válido (vive solo en el servidor). |
| `CONTACT_PHONE` | Teléfono revelado tras un lead válido. |
| `GEMINI_API_KEY` | Clave del chatbot (ya existente). |

> El CV (`private/Wilfredo-CV-2026.pdf`) está **fuera** del sitio publicado y solo se
> entrega por `/.netlify/functions/cv` con un token válido (10 min) emitido por
> `/.netlify/functions/unlock` tras validar el formulario.

## Pendiente de configurar (manual)

- **GA4**: reemplazar `G-XXXXXXXXXX` en `index.html` por el Measurement ID real.
- **Notificación de leads**: en el panel de Netlify → Forms → notificaciones,
  conectar `cv-downloads` y `service-requests` a email/Slack/Telegram.
- **OG image**: `public/og-image.png` es una copia provisional; idealmente sustituir
  por una imagen 1200×630 optimizada.
