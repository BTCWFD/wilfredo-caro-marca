// bootstrap.js — Se ejecuta PRIMERO antes que cualquier otro módulo.
// Define en window las utilidades que todos los módulos necesitan.
import translations from '../translations.js';
import { registerSW } from 'virtual:pwa-register';

window.translations = translations;

window.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

window.trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

// PWA Service Worker registration
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available. Click reload to update.');
  },
  onOfflineReady() {
    console.log('App ready to work offline.');
  },
});
