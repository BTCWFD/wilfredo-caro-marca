// --- Preloader Logic ---
import { decryptElement } from './text-decrypt.js';

// Decrypt "WILFREDO CARO" and status immediately on initial load
const initPreloaderAnimation = () => {
  const loaderText = document.getElementById('loader-text');
  const loaderStatus = document.querySelector('.loader-status');
  if (loaderText) {
    decryptElement(loaderText, 650);
  }
  if (loaderStatus) {
    decryptElement(loaderStatus, 500);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloaderAnimation);
} else {
  initPreloaderAnimation();
}

const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.pointerEvents = 'none'; // Unlock clicks immediately
    const minDelay = window.prefersReducedMotion ? 0 : 700;
    setTimeout(() => {
      preloader.style.opacity = '0';
      window.dispatchEvent(new CustomEvent('preloaderFading'));
      setTimeout(() => {
        preloader.style.display = 'none';
        window.dispatchEvent(new CustomEvent('preloaderDone'));
      }, window.prefersReducedMotion ? 0 : 800);
    }, minDelay);
  }
};

if (document.readyState === 'complete') {
  hidePreloader();
} else {
  window.addEventListener('load', hidePreloader);
}

// --- Scroll Reveal Observer ---
const initScrollReveal = () => {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
};

initScrollReveal();
