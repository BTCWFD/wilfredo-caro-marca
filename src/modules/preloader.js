// --- Preloader Logic ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if(preloader) {
    // Fade out shortly after the page is actually ready (no arbitrary 2.8s wait).
    // Skip the delay entirely for users who prefer reduced motion.
    const minDelay = window.prefersReducedMotion ? 0 : 700;
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, window.prefersReducedMotion ? 0 : 800);
    }, minDelay);
  }

  // --- Scroll Reveal Observer ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // observer.unobserve(entry.target); // Optional: Stop observing once revealed
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
});
