// --- Custom Cursor Tracker ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const window.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (cursorDot && cursorOutline && !window.isTouchDevice && window.matchMedia("(min-width: 769px)").matches) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 250, fill: "forwards" });
  });

  // Cursor hover effects on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .btn, .ai-suggest-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('cursor-hover');
    });
  });
} else {
  if (cursorDot) cursorDot.style.display = 'none';
  if (cursorOutline) cursorOutline.style.display = 'none';
}
