// --- Preloader Logic ---
const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.pointerEvents = 'none'; // Unlock clicks immediately
    const minDelay = window.prefersReducedMotion ? 0 : 700;
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
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
