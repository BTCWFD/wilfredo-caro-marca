// --- Dynamic Geo-Pricing Logic ---
const fetchGeoPricing = async () => {
  const priceWeb = document.getElementById('price-web');
  const priceAi = document.getElementById('price-ai');
  const priceBrand = document.getElementById('price-brand');
  const priceDj = document.getElementById('price-dj');

  if (!priceWeb) return;

  const pricing = {
    CO: {
      web: "Desde $1,500,000 COP",
      ai: "Desde $1,200,000 COP",
      brand: "Desde $800,000 COP/mes",
      dj: "Desde $500,000 COP"
    },
    Global: {
      web: "Desde $2,500 USD",
      ai: "Desde $3,000 USD",
      brand: "Desde $1,500 USD/mes",
      dj: "Desde $900 USD"
    }
  };

  const updatePrices = (isColombia) => {
    const prices = isColombia ? pricing.CO : pricing.Global;
    priceWeb.textContent = prices.web;
    priceAi.textContent = prices.ai;
    priceBrand.textContent = prices.brand;
    priceDj.textContent = prices.dj;
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
