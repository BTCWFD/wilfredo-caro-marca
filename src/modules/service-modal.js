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

// --- Service Request Form Submission ---
if (srvForm) {
  srvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('srv-form-submit');
    const submitText = document.getElementById('srv-submit-text');
    const errorDiv = document.getElementById('srv-form-error');

    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';
    errorDiv.classList.add('hidden');

    const formData = new FormData(srvForm);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (res.ok) {
        // Save request to localStorage for local CRM
        try {
          const localLeads = JSON.parse(localStorage.getItem('local_leads') || '[]');
          localLeads.push({
            id: Date.now(),
            name: formData.get('name') || '',
            email: formData.get('email') || '',
            service: formData.get('service') || '',
            country: formData.get('country') || '',
            details: formData.get('details') || '',
            date: new Date().toISOString()
          });
          localStorage.setItem('local_leads', JSON.stringify(localLeads));
        } catch (e) {
          console.warn('Could not save lead to localStorage:', e);
        }

        window.trackEvent('generate_lead', {
          form: 'service-requests',
          service: formData.get('service') || 'unknown',
          country: formData.get('country') || 'unknown'
        });
        srvForm.innerHTML = `<div style="text-align: center; padding: 2rem;">
          <h3 style="color: var(--accent-primary);">¡Solicitud Enviada!</h3>
          <p>Me pondré en contacto contigo pronto.</p>
        </div>`;
        setTimeout(() => closeServiceModal(), 3000);
      } else {
        throw new Error('Error en el envío');
      }
    } catch (err) {
      errorDiv.textContent = 'Hubo un error al enviar el formulario. Intenta de nuevo.';
      errorDiv.classList.remove('hidden');
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Request';
    }
  });
}
