// --- Custom DJ Player Logic (HTML5 Audio) ---
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('player-play-btn');
const prevBtn = document.getElementById('player-prev-btn');
const nextBtn = document.getElementById('player-next-btn');
const visualizer = document.querySelector('.player-visualizer');
const artwork = document.querySelector('.track-artwork');
const timeCurrent = document.getElementById('player-time-current');
const timeDuration = document.getElementById('player-time-duration');
const timeline = document.getElementById('player-timeline');

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

if (audioPlayer) {
  // Sync UI with audio events
  audioPlayer.addEventListener('play', () => {
    if (playBtn) playBtn.textContent = '⏸';
    if (visualizer) visualizer.classList.add('playing');
    if (artwork) artwork.classList.add('playing');
  });

  audioPlayer.addEventListener('pause', () => {
    if (playBtn) playBtn.textContent = '▶';
    if (visualizer) visualizer.classList.remove('playing');
    if (artwork) artwork.classList.remove('playing');
  });

  audioPlayer.addEventListener('timeupdate', () => {
    if (timeCurrent) timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    if (audioPlayer.duration && timeline) {
      const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      timeline.value = progressPercent;
    }
  });

  audioPlayer.addEventListener('loadedmetadata', () => {
    if (timeDuration) timeDuration.textContent = formatTime(audioPlayer.duration);
  });

  // Controls Event Listeners
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(err => console.log("Playback interrupted: ", err));
      } else {
        audioPlayer.pause();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.min(audioPlayer.duration || 0, audioPlayer.currentTime + 10);
    });
  }

  // Timeline Scrubbing via input range
  if (timeline) {
    timeline.addEventListener('input', (e) => {
      if (audioPlayer.duration) {
        const scrubTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = scrubTime;
      }
    });
  }
}
