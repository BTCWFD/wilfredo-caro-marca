// main.js — Orquestador de módulos.
// bootstrap.js se importa primero: define window.trackEvent, window.translations,
// window.prefersReducedMotion y window.isTouchDevice antes de que cualquier
// otro módulo se evalúe.
import './src/modules/bootstrap.js';
import './src/modules/analytics-1.js';
import './src/modules/theme.js';
import './src/modules/pricing.js';
import './src/modules/service-modal.js';
import './src/modules/web3.js';
import './src/modules/contact-info.js';
import './src/modules/i18n.js';
import './src/modules/navbar.js';
import './src/modules/mobile-menu.js';
import './src/modules/scroll-reveal.js';
import './src/modules/skills-tab.js';
import './src/modules/smooth-scroll.js';
import './src/modules/preloader.js';
import './src/modules/cursor.js';
import './src/modules/three-bg.js';
import './src/modules/medium-blog.js';
import './src/modules/ai-assistant.js';
import './src/modules/card-tilt.js';
import './src/modules/audio-player.js';
import './src/modules/floating-ui.js';
import './src/modules/cv-download.js';
import './src/modules/haptic.js';
import './src/modules/viewport.js';
import './src/modules/payments.js';

// PWA: register the service worker only for built output (PROD)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
