// --- Analytics helper (safe no-op until a real GA4 ID is set in index.html) ---
const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

// Update Copyright Year
document.getElementById('year').textContent = new Date().getFullYear();
