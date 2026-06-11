// --- Mobile: keep the AI chat input above the virtual keyboard (visualViewport) ---
const aiAssistantEl = document.getElementById('ai-assistant');

// Auto-open AI Bot to greet B2B prospects
if (aiAssistantEl) {
  setTimeout(() => {
    aiAssistantEl.classList.remove('minimized');
    window.trackEvent('ai_auto_opened');
  }, 2500);
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
