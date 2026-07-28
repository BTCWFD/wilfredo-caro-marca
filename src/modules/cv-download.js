// --- CV Download Guard and Modal Logic ---
import { renderContactInfo } from './contact-info.js';
const cvDownloadBtn = document.getElementById('cv-download-btn');
const cvModal = document.getElementById('cv-modal');
const cvModalClose = document.getElementById('cv-modal-close');
const cvModalForm = document.getElementById('cv-modal-form');
const cvFormError = document.getElementById('cv-form-error');
const cvFormSubmit = document.getElementById('cv-form-submit');
const cvSubmitText = document.getElementById('cv-submit-text');

let cvTriggerElement = null;

const getFocusableElements = (container) => {
  const elements = Array.from(container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ));
  return elements.filter(el => {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
};

const cvModalKeydownHandler = (e) => {
  if (e.key === 'Escape') {
    closeCvModal();
    return;
  }

  if (e.key === 'Tab') {
    const focusable = getFocusableElements(cvModal);
    if (focusable.length === 0) return;
    
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
};

// Open the lead-capture modal
const openCvModal = () => {
  if (cvModal) {
    cvTriggerElement = document.activeElement;
    cvModal.classList.remove('hidden');
    if (cvFormError) cvFormError.classList.add('hidden');
    if (cvModalForm) cvModalForm.reset();
    
    // Focus the first input field
    const firstInput = document.getElementById('cv-name');
    if (firstInput) {
      firstInput.focus();
    }
    
    document.addEventListener('keydown', cvModalKeydownHandler);
  }
};

// Download the CV through the token-gated serverless endpoint.
// If the session token is missing or expired, fall back to the lead form.
const triggerCvDownload = async () => {
  const token = sessionStorage.getItem('cv_token');
  if (!token) {
    openCvModal();
    return;
  }
  try {
    const res = await fetch(`/.netlify/functions/cv?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      // Token expired or invalid -> require a fresh lead.
      sessionStorage.removeItem('cv_token');
      openCvModal();
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Wilfredo-CV-2026.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('CV download failed:', err);
    openCvModal();
  }
};

if (cvDownloadBtn) {
  cvDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('cv_token')) {
      triggerCvDownload();
    } else {
      openCvModal();
    }
  });
}

// Close Modal handlers
const closeCvModal = () => {
  if (cvModal) {
    cvModal.classList.add('hidden');
    document.removeEventListener('keydown', cvModalKeydownHandler);
    if (cvTriggerElement) {
      cvTriggerElement.focus();
      cvTriggerElement = null;
    }
  }
};

if (cvModalClose) {
  cvModalClose.addEventListener('click', closeCvModal);
}

if (cvModal) {
  cvModal.addEventListener('click', (e) => {
    if (e.target === cvModal) {
      closeCvModal();
    }
  });
}

// Form Submission with Netlify AJAX Capture
if (cvModalForm) {
  cvModalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = document.getElementById('cv-name').value.trim();
    const emailVal = document.getElementById('cv-email').value.trim();
    const companyVal = document.getElementById('cv-company').value.trim();
    const purposeVal = document.getElementById('cv-purpose').value;
    const currentLang = localStorage.getItem('preferredLang') || 'en';

    // Clear previous error
    cvFormError.classList.add('hidden');
    cvFormError.textContent = '';

    // Validations
    if (!nameVal || !emailVal || !companyVal || !purposeVal) {
      const errorMsg = (window.translations[currentLang] && window.translations[currentLang]['cv_error_empty']) || 'Please fill in all fields.';
      cvFormError.textContent = errorMsg;
      cvFormError.classList.remove('hidden');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      const errorMsg = (window.translations[currentLang] && window.translations[currentLang]['cv_error_email']) || 'Please enter a valid email.';
      cvFormError.textContent = errorMsg;
      cvFormError.classList.remove('hidden');
      return;
    }

    // Show loading state
    cvFormSubmit.disabled = true;
    cvFormSubmit.classList.add('btn-disabled');
    const loadingText = currentLang === 'es' ? 'Procesando...' : currentLang === 'ja' ? '送信中...' : 'Processing...';
    cvSubmitText.textContent = loadingText;

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('form-name', 'cv-downloads');
    urlEncoded.append('name', nameVal);
    urlEncoded.append('email', emailVal);
    urlEncoded.append('company', companyVal);
    urlEncoded.append('purpose', purposeVal);
    urlEncoded.append('bot-field', '');

    // 1) Record the lead in Netlify Forms (for notifications) — best effort.
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlEncoded.toString()
    })
    // 2) Validate the lead server-side and obtain the contact + a CV token.
    .then(() => {
      const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value || '';
      return fetch('/.netlify/functions/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameVal, email: emailVal, company: companyVal, purpose: purposeVal, turnstileToken })
      });
    })
    .then(async (response) => {
      // Restore submit button state
      cvFormSubmit.disabled = false;
      cvFormSubmit.classList.remove('btn-disabled');
      const originalText = (window.translations[currentLang] && window.translations[currentLang]['cv_submit_btn']) || 'Submit & Download';
      cvSubmitText.textContent = originalText;

      if (!response.ok) throw new Error('Unlock request failed');
      const data = await response.json();
      if (!data || !data.token) throw new Error('No token returned');

const sanitizeInput = (val) => {
  if (typeof val !== 'string') return val;
  try {
    const doc = new DOMParser().parseFromString(val, 'text/html');
    return (doc.body.textContent || '').trim();
  } catch (e) {
    return val.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  }
};

      // Save CV Request to localStorage for local CRM
      try {
        const localCvRequests = JSON.parse(localStorage.getItem('local_cv_requests') || '[]');
        localCvRequests.push({
          id: Date.now(),
          name: sanitizeInput(nameVal),
          email: sanitizeInput(emailVal),
          company: sanitizeInput(companyVal),
          purpose: sanitizeInput(purposeVal),
          date: new Date().toISOString()
        });
        localStorage.setItem('local_cv_requests', JSON.stringify(localCvRequests));
      } catch (e) {
        console.warn('Could not save CV request to localStorage:', e);
      }
      window.trackEvent?.('generate_lead', { form: 'cv-downloads', purpose: purposeVal });

      // Cache token + contact for THIS session only (no PII in localStorage).
      sessionStorage.setItem('cv_token', data.token);
      sessionStorage.setItem('cv_contact', JSON.stringify({ email: data.email, phone: data.phone }));
      localStorage.setItem('cv_unlocked', 'true'); // UX hint only; real gate is the token

      // Re-render contact details in the footer
      renderContactInfo();

      // Show Success Toast
      const modalWrap = document.getElementById('cv-modal-content-wrap');
      const successToast = document.getElementById('cv-success-toast');
      if (modalWrap && successToast) {
        modalWrap.classList.add('hidden');
        successToast.classList.remove('hidden');

        setTimeout(() => {
          // Trigger token-gated file download & close modal
          triggerCvDownload();
          closeCvModal();
          // Reset for future
          setTimeout(() => {
            modalWrap.classList.remove('hidden');
            successToast.classList.add('hidden');
          }, 500);
        }, 1500);
      } else {
        // Fallback if elements are missing
        triggerCvDownload();
        closeCvModal();
      }
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      cvFormSubmit.disabled = false;
      cvFormSubmit.classList.remove('btn-disabled');
      const originalText = (window.translations[currentLang] && window.translations[currentLang]['cv_submit_btn']) || 'Submit & Download';
      cvSubmitText.textContent = originalText;

      const networkErrorMsg = currentLang === 'es' 
        ? 'Error de red. Inténtalo de nuevo.' 
        : currentLang === 'ja' 
          ? 'ネットワークエラーが発生しました。再試行してください。' 
          : 'Network error. Please try again.';
      cvFormError.textContent = networkErrorMsg;
      cvFormError.classList.remove('hidden');
    });
  });
}
