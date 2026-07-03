// --- Dynamic Geo-Pricing Logic ---
const getTranslation = (key, fallback) => {
  const lang = document.documentElement.lang || 'en';
  if (window.translations && window.translations[lang] && window.translations[lang][key]) {
    return window.translations[lang][key];
  }
  return fallback;
};

const fetchGeoPricing = async () => {
  const priceWeb = document.getElementById('price-web');
  const priceAi = document.getElementById('price-ai');
  const priceBrand = document.getElementById('price-brand');
  const priceDj = document.getElementById('price-dj');

  if (!priceWeb) return;

  const updatePrices = (isColombia) => {
    const prefix = getTranslation('price_prefix', 'Starting from');
    const suffixMonth = getTranslation('price_suffix_month', '/month');

    if (isColombia) {
      priceWeb.textContent = `${prefix} $1,500,000 COP`;
      priceAi.textContent = `${prefix} $1,200,000 COP`;
      priceBrand.textContent = `${prefix} $800,000 COP${suffixMonth}`;
      priceDj.textContent = `${prefix} $500,000 COP`;
    } else {
      priceWeb.textContent = `${prefix} $2,500 USD`;
      priceAi.textContent = `${prefix} $3,000 USD`;
      priceBrand.textContent = `${prefix} $1,500 USD${suffixMonth}`;
      priceDj.textContent = `${prefix} $900 USD`;
    }
  };

  const toggle = document.getElementById('geo-pricing-toggle');
  
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      updatePrices(e.target.checked);
      window.trackEvent('toggle_pricing', { region: e.target.checked ? 'CO' : 'Global' });
    });
  }

  try {
    // Netlify Edge Function (first-party) — visitor IP never leaves Netlify.
    const res = await fetch('/api/geo');
    const data = await res.json();
    const isColombia = data.country === 'CO';
    if (toggle) toggle.checked = isColombia;
    updatePrices(isColombia);
  } catch (err) {
    console.warn("Geo-Pricing fetch failed, defaulting to Global.", err);
    if (toggle) toggle.checked = false;
    updatePrices(false);
  }
};
fetchGeoPricing();
