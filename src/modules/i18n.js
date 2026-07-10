// --- Multilingual (i18n) Logic ---
import { renderContactInfo } from './contact-info.js';
import { renderProjects } from './render-projects.js';
import schemas from './schema.js';

const dropdownToggle = document.getElementById('lang-dropdown-toggle');
const dropdownMenu = document.getElementById('lang-dropdown-menu');
const currentLangLabel = document.getElementById('current-lang-label');
const langButtons = document.querySelectorAll('.lang-btn');

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
  // Render dynamic projects and collaborations first
  renderProjects();

  // Query elements dynamically so that newly rendered cards are translated
  const translatableElements = document.querySelectorAll('[data-i18n]');
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

  // Dynamically translate SEO headers
  if (window.translations && window.translations[lang]) {
    const t = window.translations[lang];
    if (t.meta_title) {
      document.title = t.meta_title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', t.meta_title);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', t.meta_title);
    }
    if (t.meta_description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', t.meta_description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', t.meta_description);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', t.meta_description);
    }
  }

  // Update canonical URL, og:url, twitter:url
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  const targetUrl = lang === 'en' ? 'https://wilfredocaro.com/' : `https://wilfredocaro.com/?lang=${lang}`;
  if (canonicalEl) {
    canonicalEl.setAttribute('href', targetUrl);
  }
  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) {
    ogUrlEl.setAttribute('content', targetUrl);
  }
  const twitterUrlEl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrlEl) {
    twitterUrlEl.setAttribute('content', targetUrl);
  }

  // Update Schema JSON-LD
  const schemaScript = document.getElementById('schema-ld');
  if (schemaScript && schemas && schemas[lang]) {
    schemaScript.textContent = JSON.stringify(schemas[lang], null, 2).replace(/</g, '\\u003c');
  }

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

// Initialize Language from parameter, localStorage, browser language or default 'en'
const getInitialLanguage = () => {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang && langNames[queryLang]) {
    return queryLang;
  }
  
  const savedLang = localStorage.getItem('preferredLang');
  if (savedLang && langNames[savedLang]) {
    return savedLang;
  }

  const browserLang = (navigator.language || navigator.userLanguage || '').substring(0, 2);
  if (browserLang && langNames[browserLang]) {
    return browserLang;
  }

  return 'en';
};

const initialLang = getInitialLanguage();
updateLanguage(initialLang);
