// --- Floating UI Controls ---
const djPlayer = document.getElementById('dj-player');
const playerTrigger = document.getElementById('dj-player-trigger');
const playerToggleBtn = document.getElementById('player-toggle');

if(playerTrigger && djPlayer && playerToggleBtn) {
  playerTrigger.addEventListener('click', () => {
    djPlayer.classList.remove('minimized');
  });

  playerToggleBtn.addEventListener('click', () => {
    djPlayer.classList.add('minimized');
  });
}
