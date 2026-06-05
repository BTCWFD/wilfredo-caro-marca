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

## Pendiente de configurar (manual)

- **GA4**: reemplazar `G-XXXXXXXXXX` en `index.html` por el Measurement ID real.
- **Notificación de leads**: en el panel de Netlify → Forms → notificaciones,
  conectar `cv-downloads` y `service-requests` a email/Slack/Telegram.
- **OG image**: `public/og-image.png` es una copia provisional; idealmente sustituir
  por una imagen 1200×630 optimizada.
