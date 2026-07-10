// --- Google Analytics Dynamic Injection ---
const gaId = import.meta.env.VITE_GA_ID;
if (gaId && gaId !== '%VITE_GA_ID%' && gaId.trim() !== '') {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

// --- Analytics helper (safe no-op until a real GA4 ID is set) ---
const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

// Update Copyright Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
