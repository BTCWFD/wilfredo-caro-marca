// --- Dynamic Contact Info Block ---
export const renderContactInfo = () => {
  const contactContainer = document.getElementById('contact-info-block');
  if (!contactContainer) return;

  contactContainer.innerHTML = '';

  // Contact details are delivered by the server only after a valid lead, and
  // cached for this browser session. Nothing is hardcoded in the client bundle.
  let contact = null;
  try { contact = JSON.parse(sessionStorage.getItem('cv_contact') || 'null'); } catch (e) { contact = null; }

  if (contact && contact.email) {
    const mailLink = document.createElement('a');
    mailLink.href = `mailto:${contact.email}`;
    mailLink.className = 'btn btn-primary';
    mailLink.style.textTransform = 'lowercase';
    mailLink.style.letterSpacing = '0.5px';
    mailLink.textContent = contact.email;

    contactContainer.appendChild(mailLink);

    if (contact.phone) {
      const telLink = document.createElement('a');
      telLink.href = `tel:${String(contact.phone).replace(/[^\d+]/g, '')}`;
      telLink.className = 'btn btn-outline';
      telLink.style.borderRadius = '30px';
      telLink.textContent = contact.phone;
      contactContainer.appendChild(telLink);
    }
  } else {
    const unlockBtn = document.createElement('button');
    unlockBtn.id = 'contact-unlock-btn';
    unlockBtn.className = 'btn btn-primary';
    unlockBtn.style.borderRadius = '30px';
    
    const currentLang = localStorage.getItem('preferredLang') || 'en';
    const btnText = (window.translations[currentLang] && window.translations[currentLang]['contact_unlock_btn']) || '🔓 Unlock Contact Details';
    unlockBtn.textContent = btnText;

    unlockBtn.addEventListener('click', () => {
      const cvModal = document.getElementById('cv-modal');
      const cvFormError = document.getElementById('cv-form-error');
      const cvModalForm = document.getElementById('cv-modal-form');
      if (cvModal) {
        cvModal.classList.remove('hidden');
        if (cvFormError) cvFormError.classList.add('hidden');
        if (cvModalForm) cvModalForm.reset();
      }
    });

    contactContainer.appendChild(unlockBtn);
  }
};
