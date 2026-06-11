// --- 3D Card Tilt Effect ---
const tiltContainer = document.querySelector('.about-visual');
if (tiltContainer && !window.isTouchDevice) {
  const img = tiltContainer.querySelector('img');
  tiltContainer.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = tiltContainer.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    const tiltX = (y - 0.5) * 15; // max 15 degrees tilt
    const tiltY = (0.5 - x) * 15;
    
    img.style.transform = `scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  
  tiltContainer.addEventListener('mouseleave', () => {
    img.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
  });
}
