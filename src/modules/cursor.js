// --- Custom Cursor Tracker ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (cursorDot && cursorOutline && !isTouchDevice && window.matchMedia("(min-width: 769px)").matches) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
    
    cursorOutline.animate({
      transform: `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`
    }, { duration: 250, fill: "forwards" });
  });

  // Cursor hover effects via dynamic event delegation on body
  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .btn, .ai-suggest-btn')) {
      cursorOutline.classList.add('cursor-hover');
    }
  });
  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .btn, .ai-suggest-btn')) {
      cursorOutline.classList.remove('cursor-hover');
    }
  });
} else {
  if (cursorDot) cursorDot.style.display = 'none';
  if (cursorOutline) cursorOutline.style.display = 'none';
}
