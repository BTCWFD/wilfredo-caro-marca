// --- Multilingual (i18n) Logic ---
import { renderContactInfo } from './contact-info.js';
const langButtons = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-i18n]');

const updateLanguage = (lang) => {
  translatableElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (window.translations[lang] && window.translations[lang][key]) {
      // Only render HTML when the element explicitly opts in via data-i18n-html.
      // Everything else uses textContent (safer against accidental markup injection).
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = window.translations[lang][key];
      } else {
        el.textContent = window.translations[lang][key];
      }
    }
  });

  // Update button active state
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Persist choice
  localStorage.setItem('preferredLang', lang);
  document.documentElement.lang = lang;

  // Render contact info block
  renderContactInfo();
};

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang');
    updateLanguage(selectedLang);
  });
});

// Initialize Language
const savedLang = localStorage.getItem('preferredLang') || 'en';
updateLanguage(savedLang);
