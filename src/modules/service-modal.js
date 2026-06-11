// --- Service Request Modal Logic ---
const srvModal = document.getElementById('service-modal');
const srvCloseBtn = document.getElementById('service-modal-close');
const srvForm = document.getElementById('service-modal-form');
const srvTypeSelect = document.getElementById('srv-type');
const srvCountrySelect = document.getElementById('srv-country');
const srvToggle = document.getElementById('geo-pricing-toggle');

const openServiceModal = (serviceId) => {
  if (!srvModal) return;
  if (serviceId && srvTypeSelect) {
    srvTypeSelect.value = serviceId;
  }
  if (srvCountrySelect && srvToggle) {
    srvCountrySelect.value = srvToggle.checked ? 'CO' : 'Global';
  }
  srvModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  window.trackEvent('open_service_modal', { service: serviceId || 'unknown' });
};

const closeServiceModal = () => {
  if (!srvModal) return;
  srvModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
};

if (srvCloseBtn) srvCloseBtn.addEventListener('click', closeServiceModal);
if (srvModal) {
  srvModal.addEventListener('click', (e) => {
    if (e.target === srvModal) closeServiceModal();
  });
}

document.querySelectorAll('.service-modal-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openServiceModal(btn.dataset.service);
  });
});

// Floating "Cotizar" button -> open the proposal modal (defaults to web service)
const quoteTrigger = document.getElementById('quote-trigger');
if (quoteTrigger) {
  quoteTrigger.addEventListener('click', () => {
    window.trackEvent('quote_cta_click', { source: 'floating' });
    openServiceModal('web');
  });
}
