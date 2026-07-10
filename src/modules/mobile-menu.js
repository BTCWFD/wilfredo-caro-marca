// --- Mobile Menu Toggle ---
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
  const setMenu = (open) => {
    mobileMenuToggle.classList.toggle('open', open);
    navLinks.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    mobileMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  // Estado accesible inicial
  mobileMenuToggle.setAttribute('aria-expanded', 'false');

  mobileMenuToggle.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('active'));
  });

  // Cerrar al pulsar un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Cerrar con Escape (accesibilidad de teclado)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      setMenu(false);
      mobileMenuToggle.focus();
    }
  });
}
