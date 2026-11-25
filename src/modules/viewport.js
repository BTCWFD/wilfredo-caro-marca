// --- Mobile: keep the AI chat input above the virtual keyboard (visualViewport) ---
const aiAssistantEl = document.getElementById('ai-assistant');

// Keep AI assistant minimized on initial load so Hero WebGL scene stays unobstructed.
if (aiAssistantEl) {
  aiAssistantEl.classList.add('minimized');
}

if (aiAssistantEl && window.visualViewport) {
  let vvRaf = 0;
  const syncKeyboardOffset = () => {
    cancelAnimationFrame(vvRaf);
    vvRaf = requestAnimationFrame(() => {
      const vv = window.visualViewport;
      // How much of the layout viewport the keyboard is covering at the bottom.
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      aiAssistantEl.style.setProperty('--kb-offset', `${overlap}px`);
    });
  };
  window.visualViewport.addEventListener('resize', syncKeyboardOffset);
  window.visualViewport.addEventListener('scroll', syncKeyboardOffset);
}
