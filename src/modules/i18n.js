// --- Multilingual (i18n) Logic ---
import { renderContactInfo } from './contact-info.js';

const dropdownToggle = document.getElementById('lang-dropdown-toggle');
const dropdownMenu = document.getElementById('lang-dropdown-menu');
const currentLangLabel = document.getElementById('current-lang-label');
const langButtons = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-i18n]');

const langNames = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  zh: '简体中文',
  ko: '한국어',
  ru: 'Русский',
  ar: 'العربية'
};

const updateLanguage = (lang) => {
  translatableElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (window.translations && window.translations[lang] && window.translations[lang][key]) {
      // Only render HTML when the element explicitly opts in via data-i18n-html.
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = window.translations[lang][key];
      } else {
        el.textContent = window.translations[lang][key];
      }
    }
  });

  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Update button active state
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Update dropdown toggle label
  if (currentLangLabel && langNames[lang]) {
    currentLangLabel.textContent = langNames[lang];
  }

  // Persist choice
  localStorage.setItem('preferredLang', lang);
  document.documentElement.lang = lang;

  // Render contact info block
  renderContactInfo();
};

// Dropdown click handlers
if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
    dropdownToggle.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
  });

  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
    dropdownToggle.setAttribute('aria-expanded', 'false');
  });
}

langButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const selectedLang = btn.getAttribute('data-lang');
    updateLanguage(selectedLang);
    if (dropdownMenu) {
      dropdownMenu.classList.remove('show');
    }
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Initialize Language
const savedLang = localStorage.getItem('preferredLang') || 'en';
updateLanguage(savedLang);
