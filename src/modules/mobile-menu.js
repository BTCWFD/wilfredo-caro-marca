// --- Mobile Menu Toggle ---
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('open');
    const isActive = navLinks.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('open');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
}
