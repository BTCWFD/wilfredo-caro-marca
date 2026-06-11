// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

// Initialize Theme
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
  if (iconSun) iconSun.classList.add('hidden');
  if (iconMoon) iconMoon.classList.remove('hidden');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      iconSun.classList.remove('hidden');
      iconMoon.classList.add('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      iconSun.classList.add('hidden');
      iconMoon.classList.remove('hidden');
    }
  });
}