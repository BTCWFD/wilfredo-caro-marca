// --- Mobile: light haptic feedback (Android only; iOS Safari has no Vibration API) ---
const haptic = (ms = 10) => {
  if (!window.prefersReducedMotion && typeof navigator.vibrate === 'function') navigator.vibrate(ms);
};
[
  document.getElementById('player-play-btn'),
  document.getElementById('ai-send'),
  document.getElementById('mobile-menu-toggle'),
  document.getElementById('quote-trigger'),
  document.getElementById('ai-trigger'),
].forEach((el) => el && el.addEventListener('click', () => haptic()));
